/**
 * UPG Curated Anti-Patterns: cross-domain reference set.
 *
 * Each entry pairs a memorable name with a machine-evaluable
 * `IntelligenceCondition`, the stages it fires in, a "why it matters" line,
 * and a remediation hint.
 *
 * Distinct from `UPGAntiPattern` in `domain-guides.ts`:
 * - `UPGAntiPattern` (per-domain): guidance for MCP agents working *inside* a domain.
 * - `UPGCuratedAntiPattern` (this file): cross-cutting patterns evaluated against the *whole* graph.
 *
 * Adding one: append to `UPG_ANTI_PATTERNS`. Integrity tests validate id
 * uniqueness, condition well-formedness, and stage/severity vocab. Cite
 * sources via `UPGBenchmarkSource` where applicable.
 *
 * https://unifiedproductgraph.org | MIT
 */

import type { IntelligenceCondition } from './intelligence.js'
import type { UPGProductStage, UPGBenchmarkSource } from './benchmarks/types.js'

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Severity tier for a curated anti-pattern.
 *
 * - `'high'`: blocks downstream work or surfaces a missing causal chain
 *   (e.g. features without hypotheses, building-without-validating).
 * - `'medium'`: quality or coverage gap that degrades the graph as a
 *   reasoning surface (e.g. orphan-loose-thoughts, single-domain-graph).
 * - `'low'`: informational. Signal worth surfacing but not urgent.
 */
export type UPGAntiPatternSeverity = 'high' | 'medium' | 'low'

/**
 * A curated, cross-domain anti-pattern with a machine-evaluable detector.
 *
 * @example
 * {
 *   id: 'features-without-hypotheses',
 *   name: 'Features without hypotheses',
 *   description: 'The graph has features but no hypotheses. Work is being scoped without a stated belief about why it should work.',
 *   structured_condition: { operator: 'and', checks: [
 *     { check: { type: 'entity_count', entity_type: 'feature', comparison: 'nonzero' } },
 *     { check: { type: 'entity_count', entity_type: 'hypothesis', comparison: 'zero' } },
 *   ] },
 *   why_it_matters: 'Features built without hypotheses ship as opinion; learnings from delivery cannot validate or refute anything because no claim was made.',
 *   remediation: 'For each in-flight feature, draft one hypothesis it tests; link via feature_tests_hypothesis.',
 *   stages: ['validation', 'build', 'beta', 'launch', 'growth'],
 *   severity: 'high',
 * }
 */
export interface UPGCuratedAntiPattern {
  /**
   * Stable slug: kebab-case, unique within `UPG_ANTI_PATTERNS`.
   * Surfaced as URL fragment on the `/intelligence` site page; never rename
   * once published (rename = breaking link surface).
   */
  id: string

  /** Short, memorable display title (≤ 6 words). */
  name: string

  /**
   * 2–3 sentence plain-English explanation. Read by a product
   * practitioner, not a graph engineer.
   */
  description: string

  /**
   * Machine-evaluable detector. Composes `EntityCheck`,
   * `RelationshipCheck`, `BenchmarkCheck`, etc. via `and` / `or`.
   * Consumers (Entopo, MCP, the site) evaluate this against a graph.
   */
  structured_condition: IntelligenceCondition

  /** One sentence on the product impact when this anti-pattern fires. */
  why_it_matters: string

  /**
   * One sentence pointing at the fix. Where useful, names a
   * canonical edge type, entity type, or workflow / skill.
   */
  remediation: string

  /**
   * Product stages this anti-pattern can meaningfully trigger in.
   * Surface for stage-aware filtering (e.g. don't show
   * "competitors-missing" warnings during `concept`).
   */
  stages: readonly UPGProductStage[]

  /** Severity tier. See `UPGAntiPatternSeverity`. */
  severity: UPGAntiPatternSeverity

  /**
   * Optional citation for the pattern's origin (a book, practitioner,
   * industry practice, or fundamental). Reuses the same controlled
   * vocabulary as `CountBenchmark.source` so consumers render
   * citations uniformly.
   */
  source?: UPGBenchmarkSource
}

// ─── Curated set ─────────────────

/**
 * The curated anti-pattern reference set. Append-only; existing ids are
 * stable URL fragments and content surfaces.
 */
