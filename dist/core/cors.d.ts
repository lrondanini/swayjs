import { IncomingMessage, ServerResponse } from "http";
export type StaticOrigin = boolean | string | RegExp | Array<boolean | string | RegExp>;
export type CustomOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, origin?: StaticOrigin) => void) => void;
export interface CorsOptions {
    origin?: StaticOrigin | CustomOrigin | undefined;
    methods?: string | string[] | undefined;
    allowedHeaders?: string | string[] | undefined;
    exposedHeaders?: string | string[] | undefined;
    credentials?: boolean | undefined;
    maxAge?: number | undefined;
    preflightContinue?: boolean | undefined;
    optionsSuccessStatus?: number | undefined;
}
export type Header = {
    key: string;
    value: string;
};
export default class CorsManager {
    options: CorsOptions;
    constructor(options?: CorsOptions);
    private isString;
    private headerOptionToString;
    private isOriginAllowed;
    private configureOrigin;
    private applyHeaders;
    private configureMethods;
    private configureCredentials;
    private configureAllowedHeaders;
    private configureExposedHeaders;
    private configureMaxAge;
    handleRequest(req: IncomingMessage, res: ServerResponse): boolean;
}
