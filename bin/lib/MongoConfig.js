"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function normalizeMongoConfig(mongoConfig) {
    if (typeof (process.env.MONGO) === 'string') {
        if (!mongoConfig) {
            mongoConfig = { mongo: process.env.MONGO };
        }
        else {
            mongoConfig.mongo = process.env.MONGO;
        }
    }
    if (typeof (process.env.MOCKO) === 'string') {
        if (!mongoConfig) {
            mongoConfig = { mongo: undefined, mocko: process.env.MOCKO.trim().toLowerCase() === 'true' };
        }
        else {
            mongoConfig.mocko = process.env.MOCKO.trim().toLowerCase() === 'true';
        }
    }
    return mongoConfig;
}
exports.normalizeMongoConfig = normalizeMongoConfig;
//# sourceMappingURL=MongoConfig.js.map