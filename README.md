# <img src="./logo.png" width="20" /> swayjs

**Forget what you know about web frameworks, swayjs is different!**

[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]



# Table of contents

* [Project Overview and Status](#project-overview-and-status)
* [Installation and Requirements](#installation-and-requirements)
* [Getting Started](#getting-started)
* [File-system Based Router](#file-system-based-router)
* [Middlewares](#middlewares)
* [Context](#context)
* [Runtime Validators](#runtime-validators-and-transformers)

# Project Overview and Status

### Why?

There are many nodejs web frameworks. Some good, some not. Some performant, some not. One minimalistic, most not. 

If like me you are frustrated by complicated infrastructures deeply coupled with your business logic. Nauseated by endless types and schema definition to properly support data validation and serialization. You are in the right place.

### Status

SwayJS is not ready for production. The source code is still been tested and cleaned up and it's not ready to receive external PRs. 

That said, I would greatly appreciate anyone who would spend 10 minutes to install SwayJS and take it for a spin. I'm sure you wont be disappointed. 


# Installation and Requirements


### Requirements

Despite the name, SwayJS requires typescript. JS will be supported in the future but given the early stage of the project and that not many BE projects require JS, we decided to wait to support JS.

### Installation

```bash
npm install swayjs
```

# Getting Started

This is the structure of a SwayJS project:

```bash
|-yourProjectName/
    |- package.json
    |- main.ts
    |- routes/
```

SwayJS uses a [file-system based router](#File-system-Based-Router) and the routes folder is where your routes will be stored. 

For the main.ts file, this is all you need:

```js
import SwayJs from "swayjs";

const server = await SwayJs.CreateServer({ port: 3000 });

server.run();
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

To specify route parameters you can use square brackets around the name of the route. This can be done with both folder based and file based routes. For example:

```bash
|-routes/
    |- [productId]
          |- index.ts
```

or 

```bash
|-routes/
    |- [productId].ts
```

## Route Interface

Every route must contain and **export** a class that implements the Route interface. This is the Route interface:

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

export default class MyRoute implements Route {
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

# Middlewares

Just like express.js, SwayJS supports middleware functions. A middleware function can be registered as follow:

```js
server.use(async (requestContext: RequestContext) => {    
  return requestContext; //optional - see below
})
```

a middleware function is defined as:

```js
type MiddlewareFunction = (reqContext: RequestContext) => RequestContext | undefined | Promise<RequestContext | undefined>;

```
*NOTE:* You can use RequestContext.getRequest() and RequestContext.getResponse() to access req: IncomingMessage and res: ServerResponse.

If you are familiar with express.js, you may have notice that there is no *next* function in SwayJS.

Middlewares functions are executed according to the order they are registered in the server.

Another important feature is the RequestContext. If you want to attach information/data to requests, you can do so adding resources to the request context. The request context is passed from middleware to middleware till it reaches the request handler. You can read more about contexts [here](#context).


## Branch Middlewares

In case you need to perform a series of operations for a specific route and its subroutes, you can use branch middlewares.

You can add a middleware to specific route(s) by implementing the BranchMiddleware function in a route class:

```js
export default class Router implements Route {
  
  ...
  
  async BranchMiddleware(reqCtx: RequestContext): Promise<RequestContext> | RequestContext;

  ...
}
```

The BranchMiddleware function will be executed as last middleware before the handler function and follows all the rules of a normal middleware.

A BranchMiddleware will be executed for the specific route and all its subroutes. For example, let's assume you have the following routes:

```bash
/users
/users/contacts
/users/contacts/phone
```

If you implement a BranchMiddleware on /users/contacts, this will also run for /users/contacts/phone

*What if I want to run a middleware only for /users/contacts and not for /users/contacts/phone?* 

Well...

```js
export default class Contacts implements Route {
  
  ...
  
  async MyMiddleware(reqCtx: RequestContext): Promise<RequestContext> | RequestContext;


  async Get(reqCtx: RequestContext, queryParameters?: any, routeParams?: RouteParams) {
    this.MyMiddleware(reqCtx);
    
    ...
  }

  ...
}
```

## CORS

SwayJS supports cors out of the box. Cors options can be specified in the server [configuration](#server-configuration) implementing this interface:

```js
interface CorsOptions {
  /**
   * @default '*''
   */
  origin?: StaticOrigin | CustomOrigin | undefined;
  /**
   * @default 'GET,HEAD,PUT,PATCH,POST,DELETE'
   */
  methods?: string | string[] | undefined;
  allowedHeaders?: string | string[] | undefined;
  exposedHeaders?: string | string[] | undefined;
  credentials?: boolean | undefined;
  maxAge?: number | undefined;
  /**
   * @default false
   */
  preflightContinue?: boolean | undefined;
  /**
   * @default 204
   */
  optionsSuccessStatus?: number | undefined;
}
```

# Context

SwayJS has 2 types of contexts: AppContext and RequestContext. Both implement the following interface:

```js
interface xxxContext {
   add(name: string, value: any);
   remove(name: string);
   get(name: string):any;
}
```

## AppContext

AppContext is used to share resource with the whole server. For example, to register a db connection:

```js
const postgresql = new DbConnection();

server.addToAppContext('postgresql', postgresql);
```

The connection will be accessible to every route:

```js
export default class MyRoute implements Route {

  private appContext: AppContext;

  constructor(ctx: AppContext) {
    this.appContext = ctx;    
  }

  async Get(reqCtx: RequestContext, queryParameters?: any, routeParams?: RouteParams) {
    const postgresql:DbConnection = this.appContext,get('postgresql');
    
  }

}
```


## RequestContext

RequestContexts are used to share resources through middlewares to the request handler. See [middlewares](#middlewares) for more details.

RequestContext offers 3 additional functions to the ones described above:

```js
interface RequestContext {
   add(name: string, value: any);
   remove(name: string);
   get(name: string):any;

   getMethod(): RestMethod;
   getRequest(): IncomingMessage;
   getResponse(): ServerResponse
}
```

*getMethod()* is used to access the REST method of the specific request, while *getRequest()* and *getResponse()* are used to access the request and response objects of the specific request.

# Runtime Validators and Transformers

One of the most important features of SwayJS is the validation system. Unlike other validation systems that force you to write types and schema definitions, SwayJS leverages TypeScript’s static typing to provide runtime validation.

For example, to validate a post body for a sign-up form:

```js
export class NewSignup  {
  password: string & ValidationRule.MaxLength<20> & ValidationRule.MinLength<5>;
  email: string & ValidationRule.Format<'email'>;
  url?: string & ValidationRule.Format<'url'>;
}
```

Of course, you can get as fancy as you need with validators. It supports OR and nested objects:

```js
export class PostDetails  {
  title: string & (ValidationRule.Contains<'AAAA'> | ValidationRule.Contains<'BBBB'>);
  details: PostDetails;
}

export class PostDetails  {
  firstName: string & ValidationRule.MinLength<5>;
  multiple?: string[] & ValidationRule.MaxLength<2>;
}
```

### Benchmarks

We benchmarked SwayJS validation system against AJV validators (the validators system that powers FastifyJS making it much faster than other frameworks). 

According to our tests, SwayJS validators performs 15% faster than AJV (let me add - without having to deal with AJV's horrible schemas definitions!).

## Validation Rules

The simplest validation definition is:

```js
title?: string;
```

This defines a property named title, optional and of type string. You can also use AND and OR operators (better know as intersection and union types):

```js
title: string | number;
```

Now, title must be of type string or number.

## List of Validation Rules

### - ValidationRule.MaxLength\<number>

Can be applied to strings and arrays. Verifies that the max length of a string or an array is less or equal to number. Example:

```js
title: string & ValidationRule.MaxLength<10>
```

title must be a string with no more than 10 characters.

### - ValidationRule.MinLength\<number>

Can be applied to strings and arrays. Verifies that the min length of a string or an array is greater or equal to number. 

Example:

```js
names: string[] & ValidationRule.MinLength<5>
```

names must be an array of strings with at least 5 elements. 

### - ValidationRule.Max\<number>

Can be applied to numbers. Verifies that a number is less of equal to number. Example:

```js
price: number & ValidationRule.Max<10>
```

title must be a string with no more than 10 characters.

### - ValidationRule.Min\<number>

Can be applied to numbers. Verifies that a number is greater of equal to number. Example:

Example:

```js
price: number & ValidationRule.Min<5>
```

names must be an array of strings with at least 5 elements. 

### - ValidationRule.Contains\<string | number | boolean>

Can be applied to strings and arrays. Verifies that a string contains the specified string, number or boolean. For arrays, the array must contain at least one element as specified by string, number or boolean.

Example:

```js
title: string & ValidationRule.Contains<'hello'>
```

title must contain the word 'hello'.

### - ValidationRule.Format\<string>

Can be applied to strings to verify its correct format. For example:

```js
email: string & ValidationRule.Format<'email'>
```

Currently supported formats are:

- url
- uri
- uri-template
- uri-reference
- email
- uuid
- hostname
- date
- date-time
- time
- duration
- idn-email

You can also specify a regular expression to match your specific needs. For example:

```js
uuid: string & ValidationRule.Format</^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i>
```

### - ValidationRule.Custom\<string>

You can also use custom validator functions. To register a validator function: 

```js
const myValidatorFunction = (s:string): boolean => {};

server.addCustomValidationFunction('myFunction', myValidatorFunction);
```

and the use it as:

```js
name: string & ValidationRule.Custom<'myFunction'>
```




# Server Configuration

To use HTTPS, just specify key and cert options. _hideLogo_ and _hideRoutesListOnLoad_ can be used to control what the server logs on startup.

```js
interface SwayJsConfiguration {
  port: number;
  key?: string;
  cert?: string;
  routesFolder?: string;
  corsOptions?: CorsOptions;
  noCorsMode?: boolean;
  hideLogo?: boolean;
  hideRoutesListOnLoad?: boolean;
}
```

## Custom Logger

To use your preferred logger, you can create a class that implements the following interface:

```js
 interface ILogger {
  log(message: any, ...optionalParams: any[]): void;
  fatal(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
  warn(message: any, ...optionalParams: any[]): void;
  debug(message: any, ...optionalParams: any[]): void;
  verbose(message: any, ...optionalParams: any[]): void;
}
```

and pass it as a parameter to the SwayJS construtor as follow:

```js
const myLogger = new MyLogger();
const server = await SwayJs.CreateServer({ port: 3000 }, myLogger);
```

# Dependency Injections
# Observer Pattern



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