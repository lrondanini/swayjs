import { RequestContext } from "./context";
export type RouteParams = {
    [key: string]: string | undefined;
};
export interface Route {
    skipInputValidation?: boolean;
    skipGetInputValidation?: boolean;
    skipPostInputValidation?: boolean;
    skipPutInputValidation?: boolean;
    skipDeleteInputValidation?: boolean;
    skipPatchInputValidation?: boolean;
    Options?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): any;
    Get?(reqCtx: RequestContext, queryParameters?: any, routeParams?: RouteParams): any;
    Post?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
    Patch?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
    Put?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
    Delete?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
    BranchMiddleware?(reqCtx: RequestContext): Promise<RequestContext> | RequestContext;
}
