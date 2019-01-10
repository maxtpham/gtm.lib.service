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
/** should provide __dirname & default module config */
export declare function main(dirname: string, moduleConfig: IModuleConfig, mongoConfig: IMongoConfig, iocContainer: interfaces.Container, test?: InitAppFunction, created?: InitAppFunction, creating?: InitAppFunction, errorConfigCb?: (app: express.Application) => void, ...apis: IApiIocRegistrationInfo[]): void;
