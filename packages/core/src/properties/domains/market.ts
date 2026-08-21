/**
 * UPG Property Schemas: Market Intelligence Domain.
 * Competitor, CompetitorFeature, MarketTrend, MarketSegment, CompetitiveAnalysis.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate, ISODateTime, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// MARKET INTELLIGENCE
// ---------------------------------------------------------------------------

/** A product or approach competing for the same user need.
 *
 * @example
 * const properties: CompetitorProperties = {
 *   positioning: 'For product teams drowning in AI output.',
 *   pricing_model: 'per-seat SaaS',
 *   website: 'https://entopo.app',
 *   strengths: ['Real-time multiplayer canvas', 'Generous free tier'],
 *   weaknesses: ['Weak API query capabilities', 'No mobile companion'],
 * }
 */
export interface CompetitorProperties {
  /** Market positioning */
  positioning?: string
  /** Pricing model (e.g. "freemium", "per-seat SaaS", "usage-based") */
  pricing_model?: string
  /** Public website URL */
  website?: string
  /**
   * Bulleted factual strengths. Each item is a short statement, not prose.
   * @example ['Real-time multiplayer canvas', 'Generous free tier']
   */
  strengths?: string[]
  /**
   * Bulleted factual weaknesses: gaps, friction, or capabilities materially below market.
   * @example ['Weak API query capabilities', 'No mobile companion']
   */
  weaknesses?: string[]
  /**
   * Provenance: ISO date-time this record was last observed or refreshed.
   * Lets a stale record be told apart from a fresh one.
   * @example "2026-06-13"
   */
  last_updated?: string
  /**
   * Provenance: where this was observed. A changelog, pricing, or docs URL,
   * an analyst report, or a research note.
   * @example "https://docs.larch.example/pricing/"
   */
  source?: string
  /**
   * Provenance: how sure we are, on the canonical confidence_5 scale.
   * Carries both a numeric value and a high / medium / low label.
   */
  confidence?: UPGAssessment
  /**
   * Provenance: agent or routine id that last wrote this. Absent when
   * hand-authored, the signal that a human (not a poller) is the last writer.
   * @example "competitor-watch-agent"
   */
  observed_by?: string
}

// ---------------------------------------------------------------------------
// MARKET EXPANSION
// ---------------------------------------------------------------------------

/** Competitor feature or capability.
 *
 * @example
 * const properties: CompetitorFeatureProperties = {
 *   is_gap: true,
 *   our_equivalent: 'Canvas workspace',
 *   quality: 'better',
 * }
 */
export interface CompetitorFeatureProperties {
  /**
   * Our equivalent feature, if any. Leave empty when we offer nothing equivalent.
   * @example "Canvas collaboration"
   */
  our_equivalent?: string
  /** Gap in our offering. True when `our_equivalent` is absent or materially inferior. */
  is_gap: boolean
  /**
   * Quality comparison.
   * `better` = ours is meaningfully superior. `same` = roughly equivalent.
   * `worse` = theirs is meaningfully superior. `missing` = we have no equivalent.
   */
  quality?: 'better' | 'same' | 'worse' | 'missing'
  /**
   * Parity. More granular than `quality`; captures whether the gap is offensive or defensive.
   * `ahead` = we lead. `behind` = they lead. `parity` = equivalent.
   * `unique_to_us` / `unique_to_them` = only one side offers it.
   */
  parity_status?: 'ahead' | 'behind' | 'parity' | 'unique_to_us' | 'unique_to_them'
  /**
   * ISO date this assessment was last updated. Competitor feature landscapes change quickly.
   * @example "2026-02-15"
   */
  last_updated?: string
  /**
   * Provenance: where this was observed. A changelog, pricing, or docs URL,
   * an analyst report, or a research note.
   * @example "https://docs.larch.example/changelog/"
   */
  source?: string
  /**
   * Provenance: how sure we are, on the canonical confidence_5 scale.
   * Carries both a numeric value and a high / medium / low label.
   */
  confidence?: UPGAssessment
  /**
   * Provenance: agent or routine id that last wrote this. Absent when
   * hand-authored, the signal that a human (not a poller) is the last writer.
   * @example "competitor-watch-agent"
   */
  observed_by?: string
}

