const https = require('https')

const getRequest = (url) =>
  new Promise((resolve, reject) => {
    const httpRequest = https.get(new URL(url), res => {
      const rawData = []

      res.setEncoding('utf8')
      res.on('data', chunk => rawData.push(chunk))
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const errorMsg = res.body || res.statusMessage || `Http Error ${res.statusCode}`
          reject(errorMsg)
        } else {
          try {
            resolve(rawData && JSON.parse(rawData.join('')))
          } catch (err) {
            reject(err)
          }
        }
      })
    })

    httpRequest.on('error', err => reject(err))
    httpRequest.end()
  })

module.exports = { getRequest }
