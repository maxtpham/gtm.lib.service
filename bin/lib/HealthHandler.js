"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
class HealthHandler {
    static getInstance(config) {
        return !!HealthHandler._instance ? HealthHandler._instance : (HealthHandler._instance = new HealthHandler(config));
    }
    constructor(config) {
        this.config = config;
        this.healthz = this.healthz.bind(this);
    }
    healthz(req, res, next) {
        return res.status(200).send({
            time: Date.now(),
            name: this.config._name,
            version: this.config._version,
            hostname: os.hostname()
        });
    }
}
exports.HealthHandler = HealthHandler;
//# sourceMappingURL=HealthHandler.js.map