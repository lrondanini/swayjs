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
export class RequestLogger {
    constructor(logManager) {
        this.isError = false;
        this.logManager = new Logger(logManager);
        this.startTime = performance.now();
    }
    setError(errorNumber, errorType) {
        this.isError = true;
        this.errorNumber = errorNumber;
        this.errorType = errorType;
    }
    getExecTime() {
        const endTime = performance.now();
        const timeDiff = endTime - this.startTime;
        return timeDiff.toFixed(0) + 'ms';
    }
    getDateTime() {
        const t = new Date();
        var hours = t.getHours();
        var minutes = t.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        var mn = minutes < 10 ? '0' + minutes : minutes;
        var strTime = `${hours}:${mn}:${t.getSeconds()} ${ampm}`;
        return `${t.getDate()}/${t.getMonth()}/${t.getFullYear()} ${strTime}`;
    }
    log(req) {
        const reset = "\x1b[0m";
        const red = "\x1b[31m";
        const green = "\x1b[32m";
        const yellow = "\x1b[33m";
        if (this.isError) {
            const msg = `${reset}${this.getDateTime()} ${red}ERROR ${yellow}[HTTP] ${red}${req.method} ${req.url} ${this.errorNumber} ${this.errorType} ${yellow}${this.getExecTime()}${reset}`;
            this.logManager.error(msg);
        }
        else {
            const msg = `${reset}${this.getDateTime()} ${green}LOG ${yellow}[HTTP] ${green}${req.method} ${req.url} 201 ${yellow}${this.getExecTime()}${reset}`;
            this.logManager.log(msg);
        }
    }
}
//# sourceMappingURL=logger.js.map