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
const ModuleConfig_1 = require("./lib/ModuleConfig");
const DbEntity_1 = require("./entities/DbEntity");
const MongoConfig_1 = require("./lib/MongoConfig");
const MongoClient_1 = require("./lib/MongoClient");
const ExpressError_1 = require("./lib/ExpressError");
const DynamicCors_1 = require("./lib/DynamicCors");
const util_1 = require("util");
const iocapi = require("./lib/IocApi");
/** should provide __dirname & default module config */
function main(dirname, moduleConfig, mongoConfig, iocContainer, test, created, creating, ...apis) {
    moduleConfig = ModuleConfig_1.normalizeModuleConfig(dirname, moduleConfig);
    mongoConfig = MongoConfig_1.normalizeMongoConfig(mongoConfig);
    if (process.env.NODE_ENV !== 'production')
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Allows SSL on Dev mode
    console.log(`${moduleConfig._log} CONFIG ${moduleConfig.util.getConfigSources().map(c => c.name)}`, moduleConfig);
    console.log(`${moduleConfig._log} ${!!test ? 'UNIT-TEST' : 'APPLICATION'} STARTING..`);
    init(iocContainer, moduleConfig, mongoConfig, creating, created, apis)
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
function init(iocContainer, moduleConfig, mongoConfig, creating, created, apis) {
    return __awaiter(this, void 0, void 0, function* () {
        if (mongoConfig && mongoConfig.mongo) {
            yield MongoClient_1.registerMongoClient(iocContainer, moduleConfig, mongoConfig, DbEntity_1.DefaultMongoClientTYPE);
        }
        const app = express();
        const server = new inversify_express_utils_1.InversifyExpressServer(iocContainer, undefined, undefined, app, undefined, false);
        if (creating) {
            yield creating(app, moduleConfig, iocContainer);
        }
        create(app, moduleConfig, iocContainer, apis);
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
function create(app, config, iocContainer, apis) {
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
    // Register API IoC
    if (apis && apis.length > 0) {
        iocapi.register(app);
        for (let i = 0, l = apis.length; i < l; i++) {
            apis[i].register(iocContainer, apis[i].url, iocapi.getIocJwt);
        }
    }
}
//# sourceMappingURL=module.js.map