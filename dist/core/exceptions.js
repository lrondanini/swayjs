var ErrorType;
(function (ErrorType) {
    ErrorType["HttpVersionNotSupported"] = "HttpVersionNotSupported";
    ErrorType["PayloadTooLarge"] = "PayloadTooLarge";
    ErrorType["UnsupportedMediaType"] = "UnsupportedMediaType";
    ErrorType["UnprocessableEntity"] = "UnprocessableEntity";
    ErrorType["InternalServerError"] = "InternalServerError";
    ErrorType["Unauthorized"] = "Unauthorized";
    ErrorType["NotFound"] = "NotFound";
    ErrorType["NotImplemented"] = "NotImplemented";
    ErrorType["GatewayTimeout"] = "GatewayTimeout";
    ErrorType["PreconditionFailed"] = "PreconditionFailed";
    ErrorType["BadRequest"] = "BadRequest";
    ErrorType["Forbidden"] = "Forbidden";
    ErrorType["NotAcceptable"] = "NotAcceptable";
    ErrorType["ImATeapot"] = "ImATeapot";
    ErrorType["MethodNotAllowed"] = "MethodNotAllowed";
    ErrorType["BadGateway"] = "BadGateway";
    ErrorType["ServiceUnavailable"] = "ServiceUnavailable";
    ErrorType["RequestTimeout"] = "RequestTimeout";
    ErrorType["Conflict"] = "Conflict";
    ErrorType["Gone"] = "Gone";
})(ErrorType || (ErrorType = {}));
class HttpException {
    constructor(et, message, description) {
        this.errorType = et;
        this.message = message;
        this.description = description;
        this.errorCode = this.findCode();
    }
    findCode() {
        switch (this.errorType) {
            case ErrorType.BadRequest: return 400;
            case ErrorType.Unauthorized: return 401;
            case ErrorType.Forbidden: return 403;
            case ErrorType.NotFound: return 404;
            case ErrorType.MethodNotAllowed: return 405;
            case ErrorType.NotAcceptable: return 406;
            case ErrorType.RequestTimeout: return 408;
            case ErrorType.Conflict: return 409;
            case ErrorType.Gone: return 410;
            case ErrorType.PreconditionFailed: return 412;
            case ErrorType.PayloadTooLarge: return 413;
            case ErrorType.UnsupportedMediaType: return 415;
            case ErrorType.ImATeapot: return 418;
            case ErrorType.UnprocessableEntity: return 422;
            case ErrorType.InternalServerError: return 500;
            case ErrorType.NotImplemented: return 501;
            case ErrorType.BadGateway: return 502;
            case ErrorType.ServiceUnavailable: return 503;
            case ErrorType.GatewayTimeout: return 504;
            case ErrorType.HttpVersionNotSupported: return 505;
        }
    }
    send(res) {
        res.statusCode = this.errorCode;
        res.end(JSON.stringify({ error: this.message, description: this.description }));
    }
}
export class BadRequestException extends HttpException {
    constructor(message, description) {
        super(ErrorType.BadRequest, message, description);
    }
}
export class UnauthorizedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.Unauthorized, message, description);
    }
}
export class ForbiddenException extends HttpException {
    constructor(message, description) {
        super(ErrorType.Forbidden, message, description);
    }
}
export class NotFoundException extends HttpException {
    constructor(message, description) {
        super(ErrorType.NotFound, message, description);
    }
}
export class MethodNotAllowedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.MethodNotAllowed, message, description);
    }
}
export class NotAcceptableException extends HttpException {
    constructor(message, description) {
        super(ErrorType.NotAcceptable, message, description);
    }
}
export class RequestTimeoutException extends HttpException {
    constructor(message, description) {
        super(ErrorType.RequestTimeout, message, description);
    }
}
export class BadGatewayException extends HttpException {
    constructor(message, description) {
        super(ErrorType.BadGateway, message, description);
    }
}
export class ServiceUnavailableException extends HttpException {
    constructor(message, description) {
        super(ErrorType.ServiceUnavailable, message, description);
    }
}
export class ConflictException extends HttpException {
    constructor(message, description) {
        super(ErrorType.Conflict, message, description);
    }
}
export class GoneException extends HttpException {
    constructor(message, description) {
        super(ErrorType.Gone, message, description);
    }
}
export class UnsupportedMediaTypeException extends HttpException {
    constructor(message, description) {
        super(ErrorType.UnsupportedMediaType, message, description);
    }
}
export class UnprocessableEntityException extends HttpException {
    constructor(message, description) {
        super(ErrorType.UnprocessableEntity, message, description);
    }
}
export class HttpVersionNotSupportedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.HttpVersionNotSupported, message, description);
    }
}
export class PayloadTooLargeException extends HttpException {
    constructor(message, description) {
        super(ErrorType.PayloadTooLarge, message, description);
    }
}
export class InternalServerErrorException extends HttpException {
    constructor(message, description) {
        super(ErrorType.InternalServerError, message, description);
    }
}
export class NotImplementedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.NotImplemented, message, description);
    }
}
export class ImATeapotException extends HttpException {
    constructor(message, description) {
        super(ErrorType.ImATeapot, message, description);
    }
}
export class GatewayTimeoutException extends HttpException {
    constructor(message, description) {
        super(ErrorType.GatewayTimeout, message, description);
    }
}
export class PreconditionFailedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.PreconditionFailed, message, description);
    }
}
//# sourceMappingURL=exceptions.js.map