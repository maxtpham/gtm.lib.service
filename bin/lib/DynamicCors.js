"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DynamicCors {
    constructor(domains) {
        this.domains = {};
        domains.map(name => this.domains[name] = true);
    }
    static allowAll(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    }
    _handle(req, res, next) {
        if (req.method === 'OPTIONS') {
            if (!!req.headers && !!req.headers.origin && this.domains[req.headers.origin]) {
                res.header('Access-Control-Allow-Origin', req.headers.origin);
                res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
            res.sendStatus(204);
        }
        else {
            if (!req.headers || !req.headers.origin) {
                next();
            }
            else if (this.domains[req.headers.origin]) {
                res.header('Access-Control-Allow-Origin', req.headers.origin);
                res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                next();
            }
            else {
                const error = new Error(`Not allowed by CORS for origin: '${req.headers.origin}'`);
                error.__nolog = true;
                next(error);
            }
        }
    }
    get handle() {
        return this._handle.bind(this);
    }
}
exports.DynamicCors = DynamicCors;
//# sourceMappingURL=DynamicCors.js.map