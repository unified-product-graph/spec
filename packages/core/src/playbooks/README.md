# `playbooks/`: Guided Bootstrap Recipes

Region-anchored bootstrap recipes. A `UPGPlaybook` describes how to populate a region of the graph from its anchor outward: which entities to create in which order, which domain guides to invoke, and which frameworks to apply along the way.

Layer 5 is the executive layer of the spec. Everything below it is declarative (what *is*). Playbooks are procedural (what *to do*).

## Exports

```ts
import {
  UPG_PLAYBOOKS,
  getPlaybookById,
  getCanonicalPlaybookForRegion,
  getPlaybooksForRegion,
  type UPGPlaybook,
  type PlaybookBinding,
  type PlaybookRun,
  type PlaybookFilter,
  type PlaybookRuntime,
} from '@unified-product-graph/core'
```

## Files

| File | Role |
|------|------|
| `types.ts` | `UPGPlaybook` shape (`region`, `is_canonical?`, `framework_id?`, `target_anchor_entity?`, `creation_sequence: Step[]`), plus the `PlaybookRuntime` contract and supporting types. |
| `definitions/index.ts` | The canonical and specialised playbook records. One canonical playbook per region. Multiple specialised playbooks per region permitted, often anchored on a framework (for example, business-model-canvas, AARRR, build-measure-learn). Re-exports `UPG_PLAYBOOKS` and the shared step machinery from `../step-sequence.ts`. |

## Mental model

Playbooks answer *"given everything below this layer, what is the guided journey to populate this region from anchor outward?"*

## Chaining

A step's `next_sequence_on_gap` declares the next playbook (or approach) to run when a gap is detected. For example, `playbook:business-model-bmc` → `playbook:business-pricing`. Playbook-to-playbook composition without hard-coded chains.

## Companion

See `../approaches/README.md` for cognitive engagement categories. Playbooks **create scaffolding entities**. Approaches **walk the graph cognitively**. Frameworks are the named techniques both layers reference.

## Start here

1. `types.ts`: read the `UPGPlaybook` shape and the runtime contract.
2. `definitions/index.ts`: see how canonical and specialised playbooks are assembled.
