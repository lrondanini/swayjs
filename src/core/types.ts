

export enum RestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

export class Context {
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
