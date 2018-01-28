import * as mongoose from "mongoose";
import { interfaces } from "inversify";
import { IModuleConfig } from "../module";
export declare type MongoClient = mongoose.Mongoose;
export declare const MongoClientTYPE: symbol;
export interface IMongoConfig {
    /** Connection string: mongodb://localhost/test */
    mongo: string;
    /** Using testWithMockgo */
    mocko?: boolean;
}
export declare function createMongoClient(moduleConfig: IModuleConfig, connectionString: string): Promise<typeof mongoose>;
export declare function createMockgoClient(moduleConfig: IModuleConfig, connectionString: string): Promise<typeof mongoose>;
export declare function registerMongoClient(iocContainer: interfaces.Container, moduleConfig: IModuleConfig, mongoConfig: IMongoConfig, serviceIdentifier?: symbol): Promise<void>;
