import { boomify, unauthorized } from '@hapi/boom'
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose'

import type { Authentic, AuthenticOpts, JWT, Validator } from './types'
import type { JWTPayload, JWTVerifyGetKey } from 'jose'

import fetchOidcMetadata from './lib/fetchOidcMetadata'
import IssWhitelistError from './lib/IssWhitelistError'

const stripBearer = (str: string) => str.replace(/^Bearer /i, '')

const authentic:Authentic = <T extends JWT>({
  claimsInError,
  issWhitelist,
  jwks: jwksOpts,
  verify: verifyOpts = {},
}: AuthenticOpts) => {
  const jwkKeys = new Map<string, JWTVerifyGetKey>()

  const decodeOnlyJwt = (token: string) => {
    try {
      return decodeJwt(token)
    } catch (err) {
      throw boomify(err as Error, { statusCode: 401 })
    }
  }

  const checkIss = ({ iss }: JWTPayload) => {
    if (!iss) throw new IssWhitelistError(`invalid or missing iss claim`)
    if (!issWhitelist.includes(iss)) throw new IssWhitelistError(`iss '${iss}' not in issWhitelist`)

    return iss
  }

  const getJwkKey = async (iss: string): Promise<JWTVerifyGetKey> => {
    let JWK = jwkKeys.get(iss)

    if (!JWK) {
      const { jwks_uri } = await fetchOidcMetadata(iss, jwksOpts?.timeoutDuration)
      const jwksUrl = new URL(jwks_uri)
      JWK = createRemoteJWKSet(jwksUrl, jwksOpts)
      jwkKeys.set(iss, JWK)
    }

    return JWK
  }

  const validator: Validator<T> = async token => {
    if (!token || !token.length) throw unauthorized('null token not allowed')

    const strippedToken = stripBearer(token)
    const decoded = decodeOnlyJwt(strippedToken)

    try {
      const iss = checkIss(decoded)
      const JWK = await getJwkKey(iss)
      const { payload } = await jwtVerify(strippedToken, JWK, verifyOpts)

      return payload as T
    } catch (error) {
      const boomError = error instanceof IssWhitelistError
        ? boomify(error, { statusCode: 403 })
        : boomify(error as Error, { override: false, statusCode: 401 })

      if (Array.isArray(claimsInError) && decoded) {
        boomError.data = Object.fromEntries(
          claimsInError.map(key => [key, decoded[key]])
        )
      }

      throw boomError
    }
  }

  return validator
}

export default authentic
