# <img src="./logo.png" width="20" /> swayjs

**Forget what you know about web frameworks, swayjs is different!**

[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]

```js
import SwayJs from "swayjs";

const app = express()

const config = {
  port: 3004,
  routesFolder: './src/routes',
}

const server = await SwayJs.CreateServer(config);

server.run();
```

## Table of contents

* [Installation](#Installation)
* [File-system Based Router](#File-system-Based-Router)
* [Runtime Validators](#Runtime-Validators)


## Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 18 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install swayjs
```

# File-system Based Router


SwayJS uses a file-system based router. Instead of defining your route structure via code, you can define your routes using a series of files and directories that represent the route hierarchy of your application.

This brings a number of benefits:

- **Simplicity**: File-based routing is visually intuitive and easy to understand for both new and experienced developers.
- **Organization**: Routes are organized in a way that mirrors the URL structure of your application.
- **Scalability**: As your application grows, file-based routing makes it easy to add new routes and maintain existing ones.
- **Consistency**: File-based routing enforces a consistent structure for your routes, making it easier to maintain and update your application and move from one project to another.

All routes must be placed under the same root directory. By default, SwayJS assumes all the routes to be placed under the **./route** folder but you can use your preferred location using the *routesFolder* configuration property.

A simple example:

```bash
|-routes/
    |- index.ts
    |- products
          |- index.ts
          |- related-products.ts
          |- checkout
                |- index.ts
```

In this example, 
- the root route (/) is served by the *routes/index.ts* file. 
- products information (/products) are served by *routes/products/index.ts*
- checkout information (/products/checkout) are served by *routes/products/checkout/index.ts*

Notice **related-products.ts**. You can specify the endpoint for a route by the name of the file. in this case. related-products.ts would serve */products/related-products*. It's up to you to decide when to use a folder or a file to serve a specific resource.

### Route parameters

To specify route parameters you can use square brackets around the name of the route. This can be done with folder based or file based routes. For example:

```bash
|-routes/
    |- [productId]
          |- index.ts
```

## Route Interface

Every route must contain a class that implements the Route interface. This is the Route interface:

```js
export interface Route {
  skipInputValidation?: boolean;
  skipGetInputValidation?: boolean;
  skipPostInputValidation?: boolean;
  skipPutInputValidation?: boolean;
  skipDeleteInputValidation?: boolean;
  skipPatchInputValidation?: boolean;

  Options?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): any;
  Get?(reqCtx: RequestContext, queryParameters?: any, routeParams?: RouteParams): any;
  Post?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
  Patch?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
  Put?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
  Delete?(reqCtx: RequestContext, body?: any, routeParams?: RouteParams): void;
  BranchMiddleware?(reqCtx: RequestContext): Promise<RequestContext> | RequestContext;
}
```

We will discuss validators, contexts and middlewares later on. For now, a simple implementation for a route that supports only GET and POST methods would look like this:

```js
import { Route, AppContext, RouteParams, RequestContext } from 'swayjs';

export default class Router implements Route {
  private appContext: AppContext;

  constructor(ctx: AppContext) {
    this.appContext = ctx;    
  }
  
  async Get(reqCtx: RequestContext, params: any, routeParams: RouteParams): Promise<any> {
      return {};
  }

  async Post(reqCtx: RequestContext, params: any, routeParams: RouteParams): Promise<string> {
      return '';
  }
}
```

# Middleware

## CORS

# Context

## AppContext

## RequestContext

# Runtime Validators

SwayJS comes with a completelly new validation system. This feature enables developers to ensure type safety in their applications, leveraging TypeScript’s static typing while also providing runtime validation. Instead of defining additional schemas, you can simply utilize the pure TypeScript type itself.

For example, to validate a post body for a signup form:
```js
export class NewSignup  {
  password: string & ValidationRule.MaxLength<20> & ValidationRule.MinLength<5>;
  email: string & ValidationRule.Format<'email'>;
  url?: string & ValidationRule.Format<'url'>;
}
```



* Dependency Injections
* Observer Pattern



[npm-url]: https://www.npmjs.com/package/swayjs
[npm-version-image]: https://badgen.net/npm/v/swayjs
[npm-install-size-image]: https://badgen.net/packagephobia/publish/swayjs
[npm-install-size-url]: https://packagephobia.com/result?p=swayjs


https://opentelemetry.io/docs/languages/js/
https://typia.io/docs/
https://www.npmjs.com/package/swayjs
https://fastify.dev/docs/latest/Reference/ContentTypeParser/
https://blog.bitsrc.io/typescripts-reflect-metadata-what-it-is-and-how-to-use-it-fb7b19cfc7e2
https://fastify.dev/docs/v3.29.x/Reference/Encapsulation/