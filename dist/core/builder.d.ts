import Logger from './logger';
import { RestMethod } from './types';
import { PropRules } from './validator/builder';
export interface MethodInfo {
    name: string;
    restMethod: RestMethod;
    aspectsParams: boolean;
    aspectsRouteParams: boolean;
    paramType?: string;
    paramTypeImportFile?: string;
    validationRules?: PropRules;
    routeParamsValidationRules?: PropRules;
    rawType?: any;
}
export interface RouteInfo {
    filePath: string;
    className: string;
    methods: MethodInfo[];
    route: string;
    hasBranchMiddleware: boolean;
}
export default class Builder {
    private logManager;
    routes: RouteInfo[];
    constructor(logManager: Logger, routesFolder?: string);
    private parseRoutes;
}
