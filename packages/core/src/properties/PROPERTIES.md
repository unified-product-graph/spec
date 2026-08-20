# Property Shapes: Canonical Reference

Authoritative guide to which property keys have a canonical shape across the spec and which ones legitimately vary by domain. The spec uses **surgical canonicalisation**: shared base interfaces are not extracted; instead, canonical shapes are named and used consistently.

Every `*Properties` interface in `properties/domains/` should match this reference when it uses one of the listed keys.

## Writing a property doc: two tiers

A property's JSDoc is the vocabulary of record, so every downstream surface inherits it: the hover card on the reference page, the entity reference itself, `get_entity_schema` in an agent's context window, and the `.d.ts` a consumer reads in their editor. Those surfaces want different amounts of the same thing, and a single block written for the most demanding one is wrong for all the others. A capacity doc that filled a reviewer's viewport is what prompted the split.

**Write the contract as the summary. Write everything else under `@remarks`.**

```ts
/**
 * How many occupants ONE INSTANCE of the surface holds at once. Absent means
 * unbounded, `0` means a reserved place nothing may occupy.
 *
 * @remarks
 * Intent, not observation: a region declared `capacity: 1` keeps saying 1 even
 * after someone finds it rendering four. The drift belongs on a debt item, and
 * editing the number to match the bug would destroy the only record a gap
 * exists.
 */
capacity?: number
```

**The summary is the contract.** What the property means, and the semantics a caller must not get wrong. Two or three sentences. If a reader would produce broken data without knowing it, it belongs here.

**`@remarks` is everything else.** Rationale, edge cases, workflow recipes, design history, the alternatives that were rejected and why. There is no length limit, because nothing renders it by default.

### The rules that keep it honest

- **Breaking-change and migration notices are contract tier, always.** A BREAKING marker, a retired enum value, a one-to-one migration table: these go in the summary, never under `@remarks`. The test is who needs them and when. A caller holding legacy data needs to know their values no longer type-check *before* they write anything, and `get_entity_schema` does not send `notes` unless asked, so a demoted notice is a notice the agent never sees. `EvidenceDirection`'s two sibling properties are the worked example: `result_direction` keeps its v0.4.0 notice in the summary, and `HypothesisEvidence.direction` briefly lost its own to `@remarks` during the two-tier sweep, which is exactly the accident this rule exists to prevent.
- **Move, never delete.** Semantics that stop being findable are worse than semantics that are long. A field reporter once concluded a capability did not exist because it was documented where they did not look; the reference page therefore renders both halves, and only the hover and the default schema response trim.
- **The summary must stand alone.** A reader who never opens the disclosure should still use the property correctly. If the summary only makes sense once you have read the remarks, the split is in the wrong place.
- **Do not split a short doc.** The median property description is about 70 characters and needs no tiers. Reach for `@remarks` when the doc has grown past roughly 400 characters, or when you notice yourself writing "the reason for this is".

### What consumes which tier

| Surface | Reads |
|---|---|
| Hover card on the reference page | summary, trimmed to whole sentences |
| Entity reference page | summary, plus remarks behind a "Full semantics" disclosure |
| `get_entity_schema` | summary by default; remarks only with `include_notes: true` |
| Generated `.d.ts` | the whole JSDoc block, as written |

The generator (`scripts/generate-property-registry.ts`) reads the split and emits `description` (summary) and `notes` (remarks) as separate fields on `PropertyDefinition`. Both are derived from one JSDoc block, so the source of truth stays in one place.

## Canonical primitive types

Defined once in `primitives.ts`, re-used everywhere. These are the only primitives you should reach for when declaring a new property.

