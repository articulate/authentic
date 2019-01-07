const Boom     = require('boom')
const gimme    = require('@articulate/gimme')
const jwks     = require('jwks-rsa')
const jwt      = require('jsonwebtoken')

const {
  applyTo: thrush, curryN, dissoc, partialRight, pipe, prop
} = require('ramda')

const { promisify, rename, tapP } = require('@articulate/funky')

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

const stripBearer = token => 
  token ? token.replace(/^[B|b]earer /, '') : null

const enforce = token =>
  token || Promise.reject(new Error('null token not allowed'))

const unauthorized = err =>
  Promise.reject(Boom.wrap(err, 401))

const factory = opts => {
  const clients    = {}
  const verifyOpts = dissoc('issWhitelist', opts)

  const cacheClient = iss => client =>
    clients[iss] = client

  const checkIss = token =>
    opts.issWhitelist.indexOf(token.payload.iss) > -1 ||
    Promise.reject(new Error(`iss '${token.payload.iss}' not in issWhitelist`))

  const getSigningKey = ({ header: { kid }, payload: { iss } }) =>
    clients[iss]
      ? clients[iss](kid)
      : buildClient(iss.replace(/\/$/, '') + wellKnown)
        .then(cacheClient(iss))
        .then(thrush(kid))

  const verify = pipe(stripBearer, curryN(2, partialRight(promisify(jwt.verify), [ verifyOpts ])))

  const authentic = token =>
    Promise.resolve(token)
      .then(tapP(enforce))
      .then(stripBearer)
      .then(decode)
      .then(tapP(checkIss))
      .then(getSigningKey)
      .then(chooseKey)
      .then(verify(token))
      .catch(unauthorized)

  return authentic
}

module.exports = factory
