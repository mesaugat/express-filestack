# express-filestack

[![npm](https://img.shields.io/npm/v/express-filestack.svg)](https://www.npmjs.com/package/express-filestack)
[![npm](https://img.shields.io/npm/dt/express-filestack.svg)](https://www.npmjs.com/package/express-filestack)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Express middleware to pipe multipart/form-data (upload) requests to Filestack.

## Install

```bash
npm install express-filestack
```

```bash
yarn add express-filestack
```

## Usage

```js
const express = require('express')
const filestack = require('express-filestack')

const app = express()

app.use('/uploads', filestack, (req, res) => {
  res.json(res.file)
})

app.listen(5000, () => console.log('Example app listening on port 5000!'));
```

## License

[MIT](LICENSE)
