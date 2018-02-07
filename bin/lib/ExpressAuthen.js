"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The Express.js authentication entry for TSOA
 */
function expressAuthentication(request, securityName, requestedScopes) {
    if (securityName === 'jwt') {
        const userScopes = !!request.user && !request.user['$'] ? (request.user.scope || []) : undefined;
        return new Promise((resolve, reject) => {
            if (typeof userScopes === 'undefined') {
                const err = new Error("Not logged in or Invalid user session");
                err.__nolog = true;
                reject(err);
            }
            else if (userScopes === null || !requestedScopes || requestedScopes.length <= 0) {
                resolve(request.user); // JWT is admin, or the API does not require any scope
            }
            else {
                // Check if JWT contains all required scopes
                for (let requestedScope of requestedScopes) {
                    if (!userScopes[requestedScope]) {
                        const err = new Error("User is not permitted to execute the action");
                        err.__nolog = true;
                        reject(err);
                    }
                }
                resolve(request.user);
            }
        });
    }
}
exports.expressAuthentication = expressAuthentication;
//# sourceMappingURL=ExpressAuthen.js.map