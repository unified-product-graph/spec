# How the spec is structured

The spec is split into directories across 4 abstraction tiers. Each directory builds on the ones above it.

```
src/
├── index.ts                          Root: version, computed sets, barrel exports
│
├── catalog/       Layer 1a : what exists              (zero imports)
├── shapes/        Layer 1b : structural primitives    (imports catalog/)
├── registry/      Layer 1c : identity & organisation  (imports catalog/)
│
├── grammar/       Layer 2  : how things behave        (imports 1a, 1b, 1c)
├── properties/    Layer 3  : what things carry        (imports 1b, 2)
│
├── frameworks/    Layer 4a : framework definitions    (self-contained)
├── intelligence/  Layer 4b : graph health & guidance  (imports 1b)
├── presentation/  Layer 4c : how things look          (imports 1c, 2, 4a)
│
├── playbooks/     Layer 5a : guided bootstrap         (imports 4a, 4b, regions/)
└── approaches/    Layer 5b : cognitive engagement     (imports 4a, regions/)
```

Layers 1–4 are **declarative** (what *is*). Layer 5 is **procedural** (what *to do*). A `UPGPlaybook` orchestrates the layers below it during region bootstrap. A `UPGApproach` names the cognitive engagement category (the path of arrival to a region) under which frameworks operate.

## Root

| File | What it is | What it contains |
|------|-----------|-----------------|
| **index.ts** | Package entry point | Barrel re-exports across the directories. Computes `UPG_VERSION`, `UPG_TYPES` (active types from `getTypes()`), `UPG_TYPES_SET` (O(1) lookup), `UPG_TYPE_NAMES` (snake_case → Title Case). Edge lookup: `UPG_EDGE_TYPES`, `UPG_EDGE_PAIR_MAP`. Entity, domain, and edge counts. |

## Layer 1a: `catalog/`: What Exists

Enumerations of everything that can exist in a UPG document. Zero imports.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **entity-catalog.ts** | The type catalog | `UPGEntityType`: union of active entity type names. `DeprecatedUPGEntityType`, `AnyUPGEntityType`. |
| **edge-catalog.ts** | The edge catalog | `UPG_EDGE_CATALOG`: `as const` map from each edge type key to `{forward_verb, reverse_verb, classification, source_type, target_type}`. Also `UPGEdgeDefinition`. |

**Mental model:** the nouns and verbs of the language.

## Layer 1b: `shapes/`: Structural Primitives

Interfaces shared by every node, edge, and document. Imports from `catalog/` only.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **base-node.ts** | The node shape | `UPGBaseNode`, `UPGMappingConfidence`. |
| **edges.ts** | The edge shape | `UPGEdgeType` (derived via `keyof typeof UPG_EDGE_CATALOG`). `UPGEdge` carries `id`, `source`, `target`, `type`, `mapping_confidence`. |
| **document.ts** | The file format | `UPGDocument`, `UPGPortfolioDocument`, `UPGProductStage`, `UPGCrossEdge`, `UPGProductArea`, `UPGPortfolio`, `UPGOrganization`, `UPGIntegrity`. |

**Mental model:** what a noun, verb, or sentence looks like on the wire.

## Layer 1c: `registry/`: Identity & Organisation

Stable identities and semantic groupings. Imports from `catalog/` only.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **entity-meta.ts** | The type ID registry | `UPG_ENTITY_META` entries with `name`, immutable `type_id`, `maturity`, `since`, optional `deprecated_in`/`replacement`. Computed arrays (`UPG_ACTIVE_TYPES`, `UPG_DEPRECATED_TYPES`) and helpers (`isDeprecatedType`, `getReplacementType`, `getTypeId`, `getTypeName`). |
| **domains.ts** | The domain map | `UPG_DOMAINS`: 36 domains, each with `id`, `label`, `description`, `types`. Helpers: `getTypes`, `getDomainForType`. |

**Mental model:** where a type lives, its stable ID, and whether it's current.

## Layer 2: `grammar/`: How Things Behave

