# `approaches/`: Cognitive Engagement Categories

Five canonical approaches name the *path of arrival* to a region of the graph: **Plan / Inspect / Prioritise / Trace / Reflect**. Each approach captures one cognitive engagement category that a tool or operator brings to the graph. Frameworks (in `frameworks/`) are the named techniques *inside* an approach.

The cartographic framing matters: an approach is a final approach to an airport or coastline, not a strategy choice. You arrive at a region in one of five ways.

## Exports

```ts
import {
  UPG_APPROACHES,
  UPG_APPROACHES_BY_ID,
  UPGApproach,
  UPGApproachId,
  REFLECT_MODES,
  type ReflectMode,
} from '@unified-product-graph/core'
```

- `UPG_APPROACHES`: array of five records, length locked.
- `UPG_APPROACHES_BY_ID`: O(1) lookup by id.
- `UPGApproach`: record shape (id, label, description, question_answered, signature_hint, optional `framework_id_examples`).
- `UPGApproachId`: literal union of the five approach ids.
- `ReflectMode` / `REFLECT_MODES`: the four reflect sub-modes (`assumptions` | `alternatives` | `blind-spots` | `load-bearing`).

## Files

| File | Purpose |
|------|---------|
| `types.ts` | The `UPGApproach` record shape plus runtime contract types (`ApproachBinding`, `ApproachFilter`, `ApproachRun`, `ApproachRuntime`) forward-declared for structured execution. |
| `definitions/index.ts` | The five canonical approach records and the `UPG_APPROACHES_BY_ID` lookup. |

## Start here

1. `definitions/index.ts`: read the five records to understand the surface.
2. `types.ts`: read once you need to integrate with a runtime.

## Companion

The MCP tools `plan` / `inspect` / `prioritise` / `trace` / `reflect` ship as definition lookups. The consuming agent or LLM is the executor. Approaches name the engagement, frameworks supply the technique, and the consumer composes them.
