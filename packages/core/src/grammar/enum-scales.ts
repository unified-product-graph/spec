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

  // ── ProxyConfidence ─────────────────────────────────────────────────

  ProxyConfidence: {
    id: 'ProxyConfidence',
    label: 'Proxy confidence',
    description: 'How strongly a proxy metric predicts the direct measure it stands in for.',
    tone_direction: 'high-is-good',
    values: [
      { value: 'strong',   label: 'Strong',   description: 'Tracks the direct measure closely; a reliable stand-in.' },
      { value: 'moderate', label: 'Moderate', description: 'Correlates with the direct measure but with meaningful slippage.' },
      { value: 'weak',     label: 'Weak',     description: 'Loosely related; use with caution and corroborate.' },
    ],
  },

  // ── CauseConfidence ─────────────────────────────────────────────────

  CauseConfidence: {
    id: 'CauseConfidence',
    label: 'Cause confidence',
    description: 'Maturity of a root-cause determination during incident debugging: how far a proposed cause has been validated.',
    tone_direction: 'high-is-good',
    values: [
      { value: 'hypothesised', label: 'Hypothesised', description: 'A proposed cause, not yet tested against evidence.' },
      { value: 'likely',       label: 'Likely',       description: 'Supported by evidence but not conclusively proven.' },
      { value: 'confirmed',    label: 'Confirmed',    description: 'Verified as the cause; reproduced or otherwise established.' },
    ],
  },

  // ── ComfortLevel ────────────────────────────────────────────────────

  ComfortLevel: {
    id: 'ComfortLevel',
    label: 'Comfort level',
    description: 'A person\'s comfort with a tool, technology, or practice. Closed set so personas compare on the same axis across products.',
    tone_direction: 'high-is-good',
    values: [
      { value: 'low',    label: 'Low',    description: 'Little or no familiarity; needs guidance to proceed.' },
      { value: 'medium', label: 'Medium', description: 'Functional, everyday competence.' },
      { value: 'high',   label: 'High',   description: 'Confident, fluent use without assistance.' },
      { value: 'expert', label: 'Expert', description: 'Deep mastery; can teach others or extend the tool.' },
      { value: 'other',  label: 'Other',  description: 'A comfort profile not captured by the above tiers.' },
    ],
  },

  // ── LogLevel ────────────────────────────────────────────────────────

  LogLevel: {
    id: 'LogLevel',
    label: 'Log level',
    description: 'Operational verbosity of a monitor or alert signal. How loud the signal should be, not how bad an outcome is for the user (kept distinct from severity_5).',
    tone_direction: 'low-is-good',
    values: [
      { value: 'critical', label: 'Critical', description: 'Page immediately; the signal is service-affecting.' },
      { value: 'warning',  label: 'Warning',  description: 'Needs attention soon; not yet service-affecting.' },
      { value: 'info',     label: 'Info',     description: 'Informational; no action required.' },
    ],
  },

  // ── IncidentSeverity ────────────────────────────────────────────────

  IncidentSeverity: {
    id: 'IncidentSeverity',
    label: 'Incident severity',
    description: 'Paging-tier classification of an incident, driving escalation and response process. Distinct from user-impact severity_5 and from LogLevel.',
    tone_direction: 'low-is-good',
    values: [
      { value: 'sev1', label: 'SEV1', description: 'Critical outage; full response, executive-visible.' },
      { value: 'sev2', label: 'SEV2', description: 'Major degradation; urgent response.' },
      { value: 'sev3', label: 'SEV3', description: 'Minor or partial impact; handled within hours.' },
      { value: 'sev4', label: 'SEV4', description: 'Negligible impact; routine handling.' },
    ],
  },

  // ── SignalSentiment ─────────────────────────────────────────────────

  SignalSentiment: {
    id: 'SignalSentiment',
    label: 'Signal sentiment',
    description: 'Sentiment polarity of an inbound signal (feedback, support, customer).',
    tone_direction: 'high-is-good',
    values: [
      { value: 'positive', label: 'Positive', description: 'Favourable signal; satisfaction or advocacy.' },
      { value: 'neutral',  label: 'Neutral',  description: 'No clear positive or negative lean.' },
      { value: 'negative', label: 'Negative', description: 'Unfavourable signal; dissatisfaction or risk.' },
      { value: 'mixed',    label: 'Mixed',    description: 'Contains both positive and negative elements.' },
    ],
  },

  // ── MaturityLevel ───────────────────────────────────────────────────

  MaturityLevel: {
    id: 'MaturityLevel',
    label: 'Maturity level',
    description: 'Capability or process maturity on the CMMI ladder.',
    tone_direction: 'high-is-good',
    values: [
      { value: 'initial',    label: 'Initial',    description: 'Ad hoc and unpredictable; little process.' },
      { value: 'developing', label: 'Developing', description: 'Basic process emerging but inconsistent.' },
      { value: 'defined',    label: 'Defined',    description: 'Documented, standardised process in place.' },
      { value: 'managed',    label: 'Managed',    description: 'Measured and controlled against objectives.' },
      { value: 'optimizing', label: 'Optimizing', description: 'Continuous, data-driven improvement.' },
    ],
  },

  // ── ConformanceLevel ────────────────────────────────────────────────

  ConformanceLevel: {
    id: 'ConformanceLevel',
    label: 'Conformance level',
    description: 'WCAG accessibility conformance level.',
    tone_direction: 'high-is-good',
    values: [
      { value: 'A',   label: 'A',   description: 'Minimum conformance; essential barriers removed.' },
      { value: 'AA',  label: 'AA',  description: 'Addresses the most common barriers; the usual legal target.' },
      { value: 'AAA', label: 'AAA', description: 'Highest level; not achievable for all content.' },
    ],
  },

  // ── DataSensitivity ─────────────────────────────────────────────────

  DataSensitivity: {
    id: 'DataSensitivity',
    label: 'Data sensitivity',
    description: 'Data classification tier governing handling and access.',
    tone_direction: 'neutral',
    values: [
      { value: 'public',       label: 'Public',       description: 'No restriction; safe to disclose openly.' },
      { value: 'internal',     label: 'Internal',     description: 'For internal use; not for external release.' },
      { value: 'confidential', label: 'Confidential', description: 'Sensitive; restricted to a need-to-know basis.' },
      { value: 'restricted',   label: 'Restricted',   description: 'Highly sensitive; strict controls and auditing.' },
    ],
  },

  // ── DifficultyLevel ─────────────────────────────────────────────────

  DifficultyLevel: {
    id: 'DifficultyLevel',
    label: 'Difficulty level',
    description: 'Learner difficulty tier for educational content.',
    tone_direction: 'neutral',
    values: [
      { value: 'beginner',     label: 'Beginner',     description: 'No prior knowledge assumed.' },
      { value: 'intermediate', label: 'Intermediate', description: 'Assumes working familiarity with the basics.' },
      { value: 'advanced',     label: 'Advanced',     description: 'Assumes deep, expert-level background.' },
    ],
  },

  // ── FrequencyRating ─────────────────────────────────────────────────

  FrequencyRating: {
    id: 'FrequencyRating',
    label: 'Frequency rating',
    description: 'Qualitative how-often rating. Distinct from the numeric frequency_5 scale and from Cadence calendar tiers.',
    tone_direction: 'neutral',
    values: [
      { value: 'constant',   label: 'Constant',   description: 'Effectively always; continuous occurrence.' },
      { value: 'regular',    label: 'Regular',    description: 'Happens on a predictable, recurring basis.' },
      { value: 'occasional', label: 'Occasional', description: 'Happens sometimes, without a fixed pattern.' },
      { value: 'rare',       label: 'Rare',       description: 'Happens infrequently.' },
      { value: 'other',      label: 'Other',      description: 'A frequency not captured by the above tiers.' },
    ],
  },

  // ── EvidenceDirection ───────────────────────────────────────────────

  EvidenceDirection: {
    id: 'EvidenceDirection',
    label: 'Evidence direction',
    description: 'Direction of evidence relative to a claim. Distinct from confidence_impact (strengthens/weakens) per the polysemy verdicts.',
    tone_direction: 'neutral',
    values: [
      { value: 'supports', label: 'Supports', description: 'The evidence backs the claim.' },
      { value: 'refutes',  label: 'Refutes',  description: 'The evidence contradicts the claim.' },
      { value: 'neutral',  label: 'Neutral',  description: 'The evidence is inconclusive either way.' },
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
