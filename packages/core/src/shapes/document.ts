/**
 * UPG Document format. `UPGDocument` is the portable interchange shape for a product's knowledge graph.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGBaseNode, UPGMappingConfidence } from './base-node.js'
import type { UPGEdge } from './edges.js'

// ─── Document source ──────────────────────────────────────────────────────────

/**
 * Identifies the tool that produced a `UPGDocument`. Every exporter stamps
 * one of these into the document's `source` field so round-trips stay
 * auditable.
 *
 * @example
 * const source: UPGSource = {
 *   tool: 'entopo',
 *   tool_version: '0.3.1',
 *   workspace_id: 'ws_acme_main',
 * }
 */
export interface UPGSource {
  /** The tool that exported this document */
  tool: string
  /** Optional tool version */
  tool_version?: string
  /** Optional workspace or project identifier in the source tool */
  workspace_id?: string
}

// ─── Product summary ──────────────────────────────────────────────────────────

/**
 * The root product described by a `UPGDocument`. All nodes in the document
 * belong to this product; portfolio documents carry an array of these.
 *
 * @example
 * const product: UPGProduct = {
 *   id: 'entopo',
 *   title: 'Entopo',
 *   description: 'The product creation tool: canvas + AI + graph, built on UPG.',
 *   stage: 'beta',
 * }
 */
export interface UPGProduct {
  /** Unique identifier for the product within the document */
  id: string
  /** Human-readable name of the product */
  title: string
  /** Optional longer description of what the product does */
  description?: string
  /** Product lifecycle stage. Where this product is in its journey. */
  stage?: UPGProductStage
}

/** Product lifecycle stages. Covers the full arc from napkin idea to end-of-life. */
export type UPGProductStage =
  | 'concept'       // napkin idea, no validation yet
  | 'validation'    // testing demand, talking to users
  | 'build'         // actively developing v1
  | 'beta'          // early users, iterating
  | 'launch'        // generally available
  | 'growth'        // scaling users/revenue
  | 'mature'        // stable, optimizing
  | 'maintenance'   // sustaining, minimal investment
  | 'sunset'        // winding down

// ─── Cross-product edge types ────────────────────────────────────────────────

