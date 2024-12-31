export var RestMethod;
(function (RestMethod) {
    RestMethod["GET"] = "GET";
    RestMethod["POST"] = "POST";
    RestMethod["PUT"] = "PUT";
    RestMethod["DELETE"] = "DELETE";
    RestMethod["OPTIONS"] = "OPTIONS";
})(RestMethod || (RestMethod = {}));
export class Context {
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
//# sourceMappingURL=types.js.map