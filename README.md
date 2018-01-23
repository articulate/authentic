# @articulate/authentic

Proper validation of JWT's against JWK's.

## Motivation

The process of validating JWT's against JWK's is [quite involved](https://auth0.com/blog/navigating-rs256-and-jwks/), but at the end of the day, you've probably got an auth server with a `/.well-known/openid-configuration` endpoint, and you just want to know if an incoming JWT is valid.  End of story.  You don't want to fumble with parsing the JWT, matching `kid` values, converting certs, and caching JWK's.

Now you don't need to.  Initialize `authentic` with your base `oidcURI`, and you'll receive a function that accepts a JWT and validates it.  The rest is handled for you.

## Usage

```haskell
authentic :: { k: v } -> String -> Promise Boom { k: v }
```

Initialize `authentic` with an options object containing your base `oidcURI`.  For example:

| Provider | Suggested `oidcURI` |
| -------- | ------------------- |
| [Auth0](https://auth0.com/) | `https://${tenant}.auth0.com` |
| [Okta](https://www.okta.com/) | `https://${tenant}.oktapreview.com/oauth2/${appName}` |

**Note:** Don't include the `/.well-known/openid-configuration` in your `oidcURI`, as `authentic` will add that for you.

Any other options passed to `authentic` will be forwarded to `jwt.verify()` for validation and parsing.  [See the list of available options here.](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)

You'll receive a unary function which takes a JWT and returns a `Promise` that resolves with the parsed JWT payload if it is valid, or rejects with a `401` [Boom](https://github.com/hapijs/boom) error if it is invalid.

```js
const authentic = require('@articulate/authentic')({ oidcURI: process.env.OIDC_URI })

const handler = req =>
  authentic(req.cookies.token)
    .then(/* the JWT has been validated */)
```
