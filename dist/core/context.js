"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContext = exports.AppContext = void 0;
class AppContext {
    constructor() {
        this.props = {};
    }
    add(name, value) {
        this.props[name] = value;
    }
    remove(name) {
        delete this.props[name];
    }
    get(name) {
        return this.props[name];
    }
}
exports.AppContext = AppContext;
class RequestContext {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.props = {};
    }
    getRequest() {
        return this.req;
    }
    getResponse() {
        return this.res;
    }
    add(name, value) {
        this.props[name] = value;
    }
    remove(name) {
        delete this.props[name];
    }
    get(name) {
        return this.props[name];
    }
}
exports.RequestContext = RequestContext;
//# sourceMappingURL=context.js.map