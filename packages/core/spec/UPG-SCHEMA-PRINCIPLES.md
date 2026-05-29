# UPG Schema Principles

> 20 governing principles for the Unified Product Graph specification.
> The principles are the constitution. The schema is the legislation.

---

## P1: Readability Over Brevity

Entity type names must be human-readable and self-explanatory. A person encountering the schema for the first time should understand what each type represents without consulting a glossary.

**Test:** Can a non-specialist read the type name and understand what kind of thing it represents?

## P2: Framework-Neutral Naming

Entity types represent universal product concepts, not framework-specific terminology. When a concept exists across multiple frameworks under different names, the canonical name is the most universal descriptor. Framework-specific names are display labels, not type names.

**Test:** Does this name make sense outside any single framework?

## P3: Complete Property Schemas

Every entity type must have a typed property interface. `Record<string, unknown>` is not acceptable. Property schemas define the structured knowledge each entity carries. That structure is what UPG offers.

**Test:** Can a tool render a meaningful form or summary without guessing what fields exist?

## P4: Hierarchy Is Grammar

The specification defines valid parent-child relationships. Every entity type declares its valid parents and children. Self-nesting is explicitly allowed or denied.

**Test:** Can a tool validate a `.upg` file's tree structure using only the spec?

## P5: Edges Must Have Verbs

Every edge type carries a human-readable verb describing the relationship. The `_has_` pattern is acceptable only for strict containment. All other relationships use semantic verbs.

**Test:** Can a reader understand the relationship by reading the edge verb alone?

## P6: Domains Are Semantic Boundaries

Domains represent distinct areas of product knowledge with internal coherence. Entity types within a domain relate to each other more than to types in other domains. Cross-domain relationships are edges, not mixed membership.

**Test:** Can you explain what this domain covers in one sentence? Do all its types belong to that sentence?

## P7: One Concept, One Type

No two entity types represent the same underlying concept. Overlapping types are consolidated into one type with a discriminator property. Framework-specific variants are display labels, not separate types.

**Test:** If you removed one of these types, would users lose the ability to express something?

## P8: The Spec Is Canonical

Applications derive from the UPG specification. When an app and the spec conflict, the spec wins. When the spec is silent, a spec decision is made first, then implemented.

**Test:** If you deleted app code and regenerated from the spec, would any product knowledge be lost?

## P9: Naming Follows Domain Language

Within each domain, naming follows the established vocabulary of that domain's practitioners, but only when that vocabulary is universal to the domain and not specific to one framework or tool.

**Test:** Would a practitioner in this domain recognise this term without needing a specific book?

## P10: Research Before Definition

No domain is defined by guessing. Properties are researched against existing tools, practitioner needs, AI context utility, and queryability.

**Test:** Can you cite a source for every property in this schema?

## P11: App Extensions Are Additive

Applications may extend entity types with app-specific properties but must never contradict a spec property's type or semantics, rename a spec property, or promote an optional field to required. Extensions live in `properties` alongside spec fields.

**Test:** If you stripped all app-specific extensions, would the remaining properties still be a valid UPG node?

## P12: JSDoc Is the Spec Documentation

Every property has a JSDoc comment explaining what it is, what its values mean, and where applicable, examples and links. The spec is self-documenting. Import the types, get the docs in your editor.

**Test:** Can a developer understand every property without opening a separate documentation page?

## P13: Shared Vocabulary Axes

When the same conceptual axis applies to multiple entity types, it uses the same values and vocabulary. The axis is shared, not duplicated. Field names may differ to reflect context, but values are identical.

**Test:** If two properties accept the same set of values, are those values defined once and shared?

## P14: Foreign Keys Are Edges

Relationships between entities are expressed through edges, not through foreign key properties. The spec uses edges. App-level foreign keys are an optimisation apps may choose, but they are not canonical.

**Test:** Does any entity property reference another entity's ID? That should be an edge.

## P15: Status Is a Two-Level Lifecycle

Entity types that progress through states define a lifecycle with two levels: **phases** (universal, fixed by the spec) and **states** (specific, extensible by tools within phases). Round-trip fidelity is guaranteed.

**Test:** Can a tool export, another tool import, and the first tool re-import, with zero status data loss?

## P16: UPG Is Machine-Written, Human-Readable

The format is produced by agents, tools, and adapters. It is consumed by AI inference, rendering engines, and other tools. When choosing between compact and self-describing, choose self-describing. Every value carries enough context to interpret without external definitions.

**Test:** Can an AI reading this node build a useful natural-language summary without consulting any external schema file?

## P17: Assessments Are Qualitative With Numeric Encoding

Human judgments (reach, frequency, severity, importance, pain) carry both a numeric value for computation and a qualitative label for display. Scale definitions provide the mappings. Computed scores are normalized to 0–1 for cross-tool comparison.

**Test:** Can a UI render this as a meaningful label without the number? Can a formula compute a score without the label?

## P18: Edges Have Forward and Reverse Verbs

Every edge type carries two verbs: forward (source to target) and reverse (target to source). Data stores one direction. Display is context-dependent. A single edge row, two display labels.

**Test:** Can both the source and target render a natural-language description of this relationship?

## P19: Referenceable Values Are Entities

When a property value needs to be referenced, grouped by, or shared across multiple entities, it should be an entity type with edges, not an inline property. Inline properties are for intrinsic attributes of a single entity. If two entities need to agree on a value, that value is a relationship, not a property.

**Test:** Could another entity need to point at this value? If yes, it's an entity.

## P20: Entities Earn Their Existence

An entity with zero typed properties is valid. Its value comes from the relationships it anchors, not the properties it carries. As P14 and P19 convert string properties to edges, some entities will end up with empty property interfaces. This is the ideal state, not a smell.

An entity earns its place in the graph when it serves at least one of three roles:
- **Hub:** it connects three or more other entities that wouldn't otherwise be related (e.g. positioning links value propositions, competitors, personas, and market segments)
- **Container:** it has children in the hierarchy (e.g. positioning parents messaging, objection, and proof_point)
- **Narrative:** its title and description carry meaning that doesn't belong on any single connected entity

An entity should be questioned when it has zero properties, connects only two entities, has no children, and its title adds no meaning beyond the edge itself. In that case, it may be an edge masquerading as a node.

**Test:** Remove this entity and rewire its edges directly between its neighbours. Does the graph lose information? If yes, keep the entity.

---

*Unified Product Graph Specification v0.2 · unifiedproductgraph.org*
