/**
 * UPG Assessment Scales. Spec-defined 5-point scales + `UPGAssessment`.
 * https://unifiedproductgraph.org/spec | MIT
 */

// ── Core Types ────────────────────────────────────────────────────────────────

/** An assessment is a human judgment mapped to a numeric scale.
 *  It carries both the qualitative meaning (label) and the numeric
 *  encoding (value) so UIs can display labels and formulas can compute
 *  scores. */
export interface UPGAssessment {
  /** The numeric value, used for computation. Must fall within the referenced
   *  scale's `min`..`max`. This is the ONLY field that carries cross-tool meaning. */
  value: number
  /** The qualitative label: what the assessor actually meant.
   *
   *  FREE TEXT BY CONTRACT (docket wave 2 item 7; clarification STAGED, release
   *  number assigned at release prep). This is the
   *  assessor's own word and is NOT required to equal the `UPGScalePoint.label` of
   *  the matching point. The two are different vocabularies serving different jobs:
   *  `UPGScalePoint.label` is the scale's display name for a point (what a picker
   *  offers); `UPGAssessment.label` is the judgment as it was actually authored
   *  (what a human wrote). `{ value: 5, label: 'critical' }` on a `severity_5`
   *  property is CONFORMANT even though point 5 displays as "Blocker" — indeed
   *  several property descriptions instruct writers to "carry the old word in
   *  `label`" when migrating a legacy enum.
   *
   *  Consequently: never reconcile stored labels against scale point labels, and
   *  never widen a scale's `points` to admit authored words. Compare on `value`.
   *
   *  The one exception is `friendly_aliases`. An alias (`low`/`medium`/`high`) is a
   *  writer-side shorthand, not a judgment — expanding it MUST yield both the
   *  canonical `value` and the canonical point label, so an unexpanded alias left
   *  sitting in `label` is a writer bug. */
  label: string
  /** Which assessment scale this was rated on.
   *  References a scale definition in the spec or in the document's
   *  scale_extensions. If omitted, the spec default scale for this
   *  property is assumed. */
  scale_id?: string
  /** Normalized 0-1 value, for cross-tool comparison when scales differ.
   *  Computed as (value - min) / (max - min). */
  normalized?: number
}


/** A scale definition provides the vocabulary for assessments */
export interface UPGScaleDefinition {
  /** Unique scale identifier */
  id: string
  /** Human-readable name */
  label: string
  /** What this scale measures */
  description: string
  /** Minimum value */
  min: number
  /** Maximum value */
  max: number
  /** Number of discrete points (undefined = continuous) */
  steps?: number
  /** Each point on the scale */
  points: UPGScalePoint[]
  /**
   * Friendly-word aliases that resolve to a canonical point `value` (UPG 0.11.1).
   * The single, introspectable source of truth so every writer that accepts a
   * friendly confidence word expands it to the SAME `confidence_5` value (and the
   * canonical point label), instead of each tool inventing its own mapping. e.g.
   * `{ low: 2, medium: 3, high: 4 }` — `high` is "Confident" (value 4), reserving
   * "Data-backed" (5) for genuinely quantified claims. Surfaced via `get_scale`.
   */
  friendly_aliases?: Record<string, number>
}

/** A single point on an assessment scale */
export interface UPGScalePoint {
  /** The numeric value */
  value: number
  /** The qualitative label the user sees */
  label: string
  /** Longer description */
  description: string
}

// ── Spec-Defined Scales ───────────────────────────────────────────────────────

/**
 * All spec-defined assessment scales, keyed by scale_id.
 *
 * These are the canonical scales for UPG-native tools. External tools may
 * declare additional scales in the document's scale_extensions field.
 */
