# `registry/`: Identity & Organisation

The registry assigns each entity type a stable identity and places it in the spec's flat domain map. Imports from `catalog/` only.

Two concerns live here, and only these two:

1. **Identity:** every entity type carries an immutable `type_id`, a maturity tag, and a `since` version. Deprecated types record their replacement.
2. **Organisation:** every entity type belongs to exactly one of 36 domains. The domains sit at one level. There is no hierarchy and no tier system.

## Exports

```ts
import {
  // entity meta
  UPG_ENTITY_META,
  UPG_ACTIVE_TYPES,
  UPG_DEPRECATED_TYPES,
  getTypeId,
  getTypeName,
  isDeprecatedType,
  getReplacementType,
  // domains
  UPG_DOMAINS,
  getTypes,
  getDomainForType,
} from '@unified-product-graph/core'
```

## Files

| File | Role |
|------|------|
| `entity-meta.ts` | `UPG_ENTITY_META`: one record per entity type with `name`, `type_id` (immutable), `maturity`, `since`, optional `deprecated_in` and `replacement`. Lookup maps, computed arrays (`UPG_ACTIVE_TYPES`, `UPG_DEPRECATED_TYPES`), and the identity helpers. |
| `domains.ts` | `UPG_DOMAINS`: the 36 domains, each with `id`, `label`, `description`, and `types`. Helpers: `getTypes()`, `getDomainForType()`. |

## Mental model

Registry answers *"where does this type live, what is its stable ID, and is it still current?"* It is not a catch-all. Anything that is not identity or organisation lives in another layer.

## Start here

1. `entity-meta.ts`: read how an entity type's identity is registered.
2. `domains.ts`: read the 36 domains and what each contains.
