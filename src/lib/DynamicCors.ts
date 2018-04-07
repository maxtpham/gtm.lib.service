import * as express from "express";

export class DynamicCors {
    private domains = {};
    constructor(domains: string[]) {
        domains.map(name => this.domains[name] = true);
    }

    public static allowAll(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    }

    private _handle(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.method === 'OPTIONS') {
            if (!!req.headers && !!req.headers.origin && this.domains[<string>req.headers.origin]) {
                res.header('Access-Control-Allow-Origin', <string>req.headers.origin);
                res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
            res.sendStatus(204);
        } else {
            if (!req.headers || !req.headers.origin) {
                next();
            } else if (this.domains[<string>req.headers.origin]) {
                res.header('Access-Control-Allow-Origin', <string>req.headers.origin);
                res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                next();
            } else {
                const error = new Error(`Not allowed by CORS for origin: '${req.headers.origin}'`);
                (<any>error).__nolog = true;
                next(error);
            }
        }
    }

    public get handle(): express.RequestHandler {
        return this._handle.bind(this);
    }
}