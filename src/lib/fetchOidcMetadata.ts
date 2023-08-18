import { isBoom, unauthorized } from '@hapi/boom'
import { getRequest } from './httpRequest'

interface IssuerMetadata {
  issuer: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  jwks_uri: string;
  [key: string]: unknown;
}

const addHttps = (url: string) =>
  /^http[s]?:\/\//.test(url)
    ? url
    : 'https://' + url

const fetchOidcMetadata = async (issuerUri: string, timeout?: number) => {
  try {
    const issuerUrl = addHttps(issuerUri)
    const url = new URL('/.well-known/openid-configuration', issuerUrl)
    const response = await getRequest(url, timeout) as IssuerMetadata

    if (!response || !response.jwks_uri)
      throw unauthorized(`Invalid OIDC settings for ${url.toString()}`)

    return response
  } catch (error) {
    if (isBoom(error)) throw error

    throw unauthorized((error as Error)?.message || `There was an error while fetching the OIDC metadata for ${issuerUri}`)
  }
}

export default fetchOidcMetadata