/** The set of valid cross-product relationship types */
export type UPGCrossEdgeType =
  | 'shares_persona'
  | 'shares_competitor'
  | 'shares_metric'
  | 'depends_on_product'
  | 'cannibalises'
  | 'succeeds'
  // Composition / hosting (host runs the hosted product inside itself).
  // Directed host -> hosted, matching the spec's container -> contained
  // convention (portfolio_contains_product, product_contains_*). Distinct from
  // depends_on_product, which is a runtime dependency, not containment.
  | 'hosts'
  // Strategic rollup / alignment. Directed subordinate -> superior: a product's
  // strategy entity contributes to a higher-level one (product objective ->
  // company objective, product key_result -> company key_result, product
  // outcome -> company outcome). Unlike the symmetric shares_* peer edges, this
  // is hierarchical — it expresses the OKR cascade ACROSS products, so a
  // portfolio can answer "which company objective is this product serving?" and
  // "which company KRs have no product driving them?".
  | 'contributes_to'
  // Canonical instance. Directed product entity -> canonical (registry) entity:
  // "this product node is an instance of that shared, authoritative node." The
  // target lives in the portfolio document's `registry` section (qualified as
  // `registry/{node_id}`), not in a product. The endpoints must share a type
  // (a persona instance_of a persona, a metric instance_of a metric); the
  // same-type rule is enforced by the registry tooling, not by this list.
  // Distinct from the symmetric `shares_*` peer edges: `instance_of` is
  // canonical-to-instance and unlocks rollup ("every Developer instance and its
  // per-surface jobs"), diff, and drift detection (an instance whose title or
  // shape strays from its canonical). Coexists with `shares_*`; neither
  // deprecates the other. See `REGISTRY_PRODUCT_ID` and `UPGRegistry`.
  | 'instance_of'
  // Org-axis to audience. Directed product_area -> canonical (registry) entity:
  // "this area serves that persona" / "this area targets that market segment".
  // The source is a portfolio `product_area` id; the target lives in the registry
  // section (`registry/{node_id}`). Carries optional `relevance` (primary/secondary)
  // and `audience_role` qualifiers — the primary-vs-secondary distinction is the
  // core value of the area-to-audience matrix, and a persona can be a `buyer` for
  // one area and a `user` for another. Created via the dedicated
  // `link_area_to_audience` tool, not the generic `create_cross_product_edge`.
  | 'area_serves_persona'
  | 'area_targets_market_segment'
  // Metric rollup. Directed product `metric` -> company/portfolio `metric`: a
  // product KPI feeds a higher-level north-star. Mirrors `contributes_to` (the OKR
  // cascade) for the measurement cascade (KPI -> north-star -> outcome). Same-type
  // (metric -> metric), directional. Distinct from the symmetric `shares_metric`
  // ("these track the same thing") — `rolls_up_to` says "this one feeds that one".
  | 'rolls_up_to'
  // Foundations (0.9.12). A product-graph entity links to a canonical
  // specification or primitive in the registry. Directed product / feature /
  // api_contract -> registry canonical (`registry/{node_id}` target), the same
  // shape as `instance_of`. Registry-internal spec-to-spec and
  // primitive-to-spec/primitive links are catalog edges, not cross-edges.
  | 'product_implements_specification'
  | 'product_exposes_specification'
  | 'feature_conforms_to_specification'
  | 'api_contract_speaks_specification'
  | 'product_exposes_primitive'
  | 'feature_manipulates_primitive'
  | 'primitive_stored_as_data_type'
  // Competitive parity (0.10.0, #38). Our `feature` rivals a `competitor_feature`
  // that lives in a separate watched competitor-intelligence graph. Dual-registered:
  // also a catalog edge (so resolve_edge_for_pair resolves it and within-graph is
  // the degenerate case), here as a cross-edge for the cross-product case. Carries
  // the parity assessment via `UPGCrossEdge.properties` (carries_properties).
  | 'feature_rivals_competitor_feature'
  // Competitor-signal surfacing (0.10.0, #41). A dated competitor move lives in a
  // watched competitor-intelligence graph; these map it onto our product graph.
  | 'competitor_signal_maps_to_feature'
  | 'competitor_signal_surfaces_opportunity'
  // Registry-canonical classification (0.10.2). A competitor (or other product
  // node) classified directly against a `registry/{classification_value}`
  // canonical, so a shared axis lives once in the registry and graphs carry no
  // local taxonomy nodes. Dual-registered: a within-graph catalog edge for the
  // local case, here as a cross-edge for the canonical case.
  | 'competitor_classified_as_classification_value'

/**
 * Runtime-checkable list of valid cross-product edge types. Mirrors
 * `UPGCrossEdgeType` for use in validators and writers that need to test
 * `edge.type` against the cross-product whitelist at runtime.
 */
export const UPG_CROSS_EDGE_TYPES: readonly UPGCrossEdgeType[] = [
  'shares_persona',
  'shares_competitor',
  'shares_metric',
  'depends_on_product',
  'cannibalises',
  'succeeds',
  'hosts',
  'contributes_to',
  'instance_of',
  'area_serves_persona',
  'area_targets_market_segment',
  'rolls_up_to',
  'product_implements_specification',
  'product_exposes_specification',
  'feature_conforms_to_specification',
  'api_contract_speaks_specification',
  'product_exposes_primitive',
  'feature_manipulates_primitive',
  'primitive_stored_as_data_type',
  'feature_rivals_competitor_feature',
  'competitor_signal_maps_to_feature',
  'competitor_signal_surfaces_opportunity',
  'competitor_classified_as_classification_value',
]

