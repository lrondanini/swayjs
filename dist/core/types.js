"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = exports.RestMethod = void 0;
var RestMethod;
(function (RestMethod) {
    RestMethod["GET"] = "GET";
    RestMethod["POST"] = "POST";
    RestMethod["PUT"] = "PUT";
    RestMethod["DELETE"] = "DELETE";
    RestMethod["OPTIONS"] = "OPTIONS";
})(RestMethod || (exports.RestMethod = RestMethod = {}));
class Context {
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
exports.Context = Context;
//# sourceMappingURL=types.js.map