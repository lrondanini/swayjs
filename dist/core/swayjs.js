import http from 'http';
import https from 'https';
import FindMyWay from 'find-my-way';
import Builder from './builder';
import Logger from './logger';
import { RestMethod } from './types';
import { AppContext, RequestContext } from './context';
import CorsManager from './cors';
import { Validator } from './validator/validator';
import { InternalServerErrorException, UnprocessableEntityException } from './exceptions';
export default class SwayJs {
    static async CreateServer(config, logManager) {
        const server = new SwayJs(config, logManager);
        await server.initRouters();
        return server;
    }
    constructor(config, logManager) {
        this.middlewares = [];
        this.appContext = new AppContext();
        this.configuration = config;
        if (!this.configuration.noCorsMode) {
            this.configuration.noCorsMode = false;
        }
        this.logManager = new Logger(logManager);
        this.corsManager = new CorsManager(config.corsOptions);
        this.requestValidator = new Validator();
    }
    async initRouters() {
        const r = FindMyWay({
            ignoreTrailingSlash: true,
            ignoreDuplicateSlashes: true,
            defaultRoute: (req, res) => {
                this.logManager.error(req.url + ' not found');
                res.statusCode = 404;
                res.end();
            }
        });
        const builder = new Builder(this.logManager, this.configuration.routesFolder);
        for (const routeInfo of builder.routes) {
            const routeClassType = await import(routeInfo.filePath);
            let routeClassImported;
            if (routeClassType.default) {
                routeClassImported = routeClassType.default;
            }
            else {
                for (const obj of Object.keys(routeClassType)) {
                    if (obj.toLowerCase() === routeInfo.className.toLowerCase()) {
                        routeClassImported = routeClassType[obj];
                    }
                }
            }
            const routeClass = new routeClassImported(this.appContext);
            const _self = this;
            for (const method of routeInfo.methods) {
                r.on(method.restMethod, routeInfo.route, async function (req, res, params, store, searchParams) {
                    _self.handleRoute(req, res, params, searchParams, method, routeClass, this);
                });
            }
        }
        this.router = r;
    }
    async handleRoute(req, res, params, searchParams, method, routeClass, requestContext) {
        let skipValidation = false;
        let body;
        if (method.aspectsParams) {
            let validationErrors = [];
            if (method.restMethod == RestMethod.GET || method.restMethod == RestMethod.DELETE) {
                skipValidation = routeClass['skipGetInputValidation'];
                if (!skipValidation) {
                    skipValidation = routeClass['skipDeleteInputValidation'];
                }
                if (method.validationRules) {
                    try {
                        body = this.requestValidator.parseQueryString(method.validationRules, searchParams);
                    }
                    catch (e) {
                        this.logManager.error('Cannot parse body', e);
                        new UnprocessableEntityException('Cannot parse query params').send(res);
                    }
                }
                else {
                    body = searchParams;
                }
            }
            else if (method.restMethod == RestMethod.POST || method.restMethod == RestMethod.PUT) {
                skipValidation = routeClass['skipPostInputValidation'];
                if (!skipValidation) {
                    skipValidation = routeClass['skipPutInputValidation'];
                }
                try {
                    body = await this.getBody(req);
                }
                catch (e) {
                    this.logManager.error('Cannot parse body', e);
                    new UnprocessableEntityException('Cannot parse body').send(res);
                }
            }
            if (body) {
                if (!skipValidation && method.validationRules) {
                    validationErrors = this.requestValidator.validate(method.validationRules, body);
                }
                if (validationErrors.length > 0 && !skipValidation) {
                    this.logManager.error('Validation errors:\n' + validationErrors.join('\n'));
                    new UnprocessableEntityException('Validation errors:\n' + validationErrors.join('\n')).send(res);
                }
                else {
                    let result;
                    try {
                        result = await routeClass[method.name](requestContext, body, params);
                    }
                    catch (err) {
                        console.log(err);
                        new InternalServerErrorException(err.message).send(res);
                    }
                    if (result) {
                        res.end(JSON.stringify(result));
                    }
                }
            }
        }
        else {
            res.end(JSON.stringify(await routeClass[method.name](requestContext)));
        }
    }
    getBody(request) {
        return new Promise((resolve) => {
            const bodyParts = [];
            let body;
            request.on('data', (chunk) => {
                bodyParts.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(bodyParts).toString();
                resolve(JSON.parse(body));
            });
        });
    }
    addCustomValidationFunction(name, fn) {
        this.requestValidator.addValidationFunction(name, fn);
    }
    addToAppContext(key, value) {
        this.appContext.add(key, value);
    }
    getRouterMap() {
        return this.router.prettyPrint();
    }
    async run() {
        if (this.configuration.key && this.configuration.cert) {
            this.server = https.createServer((req, res) => {
                this.handleRequest(req, res);
            });
        }
        else {
            this.server = http.createServer((req, res) => {
                this.handleRequest(req, res);
            });
        }
        this.logManager.log('Listening on port: ' + this.configuration.port);
        this.server.listen(this.configuration.port);
    }
    async use(fn) {
        this.middlewares.push(fn);
    }
    async handleRequest(req, res) {
        let continueProcess = true;
        const method = req.method && req.method.toUpperCase && req.method.toUpperCase();
        if (method === RestMethod.OPTIONS && req.url) {
            const handle = this.router.find(method, req.url);
            if (handle) {
                continueProcess = false;
                await handle.handler(req, res, handle.params, handle.store, handle.searchParams);
            }
        }
        if (continueProcess && !this.configuration.noCorsMode) {
            continueProcess = this.corsManager.handleRequest(req, res);
        }
        let requestContext = new RequestContext(req, res);
        if (continueProcess) {
            for (const fn of this.middlewares) {
                try {
                    const r = await fn(req, res, requestContext);
                    if (r) {
                        requestContext = r;
                    }
                }
                catch (err) {
                    continueProcess = false;
                    new InternalServerErrorException(err.message).send(res);
                }
            }
        }
        if (continueProcess) {
            await this.router.lookup(req, res, requestContext);
        }
    }
}
//# sourceMappingURL=swayjs.js.map