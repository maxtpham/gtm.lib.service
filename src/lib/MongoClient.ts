import * as mongoose from "mongoose";
import { interfaces } from "inversify";
import { IModuleConfig } from "./ModuleConfig";
import { IMongoConfig } from "./MongoConfig";

export type MongoClient = mongoose.Mongoose;

export const MongoClientTYPE = Symbol("MongoClient");

export async function createMongoClient(moduleConfig: IModuleConfig, connectionString: string) {
    return new Promise<MongoClient>((resolve, reject) => {
        mongoose.connect(connectionString);
        mongoose.connection.on("error", (e: Error) => {
            console.log(`${moduleConfig._log} MongoClient failed to connect to: ${connectionString}`, e);
            reject(e);
        });
        mongoose.connection.once("open", () => {
            console.log(`${moduleConfig._log} MongoClient connected to: ${connectionString}`);
            resolve(mongoose);
        });
    });
}

export async function createMockgoClient(moduleConfig: IModuleConfig, connectionString: string) {
    return new Promise<MongoClient>((resolve, reject) => {
        const Mockgoose = require('mockgoose').Mockgoose;
        const mockgoose = new Mockgoose(mongoose);
        mockgoose.prepareStorage().then(function() {
            mongoose.connect(connectionString);
            mongoose.connection.on("error", (e: Error) => {
                console.log(`${moduleConfig._log} MockgoClient failed to connect to: ${connectionString}`, e);
                reject(e);
            });
            mongoose.connection.once("open", () => {
                console.log(`${moduleConfig._log} MockgoClient connected to: ${connectionString}`);
                resolve(mongoose);
            });
        });
    });
}

export async function registerMongoClient(iocContainer: interfaces.Container, moduleConfig: IModuleConfig, mongoConfig: IMongoConfig, serviceIdentifier?: symbol): Promise<void> {
    // (node:7516) DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
    // Use native promises
    (<any>mongoose).Promise = global.Promise;

    const useMockgoClient = process.env.NODE_ENV === 'test' && (mongoConfig.mocko || true);
    iocContainer.bind<MongoClient>(serviceIdentifier || MongoClientTYPE).toConstantValue(
         useMockgoClient ? await createMockgoClient(moduleConfig, mongoConfig.mongo) : await createMongoClient(moduleConfig, mongoConfig.mongo)
    );
    console.log(`${moduleConfig._log} MongoClient useMockgoClient=${useMockgoClient}`, serviceIdentifier || MongoClientTYPE);
    return Promise.resolve();
}