export const UPG_SCALES: Record<string, UPGScaleDefinition> = {

  // ── Reach ──────────────────────────────────────────────────────────────────

  reach_5: {
    id: 'reach_5',
    label: 'Reach (5-point)',
    description: 'How many users experience this problem or benefit from this feature',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Almost no one',   description: 'Affects <5% of users' },
      { value: 2, label: 'A few',           description: 'Affects 5-20% of users' },
      { value: 3, label: 'Some',            description: 'Affects 20-50% of users' },
      { value: 4, label: 'Most',            description: 'Affects 50-80% of users' },
      { value: 5, label: 'Nearly everyone', description: 'Affects >80% of users' },
    ],
  },

  // ── Frequency ──────────────────────────────────────────────────────────────

  frequency_5: {
    id: 'frequency_5',
    label: 'Frequency (5-point)',
    description: 'How often the problem or situation occurs',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Rarely',      description: 'Less than once a month' },
      { value: 2, label: 'Occasionally', description: 'A few times a month' },
      { value: 3, label: 'Sometimes',   description: 'Weekly' },
      { value: 4, label: 'Often',       description: 'Multiple times a week' },
      { value: 5, label: 'Constantly',  description: 'Daily or more' },
    ],
  },

  // ── Severity ───────────────────────────────────────────────────────────────

  severity_5: {
    id: 'severity_5',
    label: 'Severity (5-point)',
    description: 'How badly the problem impacts the user when it occurs',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Mild inconvenience', description: 'Notices but works around easily' },
      { value: 2, label: 'Annoying',           description: 'Frustrated but can continue' },
      { value: 3, label: 'Significant',        description: 'Has to change approach' },
      { value: 4, label: 'Severe',             description: 'Struggles to accomplish goal' },
      { value: 5, label: 'Blocker',            description: 'Cannot accomplish goal' },
    ],
  },

  // ── Importance ─────────────────────────────────────────────────────────────

  importance_5: {
    id: 'importance_5',
    label: 'Importance (5-point)',
    description: 'How important this is to the user when evaluating or using a solution',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Nice to have',       description: 'Would not notice if absent' },
      { value: 2, label: 'Somewhat important', description: 'Prefer but can live without' },
      { value: 3, label: 'Important',          description: 'Actively looks for this' },
      { value: 4, label: 'Very important',     description: 'Key factor in decision' },
      { value: 5, label: 'Critical',           description: 'Dealbreaker if absent' },
    ],
  },

  // ── Satisfaction ───────────────────────────────────────────────────────────

  satisfaction_5: {
    id: 'satisfaction_5',
    label: 'Satisfaction (5-point)',
    description: 'How well the current solution meets the user\'s need',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Very unsatisfied', description: 'Current solution fails completely' },
      { value: 2, label: 'Unsatisfied',      description: 'Current solution inadequate' },
      { value: 3, label: 'Neutral',          description: 'Acceptable' },
      { value: 4, label: 'Satisfied',        description: 'Works well' },
      { value: 5, label: 'Very satisfied',   description: 'Exceeds expectations' },
    ],
  },

  // ── Pain ───────────────────────────────────────────────────────────────────

  pain_5: {
    id: 'pain_5',
    label: 'Pain (5-point)',
    description: 'How much friction or distress the problem causes the user',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Barely noticeable', description: 'Minor friction, easily ignored' },
      { value: 2, label: 'Mild',              description: 'Noticeable but not a priority to fix' },
      { value: 3, label: 'Moderate',          description: 'Actively wished it were better' },
      { value: 4, label: 'Significant',       description: 'Regularly disrupts workflow' },
      { value: 5, label: 'Extreme',           description: 'Major frustration, seeking alternatives' },
    ],
  },

  // ── Impact ─────────────────────────────────────────────────────────────────

  impact_5: {
    id: 'impact_5',
    label: 'Impact (5-point)',
    description: 'How much positive difference this solution or feature would make',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Minimal',       description: 'Barely moves the needle' },
      { value: 2, label: 'Low',           description: 'Small improvement' },
      { value: 3, label: 'Moderate',      description: 'Noticeable improvement' },
      { value: 4, label: 'High',          description: 'Significant improvement' },
      { value: 5, label: 'Transformative', description: 'Game-changing' },
    ],
  },

  // ── Confidence ─────────────────────────────────────────────────────────────

  confidence_5: {
    id: 'confidence_5',
    label: 'Confidence (5-point)',
    description: 'How well-evidenced this assessment or judgment is',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Guessing',       description: 'No evidence' },
      { value: 2, label: 'Hunch',          description: 'Anecdotal evidence' },
      { value: 3, label: 'Some evidence',  description: 'A few data points' },
      { value: 4, label: 'Confident',      description: 'Multiple data sources' },
      { value: 5, label: 'Data-backed',    description: 'Strong quantitative evidence' },
    ],
    // The pinned friendly mapping (0.11.1). `high` is Confident (4), not
    // Data-backed (5) — 5 is reserved for genuinely quantified claims. Matches
    // the existing classify-edge population, so nothing needs re-stamping.
    friendly_aliases: { low: 2, medium: 3, high: 4 },
  },

  // ── Likelihood ─────────────────────────────────────────────────────────────

  /**
   * (0.35.0) How likely a future event is to occur.
   *
   * Added because the nine pre-existing ladders had no probability ladder, and
   * `likelihood` was resolving to `confidence_5` — which is EPISTEMIC. Confidence
   * says how sure you are of a judgment ("Guessing → Data-backed"); likelihood
   * says how probable the event is. A risk you are certain about and a risk that
   * is certain to happen are different facts, and one ladder cannot hold both.
   *
   * Vocabulary is ISO 31000's, which is also what `risk.likelihood`,
   * `threat.likelihood` and the Notion fixtures already say in prose.
   *
   * Polarity is `low-is-good` (rendered by the design system's direction map,
   * which is where numeric-scale polarity lives): 5 on this ladder is bad news.
   */
  likelihood_5: {
    id: 'likelihood_5',
    label: 'Likelihood (5-point)',
    description: 'How likely this event is to occur',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Rare',           description: 'Would be surprising; no known precedent' },
      { value: 2, label: 'Unlikely',       description: 'Could happen, but not expected' },
      { value: 3, label: 'Possible',       description: 'Might happen; roughly even odds' },
      { value: 4, label: 'Likely',         description: 'Expected to happen absent intervention' },
      { value: 5, label: 'Almost certain', description: 'Expected to happen; plan for it' },
    ],
  },

  // ── Effort ─────────────────────────────────────────────────────────────────

  effort_5: {
    id: 'effort_5',
    label: 'Effort (5-point)',
    description: 'How much work is required to deliver this',
    min: 1,
    max: 5,
    steps: 5,
    points: [
      { value: 1, label: 'Trivial',     description: 'Hours' },
      { value: 2, label: 'Small',       description: 'Days' },
      { value: 3, label: 'Medium',      description: '1-2 weeks' },
      { value: 4, label: 'Significant', description: 'Weeks to months' },
      { value: 5, label: 'Massive',     description: 'Months+' },
    ],
  },

}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Look up a scale definition by its ID.
 *
 * Returns undefined for unknown IDs; callers should handle this case
 * gracefully (e.g. fall back to displaying raw value).
 *
 * @example
 * const scale = getScale('reach_5')
 * const point = scale?.points.find(p => p.value === assessment.value)
 */
