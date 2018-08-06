const zlib = require('zlib')
const request = require('request')
const omit = require('lodash.omit')

const debug = require('debug')('express-filestack')

// The upload won't work without www in the URL ¯\_(ツ)_/¯
const FILESTACK_API_BASE_URL = 'https://www.filestackapi.com/api'

/**
 * Express middleware to pipe multipart/form-data requests to Filestack API.
 *
 * @param {*} opts
 */
module.exports = function (opts) {
  const uploadUrl = opts.uploadUrl || process.env.FILESTACK_UPLOAD_URL

  if (opts.debug === true) {
    debug.enabled = true
  }

  return function (req, res, next) {
    const originalHeaders = req.headers

    if (uploadUrl.indexOf(FILESTACK_API_BASE_URL) !== 0) {
      throw new Error('Please supply a valid Filestack upload url')
    }

    if (opts.omitHeaders) {
      if (!Array.isArray(opts.omitHeaders)) {
        throw new Error(`Expected "omitHeaders" to be an Array but recieved ${typeof omitHeaders}`)
      } else {
        req.headers = omit(req.headers, opts.omitHeaders)
      }
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

          res.filestack = decoded.toString()

          debug('file upload response %s', res.filestack)

          // Set headers from the original request
          req.headers = originalHeaders

          next()
        })
      })
    })

    // Do we need to handle the stream error event?
  }
}
