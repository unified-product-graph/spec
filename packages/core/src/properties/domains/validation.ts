/**
 * UPG Property Schemas: Validation Domain.
 * Hypothesis, Experiment, Learning, TestPlan, Evidence, ResearchPlan.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Confidence, EvidenceDirection, ISODate } from '../primitives.js'
import type { UPGAssessment } from '../../grammar/scales.js'

// ---------------------------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------------------------


/** A testable belief. The canonical design artefact for validating product assumptions.
 *
 * **Lifecycle-bearing**: progresses through
 * `drafted → active → validated | invalidated | archived`. The belief either holds,
 * fails, or is abandoned.
 *
 * Evidence attaches via the `hypothesis_has_evidence` edge (neutral direction;
 * `evidence.direction` carries supports/refutes/neutral polarity). A single
 * hypothesis can have N evidence nodes; `current_confidence` aggregates the
 * weighted signal.
 *
 * @example
 * const h: HypothesisProperties = {
 *   we_believe: 'We believe that linking statements to evidence',
 *   will_result_in: 'will result in higher decision confidence',
 *   we_know_when: 'we know when 60% of decisions cite evidence',
 *   risk_if_wrong: 'Wasted dev cycles wiring evidence panels users ignore',
 *   current_confidence: { value: 3, scale: 'confidence_5', label: 'Medium' },
 * }
 */
export interface HypothesisProperties {
  /** The belief being tested. The "if" clause. */
  we_believe?: string
  /** The expected result. The "then" clause. */
  will_result_in?: string
  /** The measurable signal that confirms or refutes the claim. */
  we_know_when?: string
  /** Risk surface for prioritisation if the claim turns out wrong. */
  risk_if_wrong?: string
  /**
   * Team confidence at the current point in time. Derived from the weighted
   * sum of attached `hypothesis_evidence` rows (formula spec'd separately).
   * Authors may set explicitly; loaders may overwrite from derivation.
   */
  current_confidence?: UPGAssessment
}

/**
 * @deprecated since v0.4.0. Use `EvidenceProperties`. `evidence` is the
 * canonical entity for all evidence: carries both `evidence_rigor` and
 * `evidence_source` axes, plus `weight`, `summary`, and `observed_at`.
 * Attach to a hypothesis via the `hypothesis_has_evidence` edge.
 * `hypothesis_evidence` will be removed in v0.5.0.
 */
export interface HypothesisEvidenceProperties {
  /**
   * Kind of evidence. Drives renderer + filter UI. The provenance edge
   * (`derived_from_*`) carries the actual source node reference per P14;
   * this enum is typing/UI metadata.
   */
  evidence_type?: 'experiment_run' | 'observation' | 'quote' | 'metric_change' | 'market_data' | 'interview'
  /**
   * Direction relative to the parent claim. Canonical direction axis aligned to
   * `Evidence.direction` so every direction-of-evidence property uses the same vocab.
   *   `supports` = paired with the `supports` edge.
   *   `refutes` = paired with the `refutes` edge.
   *   `neutral` = data insufficient or noisy.
   *
   * BREAKING in v0.4.0: legacy `'confirms'`, `'disconfirms'`, `'inconclusive'` no
   * longer type-check. Migration: `confirms → supports`, `disconfirms → refutes`,
   * `inconclusive → neutral`.
   */
  direction?: EvidenceDirection
  /** Strength of the evidence (UPGAssessment, scale `scale_5`). */
  weight?: UPGAssessment
  /** Plain-English summary of what the evidence shows. */
  summary?: string
  /** ISO date observed. */
  observed_at?: ISODate
}

/** A structured activity designed to test a hypothesis.
 *
 * `experiment` is canonical-stable. Split into `experiment_plan` + `experiment_run`
 * in v0.2.6 for teams needing fine-grained plan/run separation, then re-promoted
 * as the general-purpose option. The plan/run split remains the fine-grained
 * alternative, not a replacement.
 *
 * Use `experiment` for a single entity capturing method, dates, and outcome.
 * Use `experiment_plan` + `experiment_run` when lifecycle separation between
 * planning and execution matters to your workflow.
 *
 * @example
 * const properties: ExperimentProperties = {
 *   method: 'A/B test',
 *   start_date: '2026-04-01',
 *   end_date: '2026-09-30',
 * }
 */
