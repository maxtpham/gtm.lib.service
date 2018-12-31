import * as express from "express";
export declare class DynamicCors {
    private domains;
    constructor(domains: string[]);
    static allowAll(req: express.Request, res: express.Response, next: express.NextFunction): void;
    private _handle;
    readonly handle: express.RequestHandler;
}
