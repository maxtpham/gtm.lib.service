import * as express from "express";
export declare class StaticFile {
    private filePath;
    constructor(filePath: string);
    readonly name: string;
    readonly handler: express.RequestHandler;
    private _handler;
}
