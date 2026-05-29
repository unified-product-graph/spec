# `presentation/`: How Things Look

Presentation concerns. Applied on read, never stored in a `.upg` file. This directory holds the cosmetic and display-layer types: human-readable labels, role-based lenses, and the concentric-ring grouping of domains.

The rule: a `.upg` file is portable across tools. Nothing in this directory may leak into the persisted document.

## Exports

```ts
import {
  // labels (Rosetta Stone)
  UPG_TYPE_LABELS,
  UPG_TYPE_ALIASES,
  resolveLabel,
  // lenses
  UPG_LENSES,
  getLens,
  getVisibleTypes,
  // domain rings
  UPG_DOMAIN_RINGS,
  getRingForDomain,
} from '@unified-product-graph/core'
```

## Files

| File | Role |
|------|------|
| `labels.ts` | The framework vocabulary map. For every entity type, the canonical label plus alternate labels and framework-specific labels (the Rosetta Stone). Powers `resolveLabel()` and `UPG_TYPE_ALIASES`. |
| `lenses.ts` | Role-based view configurations for PM, Engineer, Designer, Growth, and other roles. `getLens()` returns the lens record. `getVisibleTypes()` returns the entity types a lens reveals. |
| `domain-rings.ts` | The concentric-ring grouping of the 36 domains. Used by visualisers to lay domains out from core to periphery. |

## Mental model

Presentation answers *"how should this be shown to a human?"* If it disappears the moment the file is closed, it lives here.

## Start here

1. `labels.ts`: see how a single entity type can carry many human-readable names across frameworks.
2. `lenses.ts`: see how role-based filtering is expressed.
3. `domain-rings.ts`: see how the 36 domains group into a small set of rings.
