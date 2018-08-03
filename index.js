const zlib = require('zlib')
const request = require('request')
const omit = require('lodash.omit')

const debug = require('debug')('express-filestack')

/**
 * Express middleware to pipe multipart/form-data requests to Filestack API.
 *
 * @param {*} opts
 */
module.exports = function (opts) {
  let uploadUrl = process.env.FILESTACK_UPLOAD_URL

  if (opts.uploadUrl) {
    uploadUrl = opts.uploadUrl
  }

  return function (req, res, next) {
    // The upload won't work without www in the URL ¯\_(ツ)_/¯
    if (uploadUrl.indexOf('https://www.filestackapi.com/api') !== 0) {
      throw new Error('Please use a valid Filestack upload url')
    }

    if (opts.omitHeaders && Array.isArray(opts.omitHeaders)) {
      req.headers = omit(req.headers, opts.omitHeaders)
    }

    const options = {
      url: uploadUrl,
      headers: {
        'Accept-Encoding': 'gzip'
      },
      encoding: null
    }

    debug('piping request with the following headers %o', req.headers)

    const stream = req.pipe(request.post(options))

    stream.on('response', function (resp) {
      const chunks = []

      debug('gathering response')

      resp.on('data', function (chunk) {
        chunks.push(chunk)
      })

      resp.on('end', function () {
        const buffer = Buffer.concat(chunks)

        debug('decoding gzip response')

        zlib.gunzip(buffer, function (err, decoded) {
          if (err) {
            throw new Error('Cannot decompress gzip response')
          }

          res.file = decoded.toString()

          debug('file upload response %O', res.file)

          next()
        })
      })
    })
  }
}