/**
 * Reserved pseudo product-id for the portfolio registry tier. Canonical
 * registry entities are addressed in qualified-id references (and `instance_of`
 * cross-edge targets) as `registry/{node_id}`. No real product may claim this
 * id; product creation rejects it. The registry itself lives in the
 * `registry` section of the portfolio document (`UPGPortfolioDocument.registry`),
 * not in a product file.
 */
export const REGISTRY_PRODUCT_ID = 'registry' as const

// ─── Cross-product edge ──────────────────────────────────────────────────────

/**
 * A cross-product edge links entities across different products within a portfolio.
 * The source/target use qualified IDs: `{product_id}/{node_id}`.
 */
export interface UPGCrossEdge {
  /** Unique identifier within the portfolio document */
  id: string
  /** Qualified source: `{product_id}/{node_id}` */
  source: string
  /** Qualified target: `{product_id}/{node_id}` */
  target: string
  /** Cross-product relationship type */
  type: UPGCrossEdgeType
  /** Optional source product ID (denormalised for convenience) */
  source_product_id?: string
  /** Optional target product ID (denormalised for convenience) */
  target_product_id?: string
  /** Confidence level if this edge was inferred during import */
  mapping_confidence?: UPGMappingConfidence
  /**
   * Edge metadata, for cross-edge types declared `carries_properties` in the
   * edge catalogue (0.10.0, #38). A `feature_rivals_competitor_feature` cross-edge
   * carries the parity assessment here: `parity_status` / `quality` / `is_gap` /
   * `assessed_on` / `evidence` / `confidence`. Cross-edge types NOT declared
   * `carries_properties` reject properties at the write surface.
   */
  properties?: Record<string, unknown>
  /**
   * Sanctioned divergence marker (`instance_of` only). When true, registry drift
   * detection treats an instance title that differs from its canonical as
   * intentional (an informative product-local name, e.g. "Vercel Platform / SDK"
   * vs canonical "Vercel"), excluding it from the `title_divergence` count so
   * `clean` reflects only un-sanctioned drift.
   */
  alias?: boolean
  /**
   * Audience relevance for `area_serves_persona` / `area_targets_market_segment`:
   * whether the audience is a primary or secondary focus of this area. The
   * primary-vs-secondary distinction is the core value of the area-to-audience matrix.
   */
  relevance?: 'primary' | 'secondary'
  /**
   * Audience role in this area's context (`area_serves_persona`). Mirrors
   * `PersonaProperties.audience_role`: the same persona can be a `buyer` for one
   * area and a `user` for another.
   */
  audience_role?: 'buyer' | 'user' | 'champion' | 'influencer' | 'partner'
}

// ─── Portfolio structures ─────────────────────────────────────────────────────

/**
 * A product area within a portfolio. The organisational axis (who owns
 * what). Groups products by team or org structure, independent of strategic
 * theme. Areas may nest via `parent_area_id`.
 *
 * @example
 * const platformArea: UPGProductArea = {
 *   id: 'area_platform',
 *   title: 'Platform',
 *   description: 'Core infrastructure shared across all customer-facing products.',
 *   strategic_priority: 'high',
 *   products: ['entopo', 'upg-cli'],
 * }
 *
 * @example
 * // Nested sub-area that rolls up to a parent area.
 * const billingArea: UPGProductArea = {
 *   id: 'area_platform_billing',
 *   title: 'Billing',
 *   parent_area_id: 'area_platform',
 *   strategic_priority: 'medium',
 *   products: ['billing-service'],
 * }
 */
export interface UPGProductArea {
  /** Unique identifier for the product area */
  id: string
  /** Human-readable name of the product area */
  title: string
  /** Optional longer description of the area's scope and ownership */
  description?: string
  /** Parent area ID for nesting (sub-areas) */
  parent_area_id?: string | null
  /** Strategic priority (mirrors the canonical `Priority` scale) */
  strategic_priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none'
  /** Person or team that owns this area */
  owner?: string
  /** Product IDs that belong to this area */
  products?: string[]
}

