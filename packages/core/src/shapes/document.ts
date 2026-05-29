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
]

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
  /** Strategic priority */
  strategic_priority?: 'critical' | 'high' | 'medium' | 'low'
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
}
