const Boom     = require('boom')
const gimme    = require('@articulate/gimme')
const jwks     = require('jwks-rsa')
const jwt      = require('jsonwebtoken')
const property = require('prop-factory')
const url      = require('url')

const {
  applyTo: thrush, curryN, dissoc, partialRight, prop
} = require('ramda')

const { promisify, rename } = require('@articulate/funky')

const wellKnown = '/.well-known/openid-configuration'

const bindFunction = client =>
  promisify(client.getSigningKey, client)

const buildClient = url =>
  gimme({ url })
    .then(prop('body'))
    .then(rename('jwks_uri', 'jwksUri'))
    .then(jwks)
    .then(bindFunction)

const chooseKey = key =>
  key.publicKey || key.rsaPublicKey

const decode = partialRight(jwt.decode, [{ complete: true }])

const unauthorized = err =>
  Promise.reject(Boom.wrap(err, 401))

const factory = opts => {
  const verifyOpts = dissoc('issWhitelist', opts)

  const checkIss = token =>
    opts.issWhitelist.indexOf(token.payload.iss) > -1
      ? Promise.resolve(token)
      : Promise.reject(new Error(`iss: '${token.payload.iss}' not in issWhitelist`))

  const getKey = property()

  const getSigningKey = ({ header: { kid }, payload: { iss } }) =>
    getKey()
      ? getKey()(kid)
      : buildClient(iss + wellKnown)
        .then(getKey)
        .then(thrush(kid))

  const verify = curryN(2, partialRight(promisify(jwt.verify), [ verifyOpts ]))

  const authentic = token =>
    Promise.resolve(token)
      .then(decode)
      .then(checkIss)
      .then(getSigningKey)
      .then(chooseKey)
      .then(verify(token))
      .catch(unauthorized)

  return authentic
}

module.exports = factory
