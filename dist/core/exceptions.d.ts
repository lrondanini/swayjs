import { ServerResponse } from "http";
declare enum ErrorType {
    HttpVersionNotSupported = "HttpVersionNotSupported",
    PayloadTooLarge = "PayloadTooLarge",
    UnsupportedMediaType = "UnsupportedMediaType",
    UnprocessableEntity = "UnprocessableEntity",
    InternalServerError = "InternalServerError",
    Unauthorized = "Unauthorized",
    NotFound = "NotFound",
    NotImplemented = "NotImplemented",
    GatewayTimeout = "GatewayTimeout",
    PreconditionFailed = "PreconditionFailed",
    BadRequest = "BadRequest",
    Forbidden = "Forbidden",
    NotAcceptable = "NotAcceptable",
    ImATeapot = "ImATeapot",
    MethodNotAllowed = "MethodNotAllowed",
    BadGateway = "BadGateway",
    ServiceUnavailable = "ServiceUnavailable",
    RequestTimeout = "RequestTimeout",
    Conflict = "Conflict",
    Gone = "Gone"
}
declare class HttpException {
    private errorType;
    private message;
    private description?;
    private errorCode;
    constructor(et: ErrorType, message: string, description?: string);
    getCode(): number;
    getTypeAsString(): ErrorType;
    send(res: ServerResponse): void;
}
export declare class BadRequestException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class UnauthorizedException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class ForbiddenException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class NotFoundException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class MethodNotAllowedException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class NotAcceptableException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class RequestTimeoutException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class BadGatewayException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class ServiceUnavailableException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class ConflictException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class GoneException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class UnsupportedMediaTypeException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class UnprocessableEntityException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class HttpVersionNotSupportedException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class PayloadTooLargeException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class InternalServerErrorException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class NotImplementedException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class ImATeapotException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class GatewayTimeoutException extends HttpException {
    constructor(message: string, description?: string);
}
export declare class PreconditionFailedException extends HttpException {
    constructor(message: string, description?: string);
}
export {};
