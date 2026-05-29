# `intelligence/` Graph Health & Guidance

Analytics, construction guidance, and the anti-pattern catalog. This is where the spec expresses *what good looks like* for a UPG graph at a given product stage, and what configurations to avoid.

Imports from `shapes/` only. Nothing here renders. Everything here measures or advises.

## Exports

```ts
import {
  // anti-patterns
  UPG_ANTI_PATTERNS,
  getAntiPattern,
  // benchmarks
  UPG_BENCHMARKS,
  // domain guides
  UPG_DOMAIN_GUIDES,
  getDomainGuide,
  // stage coercion
  coerceProductStage,
  // condition types
  type IntelligenceCondition,
} from '@unified-product-graph/core'
```

## Files

| File | Role |
|------|------|
| `intelligence.ts` | `IntelligenceCondition`: structured predicates that describe graph-state checks consumed by benchmarks, anti-patterns, and domain guides. |
| `anti-patterns.ts` | Catalog of named anti-patterns (orphan entities, missing bridges, over-decomposed splits, dead-end branches). Each carries a condition and a remediation hint. |
| `benchmarks/` | Per-stage health scoring: stage-appropriate entity counts, ratios, relationship density, and domain activation targets. |
| `domain-guides.ts` | `UPG_DOMAIN_GUIDES`: construction patterns per domain. Anchor entities, recommended creation sequence, named patterns, required bridges, and anti-patterns to watch for. |
| `product-stage-coercion.ts` | `coerceProductStage()`: normalises external stage labels onto the canonical UPG stage enum. |
| `evaluator.ts` | The runtime that turns `IntelligenceCondition` predicates into yes/no checks against a document. |

## Mental model

Intelligence answers *"is this graph healthy for what it claims to be, and what should be built next?"* If a question is computed from the graph rather than declared on it, it belongs here.

## Start here

1. `anti-patterns.ts`: the catalog of things that look wrong.
2. `domain-guides.ts`: the catalog of how to fill out a domain well.
3. `benchmarks/`: stage-appropriate health targets.
