import * as express from "express";
import { IModuleConfig } from "../module";

/**
 * The last Express.js app routes to handle the error.
 * It's important that this come after ALL the main routes are registered
 */
export class ExpressError {
    private config: IModuleConfig;

    constructor(config: IModuleConfig) {
        this.config = config;
    }

    public get handler(): express.RequestHandler {
        return this._handler.bind(this);
    }

    private _handler(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!res.statusCode || (res.statusCode >= 200 && res.statusCode < 300)) {
            res.status(err.status || err.statusCode || 500);
        }
        if (err.__nolog) {
            delete err.__nolog;
            // remove nolog stacktrace
            if ((<Error>err).stack) {
                delete (<Error>err).stack;
            }
        } else {
            console.error(`${this.config._log} HTTP.ERROR-${res.statusCode} ${req.method} ${req.originalUrl} ${(typeof(err) === 'string' ? err : err instanceof Error ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : JSON.stringify(err)).replace('\n', '|')}`);
        }
        res.send({
            request: `${req.method} ${req.originalUrl}`,
            error: err instanceof Error ? JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) : err
        });
    }
}