export const UPG_ANTI_PATTERNS: readonly UPGCuratedAntiPattern[] = [
  // ── User layer ──────────────────────────────────────────────────────────
  {
    id: 'personas-without-jobs',
    name: 'Personas without jobs',
    description:
      'The graph has persona entities, but none link into the user chain via any of the v0.2 chain edges (job, need, desired_outcome, or switching_cost). A persona without chain links is a demographic profile: who someone is, not what they are trying to get done.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'persona', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'persona',
            edge_type: 'persona_pursues_job',
            target_type: 'job',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'persona',
            edge_type: 'persona_experiences_need',
            target_type: 'need',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'persona',
            edge_type: 'persona_aspires_to_desired_outcome',
            target_type: 'desired_outcome',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'persona',
            edge_type: 'persona_incurs_switching_cost',
            target_type: 'switching_cost',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'Without any chain link, every downstream artefact (need, opportunity, feature) loses its anchor. Features end up addressing demographics instead of struggles.',
    remediation:
      'For each persona, connect it into the user chain via at least one of: `persona_pursues_job`, `persona_experiences_need`, `persona_aspires_to_desired_outcome`, or `persona_incurs_switching_cost`. Use `/upg-new-persona` or the JTBD canvas workflow.',
    stages: ['concept', 'validation', 'build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'high',
    source: { kind: 'practitioner', attribution: 'Clayton Christensen, Jobs to Be Done' },
  },

  {
    id: 'opportunity-without-need',
    name: 'Opportunity without underlying need',
    description:
      'An opportunity exists in the graph but is not linked into the user chain via any valid v0.2 upstream edge. Opportunities that don\'t trace back to a real user need, outcome, or job are solutions in search of a problem.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'opportunity', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'opportunity',
            edge_type: 'opportunity_addresses_need',
            target_type: 'need',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'opportunity',
            edge_type: 'opportunity_pursues_outcome',
            target_type: 'outcome',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'opportunity',
            edge_type: 'opportunity_contextualises_job',
            target_type: 'job',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'outcome',
            edge_type: 'outcome_reveals_opportunity',
            target_type: 'opportunity',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'Opportunities untethered from the user chain cannot be prioritised. There is no signal about who benefits or why.',
    remediation:
      'For each opportunity, connect it to the user chain via one of: `opportunity_addresses_need`, `opportunity_pursues_outcome`, `opportunity_contextualises_job`, or an `outcome_reveals_opportunity` edge from a parent outcome.',
    stages: ['validation', 'build', 'beta', 'launch'],
    severity: 'high',
    source: { kind: 'practitioner', attribution: 'Teresa Torres, Continuous Discovery Habits' },
  },

  // ── Validation layer ────────────────────────────────────────────────────
  {
    id: 'features-without-hypotheses',
    name: 'Features without hypotheses',
    description:
      'The graph has features but no hypothesis entities. Work is being scoped without a stated belief about why it should work.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'feature', comparison: 'nonzero' } },
        { check: { type: 'entity_count', entity_type: 'hypothesis', comparison: 'zero' } },
      ],
    },
    why_it_matters:
      'Features built without hypotheses ship as opinion. Learnings from delivery cannot validate or refute anything because no claim was made.',
    remediation:
      'For each in-flight feature, draft one `hypothesis` it tests; link via `feature_tests_hypothesis`.',
    stages: ['validation', 'build', 'beta', 'launch', 'growth'],
    severity: 'high',
    source: { kind: 'book', citation: 'The Lean Startup, Eric Ries (2011)' },
  },

  {
    id: 'untested-hypothesis-pile-up',
    name: 'Untested hypothesis pile-up',
    description:
      'More than three hypothesis claims sit in `drafted` status. Hypotheses accumulate when authoring is decoupled from validation; a backlog of drafts is a signal the team is generating beliefs faster than testing them.',
    structured_condition: {
      check: {
        type: 'entity_count',
        entity_type: 'hypothesis',
        filter: { status: 'drafted' },
        comparison: 'gt',
        threshold: 3,
      },
    },
    why_it_matters:
      'Drafted hypotheses neither inform direction nor produce learning. Conversion of draft → active is the lifecycle health metric.',
    remediation:
      'Promote at least one drafted `hypothesis` to `active` per planning cycle by pairing it with an `experiment_plan`.',
    stages: ['validation', 'build', 'beta', 'launch', 'growth'],
    severity: 'medium',
    source: { kind: 'practitioner', attribution: 'David Bland, Testing Business Ideas' },
  },

  {
    id: 'experiment-run-without-learning',
    name: 'Experiment runs without learnings',
    description:
      'The graph has `experiment_run` entities but no `experiment_run_produces_learning` edges. Runs that complete without producing a learning are runs whose results were never written down.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'experiment_run', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'experiment_run',
            edge_type: 'experiment_run_produces_learning',
            target_type: 'learning',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'Without an attached learning, an experiment_run is operational exhaust. It consumed time but did not change what the team believes.',
    remediation:
      'For each completed `experiment_run`, capture one `learning` and link via `experiment_run_produces_learning`.',
    stages: ['validation', 'build', 'beta', 'launch', 'growth'],
    severity: 'high',
    source: { kind: 'book', citation: 'The Lean Startup, Eric Ries (2011)' },
  },

  // ── Strategy / OKR layer ────────────────────────────────────────────────
  {
    id: 'objective-without-key-results',
    name: 'Objectives without key results',
    description:
      'The graph has objectives but no `objective_achieved_through_key_result` edges. Objectives without measurable key results are aspirations, not commitments.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'objective', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'objective',
            edge_type: 'objective_achieved_through_key_result',
            target_type: 'key_result',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'OKRs without measurable key results cannot be tracked, debated, or learned from. The graph carries intent but not accountability.',
    remediation:
      'For each `objective`, define 2–4 `key_result` entities and link via `objective_achieved_through_key_result`. Use `/upg-new-okr` to author.',
    stages: ['validation', 'build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'high',
    source: { kind: 'book', citation: 'Measure What Matters, John Doerr (2017)' },
  },

  {
    id: 'roadmap-feature-without-outcome-link',
    name: 'Roadmap features without outcome linkage',
    description:
      'Features exist in the graph but none link to a `key_result` they drive. Output without outcome linkage is feature-factory work: building things, not moving things.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'feature', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'feature',
            edge_type: 'feature_drives_key_result',
            target_type: 'key_result',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'Roadmap items without outcome anchors can be prioritised on size, not on impact.',
    remediation:
      'For each feature, identify the `key_result` it drives and link via `feature_drives_key_result`.',
    stages: ['build', 'beta', 'launch', 'growth'],
    severity: 'high',
    source: { kind: 'practitioner', attribution: 'John Cutler, Outcomes over Output' },
  },

  // ── Market intelligence layer ───────────────────────────────────────────
  {
    id: 'competitors-missing-past-validation',
    name: 'Competitor catalogue empty past validation',
    description:
      'The graph has zero competitor entities at validation stage or later. Past concept, the absence of named competitors usually means alternatives haven\'t been thought through, not that none exist.',
    structured_condition: {
      check: {
        type: 'benchmark',
        entity_type: 'competitor',
        comparison: 'below_min',
      },
    },
    why_it_matters:
      'Without competitors in the graph, positioning, differentiation, and switching-cost analysis lack referents. The team is reasoning in a vacuum.',
    remediation:
      'Catalogue the 3–5 closest alternatives users would pick today. Use `/upg-compete` to author.',
    stages: ['validation', 'build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'medium',
    source: { kind: 'industry_practice', category: 'product_strategy' },
  },

  {
    id: 'persona-count-below-stage-benchmark',
    name: 'Persona count below stage benchmark',
    description:
      'The graph has fewer personas than the stage-appropriate benchmark expects. Persona under-coverage signals the team has not segmented its audience.',
    structured_condition: {
      check: {
        type: 'benchmark',
        entity_type: 'persona',
        comparison: 'below_min',
      },
    },
    why_it_matters:
      'A graph with one persona past validation is usually carrying an unexamined "everyone is the same user" assumption.',
    remediation:
      'Add personas representing the next 1–2 most distinct user segments. Use `/upg-new-persona`.',
    stages: ['validation', 'build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'medium',
    source: { kind: 'practitioner', attribution: 'Alan Cooper, The Inmates Are Running the Asylum' },
  },

  // ── Cross-domain coverage ───────────────────────────────────────────────
  {
    id: 'building-without-validating',
    name: 'Building without validating',
    description:
      'The product-spec domain has entities but the validation domain is empty. The team is shipping work without a parallel discovery / validation track.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'domain_population', domain_id: 'product_spec', comparison: 'nonzero' } },
        { check: { type: 'domain_population', domain_id: 'validation', comparison: 'zero' } },
      ],
    },
    why_it_matters:
      'Build-only graphs commit the team to delivery without a learning loop. Every shipped feature becomes a permanent assumption.',
    remediation:
      'Spin up at least one `experiment_plan` or `hypothesis` per quarter\'s build batch. Use `/upg-new-discovery` or `/upg-new-hypothesis`.',
    stages: ['build', 'beta', 'launch', 'growth'],
    severity: 'high',
    source: { kind: 'practitioner', attribution: 'Marty Cagan, Inspired (continuous discovery)' },
  },

  {
    id: 'single-domain-graph',
    name: 'Single-domain graph',
    description:
      'The graph has more than five entities but they all live in a single UPG domain. A real product spans multiple domains; a single-domain graph is usually a deep notebook in one corner with the rest of the picture missing.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'total_entity_count', comparison: 'gt', threshold: 5 } },
        { check: { type: 'domain_count', comparison: 'eq', threshold: 1 } },
      ],
    },
    why_it_matters:
      'Single-domain coverage prevents cross-domain reasoning. The graph cannot answer questions like "which feature serves which persona?" or "which experiment validates which hypothesis?".',
    remediation:
      'Identify the next adjacent domain (usually `user`, `validation`, or `product_spec`) and add 2–3 anchor entities to bridge.',
    stages: ['validation', 'build', 'beta', 'launch'],
    severity: 'medium',
    source: { kind: 'fundamental' },
  },

  {
    id: 'orphan-loose-thoughts',
    name: 'Orphan loose thoughts',
    description:
      'More than five entities have no incoming or outgoing edges. Orphans accumulate when capture outpaces composition: thoughts get added without being connected.',
    structured_condition: {
      check: { type: 'orphan_count', comparison: 'gt', threshold: 5 },
    },
    why_it_matters:
      'Orphan entities sit outside graph traversal. They answer no questions, flag no gaps, drive no insight. Capture without composition is note-taking, not graph-building.',
    remediation:
      'Walk the orphan list and either (a) connect each to its parent / sibling / consequence via the appropriate edge, or (b) archive entities that no longer matter.',
    stages: ['concept', 'validation', 'build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'medium',
    source: { kind: 'fundamental' },
  },

  // ── Experience-design layer ─────────────────────────────────────────────
  {
    id: 'journey-phases-without-canonical-steps',
    name: 'Journey phases without a step spine',
    description:
      'The graph has journey phases spanning steps (`journey_phase_spans_journey_step`), but no journey owns its steps via `user_journey_contains_journey_step`. A phase is a band over a step timeline, not a container. When the timeline itself is missing there is no canonical answer to "what are the steps of this journey?". The phase overlay points at steps the journey does not own.',
    structured_condition: {
      operator: 'and',
      checks: [
        {
          check: {
            type: 'relationship',
            source_type: 'journey_phase',
            edge_type: 'journey_phase_spans_journey_step',
            target_type: 'journey_step',
            comparison: 'exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'user_journey',
            edge_type: 'user_journey_contains_journey_step',
            target_type: 'journey_step',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'Steps owned by no journey render a different step list per consumer: the phase overlay sees them, a journey-direct walk does not. The journey has no deterministic step spine to traverse, score, or map to screens.',
    remediation:
      'Own every step under its journey with `user_journey_contains_journey_step`, then let phases span ranges of that single timeline via `journey_phase_spans_journey_step`. The phase is a non-owning band overlay, not the step container.',
    stages: ['concept', 'validation', 'build', 'beta', 'launch', 'growth'],
    severity: 'high',
    source: { kind: 'fundamental' },
  },
] as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Look up a curated anti-pattern by its slug id.
 *
 * @example
 * getAntiPatternById('features-without-hypotheses')?.severity // → 'high'
 * getAntiPatternById('not-a-real-pattern') // → undefined
 */
export function getAntiPatternById(id: string): UPGCuratedAntiPattern | undefined {
  return UPG_ANTI_PATTERNS.find((ap) => ap.id === id)
}

/**
 * Filter the curated set to anti-patterns relevant at a given product stage.
 *
 * @example
 * const concept = getAntiPatternsForStage('concept')
 * concept.every(ap => ap.stages.includes('concept')) // → true
 */
export function getAntiPatternsForStage(stage: UPGProductStage): readonly UPGCuratedAntiPattern[] {
  return UPG_ANTI_PATTERNS.filter((ap) => ap.stages.includes(stage))
}

/**
 * Filter the curated set by severity tier.
 *
 * @example
 * getAntiPatternsBySeverity('high').length >= 1 // → true
 */
export function getAntiPatternsBySeverity(
  severity: UPGAntiPatternSeverity,
): readonly UPGCuratedAntiPattern[] {
  return UPG_ANTI_PATTERNS.filter((ap) => ap.severity === severity)
}
