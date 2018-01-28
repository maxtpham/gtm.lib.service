/// <reference types="express" />
import * as express from "express";
/**
 * The Express.js authentication entry for TSOA
 */
export declare function expressAuthentication(request: express.Request, securityName: string, requestedScopes?: string[]): Promise<any>;
