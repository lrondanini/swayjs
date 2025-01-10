export class AppContext {
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
export class RequestContext {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.props = {};
    }
    getMethod() {
        return this.req.method.toUpperCase();
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
//# sourceMappingURL=context.js.map