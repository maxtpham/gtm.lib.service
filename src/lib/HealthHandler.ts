import * as express from 'express';
import * as os from 'os';
import { IModuleConfig } from './ModuleConfig';

interface IHealthInfo {
    time: number;
    name: string;
    version: string;
    hostname: string;
}

export class HealthHandler {
    private static _instance: HealthHandler;
    public static getInstance(config: IModuleConfig): HealthHandler {
        return !!HealthHandler._instance ? HealthHandler._instance : (HealthHandler._instance = new HealthHandler(config));
    }

    private config: IModuleConfig;
    private constructor(config: IModuleConfig) {
        this.config = config;

        this.healthz = this.healthz.bind(this);
    }

    public healthz(req: express.Request, res: express.Response, next: express.NextFunction) {
        return res.status(200).send(<IHealthInfo>{
            time: Date.now(),
            name: this.config._name,
            version: this.config._version,
            hostname: os.hostname()
        });
    }
}