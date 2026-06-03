# `frameworks/`: Framework Definitions

Declarative records describing each named product technique (RICE, Kano, BMC, AARRR, OKRs, JTBD, North Star, and so on). Self-contained: this directory has no internal dependencies on other spec layers.

A framework is a **lens** layered over canonical entities. RICE adds `reach`, `impact`, `confidence`, and `effort` to a feature. Kano adds `functional_response` and `dysfunctional_response`. These lens-scoped fields live inside the framework's scoring context. They are not promoted onto the universal entity property schema.

## One source, two surfaces: research (internal) and canonical (public)

`definitions/` is the **single source of truth** for framework content. `canonical.ts` is a **generated projection** of it — never hand-edit a framework body in `canonical.ts`.

| Surface | What | Where | Ships in |
|---|---|---|---|
| **Canonical** | The famous, battle-tested frameworks that anchor the public catalog (42 at present). | `canonical.ts` (generated) | `@unified-product-graph/core` (npm + GitHub) |
| **Research** | The full authored library (~182 additional framework definitions), source of truth for everything, used by internal tooling, vocabulary mapping, the shape audit, and tier-1 wiring tests. | `definitions/` (30 category files) | Monorepo only; **excluded** from the `core` mirror via `scripts/sync-oss-repos.sh` |

The public surface ships only the canonical subset. To promote a framework, add its id to the array in `canonical.ts` and run `npm run regen:canonical`; the body is filled from its definition. To edit a published framework, edit its definition in `definitions/` and regenerate. `npm run check:canonical` (`--check`) is the sync gate — wired into core's `prepublishOnly`, it fails if `canonical.ts` has drifted from `definitions/`, so a hand-edit or a stale projection can never be published.

## Exports

```ts
import {
  UPG_FRAMEWORKS,            // canonical records (public surface)
  UPG_FRAMEWORKS_BY_ID,      // O(1) lookup by id
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
