const Boom     = require('boom')
const gimme    = require('@articulate/gimme')
const jwks     = require('jwks-rsa')
const jwt      = require('jsonwebtoken')
const property = require('prop-factory')

const {
  applyTo: thrush, curryN, dissoc, partialRight, path, prop, tap
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
  const verifyOpts = dissoc('configUri', opts)

  const getKey = property()

  const getSigningKey = kid =>
    getKey()
      ? getKey()(kid)
      : buildClient(opts.configUri + wellKnown)
        .then(getKey)
        .then(thrush(kid))

  const verify = curryN(2, partialRight(promisify(jwt.verify), [ verifyOpts ]))

  const authentic = token =>
    Promise.resolve(token)
      .then(decode)
      .then(path(['header', 'kid']))
      .then(getSigningKey)
      .then(chooseKey)
      .then(verify(token))
      .catch(unauthorized)

  return authentic
}

module.exports = factory
