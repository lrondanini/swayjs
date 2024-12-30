import {Context} from "./context";


export type RouteParams = { [key: string]: string | undefined };

export interface Route {
  skipGetInputValidation?: boolean;
  skipPostInputValidation?: boolean;
  skipPutInputValidation?: boolean;
  skipDeleteInputValidation?: boolean;

  Options?(reqCtx: Context, body?: any, routeParams?: RouteParams): any;
  Get?(reqCtx: Context, queryParameters?: any, routeParams?: RouteParams): any;
  Post?(reqCtx: Context, body?: any, routeParams?: RouteParams): void;
  Put?(reqCtx: Context, body?: any, routeParams?: RouteParams): void;
  Delete?(reqCtx: Context, body?: any, routeParams?: RouteParams): void;
}