export function getScale(scaleId: string): UPGScaleDefinition | undefined {
  return UPG_SCALES[scaleId]
}

/**
 * Resolve a friendly word (e.g. `high`) to a canonical assessment on a scale,
 * using the scale's pinned `friendly_aliases` (UPG 0.11.1). The single source of
 * truth every writer must use, so `high` is always the same `confidence_5` value
 * with the canonical point label — no per-tool drift. Returns `null` when the
 * scale has no aliases or the word is not aliased.
 *
 * @example
 * friendlyToAssessment('confidence_5', 'high')
 * // => { value: 4, label: 'Confident', scale_id: 'confidence_5' }
 */
export function friendlyToAssessment(
  scaleId: string,
  word: string,
): { value: number; label: string; scale_id: string } | null {
  const scale = UPG_SCALES[scaleId]
  const value = scale?.friendly_aliases?.[word]
  if (value === undefined) return null
  const point = scale!.points.find((p) => p.value === value)
  return { value, label: point?.label ?? word, scale_id: scaleId }
}

/**
 * Per-property scale overrides.
 *
 * Maps a property name to the scale that best captures its semantics.
 * Properties absent from this map fall back to `'scale_5'`, a generic
 * 1–5 ordinal. The mapping is keyed by property name only; the `entityType`
 * parameter on `getPropertyDefaultScale` is reserved for future per-entity
 * disambiguation.
 *
 * Sources: all `UPGAssessment`-typed properties across
 * `packages/upg-spec/src/properties/domains/` (audited at v0.4.0).
 */
