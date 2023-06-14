const http = require('http')
const https = require('https')

const getRequest = (url, timeout = 30 * 1000) =>
  new Promise((resolve, reject) => {
    const urlObject = new URL(url)
    const httpRequestLib = urlObject.protocol === 'https:' ? https : http
    const httpOptions = { method: 'GET', timeout }
    const httpRequest = httpRequestLib.request(urlObject, httpOptions, res => {
      const rawData = []

      res.setEncoding('utf8')
      res.on('data', chunk => rawData.push(chunk))
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const errorMsg = res.body || res.statusMessage || `Http Error ${res.statusCode}`
          reject(errorMsg)
        } else {
          try {
            const data = rawData.join('')
            data ? resolve(JSON.parse(data)) : reject(`Error - Empty response received from ${url}`)
          } catch (err) {
            reject(err)
          }
        }
      })
    })

    httpRequest.on('timeout', () => httpRequest.destroy())
    httpRequest.on('error', err => reject(err))
    httpRequest.end()
  })

module.exports = { getRequest }
