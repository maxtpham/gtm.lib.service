import * as express from "express";

/**
 * The Express.js authentication entry for TSOA
 */
export function expressAuthentication(request: express.Request, securityName: string, requestedScopes?: string[]): Promise<any> {
    if (securityName === 'jwt') {
        const userScopes = !!(<any>request).user ? (<string[]>(<any>request).user.scope || []) : undefined;
        return new Promise((resolve, reject) => {
            if (typeof userScopes === 'undefined') {
                const err = new Error("Not logged in or Invalid user session");
                (<any>err).__nolog = true;
                reject(err);
            } else if (userScopes === null || !requestedScopes || requestedScopes.length <= 0) {
                resolve((<any>request).user); // JWT is admin, or the API does not require any scope
            } else {
                // Check if JWT contains all required scopes
                for (let requestedScope of requestedScopes) {
                    if (!userScopes[requestedScope]) {
                        const err = new Error("User is not permitted to execute the action");
                        (<any>err).__nolog = true;
                        reject(err);
                    }
                }
                resolve((<any>request).user);
            }
        });
    }
}