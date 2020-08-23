const axios    = require('axios')
const Boom     = require('boom')
const jwks     = require('jwks-rsa')
const jwt      = require('jsonwebtoken')
const { promisify } = require('util')
const { IssWhitelistError } = require('./lib/errors')
const { rename, tapP } = require('./lib/helpers')

const {
  applyTo: thrush, compose, composeP, curryN, is, isNil, ifElse,
  merge, mergeDeepRight, partialRight, pick, prop, replace, when
} = require('ramda')

const wellKnown = '/.well-known/openid-configuration'

const bindFunction = client =>
  promisify(client.getSigningKey.bind(client))

const buildClient = (jwksOpts, url) =>
  axios.get(url)
    .then(prop('data'))
    .then(rename('jwks_uri', 'jwksUri'))
    .then(compose(jwks, merge(jwksOpts)))
    .then(bindFunction)

const chooseKey = key =>
  key.publicKey || key.rsaPublicKey

const decode = partialRight(jwt.decode, [{ complete: true }])

const enforce = token =>
  token || unauthorized('null token not allowed')

const forbidden = err =>
  Promise.reject(Boom.forbidden(err))

const stripBearer =
  replace(/^Bearer /i, '')

const throwIfNull =
  when(isNil, () => Promise.reject('invalid token'))

const unauthorized = err =>
  Promise.reject(Boom.unauthorized(err))

const deny =
  ifElse(is(IssWhitelistError), forbidden, unauthorized)

const jwksOptsDefaults = { jwks: { cache: true, rateLimit: true } }

const factory = options => {
  const clients = {}
  const opts = mergeDeepRight(jwksOptsDefaults, options)
  const {
    verify: verifyOpts = {},
    jwks: jwksOpts
  } = opts

  const throwWithData = data => err => {
    if (Array.isArray(opts.claimsInError)) {
      err.data = pick(opts.claimsInError, data.payload)
    }

    throw err
  }

  const cacheClient = iss => client =>
    clients[iss] = client

  const checkIss = token =>
    opts.issWhitelist.indexOf(token.payload.iss) > -1 ||
    Promise.reject(new IssWhitelistError(`iss '${token.payload.iss}' not in issWhitelist`))

  const getSigningKey = ({ header: { kid }, payload: { iss } }) =>
    clients[iss]
      ? clients[iss](kid)
      : buildClient(jwksOpts, iss.replace(/\/$/, '') + wellKnown)
        .then(cacheClient(iss))
        .then(thrush(kid))

  const jwtVerify = curryN(2, partialRight(promisify(jwt.verify), [ verifyOpts ]))

  const verify = token => decoded =>
    getSigningKey(decoded)
      .then(chooseKey)
      .then(jwtVerify(token))
      .catch(throwWithData(decoded))

  const authentic = token =>
    Promise.resolve(token)
      .then(decode)
      .then(throwIfNull)
      .then(tapP(checkIss))
      .then(verify(token))
      .catch(deny)

  return composeP(authentic, stripBearer, tapP(enforce))
}

module.exports = factory
