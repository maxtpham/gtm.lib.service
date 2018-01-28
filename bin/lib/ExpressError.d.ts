/// <reference types="express" />
import * as express from "express";
import { IModuleConfig } from "../module";
/**
 * The last Express.js app routes to handle the error.
 * It's important that this come after ALL the main routes are registered
 */
export declare class ExpressError {
    private config;
    constructor(config: IModuleConfig);
    readonly handler: express.RequestHandler;
    private _handler(err, req, res, next);
}
