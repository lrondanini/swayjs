export class Observer {
    constructor() {
        this.eventMap = {};
    }
    emit(event, ...args) {
        (this.eventMap[event] ?? []).forEach((cb) => cb(...args));
    }
    on(event, callback) {
        if (!this.eventMap[event]) {
            this.eventMap[event] = new Set();
        }
        this.eventMap[event].add(callback);
    }
    off(event, callback) {
        if (!this.eventMap[event]) {
            return;
        }
        this.eventMap[event].delete(callback);
    }
}
//# sourceMappingURL=observer.js.map