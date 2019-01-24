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
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
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
const HealthHandler_1 = require("./lib/HealthHandler");
/** should provide __dirname & default module config */
function main(args) {
    args.moduleConfig = ModuleConfig_1.normalizeModuleConfig(args.projectRoot, args.moduleConfig);
    args.mongoConfig = MongoConfig_1.normalizeMongoConfig(args.mongoConfig);
    if (process.env.NODE_ENV !== 'production')
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Allows SSL on Dev mode
    console.log(`${args.moduleConfig._log} CONFIG ${args.moduleConfig.util.getConfigSources().map(c => c.name)}`, args.moduleConfig);
    console.log(`${args.moduleConfig._log} ${!!args.test ? 'UNIT-TEST' : 'APPLICATION'} STARTING..`);
    args.iocContainer.load(inversify_binding_decorators_1.buildProviderModule());
    init(args).then((app) => __awaiter(this, void 0, void 0, function* () {
        if (!!args.test) {
            yield args.test(app, args.moduleConfig, args.iocContainer);
            console.log(`${args.moduleConfig._log} ${!!args.test ? 'UNIT-TEST' : 'APPLICATION'} END!`);
            process.exit(0);
        }
        else {
            if (args.moduleConfig.port) {
                if (!!args.moduleConfig.https) {
                    const pfxPath = path.resolve(args.projectRoot, process.env.NODE_ENV === 'production' ? '../../' : '../', args.moduleConfig.https.pfx);
                    let pfxData;
                    try {
                        pfxData = yield util_1.promisify(fs.readFile)(pfxPath);
                    }
                    catch (e) {
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
                        }
                        else {
                            server.listen(args.moduleConfig.https.port || args.moduleConfig.port, args.moduleConfig.host, () => console.log(`${args.moduleConfig._log} HTTPS server started ${args.moduleConfig.https._url}`));
                        }
                    }
                }
                if (!args.moduleConfig.https || (!!args.moduleConfig.https.port && args.moduleConfig.https.port !== args.moduleConfig.port)) {
                    const server = http.createServer(app);
                    if (args.moduleConfig.host === '+') {
                        server.listen(args.moduleConfig.port, () => console.log(`${args.moduleConfig._log} APPLICATION server started ${args.moduleConfig._url}`));
                    }
                    else {
                        server.listen(args.moduleConfig.port, args.moduleConfig.host, () => console.log(`${args.moduleConfig._log} APPLICATION server started ${args.moduleConfig._url}`));
                    }
                }
            }
            else {
                console.warn(`${args.moduleConfig._log} APPLICATION running ${args.moduleConfig.util.getConfigSources().map(c => c.name)} without Port number, skip launching the express server`);
                process.exit(0);
            }
        }
    }))
        .catch(err => {
        console.error(`${args.moduleConfig._log} ${!!args.test ? 'UNIT-TEST' : 'APPLICATION'} ERROR`, err);
        process.exit(1);
    });
}
exports.main = main;
function init(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.mongoConfig && args.mongoConfig.mongo) {
            yield MongoClient_1.registerMongoClient(args.iocContainer, args.moduleConfig, args.mongoConfig, DbEntity_1.DefaultMongoClientTYPE);
        }
        const app = express();
        const server = new inversify_express_utils_1.InversifyExpressServer(args.iocContainer, undefined, undefined, app, undefined, false);
        if (args.creating) {
            yield args.creating(app, args.moduleConfig, args.iocContainer);
        }
        create(app, args);
        if (args.created) {
            yield args.created(app, args.moduleConfig, args.iocContainer);
        }
        return server.setErrorConfig(args.errorConfigCb || (a => {
            // Finally handle the error
            // It's important that this come after the main routes are registered
            a.use(new ExpressError_1.ExpressError(args.moduleConfig).handler);
        })).build();
    });
}
function create(app, args) {
    // Register express.js middlewares
    app.use(bodyparser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(bodyparser.json({ limit: '50mb' }));
    app.use(cookieparser());
    // CORS
    if (args.moduleConfig.cors && args.moduleConfig.cors.length > 0) {
        if (args.moduleConfig.cors.indexOf('*') >= 0) {
            app.use(DynamicCors_1.DynamicCors.allowAll); // Allow all origin
        }
        else {
            app.use(new DynamicCors_1.DynamicCors(args.moduleConfig.cors).handle); // Allow only specific domain (dynamically)
        }
    }
    // Register Healthz
    if (!args.disableHealthz) {
        app.use(args.healthzRootUrl || '/healthz', HealthHandler_1.HealthHandler.getInstance(args.moduleConfig).healthz);
        if (!!args.apiRootUrl) {
            app.use(args.apiRootUrl + (args.healthzRootUrl || '/healthz'), HealthHandler_1.HealthHandler.getInstance(args.moduleConfig).healthz);
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
//# sourceMappingURL=module.js.map