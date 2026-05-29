# `frameworks/`: Framework Definitions

Declarative records describing each named product technique (RICE, Kano, BMC, AARRR, OKRs, JTBD, North Star, and so on). Self-contained: this directory has no internal dependencies on other spec layers.

A framework is a **lens** layered over canonical entities. RICE adds `reach`, `impact`, `confidence`, and `effort` to a feature. Kano adds `functional_response` and `dysfunctional_response`. These lens-scoped fields live inside the framework's scoring context. They are not promoted onto the universal entity property schema.

## Two layers: canonical (public) and research (internal)

| Layer | What | Where | Surfaces |
|---|---|---|---|
| **Canonical** | The 34 famous, battle-tested frameworks that anchor the public catalog. | `canonical.ts` (generated) | `@unified-product-graph/core` (npm + GitHub) |
| **Research** | The fuller library of 182 additional framework definitions, kept in source for internal tooling, vocabulary mapping, and tier-1 wiring tests. | `definitions/` (30 category files) | Monorepo only; **excluded** from `core` mirror via `scripts/sync-oss-repos.sh` |

The public surface ships only the canonical set. Frameworks are promoted from research → canonical one at a time as each is reviewed and validated. Run `scripts/regen-canonical-frameworks.mjs` after editing the canonical ID allowlist.

## Exports

```ts
import {
  UPG_FRAMEWORKS,            // 34 canonical records (public surface)
  UPG_FRAMEWORKS_BY_ID,      // O(1) lookup over the 34
  UPG_FRAMEWORKS_BY_CATEGORY,
  UPG_FRAMEWORK_CATEGORIES,  // category catalog
  UPG_STRUCTURE_PATTERNS,    // structural pattern catalog
  type UPGFramework,
  validateUPGFramework,
} from '@unified-product-graph/core'
```

Internal consumers (vocabulary mapping in `presentation/labels.ts`, tier-1 wiring tests) import directly from `./definitions/index.js` to see the full research library; that path is not re-exported from the package entry point.

## Files

| File | Role |
|------|------|
| `types.ts` | The `UPGFramework` interface. Four layers: data, structure, presentation, education. |
| `categories.ts` | `UPG_FRAMEWORK_CATEGORIES` and `UPG_STRUCTURE_PATTERNS`. |
| `validate.ts` | `validateUPGFramework()`: structural validation for individual records. |
| `canonical.ts` | **Generated**: the 34 canonical framework records. Public surface. |
| `definitions/` | 30 category files holding the full 216-record research library. Internal-only. |

## Start here

1. `types.ts`: read the `UPGFramework` shape.
2. `canonical.ts`: see the v1 public framework set.
3. `definitions/prioritization.ts` (or another category file): see what a full record looks like in the research library.

## Consumer contract

- When rendering an entity **without** a framework, read from `UPG_PROPERTY_SCHEMA[entity_type]` only.
- When rendering an entity **under** a framework, merge `UPG_PROPERTY_SCHEMA[entity_type]` with `framework.data.required_properties[entity_type]`. Framework fields take priority.
- Framework-introduced keys are scoped to the framework and do not appear on the entity in isolation.