export interface ExperimentProperties {
  /** Experimental method (e.g. "A/B test", "usability study", "smoke test") */
  method?: string
  /** ISO start date */
  start_date?: ISODate
  /** ISO end date */
  end_date?: ISODate
  /** Targeted participants or observations */
  sample_size?: number
  /** Expected change in the primary metric */
  expected_lift?: number
  /** Unit of `expected_lift` */
  expected_lift_unit?: 'percentage' | 'absolute' | 'ratio'
  /** Observed change in the primary metric */
  actual_lift?: number
}

/** Planning intent for a structured test of a hypothesis (UCS pattern P4: work-unit).
 *
 * Plan-shape fields only: method, success criteria, target metric, projected
 * reach/impact, ownership, intended dates. Once approved and an actual run
 * begins, an `experiment_run` links back via
 * `experiment_plan_ran_as_experiment_run`.
 *
 * Pairs with `experiment_run` (UCS pattern P6: event-occurrence). Replaces the
 * deprecated `experiment` type along with `experiment_run` (v0.2.6 split 1).
 *
 * @example
 * const plan: ExperimentPlanProperties = {
 *   method: 'a_b_test',
 *   success_criteria: 'Day-7 activation rate +5% lift, p<0.05',
 *   target_metric_id: 'mtr_day7_activation',
 *   projected_reach: { value: 4, scale: 'reach_5', evidence: 'Cohort sizing' },
 *   confidence: { value: 3, scale: 'confidence_5' },
 *   planned_start_date: '2026-05-01',
 *   planned_end_date: '2026-05-21',
 * }
 */
export interface ExperimentPlanProperties {
  /** Experimental method. Drives renderer and analysis tooling. */
  method?: 'a_b_test' | 'multivariate' | 'qual_interview' | 'prototype_test' | 'fake_door' | 'wizard_of_oz' | 'longitudinal'
  /** Plain-English description of "passing" */
  success_criteria?: string
  // P14: Foreign Keys Are Edges. The plan-targets-metric relationship is
  // expressed as `experiment_plan_targets_metric` (added in v0.2.7 alongside
  // the broader experiment-edge retarget pass). Until then, authors link plans
  // to metrics via the inherited `experiment_measures_metric` edge on the parent run.
  /** Projected reach: how many people the run is expected to touch (UPGAssessment) */
  projected_reach?: UPGAssessment
  /** Projected impact on the target metric (UPGAssessment) */
  projected_impact?: UPGAssessment
  /** Team confidence at plan-time (UPGAssessment, scale `confidence_5`) */
  confidence?: UPGAssessment
  /** Cost estimate at plan-time (UPGAssessment) */
  cost_estimate?: UPGAssessment
  /** Planned start date */
  planned_start_date?: ISODate
  /** Planned end date */
  planned_end_date?: ISODate
}

/** Execution evidence for a structured test of a hypothesis (UCS pattern P6: event-occurrence).
 *
 * Created when an `experiment_plan` actually starts collecting data. Run-shape
 * fields only: actual dates, observed reach, outcome summary, severity of
 * finding, learning, and disposition. Multiple runs may spawn from the same
 * plan when re-executed; each run is its own event with its own evidence.
 *
 * Pairs with `experiment_plan` (UCS pattern P4: work-unit). Replaces the
 * deprecated `experiment` type along with `experiment_plan` (v0.2.6 split 1).
 *
 * @example
 * const run: ExperimentRunProperties = {
 *   actual_start_date: '2026-05-01',
 *   actual_end_date: '2026-05-22',
 *   actual_reach: 12450,
 *   outcome_summary: 'Variant B uplift +6.3% on day-7 activation, p=0.03.',
 *   severity_of_finding: { value: 4, scale: 'severity_5' },
 *   learning: 'Onboarding tooltip placement materially shifts activation; productize.',
 *   disposition: 'confirmed',
 * }
 */
export interface ExperimentRunProperties {
  /** ISO actual start date (may differ from the plan's `planned_start_date`) */
  actual_start_date?: ISODate
  /** ISO actual end date */
  actual_end_date?: ISODate
  /** Observed reach: how many people the run actually touched */
  actual_reach?: number
  /** Plain-English outcome */
  outcome_summary?: string
  /** Severity / strength of the finding (UPGAssessment) */
  severity_of_finding?: UPGAssessment
  /** What the team learned (rich text) */
  learning?: string
  /**
   * Resolution against the parent plan's success criteria.
   *   `confirmed` = evidence supports the parent hypothesis_claim.
   *   `disconfirmed` = evidence refutes the parent hypothesis_claim.
   *   `inconclusive` = data insufficient or noisy.
   *   `aborted` = run terminated early.
   */
  disposition?: 'confirmed' | 'disconfirmed' | 'inconclusive' | 'aborted'
}

