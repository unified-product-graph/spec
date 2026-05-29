/**
 * UPG Enum Scales. Runtime metadata for the closed-enum primitives in
 * `properties/primitives.ts`. Per-value labels and descriptions for UI hover.
 * Parallel to `UPG_SCALES` (numeric assessment scales).
 * https://unifiedproductgraph.org/spec | MIT
 */

// ─── Shapes ──────────────────────────────────────────────────────────────────

/** A single value in a closed-enum scale */
export interface UPGEnumScaleValue {
  /** The TypeScript string literal (e.g. `'at_risk'`) */
  value: string
  /** Human-readable display label (e.g. `'At risk'`) */
  label: string
  /** One-sentence definition shown on hover */
  description: string
}

/**
 * Runtime metadata for a closed-enum primitive type.
 *
 * `values` is ordered semantically (e.g. low → high for ordinal scales;
 * strict → permissive for rule strength). Array index is the canonical
 * position (no separate `position` field).
 */
export interface UPGEnumScaleDefinition {
  /** Matches the TypeScript type name (e.g. `'HealthStatus'`) */
  id: string
  /** Human-readable scale name (e.g. `'Health status'`) */
  label: string
  /** What the scale classifies or measures */
  description: string
  /** Per-value metadata in semantic order */
  values: UPGEnumScaleValue[]
  /**
   * Optional rendering hint: which end of the scale is desirable.
   * Parallel to `SCALE_TONE_DIRECTION` for numeric scales.
   *
   * `'high-is-good'`: first value is best (e.g. on_track, high confidence)
   * `'low-is-good'`: last value in natural order is worst (e.g. critical urgency is bad)
   * `'neutral'`: no inherent good/bad direction (e.g. Cadence, Priority)
   */
  tone_direction?: 'high-is-good' | 'low-is-good' | 'neutral'
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const UPG_ENUM_SCALES: Record<string, UPGEnumScaleDefinition> = {

  // ── HealthStatus ─────────────────────────────────────────────────────────────

  HealthStatus: {
    id: 'HealthStatus',
    label: 'Health status',
    description: 'Traffic-light delivery health for initiatives, features, and OKRs.',
    tone_direction: 'high-is-good',
    values: [
      { value: 'on_track',  label: 'On track',  description: 'Progressing as planned; no blockers or material risks.' },
      { value: 'at_risk',   label: 'At risk',   description: 'Behind plan or facing blockers that may cause a miss without intervention.' },
      { value: 'off_track', label: 'Off track', description: 'Significantly behind; escalation or scope change required.' },
    ],
  },

  // ── SignalUrgency ────────────────────────────────────────────────────────────

  SignalUrgency: {
    id: 'SignalUrgency',
    label: 'Signal urgency',
    description: 'How urgently an inbound signal (customer, support, or market) needs to be addressed.',
    tone_direction: 'low-is-good',
    values: [
      { value: 'low',      label: 'Low',      description: 'No immediate action required; monitor and review at regular cadence.' },
      { value: 'medium',   label: 'Medium',   description: 'Should be addressed within the current sprint or cycle.' },
      { value: 'high',     label: 'High',     description: 'Requires prompt attention; address before the next planning checkpoint.' },
      { value: 'critical', label: 'Critical', description: 'Immediate action required; escalate now.' },
    ],
  },

  // ── Priority ─────────────────────────────────────────────────────────────────

  Priority: {
    id: 'Priority',
    label: 'Priority',
    description: 'Task or strategic priority level. Neutral direction: urgent is not inherently bad; none is not inherently good.',
    tone_direction: 'neutral',
    values: [
      { value: 'urgent', label: 'Urgent', description: 'Blocking progress or time-critical; must be addressed immediately.' },
      { value: 'high',   label: 'High',   description: 'Important; address in the current sprint or planning cycle.' },
      { value: 'medium', label: 'Medium', description: 'Valuable; schedule in the near term when higher priorities are cleared.' },
      { value: 'low',    label: 'Low',    description: 'Nice to have; address when capacity allows.' },
      { value: 'none',   label: 'None',   description: 'No priority assigned, or deliberately deprioritised.' },
    ],
  },

  // ── Cadence ──────────────────────────────────────────────────────────────────

  Cadence: {
    id: 'Cadence',
    label: 'Cadence',
    description: 'How often a recurring activity, publication, or measurement repeats.',
    tone_direction: 'neutral',
    values: [
      { value: 'continuous', label: 'Continuous', description: 'Always running; no discrete recurrence interval.' },
      { value: 'hourly',     label: 'Hourly',     description: 'Recurs every hour.' },
      { value: 'daily',      label: 'Daily',      description: 'Recurs every day.' },
      { value: 'weekly',     label: 'Weekly',     description: 'Recurs every week.' },
      { value: 'monthly',    label: 'Monthly',    description: 'Recurs every month.' },
      { value: 'quarterly',  label: 'Quarterly',  description: 'Recurs every calendar quarter.' },
      { value: 'yearly',     label: 'Yearly',     description: 'Recurs every year.' },
      { value: 'on_demand',  label: 'On demand',  description: 'Triggered by an event, not a fixed schedule.' },
      { value: 'other',      label: 'Other',      description: 'Recurs on a cadence not captured by the above tiers.' },
    ],
  },

  // ── Confidence ───────────────────────────────────────────────────────────────

  Confidence: {
    id: 'Confidence',
    label: 'Confidence',
    description: 'Epistemic confidence level for assumptions, evidence, and feasibility assessments. Also aliased as LowMedHigh for non-epistemic magnitude properties.',
    tone_direction: 'high-is-good',
    values: [
      { value: 'high',   label: 'High',   description: 'Strong confidence; evidence is solid or reasoning is well-validated.' },
      { value: 'medium', label: 'Medium', description: 'Moderate confidence; some evidence or reasoning gaps remain.' },
      { value: 'low',    label: 'Low',    description: 'Weak confidence; significant uncertainty or limited evidence.' },
    ],
  },

  // ── RuleStrength ────────────────────────────────────────────────────

  RuleStrength: {
    id: 'RuleStrength',
    label: 'Rule strength',
    description: 'Imperative force of a constraint, guideline, or policy rule.',
    tone_direction: 'neutral',
    values: [
      { value: 'must',      label: 'Must',      description: 'Hard requirement. Violation blocks; no exceptions without an explicit carve-out.' },
      { value: 'must_not',  label: 'Must not',  description: 'Hard prohibition. Violation blocks; no exceptions without an explicit carve-out.' },
      { value: 'exception', label: 'Exception', description: 'Documented carve-out from a must or must_not rule; captures the approved deviation.' },
      { value: 'warning',   label: 'Warning',   description: 'Soft signal: should consider and address, but can override with justification.' },
      { value: 'guideline', label: 'Guideline', description: 'Recommendation: encouraged and expected in most cases, but not enforced.' },
    ],
  },

}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Look up a full enum scale definition by its type name. */
export function getEnumScale(name: string): UPGEnumScaleDefinition | undefined {
  return UPG_ENUM_SCALES[name]
}

/** Look up per-value metadata within a named enum scale. */
export function getEnumValueMeta(scaleName: string, value: string): UPGEnumScaleValue | undefined {
  return UPG_ENUM_SCALES[scaleName]?.values.find(v => v.value === value)
}
