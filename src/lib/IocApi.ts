import * as express from "express";
import * as cls from 'continuation-local-storage';

let AuthNamespace: cls.Namespace;

export function register(app: express.Application) {
    AuthNamespace = cls.createNamespace('auth');
    app.use(jwtHeaderExtractorMiddleware);
}

function jwtHeaderExtractorMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    let jwt: string;
    if (!!req.cookies.jwt) {
        jwt = req.cookies.jwt;
    } else {
        const authHeader = req.headers['authorization'];
        if (typeof(authHeader) === 'string' && authHeader.startsWith('Bearer ')) {
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
    } else {
        next();
    }
}

export function getIocJwt() : string {
    return <string>AuthNamespace.get('jwt');
}