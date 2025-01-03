import { RequestContext } from "./context";
import { RestMethod } from "./types";


export type RouteParams = { [key: string]: string | undefined };

export interface Route {
  skipGetInputValidation?: boolean;
  skipPostInputValidation?: boolean;
  skipPutInputValidation?: boolean;
  skipDeleteInputValidation?: boolean;

  Options?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): any;
  Get?(reqCtx: RequestContext, queryParameters?: any, routeParams?: RouteParams): any;
  Post?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
  Put?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
  Delete?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
  PrepareContext?(restMethod: RestMethod, reqCtx: RequestContext): RequestContext;
}
