/// <reference types="express" />
import * as express from "express";
import { interfaces } from 'inversify';
import { IConfig } from "config";
import { IMongoConfig } from "./lib/MongoClient";
export interface IModuleConfig extends IConfig {
    /** The Express.js hostname, if null the Express.js app will use localhost */
    host?: string;
    /** The Express.js port number, if null the Express.js app will not be started (disable) */
    port?: number;
    /** Enable SSL support */
    https?: {
        /** Optional HTTPS port number, if null the default port, if available & differ to default port, both server will be started */
        port?: number;
        /** Relative path to pfx file */
        pfx?: string;
        /** Password for the pfx file */
        passphrase?: string;
        /** HTTPS Url */
        _url?: string;
    };
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
export declare type InitAppFunction = (app: express.Application, config: IModuleConfig, iocContainer: interfaces.Container) => Promise<void>;
/** should provide __dirname & default module config */
export declare function main(dirname: string, moduleConfig: IModuleConfig, mongoConfig: IMongoConfig, iocContainer: interfaces.Container, test?: InitAppFunction, created?: InitAppFunction, creating?: InitAppFunction): void;
