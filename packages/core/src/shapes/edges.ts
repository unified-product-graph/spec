/**
 * UPG Edge type union and `UPGEdge` interface.
 * `UPGEdgeType` is derived from `UPG_EDGE_CATALOG` via `keyof typeof`.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGMappingConfidence } from './base-node.js'
import type { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'

// ─── Edge types (derived from registry) ──────────────────────────────────────

/** Union of all edge type keys from the canonical edge registry */
export type UPGEdgeType = keyof typeof UPG_EDGE_CATALOG

/** Interface for a semantic relationship between two nodes */
export interface UPGEdge {
  /** Unique identifier within the graph */
  id: string
  /** Source node ID */
  source: string
  /** Target node ID */
  target: string
  /** The semantic relationship type. Must be a key from UPG_EDGE_CATALOG. */
  type: UPGEdgeType
  /** Confidence level if this edge type was inferred during import */
  mapping_confidence?: UPGMappingConfidence
  /**
   * Edge-scoped properties. Permitted ONLY on edge types whose catalog
   * definition sets `carries_properties: true` — currently the
   * `framework_exercise_includes_node` edge, which stores a framework's
   * per-entity result here (a MoSCoW bucket, a RICE score, a canvas slot, a
   * funnel stage). A value that exists only within a specific exercise of a
   * framework is a fact about the *relationship*, not about either endpoint,
   * so it belongs on the edge. Plain semantic edges stay payload-free;
   * validators reject `properties` on edges that do not opt in.
   */
  properties?: Record<string, unknown>
}