/** Market trend.
 *
 * @example
 * const properties: MarketTrendProperties = {
 *   relevance: 4,
 *   timeframe: '12-18 months',
 *   impact: 4,
 * }
 */
export interface MarketTrendProperties {
  /** Relevance to our product (1 = low, 5 = critical). */
  relevance?: UPGAssessment
  /**
   * Expected peak or mainstream window.
   * @example "12-18 months", "2027"
   */
  timeframe?: string
  /** Expected impact on our market or category. */
  impact?: UPGAssessment
  /**
   * Source of the trend data: analyst report, research firm, observed behaviour.
   * @example "Gartner Hype Cycle 2025", "Observed in user interviews Q1 2026"
   */
  source?: string
  /**
   * Provenance: ISO date-time this record was last observed or refreshed.
   * Lets a stale record be told apart from a fresh one.
   * @example "2026-06-13"
   */
  last_updated?: string
  /**
   * Provenance: how sure we are, on the canonical confidence_5 scale.
   * Carries both a numeric value and a high / medium / low label.
   */
  confidence?: UPGAssessment
  /**
   * Provenance: agent or routine id that last wrote this. Absent when
   * hand-authored, the signal that a human (not a poller) is the last writer.
   * @example "competitor-watch-agent"
   */
  observed_by?: string
}

/** MarketSegment entity.
 *
 * @example
 * const properties: MarketSegmentProperties = {
 *   segment_size: 12000,
 *   growth_rate: 0.15,
 *   tam: 42,
 * }
 */
export interface MarketSegmentProperties {
  /** Potential customers in this segment */
  segment_size?: number
  /**
   * YoY growth rate as a decimal.
   * @example 0.15 represents 15%
   */
  growth_rate?: number
  /** Total Addressable Market (currency units) */
  tam?: number
  /** Serviceable Addressable Market (currency units) */
  sam?: number
}

/** Competitive analysis exercise or snapshot.
 *
 * @example
 * const properties: CompetitiveAnalysisProperties = {
 *   analysis_type: 'feature_comparison',
 *   analysis_date: '2026-03-15',
 *   framework_id: 'lean-canvas',
 * }
 */
export interface CompetitiveAnalysisProperties {
  /**
   * Type of analysis.
   * `feature_comparison` = side-by-side matrix.
   * `positioning` = competitor positioning relative to each other.
   * `swot` = strengths, weaknesses, opportunities, threats.
   * `pricing` = pricing structure comparison.
   */
  analysis_type?: 'feature_comparison' | 'positioning' | 'swot' | 'pricing'
  /**
   * ISO date conducted. Competitive intelligence decays quickly; track snapshot age.
   * @example "2026-03-15"
   */
  analysis_date?: ISODate
  /**
   * Framework ID (references `UPGFramework.id`).
   * @example "porter-five-forces", "swot-analysis", "competitive-matrix"
   */
  framework_id?: string
  /**
   * Empty cells in a two-axis classification matrix that earn explicit
   * commentary, and only the strategically interesting ones. Opportunity-kind
   * cells are the most valuable: they identify unoccupied strategic space.
   *
   * @remarks
   * Each entry references two `classification_value` nodes by id, one from each
   * `classification_axis` child of this `competitive_analysis`.
   * `validate_graph` enforces that the refs resolve to `classification_value`
   * nodes whose parents are distinct `classification_axis` instances, so a cell
   * cannot name two values from the same axis.
   *
   * See `ClassificationValueProperties.commitments` for the inverse
   * "occupied cell" structural-definition shape.
   *
   * A worked pair, one of each rationale kind:
   *   [
   *     { axis_a_value_ref: 'val-git-based', axis_b_value_ref: 'val-structured-text',
   *       rationale_kind: 'opportunity',
   *       rationale_md: 'No technical reason; only adoption inertia. Watching brief.' },
   *     { axis_a_value_ref: 'val-composable', axis_b_value_ref: 'val-wysiwyg',
   *       rationale_kind: 'structural',
   *       rationale_md: 'Composable rejects HTML blobs; WYSIWYG requires them.' },
   *   ]
   */
  empty_cells?: Array<EmptyCell>
  /**
   * Provenance: ISO date-time this record was last observed or refreshed.
   * Distinct from `analysis_date` (when the analysis was conducted).
   * @example "2026-06-13"
   */
  last_updated?: string
  /**
   * Provenance: where this was observed. A changelog, pricing, or docs URL,
   * an analyst report, or a research note.
   * @example "https://docs.larch.example/changelog/"
   */
  source?: string
  /**
   * Provenance: how sure we are, on the canonical confidence_5 scale.
   * Carries both a numeric value and a high / medium / low label.
   */
  confidence?: UPGAssessment
  /**
   * Provenance: agent or routine id that last wrote this. Absent when
   * hand-authored, the signal that a human (not a poller) is the last writer.
   * @example "competitor-watch-agent"
   */
  observed_by?: string
}

