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
* [Runtime Validators](#Runtime-Validators-(Super-fast))


## Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 18 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install swayjs
```

## File-system Based Router


Swayjs is the first web framework to adopt a file-system based router similar to NextJS. When a file is added to the routes directory it's automatically available as a route. 

## Runtime Validators (Super-fast) 

Swayjs comes with a completelly new validation system. This feature enables developers to ensure type safety in their applications, leveraging TypeScript’s static typing while also providing runtime validation. Instead of defining additional schemas, you can simply utilize the pure TypeScript type itself.

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