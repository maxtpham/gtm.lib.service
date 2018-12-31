import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import * as http from "http";
import * as https from "https";
import { interfaces } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
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

export type InitAppFunction =
    (app: express.Application, config: IModuleConfig, iocContainer: interfaces.Container) => Promise<void>;

export type ApiIocRegister =
    (iocContainer: interfaces.Container, basePath: string, token?: string | (() => string)) => void;

export interface IApiIocRegistrationInfo {
    url: string;
    register: ApiIocRegister;
}

/** should provide __dirname & default module config */
export function main(dirname: string, moduleConfig: IModuleConfig, mongoConfig: IMongoConfig, iocContainer: interfaces.Container, test?: InitAppFunction, created?: InitAppFunction, creating?: InitAppFunction, ...apis: IApiIocRegistrationInfo[]) {
    moduleConfig = normalizeModuleConfig(dirname, moduleConfig);
    mongoConfig = normalizeMongoConfig(mongoConfig);

    if (process.env.NODE_ENV !== 'production') process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Allows SSL on Dev mode
    console.log(`${moduleConfig._log} CONFIG ${moduleConfig.util.getConfigSources().map(c => c.name)}`, moduleConfig);
    console.log(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} STARTING..`);
    
    init(iocContainer, moduleConfig, mongoConfig, creating, created, apis)
    .then(async app => {
        if (!!test) {
            await test(app, moduleConfig, iocContainer);
            console.log(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} END!`);
            process.exit(0);
        } else {
            if (moduleConfig.port) {
                if (!!moduleConfig.https) {
                    const pfxPath = path.resolve(dirname, process.env.NODE_ENV === 'production' ? '../../' : '../', moduleConfig.https.pfx);
                    let pfxData: Buffer;
                    try {
                        pfxData = await promisify(fs.readFile)(pfxPath);
                    } catch (e) {
                        console.warn(`${moduleConfig._log} could not read PFX at ${pfxPath}, skip launching the express server`);
                        process.exit(0);
                    }
                    if (!!pfxData) {
                        const server = https.createServer({
                            pfx: pfxData,
                            passphrase: moduleConfig.https.passphrase,
                        }, app);
                        if (moduleConfig.host === '+') {
                            server.listen(moduleConfig.https.port || moduleConfig.port, () => console.log(`${moduleConfig._log} HTTPS server started ${moduleConfig.https._url}`));
                        } else {
                            server.listen(moduleConfig.https.port || moduleConfig.port, moduleConfig.host, () => console.log(`${moduleConfig._log} HTTPS server started ${moduleConfig.https._url}`));
                        }
                    }
                }
                if (!moduleConfig.https || (!!moduleConfig.https.port && moduleConfig.https.port !== moduleConfig.port)) {
                    const server = http.createServer(app);
                    if (moduleConfig.host === '+') {
                        server.listen(moduleConfig.port, () => console.log(`${moduleConfig._log} APPLICATION server started ${moduleConfig._url}`));
                    } else {
                        server.listen(moduleConfig.port, moduleConfig.host, () => console.log(`${moduleConfig._log} APPLICATION server started ${moduleConfig._url}`));
                    }
                }
            }
            else {
                console.warn(`${moduleConfig._log} APPLICATION running ${moduleConfig.util.getConfigSources().map(c => c.name)} without Port number, skip launching the express server`);
                process.exit(0);
            }
        }
    })
    .catch(err => {
        console.error(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} ERROR`, err);
        process.exit(1);
    });
}

async function init(iocContainer: interfaces.Container, moduleConfig: IModuleConfig, mongoConfig?: IMongoConfig, creating?: InitAppFunction, created?: InitAppFunction, apis?: IApiIocRegistrationInfo[]): Promise<express.Application> {
    if (mongoConfig && mongoConfig.mongo) {
        await registerMongoClient(iocContainer, moduleConfig, mongoConfig, DefaultMongoClientTYPE);
    }

    const app: express.Application = express();
    const server = new InversifyExpressServer(iocContainer, undefined, undefined, app, undefined, false);
    if (creating) {
        await creating(app, moduleConfig, iocContainer);
    }
    create(app, moduleConfig, iocContainer, apis);
    if (created) {
        await created(app, moduleConfig, iocContainer);
    }
    return server.setErrorConfig(a => {
        // Finally handle the error
        // It's important that this come after the main routes are registered
        a.use(new ExpressError(moduleConfig).handler);
    }).build();
}

function create(app: express.Application, config: IModuleConfig, iocContainer: interfaces.Container, apis?: IApiIocRegistrationInfo[]): void {
    // Register express.js middlewares
    app.use(bodyparser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(bodyparser.json({ limit: '50mb' }));
    app.use(cookieparser());

    // CORS
    if (config.cors && config.cors.length > 0) {
        if (config.cors.indexOf('*') >= 0) {
            app.use(DynamicCors.allowAll); // Allow all origin
        } else {
            app.use(new DynamicCors(config.cors).handle); // Allow only specific domain (dynamically)
        }
    }

    // Register API IoC
    if (apis && apis.length > 0) {
        iocapi.register(app);
        for (let i = 0, l = apis.length; i < l; i++) {
            apis[i].register(iocContainer, apis[i].url, iocapi.getIocJwt);
        }
    }
}