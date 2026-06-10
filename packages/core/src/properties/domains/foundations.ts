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
 * @example
 * const properties: SpecificationProperties = {
 *   kind: 'language',
 *   language_flavor: 'query',
 *   governance: 'open_spec_stewarded',
 *   steward: 'Sanity',
 *   openness: 'open',
 *   spec_url: 'https://sanity.io/docs/groq',
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
 * pass around and compose with (a Portable Text block, a Sanity reference, a
 * Git commit, a Stripe PaymentIntent). Lifecycle-free, like `metric`.
 *
 * @example
 * const properties: PrimitiveProperties = {
 *   primitive_kind: 'block',
 *   defined_by: 'specification/portable_text',
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
