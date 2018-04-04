"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const express = require("express");
const http = require("http");
const https = require("https");
const inversify_express_utils_1 = require("inversify-express-utils");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const DbEntity_1 = require("./entities/DbEntity");
const MongoClient_1 = require("./lib/MongoClient");
const ExpressError_1 = require("./lib/ExpressError");
const DynamicCors_1 = require("./lib/DynamicCors");
const util_1 = require("util");
/** should provide __dirname & default module config */
function main(dirname, moduleConfig, mongoConfig, iocContainer, test, created, creating) {
    if (process.env.NODE_ENV !== 'production')
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Allows SSL on Dev mode
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
    console.log(`${moduleConfig._log} CONFIG ${moduleConfig.util.getConfigSources().map(c => c.name)}`, moduleConfig);
    console.log(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} STARTING..`);
    init(iocContainer, moduleConfig, mongoConfig, creating, created)
        .then((app) => __awaiter(this, void 0, void 0, function* () {
        if (!!test) {
            yield test(app, moduleConfig, iocContainer);
            console.log(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} END!`);
            process.exit(0);
        }
        else {
            if (moduleConfig.port) {
                if (!!moduleConfig.https) {
                    const pfxPath = path.resolve(dirname, process.env.NODE_ENV === 'production' ? '../../' : '../', moduleConfig.https.pfx);
                    let pfxData;
                    try {
                        pfxData = yield util_1.promisify(fs.readFile)(pfxPath);
                    }
                    catch (e) {
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
                        }
                        else {
                            server.listen(moduleConfig.https.port || moduleConfig.port, moduleConfig.host, () => console.log(`${moduleConfig._log} HTTPS server started ${moduleConfig.https._url}`));
                        }
                    }
                }
                if (!moduleConfig.https || (!!moduleConfig.https.port && moduleConfig.https.port !== moduleConfig.port)) {
                    const server = http.createServer(app);
                    if (moduleConfig.host === '+') {
                        server.listen(moduleConfig.port, () => console.log(`${moduleConfig._log} APPLICATION server started ${moduleConfig._url}`));
                    }
                    else {
                        server.listen(moduleConfig.port, moduleConfig.host, () => console.log(`${moduleConfig._log} APPLICATION server started ${moduleConfig._url}`));
                    }
                }
            }
            else {
                console.warn(`${moduleConfig._log} APPLICATION running ${moduleConfig.util.getConfigSources().map(c => c.name)} without Port number, skip launching the express server`);
                process.exit(0);
            }
        }
    }))
        .catch(err => {
        console.error(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} ERROR`, err);
        process.exit(1);
    });
}
exports.main = main;
function init(iocContainer, moduleConfig, mongoConfig, creating, created) {
    return __awaiter(this, void 0, void 0, function* () {
        if (mongoConfig && mongoConfig.mongo) {
            yield MongoClient_1.registerMongoClient(iocContainer, moduleConfig, mongoConfig, DbEntity_1.DefaultMongoClientTYPE);
        }
        const app = express();
        const server = new inversify_express_utils_1.InversifyExpressServer(iocContainer, undefined, undefined, app, undefined, false);
        if (creating) {
            yield creating(app, moduleConfig, iocContainer);
        }
        create(app, moduleConfig, iocContainer);
        if (created) {
            yield created(app, moduleConfig, iocContainer);
        }
        return server.setErrorConfig(a => {
            // Finally handle the error
            // It's important that this come after the main routes are registered
            a.use(new ExpressError_1.ExpressError(moduleConfig).handler);
        }).build();
    });
}
function create(app, config, iocContainer) {
    // Register express.js middlewares
    app.use(bodyparser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(bodyparser.json({ limit: '50mb' }));
    app.use(cookieparser());
    // CORS
    if (config.cors && config.cors.length > 0) {
        if (config.cors.indexOf('*') >= 0) {
            app.use(DynamicCors_1.DynamicCors.allowAll); // Allow all origin
        }
        else {
            app.use(new DynamicCors_1.DynamicCors(config.cors).handle); // Allow only specific domain (dynamically)
        }
    }
}
//# sourceMappingURL=module.js.map