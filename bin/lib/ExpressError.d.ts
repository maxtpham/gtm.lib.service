import * as express from "express";
import { IModuleConfig } from "../module";
export declare class HttpError {
    private status;
    private data?;
    constructor(status: number, data?: any);
    handle(req: express.Request, res: express.Response, next: express.NextFunction): boolean;
}
/**
 * The last Express.js app routes to handle the error.
 * It's important that this come after ALL the main routes are registered
 */
export declare class ExpressError {
    private config;
    constructor(config: IModuleConfig);
    readonly handler: express.RequestHandler;
    private _handler;
}