export const PROPERTY_SCALE_MAP: Record<string, string> = {
  // ── Reach ────────────────────────────────────────────────────────────────
  reach:            'reach_5',       // discovery, users
  projected_reach:  'reach_5',       // validation/experiment_plan

  // ── Frequency ────────────────────────────────────────────────────────────
  frequency:        'frequency_5',   // discovery, users, feedback

  // ── Severity ─────────────────────────────────────────────────────────────
  severity:         'severity_5',    // users, engineering, ai, gtm, customer-success, security, accessibility
  severity_of_finding: 'severity_5', // validation/experiment_run
  bug_severity:     'severity_5',    // product-spec/bug ( Option C collapse)
  magnitude:        'severity_5',    // user/switching_cost barrier size (0.17.7; restores the documented intent that a missing entry had silently overridden to scale_5)
  risk_level:       'severity_5',    // compliance/risk ( Option B)
  scarcity_risk:    'severity_5',    // market-intelligence ( Option B)

  // ── Pain ─────────────────────────────────────────────────────────────────
  pain:             'pain_5',        // discovery
  pain_score:       'pain_5',        // user ( Option B)
  friction_score:   'pain_5',        // growth/ux ( Option B)

  // ── Impact ───────────────────────────────────────────────────────────────
  impact:           'impact_5',      // discovery, market, security, compliance
  projected_impact: 'impact_5',      // validation/experiment_plan
  revenue_impact:   'impact_5',      // sales/business-model ( Option B)
  effectiveness:    'impact_5',      // security/marketing ( Option B)
  opportunity_score: 'impact_5',     // discovery/opportunity ( Option B)

  // ── Confidence ───────────────────────────────────────────────────────────
  confidence:       'confidence_5',  // discovery, validation, sales, product-spec
  current_confidence: 'confidence_5', // validation/hypothesis ( Option B)
  probability:      'confidence_5',  // sales/forecast ( Option B)
  qualification_score: 'confidence_5', // sales/deal — how confident the qualification is (0.24.0)

  // ── Likelihood ───────────────────────────────────────────────────────────
  // (0.35.0) Moved off confidence_5. `likelihood` is how probable the event is,
  // not how well-evidenced the judgment is; the two were sharing one ladder
  // because no probability ladder existed. Carries market/risk (`risk`,
  // `market_trend`) and `security.threat.likelihood` in one line.
  likelihood:       'likelihood_5',  // compliance/risk, security/threat, market

  // ── Effort ───────────────────────────────────────────────────────────────
  effort:           'effort_5',      // discovery
  effort_estimate:  'effort_5',      // feedback
  effort_to_fix:    'effort_5',      // engineering
  cost_estimate:    'effort_5',      // validation/experiment_plan ( Option B)

  // ── Importance ───────────────────────────────────────────────────────────
  importance:       'importance_5',  // users
  influence:        'importance_5',  // team-org/stakeholder ( Option B)
  interest:         'importance_5',  // team-org/stakeholder ( Option B)
  relevance:        'importance_5',  // market/content ( Option B)
  weight:           'importance_5',  // validation/evidence ( Option B)

  // ── Satisfaction ─────────────────────────────────────────────────────────
  current_satisfaction: 'satisfaction_5', // users
  emotion_score:    'satisfaction_5', // ux-design/customer-success journey ( Option B)

  // Intentionally NOT mapped (resolve to the generic scale_5):
  //   rarity   : VRIO distinctiveness; no canonical named scale fits.
  //   strength : deprecated (validation/evidence; superseded by weight).
}

/**
 * Per-ENTITY scale overrides (0.35.0). Beats `PROPERTY_SCALE_MAP` for the one
 * entity named, and only that entity.
 *
 * This activates the per-entity disambiguation `getPropertyDefaultScale` has
 * reserved since v0.4.0. It exists for a narrow, real class: a property name
 * that means one thing on most entities and its opposite on one.
 *
 * `risk.impact` is that case. `impact_5` is benefit-framed ("Minimal →
 * Transformative") and reads high-is-good, which on discovery and market
 * entities is correct — a high-impact opportunity is good news. On a `risk`,
 * the same word means severity of consequences, and a catastrophic risk was
 * rendering GREEN. `severity_5` ("Mild inconvenience → Blocker") is the
 * risk-shaped ladder and reads low-is-good, so the traffic-light story arrives
 * from the existing polarity map with no bespoke bucketing.
 *
 * `risk.probability` is the second entry, and it is the same instrument used
 * for the opposite purpose (Captain-ratified 2026-08-22). `probability` is
 * DEPRECATED on `risk` in favour of `likelihood`, and the name-level map holds
 * it at `confidence_5` for `forecast.probability`, which is a bare sales
 * percentage and genuinely belongs there. Leaving `risk.probability` on that
 * name-level entry meant the deprecated field and its replacement rendered on
 * DIFFERENT ladders for the whole deprecation window: the same stored 4 reading
 * "Confident" through the old name and "Likely" through the new one, on one
 * card, from one graph. A staged deprecation exists so a reader can migrate
 * WITHOUT their data changing meaning, and a ladder swap at the rename is
 * exactly that meaning changing. So the override pins the legacy spelling to
 * `likelihood_5` — the ladder the field always should have had — and the two
 * names agree until 1.0.0 drops the old one.
 *
 * Note what this does NOT do: `forecast.probability` is untouched and still
 * resolves to `confidence_5` through the name-level map. Being able to correct
 * ONE entity without disturbing the other is the entire reason this layer
 * exists, and this is the first time it has been used for that rather than for
 * a polarity fix.
 *
 * Keep this layer SMALL. A name that needs an override on three entities is a
 * name that should be split, not overridden; renaming `risk.probability` to
 * `likelihood` in the same release is that lesson applied. The two entries here
 * are both `risk`, both from one audit, and both close when 1.0.0 lands.
 */
