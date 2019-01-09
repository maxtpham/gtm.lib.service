"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpCodes_1 = require("./HttpCodes");
class HttpError {
    constructor(status, data) {
        this.status = status;
        this.data = data;
    }
    handle(req, res, next) {
        res.status(this.status);
        res.send(this.data || HttpCodes_1.HttpCodes.Map[this.status] || `HttpError-${this.status}`);
        return true;
    }
}
exports.HttpError = HttpError;
/**
 * The last Express.js app routes to handle the error.
 * It's important that this come after ALL the main routes are registered
 */
class ExpressError {
    constructor(config) {
        this.config = config;
    }
    get handler() {
        return this._handler.bind(this);
    }
    _handler(err, req, res, next) {
        if ((err instanceof HttpError) && err.handle(req, res, next))
            return;
        if (!res.statusCode || (res.statusCode >= 200 && res.statusCode < 300)) {
            res.status(err.status || err.statusCode || 500);
        }
        if (err.__nolog) {
            delete err.__nolog;
            // remove nolog stacktrace
            if (err.stack) {
                delete err.stack;
            }
        }
        else {
            //console.error(`${this.config._log} HTTP.ERROR-${res.statusCode} ${req.method} ${req.originalUrl} ${(typeof(err) === 'string' ? err : err instanceof Error ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : JSON.stringify(err)).replace('\n', '|')}`);
            console.error(`${this.config._log} HTTP.ERROR-${res.statusCode} ${req.method} ${req.originalUrl}`, err);
        }
        res.send({
            request: `${req.method} ${req.originalUrl}`,
            //error: err instanceof Error ? JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) : err
            error: err
        });
    }
}
exports.ExpressError = ExpressError;
//# sourceMappingURL=ExpressError.js.map