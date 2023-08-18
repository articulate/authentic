import { boomify, unauthorized } from '@hapi/boom'
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose'

import type { Authentic, JWT, Validator } from './types'
import type { JWTPayload, JWTVerifyGetKey } from 'jose'

import fetchOidcMetadata from './lib/fetchOidcMetadata'
import IssWhitelistError from './lib/IssWhitelistError'

const stripBearer = (str: string) => str.replace(/^Bearer /i, '')

const authentic: Authentic = ({
  claimsInError,
  issWhitelist,
  jwks: jwksOpts,
  verify: verifyOpts = {},
}) => {
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
    if (!jwkKeys.has(iss)) {
      const { jwks_uri } = await fetchOidcMetadata(iss, jwksOpts?.timeoutDuration)
      const jwksUrl = new URL(jwks_uri)
      const JWK = createRemoteJWKSet(jwksUrl, jwksOpts)

      jwkKeys.set(iss, JWK)
    }

    const JWK = jwkKeys.get(iss)

    if (!JWK) throw unauthorized(`Unable to retrieve the JWK for ${iss}`)

    return JWK
  }

  const validator: Validator = async token => {
    if (!token || !token.length) throw unauthorized('null token not allowed')

    const strippedToken = stripBearer(token)
    const decoded = decodeOnlyJwt(strippedToken)
    const iss = checkIss(decoded)

    try {
      const JWK = await getJwkKey(iss)
      const { payload } = await jwtVerify(strippedToken, JWK, {
        requiredClaims: ['aud', 'exp', 'iat', 'iss', 'sub'],
        ...verifyOpts,
      })

      return payload as JWT
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
