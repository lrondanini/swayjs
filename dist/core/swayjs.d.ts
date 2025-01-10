import { IncomingMessage, ServerResponse } from 'http';
import { ILogger } from './logger';
import { RequestContext } from './context';
import { CorsOptions } from './cors';
import { ValidationFunction } from './validator/validator';
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
    private server;
    private configuration;
    private logManager;
    private middlewares;
    private router;
    private corsManager;
    private requestValidator;
    private appContext;
    private branchMiddlewares;
    private branchMiddlewaresList;
    static CreateServer(config: SwayJsConfiguration, logManager?: ILogger): Promise<SwayJs>;
    constructor(config: SwayJsConfiguration, logManager?: ILogger);
    private addBranchMiddleware;
    private applyBranchMiddlewares;
    private initRouters;
    private handleRoute;
    private getBody;
    addCustomValidationFunction(name: string, fn: ValidationFunction): void;
    addToAppContext(key: string, value: any): void;
    getRouterMap(): string;
    run(): Promise<void>;
    use(fn: MiddlewareFunction): Promise<void>;
    private handleRequest;
}
