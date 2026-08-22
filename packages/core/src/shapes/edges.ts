/**
 * UPG Edge type union and `UPGEdge` interface.
 * `UPGEdgeType` is derived from `UPG_EDGE_CATALOG` via `keyof typeof`.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGMappingConfidence } from './base-node.js'
import type { ISODateTime } from '../properties/primitives.js'
import type { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'

// ─── Edge types (derived from registry) ──────────────────────────────────────

/** Union of all edge type keys from the canonical edge registry */
export type UPGEdgeType = keyof typeof UPG_EDGE_CATALOG

/**
 * Where an edge came from, when it was not authored directly.
 *
 * @remarks
 * WHY UNGATED, and the precedent settles it. The obvious objection is that this
 * belongs behind `carries_properties`. It does not: `mapping_confidence` is
 * ALREADY an ungated provenance field on every edge. The `carries_properties`
 * gate exists to keep semantic edges free of domain PAYLOAD — a MoSCoW bucket, a
 * RICE score, a canvas slot, facts about the relationship's content. Provenance
 * is not content; it is a fact about the record, in the same class as the field
 * already sitting ungated beside it. Gating it would mean an edge has to opt in
 * to having a history, which is the wrong shape for a universal fact and would
 * make an emission pass check whether the edge it is writing is allowed to
 * remember anything.
 *
 * WHY NESTED, and it is a collision rather than a preference. `UPGEdge.source`
 * already means the source NODE. A flat `source_id` copied from the node side
 * would sit one character from it and mean something entirely different — the
 * exact misreading generator `external_refs` was rejected for at 0.33.0. Nesting
 * removes the collision completely and costs one field.
 *
 * WHY IT EXISTS AT ALL. The node side has carried `source_id`, `source_type`,
 * `mapping_confidence`, `external_tool`, `external_ref`, `external_id` and, since
 * 0.33.0, `created_at` / `updated_at`. A node knows where it came from; an edge
 * knew only how sure the importer was. A bulk emission of 651 derived edges had
 * nowhere ON THE EDGE to record derived-by-what, from-which-fact, or when, so the
 * record lived in a sidecar ledger outside the graph. That is the sibling of the
 * question documents-as-entities exists to answer: provenance belongs to the
 * thing, not beside it.
 *
 * NOT a substitute for `mapping_confidence`, which answers a different question
 * (how sure an import was that this edge TYPE was right) and stays where it is.
 */
export interface UPGEdgeProvenance {
  /** The tool or pass that derived it. Same posture as `UPGBaseNode.external_tool`. */
  tool?: string
  /** The fact it was derived FROM: a source field, a property key, a ledger id. */
  from?: string
  /** ISO timestamp of the derivation. */
  at?: ISODateTime
}

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
   * definition sets `carries_properties: true`. `framework_exercise_includes_node`
   * is the archetype, storing a framework's per-entity result here (a MoSCoW
   * bucket, a RICE score, a canvas slot, a funnel stage). A value that exists
   * only within a specific exercise of a framework is a fact about the
   * *relationship*, not about either endpoint, so it belongs on the edge. Plain
   * semantic edges stay payload-free; validators reject `properties` on edges
   * that do not opt in.
   *
   * @remarks
   * CORRECTED 0.34.0. This said the gate applies "currently the
   * `framework_exercise_includes_node` edge". ELEVEN catalog edges set
   * `carries_properties: true`. One word — "currently" — was doing the work of a
   * gate nobody wired, and the sentence had been wrong for ten mints. The set is
   * derivable from the catalog and is not restated here, for the reason this
   * correction exists: a hand-maintained census in a comment is a claim with
   * nothing recomputing it.
   *
   * NOT the home for provenance. See `provenance` below: a fact about the record
   * is not domain payload, and requiring an opt-in to have a history is the wrong
   * shape.
   */
  properties?: Record<string, unknown>
  /** Where this edge came from, when it was not authored directly. */
  provenance?: UPGEdgeProvenance
}
