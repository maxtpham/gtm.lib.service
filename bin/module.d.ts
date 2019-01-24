import * as express from "express";
import { interfaces } from 'inversify';
import { IModuleConfig } from "./lib/ModuleConfig";
import { IMongoConfig } from "./lib/MongoConfig";
export declare type InitAppFunction = (app: express.Application, config: IModuleConfig, iocContainer: interfaces.Container) => Promise<void>;
export declare type ApiIocRegister = (iocContainer: interfaces.Container, basePath: string, token?: string | (() => string)) => void;
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
export declare function main(args: ServiceStartupArgs): void;
