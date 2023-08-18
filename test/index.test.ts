import * as jose from 'jose'
import * as nock from 'nock'

const spyCreateRemoteJWKSet = jest.spyOn(jose, 'createRemoteJWKSet')

import authentic from '../src/index'
import * as keys from './fixtures/keys.json'
import * as oidc from './fixtures/oidc.json'

const bad = 'eyJraWQiOiJEYVgxMWdBcldRZWJOSE83RU1QTUw1VnRUNEV3cmZrd2M1U2xHaVd2VXdBIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHVkanlqc3NidDJTMVFWcjBoNyIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9iYWQtaXNzLmNvbSIsImF1ZCI6IjBvYWRqeWs1MjNobFpmeWIxMGg3IiwiaWF0IjoxNTE2NjM3MDkxLCJleHAiOjE1MTY2NDA2OTEsImp0aSI6IklELmM4amh6b2t5MGZGTlByOExfU0NycnBnVFRVeUFvY3RIdjY5T0tTbWY1R0EiLCJhbXIiOlsicHdkIl0sImlkcCI6IjAwb2NnNHRidTZGSzJEaDVHMGg3Iiwibm9uY2UiOiIyIiwiYXV0aF90aW1lIjoxNTE2NjM3MDkxLCJ0ZW5hbnRJZCI6ImQ0MmUzM2ZkLWYwNWUtNGE0ZS05MDUwLTViN2IyZTgwMDgzNCJ9.Senilj3Z8Z99b-UVnnxwWKjYIn4jNrE-BmZAuR7Qb3nkxS7N-r7WnAQ-4vuqtD5Fyy-1zOFUxoO6jyMvhWbhNlPmYaBQk7InKZU6ABayrijfv7OJSQKzs0Q7EQbgtW4T27Gqp6G4Rp9l7O472lgwapTV_L2IUqYNP7aC3FAFcqmpP_KFyeKj-zcwil6aszPgxzMA3Rp33BqQfuhIJKSYqWQT6pkDXkjM3pLxaHRfrRahQ2F0M190iCvBJMc4b82TVoQQu5uJbb1mD97wwlSvMFYCHN_51g9IY5BabZcOv4h0T3-XqFxPNbS8PZVfBikumkhqD5b4zjA-3ddgPw2GkA'
const httpsMissingToken = 'eyJraWQiOiIzZEs0LUM1cmVWRktKUGVUU2FBUE5zLXA0MWtiV1VET0JYRjNYUUhYamFrIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHVkanlqc3NidDJTMVFWcjBoNyIsInZlciI6MSwiaXNzIjoiYXV0aGVudGljLmFydGljdWxhdGUuY29tLyIsImF1ZCI6IjBvYWRqeWs1MjNobFpmeWIxMGg3IiwiaWF0IjoxNTE2NjM3MDkxLCJleHAiOjE1MTY2NDA2OTEsImp0aSI6IklELmM4amh6b2t5MGZGTlByOExfU0NycnBnVFRVeUFvY3RIdjY5T0tTbWY1R0EiLCJhbXIiOlsicHdkIl0sImlkcCI6IjAwb2NnNHRidTZGSzJEaDVHMGg3Iiwibm9uY2UiOiIyIiwiYXV0aF90aW1lIjoxNTE2NjM3MDkxLCJ0ZW5hbnRJZCI6ImQ0MmUzM2ZkLWYwNWUtNGE0ZS05MDUwLTViN2IyZTgwMDgzNCJ9.inuggb9ZZSdwLYMr0t5uTGP_wV3Y-ZC11xpwgU4ltU6YyE3jwZKr_XNXVs7qjzZoCmuE_Ubk2mnub491BUtye2L8RnU3kN1_HW9sEotu7X8WDt-avQ1-NlQY_G4W2pEmD-RYLM0lNCEXnwQUGyLqhhZkZ-vCOkJUGDYCttgNk25TPTcGI_Ro26BdrPW31BAUgj1KzVVs8c5316uacEV-2yS9jDIcjm0_3RoxeINwibfNwthNiYn18tMdy_wPJA4BTaDVep2wdrYoJMnFTl0h2ayIxBrFkzZPYSImCbHEuBgIkV4xHf_Ipulgyvf1CGrv7_EGiXuXOu-jPSm4WZvoVg'
const httpOnlyIssToken = 'eyJrdHkiOiJSU0EiLCJlIjoiQVFBQiIsInVzZSI6InNpZyIsImtpZCI6IngzNFpkQW1LTEprNHpoZ1pEZ2tmc2dpekl4UjZiVE1IN05NVUh4NGk0a0EiLCJhbGciOiJSUzI1NiIsIm4iOiJySUd4bmtjVTVRS29SZkh0U0RhS1F1b3JjMmdobXR4M0dYSVE5TTltaGxGeDV4bDJiU2NnRXRnQXBFeERaVVNLMGxjUmhZVHRQQmFYc0ZCSl9LNTZRVkgyVDdiRmpyOTJHMUdZMjVKc2QyMjVzNjVZUVhEY0NEbGJyeGNyTHV5akJrRll3M0Ywa0pHVlRuaEdnVGJmZlNaQzc1VTd3U056Y1lETDFxZnlla0JFaENBYTA1RmNuVFE2eHlHTGpNMGYybl9xZXprdU8tY1ZZV3hYMkppRzVQdjNLb3p3cjhzV2g3UTNvdUhTMFhQYU11eWZ5Q0o4WlU5WVZrcThDQVE1bFUzN29QdHU3UU53SnljdTd5N21HdUItZlBCNGU0S2tnQk5QeXRfVE1XamVJc2IwQy0zN0ZpcDQ1aUU0NFFnTFRGejQtNmlGbmF4bjF0SXN1cXdiWncifQ.eyJpc3MiOiJodHRwOi8vYXV0aGVudGljLmFydGljdWxhdGUuY29tLyIsImlhdCI6MTUxNjYzNzA5MSwiZXhwIjoxNTE2NjQwNjkxLCJhdWQiOiIwb2FkanlrNTIzaGxaZnliMTBoNyIsInN1YiI6IjAwdWRqeWpzc2J0MlMxUVZyMGg3IiwianRpIjoiSUQuYzhqaHpva3kwZkZOUHI4TF9TQ3JycGdUVFV5QW9jdEh2NjlPS1NtZjVHQSIsImFtciI6InB3ZCIsImlkcCI6IjAwb2NnNHRidTZGSzJEaDVHMGg3Iiwibm9uY2UiOiIyIiwiYXV0aF90aW1lIjoiMTUxNjYzNzA5MSIsInRlbmFudElkIjoiZDQyZTMzZmQtZjA1ZS00YTRlLTkwNTAtNWI3YjJlODAwODM0In0.j0KjrH1-TTcF2lV5RfCuM_DhCmPmHn0X2_SRBEht2mQs7_-0L0vg6ydXrwRGCIn6xMIzWzSShdUUlYYEUV5-ktfvcQREAqY-h7KUNRY_hylYc2O58xQfd7DwfaQFsBsobmJHuLZHarxcKrvIue7v57kmbWvd6s6JrjMKWyt1eTQA6S6C2tfsWEvp21KXug6xm_B5UWNbmmD-iLPcl0p-8Hv2axmA-_za3u_mwiHs-gzw3FLEPsWRfc4Lkqyge6pxIR0uVEoo0fqfJVTYink4qvln8DqYpo0oH5ga6nKzzQnpsPMp6AgKEE0ra7BY6hAZhVkntfrcCKNeBEXqQ6wqGw'
const missingIssClaimToken = 'eyJraWQiOiJEYVgxMWdBcldRZWJOSE83RU1QTUw1VnRUNEV3cmZrd2M1U2xHaVd2VXdBIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHVkanlqc3NidDJTMVFWcjBoNyIsInZlciI6MSwiYXVkIjoiMG9hZGp5azUyM2hsWmZ5YjEwaDciLCJpYXQiOjE1MTY2MzcwOTEsImV4cCI6MTUxNjY0MDY5MSwianRpIjoiSUQuYzhqaHpva3kwZkZOUHI4TF9TQ3JycGdUVFV5QW9jdEh2NjlPS1NtZjVHQSIsImFtciI6WyJwd2QiXSwiaWRwIjoiMDBvY2c0dGJ1NkZLMkRoNUcwaDciLCJub25jZSI6IjIiLCJhdXRoX3RpbWUiOjE1MTY2MzcwOTEsInRlbmFudElkIjoiZDQyZTMzZmQtZjA1ZS00YTRlLTkwNTAtNWI3YjJlODAwODM0In0.T5p2i5uX2ZqaeeTU4G7Sa99-tM3ePuhO83biGVwuAVD2-UfomK-VBueoqkq72TyzI1oSToqq1nhrHhHnNkKs4rV8MtxaFWyIbf8Nlu1dBK19IXOGwQ9gUto1rkLyYxSJPCPxL7yujJ8RdnGg-aCxyy2PZtfOeTYLaGl2tf44_NWgu_d-fFKjTN1e020PeBxpHx6fJqCKfbBDv0L09cUX-4nbvZPtvnQdjH0oeBzPJmJWK6pY05F609WWnr9-JigcnvE-FntxHRKTfL1BVbGHNMsp-0waKHIAWjVajaX8NMLE9Y0Ydroj4EHBMxvmJB_971Z_-pcJeweNrjL13pkmYw'
const missingSubClaimToken = 'eyJraWQiOiIzWWNxRkZVbmxVVXB4VnZWeklQWGZwNkJZWUtUckpHdmNmTjVTTklJNDRzIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGhlbnRpYy5hcnRpY3VsYXRlLmNvbS8iLCJ2ZXIiOjEsImF1ZCI6IjBvYWRqeWs1MjNobFpmeWIxMGg3IiwiaWF0IjoxNTE2NjM3MDkxLCJleHAiOjE1MTY2NDA2OTEsImp0aSI6IklELmM4amh6b2t5MGZGTlByOExfU0NycnBnVFRVeUFvY3RIdjY5T0tTbWY1R0EiLCJhbXIiOlsicHdkIl0sImlkcCI6IjAwb2NnNHRidTZGSzJEaDVHMGg3Iiwibm9uY2UiOiIyIiwiYXV0aF90aW1lIjoxNTE2NjM3MDkxLCJ0ZW5hbnRJZCI6ImQ0MmUzM2ZkLWYwNWUtNGE0ZS05MDUwLTViN2IyZTgwMDgzNCJ9.Tjr4wGlMNsw1FXUSvz0uPtvuMyfoawrBFwtVjrjjxT8eODTog5PEAVdx3TiWa3ibRF5qIGClEZAVs0rNm-26C68CCALR5eVfWfWTLSt3bBlnIJ3zgWO2bPHESwkhYqdronvZkhgqwEgKbpBPfgYUVlQgr6wnOtegwvTrNMPQG0JIR5-naYDeis4DFXO3dG0J7In3d10l9A3o5AeFTMp5yjSyqQzoz7NUMy_38gBxK72CSMT2NOn_yEezUWHzWa4rQ0btT8HsSpYcLpoKwC7JMRUqydx4i-RytFex-W9YAUWh_zu6oSHpSJOrBAbycDz0C5DN6XtyazGZ6FIb8tfvcA'
const token = 'eyJraWQiOiJEYVgxMWdBcldRZWJOSE83RU1QTUw1VnRUNEV3cmZrd2M1U2xHaVd2VXdBIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHVkanlqc3NidDJTMVFWcjBoNyIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9hdXRoZW50aWMuYXJ0aWN1bGF0ZS5jb20vIiwiYXVkIjoiMG9hZGp5azUyM2hsWmZ5YjEwaDciLCJpYXQiOjE1MTY2MzcwOTEsImV4cCI6MTUxNjY0MDY5MSwianRpIjoiSUQuYzhqaHpva3kwZkZOUHI4TF9TQ3JycGdUVFV5QW9jdEh2NjlPS1NtZjVHQSIsImFtciI6WyJwd2QiXSwiaWRwIjoiMDBvY2c0dGJ1NkZLMkRoNUcwaDciLCJub25jZSI6IjIiLCJhdXRoX3RpbWUiOjE1MTY2MzcwOTEsInRlbmFudElkIjoiZDQyZTMzZmQtZjA1ZS00YTRlLTkwNTAtNWI3YjJlODAwODM0In0.NEVqz-jJIyaEgho3uQYOvWC52s_50AV--FHwBWm9BftucQ5G4bSHL7szeaPc3HT0VrhFUntRLlJHzw7pZvRJG2WExj6HJi-Ug3LDwQOj47Gf_ywlEydBAQz7u98JK2ZJcCP16-lIOM1J-fUz-SpFqI4RcO5MLiiEPnMqsXS-EkPd8Y27G64PnHnNjaY3sLrOc9peeD5Xh82TSjeMFFAPpiYNtTCixnfZeQCCtxOCPhiDYAwDSxaLbrOcDAYdO0ytKQ9dBfFoY0AzJNqgJUOPVeeC_AgEJeLIaSKVJAFqZAB8t5VagvVGIqcu7TaMCOmOZx_5A8Xc9JVmRoKDAMlizQ'

