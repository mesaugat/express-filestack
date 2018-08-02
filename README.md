# express-filestack

[![npm](https://img.shields.io/npm/v/express-filestack.svg)](https://www.npmjs.com/package/express-filestack)
[![npm](https://img.shields.io/npm/dt/express-filestack.svg)](https://www.npmjs.com/package/express-filestack)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Express middleware to pipe multipart/form-data (upload) requests to [Filestack](https://www.filestack.com/).

## Install

```bash
npm install express-filestack
```

```bash
yarn add express-filestack
```

## Simple Usage

Set your Filestack [upload URL](https://www.filestack.com/docs/api/file/#store) as an environment variable under the key [FILESTACK_UPLOAD_URL](https://github.com/mesaugat/express-filestack/blob/master/index.js#L10).

```js
const express = require('express')
const filestack = require('express-filestack')

const app = express()

app.use('/uploads', filestack, (req, res) => {
  res.json(res.file)
})

app.listen(5000, () => console.log('Example app listening on port 5000!'));
```

## Alternative Usage

Set your Filestack [upload URL](https://www.filestack.com/docs/api/file/#store) by passing it through the middleware.

```js
const uploadUrl = 'https://www.filestackapi.com/api/store/S3?key=4kBkTCq6QTqjkcprFyUN4c'

app.use('/uploads', filestack({ uploadUrl }), (req, res) => {
  res.json(res.file)
})
```

## License

[MIT](LICENSE)
