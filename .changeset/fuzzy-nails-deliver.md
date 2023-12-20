---
"@articulate/authentic": major
---

Allows a generic type, which must extend `JWT`, to be defined on Authentic's signature for automatic type casting.

### Breaking changes:

Bumps [jose](https://github.com/panva/jose) to [V5](https://github.com/panva/jose/releases/tag/v5.0.0). This upgrade includes a breaking change, now only LTS Node versions will be supported by `@articulate/authentic`, so the minimum supported version now is `v18`.