/**
 * A portfolio grouping. The strategic axis (where we invest). Groups
 * products by thesis or bet, independent of ownership. Portfolios may nest
 * via `parent_portfolio_id`.
 *
 * @example
 * const growthPortfolio: UPGPortfolio = {
 *   id: 'pf_growth',
 *   title: 'Growth Bets',
 *   description: 'New product investments aimed at new market expansion.',
 *   hierarchy_model: 'flat',
 *   products: ['entopo', 'upg-cli'],
 * }
 */
export interface UPGPortfolio {
  /** Unique identifier for the portfolio */
  id: string
  /** Human-readable name of the portfolio */
  title: string
  /** Optional longer description of the portfolio's strategic focus */
  description?: string
  /** Parent portfolio ID for nesting (sub-portfolios) */
  parent_portfolio_id?: string | null
  /** How products are structured within this portfolio */
  hierarchy_model?: 'flat' | 'nested' | 'matrix'
  /**
   * Investment posture (UPG 0.9.27). `owned` = products we build and manage
   * (the default: coverage, health, and product-spine anti-patterns apply).
   * `watched` = an externally-monitored landscape such as competitor
   * intelligence graphs, which must NOT be judged by product-management
   * expectations or drag portfolio health. Absent is treated as `owned`
   * (back-compat: all pre-0.9.27 portfolios are owned).
   */
  kind?: 'owned' | 'watched'
  /** Product IDs that belong to this portfolio */
  products?: string[]
}

/**
 * An organisation that owns portfolios and product areas. The top of the
 * portfolio-document hierarchy; a portfolio document has exactly one.
 *
 * @example
 * const org: UPGOrganization = {
 *   id: 'org_arkheiev',
 *   title: 'Arkheiev UG',
 *   description: 'Builds The Product Creator brand ecosystem.',
 *   logo_url: 'https://theproductcreator.com/logo.svg',
 *   industry: 'Developer Tools',
 * }
 */
export interface UPGOrganization {
  /** Unique identifier for the organisation */
  id: string
  /** Legal or trading name of the organisation */
  title: string
  /** Optional longer description of what the organisation does */
  description?: string
  /** URL of the organisation's logo. Used in portfolio and org-level rendering. */
  logo_url?: string
  /** Industry sector the organisation operates in */
  industry?: string
}

// ─── Registry (shared-vocabulary tier) ────────────────────────────────────────

/**
 * The canonical shared-entity registry: the portfolio's shared vocabulary tier.
 *
 * Entities shared across products (personas, metrics, competitors,
 * market_segments, ...) are defined ONCE here as authoritative nodes; each
 * product's local instance links to the canonical via an `instance_of`
 * cross-edge (`registry/{node_id}` target). This is a third conceptual tier
 * above products: product graphs hold instances, the portfolio holds org
 * structure, and `registry` holds the shared vocabulary.
 *
 * A canonical entity is just a normal `UPGBaseNode` — canonical-ness is
 * conferred by living in the registry, not by a new type or flag. `edges` is
 * reserved for future canonical-internal structure (e.g. a canonical persona
 * pursuing a canonical job) and is optional; v1 tooling operates on `nodes`.
 *
 * @example
 * const registry: UPGRegistry = {
 *   nodes: [
 *     { id: 'persona_developer', type: 'persona', title: 'Developer',
 *       properties: { audience_role: 'user' } },
 *   ],
 * }
 */
export interface UPGRegistry {
  /** Canonical shared entities. Each is a normal node addressed as `registry/{id}`. */
  nodes: UPGBaseNode[]
  /** Reserved: canonical-internal relationships. Optional; unused by v1 tooling. */
  edges?: UPGEdge[]
}

// ─── Document integrity ───────────────────────────────────────────────────────

