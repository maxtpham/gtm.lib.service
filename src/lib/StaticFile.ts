import * as express from "express";
import * as path from "path";

export class StaticFile {
    private filePath: string;
    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public get name(): string {
        return path.basename(this.filePath);
    }

    public get handler(): express.RequestHandler {
        return this._handler.bind(this);
    }

    private _handler(req: express.Request, res: express.Response, next: express.NextFunction): any {
        res.sendFile(this.filePath);
    }
}