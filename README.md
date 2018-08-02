# express-filestack

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
