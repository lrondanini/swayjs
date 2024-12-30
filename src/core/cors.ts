/*
This code snippet is based on the "expressjs/cors" project (https://github.com/expressjs/cors) licensed under the MIT License.

for types:  https://github.com/DefinitelyTyped/DefinitelyTyped licensed under the MIT License.
*/

import { IncomingMessage, ServerResponse } from "http";
import vary from 'vary';

export type StaticOrigin = boolean | string | RegExp | Array<boolean | string | RegExp>;

export type CustomOrigin = (
  requestOrigin: string | undefined,
  callback: (err: Error | null, origin?: StaticOrigin) => void,
) => void;

export interface CorsOptions {
  /**
   * @default '*''
   */
  origin?: StaticOrigin | CustomOrigin | undefined;
  /**
   * @default 'GET,HEAD,PUT,PATCH,POST,DELETE'
   */
  methods?: string | string[] | undefined;
  allowedHeaders?: string | string[] | undefined;
  exposedHeaders?: string | string[] | undefined;
  credentials?: boolean | undefined;
  maxAge?: number | undefined;
  /**
   * @default false
   */
  preflightContinue?: boolean | undefined;
  /**
   * @default 204
   */
  optionsSuccessStatus?: number | undefined;
}

export default class CorsManager {
  options: CorsOptions;
  constructor(options?: CorsOptions) {
    if(options) {
      this.options = options;
    } else {
      this.options = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204
      };
    }
    

  }
  private isString(s) {
    return typeof s === 'string' || s instanceof String;
  }


  private headerOptionToString(headerOption: string | string[] | undefined): string | undefined {
    if (this.isString(headerOption)) {
      return headerOption;
    } else if (headerOption) {
      return headerOption.join(',');
    }
    return undefined;
  }

  private isOriginAllowed(origin, allowedOrigin) {
    if (Array.isArray(allowedOrigin)) {
      for (var i = 0; i < allowedOrigin.length; ++i) {
        if (this.isOriginAllowed(origin, allowedOrigin[i])) {
          return true;
        }
      }
      return false;
    } else if (this.isString(allowedOrigin)) {
      return origin === allowedOrigin;
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    } else {
      return !!allowedOrigin;
    }
  }

  private configureOrigin(req) {
    var requestOrigin = req.headers.origin,
      headers = [],
      isAllowed;

    if (!this.options.origin || this.options.origin === '*') {
      // allow any origin
      headers.push([{
        key: 'Access-Control-Allow-Origin',
        value: '*'
      }]);
    } else if (this.isString(this.options.origin)) {
      // fixed origin
      headers.push([{
        key: 'Access-Control-Allow-Origin',
        value: this.options.origin
      }]);
      headers.push([{
        key: 'Vary',
        value: 'Origin'
      }]);
    } else {
      isAllowed = this.isOriginAllowed(requestOrigin, this.options.origin);
      // reflect origin
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

  private applyHeaders(headers, res) {
    for (var i = 0, n = headers.length; i < n; i++) {
      var header = headers[i];
      if (header) {
        if (Array.isArray(header)) {
          this.applyHeaders(header, res);
        } else if (header.key === 'Vary' && header.value) {
          vary(res, header.value);
        } else if (header.value) {
          res.setHeader(header.key, header.value);
        }
      }
    }
  }

  private configureMethods() {
    var methods = this.options.methods;
    methods = this.headerOptionToString(methods);
    return {
      key: 'Access-Control-Allow-Methods',
      value: methods
    };
  }

  private configureCredentials() {
    if (this.options.credentials === true) {
      return {
        key: 'Access-Control-Allow-Credentials',
        value: 'true'
      };
    }
    return null;
  }

  private configureAllowedHeaders(req) {
    var allowedHeaders = this.headerOptionToString(this.options.allowedHeaders);
    var headers = [];

    if (!allowedHeaders) {
      allowedHeaders = req.headers['access-control-request-headers']; // .headers wasn't specified, so reflect the request headers
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

  private configureExposedHeaders() {
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

  private  configureMaxAge() {
    var maxAge = (typeof this.options.maxAge === 'number' || this.options.maxAge) && this.options.maxAge.toString()
    if (maxAge && maxAge.length) {
      return {
        key: 'Access-Control-Max-Age',
        value: maxAge
      };
    }
    return null;
  }


  handleRequest(req: IncomingMessage, res: ServerResponse): boolean {
    var headers = [];
    const method = req.method && req.method.toUpperCase && req.method.toUpperCase();

    if (method === 'OPTIONS') {
      // preflight
      headers.push(this.configureOrigin(req));
      headers.push(this.configureCredentials())
      headers.push(this.configureMethods())
      headers.push(this.configureAllowedHeaders(req));
      headers.push(this.configureMaxAge())
      headers.push(this.configureExposedHeaders())
      this.applyHeaders(headers, res);

      if (this.options.preflightContinue) {
        
      } else {
        // Safari (and potentially other browsers) need content-length 0,
        //   for 204 or they just hang waiting for a body
        res.statusCode = this.options.optionsSuccessStatus;
        res.setHeader('Content-Length', '0');
        res.end();
        return false;
      }
    } else {
      // actual response
      headers.push(this.configureOrigin(req));
      headers.push(this.configureCredentials())
      headers.push(this.configureExposedHeaders())
      this.applyHeaders(headers, res);
    }

    return true;
  }

}
