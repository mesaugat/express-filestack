const fs = require('fs')
const got = require('got')
const test = require('ava')
const express = require('express')
const FormData = require('form-data')

const filestack = require('./index')

/**
 * Integration tests for express-filestack. Hey it works!
 *
 * As AVA executes the tests in parallel, we need to have different ports for all the express servers.
 */

const REAL_FILESTACK_UPLOAD_URL = process.env.FILESTACK_UPLOAD_URL
const FAKE_FILESTACK_UPLOAD_URL = 'https://www.filestackapi.com/api/store/S3?key=askfIUHK123hk12ROPcxWQ'

test('Middleware should throw an error if Filestack URL is not set', t => {
  const error = t.throws(() => filestack({ uploadUrl: undefined }), Error)

  t.is(error.message, 'Filestack upload url is not set')
})

test('Middleware should thrown an error if omitHeaders is not an array', t => {
  const omitHeaders = '¯\\_(ツ)_/¯'
  const error = t.throws(() => filestack({ omitHeaders, uploadUrl: FAKE_FILESTACK_UPLOAD_URL }), Error)

  t.is(error.message, `Expected "omitHeaders" to be an Array but received ${typeof omitHeaders}`)
})

test('Upload should fail if the API key is invalid', async t => {
  const app = express()

  app.post('/uploads', filestack({ uploadUrl: FAKE_FILESTACK_UPLOAD_URL }), (req, res) => res.send(res.filestack))
  app.listen(7878)

  let form = new FormData()
  form.append('fileUpload', fs.createReadStream('test.png'))

  const res = await got.post('http://localhost:7878/uploads', { body: form })

  t.is(res.body, 'Invalid Application')
})

test('Upload should fail if the API key is valid with invalid input name', async t => {
  const app = express()

  app.post('/uploads', filestack({ uploadUrl: REAL_FILESTACK_UPLOAD_URL }), (req, res) => res.send(res.filestack))
  app.listen(7879)

  let form = new FormData()
  form.append('file', fs.createReadStream('test.png'))

  const res = await got.post('http://localhost:7879/uploads', { body: form })

  t.is(res.body, 'Nothing found to store - pass in data or a url')
})

test('Upload should work if the API key and input name is valid', async t => {
  const app = express()

  app.post('/uploads', filestack({ uploadUrl: REAL_FILESTACK_UPLOAD_URL }), (req, res) => {
    const response = JSON.parse(res.filestack)

    res.json(response)
  })
  app.listen(7880)

  let form = new FormData()
  form.append('fileUpload', fs.createReadStream('test.png'))

  const { body } = await got.post('http://localhost:7880/uploads', { body: form })
  const res = JSON.parse(body)

  t.is(res.filename, 'test.png')
  t.is(res.type, 'image/png')
  t.regex(res.url, /https:\/\/cdn.filestackcontent.com/)
})

test('Omitted headers should be passed on to next middleware after successful file upload', async t => {
  const app = express()

  app.post('/uploads', filestack({ uploadUrl: REAL_FILESTACK_UPLOAD_URL, omitHeaders: ['x-something'] }), (req, res) => {
    // Don't try this in production
    res.json(req.headers)
  })
  app.listen(7881)

  const headers = {
    'x-new': 'new',
    'x-something': 'something'
  }

  let form = new FormData()
  form.append('fileUpload', fs.createReadStream('test.png'))

  const { body } = await got.post('http://localhost:7881/uploads', {
    headers,
    body: form
  })
  const res = JSON.parse(body)

  t.is(res['x-new'], headers['x-new'])
  t.is(res['x-something'], headers['x-something'])
})
