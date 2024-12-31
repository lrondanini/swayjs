export default class Logger {
    constructor(logManager) {
        this.logManager = logManager;
    }
    log(message, ...optionalParams) {
        if (this.logManager) {
            this.logManager.log(message, optionalParams);
        }
        else {
            console.log(message, ...optionalParams);
        }
    }
    fatal(message, ...optionalParams) {
        if (this.logManager) {
            this.logManager.error(message, optionalParams);
        }
        else {
            console.error(message, ...optionalParams);
        }
    }
    error(message, ...optionalParams) {
        if (this.logManager) {
            this.logManager.error(message, optionalParams);
        }
        else {
            console.error(message, ...optionalParams);
        }
    }
    warn(message, ...optionalParams) {
        if (this.logManager) {
            this.logManager.warn(message, optionalParams);
        }
        else {
            console.warn(message, ...optionalParams);
        }
    }
    debug(message, ...optionalParams) {
        if (this.logManager) {
            this.logManager.debug(message, optionalParams);
        }
        else {
            console.debug(message, ...optionalParams);
        }
    }
    verbose(message, ...optionalParams) {
        if (this.logManager) {
            this.logManager.verbose(message, optionalParams);
        }
        else {
            console.log(message, ...optionalParams);
        }
    }
}
//# sourceMappingURL=logger.js.map