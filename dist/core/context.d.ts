import { IncomingMessage, ServerResponse } from 'http';
import { RestMethod } from './types';
export declare class AppContext {
    private props;
    constructor();
    add(name: string, value: any): void;
    remove(name: string): void;
    get(name: string): any;
}
export declare class RequestContext {
    private props;
    private req;
    private res;
    constructor(req: IncomingMessage, res: ServerResponse);
    getMethod(): RestMethod;
    getRequest(): IncomingMessage;
    getResponse(): ServerResponse;
    add(name: string, value: any): void;
    remove(name: string): void;
    get(name: string): any;
}
