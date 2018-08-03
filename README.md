# express-filestack

[![npm](https://img.shields.io/npm/v/express-filestack.svg)](https://www.npmjs.com/package/express-filestack)
[![npm](https://img.shields.io/npm/dt/express-filestack.svg)](https://www.npmjs.com/package/express-filestack)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Express middleware to pipe multipart/form-data (upload) requests to [Filestack](https://www.filestack.com/).

## Why?

This middleware allows you to create an intermediary endpoint for `multipart/form-data` requests which uploads your file to Filestack.

## Install

```sh
npm install express-filestack
```

```sh
yarn add express-filestack
```

## Usage

Set your Filestack [upload URL](https://www.filestack.com/docs/api/file/#store) as an environment variable.

```sh
FILESTACK_UPLOAD_URL='https://www.filestackapi.com/api/store/S3?key=4kBkTCq6QTqjkcprFyUN4c'`
```

On completion the middleware will attach a `filestack` key to the express response object. It can be accessed as `res.filestack`. The key will contain a strigified JSON object if the upload is succcessful.

**Note: For cases when the API key is wrong, `res.filestack` will contain a response string and not stringified JSON.**

```js
const express = require('express')
const filestack = require('express-filestack')

const app = express()

app.post('/uploads', filestack, (req, res) => {
  try {
    // Successful response will have a stringified JSON from Filestack
    // '{"url": "https://cdn.filestackcontent.com/vP3jekLSdahlMH1g47vy", "size": 4950, "type": "image/png", "filename": "Screen Shot 2018-08-02 at 8.40.25 PM.png"}'
    const data = JSON.parse(res.filestack)

    res.json({ data })
  } catch (err) {
    // An uncsuccessful response string as a response
    // Use an error middleware here or return the response from Filestack
    res.json({ error: res.filestack })
  }
})

app.listen(5000, () => console.log('Example app listening on port 5000!'));
```

## Caveat

The name of the `input` field should be set as `fileUpload`.

```html
<form action="/uploads" method="post" enctype="multipart/form-data">
  <input type="file" name="fileUpload">
</form>
```

## Options

### uploadUrl

Set your Filestack [upload URL](https://www.filestack.com/docs/api/file/#store) by passing it through the middleware. This option can only be a string.

```js
const uploadUrl = 'https://www.filestackapi.com/api/store/S3?key=4kBkTCq6QTqjkcprFyUN4c'

app.post('/uploads', filestack({ uploadUrl }), (req, res) => {
  res.json({
    data: JSON.parse(res.filestack)
  })
})
```

### omitHeaders

If you have application specific headers set in the original request omit those headers being sent to Filestack. This option should be an array of string(s). `omitHeaders` is useful if you don't want to send authorization headers that is needed for your application and does not need to be piped to Filestack for security reasons.

```js
const uploadUrl = 'https://www.filestackapi.com/api/store/S3?key=4kBkTCq6QTqjkcprFyUN4c'
const omitHeaders = [ 'authorization', 'x-something' ]

app.post('/uploads', filestack({ uploadUrl, omitHeaders }), (req, res) => {
  res.json({
    data: JSON.parse(res.filestack)
  })
})
```

### debug

When set to `true`, debug logs will be enabled. Or you can set `DEBUG=express-filestack` environment variable to see all debugging information.

```js
app.post('/uploads', filestack({ debug: true }), (req, res) => {
  res.json({
    data: JSON.parse(res.filestack)
  })
})
```

## Contributing

Contributions are welcome. If you encounter any problem, file an issue [here](https://github.com/mesaugat/express-filestack/issues/new).

## License

[MIT](LICENSE)
