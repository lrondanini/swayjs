"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vary_1 = require("vary");
class CorsManager {
    constructor(options) {
        if (options) {
            this.options = options;
        }
        else {
            this.options = {
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                preflightContinue: false,
                optionsSuccessStatus: 204
            };
        }
    }
    isString(s) {
        return typeof s === 'string' || s instanceof String;
    }
    headerOptionToString(headerOption) {
        if (this.isString(headerOption)) {
            return headerOption;
        }
        else if (headerOption) {
            return headerOption.join(',');
        }
        return undefined;
    }
    isOriginAllowed(origin, allowedOrigin) {
        if (Array.isArray(allowedOrigin)) {
            for (var i = 0; i < allowedOrigin.length; ++i) {
                if (this.isOriginAllowed(origin, allowedOrigin[i])) {
                    return true;
                }
            }
            return false;
        }
        else if (this.isString(allowedOrigin)) {
            return origin === allowedOrigin;
        }
        else if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(origin);
        }
        else {
            return !!allowedOrigin;
        }
    }
    configureOrigin(req) {
        var requestOrigin = req.headers.origin, headers = [], isAllowed;
        if (!this.options.origin || this.options.origin === '*') {
            headers.push([{
                    key: 'Access-Control-Allow-Origin',
                    value: '*'
                }]);
        }
        else if (this.isString(this.options.origin)) {
            headers.push([{
                    key: 'Access-Control-Allow-Origin',
                    value: this.options.origin
                }]);
            headers.push([{
                    key: 'Vary',
                    value: 'Origin'
                }]);
        }
        else {
            isAllowed = this.isOriginAllowed(requestOrigin, this.options.origin);
            headers.push([{
                    key: 'Access-Control-Allow-Origin',
                    value: isAllowed ? requestOrigin : false
                }]);
            headers.push([{
                    key: 'Vary',
                    value: 'Origin'
                }]);
        }
        return headers;
    }
    applyHeaders(headers, res) {
        for (var i = 0, n = headers.length; i < n; i++) {
            var header = headers[i];
            if (header) {
                if (Array.isArray(header)) {
                    this.applyHeaders(header, res);
                }
                else if (header.key === 'Vary' && header.value) {
                    (0, vary_1.default)(res, header.value);
                }
                else if (header.value) {
                    res.setHeader(header.key, header.value);
                }
            }
        }
    }
    configureMethods() {
        var methods = this.options.methods;
        methods = this.headerOptionToString(methods);
        return {
            key: 'Access-Control-Allow-Methods',
            value: methods
        };
    }
    configureCredentials() {
        if (this.options.credentials === true) {
            return {
                key: 'Access-Control-Allow-Credentials',
                value: 'true'
            };
        }
        return null;
    }
    configureAllowedHeaders(req) {
        var allowedHeaders = this.headerOptionToString(this.options.allowedHeaders);
        var headers = [];
        if (!allowedHeaders) {
            allowedHeaders = req.headers['access-control-request-headers'];
            headers.push([{
                    key: 'Vary',
                    value: 'Access-Control-Request-Headers'
                }]);
        }
        if (allowedHeaders && allowedHeaders.length) {
            headers.push([{
                    key: 'Access-Control-Allow-Headers',
                    value: allowedHeaders
                }]);
        }
        return headers;
    }
    configureExposedHeaders() {
        var headers = this.headerOptionToString(this.options.exposedHeaders);
        if (!headers) {
            return null;
        }
        if (headers && headers.length) {
            return {
                key: 'Access-Control-Expose-Headers',
                value: headers
            };
        }
        return null;
    }
    configureMaxAge() {
        var maxAge = (typeof this.options.maxAge === 'number' || this.options.maxAge) && this.options.maxAge.toString();
        if (maxAge && maxAge.length) {
            return {
                key: 'Access-Control-Max-Age',
                value: maxAge
            };
        }
        return null;
    }
    handleRequest(req, res) {
        var headers = [];
        const method = req.method && req.method.toUpperCase && req.method.toUpperCase();
        if (method === 'OPTIONS') {
            headers.push(this.configureOrigin(req));
            headers.push(this.configureCredentials());
            headers.push(this.configureMethods());
            headers.push(this.configureAllowedHeaders(req));
            headers.push(this.configureMaxAge());
            headers.push(this.configureExposedHeaders());
            this.applyHeaders(headers, res);
            if (this.options.preflightContinue) {
            }
            else {
                res.statusCode = this.options.optionsSuccessStatus || 204;
                res.setHeader('Content-Length', '0');
                res.end();
                return false;
            }
        }
        else {
            headers.push(this.configureOrigin(req));
            headers.push(this.configureCredentials());
            headers.push(this.configureExposedHeaders());
            this.applyHeaders(headers, res);
        }
        return true;
    }
}
exports.default = CorsManager;
//# sourceMappingURL=cors.js.map