/**
 * Checksum-backed tamper-evidence metadata stamped into a `UPGDocument` at
 * save time by the MCP server. Consumers re-hash on load and compare.
 *
 * @example
 * const integrity: UPGIntegrity = {
 *   checksum: 'a3f1c9e2b7d4806f1a5c3b2e8d9f4c17',
 *   verified_at: '2026-04-17T09:42:11.004Z',
 *   verified_by: 'upg-mcp-server@0.2.0',
 * }
 */
export interface UPGIntegrity {
  /** SHA-256 checksum of nodes + edges content (hex, first 32 chars) */
  checksum: string
  /** ISO 8601 timestamp when checksum was computed */
  verified_at: string
  /** Tool that computed the checksum */
  verified_by: string
}

// ─── Single-product document ──────────────────────────────────────────────────

/**
 * A UPGDocument is a portable, versioned snapshot of a product's knowledge graph.
 *
 * How the format works:
 *
 * Every node carries its source identity (source_id + source_type + source.tool),
 * so the original record stays traceable and round-trips work.
 *
 * Every mapped entity carries `mapping_confidence`. When a source type doesn't
 * map cleanly, the confidence value records how uncertain the mapping is.
 *
 * `UPGEntityType` is a closed union. Adapters map unknown source types to the
 * nearest UPG type and preserve the original in `source_type` for auditing.
 *
 * Extra properties pass through in `properties` as they were received.
 *
 * `upg_version` records the spec version. Tools use it for forward compatibility.
 */
export interface UPGDocument {
  /** Spec version (semver string, e.g. "0.1"). */
  upg_version: string
  /** ISO 8601 timestamp of export */
  exported_at: string
  /** The tool that produced this document */
  source: UPGSource
  /** The root product */
  product: UPGProduct
  /** All nodes in the graph */
  nodes: UPGBaseNode[]
  /** All edges connecting nodes */
  edges: UPGEdge[]
  /**
   * Workspace member kind (0.10.0, #45). `product` (default / absent) = a product
   * under management; `org_rollup` = the company umbrella graph (org-level vision
   * and OKRs, not a shippable product); `watched` = an externally monitored
   * intelligence graph (e.g. a competitor). Serialised to `$upg.member_kind`;
   * cached in workspace.json + the portfolio registry for enumeration and counts.
   */
  member_kind?: 'product' | 'org_rollup' | 'watched'
  /** Integrity checksum. Set by the MCP server on save, verified on load. */
  _integrity?: UPGIntegrity
}

// ─── Portfolio document ───────────────────────────────────────────────────────

/**
 * A UPGPortfolioDocument is a portable, versioned snapshot of a multi-product portfolio.
 *
 * It extends the single-product format with:
 * - An organisation root
 * - Product areas (the organisational axis: who owns what)
 * - Portfolios (the strategic axis: where we invest)
 * - Multiple products, each with their own nodes and edges
 * - Cross-product edges that link entities across products
 *
 * The format is additive. Single-product `.upg` files (UPGDocument) remain valid.
 */
export interface UPGPortfolioDocument {
  /** Spec version (semver string, e.g. "0.2"). */
  upg_version: string
  /** Document type discriminator */
  type: 'portfolio'
  /** ISO 8601 timestamp of export */
  exported_at: string
  /** The tool that produced this document */
  source: UPGSource
  /** The organisation that owns this portfolio */
  organization: UPGOrganization
  /** Product areas (the organisational axis). */
  product_areas: UPGProductArea[]
  /** Portfolios (the strategic axis). */
  portfolios: UPGPortfolio[]
  /** All products in the portfolio, each with their own nodes and edges */
  products: Array<UPGProduct & { nodes: UPGBaseNode[]; edges: UPGEdge[] }>
  /** Cross-product edges linking entities across products */
  cross_edges: UPGCrossEdge[]
  /**
   * The canonical shared-entity registry (shared-vocabulary tier). Optional and
   * additive: portfolio documents without a registry remain valid, and an empty
   * registry is omitted rather than serialised. Product instances reference
   * canonical nodes here via `instance_of` cross-edges (`registry/{node_id}`).
   */
  registry?: UPGRegistry
}
