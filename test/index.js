const { expect } = require('chai')
const nock       = require('nock')
const property   = require('prop-factory')

const keys  = require('./fixtures/keys')
const oidc  = require('./fixtures/oidc')
const token = require('./fixtures/token')

const { issuer: configUri } = oidc

const authentic = require('..')({ configUri, ignoreExpiration: true })

describe('authentic', () => {
  const res = property()

  beforeEach(() => {
    nock(configUri).get('/.well-known/openid-configuration').reply(200, oidc)
    nock(configUri).get('/v1/keys').reply(200, keys)
  })

  nock.disableNetConnect()

  afterEach(() =>
    nock.cleanAll()
  )

  describe('with a valid jwt', () => {
    beforeEach(() =>
      authentic(token).then(res)
    )

    it('validates the jwt against the jwks', () =>
      expect(res().sub).to.equal('00udjyjssbt2S1QVr0h7')
    )
  })

  describe('with an invalid jwt', () => {
    beforeEach(() =>
      authentic('invalid').catch(res)
    )

    it('booms with a 401', () => {
      expect(res().isBoom).to.be.true
      expect(res().output.statusCode).to.equal(401)
    })
  })
})
