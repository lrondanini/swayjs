export declare enum RestMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS"
}
export declare class Context {
    private props;
    constructor();
    add(name: string, value: any): void;
    remove(name: string): void;
    get(name: string): any;
}
