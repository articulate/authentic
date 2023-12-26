import { JWTPayload, JWTVerifyOptions, RemoteJWKSetOptions } from 'jose'

export interface JWT extends JWTPayload {
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

export type Validator<T extends JWT = JWT> = (token: string) => Promise<T>

export type Authentic<T extends JWT = JWT> = (opts: AuthenticOpts) => Validator<T>
