import * as express from 'express';
import { IModuleConfig } from './ModuleConfig';
export declare class HealthHandler {
    private static _instance;
    static getInstance(config: IModuleConfig): HealthHandler;
    private config;
    private constructor();
    healthz(req: express.Request, res: express.Response, next: express.NextFunction): import("express-serve-static-core").Response;
}
