import http, { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import FindMyWay, { HTTPVersion } from 'find-my-way';
import Builder, { MethodInfo } from './builder';
import Logger, { ILogger } from './logger';
import { RestMethod } from './types';
import { AppContext, RequestContext } from './context';
import CorsManager, { CorsOptions } from './cors';
import { ValidationFunction, Validator } from './validator/validator';
import { InternalServerErrorException, UnprocessableEntityException } from './exceptions';


export interface SwayJsConfiguration {
  port: number;
  key?: string;
  cert?: string;
  routesFolder?: string;
  corsOptions?: CorsOptions;
  noCorsMode?: boolean;
}

export type MiddlewareFunction = (req: IncomingMessage, res: ServerResponse, reqContext?: RequestContext) => RequestContext | undefined | Promise<RequestContext | undefined>;

export default class SwayJs {
  private server: http.Server | https.Server;
  private configuration: SwayJsConfiguration;
  private logManager: Logger;
  private middlewares: Function[] = [];
  private router: FindMyWay.Instance<HTTPVersion>;
  private corsManager: CorsManager;
  private requestValidator: Validator;
  private appContext: AppContext = new AppContext();

  static async CreateServer(config: SwayJsConfiguration, logManager?: ILogger): Promise<SwayJs> {
    const server = new SwayJs(config, logManager);
    await server.initRouters();
    return server;
  }

  constructor(config: SwayJsConfiguration, logManager?: ILogger) {
    this.configuration = config;
    if (!this.configuration.noCorsMode) {
      this.configuration.noCorsMode = false;
    }
    this.logManager = new Logger(logManager);
    this.corsManager = new CorsManager(config.corsOptions);
    this.requestValidator = new Validator();    
  }

  private async initRouters() {
    const r = FindMyWay<HTTPVersion>({
      ignoreTrailingSlash: true,
      ignoreDuplicateSlashes: true,
      defaultRoute: (req, res) => {
        this.logManager.error(req.url + ' not found');  
        res.statusCode = 404;
        res.end();
      }
    });

    //to change the query string parser (eg to qs):
    // const qs = require('qs')
    // const r = FindMyWay({
    //   .......
    //   querystringParser: str => qs.parse(str)
    // })

    const builder = new Builder(this.logManager, this.configuration.routesFolder);
   

    for (const routeInfo of builder.routes) {
      // console.log(routeInfo);

      const routeClassType = await import(routeInfo.filePath);      
      
      let routeClassImported: any;
      if (routeClassType.default) {
        routeClassImported = routeClassType.default
      } else {
        for (const obj of Object.keys(routeClassType)) {
          if (obj.toLowerCase() === routeInfo.className.toLowerCase()) {
            routeClassImported = routeClassType[obj];
          }
        }
      }

      //console.log(routeInfo.filePath, routeInfo.className, Object.keys(routeClassType), routeClassType);
      const routeClass = new routeClassImported(this.appContext);
      const _self = this;
      for (const method of routeInfo.methods) {
        r.on(method.restMethod, routeInfo.route, async function (req: any, res: any, params: any, store: any, searchParams: any) {
          _self.handleRoute(req, res, params, searchParams, method, routeClass, this); //requestContext = this is set as 3rd parameter of lookup
        });
      }
    }

    this.router = r;
  }

  private async handleRoute(req: IncomingMessage, res: ServerResponse, params, searchParams, method: MethodInfo, routeClass: any, requestContext: RequestContext) {
    
    let skipValidation = false;

    let body: any;

    if (method.aspectsParams) {
      let validationErrors: string[] = [];
      

      if (method.restMethod == RestMethod.GET || method.restMethod == RestMethod.DELETE) {
        skipValidation = routeClass['skipGetInputValidation'];
        if(!skipValidation) {
          skipValidation = routeClass['skipDeleteInputValidation'];
        }
        
        if (method.validationRules) {
          //searchParams is already an object   
          try {
            body = this.requestValidator.parseQueryString(method.validationRules, searchParams);
          } catch (e) {
            this.logManager.error('Cannot parse body', e);
            new UnprocessableEntityException('Cannot parse query params').send(res);
          }  
        } else {
          body = searchParams;
        }
      } else if (method.restMethod == RestMethod.POST || method.restMethod == RestMethod.PUT) {
        skipValidation = routeClass['skipPostInputValidation'];
        if(!skipValidation) {
          skipValidation = routeClass['skipPutInputValidation'];
        }
        try {
          body = await this.getBody(req);
        } catch (e) {
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
        } else {
          let result: any;
          try {
            result = await routeClass[method.name](requestContext, body, params);
          } catch (err) {
            console.log(err);
            new InternalServerErrorException(err.message).send(res);
          }
          if (result) {
            res.end(JSON.stringify(result));
          }
        }
      }

    } else {
      res.end(JSON.stringify(await routeClass[method.name](requestContext)));
    }
  }

  private getBody(request: IncomingMessage): any {
    return new Promise((resolve) => {
      const bodyParts: any[] = [];
      let body;
      request.on('data', (chunk) => {
        bodyParts.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(bodyParts).toString();
        resolve(JSON.parse(body));
      });
    });
  }
  
  addCustomValidationFunction(name: string, fn: ValidationFunction) {
    this.requestValidator.addValidationFunction(name, fn);
  }

  addToAppContext(key: string, value: any) {
    this.appContext.add(key, value);
  }

  getRouterMap(): string {
    return this.router.prettyPrint();
  }

  async run() {
    if (this.configuration.key && this.configuration.cert) {
      this.server = https.createServer((req: IncomingMessage, res: ServerResponse) => {
        this.handleRequest(req, res);
      })
    } else {
      this.server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
        this.handleRequest(req, res);
      })
    }
    this.logManager.log('Listening on port: ' + this.configuration.port);
    this.server.listen(this.configuration.port);
  }

  //Context
  async use(fn: MiddlewareFunction): Promise<void> {
    this.middlewares.push(fn);
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
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
      //sets the headers for CORS and handles OPTIONS preflight requests
      continueProcess = this.corsManager.handleRequest(req, res);
    }

    let requestContext = new RequestContext(req, res);

    if (continueProcess) {
      for (const fn of this.middlewares) {
        try {
          const r = await fn(req, res, requestContext);
          if(r) {
            requestContext = r;
          }
        } catch (err) {
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