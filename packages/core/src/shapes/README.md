# `shapes/`: Structural Primitives

The foundational shapes that every UPG document, node, and edge share. This is the highest-traffic entry surface in the spec. Most consumers start here.

Three interfaces define the entire on-disk format:

- **`UPGBaseNode`**: the shape every entity carries. Universal product-graph fields only. App-specific extensions live in the app's own layer.
- **`UPGEdge`**: the relationship shape. Five fields: `id`, `source`, `target`, `type`, `mapping_confidence`. Verb and classification live in the edge catalog and are looked up at read time.
- **`UPGDocument`**: the portable `.upg` file format.

Imports from `catalog/` only.

## Exports

```ts
import {
  // node
  type UPGBaseNode,
  type UPGMappingConfidence,
  // edge
  type UPGEdge,
  type UPGEdgeType,
  // document
  type UPGDocument,
  type UPGPortfolioDocument,
  type UPGProductStage,
  type UPGCrossEdge,
  type UPGProductArea,
  type UPGPortfolio,
  type UPGOrganization,
  type UPGIntegrity,
} from '@unified-product-graph/core'
```

## Files

| File | Role |
|------|------|
| `base-node.ts` | `UPGBaseNode`: the structural interface every node shares. Also `UPGMappingConfidence`. |
| `edges.ts` | `UPGEdgeType` derived as `keyof typeof UPG_EDGE_CATALOG`. The union updates automatically when the catalog changes. The `UPGEdge` interface (id, source, target, type, mapping_confidence). |
| `document.ts` | `UPGDocument` and the portfolio-shaped variants (`UPGPortfolioDocument`, `UPGCrossEdge`, `UPGProductArea`, `UPGPortfolio`, `UPGOrganization`, `UPGIntegrity`, `UPGProductStage`). |

## Mental model

Shapes answer *"what does a noun, a verb, and a sentence in this language look like?"* These three interfaces are the entire on-disk grammar.

## Start here

1. `base-node.ts`: read this first. It is the shape every entity in the graph carries.
2. `edges.ts`: read the edge shape and how `UPGEdgeType` derives from the catalog.
3. `document.ts`: read the file format and the portfolio variants.

## Invariants

- `UPGBaseNode.type` is `UPGEntityType`. The union is closed, no `| string` widening.
- `UPGEdge.type` is `UPGEdgeType`. The union is closed, no `| string` widening.
- Edges store their endpoints. Verb and classification come from `UPG_EDGE_CATALOG` at read time.
- A `.upg` document contains only data that round-trips across tools. Presentation concerns (labels, lenses, rings) are layered on read.
