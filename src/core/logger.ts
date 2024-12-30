
export interface ILogger {
  log(message: any, ...optionalParams: any[]) : void;
  fatal(message: any, ...optionalParams: any[]) : void;
  error(message: any, ...optionalParams: any[]) : void;
  warn(message: any, ...optionalParams: any[])  : void;
  debug(message: any, ...optionalParams: any[]) : void;
  verbose(message: any, ...optionalParams: any[]) : void;
}

export default class Logger {
  private logManager: ILogger;

  constructor(logManager?: ILogger) {
    this.logManager = logManager;
  }

  public log(message: any, ...optionalParams: any[]): void {
    if(this.logManager) {
      this.logManager.log(message, optionalParams);
    } else {
      console.log(message, ...optionalParams);
    }
  }

  public fatal(message: any, ...optionalParams: any[]): void {
    if(this.logManager) {
      this.logManager.error(message, optionalParams);
    } else {
      console.error(message, ...optionalParams);
    }
  }

  public error(message: any, ...optionalParams: any[]): void {
    if(this.logManager) {
      this.logManager.error(message, optionalParams);
    } else {
      console.error(message, ...optionalParams);
    }
  }

  public warn(message: any, ...optionalParams: any[]): void {
    if(this.logManager) {
      this.logManager.warn(message, optionalParams);
    } else {
      console.warn(message, ...optionalParams);
    }
  }

  public debug(message: any, ...optionalParams: any[]): void {
    if(this.logManager) {
      this.logManager.debug(message, optionalParams);
    } else {
      console.debug(message, ...optionalParams);
    }
  }

  public verbose(message: any, ...optionalParams: any[]): void {
    if(this.logManager) {
      this.logManager.verbose(message, optionalParams);
    } else {
      console.log(message, ...optionalParams);
    }
  }
}