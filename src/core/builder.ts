import * as fs from 'fs';
import * as path from 'path';
import Logger from './logger';
import { Project } from "ts-morph";
import { RestMethod } from './types';
import ValidatorFactory, { PropRules } from './validator/builder';


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
}

export default class Builder {
  private logManager: Logger;
  routes: RouteInfo[];

  constructor(logManager: Logger, routesFolder?: string) {
    this.logManager = logManager;

    const root = process.cwd();
    let routesDirectory = path.join(root, 'routes');
    if (routesFolder) {
      routesDirectory = path.join(root, routesFolder);
    }

    if (fs.existsSync(routesDirectory)) {
      this.parseRoutes(routesDirectory);
    } else {
      throw new Error('Cannot find routes directory in ' + routesDirectory);
    }
  }

  private parseRoutes(routesDirectory: string) {
    const project = new Project();
    const sourceFiles = project.addSourceFilesAtPaths(`${routesDirectory}/**/*.ts`);

    if (sourceFiles.length == 0) {
      throw new Error(`No .ts file found in ${routesDirectory}`);
    }
    const routesInfos: RouteInfo[] = [];
    const parsedRoutes: string[] = [];

    sourceFiles.forEach((sourceFile) => {
      //console.log(sourceFile.getFilePath());
      const classes = sourceFile.getClasses();
      classes.forEach((classDef) => {
        classDef.getImplements().forEach((impl) => {
          const typeInfo = impl.getType().getText();
          // console.log(typeInfo);
          if (typeInfo.toLowerCase().includes('swayjs')) {
            const info = typeInfo.split(".");
            if (info[1].toLowerCase() === 'route') {
              let methodsInfos: MethodInfo[] = [];
              const methods = classDef.getMethods();
              let noServingMethods = true;
              methods.forEach((method) => {
                let skip = false;
                const methodInfo: MethodInfo = {
                  name: method.getName(),
                  restMethod: RestMethod.GET,
                  aspectsParams: false,
                  aspectsRouteParams: false,
                }
                if (method.getName().toLowerCase() == 'get') {
                  noServingMethods = false;
                  methodInfo.restMethod = RestMethod.GET;
                } else if (method.getName().toLowerCase() == 'post') {
                  noServingMethods = false;
                  methodInfo.restMethod = RestMethod.POST;
                } else if (method.getName().toLowerCase() == 'put') {
                  noServingMethods = false;
                  methodInfo.restMethod = RestMethod.PUT;
                } else if (method.getName().toLowerCase() == 'delete') {
                  noServingMethods = false;
                  methodInfo.restMethod = RestMethod.DELETE;
                } else if (method.getName().toLowerCase() == 'options') {
                  noServingMethods = false;
                  methodInfo.restMethod = RestMethod.OPTIONS;
                } else {
                  skip = true;
                }

                if (!skip) {
                  let i = 0; //skip first parameter (it's always the request context - RequestContext)
                  const vFactory = new ValidatorFactory()
                  method.getParameters().forEach((param) => {
                    if (i == 1) {
                      //body/query params
                      methodInfo.aspectsParams = true;
                      methodInfo.validationRules = vFactory.parseParameter(param, project.getTypeChecker());    
                      const paramType = project.getTypeChecker().getTypeAtLocation(param);
                      methodInfo.rawType = paramType;                 
                    } else if (i == 2) {
                      //route params
                      methodInfo.aspectsRouteParams = true;
                      methodInfo.routeParamsValidationRules = vFactory.parseParameter(param, project.getTypeChecker());
                    }
                    i++;
                  });
                  methodsInfos.push(methodInfo);
                }
              });
              if (noServingMethods) {
                throw new Error(`Route at ${sourceFile.getFilePath()} does not have a valid method name. Method name must be one of the following: Get, Post, Put, Delete`);
              }

              const fileName = path.basename(sourceFile.getFilePath());
              const extension = path.extname(fileName);
              let routeName = fileName.replace(extension, '');
              
              if(routeName[0]=='[' && routeName[routeName.length-1]==']'){
                routeName = ":"+routeName.slice(1, -1); //route params
              }
              let route = path.dirname(sourceFile.getFilePath().replace(routesDirectory, ''));
              route = route.replace(/\[(.*?)\]/g, ':$1'); //route params

              // console.log(sourceFile.getFilePath(), route, routeName);
              if (routeName.toLowerCase() != 'index') {
                route = path.join(route, routeName);
              }
              if (parsedRoutes.includes(route)) {
                throw new Error(`Route "${route}" declared multiple times`);
              } else {
                parsedRoutes.push(route);
              }
              routesInfos.push({
                filePath: sourceFile.getFilePath(),
                route: route,
                className: classDef.getName() || '',
                methods: methodsInfos
              })
            }
          }
        });
      });

    });
    // console.log(routesInfos);
    this.routes = routesInfos;
  }
}