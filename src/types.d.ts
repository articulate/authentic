import { JWTPayload, JWTVerifyOptions, RemoteJWKSetOptions } from 'jose'

export interface JWT extends JWTPayload {
  aud: string
  exp: number
  iat: number
  iss: string
  sub: string
  cid?: number | string
  scp?: Array<string>
  uid?: number
}

export type JWKSOpts = RemoteJWKSetOptions

export type VerifyOpts = JWTVerifyOptions

export interface AuthenticOpts {
  claimsInError?: string[]
  issWhitelist: string[]
  jwks?: JWKSOpts
  verify?: VerifyOpts
}

export interface Validator {
  (token: string): Promise<JWT>
}

export type Authentic = (opts: AuthenticOpts) => Validator

export default Authentic
