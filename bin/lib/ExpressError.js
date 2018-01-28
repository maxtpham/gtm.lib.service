"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            console.error(`${this.config._log} HTTP.ERROR-${res.statusCode} ${req.method} ${req.originalUrl} ${(typeof (err) === 'string' ? err : err instanceof Error ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : JSON.stringify(err)).replace('\n', '|')}`);
        }
        res.send({
            request: `${req.method} ${req.originalUrl}`,
            error: err instanceof Error ? JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) : err
        });
    }
}
exports.ExpressError = ExpressError;
//# sourceMappingURL=ExpressError.js.map