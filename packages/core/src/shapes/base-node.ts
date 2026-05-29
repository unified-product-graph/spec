/**
 * UPG Base Node and shared primitives. Every node extends `UPGBaseNode`.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGEntityType } from '../catalog/entity-catalog.js'

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
  /** Optional narrative description */
  description?: string
  /** Freeform tags for filtering and grouping */
  tags?: string[]
  /** Current lifecycle phase (must be a phase ID from getLifecycleForType()).
   *  E.g., for hypothesis: 'untested' | 'testing' | 'resolved'.
   *  Entity types without a lifecycle definition should omit this field.
   *  Validated at runtime against UPG_ALL_PHASES_SET. */
  status?: string
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
