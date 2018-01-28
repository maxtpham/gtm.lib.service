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
const mongoose = require("mongoose");
exports.MongoClientTYPE = Symbol("MongoClient");
function createMongoClient(moduleConfig, connectionString) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            mongoose.connect(connectionString);
            mongoose.connection.on("error", (e) => {
                console.log(`${moduleConfig._log} MongoClient failed to connect to: ${connectionString}`, e);
                reject(e);
            });
            mongoose.connection.once("open", () => {
                console.log(`${moduleConfig._log} MongoClient connected to: ${connectionString}`);
                resolve(mongoose);
            });
        });
    });
}
exports.createMongoClient = createMongoClient;
function createMockgoClient(moduleConfig, connectionString) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const Mockgoose = require('mockgoose').Mockgoose;
            const mockgoose = new Mockgoose(mongoose);
            mockgoose.prepareStorage().then(function () {
                mongoose.connect(connectionString);
                mongoose.connection.on("error", (e) => {
                    console.log(`${moduleConfig._log} MockgoClient failed to connect to: ${connectionString}`, e);
                    reject(e);
                });
                mongoose.connection.once("open", () => {
                    console.log(`${moduleConfig._log} MockgoClient connected to: ${connectionString}`);
                    resolve(mongoose);
                });
            });
        });
    });
}
exports.createMockgoClient = createMockgoClient;
function registerMongoClient(iocContainer, moduleConfig, mongoConfig, serviceIdentifier) {
    return __awaiter(this, void 0, void 0, function* () {
        // (node:7516) DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
        // Use native promises
        mongoose.Promise = global.Promise;
        const useMockgoClient = process.env.NODE_ENV === 'test' && (mongoConfig.mocko || true);
        iocContainer.bind(serviceIdentifier || exports.MongoClientTYPE).toConstantValue(useMockgoClient ? yield createMockgoClient(moduleConfig, mongoConfig.mongo) : yield createMongoClient(moduleConfig, mongoConfig.mongo));
        console.log(`${moduleConfig._log} MongoClient useMockgoClient=${useMockgoClient}`, serviceIdentifier || exports.MongoClientTYPE);
        return Promise.resolve();
    });
}
exports.registerMongoClient = registerMongoClient;
//# sourceMappingURL=MongoClient.js.map