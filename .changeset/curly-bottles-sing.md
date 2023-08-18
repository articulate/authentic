---
"@articulate/authentic": major
---

Typescript refactor and replace `jsonwebtoken` and `jwks-rsa` in favor of `jose`

The biggest change on this version is the replacement of [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) and [jwks-rsa](https://github.com/auth0/node-jwks-rsa) in favor of [jose](https://github.com/panva/jose). jose exports the same features the other two libraries offer, without adding the extra dependencies previously required (it has zero dependencies!). This change significantly decreases `@authentic` final bundle size, allowing it to also be used in Lambdas.

Before upgrading make sure your app uses the new expected `jwks` and `verify` options (which differ from the old ones).
