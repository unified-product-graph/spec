/**
 * UPG Base Node and shared primitives. Every node extends `UPGBaseNode`.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGEntityType } from '../catalog/entity-catalog.js'
import type { ISODateTime } from '../properties/primitives.js'

// ─── Shared primitives ────────────────────────────────────────────────────────

/** Confidence level for a type mapping when importing from an external tool.
 *  - `high`: unambiguous match (e.g. exact type string match)
 *  - `medium`: probable match (e.g. semantic similarity)
 *  - `low`: speculative match, human review recommended
 *  - `manual`: mapping was set explicitly by a human */
export type UPGMappingConfidence = 'high' | 'medium' | 'low' | 'manual'

// ─── Base node ────────────────────────────────────────────────────────────────

/** The structural base shared by every node in a product graph.
 *
 * All entity types extend this interface, either directly (using `properties`
 * as `Record<string, unknown>`) or via the typed `UPGNode<T>` wrapper, which
 * narrows `properties` to the correct interface from `UPGPropertyMap`.
 *
 * Core identity fields (`id`, `type`, `title`) are required.
 * Everything else is optional to keep the format lightweight.
 *
 * @example
 * // A minimal persona node, only required fields populated.
 * const persona: UPGBaseNode = {
 *   id: 'n_persona_1',
 *   type: 'persona',
 *   title: 'Head of Product at a B2B SaaS scale-up',
 * }
 *
 * @example
 * // An imported node with mapping metadata + type-specific properties.
 * const importedPersona: UPGBaseNode = {
 *   id: 'n_persona_2',
 *   type: 'persona',
 *   title: 'Solo founder, non-technical',
 *   description: 'Operator who ships with AI and needs thinking tools to keep up.',
 *   tags: ['primary', 'launch-audience'],
 *   source_id: 'notion_page_abc123',
 *   source_type: 'customer_archetype',
 *   mapping_confidence: 'high',
 *   external_tool: 'notion',
 *   external_ref: 'https://notion.so/acme/abc123',
 *   properties: {
 *     is_primary: true,
 *     experience_level: 'intermediate',
 *   },
 * }
 */
export interface UPGBaseNode {
  /** Unique identifier within the graph */
  id: string
  /** The UPG entity type (must be a value from UPGEntityType) */
  type: UPGEntityType
  /** Human-readable title */
  title: string
  /**
   * Stable, human-readable handle for inline `[[type:slug]]` chips in
   * `.upg.md` documents. Auto-generated from `title` when omitted; unique
   * within `(product_id, type)`. The `id` field remains the canonical
   * identifier for adapters, MCP tools, and cross-product edges. Resolvers
   * MUST accept either form (UUID `id` OR slug) when matching chips.
   */
  slug?: string
  /**
   * Past values of `slug`, retained when the slug is renamed so existing
   * `.upg.md` chips that reference the old slug still resolve. The set
   * (slug ∪ aliases) is unique within `(product_id, type)`. Order is
   * preservation-only; resolvers treat aliases as a flat lookup set.
   */
  aliases?: string[]
  /**
   * Stable, human-citable key minted for this node (e.g. `"LTN-311"`). Unique
   * within the product ACROSS entity types, immutable once assigned, and never
   * reused. Distinct from `slug`: a key is minted, not derived from the title.
   *
   * @remarks
   * WHY NOT `slug`. A slug is unique within `(product_id, type)` and is
   * auto-generated from `title` when omitted. A citable key is neither: under
   * slug's scope a `task` and a `bug` could each legally hold `LTN-311`, and a
   * key that followed a retitle would break every citation that made it worth
   * having. The two fields answer different questions and both are optional.
   *
   * WHY NOT `external_id`. That field records the identifier a node had in the
   * tool it came FROM. It is the right home for an imported key's provenance
   * and is structurally incapable of naming the next node, because there is no
   * external tool to mint it. A graph that outlives its source tool needs a key
   * of its own.
   *
   * MINTING. The prefix is `product.key_prefix`; a product with no prefix mints
   * no keys. The next number is `max(existing) + 1`, derived from the graph — no
   * counter is serialised, because a counter is store state rather than a fact
   * about the thing (the same cut that keeps `composition.rev`, which is a fact,
   * and excludes a concurrency token, which is not).
   *
   * NOT ENFORCED IN 0.32.0. The uniqueness and immutability invariants are
   * stated here and no check fires on them. A duplicate-key detector needs a
   * labeled corpus including the near-miss — two products in one workspace
   * legitimately sharing a prefix — and that corpus does not exist yet.
   *
   * @example "LTN-311"
   */
  key?: string
  /** Optional narrative description */
  description?: string
  /** Freeform tags for filtering and grouping */
  tags?: string[]
  /** Current lifecycle phase (must be a phase ID from getLifecycleForType()).
   *  E.g., for hypothesis: 'untested' | 'testing' | 'resolved'.
   *  Entity types without a lifecycle definition should omit this field.
   *  Validated at runtime against UPG_ALL_PHASES_SET. */
  status?: string
  /**
   * Swept out of default views. ORTHOGONAL to `status`: a node can be done and
   * live, or done and archived, and those are different facts. Archived nodes
   * remain fully queryable.
   *
   * @remarks
   * WHY THIS IS NOT A LIFECYCLE PHASE. Several lifecycles carry an `archived`
   * phase, and in every one of them it is `status_category: 'completed'` — so in
   * the six-bucket read, archived and done are indistinguishable. Field data
   * settles it: a real 1,032-issue tracker held 559 archived-Done items
   * alongside 18 live-Done ones. One field cannot carry two facts, and a bucket
   * system that collapses them cannot answer the question it exists for.
   *
   * THE DEFAULT-READ CONVENTION, documented and NOT enforced: archived nodes are
   * excluded from default views and included on request (`UPGViewQuery
   * .include_archived`). A consumer that shows them by default is doing
   * something unusual, not something wrong, so no check fires on it.
   *
   * Generalised at 0.32.0 from `WorkspaceProperties.archived`, which shipped the
   * same pair for one type and is now `@deprecated` in favour of this field.
   * The existing `archived` LIFECYCLE PHASES are deliberately untouched;
   * reconciling them is its own cycle.
   */
  archived?: boolean
  /** ISO timestamp archived. Pairs with `archived === true`. */
  archived_at?: ISODateTime
  /** Original ID in the source tool (for round-trip fidelity) */
  source_id?: string
  /** Original type name in the source tool */
  source_type?: string
  /** Confidence level of the type mapping */
  mapping_confidence?: UPGMappingConfidence
  /** External tool that holds the canonical artifact (e.g. "figma", "linear", "notion") */
  external_tool?: string
  /** URI to the canonical artifact: https:// for cloud tools, file:// or relative path for local files */
  external_ref?: string
  /** Identifier in the external tool's system (for sync / round-trip) */
  external_id?: string
  /** Type-specific properties */
  properties?: Record<string, unknown>
}