/** Competitor signal: a dated competitor move mapped onto our portfolio.
 *
 * An append-only event (feature launch, pricing change, acquisition, partnership,
 * market entry) emitted by a competitor. Distinct from `market_trend` (macro,
 * no single actor) and `launch` (our own ship event).
 *
 * @example
 * const properties: CompetitorSignalProperties = {
 *   observed_at: '2026-06-10',
 *   signal_type: 'feature_launch',
 *   summary: 'Shipped Visual Editor AI Assist',
 *   impact: 'high',
 * }
 */
export interface CompetitorSignalProperties {
  /**
   * ISO date-time the move was observed.
   * @example "2026-06-10"
   */
  observed_at?: ISODateTime
  /**
   * Kind of move: a shipped `feature_launch`, a `pricing_change`, the strategic
   * `acquisition` / `partnership` / `market_entry`, or a `reclassification`
   * when the competitor moves between classification cells on an axis.
   *
   * @remarks
   * `reclassification` is auto-emitted at the classify-write chokepoint rather
   * than authored, and carries `axis`, `from_value`, `to_value` and
   * `competitor` so the move is reconstructable without diffing two snapshots.
   */
  signal_type?: 'feature_launch' | 'pricing_change' | 'acquisition' | 'partnership' | 'market_entry' | 'reclassification'
  /** One-line factual summary of the move (what shipped, not marketing copy). */
  summary?: string
  /** Expected impact on our position. */
  impact?: 'high' | 'medium' | 'low'
  /**
   * Reclassification only. The qualified id of the competitor that moved, as the
   * classify cross-edge source (e.g. `p_rival/n_acme`). Identifies both the
   * subject and its owning product, so `diff_classification({ product })` can
   * filter the history stream.
   */
  competitor?: string
  /**
   * Reclassification only. The `classification_axis` id the move is on (e.g.
   * `ca_ai_maturity`). Mirrors the axis the superseded and new classify edges
   * share.
   */
  axis?: string
  /**
   * Reclassification only. The prior `classification_value` id the competitor
   * was classified as before this move (the superseded cell). Absent for a
   * first-time classification (nothing was superseded).
   */
  from_value?: string
  /**
   * Reclassification only. The new `classification_value` id the competitor is
   * classified as after this move (the cell the new classify edge points at).
   */
  to_value?: string
  /**
   * Provenance: ISO date-time this record was last observed or refreshed.
   * @example "2026-06-13"
   */
  last_updated?: string
  /**
   * Provenance: where this was observed. A changelog, pricing, or docs URL,
   * an analyst report, or a research note.
   * @example "https://docs.larch.example/changelog/"
   */
  source?: string
  /**
   * Provenance: how sure we are, on the canonical confidence_5 scale.
   * Carries both a numeric value and a high / medium / low label.
   */
  confidence?: UPGAssessment
  /**
   * Provenance: agent or routine id that last wrote this. Absent when
   * hand-authored, the signal that a human (not a poller) is the last writer.
   * @example "competitor-watch-agent"
   */
  observed_by?: string
}

// ---------------------------------------------------------------------------
// CLASSIFICATION
// ---------------------------------------------------------------------------

