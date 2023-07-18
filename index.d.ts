declare module '@articulate/authentic' {

  namespace Authentic {
    interface JWT {
      // Standard JWT claims
      aud: string
      cid?: number | string
      exp: number
      iat: number
      iss: string
      jti?: number
      scp?: Array<String>
      sub: string
      uid?: number
      [key: string]: any
    }

    interface VerifyOpts {
      algorithms?: string[]
      audience?: string | RegExp | Array<string | RegExp>
      clockTimestamp?: number
      clockTolerance?: number
      issuer?: string | string[]
      ignoreExpiration?: boolean
      ignoreNotBefore?: boolean
      jwtid?: string
      subject?: string
      maxAge?: string
    }

    interface JWKSOpts {
      cache?: boolean
      rateLimit?: boolean
      timeout?: number
    }

    interface AuthenticOpts {
      issWhitelist: string[]
      jwks?: JWKSOpts
      verify?: VerifyOpts
    }

    interface Validator {
      (token: string): Promise<Authentic.JWT>
    }
  }

  function Authentic(opts: Authentic.AuthenticOpts): Authentic.Validator

  export = Authentic
}
