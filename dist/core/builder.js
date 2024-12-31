import * as fs from 'fs';
import * as path from 'path';
import { Project } from "ts-morph";
import { RestMethod } from './types';
import ValidatorFactory from './validator/builder';
export default class Builder {
    constructor(logManager, routesFolder) {
        this.logManager = logManager;
        const root = process.cwd();
        let routesDirectory = path.join(root, 'routes');
        if (routesFolder) {
            routesDirectory = path.join(root, routesFolder);
        }
        if (fs.existsSync(routesDirectory)) {
            this.parseRoutes(routesDirectory);
        }
        else {
            throw new Error('Cannot find routes directory in ' + routesDirectory);
        }
    }
    parseRoutes(routesDirectory) {
        const project = new Project();
        const sourceFiles = project.addSourceFilesAtPaths(`${routesDirectory}/**/*.ts`);
        if (sourceFiles.length == 0) {
            throw new Error(`No .ts file found in ${routesDirectory}`);
        }
        const routesInfos = [];
        const parsedRoutes = [];
        sourceFiles.forEach((sourceFile) => {
            const classes = sourceFile.getClasses();
            classes.forEach((classDef) => {
                classDef.getImplements().forEach((impl) => {
                    const typeInfo = impl.getType().getText();
                    if (typeInfo.toLowerCase().includes('swayjs')) {
                        const info = typeInfo.split(".");
                        if (info[1].toLowerCase() === 'route') {
                            let methodsInfos = [];
                            const methods = classDef.getMethods();
                            let noServingMethods = true;
                            methods.forEach((method) => {
                                let skip = false;
                                const methodInfo = {
                                    name: method.getName(),
                                    restMethod: RestMethod.GET,
                                    aspectsParams: false,
                                    aspectsRouteParams: false,
                                };
                                if (method.getName().toLowerCase() == 'get') {
                                    noServingMethods = false;
                                    methodInfo.restMethod = RestMethod.GET;
                                }
                                else if (method.getName().toLowerCase() == 'post') {
                                    noServingMethods = false;
                                    methodInfo.restMethod = RestMethod.POST;
                                }
                                else if (method.getName().toLowerCase() == 'put') {
                                    noServingMethods = false;
                                    methodInfo.restMethod = RestMethod.PUT;
                                }
                                else if (method.getName().toLowerCase() == 'delete') {
                                    noServingMethods = false;
                                    methodInfo.restMethod = RestMethod.DELETE;
                                }
                                else if (method.getName().toLowerCase() == 'options') {
                                    noServingMethods = false;
                                    methodInfo.restMethod = RestMethod.OPTIONS;
                                }
                                else {
                                    skip = true;
                                }
                                if (!skip) {
                                    let i = 0;
                                    const vFactory = new ValidatorFactory();
                                    method.getParameters().forEach((param) => {
                                        if (i == 1) {
                                            methodInfo.aspectsParams = true;
                                            methodInfo.validationRules = vFactory.parseParameter(param, project.getTypeChecker());
                                            const paramType = project.getTypeChecker().getTypeAtLocation(param);
                                            methodInfo.rawType = paramType;
                                        }
                                        else if (i == 2) {
                                            methodInfo.aspectsRouteParams = true;
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
                            if (routeName[0] == '[' && routeName[routeName.length - 1] == ']') {
                                routeName = ":" + routeName.slice(1, -1);
                            }
                            let route = path.dirname(sourceFile.getFilePath().replace(routesDirectory, ''));
                            route = route.replace(/\[(.*?)\]/g, ':$1');
                            if (routeName.toLowerCase() != 'index') {
                                route = path.join(route, routeName);
                            }
                            if (parsedRoutes.includes(route)) {
                                throw new Error(`Route "${route}" declared multiple times`);
                            }
                            else {
                                parsedRoutes.push(route);
                            }
                            routesInfos.push({
                                filePath: sourceFile.getFilePath(),
                                route: route,
                                className: classDef.getName() || '',
                                methods: methodsInfos
                            });
                        }
                    }
                });
            });
        });
        this.routes = routesInfos;
    }
}
//# sourceMappingURL=builder.js.map