/**
 * Defining architectural commitment of a `classification_value`.
 *
 * The N (typically 2–4) load-bearing axes that define the category. Removing
 * any one collapses the category into a different paradigm: "take typing away
 * from composable and you have headless, not composable."
 *
 * Commitments describe the *load-bearing definition*; `ClassificationCapability`
 * entries describe the *surface capabilities*.
 */
export interface ClassificationCommitment {
  /** Short structured label. What the commitment is (e.g. "Typed content graph"). */
  name: string
  /** One paragraph: why this commitment is load-bearing. */
  description: string
}

/**
 * The six canonical capability surfaces of a `classification_value`.
 *
 * Enum-narrowed because competitive-landscape exercises treat these as fixed columns.
 * Propose an addition rather than free-stringing a 7th surface.
 */
export type ClassificationCapabilitySurface =
  | 'delivery'
  | 'extensibility'
  | 'collaboration'
  | 'preview'
  | 'localization'
  | 'developer_experience'

/**
 * A capability surface and its bullet list on a `classification_value`.
 *
 * Collapses six identically-shaped dossier sections (delivery / extensibility /
 * collaboration / preview / localization / DX) into one structured field.
 * Each surface appears at most once per `classification_value`.
 *
 * Capabilities describe the *surface offering*; companion `ClassificationCommitment`
 * entries describe the *load-bearing definition*.
 */
export interface ClassificationCapability {
  /** Canonical surface this group describes */
  surface: ClassificationCapabilitySurface
  /** Ordered short factual bullets */
  bullets: string[]
}

/**
 * Reason a (axis_a × axis_b) cell in a 2-axis classification matrix is unoccupied.
 *
 * Three flavours observed in competitive-landscape work:
 *   `structural` = structurally incompatible; physics says no.
 *   `ideological` = culturally implausible; values/incentives say no.
 *   `opportunity` = nobody has done it yet; watching brief, strategic option.
 *
 * Opportunity-kind cells are the most analytically valuable: they identify
 * unoccupied strategic space.
 */
export type EmptyCellRationaleKind = 'structural' | 'ideological' | 'opportunity'

/**
 * An empty (axis_a_value × axis_b_value) cell with rationale for non-occupancy.
 *
 * Meaningful on `competitive_analysis` nodes with exactly two
 * `classification_axis` children. `validate_graph` advises when this shape
 * appears on a non-2-axis analysis.
 *
 * `axis_a_value_ref` and `axis_b_value_ref` are string ids of
 * `classification_value` nodes (refs by id, not embedded snapshots, so the shape
 * survives value-rename). Each ref must be a child of a distinct
 * `classification_axis` (one from each axis).
 */
export interface EmptyCell {
  /** Id of the axis-A `classification_value` */
  axis_a_value_ref: string
  /** Id of the axis-B `classification_value` */
  axis_b_value_ref: string
  /** Reason for non-occupancy */
  rationale_kind: EmptyCellRationaleKind
  /** Markdown rationale. One paragraph. Opportunity cells deserve `research_question` children. */
  rationale_md: string
}

/** ClassificationAxis: a dimension along which subjects are classified.
 *
 * A top-level taxonomy axis, hosted by either a `competitive_analysis` (via
 * `competitive_analysis_dimensioned_by_classification_axis`) or a `product` (via
 * `product_dimensioned_by_classification_axis`, added at 0.32.0 so a product can
 * carry its own label taxonomy without inventing a `tag` entity). Common shapes:
 * "CMS Architecture", "Editing Paradigm", "Database × Workload Type",
 * "IDE × Language Ecosystem".
 *
 * @example
 * const properties: ClassificationAxisProperties = {
 *   axis_kind: 'categorical',
 * }
 *
 * @example
 * // Canonical governance axis `change_blast_radius` (ordinal): grade a change /
 * // feature / decision by how much risk it carries, so review ceremony and
 * // agent-autonomy gating scale with reach. Four ordered values —
 * // Trivial(0) < Standard(1) < Significant(2) < Critical(3) — classified via the
 * // polymorphic `node_classified_as_classification_value` edge. Report metrics
 * // WITHIN tier (pooling across tiers is Simpson's-paradox bait). See
 * // decisions/2026-07-15-change-blast-radius-axis.md.
 * const properties: ClassificationAxisProperties = {
 *   axis_kind: 'ordinal',
 * }
 */
