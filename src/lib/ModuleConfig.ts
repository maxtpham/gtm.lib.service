import { IConfig } from "config";
import * as path from "path";

export interface IModuleConfig extends IConfig {
    /** The Express.js hostname, if null the Express.js app will use localhost */
    host?: string;
    /** The Express.js port number, if null the Express.js app will not be started (disable) */
    port?: number;
    /** The list of CORS enabled domains */
    cors: string[];
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
    }

    /** The module package version */
    _version: string;
    /** The module package name */
    _name: string;
    /** The Express.js Url */
    _url?: string;
    /** The logname */
    _log?: string;
}

export function normalizeModuleConfig(dirname: string, moduleConfig: IModuleConfig): IModuleConfig {
    if (typeof(process.env.HOST) === 'string') moduleConfig.host = process.env.HOST;
    if (typeof(process.env.PORT) === 'string') moduleConfig.port = parseInt(process.env.PORT);
    if (typeof(process.env.CORS) === 'string') moduleConfig.cors = process.env.CORS.split(',');

    const packageJson = require(path.resolve(dirname, process.env.NODE_ENV === 'production' ? '../../package.json' : '../package.json'));
    if (!moduleConfig._version) moduleConfig._version = packageJson.version;
    if (!moduleConfig._name) moduleConfig._name = packageJson.name;
    if (!moduleConfig.host) moduleConfig.host = (process.env.NODE_ENV === 'production' ? 'localhost' : '+');
    if (!moduleConfig.port) {
        if (!moduleConfig._url) moduleConfig._url = 'http://unknown';
        if (!!moduleConfig.https) {
            if (!moduleConfig.https._url) moduleConfig.https._url = 'https://unknown';
        }
    } else {
        if (!!moduleConfig.https) {
            if (!!moduleConfig.https.port) {
                if (!moduleConfig.https._url) moduleConfig.https._url = moduleConfig.https.port === 443 ? `https://${moduleConfig.host}` : `https://${moduleConfig.host}:${moduleConfig.https.port}`;
                if (!moduleConfig._url) {
                    if (moduleConfig.https.port === moduleConfig.port) {
                        moduleConfig._url = moduleConfig.https._url;
                    } else {
                        moduleConfig._url = moduleConfig.port === 80 ? `http://${moduleConfig.host}` : `http://${moduleConfig.host}:${moduleConfig.port}`;
                    }
                }
            } else {
                if (!moduleConfig.https._url) moduleConfig.https._url = moduleConfig.port === 443 ? `https://${moduleConfig.host}` : `https://${moduleConfig.host}:${moduleConfig.port}`;
                if (!moduleConfig._url) moduleConfig._url = moduleConfig.https._url;
            }
        } else {
            if (!moduleConfig._url) moduleConfig._url = moduleConfig.port === 80 ? `http://${moduleConfig.host}` : `http://${moduleConfig.host}:${moduleConfig.port}`;
        }
    }
    if (!moduleConfig._log) moduleConfig._log = `[${moduleConfig._name}@${moduleConfig._version}]`;

    return moduleConfig;
}