export interface IMongoConfig {
    /** Connection string: mongodb://localhost/test */
    mongo: string;
    /** Using testWithMockgo */
    mocko?: boolean;
}
export declare function normalizeMongoConfig(mongoConfig: IMongoConfig): IMongoConfig;
