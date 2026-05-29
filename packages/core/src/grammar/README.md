# `grammar/`: How Things Behave

The runtime behaviour layer. Grammar holds the rules that govern a UPG graph: what can contain what, what lifecycle phases an entity passes through, what assessment scales exist, how old data migrates forward, and how a document is validated.

Imports from `catalog/`, `shapes/`, and `registry/`. Nothing in this directory is concerned with rendering or framework presentation.

## Exports

```ts
import {
  // hierarchy
  UPG_VALID_CHILDREN,
  getValidChildren,
  canBeChildOf,
  // lifecycles
  getLifecycleForType,
  UPG_ALL_PHASES,
  UPG_ALL_PHASES_SET,
  // scales
  UPG_SCALES,
  getScale,
  type UPGAssessment,
  // migrations
  UPG_MIGRATIONS,
  UPG_EDGE_MIGRATIONS,
  migrateNode,
  migrateEdge,
  // validation
  validateUPGDocument,
  isUPGDocument,
} from '@unified-product-graph/core'
```

## Files

| File | Role |
|------|------|
| `hierarchy.ts` | `UPG_VALID_CHILDREN`: for each parent type, which child types are permitted. Drives add-menus, validation, and tree traversal. |
| `lifecycles.ts` | Per-entity-type lifecycle templates (phase sets and transitions). See `LIFECYCLES.md` for the authoring guide. |
| `scales.ts` | The `UPGAssessment` interface and `UPG_SCALES`: the spec-defined 5-point scales for severity, impact, effort, confidence, and the rest. |
| `enum-scales.ts` | Enum-style scales for assessment fields where a ranked enum (rather than a numeric scale) is the canonical shape. |
| `migrations.ts` | Entity-type and edge-type migration maps plus the `migrateNode` and `migrateEdge` helpers used to forward old documents to the current spec. |
| `validate.ts` | `validateUPGDocument()`: structural document validation. Returns `{ valid, errors[], warnings[] }`. Also exports the `isUPGDocument()` type guard. |
| `slugify.ts` | Shared slug normalisation used by validation and lifecycle resolution. |
| `LIFECYCLES.md` | The lifecycle template authoring guide. Read this before adding a new lifecycle. |

## Mental model

Grammar answers *"what's allowed, what states can things be in, and how does old data upgrade?"* If a rule is needed at read or write time, it lives here.

## Start here

1. `validate.ts`: read what a structural validation actually checks.
2. `hierarchy.ts`: see how parent/child constraints are expressed.
3. `LIFECYCLES.md`: read this before authoring a new lifecycle template.
