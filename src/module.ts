import * as path from "path";
import * as express from "express";
import { interfaces } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyparser from "body-parser";
import * as cookieparser from "cookie-parser";

import { IConfig } from "config";
import { DefaultMongoClientTYPE } from "./entities/DbEntity";
import { IMongoConfig, registerMongoClient } from "./lib/MongoClient";
import { ExpressError } from "./lib/ExpressError";
import { DynamicCors } from "./lib/DynamicCors";

export interface IModuleConfig extends IConfig {
    /** The Express.js hostname, if null the Express.js app will use localhost */
    host?: string;
    /** The Express.js port number, if null the Express.js app will not be started (disable) */
    port?: number;
    /** The module package version */
    _version: string;
    /** The module package name */
    _name: string;
    /** The Express.js Url */
    _url?: string;
    /** The logname */
    _log?: string;
    /** The list of CORS enabled domains */
    cors: string[];
}

export type InitAppFunction =
    (app: express.Application, config: IModuleConfig, iocContainer: interfaces.Container) => Promise<void>;

/** should provide __dirname & default module config */
export function main(dirname: string, moduleConfig: IModuleConfig, mongoConfig: IMongoConfig, iocContainer: interfaces.Container, test?: InitAppFunction, created?: InitAppFunction, creating?: InitAppFunction) {
    const packageJson = require(path.resolve(dirname, process.env.NODE_ENV === 'production' ? '../../package.json' : '../package.json'));
    if (!moduleConfig._version) moduleConfig._version = packageJson.version;
    if (!moduleConfig._name) moduleConfig._name = packageJson.name;
    if (!moduleConfig.host) moduleConfig.host = (process.env.NODE_ENV == 'production' ? 'localhost' : '+');
    if (!moduleConfig._url) moduleConfig._url = !moduleConfig.port ? 'http://unknown' : `http://${moduleConfig.host}${moduleConfig.port === 80 ? '' : (':' + moduleConfig.port)}`;
    if (!moduleConfig._log) moduleConfig._log = `[${moduleConfig._name}@${moduleConfig._version}]`;
    console.log(`${moduleConfig._log} CONFIG ${moduleConfig.util.getConfigSources().map(c => c.name)}`, moduleConfig);

    console.log(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} STARTING..`);
    
    init(iocContainer, moduleConfig, mongoConfig, creating, created)
    .then(async app => {
        if (!!test) {
            await test(app, moduleConfig, iocContainer);
            console.log(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} END!`);
            process.exit(0);
        } else {
            if (moduleConfig.port) {
                if (moduleConfig.host === '+') {
                    app.listen(moduleConfig.port, () => console.log(`${moduleConfig._log} APPLICATION server started ${moduleConfig._url}`));
                } else {
                    app.listen(moduleConfig.port, moduleConfig.host, () => console.log(`${moduleConfig._log} APPLICATION server started ${moduleConfig._url}`));
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

async function init(iocContainer: interfaces.Container, moduleConfig: IModuleConfig, mongoConfig?: IMongoConfig, creating?: InitAppFunction, created?: InitAppFunction): Promise<express.Application> {
    if (mongoConfig && mongoConfig.mongo) {
        await registerMongoClient(iocContainer, moduleConfig, mongoConfig, DefaultMongoClientTYPE);
    }

    const app: express.Application = express();
    const server = new InversifyExpressServer(iocContainer, undefined, undefined, app, undefined, false);
    if (creating) {
        await creating(app, moduleConfig, iocContainer);
    }
    create(app, moduleConfig, iocContainer);
    if (created) {
        await created(app, moduleConfig, iocContainer);
    }
    return server.setErrorConfig(a => {
        // Finally handle the error
        // It's important that this come after the main routes are registered
        a.use(new ExpressError(moduleConfig).handler);
    }).build();
}

function create(app: express.Application, config: IModuleConfig, iocContainer: interfaces.Container): void {
    // Register express.js middlewares
    app.use(bodyparser.urlencoded({ extended: true }));
    app.use(bodyparser.json());
    app.use(cookieparser());

    // CORS
    if (config.cors && config.cors.length > 0) {
        if (config.cors.indexOf('*') >= 0) {
            app.use(DynamicCors.allowAll); // Allow all origin
        } else {
            app.use(new DynamicCors(config.cors).handle); // Allow only specific domain (dynamically)
        }
    }
}