export interface ClassificationAxisProperties {
  /**
   * Structural kind of values on this axis.
   * `categorical` = discrete, unordered (most common; CMS architectures).
   * `ordinal` = discrete, ordered (maturity tiers, T-shirt sizes).
   * `continuous` = numeric range (latency budget, price points).
   */
  axis_kind?: 'categorical' | 'ordinal' | 'continuous'
  /**
   * How many values a subject may hold on this axis at once. `single` (the
   * default) means re-classifying SUPERSEDES the prior value; `multi` means it
   * ADDS one.
   *
   * @remarks
   * Under `single` the classify writer retires the old same-axis edge and
   * records the move in the reclassification history, so the change is
   * traceable rather than silent. `multi` suits an axis like "supported
   * frameworks", where holding several values at once is the truth.
   *
   * A separate axis from `axis_kind`: an axis can be `categorical` (unordered)
   * yet single-select, or `categorical` yet multi-select. The two answer
   * different questions and neither implies the other.
   */
  cardinality?: 'single' | 'multi'
}

/** ClassificationValue: a value on a classification axis.
 *
 * One position on a `classification_axis`: "Composable Structured-Content",
 * "Headless API-First", "Git-Based Repo-as-Database". Reusable across the row
 * dossier and the column dossier of a 2-axis matrix.
 *
 * @example
 * const properties: ClassificationValueProperties = {
 *   rationale: 'Composable extends headless with three load-bearing commitments.',
 *   exemplars: ['Nimbus', 'Larch', 'Prism'],
 *   commitments: [
 *     { name: 'Typed content graph', description: 'Schemas in code; references as edges.' },
 *     { name: 'Real-time backend', description: 'Live queries, CRDT collaboration.' },
 *     { name: 'Embeddable studio', description: 'Editor is a library hosted inside the team app.' },
 *   ],
 *   capabilities: [
 *     { surface: 'delivery', bullets: ['NQL', 'GraphQL', 'REST', 'Live Sync API'] },
 *   ],
 * }
 */
export interface ClassificationValueProperties {
  /**
   * Short paragraph: why this value earns its own row/column.
   * Longer narrative belongs in `summary_md` or attached `content_piece` nodes.
   */
  rationale?: string
  /**
   * Free-text examples of products occupying this value.
   * For queryable occupancy, prefer `competitor` nodes with `classified_as` edges.
   * @example ['Nimbus', 'Larch', 'Prism']
   */
  exemplars?: string[]
  /**
   * The load-bearing commitments that define this category, typically two to
   * four. Each is a structural axis: removing it changes the category.
   *
   * @remarks
   * Pairs with `capabilities`, and the distinction matters when deciding where
   * a bullet belongs: commitments are the load-bearing DEFINITION, capabilities
   * are the surface OFFERING. A capability can be dropped without the category
   * changing; a commitment cannot.
   *
   * A worked set:
   *   [
   *     { name: 'Typed content graph', description: 'Schemas in code; references as edges; content is structured data.' },
   *     { name: 'Real-time backend', description: 'Live queries, CRDT collaboration, sub-second propagation.' },
   *     { name: 'Embeddable studio', description: 'Editor is a library hosted inside the team app, not an external portal.' },
   *   ]
   */
  commitments?: Array<ClassificationCommitment>
  /**
   * Structured capability bullets across the six canonical surfaces. Each
   * surface appears at most once per `classification_value`.
   *
   * @remarks
   * Pairs with `commitments`, and the distinction decides where a bullet
   * belongs: capabilities describe what the category OFFERS, commitments
   * describe what DEFINES it. Dropping a capability leaves the category intact;
   * dropping a commitment does not.
   *
   * @example
   *   [
   *     { surface: 'delivery', bullets: ['NQL', 'GraphQL', 'REST', 'Live Sync API', 'Asset CDN'] },
   *     { surface: 'extensibility', bullets: ['Custom input components', 'editor plugins'] },
   *   ]
   */
  capabilities?: Array<ClassificationCapability>
}
