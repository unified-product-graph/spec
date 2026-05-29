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
  /** The numeric value, used for computation. */
  value: number
  /** The qualitative label: what the assessor actually meant. */
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
const PROPERTY_SCALE_MAP: Record<string, string> = {
  // ── Reach ────────────────────────────────────────────────────────────────
  reach:            'reach_5',       // discovery, users
  projected_reach:  'reach_5',       // validation/experiment_plan

  // ── Frequency ────────────────────────────────────────────────────────────
  frequency:        'frequency_5',   // discovery, users, feedback

  // ── Severity ─────────────────────────────────────────────────────────────
  severity:         'severity_5',    // users, engineering, ai, gtm, customer-success
  severity_of_finding: 'severity_5', // validation/experiment_run

  // ── Pain ─────────────────────────────────────────────────────────────────
  pain:             'pain_5',        // discovery

  // ── Impact ───────────────────────────────────────────────────────────────
  impact:           'impact_5',      // discovery, market, security, compliance
  projected_impact: 'impact_5',      // validation/experiment_plan

  // ── Confidence ───────────────────────────────────────────────────────────
  confidence:       'confidence_5',  // discovery, validation, sales, product-spec

  // ── Effort ───────────────────────────────────────────────────────────────
  effort:           'effort_5',      // discovery
  effort_estimate:  'effort_5',      // feedback
  effort_to_fix:    'effort_5',      // engineering

  // ── Importance ───────────────────────────────────────────────────────────
  importance:       'importance_5',  // users

  // ── Satisfaction ─────────────────────────────────────────────────────────
  current_satisfaction: 'satisfaction_5', // users
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
 * Resolution order:
 * 1. Check `PROPERTY_SCALE_MAP` for a property-level override.
 * 2. Fall back to `'scale_5'` (generic 1–5 ordinal) for all other properties.
 *
 * The `entityType` parameter is accepted for API stability; future versions
 * may add per-entity overrides, but the initial implementation ignores it.
 *
 * @param entityType  - The UPG entity type string (e.g. `'problem_statement'`).
 *                      Currently unused; reserved for future per-entity overrides.
 * @param propertyName - The property name on that entity (e.g. `'severity'`).
 * @returns A scale ID string (always a key of `UPG_SCALES` or `'scale_5'`).
 *
 * @example
 * getPropertyDefaultScale('problem_statement', 'reach')     // → 'reach_5'
 * getPropertyDefaultScale('problem_statement', 'frequency') // → 'frequency_5'
 * getPropertyDefaultScale('problem_statement', 'severity')  // → 'severity_5'
 * getPropertyDefaultScale('risk', 'risk_level')             // → 'scale_5'
 * getPropertyDefaultScale('anything', 'unknown_property')   // → 'scale_5'
 */
export function getPropertyDefaultScale(
  _entityType: string,
  propertyName: string,
): string {
  return PROPERTY_SCALE_MAP[propertyName] ?? DEFAULT_SCALE_ID
}