| Type | Shape | Use for |
|---|---|---|
| `ISODate` | `string` alias (`"2026-06-01"`) | Calendar dates without a time component |
| `ISODateTime` | `string` alias (`"2026-06-01T09:00:00Z"`) | Timestamps with timezone |
| `Priority` | `'urgent' \| 'high' \| 'medium' \| 'low' \| 'none'` | Any prioritisation field |
| `HealthStatus` | `'on_track' \| 'at_risk' \| 'off_track'` | Traffic-light delivery/initiative status |
| `Confidence` | `'high' \| 'medium' \| 'low'` | Subjective "how confident am I" reads |
| `UPGAssessment` | object with `score`, `confidence`, `rationale` | Structured scored judgements with attribution |

`UPGAssessment` is re-exported from `grammar/scales.ts` through `primitives.ts`. Domain files import it from `primitives.ts` to keep the dependency direction clean.

## Cross-cutting keys: canonical shapes

These keys appear in 3+ interfaces and always mean the same thing. They MUST use the canonical shape:

| Key | Canonical type | Appears in |
|---|---|---|
| `start_date` | `ISODate` | 15 interfaces |
| `end_date` | `ISODate` | 10 interfaces |
| `due_date` | `ISODate` | 5 interfaces |
| `target_date` | `ISODate` | 6 interfaces |
| `launched_at`, `started_at`, `completed_at`, `*_at` | `ISODateTime` | 20+ instances |
| `priority` | `Priority` | 11 interfaces |
| `*_priority` (e.g. `annotation_priority`, `strategic_priority`) | `Priority` | 4 interfaces |
| `health` / `health_status` | `HealthStatus` | 3 interfaces |
| `confidence` (subjective) | `Confidence` | 5 interfaces |
| `confidence` (structured scoring) | `UPGAssessment` | 3 interfaces |
| `severity`, `impact`, `effort`, `likelihood`, `risk_level`, etc. (scored judgement) | `UPGAssessment` | 15+ instances |

### `confidence`: a word, two meanings

`confidence` splits by intent:

- **Subjective read**: "how confident am I in this, on a rough scale?" Use `Confidence` (enum high/medium/low). Lightweight.
- **Structured judgement**: "what's my scored assessment plus rationale?" Use `UPGAssessment`. Provides score + confidence band + rationale.

Both are valid. The domain interface should pick one and document why. Do not use a free-form string for either.

If your field describes "is this proposition real yet?" that is **validation state**, not confidence. Name it `validation_state` with domain-specific enum values (see `ValuePropositionProperties` for the canonical example).

## Keys that legitimately vary per domain

These keys appear in many interfaces but their semantics differ by context. The domain interface declares its own shape. No canonical extraction.

| Key | Why it varies |
|---|---|
| `owner` | Sometimes a person reference, sometimes a team reference, sometimes a role name. Domain decides. |
| `category` | Enum values differ per domain (`data`, `design`, `feedback`, etc. each have their own) |
| `scope` | Narrative in some contexts, enum in others |
| `status`, `state` | Per-entity lifecycle phase ids |
| `url` | Context-specific (docs URL vs deployment URL vs profile URL) |
| `tags` | Free-form strings, no controlled vocabulary |

When declaring one of these fields in a new interface, write a JSDoc that describes the intent in this entity's context. Don't assume the reader knows what `owner` means on your entity.

## When adding a new property

1. If it matches a canonical key, use the canonical type. Don't redeclare the shape.
2. If it's date-like, always use `ISODate` (calendar) or `ISODateTime` (timestamp), never raw `string`.
3. If it's prioritisation, always use `Priority`.
4. If it's a subjective confidence, use `Confidence`.
5. If it's a scored judgement with rationale, use `UPGAssessment`.
6. If it's domain-specific (see varying keys above), write a JSDoc explaining your intent.

## Regression guard

`src/__tests__/spec-integrity.test.ts` enforces two invariants for the canonical shapes:

- Every `*_date`, `_on`, `_deadline` field is typed `ISODate` (not raw `string`).
- Every `*_at` field is typed `ISODateTime` (not raw `string`).

## Related

- `primitives.ts`: the type definitions
- `../grammar/scales.ts`: the canonical `UPGAssessment` shape
- `../ARCHITECTURE.md`: architectural context
