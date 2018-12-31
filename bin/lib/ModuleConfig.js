"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
function normalizeModuleConfig(dirname, moduleConfig) {
    if (typeof (process.env.HOST) === 'string')
        moduleConfig.host = process.env.HOST;
    if (typeof (process.env.PORT) === 'string')
        moduleConfig.port = parseInt(process.env.PORT);
    if (typeof (process.env.CORS) === 'string')
        moduleConfig.cors = process.env.CORS.split(',');
    const packageJson = require(path.resolve(dirname, process.env.NODE_ENV === 'production' ? '../../package.json' : '../package.json'));
    if (!moduleConfig._version)
        moduleConfig._version = packageJson.version;
    if (!moduleConfig._name)
        moduleConfig._name = packageJson.name;
    if (!moduleConfig.host)
        moduleConfig.host = (process.env.NODE_ENV === 'production' ? 'localhost' : '+');
    if (!moduleConfig.port) {
        if (!moduleConfig._url)
            moduleConfig._url = 'http://unknown';
        if (!!moduleConfig.https) {
            if (!moduleConfig.https._url)
                moduleConfig.https._url = 'https://unknown';
        }
    }
    else {
        if (!!moduleConfig.https) {
            if (!!moduleConfig.https.port) {
                if (!moduleConfig.https._url)
                    moduleConfig.https._url = moduleConfig.https.port === 443 ? `https://${moduleConfig.host}` : `https://${moduleConfig.host}:${moduleConfig.https.port}`;
                if (!moduleConfig._url) {
                    if (moduleConfig.https.port === moduleConfig.port) {
                        moduleConfig._url = moduleConfig.https._url;
                    }
                    else {
                        moduleConfig._url = moduleConfig.port === 80 ? `http://${moduleConfig.host}` : `http://${moduleConfig.host}:${moduleConfig.port}`;
                    }
                }
            }
            else {
                if (!moduleConfig.https._url)
                    moduleConfig.https._url = moduleConfig.port === 443 ? `https://${moduleConfig.host}` : `https://${moduleConfig.host}:${moduleConfig.port}`;
                if (!moduleConfig._url)
                    moduleConfig._url = moduleConfig.https._url;
            }
        }
        else {
            if (!moduleConfig._url)
                moduleConfig._url = moduleConfig.port === 80 ? `http://${moduleConfig.host}` : `http://${moduleConfig.host}:${moduleConfig.port}`;
        }
    }
    if (!moduleConfig._log)
        moduleConfig._log = `[${moduleConfig._name}@${moduleConfig._version}]`;
    return moduleConfig;
}
exports.normalizeModuleConfig = normalizeModuleConfig;
//# sourceMappingURL=ModuleConfig.js.map