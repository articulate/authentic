# @articulate/authentic
[![@articulate/authentic](https://img.shields.io/npm/v/@articulate/authentic.svg)](https://www.npmjs.com/package/@articulate/authentic)
[![Build Status](https://travis-ci.org/articulate/authentic.svg?branch=master)](https://travis-ci.org/articulate/authentic)
[![Coverage Status](https://coveralls.io/repos/github/articulate/authentic/badge.svg?branch=master)](https://coveralls.io/github/articulate/authentic?branch=master)

Proper validation of JWT's against JWK's.

## Motivation

The process of validating JWT's against JWK's is [quite involved](https://auth0.com/blog/navigating-rs256-and-jwks/), but at the end of the day, you probably have an auth server with a `/.well-known/openid-configuration` endpoint, and you just want to know if an incoming JWT is valid.  End of story.  You don't want to fumble with parsing the JWT, matching `kid` values, converting certs, or caching JWK's.

Now you don't need to.  Initialize `authentic` with an `issWhitelist`, and you'll receive a function that accepts a JWT and validates it.  The rest is handled for you.

## Usage

```haskell
authentic :: { k: v } -> String -> Promise Boom { k: v }
```

Initialize `authentic` with an options object containing an `issWhitelist` array listing the `token.payload.iss` values you will accept.  For example:

| Provider | Sample `issWhitelist` |
| -------- | ------------------- |
| [Auth0](https://auth0.com/) | `[ 'https://${tenant}.auth0.com/' ]` |
| [Okta](https://www.okta.com/) | `[ 'https://${tenant}.oktapreview.com/oauth2/${appName}' ]` |

**Note:** The urls in the list need to be **exact matches** of the `payload.iss` values in your JWT's.

Any other options passed to `authentic` will be forwarded to `jwt.verify()` for validation and parsing.  [See the list of available options here.](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)

You'll receive a unary function which takes a JWT and returns a `Promise` that resolves with the parsed JWT payload if it is valid, or rejects with a `401` [Boom](https://github.com/hapijs/boom) error if it is invalid.

```js
const authentic = require('@articulate/authentic')({
  issWhitelist: JSON.parse(process.env.ISS_WHITELIST)
})

const handler = req =>
  authentic(req.cookies.token)
    .then(/* the JWT has been validated */)
```
