---
"@articulate/authentic": major
---

Typescript refactor and replace `jsonwebtoken` and `jwks-rsa` in favor of `jose`

The biggest change on this version is the replacement of [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) and [jwks-rsa](https://github.com/auth0/node-jwks-rsa) in favor of [jose](https://github.com/panva/jose). jose exports the same features the other two libraries offer, without adding the extra dependencies previously required (it has zero dependencies!). This change significantly decreases `@authentic` final bundle size, allowing it to also be used in Lambdas.

Also on this new version, JWTs without the following claims will be rejected with a `Boom.unauthorized` error: `['aud', 'exp', 'iat', 'iss', 'sub']`.

Before upgrading make sure your app uses the new expected `jwks` and `verify` options (which differ from the old ones).

### Dual Export of ESM and CJS Bundles

Starting with this new version, Authentic started exporting both an ECMAScript Module (ESM) bundle and a CommonJS (CJS) bundle. This means that applications utilizing either of these architectures can now choose the bundle that best suits their specific use case.
