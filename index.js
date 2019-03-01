const Boom     = require('boom')
const gimme    = require('@articulate/gimme')
const jwks     = require('jwks-rsa')
const jwt      = require('jsonwebtoken')

const {
  applyTo: thrush, compose, composeP, curryN, isNil, ifElse, merge,
  mergeDeepRight, partialRight, pathEq, prop, replace, when,
} = require('ramda')

const { promisify, rename, tapP } = require('@articulate/funky')

const wellKnown = '/.well-known/openid-configuration'

const bindFunction = client =>
  promisify(client.getSigningKey, client)

const buildClient = (jwksOpts, url) =>
  gimme({ url })
    .then(prop('body'))
    .then(rename('jwks_uri', 'jwksUri'))
    .then(compose(jwks, merge(jwksOpts)))
    .then(bindFunction)

const chooseKey = key =>
  key.publicKey || key.rsaPublicKey

const decode = partialRight(jwt.decode, [{ complete: true }])

const enforce = token =>
  token || Promise.reject(Boom.unauthorized('null token not allowed'))

const forbidden = err =>
  Promise.reject(Boom.forbidden(err))

const isExpired =
  pathEq(['name'], 'TokenExpiredError')

const stripBearer =
  replace(/^Bearer /i, '')

const throwIfNull =
  when(isNil, () => Promise.reject(new Error('invalid token')))

const unauthorized = err =>
  Promise.reject(Boom.unauthorized(err))

const deny =
  ifElse(isExpired, forbidden, unauthorized)

const jwksOptsDefaults = { jwks: { cache: true, rateLimit: true } }

const factory = options => {
  const clients = {}
  const opts = mergeDeepRight(jwksOptsDefaults, options)
  const {
    verify: verifyOpts = {},
    jwks: jwksOpts
  } = opts

  const cacheClient = iss => client =>
    clients[iss] = client

  const checkIss = token =>
    opts.issWhitelist.indexOf(token.payload.iss) > -1 ||
    Promise.reject(new Error(`iss '${token.payload.iss}' not in issWhitelist`))

  const getSigningKey = ({ header: { kid }, payload: { iss } }) =>
    clients[iss]
      ? clients[iss](kid)
      : buildClient(jwksOpts, iss.replace(/\/$/, '') + wellKnown)
        .then(cacheClient(iss))
        .then(thrush(kid))

  const verify = curryN(2, partialRight(promisify(jwt.verify), [ verifyOpts ]))

  const authentic = token =>
    Promise.resolve(token)
      .then(decode)
      .then(throwIfNull)
      .then(tapP(checkIss))
      .then(getSigningKey)
      .then(chooseKey)
      .then(verify(token))
      .catch(deny)

  return composeP(authentic, stripBearer, tapP(enforce))
}

module.exports = factory