/** Result of an experiment. Evidence that updates a hypothesis.
 *
 * @example
 * const properties: LearningProperties = {
 *   result: 'Activation rate rose to 72% after tooltip change.',
 *   result_value: 0.72,
 *   result_unit: '%',
 * }
 */
export interface LearningProperties {
  /** Summary */
  result?: string
  /** Measured value of the result */
  result_value?: number
  /** Unit (e.g. "%" or "ms") */
  result_unit?: string
  /**
   * Direction relative to the parent hypothesis. Canonical direction axis.
   *
   * BREAKING in v0.4.0: legacy `'positive'`, `'negative'`, `'neutral'` are
   * replaced by `'supports'`, `'refutes'`, `'neutral'` to align with
   * `Evidence.direction` and `HypothesisEvidence.direction`. Migration:
   * `positive → supports`, `negative → refutes`, `neutral → neutral`.
   */
  result_direction?: EvidenceDirection
  /** Confidence impact on the parent hypothesis */
  confidence_impact?: 'strengthens' | 'weakens' | 'neutral'
}

// ---------------------------------------------------------------------------
// VALIDATION EXPANSION
// ---------------------------------------------------------------------------

/** TestPlan entity.
 *
 * @example
 * const properties: TestPlanProperties = {
 *   plan_type: 'usability',
 *   sample_size: 42,
 *   duration: '5 days',
 * }
 */
export interface TestPlanProperties {
  /** Test type */
  plan_type?: 'usability' | 'concept' | 'ab_test' | 'beta' | 'smoke'
  /** Participants or observations */
  sample_size?: number
  /**
   * Run duration.
   * @example "2 weeks"
   */
  duration?: string
  /** Criteria determining whether the test passes */
  success_criteria?: string
}

/** ResearchPlan entity.
 *
 * @example
 * const properties: ResearchPlanProperties = {
 *   research_question: 'Which activation step loses the most new users in week one?',
 *   suggested_methods: ['5-minute interview', 'async transcript review'],
 *   evidence_threshold: '3 independent sources',
 * }
 */
export interface ResearchPlanProperties {
  /** Primary research question */
  research_question?: string
  /** Suggested methods */
  suggested_methods?: string[]
  /** Minimum evidence bar */
  evidence_threshold?: string
  /**
   * Suggested completion deadline.
   * @example "2026-06-30"
   */
  deadline?: string
}

/** Evidence supporting or refuting a hypothesis (P2: lifecycle-free snapshot).
 *
 * Unified evidence entity that absorbed `hypothesis_evidence` in v0.4.0.
 * Carries two orthogonal classification axes:
 *   `evidence_rigor` = epistemological rigour (how the data was gathered).
 *   `evidence_source` = origin type (what artefact the evidence came from).
 *
 * Attach to a hypothesis via `hypothesis_has_evidence`. `direction` on this
 * node carries the supports/refutes/neutral polarity.
 *
 * @example
 * const e: EvidenceProperties = {
 *   evidence_rigor: 'quantitative',
 *   evidence_source: 'experiment_run',
 *   direction: 'supports',
 *   weight: { value: 4, scale: 'scale_5', label: 'Strong' },
 *   summary: 'Variant B uplift +6.3% on day-7 activation, p=0.03 across n=12,450.',
 *   observed_at: '2026-05-22',
 * }
 */
export interface EvidenceProperties {
  /** Epistemological rigour. How the data was gathered. */
  evidence_rigor?: 'quantitative' | 'qualitative' | 'anecdotal' | 'expert_opinion'
  /**
   * Origin type. Drives renderer + filter UI; the provenance edge
   * (`derived_from_*`) carries the actual source node reference.
   */
  evidence_source?: 'experiment_run' | 'observation' | 'quote' | 'metric_change' | 'market_data' | 'interview'
  /** Direction relative to the parent hypothesis. */
  direction?: EvidenceDirection
  /** Strength (UPGAssessment, scale `scale_5`). */
  weight?: UPGAssessment
  /** Plain-English summary. */
  summary?: string
  /** ISO date observed. */
  observed_at?: ISODate
  /** Free-text provenance note */
  source?: string
}
