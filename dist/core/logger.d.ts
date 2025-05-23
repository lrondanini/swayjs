export interface ILogger {
    log(message: any, ...optionalParams: any[]): void;
    fatal(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    debug(message: any, ...optionalParams: any[]): void;
    verbose(message: any, ...optionalParams: any[]): void;
}
export default class Logger {
    private logManager;
    constructor(logManager?: ILogger);
    log(message: any, ...optionalParams: any[]): void;
    fatal(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    debug(message: any, ...optionalParams: any[]): void;
    verbose(message: any, ...optionalParams: any[]): void;
}
export declare class RequestLogger {
    private logManager;
    private startTime;
    private isError;
    private errorNumber;
    private errorType;
    constructor(logManager?: ILogger);
    setError(errorNumber: number, errorType: string): void;
    private getExecTime;
    private getDateTime;
    log(req: any): void;
}