export const PROPERTY_SCALE_MAP_BY_ENTITY: Record<string, Record<string, string>> = {
  risk: {
    // Severity of consequences, not magnitude of benefit. See above.
    impact: 'severity_5',
    // The DEPRECATED spelling of `likelihood`, held on the same ladder as its
    // replacement for the length of the deprecation window. See above.
    probability: 'likelihood_5',
  },
}

/**
 * The default scale ID for properties not listed in `PROPERTY_SCALE_MAP`.
 * A generic 1–5 ordinal. Tools that display `UPGAssessment` values without
 * a known scale should fall back to this rather than no scale at all.
 */
const DEFAULT_SCALE_ID = 'scale_5'

/**
 * Return the default scale ID for a given entity-type / property-name pair.
 *
 * Resolution order (0.35.0 — the entity layer is new; the other two are not):
 * 1. `PROPERTY_SCALE_MAP_BY_ENTITY[entityType][propertyName]` — a per-entity
 *    override, for a name that means something different on one entity.
 * 2. `PROPERTY_SCALE_MAP[propertyName]` — the property-level default.
 * 3. `'scale_5'` (generic 1–5 ordinal).
 *
 * Adding layer 1 is non-breaking: every pair with no entity override resolves
 * exactly as before.
 *
 * @param entityType   - The UPG entity type string (e.g. `'problem_statement'`).
 * @param propertyName - The property name on that entity (e.g. `'severity'`).
 * @returns A scale ID string (always a key of `UPG_SCALES` or `'scale_5'`).
 *
 * @example
 * getPropertyDefaultScale('problem_statement', 'reach')     // → 'reach_5'
 * getPropertyDefaultScale('problem_statement', 'frequency') // → 'frequency_5'
 * getPropertyDefaultScale('problem_statement', 'severity')  // → 'severity_5'
 * getPropertyDefaultScale('risk', 'risk_level')             // → 'severity_5'
 * getPropertyDefaultScale('risk', 'likelihood')             // → 'likelihood_5'
 * getPropertyDefaultScale('risk', 'impact')                 // → 'severity_5' (entity override)
 * getPropertyDefaultScale('risk', 'probability')            // → 'likelihood_5' (entity override; deprecated name, same ladder as `likelihood`)
 * getPropertyDefaultScale('forecast', 'probability')        // → 'confidence_5' (unchanged)
 * getPropertyDefaultScale('opportunity', 'impact')          // → 'impact_5'   (unchanged)
 * getPropertyDefaultScale('anything', 'unknown_property')   // → 'scale_5'
 */
export function getPropertyDefaultScale(
  entityType: string,
  propertyName: string,
): string {
  return (
    PROPERTY_SCALE_MAP_BY_ENTITY[entityType]?.[propertyName] ??
    PROPERTY_SCALE_MAP[propertyName] ??
    DEFAULT_SCALE_ID
  )
}

/**
 * Inverse of `PROPERTY_SCALE_MAP`: the canonical property names that default to
 * a given scale, in declaration order. Useful for documentation surfaces that
 * want to show "where is this scale used".
 *
 * Returns an empty array for scales no property defaults to (e.g. the generic
 * `'scale_5'` fallback, which is never an explicit entry).
 *
 * Scope: the NAME-level map only. Per-entity overrides
 * (`PROPERTY_SCALE_MAP_BY_ENTITY`, 0.35.0) are deliberately not folded in,
 * because a bare property name cannot express "impact, but only on risk" and a
 * documentation surface that listed `impact` under both ladders would be
 * telling the reader less than it does now. Read that map directly when the
 * question is per-entity.
 *
 * @example
 * getPropertiesForScale('effort_5') // → ['effort', 'effort_estimate', 'effort_to_fix']
 */
export function getPropertiesForScale(scaleId: string): string[] {
  return Object.entries(PROPERTY_SCALE_MAP)
    .filter(([, id]) => id === scaleId)
    .map(([property]) => property)
}
