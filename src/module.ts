import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import * as http from "http";
import * as https from "https";
import { interfaces } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { buildProviderModule } from 'inversify-binding-decorators';
import * as bodyparser from "body-parser";
import * as cookieparser from "cookie-parser";

import { IModuleConfig, normalizeModuleConfig } from "./lib/ModuleConfig";
import { DefaultMongoClientTYPE } from "./entities/DbEntity";
import { IMongoConfig, normalizeMongoConfig } from "./lib/MongoConfig";
import { registerMongoClient } from "./lib/MongoClient";
import { ExpressError } from "./lib/ExpressError";
import { DynamicCors } from "./lib/DynamicCors";
import { promisify } from "util";
import * as iocapi from "./lib/IocApi";
import { HealthHandler } from "./lib/HealthHandler";

export type InitAppFunction =
    (app: express.Application, config: IModuleConfig, iocContainer: interfaces.Container) => Promise<void>;

export type ApiIocRegister =
    (iocContainer: interfaces.Container, basePath: string, token?: string | (() => string)) => void;

export interface IApiIocRegistrationInfo {
    url: string;
    register: ApiIocRegister;
}

export interface ServiceStartupArgs {
    /** Project root folder, using Nodejs __dirname */
    projectRoot: string;

    /** Service Module configs */
    moduleConfig: IModuleConfig;

    /** Mongo connection string config */
    mongoConfig: IMongoConfig;

    /** IoC container */
    iocContainer: interfaces.Container;

    /** Test callback function, if test callback is provided, then the app will be started in test-mode */
    test?: InitAppFunction;

    /** Created event callback */
    created?: InitAppFunction;

    /** Creating event callback */
    creating?: InitAppFunction;

    /** Express.js errorConfig handle, if not provided, the default service ExpressError will be applied */
    errorConfigCb?: (app: express.Application) => void;

    /** List of API IoC register callback to let system call to API-Client registration during startup */
    apis?: IApiIocRegistrationInfo[];

    /** Root URL for default /healthz endpoint (default to /healthz) */
    healthzRootUrl?: string;

    /** If TRUE is specified, to disable healthz handler */
    disableHealthz?: boolean;

    /** Root URL for all APIs (ex: /api/<module_name>). If specified, 1 additional healthz endpoint will be added at /api/<module_name>/healthz */
    apiRootUrl?: string;
}

/** should provide __dirname & default module config */
export function main(args: ServiceStartupArgs) {
    args.moduleConfig = normalizeModuleConfig(args.projectRoot, args.moduleConfig);
    args.mongoConfig = normalizeMongoConfig(args.mongoConfig);

    if (process.env.NODE_ENV !== 'production') process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Allows SSL on Dev mode
    console.log(`${args.moduleConfig._log} CONFIG ${args.moduleConfig.util.getConfigSources().map(c => c.name)}`, args.moduleConfig);
    console.log(`${args.moduleConfig._log} ${!!args.test ? 'UNIT-TEST' : 'APPLICATION'} STARTING..`);
    
    args.iocContainer.load(buildProviderModule());
    init(args).then(async app => {
        if (!!args.test) {
            await args.test(app, args.moduleConfig, args.iocContainer);
            console.log(`${args.moduleConfig._log} ${!!args.test ? 'UNIT-TEST' : 'APPLICATION'} END!`);
            process.exit(0);
        } else {
            if (args.moduleConfig.port) {
                if (!!args.moduleConfig.https) {
                    const pfxPath = path.resolve(args.projectRoot, process.env.NODE_ENV === 'production' ? '../../' : '../', args.moduleConfig.https.pfx);
                    let pfxData: Buffer;
                    try {
                        pfxData = await promisify(fs.readFile)(pfxPath);
                    } catch (e) {
                        console.warn(`${args.moduleConfig._log} could not read PFX at ${pfxPath}, skip launching the express server`);
                        process.exit(0);
                    }
                    if (!!pfxData) {
                        const server = https.createServer({
                            pfx: pfxData,
                            passphrase: args.moduleConfig.https.passphrase,
                        }, app);
                        if (args.moduleConfig.host === '+') {
                            server.listen(args.moduleConfig.https.port || args.moduleConfig.port, () => console.log(`${args.moduleConfig._log} HTTPS server started ${args.moduleConfig.https._url}`));
                        } else {
                            server.listen(args.moduleConfig.https.port || args.moduleConfig.port, args.moduleConfig.host, () => console.log(`${args.moduleConfig._log} HTTPS server started ${args.moduleConfig.https._url}`));
                        }
                    }
                }
                if (!args.moduleConfig.https || (!!args.moduleConfig.https.port && args.moduleConfig.https.port !== args.moduleConfig.port)) {
                    const server = http.createServer(app);
                    if (args.moduleConfig.host === '+') {
                        server.listen(args.moduleConfig.port, () => console.log(`${args.moduleConfig._log} APPLICATION server started ${args.moduleConfig._url}`));
                    } else {
                        server.listen(args.moduleConfig.port, args.moduleConfig.host, () => console.log(`${args.moduleConfig._log} APPLICATION server started ${args.moduleConfig._url}`));
                    }
                }
            }
            else {
                console.warn(`${args.moduleConfig._log} APPLICATION running ${args.moduleConfig.util.getConfigSources().map(c => c.name)} without Port number, skip launching the express server`);
                process.exit(0);
            }
        }
    })
    .catch(err => {
        console.error(`${args.moduleConfig._log} ${!!args.test ? 'UNIT-TEST' : 'APPLICATION'} ERROR`, err);
        process.exit(1);
    });
}

async function init(args: ServiceStartupArgs): Promise<express.Application> {
    if (args.mongoConfig && args.mongoConfig.mongo) {
        await registerMongoClient(args.iocContainer, args.moduleConfig, args.mongoConfig, DefaultMongoClientTYPE);
    }

    const app: express.Application = express();
    const server = new InversifyExpressServer(args.iocContainer, undefined, undefined, app, undefined, false);
    if (args.creating) {
        await args.creating(app, args.moduleConfig, args.iocContainer);
    }
    create(app, args);
    if (args.created) {
        await args.created(app, args.moduleConfig, args.iocContainer);
    }
    return server.setErrorConfig(args.errorConfigCb || (a => {
        // Finally handle the error
        // It's important that this come after the main routes are registered
        a.use(new ExpressError(args.moduleConfig).handler);
    })).build();
}

function create(app: express.Application, args: ServiceStartupArgs): void {
    // Register express.js middlewares
    app.use(bodyparser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(bodyparser.json({ limit: '50mb' }));
    app.use(cookieparser());

    // CORS
    if (args.moduleConfig.cors && args.moduleConfig.cors.length > 0) {
        if (args.moduleConfig.cors.indexOf('*') >= 0) {
            app.use(DynamicCors.allowAll); // Allow all origin
        } else {
            app.use(new DynamicCors(args.moduleConfig.cors).handle); // Allow only specific domain (dynamically)
        }
    }

    // Register Healthz
    if (!args.disableHealthz) {
        app.use(args.healthzRootUrl || '/healthz', HealthHandler.getInstance(args.moduleConfig).healthz);
        if (!!args.apiRootUrl) {
            app.use(args.apiRootUrl + (args.healthzRootUrl || '/healthz'), HealthHandler.getInstance(args.moduleConfig).healthz);
        }
    }

    // Register API IoC
    if (args.apis && args.apis.length > 0) {
        iocapi.register(app);
        for (let i = 0, l = args.apis.length; i < l; i++) {
            args.apis[i].register(args.iocContainer, args.apis[i].url, iocapi.getIocJwt);
        }
    }
}