Rules and constraints. Imports `catalog/`, `shapes/`, `registry/`.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **hierarchy.ts** | Parent-child rules | `UPG_VALID_CHILDREN`. Helpers: `getValidChildren`, `canBeChildOf`. |
| **lifecycles.ts** | State machines | Per-entity lifecycle definitions. Helpers: `getLifecycleForType`, `UPG_ALL_PHASES`, `UPG_ALL_PHASES_SET`. |
| **scales.ts** | Assessment vocabulary | `UPGAssessment`, `UPG_SCALES` (5-point scales), `getScale`. |
| **migrations.ts** | Version upgrade rules | `UPG_MIGRATIONS`, `UPG_EDGE_MIGRATIONS`. Helpers: `getMigrationMap`, `migrateNode`, `getEdgeMigrationMap`, `migrateEdge`. |
| **validate.ts** | Document validation | `validateUPGDocument` returns `{valid, errors[], warnings[]}`. `isUPGDocument` type guard. |

**Mental model:** what's allowed, what states things can be in, and how old data upgrades.

## Layer 3: `properties/`: What Things Carry

Per-entity-type field definitions. Imports `shapes/`, `grammar/`.

| File | What it is |
|------|-----------|
| **primitives.ts** | Shared types: `Priority`, `HealthStatus`, `Confidence`, `ISODate`, `ISODateTime`. Re-exports `UPGAssessment`. |
| **property-map.ts** | `UPGPropertyMap`: maps each entity name to its property interface. `UPGNode<T>` typed wrapper. |
| **property-schema.ts** | `UPG_PROPERTY_SCHEMA`: auto-generated runtime schema. Generator: `scripts/generate-property-registry.ts`. |
| **domains/** | One file per domain, exporting typed property interfaces (e.g. `users.ts` → `PersonaProperties`, `JobProperties`). |

**Mental model:** the fields available when creating an entity of each type.

## Layer 4a: `presentation/`: How Things Look

Applied on read.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **labels.ts** | Rosetta Stone | Per-type canonical label, alt labels, framework-specific labels. `UPG_TYPE_LABELS`, `resolveLabel`, `UPG_TYPE_ALIASES`. |
| **lenses.ts** | Role-based views | Lens configurations for PM, Engineer, Designer, Growth. `UPG_LENSES`, `getLens`, `getVisibleTypes`. |
| **domain-rings.ts** | Concentric rings | Rings grouping the 36 domains. `UPG_DOMAIN_RINGS`, `getRingForDomain`. |

## Layer 4b: `intelligence/`: Graph Health & Guidance

| File | What it is | What it contains |
|------|-----------|-----------------|
| **intelligence.ts** | Condition types | `IntelligenceCondition`: structured predicates for graph state checks. |
| **domain-guides.ts** | Construction patterns | `UPG_DOMAIN_GUIDES`: anchor entities, creation sequences, named patterns, required bridges, anti-patterns. |
| **benchmarks/** | Health scoring | Stage-appropriate entity count, ratio, relationship, and domain activation targets. |

## Layer 4c: `frameworks/`: Framework Definitions

216 declarative framework definitions in `UPG_FRAMEWORKS`. Self-contained.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **types.ts** | Framework interfaces | `UPGFramework` (four layers: data, structure, presentation, education). |
| **categories.ts** | Category catalog | `UPG_FRAMEWORK_CATEGORIES`, `UPG_STRUCTURE_PATTERNS`. |
| **validate.ts** | Validation | `validateUPGFramework`. |
| **definitions/** | Category files | Combined into `UPG_FRAMEWORKS`, `UPG_FRAMEWORKS_BY_ID`, `UPG_FRAMEWORKS_BY_CATEGORY`. |

## Layer 5a: `playbooks/`: Guided Bootstrap

Region-anchored bootstrap recipes. One canonical playbook per region, plus optional framework-anchored specialised playbooks.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **types.ts** | Playbook primitive | `UPGPlaybook` (`region: UPGRegionId`, `is_canonical?`, `framework_id?`, `target_anchor_entity?`, `creation_sequence: Step[]`), `PlaybookBinding`, `PlaybookRuntime` (`listPlaybooks`, `getPlaybook`, `getCanonicalPlaybookForRegion`, `getPlaybooksForRegion`, `startRun`, `recordStep`), `PlaybookRun`, `PlaybookFilter`. |
| **definitions/index.ts** | Canonical and specialised playbooks | One canonical per region (10) plus 2 specialised business playbooks; framework anchors live on each playbook's `related_framework_ids`. Accessors: `getPlaybookById`, `getCanonicalPlaybookForRegion`, `getPlaybooksForRegion`. Re-exports `UPG_PLAYBOOKS` and shared step machinery from `../step-sequence.ts`. |

**Mental model:** the guided journey to populate a region from its anchor outward.

**Chaining.** A step's `next_sequence_on_gap` names the next playbook (or approach) to run when a gap is detected. Example: `playbook:strategy-outcomes` → `playbook:discovery-research-validation`.

## Layer 5b: `approaches/`: Cognitive Engagement Categories

Five canonical approaches: Plan / Inspect / Prioritise / Trace / Reflect. Each records id, label, description, question_answered, signature_hint, and `framework_id_examples`. The MCP tools `plan` / `inspect` / `prioritise` / `trace` / `reflect` ship as **definition lookups**; the LLM is the executor.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **types.ts** | Approach primitive | `UPGApproach`, `UPGApproachId` (literal union of the five ids), `ReflectMode` (`'assumptions' \| 'alternatives' \| 'blind-spots' \| 'load-bearing'`), `REFLECT_MODES`, `UPGApproachEnvelope`, `ApproachBinding`, `ApproachFilter`, `ApproachRun`, `ApproachRuntime`. |
| **definitions/index.ts** | Five canonical approaches | `UPG_APPROACHES` (length 5, locked) and `UPG_APPROACHES_BY_ID`. |

**Mental model (cartographic framing).** Each approach is a path of arrival: Plan → "what should I build next?", Inspect → "what's broken?", Prioritise → "what's most important?", Trace → "walk a meaningful path", Reflect → "what should I be questioning?". Frameworks are the named techniques *inside* an approach, bridged via `UPGFramework.approach_ids`. 34 canonical frameworks ship publicly, with a fuller research library kept internal and promoted in over time. Entity scaffolding is playbook territory.

## Shared step machinery: `step-sequence.ts`

Step types used by both playbooks and approaches. Re-exported from the package root via `playbooks/index.ts` so consumers like `@unified-product-graph/mcp-server` can construct and traverse steps.

| File | What it is | What it contains |
|------|-----------|-----------------|
| **step-sequence.ts** | Shared steps | `Step` (discriminated by `kind`: `domain_guide` \| `framework` \| `entity_sequence` \| `sub_sequence`), `EntryMode`, `SurfaceId`, `RunContext`, `StepOutput`. Narrowing helpers: `isDomainGuideStep`, `isFrameworkInvocationStep`, `isEntitySequenceStep`, `isSubSequenceStep`. |

## The Dependency Flow

```
catalog/  ← zero imports (absolute foundation)
    ↓
shapes/  ← imports from catalog/
    ↓
registry/  ← imports from catalog/
    ↓
grammar/  ← imports from catalog/, shapes/, registry/
    ↓
properties/  ← imports from shapes/, grammar/
    ↓
presentation/   ← imports from registry/, grammar/, frameworks/
intelligence/   ← imports from shapes/
frameworks/     ← self-contained
```

Each directory imports only from the directories above it.

## How the spec is structured

**Closed type unions.** `UPGBaseNode.type` is `UPGEntityType`. `UPGEdge.type` is `UPGEdgeType`. New types come from spec edits.

**`UPGBaseNode` holds universal fields.** App-specific fields extend it in the app's own layer.

**Edges store their endpoints.** Verb and classification live in `catalog/edge-catalog.ts` and are looked up at read time.

**`edge-catalog.ts` drives everything edge-related.** `shapes/edges.ts` derives `UPGEdgeType` from it via `keyof typeof`. The type union, the pair map, and the classifications all come from this one file.

**Scored properties use `UPGAssessment`.**

**`catalog/` is the floor.** Zero imports.

**`registry/` carries identity.** Stable IDs, maturity, domains.

**`presentation/` runs at read time.** Labels, lenses, and rings stay out of `.upg` files.

**`intelligence/` computes health.** Benchmarks and guides analyse the graph.

**`frameworks/` is self-contained.** 216 definitions, ready to extract into a separate package when useful.

## Framework Properties: Lens-Scoped Fields

Frameworks are **lenses**. They layer domain-specific fields on top of canonical entities. RICE adds `reach` / `impact` / `confidence` / `effort` to a feature. Kano adds `functional_response` / `dysfunctional_response`. Weighted Scoring adds `benefit_weight` / `cost_weight` / `risk_weight`. These fields belong to the framework's scoring context.

**Rule:** a framework's `required_properties` may reference property keys outside `UPG_PROPERTY_SCHEMA` for the target entity type. Frameworks self-declare the fields their scoring needs. Promoting RICE's `reach` to `FeatureProperties` would force every feature to carry it regardless of context.

**Consumer contract:**

- Rendering an entity **without** a framework: read from `UPG_PROPERTY_SCHEMA[entity_type]` only.
- Rendering an entity **under** a framework: merge `UPG_PROPERTY_SCHEMA[entity_type]` with `framework.data.required_properties[entity_type]`. Framework fields shadow with priority.
- Validating typed property values: framework-introduced keys are scoped to the framework.

The `06-framework-coupling` audit surfaces these at info level.

## Hierarchy vs Edges: The Two-Mechanism Rule

Containment is expressed **twice** on purpose:

1. **`parent_id`** on `UPGBaseNode` carries containment. Every node has exactly one parent. The tree is the primary spatial organisation.
2. **`UPG_VALID_CHILDREN`** in `grammar/hierarchy.ts` declares which types are permitted under which parent types. Drives UI affordances (add menus), validation, and traversal.
3. **`UPG_EDGE_CATALOG`** entries with `classification: 'hierarchy'` are *optional* named verbs for containment relationships where the verb carries meaning beyond "contains" (e.g. `experiment_produces_learning` over a plain `experiment → learning` hierarchy).

**Rule:** A hierarchy pair in `UPG_VALID_CHILDREN` may stand without a corresponding named edge. Edges are for:

- **Named verbs** on contained relationships, where the verb carries semantic richness.
- **Non-containment** relationships: `causal` (A causes B), `semantic` (A relates to B), `cross-domain` (A references B in another product's graph).

The `03-edge-hierarchy` audit lists bare hierarchies at `info` level for discoverability.

This keeps the catalog from ballooning into hundreds of `X_contains_Y` verbs that duplicate the parent link.

## Polymorphic Edges

Most edges in `UPG_EDGE_CATALOG` bind two specific entity types:

```ts
persona_pursues_job:           { source_type: 'persona', target_type: 'job', ... }
outcome_reveals_opportunity:   { source_type: 'opportunity', target_type: 'outcome', ... }
```

A **polymorphic edge** uses the wildcard sentinel `'node'` at one or both endpoints, meaning *"any entity in the graph."* `'node'` is exported as `UPG_WILDCARD_ENDPOINT` and tracked in the `UPG_POLYMORPHIC_EDGE_KEYS` allow-list.

**Mental model:**
- Concrete edge → "I know exactly what's at both ends."
- Polymorphic edge → "I know the verb; one end can be any type."

### Three sanctioned families

**1. Universal semantic verbs**

```ts
node_informs_node:    { source_type: 'node', target_type: 'node' }
node_constrains_node: { source_type: 'node', target_type: 'node' }
node_inspires_node:   { source_type: 'node', target_type: 'node' }
```

A `quote` inspires a `design_concept`. An `insight` informs a `feature`. A `compliance_requirement` constrains an `api_endpoint`.

**2. Decision-to-anything**

```ts
decision_influences_node:     { source_type: 'decision', target_type: 'node' }
decision_constrained_by_node: { source_type: 'decision', target_type: 'node' }
decision_produces_node:       { source_type: 'decision', target_type: 'node' }
```

A decision to use Postgres influences `database_schema`, `service`, `deployment`, `api_contract`. The same decision might produce a `feature_flag`, be constrained by a `compliance_requirement`, and influence an `investigation`.

**3. Universal ownership**

```ts
node_owned_by_team:         { source_type: 'node', target_type: 'team' }
node_owned_by_role:         { source_type: 'node', target_type: 'role' }
node_owned_by_stakeholder:  { source_type: 'node', target_type: 'stakeholder' }
node_owned_by_department:   { source_type: 'node', target_type: 'department' }
node_owned_by_person:       { source_type: 'node', target_type: 'person' }
```

A `feature` owned by a team, a `risk` by a stakeholder, a `service` by a role, an `incident` by a named person. Source is any type, target is one of five organisational entities.

### Contract

- `UPG_WILDCARD_ENDPOINT = 'node' as const` is exported from `catalog/edge-catalog.ts`.
- Adding a polymorphic edge requires extending both `UPG_EDGE_CATALOG` and `UPG_POLYMORPHIC_EDGE_KEYS`. The spec-integrity test enforces parity.
- Helpers: `isPolymorphicEdge(key)` (derived from endpoints), `isRegisteredPolymorphicEdge(key)` (allow-list check).
- Audit 05 (`05-edge-validity`) errors on any wildcard endpoint outside the allow-list.
