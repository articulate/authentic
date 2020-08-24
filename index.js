const axios                 = require('axios')
const merge                 = require('merge')
const Boom                  = require('boom')
const jwks                  = require('jwks-rsa')
const jwt                   = require('jsonwebtoken')
const pick                  = require('lodash.pick')
const { promisify }         = require('util')
const { IssWhitelistError } = require('./lib/errors')
const { rename, tapP }      = require('./lib/helpers')

const wellKnown = '/.well-known/openid-configuration'

const bindFunction = client =>
  promisify(client.getSigningKey.bind(client))

const buildClient = (jwksOpts, url) =>
  axios.get(url)
    .then(res => res.data)
    .then(rename('jwks_uri', 'jwksUri'))
    .then(obj => jwks(Object.assign({}, jwksOpts, obj)))
    .then(bindFunction)

const chooseKey = key =>
  key.publicKey || key.rsaPublicKey

const decode = token =>
  jwt.decode(token, { complete: true })

const enforce = token =>
  token || unauthorized('null token not allowed')

const forbidden = err =>
  Promise.reject(Boom.forbidden(err))

const stripBearer = str =>
  str.replace(/^Bearer /i, '')

const throwIfNull = val =>
  val == null ? Promise.reject('invalid token') : val

const unauthorized = err =>
  Promise.reject(Boom.unauthorized(err))

const deny = val =>
  (val instanceof IssWhitelistError) ? forbidden(val) : unauthorized(val)

const verifyP =
  promisify(jwt.verify)

const jwksOptsDefaults = { jwks: { cache: true, rateLimit: true } }

const factory = options => {
  const clients = {}
  const opts = merge(jwksOptsDefaults, options)
  const {
    verify: verifyOpts = {},
    jwks: jwksOpts
  } = opts

  const throwWithData = data => err => {
    if (Array.isArray(opts.claimsInError)) {
      err.data = pick(data.payload, opts.claimsInError)
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
        .then(fn => fn(kid))

  const jwtVerify = token => key =>
    verifyP(token, key, verifyOpts)

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

  return token =>
    Promise.resolve(token)
      .then(enforce)
      .then(() => token)
      .then(stripBearer)
      .then(authentic)
}

module.exports = factory
