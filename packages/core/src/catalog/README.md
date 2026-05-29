# `catalog/`: What Exists

The catalog enumerates everything that can appear in a UPG document: every entity type and every edge type. Zero imports. Every other layer builds on top of it.

## The two canonical sources

| File | Role |
|------|------|
| `entity-catalog.ts` | The noun catalog. Exports `UPGEntityType` (the union of every active entity type name), `DeprecatedUPGEntityType` (retired names kept for migration), and `AnyUPGEntityType` (union of both). |
| `edge-catalog.ts` | The verb catalog. Exports `UPG_EDGE_CATALOG`: an `as const satisfies` map from each edge key to its definition (`forward_verb`, `reverse_verb`, `classification`, `source_type`, `target_type`). Also exports `UPGEdgeDefinition` and `UPG_WILDCARD_ENDPOINT`. |

These two files are canonical. The edge type union in `shapes/edges.ts`, the property schemas, and the validation rules all derive from them.

## Exports

```ts
import {
  type UPGEntityType,
  type DeprecatedUPGEntityType,
  type AnyUPGEntityType,
  UPG_EDGE_CATALOG,
  type UPGEdgeDefinition,
  UPG_WILDCARD_ENDPOINT,
  UPG_POLYMORPHIC_EDGE_KEYS,
} from '@unified-product-graph/core'
```

## Mental model

Catalog answers the question *"what nouns and verbs exist in the language?"* If a noun or verb is not in this directory, it does not exist in the spec.

## Adding to the catalog

- A new entity type is added by extending `UPGEntityType` and registering metadata in `registry/entity-meta.ts` (stable `type_id`, maturity, domain).
- A new edge type is added by extending `UPG_EDGE_CATALOG`. If either endpoint is the wildcard `'node'`, the key must also be added to `UPG_POLYMORPHIC_EDGE_KEYS`. The spec-integrity test enforces this.

See `../ARCHITECTURE.md` for the full layering and the polymorphic-edge contract.
