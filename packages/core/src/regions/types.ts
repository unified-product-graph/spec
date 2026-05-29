/**
 * UPG Region types (topology only). 10 super-domain rollups over the 36
 * atomic domains. Each region carries an edge topology, anchor entity, and
 * shape archetype. Rendering concerns live in consumer codebases.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

/**
 * Shape archetype: the structural character of a super-domain.
 *
 * Pure topological names: each value describes how edges flow within the
 * region, independent of any rendering choice. Consumers may map these to
 * their own rendering systems (Entopo maps them to UCS pattern families).
 */
export type UPGRegionShape =
  /** Top-down tree, source of strategy, closed upstream. Example: Strategy & Outcomes */
  | 'cascade'
  /** Central node pulled on by many domains; low outbound, high inbound. Example: Users & Needs */
  | 'convergent'
  /** Directed graph with feedback cycles and self-nesting. Example: Discovery/Research/Validation */
  | 'directed-cyclic'
  /** Mostly outbound, reads external reality and emits pressure. Example: Market & Competitive */
  | 'tributary'
  /** Multiple parallel sub-hierarchies coexisting. Example: Experience/Design/Brand */
  | 'multi-hierarchy'
  /** Hierarchical work breakdown with lifecycle at every node. Example: Product & Delivery */
  | 'work-breakdown'
  /** Directed acyclic graph with heavy cross-node dependencies. Example: Engineering & Platform */
  | 'dag'
  /** Multiple sub-hubs sharing users and messages. Example: Business/GTM/Growth */
  | 'multi-hub'
  /** Small roster but referenced by many; the graph's shared measurement plane. Example: Analytics & Data */
  | 'polymorphic-target'
  /** Event-triggered and policy-governed guardrail concerns. Example: Operations & Quality */
  | 'event-driven'

/**
 * The graph role an entity plays *within* its super-domain.
 *
 * Purely structural, independent of any rendering concept.
 */
export type UPGRegionEntityRole =
  | 'anchor'      // the region's anchor entity
  | 'root'        // top of a sub-hierarchy
  | 'hub'         // multiple outgoing edges, central within domain
  | 'container'   // contains children
  | 'leaf'        // terminal node

/** A single entity's membership in a super-domain. */
export interface UPGRegionEntityMembership {
  type: string                          // references a UPGEntityType key
  role: UPGRegionEntityRole
  /** Optional: structural notes (e.g. "sideways-resolved", "dual-role"). */
  notes?: string
}

/** Direction of a boundary edge relative to the super-domain. */
export type UPGBoundaryDirection = 'import' | 'export' | 'sideways'

/**
 * A boundary edge connecting the super-domain to another super-domain.
 *
 * Edge references are keys in `UPG_EDGE_CATALOG` (see `../catalog/edge-catalog.ts`).
 */
export interface UPGBoundaryEdge {
  direction: UPGBoundaryDirection
  edge_id: string                       // references UPG_EDGE_CATALOG key
  crosses_into: string                  // target super-domain region id
}

/**
 * Anchor entity deep-dive within a region.
 *
 * The anchor is the single entity that best represents the super-domain's
 * structural problem. Consumers may use it to seed default views or treat it
 * as the region's primary citizen.
 */
export interface UPGAnchorEntity {
  type: string                          // references UPGEntityType
  rationale: string                     // why this entity anchors the domain
  outbound_cross_edge_count: number
  inbound_cross_edge_count: number
}

/**
 * A super-domain region: a coherent rollup of 1-N atomic domains.
 *
 * Topology only: regions describe what is connected to what, not how it
 * renders. Rendering concerns live in Entopo (`apps/entopo/src/regions/`).
 *
 * @see {@link UPG_REGIONS} for the canonical catalog
 * @see MENTAL-MODEL.md for regions as the static "place" primitive
 */
export interface UPGRegion {
  /** Machine-readable region id (snake_case) */
  id: string
  /** Human-readable name */
  label: string
  /** Numeric order, matches prose file prefix (01-10) */
  order: number
  /** Shape archetype */
  shape: UPGRegionShape
  /** 1-sentence mental model */
  mental_model: string
  /** Typical operators / personas working in this domain */
  operators: readonly string[]
  /** Atomic domain ids from UPG_DOMAINS that this super-domain composes */
  composes_atomic_domains: readonly string[]
  /** All entity memberships */
  entities: readonly UPGRegionEntityMembership[]
  /** The anchor entity for this region */
  anchor: UPGAnchorEntity
  /** Intra-domain edges (by UPG_EDGE_CATALOG id) */
  intra_edges: readonly string[]
  /** Boundary edges to other super-domains */
  boundary_edges: readonly UPGBoundaryEdge[]
}

/** The canonical list of super-domain region ids. */
export type UPGRegionId =
  | 'strategy_outcomes'
  | 'users_needs'
  | 'discovery_research_validation'
  | 'market_competitive'
  | 'experience_design_brand'
  | 'product_delivery'
  | 'engineering_platform'
  | 'business_gtm_growth'
  | 'analytics_data'
  | 'operations_quality'
