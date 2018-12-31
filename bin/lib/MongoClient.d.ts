import * as mongoose from "mongoose";
import { interfaces } from "inversify";
import { IModuleConfig } from "./ModuleConfig";
import { IMongoConfig } from "./MongoConfig";
export declare type MongoClient = mongoose.Mongoose;
export declare const MongoClientTYPE: unique symbol;
export declare function createMongoClient(moduleConfig: IModuleConfig, connectionString: string): Promise<typeof mongoose>;
export declare function createMockgoClient(moduleConfig: IModuleConfig, connectionString: string): Promise<typeof mongoose>;
export declare function registerMongoClient(iocContainer: interfaces.Container, moduleConfig: IModuleConfig, mongoConfig: IMongoConfig, serviceIdentifier?: symbol): Promise<void>;
