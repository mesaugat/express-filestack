const zlib = require('zlib')
const request = require('request')

/**
 * Express middleware to pipe multipart/form-data requests to Filestack API.
 *
 * @param {*} opts
 */
module.exports = function (opts) {
  let uploadUrl = process.env.FILESTACK_UPLOAD_URL

  if (opts && opts.uploadUrl) {
    uploadUrl = opts.uploadUrl
  }

  return function (req, res, next) {
    // The upload won't work without www in the URL ¯\_(ツ)_/¯
    if (uploadUrl.indexOf('https://www.filestackapi.com/api') !== 0) {
      throw new Error('Please use a valid Filestack upload url')
    }

    const options = {
      url: uploadUrl,
      headers: {
        'Accept-Encoding': 'gzip'
      },
      encoding: null
    }

    const stream = req.pipe(request.post(options))

    stream.on('response', function (resp) {
      const chunks = []

      resp.on('data', function (chunk) {
        chunks.push(chunk)
      })

      resp.on('end', function () {
        const buffer = Buffer.concat(chunks)

        zlib.gunzip(buffer, function (err, decoded) {
          if (err) {
            throw new Error('Cannot decompress gzip response')
          }

          res.file = decoded.toString()

          next()
        })
      })
    })
  }
}
