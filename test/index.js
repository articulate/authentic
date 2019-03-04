const { expect } = require('chai')
const jwt        = require('jsonwebtoken')
const nock       = require('nock')
const property   = require('prop-factory')

const bad                = require('./fixtures/bad-iss')
const keys               = require('./fixtures/keys')
const oidc               = require('./fixtures/oidc')
const token              = require('./fixtures/token')
const capitalBearerToken = 'Bearer ' + token
const lowerBearerToken   = 'bearer ' + token

const { issuer } = oidc


const badIss = jwt.decode(bad, { complete: true }).payload.iss

const wellKnown = '/.well-known/openid-configuration'

describe('authentic', () => {
  const res = property()

  beforeEach(() => {
    nock(issuer).get(wellKnown).once().reply(200, oidc)
    nock(issuer).get('/v1/keys').once().reply(200, keys)
  })

  nock.disableNetConnect()

  afterEach(() =>
    nock.cleanAll()
  )

  describe('setup with minimal valid configuration options', () => {
    const authentic = require('..')({
      issWhitelist: [ issuer ],
    })

    describe('with an expired jwt', () => {
      beforeEach(() =>
        authentic(token).catch(res)
      )

      it('booms with a 401', () => {
        expect(res().isBoom).to.be.true
        expect(res().output.statusCode).to.equal(401)
      })
    })
  })

  describe('setup with valid configuration options', () => {
    const authentic = require('..')({
      verify: { ignoreExpiration: true },
      issWhitelist: [ issuer ],
    })

    describe('with a valid jwt', () => {
      beforeEach(() =>
        authentic(token).then(res)
      )

      it('validates the jwt against the jwks', () =>
        expect(res().sub).to.equal('00udjyjssbt2S1QVr0h7')
      )

      it('caches the jwks client', () =>
        expect(res().sub).to.equal('00udjyjssbt2S1QVr0h7')
      )
    })

    describe('with a valid jwt that starts with Bearer', () => {
      beforeEach(() =>
        authentic(capitalBearerToken).then(res)
      )

      it('validates the jwt against the jwks', () =>
        expect(res().sub).to.equal('00udjyjssbt2S1QVr0h7')
      )

      it('caches the jwks client', () =>
        expect(res().sub).to.equal('00udjyjssbt2S1QVr0h7')
      )
    })

    describe('with a valid jwt that starts with bearer', () => {
      beforeEach(() =>
        authentic(lowerBearerToken).then(res)
      )

      it('validates the jwt against the jwks', () =>
        expect(res().sub).to.equal('00udjyjssbt2S1QVr0h7')
      )

      it('caches the jwks client', () =>
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

    describe('with an expired jwt', () => {
      beforeEach(() => {
        const auth = require('..')({
          issWhitelist: [ issuer ],
        })
        auth(token).catch(res)
      })

      it('booms with a 401', () => {
        expect(res().isBoom).to.be.true
        expect(res().output.statusCode).to.equal(401)
      })
    })

    describe('with an invalid iss', () => {
      beforeEach(() =>
        authentic(bad).catch(res)
      )

      it('booms with a 403', () => {
        expect(res().isBoom).to.be.true
        expect(res().output.statusCode).to.equal(403)
      })

      it('includes the invalid iss in the error message', () =>
        expect(res().output.payload.message).to.contain(badIss)
      )
    })

    describe('with a null token', () => {
      beforeEach(() =>
        authentic(null).catch(res)
      )

      it('booms with a 401', () => {
        expect(res().isBoom).to.be.true
        expect(res().output.statusCode).to.equal(401)
      })

      it('mentions that the token was null', () =>
        expect(res().output.payload.message).to.contain('null token')
      )
    })
  })
})
