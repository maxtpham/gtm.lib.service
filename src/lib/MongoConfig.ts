export interface IMongoConfig {
    /** Connection string: mongodb://localhost/test */
    mongo: string;
    /** Using testWithMockgo */
    mocko?: boolean;
}

export function normalizeMongoConfig(mongoConfig: IMongoConfig): IMongoConfig {
    if (typeof(process.env.MONGO) === 'string') {
        if (!mongoConfig) {
            mongoConfig = { mongo: process.env.MONGO };
        } else {
            mongoConfig.mongo = process.env.MONGO;
        }
    }
    if (typeof(process.env.MOCKO) === 'string') {
        if (!mongoConfig) {
            mongoConfig = { mongo: undefined, mocko: process.env.MOCKO.trim().toLowerCase() === 'true' };
        } else {
            mongoConfig.mocko = process.env.MOCKO.trim().toLowerCase() === 'true';
        }
    }
    return mongoConfig;
}
