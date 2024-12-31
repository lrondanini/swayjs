import { IncomingMessage, ServerResponse } from 'http';
export class AppContext {
  private props: { [name: string]: any };

  constructor() {
    this.props = {};
  }

  add(name: string, value: any) {
    this.props[name] = value;
  }

  remove(name: string) {
    delete this.props[name];
  }

  get(name: string) {
    return this.props[name];
  }
}

export class RequestContext {
  private props: { [name: string]: any };
  private req: IncomingMessage;
  private res: ServerResponse;

  constructor(req: IncomingMessage, res: ServerResponse) {
    this.req = req;
    this.res = res;
    this.props = {};
  }

  getRequest(): IncomingMessage {
    return this.req;
  }

  getResponse(): ServerResponse {
    return this.res;
  }

  add(name: string, value: any) {
    this.props[name] = value;
  }

  remove(name: string) {
    delete this.props[name];
  }

  get(name: string) {
    return this.props[name];
  }
}
