# <img src="./logo.png" width="20" /> swayjs

**Forget what you know about web frameworks, swayjs is different**

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
* [Features](#Features)


## Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 18 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install swayjs
```

## Features

[npm-url]: https://www.npmjs.com/package/swayjs
[npm-version-image]: https://badgen.net/npm/v/swayjs
[npm-install-size-image]: https://badgen.net/packagephobia/publish/swayjs
[npm-install-size-url]: https://packagephobia.com/result?p=swayjs