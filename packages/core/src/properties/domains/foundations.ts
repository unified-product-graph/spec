/**
 * UPG Property Schemas: Foundations Domain.
 * Specification (governed specs: query languages, protocols, formats,
 * encodings) and Primitive (the compositional units a specification defines).
 * Both are registry-hostable canonicals. Added in 0.9.12.
 * https://unifiedproductgraph.org/spec | MIT
 */

// ---------------------------------------------------------------------------
// FOUNDATIONS LAYER
// ---------------------------------------------------------------------------

/** A governed specification: a query language, protocol, data format, encoding,
 * or interface contract that one or more products implement, expose, or conform
 * to. The genus type; whether it is also a ratified `standard` is carried by
 * `governance`, not the type.
 *
 * @remarks
 * THE THREE RELATIONSHIPS ARE REAL, AND THEY ARE PORTFOLIO CROSS-EDGES RATHER
 * THAN CATALOG EDGES. This paragraph replaces one that said the opposite. The
 * verbs in the summary above resolve to `product_implements_specification`,
 * `product_exposes_specification` and `feature_conforms_to_specification`, all
 * three of which have existed since 0.9.12 in `UPG_CROSS_ONLY_EDGE_TYPES`. They
 * are portfolio-native by design: a governed specification is a registry
 * canonical, so a product links to it at `registry/{node_id}`, the same shape as
 * `instance_of`. Nothing in the within-graph edge catalog points from `product`
 * or `feature` at `specification`, and that is deliberate rather than missing.
 *
 * WHY THIS CORRECTION MATTERS TO ANYONE READING A DOC THAT CITES THEM. An
 * editorial sweep flagged those three names in a published entity doc as
 * fabricated, on the strength of a catalog-only search. They are not fabricated.
 * A citation check that reads only the edge catalog will report every legitimate
 * cross-only edge as a phantom, which is a false positive with the same shape as
 * a real one. Check both registries before calling a name invented.
 *
 * THE GAP THAT DOES REMAIN, stated rather than closed. A `specification` node
 * held inside a SINGLE product graph, with no portfolio around it, has no
 * conformance edge available, because the cross-only tier needs a registry
 * target. A claim can ride the universal `node_constrains_node`, which is honest
 * and unqueryable as conformance. Closing that case is banked, with its condition
 * the first single-product graph that models a specification it conforms to.
 *
 * @example
 * const properties: SpecificationProperties = {
 *   kind: 'language',
 *   language_flavor: 'query',
 *   governance: 'open_spec_stewarded',
 *   steward: 'Nimbus',
 *   openness: 'open',
 *   spec_url: 'https://nimbus.example/docs/nql',
 *   current_version: '1.0',
 *   since: '2019',
 * }
 */
export interface SpecificationProperties {
  /** What the artifact fundamentally is, independent of how it is governed. */
  kind?: 'language' | 'protocol' | 'data_format' | 'encoding' | 'interface_contract' | 'object_model'
  /** Set only when `kind` is `language`: the kind of language. */
  language_flavor?: 'query' | 'programming' | 'markup' | 'styling' | 'schema' | 'template'
  /**
   * How the specification is governed (its ratification status, and whether it
   * counts as a `standard`). `open_standard_consortium` is a formal standard
   * (W3C, IETF, ISO); `de_facto` and `internal_primitive` never became one.
   */
  governance?: 'open_spec_stewarded' | 'open_standard_consortium' | 'proprietary_open' | 'internal_primitive' | 'de_facto'
  /** The governing body or organisation (may later become an `organization` ref). */
  steward?: string
  /** Whether the specification itself is open or proprietary. */
  openness?: 'open' | 'proprietary'
  /** URL of the published specification. */
  spec_url?: string
  /** Latest published version string. */
  current_version?: string
  /** Year or version the specification was introduced. */
  since?: string
  /** How conformance is tested (test suite, certification program). Optional. */
  conformance?: string
}

/** A foundational compositional unit a specification defines: the noun products
 * pass around and compose with (a Structured Text block, a typed reference, a
 * Git commit, a Stripe PaymentIntent). Lifecycle-free, like `metric`.
 *
 * @example
 * const properties: PrimitiveProperties = {
 *   primitive_kind: 'block',
 *   defined_by: 'specification/structured_text',
 *   since: '2018',
 * }
 */
export interface PrimitiveProperties {
  /** The shape of the thing products pass around. */
  primitive_kind?: 'data_type' | 'object' | 'block' | 'unit'
  /** The `specification/<slug>` this primitive comes from; nullable for spec-less internal primitives. Mirrors the `primitive_defined_by_specification` edge for quick lookup. */
  defined_by?: string
  /** Year or version the primitive was introduced. */
  since?: string
}

/** An operating_lifecycle: a canonical, ordered (often cyclic) operating process
 * that many products' journey phases map onto — e.g. Nimbus's content-operations
 * lifecycle. Registry-hostable like a `specification`; the cross-product join key
 * that turns per-surface journeys into one operation. Distinct from the per-entity
 * status `lifecycle` grammar concept (this is an entity, not a state machine).
 *
 * @example
 * const properties: OperatingLifecycleProperties = {
 *   cyclic: true,
 *   source: 'a canonical 5-stage content-ops lifecycle',
 * }
 */
export interface OperatingLifecycleProperties {
  /** True if the process loops (e.g. Analyze → Extend → Plan). The sequence is fully expressed by the stages' `stage_order`; `cyclic` adds the wrap from the last stage back to the first. */
  cyclic?: boolean
  /** Origin of the canonical model (e.g. "a published content-ops lifecycle"). Optional provenance; promote to an edge if it names a real `specification`/`document`. */
  source?: string
}

/** An operating_stage: one ordered stage of an `operating_lifecycle`. A product's
 * `journey_phase` resolves to a stage via `journey_phase_realises_operating_stage`,
 * so the end-to-end operation is derived from the join key rather than stored.
 *
 * @example
 * const properties: OperatingStageProperties = {
 *   stage_order: 1,
 *   goal: 'Model, create, and review content',
 * }
 */
export interface OperatingStageProperties {
  /** Ordered position within the lifecycle, 0-indexed. The source of truth for sequence (pairs with `phase_order`/`step_order`/`action_order`). */
  stage_order?: number
  /** What this stage accomplishes. */
  goal?: string
  /** Role that owns the stage (free-text role label). Optional; promote to a `node_owned_by_role` edge if ownership must be queryable across stages. */
  owner_role?: string
}
