"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreconditionFailedException = exports.GatewayTimeoutException = exports.ImATeapotException = exports.NotImplementedException = exports.InternalServerErrorException = exports.PayloadTooLargeException = exports.HttpVersionNotSupportedException = exports.UnprocessableEntityException = exports.UnsupportedMediaTypeException = exports.GoneException = exports.ConflictException = exports.ServiceUnavailableException = exports.BadGatewayException = exports.RequestTimeoutException = exports.NotAcceptableException = exports.MethodNotAllowedException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = void 0;
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
class BadRequestException extends HttpException {
    constructor(message, description) {
        super(ErrorType.BadRequest, message, description);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.Unauthorized, message, description);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends HttpException {
    constructor(message, description) {
        super(ErrorType.Forbidden, message, description);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends HttpException {
    constructor(message, description) {
        super(ErrorType.NotFound, message, description);
    }
}
exports.NotFoundException = NotFoundException;
class MethodNotAllowedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.MethodNotAllowed, message, description);
    }
}
exports.MethodNotAllowedException = MethodNotAllowedException;
class NotAcceptableException extends HttpException {
    constructor(message, description) {
        super(ErrorType.NotAcceptable, message, description);
    }
}
exports.NotAcceptableException = NotAcceptableException;
class RequestTimeoutException extends HttpException {
    constructor(message, description) {
        super(ErrorType.RequestTimeout, message, description);
    }
}
exports.RequestTimeoutException = RequestTimeoutException;
class BadGatewayException extends HttpException {
    constructor(message, description) {
        super(ErrorType.BadGateway, message, description);
    }
}
exports.BadGatewayException = BadGatewayException;
class ServiceUnavailableException extends HttpException {
    constructor(message, description) {
        super(ErrorType.ServiceUnavailable, message, description);
    }
}
exports.ServiceUnavailableException = ServiceUnavailableException;
class ConflictException extends HttpException {
    constructor(message, description) {
        super(ErrorType.Conflict, message, description);
    }
}
exports.ConflictException = ConflictException;
class GoneException extends HttpException {
    constructor(message, description) {
        super(ErrorType.Gone, message, description);
    }
}
exports.GoneException = GoneException;
class UnsupportedMediaTypeException extends HttpException {
    constructor(message, description) {
        super(ErrorType.UnsupportedMediaType, message, description);
    }
}
exports.UnsupportedMediaTypeException = UnsupportedMediaTypeException;
class UnprocessableEntityException extends HttpException {
    constructor(message, description) {
        super(ErrorType.UnprocessableEntity, message, description);
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;
class HttpVersionNotSupportedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.HttpVersionNotSupported, message, description);
    }
}
exports.HttpVersionNotSupportedException = HttpVersionNotSupportedException;
class PayloadTooLargeException extends HttpException {
    constructor(message, description) {
        super(ErrorType.PayloadTooLarge, message, description);
    }
}
exports.PayloadTooLargeException = PayloadTooLargeException;
class InternalServerErrorException extends HttpException {
    constructor(message, description) {
        super(ErrorType.InternalServerError, message, description);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
class NotImplementedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.NotImplemented, message, description);
    }
}
exports.NotImplementedException = NotImplementedException;
class ImATeapotException extends HttpException {
    constructor(message, description) {
        super(ErrorType.ImATeapot, message, description);
    }
}
exports.ImATeapotException = ImATeapotException;
class GatewayTimeoutException extends HttpException {
    constructor(message, description) {
        super(ErrorType.GatewayTimeout, message, description);
    }
}
exports.GatewayTimeoutException = GatewayTimeoutException;
class PreconditionFailedException extends HttpException {
    constructor(message, description) {
        super(ErrorType.PreconditionFailed, message, description);
    }
}
exports.PreconditionFailedException = PreconditionFailedException;
//# sourceMappingURL=exceptions.js.map