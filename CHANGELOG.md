# @articulate/authentic

## 4.0.0

### Major Changes

- 5056bad: Allows a generic type, which must extend `JWT`, to be defined on Authentic's signature for automatic type casting.

  ### Breaking changes:

  Bumps [jose](https://github.com/panva/jose) to [V5](https://github.com/panva/jose/releases/tag/v5.0.0). This upgrade includes a breaking change, now only LTS Node versions will be supported by `@articulate/authentic`, so the minimum supported version now is `v18`.

## 3.0.0

### Major Changes

- e0ab92a: Typescript refactor and replace `jsonwebtoken` and `jwks-rsa` in favor of `jose`

  The biggest change on this version is the replacement of [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) and [jwks-rsa](https://github.com/auth0/node-jwks-rsa) in favor of [jose](https://github.com/panva/jose). jose exports the same features the other two libraries offer, without adding the extra dependencies previously required (it has zero dependencies!). This change significantly decreases `@authentic` final bundle size, allowing it to also be used in Lambdas.

  Also, this new version doesn't export `authentic` as a default export anymore, apps using this new version will to import/require `{ authentic } from "@articulate/authentic"` instead.

  Before upgrading make sure your app uses the new expected `jwks` and `verify` options (which differ from the old ones).

  ### Dual Export of ESM and CJS Bundles

  Starting with this new version, Authentic started exporting both an ECMAScript Module (ESM) bundle and a CommonJS (CJS) bundle. This means that applications utilizing either of these architectures can now choose the bundle that best suits their specific use case.

## 2.0.5

### Patch Changes

- 03e1107: Allow cid claim to be a string