const badIss = jose.decodeJwt(bad).iss
const decodedToken = jose.decodeJwt(token)

const capitalBearerToken = 'Bearer ' + token
const lowerBearerToken = 'bearer ' + token
const malformedBearerToken = 'Bearer' + token.slice(0, 200)

const { issuer } = oidc
const wellKnown = '/.well-known/openid-configuration'

describe('authentic', () => {
  nock.disableNetConnect()

  let wellKnownScope: nock.Scope
  let keysScope: nock.Scope

  afterEach(() =>
    nock.cleanAll()
  )

  describe('valid well-known configuration', () => {
    const authenticValidator = authentic({ issWhitelist: [ issuer ] })

    beforeEach(() => {
      wellKnownScope = nock(issuer).get(wellKnown).once().reply(200, oidc)
      keysScope = nock(issuer).get('/v1/keys').once().reply(200, keys)
    })

    describe('setup with minimal valid configuration options', () => {
      describe('with an expired jwt', () => {
        it('booms with a 401', () =>
          expect(authenticValidator(token)).rejects.toMatchObject({
            isBoom: true,
            name: 'JWTExpired',
            message: '"exp" claim timestamp check failed',
            output: {
              statusCode: 401
            },
          })
        )
      })
    })

    describe('setup with invalid claimsInError value', () => {
      const authenticValidator = authentic({
        issWhitelist: [ issuer ],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        claimsInError: 'sub'
      })

      describe('with an expired jwt', () => {
        it('booms with a 401', () =>
          expect(authenticValidator(token)).rejects.toMatchObject({
            isBoom: true,
            name: 'JWTExpired',
            message: '"exp" claim timestamp check failed',
            output: {
              statusCode: 401
            },
          })
        )
      })
    })

    describe('setup with claimsInError set to a list of claim(s)', () => {
      const authenticValidator = authentic({
        issWhitelist: [issuer],
        claimsInError: ['iss', 'sub']
      })

      describe('with an expired jwt', () => {
        it('booms with a 401', () =>
          expect(authenticValidator(token)).rejects.toMatchObject({
            data: {
              iss: decodedToken.iss,
              sub: decodedToken.sub,
            },
            isBoom: true,
            name: 'JWTExpired',
            message: '"exp" claim timestamp check failed',
            output: {
              statusCode: 401
            },
          })
        )
      })
    })

    describe('setup with valid configuration options', () => {
      const authenticValidator = authentic({
        issWhitelist: [ issuer ],
        verify: {
          currentDate: new Date('2018-01-22T16:04:51.000Z')
        },
      })

      describe('with a valid jwt', () => {
        it('validates the jwt against the jwks', async () => {
          await expect(authenticValidator(token)).resolves.toHaveProperty('sub', '00udjyjssbt2S1QVr0h7')
          expect(keysScope.isDone()).toBeTruthy()
          expect(wellKnownScope.isDone()).toBeTruthy()
        })

        it('caches the jwks client', async () => {
          await expect(authenticValidator(token)).resolves.toHaveProperty('sub', '00udjyjssbt2S1QVr0h7')
          expect(keysScope.isDone()).toBeFalsy() // The JWK was cached on the first test
          expect(wellKnownScope.isDone()).toBeFalsy()
        })
      })

      describe('with a valid jwt that is missing protocol in iss claim', () => {
        const authenticValidator = authentic({
          issWhitelist: [issuer.replace('https://', '')],
          verify: {
            currentDate: new Date('2018-01-22T16:04:51.000Z')
          },
        })

        it('validates the jwt against the jwks', async() => {
          await expect(authenticValidator(httpsMissingToken)).resolves.toHaveProperty('sub', '00udjyjssbt2S1QVr0h7')
          expect(keysScope.isDone()).toBeTruthy()
          expect(wellKnownScope.isDone()).toBeTruthy()
        })

        it('caches the jwks client', async() => {
          await expect(authenticValidator(httpsMissingToken)).resolves.toHaveProperty('sub', '00udjyjssbt2S1QVr0h7')
          expect(keysScope.isDone()).toBeFalsy() // The JWK was cached on the first test
          expect(wellKnownScope.isDone()).toBeFalsy()
        })
      })

      describe('with a valid jwt that has http:// protocol in iss claim', () => {
        const httpIssuer = issuer.replace('https://', 'http://')
        const authenticValidator = authentic({
          issWhitelist: [httpIssuer],
          verify: {
            currentDate: new Date('2018-01-22T16:04:51.000Z')
          },
        })

        beforeEach(() => {
          keysScope = nock(httpIssuer).get('/v1/keys').once().reply(200, keys)
          wellKnownScope = nock(httpIssuer).get(wellKnown).once().reply(200, {
            ...oidc,
            jwks_uri: oidc.jwks_uri.replace('https://', 'http://')
          })
        })

        it('validates the jwt against the jwks', async() => {
          await expect(authenticValidator(httpOnlyIssToken)).resolves.toHaveProperty('sub', '00udjyjssbt2S1QVr0h7')
          expect(keysScope.isDone()).toBeTruthy()
          expect(wellKnownScope.isDone()).toBeTruthy()
        })

        it('caches the jwks client', async() => {
          await expect(authenticValidator(httpOnlyIssToken)).resolves.toHaveProperty('sub', '00udjyjssbt2S1QVr0h7')
          expect(keysScope.isDone()).toBeFalsy()
          expect(wellKnownScope.isDone()).toBeFalsy()
        })
      })

      describe('with a valid jwt that starts with Bearer', () => {
        it('validates the jwt against the jwks', () =>
          expect(authenticValidator(capitalBearerToken)).resolves.toHaveProperty('sub', '00udjyjssbt2S1QVr0h7')
        )
      })

      describe('with a valid jwt that starts with bearer', () => {
        it('validates the jwt against the jwks', () =>
          expect(authenticValidator(lowerBearerToken)).resolves.toHaveProperty('sub', '00udjyjssbt2S1QVr0h7')
        )
      })

      describe('with an invalid jwt', () => {
        it('booms with a 401', () =>
          expect(authenticValidator('invalid')).rejects.toMatchObject({
            isBoom: true,
            name: 'JWTInvalid',
            output: {
              statusCode: 401
            },
          })
        )
      })

      describe('with an expired jwt', () => {
        const authenticValidator = authentic({ issWhitelist: [ issuer ] })

        it('booms with a 401', () =>
          expect(authenticValidator(token)).rejects.toMatchObject({
            isBoom: true,
            name: 'JWTExpired',
            message: '"exp" claim timestamp check failed',
            output: {
              statusCode: 401
            },
          })
        )
      })

      describe('with an invalid iss', () => {
        it('booms with a 403', () =>
          expect(authenticValidator(bad)).rejects.toMatchObject({
            isBoom: true,
            name: 'IssWhitelistError',
            output: {
              statusCode: 403
            },
          })
        )

        it('includes the invalid iss in the error message', () =>
          expect(authenticValidator(bad)).rejects.toHaveProperty('message', `iss '${badIss}' not in issWhitelist`)
        )
      })

      describe('with a null token', () => {
        it('booms with a 401', () =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          expect(authenticValidator(null)).rejects.toMatchObject({
            isBoom: true,
            output: {
              statusCode: 401
            },
          })
        )

        it('mentions that the token was null', () =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          expect(authenticValidator(null)).rejects.toHaveProperty('message', 'null token not allowed')
        )
      })

      describe('with a token missing the ISS claim', () => {
        it('booms with a 403', () =>
          expect(authenticValidator(missingIssClaimToken)).rejects.toMatchObject({
            isBoom: true,
            name: 'IssWhitelistError',
            output: {
              statusCode: 403
            },
          })
        )

        it('mentions that the token is invalid', () =>
          expect(authenticValidator(missingIssClaimToken)).rejects.toHaveProperty('message', 'invalid or missing iss claim')
        )
      })

      describe('with a token missing the sub claim', () => {
        it('booms with a 401', () =>
          expect(authenticValidator(missingSubClaimToken)).rejects.toMatchObject({
            isBoom: true,
            name: 'JWTClaimValidationFailed',
            output: {
              statusCode: 401
            },
          })
        )

        it('mentions that the token is invalid', () =>
          expect(authenticValidator(missingSubClaimToken)).rejects.toHaveProperty('message', 'missing required "sub" claim')
        )
      })

      describe('with a malformed token', () => {
        it('booms with a 401', () =>
          expect(authenticValidator(malformedBearerToken)).rejects.toMatchObject({
            isBoom: true,
            output: {
              statusCode: 401
            },
          })
        )

        it('mentions that the token is invalid', () =>
          expect(authenticValidator(malformedBearerToken)).rejects.toHaveProperty('message', 'Invalid JWT')
        )
      })
    })
  })

  describe('invalid well-known configuration', () => {
    describe('with an unexpected error while fetching the configurations', () => {
      const authenticValidator = authentic({ issWhitelist: [ issuer ] })

      beforeEach(() =>
        wellKnownScope = nock(issuer).get(wellKnown).once().replyWithError('unexpected error')
      )

      it('booms with a 401', () =>
        expect(authenticValidator(token)).rejects.toMatchObject({
          isBoom: true,
          message: 'unexpected error',
          output: {
            statusCode: 401
          },
        })
      )
    })

    describe('with a timeout error while fetching the configuration', () => {
      const authenticValidator = authentic({
        issWhitelist: [ issuer ],
        jwks: {
          timeoutDuration: 100
        }
      })

      beforeEach(() => {
        wellKnownScope = nock(issuer).get(wellKnown).once().delay(500).reply(200, oidc)
        keysScope = nock(issuer).get('/v1/keys').once().reply(200, keys)
      })

      it('booms with a 401', () =>
        expect(authenticValidator(token)).rejects.toMatchObject({
          isBoom: true,
          output: {
            statusCode: 401
          },
        })
      )
    })

    describe('with an empty response while fetching the configuration', () => {
      const authenticValidator = authentic({ issWhitelist: [ issuer ] })

      beforeEach(() => {
        wellKnownScope = nock(issuer).get(wellKnown).once().reply(200, '')
      })

      it('booms with a 401', () =>
        expect(authenticValidator(token)).rejects.toMatchObject({
          isBoom: true,
          output: {
            statusCode: 401
          },
        })
      )
    })

    describe('with a response without the jwk_uri prop while fetching the configuration', () => {
      const authenticValidator = authentic({ issWhitelist: [ issuer ] })

      beforeEach(() => {
        wellKnownScope = nock(issuer).get(wellKnown).once().reply(200, '{}')
      })

      it('booms with a 401', () =>
        expect(authenticValidator(token)).rejects.toMatchObject({
          isBoom: true,
          output: {
            statusCode: 401
          },
        })
      )
    })

    describe('with a malformed JSON in the configuration response', () => {
      const authenticValidator = authentic({ issWhitelist: [ issuer ] })

      beforeEach(() => {
        wellKnownScope = nock(issuer).get(wellKnown).once().reply(200, '{"malformed-json":')
      })

      it('booms with a 401', () =>
        expect(authenticValidator(token)).rejects.toMatchObject({
          isBoom: true,
          output: {
            statusCode: 401
          },
        })
      )
    })

    describe('with well-known configuration 404 - not found', () => {
      const authenticValidator = authentic({ issWhitelist: [ issuer ] })

      beforeEach(() => {
        wellKnownScope = nock(issuer).get(wellKnown).once().reply(404)
        keysScope = nock(issuer).get('/v1/keys').once().reply(200, keys)
      })

      it('booms with a 401', () =>
        expect(authenticValidator(token)).rejects.toMatchObject({
          isBoom: true,
          output: {
            statusCode: 401
          },
        })
      )
    })

    describe('with an error while creating the remote JW set', () => {
      const authenticValidator  = authentic({ issWhitelist: [ issuer ] })

      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        spyCreateRemoteJWKSet.mockImplementation(() => null)

        wellKnownScope = nock(issuer).get(wellKnown).once().reply(200, oidc)
      })

      it('booms with a 401', () =>
        expect(authenticValidator(token)).rejects.toMatchObject({
          isBoom: true,
          output: {
            statusCode: 401
          },
        })
      )
    })
  })
})
