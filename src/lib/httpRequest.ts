import { request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'

type HttpRequestOptions = {
  timeout: number
  url: URL
}

interface FetchFunction {
  (url: URL, timeout?: number): Promise<{ [propName: string]: unknown }>
}

const getHttpRequestOptions = ({ url, timeout }: HttpRequestOptions) => ({
  method: 'GET',
  protocol: url.protocol,
  hostname: url.hostname,
  path: url.pathname,
  timeout,
})

export const getRequest: FetchFunction = (url, timeout = 30 * 1000) =>
  new Promise((resolve, reject) => {
    const request = url.protocol === 'https:' ? httpsRequest : httpRequest
    const httpRequestOptions = getHttpRequestOptions({ timeout, url })
    const clientRequest = request(httpRequestOptions, res => {
      const rawData: string[] = []

      res.setEncoding('utf8')
      res.on('data', chunk => rawData.push(chunk))
      res.on('end', () => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          const errorMsg = rawData.join('') || res.statusMessage || `Http Error ${res.statusCode}`
          reject(errorMsg)
        } else {
          try {
            const data = rawData.join('')
            data ? resolve(JSON.parse(data)) : reject(`Error - Empty response received from ${url.toString()}`)
          } catch (err) {
            reject(err)
          }
        }
      })
    })

    clientRequest.on('timeout', () => clientRequest.destroy())
    clientRequest.on('error', err => reject(err))
    clientRequest.end()
  })
