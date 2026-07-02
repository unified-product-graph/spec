# `@unified-product-graph/core/regions`: Super-Domain Regions (topology only)

Eleven super-domain rollups over the 37 atomic domains in `../registry/domains.ts`. Each region captures **pure graph topology**:

- Entity roster with structural role (anchor, root, hub, container, leaf)
- Intra-domain edges (by `UPG_EDGE_CATALOG` key)
- Boundary edges with direction and target region
- Anchor entity: the one entity that best forces the domain's structural problem
- Shape archetype (`cascade`, `convergent`, `directed-cyclic`, …)
- Composition of atomic domains

## Not in this module

Rendering concerns are absent from the spec on purpose. Pattern assignments, co-rendering scenarios, design implications, and workspace archetypes are **product-level concerns**. A consuming product (for example, Entopo) is free to layer its own rendering lens over these regions. The spec stays topology-only so implementers can build any lens or none at all.

## API

```ts
import {
  UPG_REGIONS,
  getRegion,
  getRegionForEntityType,
} from '@unified-product-graph/core'

// All ten
UPG_REGIONS

// By id
getRegion('discovery_research_validation')

// By entity type
getRegionForEntityType('opportunity') // → region 3
```

## The ten regions

| # | id | Anchor | Shape |
|---|---|---|---|
| 1 | `strategy_outcomes` | `objective` | `cascade` |
| 2 | `users_needs` | `persona` | `convergent` |
| 3 | `discovery_research_validation` | `opportunity` | `directed-cyclic` |
| 4 | `market_competitive` | `competitor` | `tributary` |
| 5 | `experience_design_brand` | `user_journey` | `multi-hierarchy` |
| 6 | `product_delivery` | `feature` | `work-breakdown` |
| 7 | `engineering_platform` | `service` | `dag` |
| 8 | `business_gtm_growth` | `value_proposition` | `multi-hub` |
| 9 | `analytics_data` | `metric` | `polymorphic-target` |
| 10 | `operations_quality` | `incident` | `event-driven` |

## Validation (to add)

A future test suite (`packages/upg-spec/src/__tests__/regions.test.ts`) should assert:

1. Every `entities[].type` is a member of `UPG_TYPES_SET`
2. Every `intra_edges[]` id is a key in `UPG_EDGE_CATALOG`
3. Every `boundary_edges[].edge_id` is a key in `UPG_EDGE_CATALOG`
4. Every `anchor.type` appears in `entities[]` with `role: 'anchor'`
5. Every `composes_atomic_domains[]` id exists in `UPG_DOMAINS`
6. Every `boundary_edges[].crosses_into` is a valid region id
7. The union of all `entities[].type` covers every active UPG entity type (no orphan types)

Gate #7 is the key one. It's the proof that the 10 super-domains cover the full spec.
