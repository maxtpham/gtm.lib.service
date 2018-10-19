"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cls = require("continuation-local-storage");
let AuthNamespace;
function register(app) {
    AuthNamespace = cls.createNamespace('auth');
    app.use(jwtHeaderExtractorMiddleware);
}
exports.register = register;
function jwtHeaderExtractorMiddleware(req, res, next) {
    let jwt;
    if (!!req.cookies.jwt) {
        jwt = req.cookies.jwt;
    }
    else {
        const authHeader = req.headers['authorization'];
        if (typeof (authHeader) === 'string' && authHeader.startsWith('Bearer ')) {
            jwt = authHeader.substr('Bearer '.length);
        }
    }
    if (!!jwt) {
        // wrap the events from request and response
        AuthNamespace.bindEmitter(req);
        AuthNamespace.bindEmitter(res);
        // run middleware in the scope of the namespace that we have created
        AuthNamespace.run(() => {
            // set data to the namespace that we want to access in different events/callbacks
            AuthNamespace.set('jwt', jwt);
            next();
        });
    }
    else {
        next();
    }
}
function getIocJwt() {
    return AuthNamespace.get('jwt');
}
exports.getIocJwt = getIocJwt;
//# sourceMappingURL=IocApi.js.map