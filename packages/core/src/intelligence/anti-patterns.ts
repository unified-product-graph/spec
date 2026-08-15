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

import type { IntelligenceCondition, EdgeCountVsPropertyCheck } from './intelligence.js'
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
   * Detection scope.
   * - `'graph'` (default, omitted): evaluated against a single product graph by
   *   the `evaluateAntiPatterns` chokepoint (validate_graph, get_anti_pattern_violations_for).
   * - `'portfolio'`: evaluated across products + the shared registry by
   *   `portfolio_validate`. The single-graph evaluator SKIPS these (a portfolio
   *   pattern can never flip a single graph invalid), and they carry no
   *   `structured_condition` because the cross-product detector is not expressible
   *   as an `IntelligenceCondition` over one graph.
   */
  scope?: 'graph' | 'portfolio'

  /**
   * Machine-evaluable detector. Composes `EntityCheck`,
   * `RelationshipCheck`, `BenchmarkCheck`, etc. via `and` / `or`.
   * Consumers (Entopo, MCP, the site) evaluate this against a graph.
   *
   * Required for graph-scoped patterns; OMITTED for `scope: 'portfolio'`
   * patterns, whose detector lives in `portfolio_validate` instead.
   */
  structured_condition?: IntelligenceCondition

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

  /**
   * UPG version that introduced this anti-pattern (e.g. `'0.9.7'`). Lets
   * `get_spec_version` surface "new anti-patterns in this version" so a graph
   * authored clean under an earlier version is not silently flipped invalid on
   * upgrade with no heads-up (batch-6 #36). Omitted on baseline patterns that
   * predate this tracking (treated as "always present").
   */
  since?: string
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

  {
    id: 'planning-cycle-without-scheduled-work',
    name: 'Planning cycle with no scheduled work',
    description:
      'A planning_cycle exists but neither schedules any user_story nor contains a finer sub-cycle. An empty cadence box is a date range with nothing flowing through it: a sprint or iteration nobody planned work into, or a coarse period that was never broken down.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'planning_cycle', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'planning_cycle',
            edge_type: 'planning_cycle_schedules_user_story',
            target_type: 'user_story',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'planning_cycle',
            edge_type: 'planning_cycle_contains_planning_cycle',
            target_type: 'planning_cycle',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'A cadence layer only earns its keep when work is planned through it. An interval with no scheduled stories and no nested cycles adds ceremony without telling anyone what the period is for.',
    remediation:
      'Schedule the stories the cycle will carry via `planning_cycle_schedules_user_story`, or break a coarse period into finer cycles via `planning_cycle_contains_planning_cycle`. If neither applies, the interval is not yet a real cadence box.',
    stages: ['build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'low',
    since: '0.20.0',
  },

  // ── Market intelligence layer ───────────────────────────────────────────
  {
    id: 'competitors-missing-past-validation',
    name: 'Competitor catalogue empty past validation',
    description:
      'The graph has zero competitor entities at build stage or later. Past validation, the absence of named competitors usually means alternatives haven\'t been thought through, not that none exist. A graph still at concept or validation is exempt: cataloguing the field can wait until you commit to building.',
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
    // Fires from build onward, matching the name (past the validation stage). A
    // concept or validation graph is still framing the problem; holding it to a
    // competitor benchmark there is the false alarm this anti-pattern caused on
    // legitimately-young graphs.
    stages: ['build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'medium',
    source: { kind: 'industry_practice', category: 'product_strategy' },
  },

  {
    id: 'persona-count-below-stage-benchmark',
    name: 'Persona count below stage benchmark',
    description:
      'The graph has fewer personas than the stage-appropriate benchmark expects, from beta onward. Persona under-coverage at that point signals the team has not segmented its audience. Concept through build are exempt: the sound move there is to start with one beachhead persona and expand as you find fit.',
    structured_condition: {
      check: {
        type: 'benchmark',
        entity_type: 'persona',
        comparison: 'below_min',
      },
    },
    why_it_matters:
      'A graph still on a single persona by beta is usually carrying an unexamined assumption that every user is the same.',
    remediation:
      'Add personas representing the next 1–2 most distinct user segments. Use `/upg-new-persona`.',
    // Fires from beta onward. The persona benchmark expects 2+ from validation,
    // but the canonical beachhead move is to start with one persona and expand as
    // fit is found, so holding a build-stage graph to a multi-persona bar is a
    // false alarm. By beta an unsegmented audience is a real signal.
    stages: ['beta', 'launch', 'growth', 'mature'],
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
      'The graph has more than five entities but they all live in a single UPG domain, at beta stage or later. A real product spans multiple domains by then; a single-domain graph that far along is usually a deep notebook in one corner with the rest of the picture missing. Concept through build are exempt: a graph legitimately starts deep in one domain and broadens as it matures.',
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
    // Fires from beta onward. Early on a graph is legitimately deep in one domain
    // (a discovery notebook, a thin internal tool); only once it reaches beta is
    // single-domain coverage a smell rather than a normal starting shape. Extends
    // through growth and mature, where a single-domain graph is most telling.
    stages: ['beta', 'launch', 'growth', 'mature'],
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

  // ── F5: anti-pattern enforcement ────────────────────────────────
  // P-C from the 36-domain wiring audit: domain-guide anti-patterns described
  // in prose with no machine-checkable detector. These two map cleanly to a
  // RelationshipCheck (edge presence/absence) and are promoted here.
  {
    id: 'insights-without-evidence',
    since: '0.9.7',
    name: 'Insights without evidence',
    description:
      'The graph has insight entities but none are backed by a primary-evidence link: no observation yields them (`observation_yields_insight`), no survey response evidences them (`survey_response_evidences_insight`), and no quote is attached (`insight_evidenced_by_quote`). An insight with no evidence behind it is an opinion wearing a research label.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'insight', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'observation',
            edge_type: 'observation_yields_insight',
            target_type: 'insight',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'survey_response',
            edge_type: 'survey_response_evidences_insight',
            target_type: 'insight',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'insight',
            edge_type: 'insight_evidenced_by_quote',
            target_type: 'quote',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'Insights untethered from evidence cannot be trusted, contested, or traced. Downstream opportunities and design questions inherit an unfalsifiable claim.',
    remediation:
      'Back each insight with at least one primary record via `observation_yields_insight`, `survey_response_evidences_insight`, or `insight_evidenced_by_quote`. Capture the supporting observation or quote first.',
    stages: ['concept', 'validation', 'build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'high',
    source: { kind: 'practitioner', attribution: 'Steve Portigal, Interviewing Users' },
  },

  {
    id: 'feature-requests-without-provenance',
    since: '0.9.7',
    name: 'Feature requests without provenance',
    description:
      'The graph has feature_request entities but none trace back to a source: no feedback program collects them (`feedback_program_collects_feature_request`), no customer feedback becomes one (`customer_feedback_becomes_feature_request`), and none originate from a behavioural segment (`feature_request_from_behavioral_segment`). A request with no provenance cannot be weighed against who asked or how many.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'feature_request', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'feedback_program',
            edge_type: 'feedback_program_collects_feature_request',
            target_type: 'feature_request',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'customer_feedback',
            edge_type: 'customer_feedback_becomes_feature_request',
            target_type: 'feature_request',
            comparison: 'not_exists',
          },
        },
        {
          check: {
            type: 'relationship',
            source_type: 'feature_request',
            edge_type: 'feature_request_from_behavioral_segment',
            target_type: 'behavioral_segment',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'Requests without a source get prioritised on volume of voice, not on the strength or fit of who is asking. The loudest channel wins by default.',
    remediation:
      'Attach provenance to each `feature_request` via `feedback_program_collects_feature_request`, `customer_feedback_becomes_feature_request`, or `feature_request_from_behavioral_segment` before it enters prioritisation.',
    stages: ['beta', 'launch', 'growth', 'mature'],
    severity: 'medium',
    source: { kind: 'practitioner', attribution: 'Marty Cagan, Inspired (product discovery)' },
  },

  // ── Operating-function layer (0.17.0): member_kind: operating_function ─────
  // Carry concern 'operating' (UPG_ANTI_PATTERN_CONCERNS) and are evaluated ONLY
  // for operating_function graphs — a function a team operates (revenue / success
  // / finance / people / marketing), not a product it ships. The product-spine
  // patterns above are not evaluated for that kind (category errors); these assert
  // the function spine instead.
  {
    id: 'operating-function-without-north-star',
    since: '0.17.0',
    name: 'Operating function without a north-star metric',
    description:
      'An operating function graph has real content but no north-star metric to operate toward. A function (sales, finance, people, marketing) is run against one headline number it moves and that rolls up to the company tree. With no north-star metric the function has direction but nothing to steer by.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'total_entity_count', comparison: 'gt', threshold: 3 } },
        { check: { type: 'entity_count', entity_type: 'metric', filter: { property: 'designation', value: 'north_star' }, comparison: 'zero' } },
      ],
    },
    why_it_matters:
      'A function with no north-star metric cannot be steered, prioritised, or rolled into the company metric tree. Operating work becomes activity without a measured target.',
    remediation:
      'Add the one `metric` the function operates toward and mark it `designation: north_star`, then wire it to the company metric tree via `metric_decomposes_into_metric`.',
    stages: ['concept', 'validation', 'build', 'beta', 'launch', 'growth', 'mature', 'maintenance', 'sunset'],
    severity: 'high',
    source: { kind: 'fundamental' },
  },

  {
    id: 'operating-function-without-operating-content',
    since: '0.17.0',
    name: 'Operating function without operating content',
    description:
      'An operating function graph has more than a few entities but none in any operating domain (sales, go-to-market, customer success, growth, marketing, business model, pricing). It carries direction and people but no operating substance: the work the function actually runs.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'total_entity_count', comparison: 'gt', threshold: 3 } },
        { check: { type: 'domain_population', domain_id: 'sales', comparison: 'zero' } },
        { check: { type: 'domain_population', domain_id: 'go_to_market', comparison: 'zero' } },
        { check: { type: 'domain_population', domain_id: 'customer_success', comparison: 'zero' } },
        { check: { type: 'domain_population', domain_id: 'growth', comparison: 'zero' } },
        { check: { type: 'domain_population', domain_id: 'marketing', comparison: 'zero' } },
        { check: { type: 'domain_population', domain_id: 'business_model', comparison: 'zero' } },
        { check: { type: 'domain_population', domain_id: 'pricing', comparison: 'zero' } },
      ],
    },
    why_it_matters:
      'A function graph that is all strategy and org chart with no operating domain is a stub: it states intent but models none of the work the function runs, so it answers no operating questions.',
    remediation:
      'Populate at least one operating domain appropriate to the function (e.g. Field → `sales` / `go_to_market` / `customer_success`; Finance → `business_model` / `pricing`). Start from the matching template via `/upg-new-from-template`.',
    stages: ['concept', 'validation', 'build', 'beta', 'launch', 'growth', 'mature', 'maintenance', 'sunset'],
    severity: 'medium',
    source: { kind: 'fundamental' },
  },

  // ── Foundations layer (0.9.13): portfolio-scoped, registry-aware ──────────
  // These read the shared registry + cross-product edges, so they are evaluated
  // by portfolio_validate, not the single-graph evaluator. They carry no
  // structured_condition (the detector is cross-product, not a single-graph
  // IntelligenceCondition).
  {
    id: 'specification-without-implementer',
    since: '0.9.13',
    scope: 'portfolio',
    name: 'Specification without implementer',
    description:
      'A specification in the shared registry has no product, feature, or api_contract implementing or conforming to it anywhere in the portfolio. A specification nobody implements is a document, not a contract: it states an intent the portfolio never honours.',
    why_it_matters:
      'An unimplemented specification carries authority it has not earned. Teams cite it as a standard while no surface actually conforms, so conformance claims cannot be trusted or traced.',
    remediation:
      'Link at least one product, feature, or api_contract to the specification via `product_implements_specification`, `product_exposes_specification`, `feature_conforms_to_specification`, or `api_contract_speaks_specification`; or retire the specification from the registry.',
    stages: ['validation', 'build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'medium',
    source: { kind: 'fundamental' },
  },

  {
    id: 'primitive-scattered-without-canonical',
    since: '0.9.13',
    scope: 'portfolio',
    name: 'Primitive scattered without a canonical',
    description:
      'The same primitive concept appears as a product-local node in two or more products, but no canonical primitive in the shared registry unifies them. Each product redefines the building block on its own terms, so the portfolio carries several drifting copies of one shared idea instead of a single authoritative definition.',
    why_it_matters:
      'Scattered primitives drift apart in name, shape, and meaning. Cross-product reasoning breaks because the same concept reads as several unrelated entities, and a change to the shared building block has no single place to land.',
    remediation:
      'Define the shared primitive once in the registry with `define_canonical_entity`, then link each product copy via `register_instance` so the building block has one authoritative definition.',
    stages: ['build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'medium',
    source: { kind: 'fundamental' },
  },

  {
    id: 'product-reimplements-specification',
    since: '0.9.13',
    scope: 'portfolio',
    name: 'Specification reimplemented across products',
    description:
      'Two or more products independently implement the same registry specification rather than one depending on a shared implementation. Parallel implementations of a single contract multiply the surface that must stay in sync and usually signal a missing shared library or service.',
    why_it_matters:
      'Every independent reimplementation of a specification is another place a conformance bug can hide and another copy that drifts from the contract. The cost of a spec change scales with the number of reimplementers.',
    remediation:
      'Consolidate onto one implementation that the others depend on (`depends_on_product` / `hosts`), or confirm the duplication is deliberate and record why. Capture the stewarding organization with `create_registry_edge` so the contract has an owner.',
    stages: ['build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'low',
    source: { kind: 'fundamental' },
  },

  // ── Operating-function org link (0.17.0): portfolio-scoped ─────────────────
  // Cross-product detector (in portfolio_validate): an operating_function graph
  // should reference the org unit it operates under, which lives once in the
  // rollup's team_org map. Carries no structured_condition — the org link is a
  // cross-product edge in portfolio.upg, not a single-graph shape.
  {
    id: 'operating-function-without-org-link',
    since: '0.17.0',
    scope: 'portfolio',
    name: 'Operating function without an org link',
    description:
      'An operating_function graph does not reference the org unit it operates under. The department/team hierarchy lives once in the rollup (org_rollup) as team_org entities; a function should point its spine at the department or team that owns it (node_owned_by_department / node_owned_by_team), so the operating layer hangs off the canonical org map rather than re-stating it.',
    why_it_matters:
      'A function with no org link floats free of the org chart: its work cannot be rolled up by department, and the single source of truth for who owns what is bypassed.',
    remediation:
      'Add a cross-product node_owned_by_department (or node_owned_by_team) edge from the function spine to its department/team in the rollup. Mint the org unit once in the org_rollup graph; functions reference it.',
    stages: ['concept', 'validation', 'build', 'beta', 'launch', 'growth', 'mature', 'maintenance', 'sunset'],
    severity: 'medium',
    source: { kind: 'fundamental' },
  },

  // ── surface (0.27.0): the place, its guest list, and its arbitration rule ──
  // Three patterns, calibrated so the contention one leads and the two coverage
  // companions sit a tier below it. Like every entry in this file, each detector
  // is a WHOLE-GRAPH approximation of a per-node rule (cf. personas-without-jobs,
  // which fires on "no persona anywhere links to a job", not per persona): the
  // `IntelligenceCondition` language composes aggregate counts, not per-node
  // predicates.
  {
    id: 'contended-surface-without-arbitration',
    since: '0.27.0',
    name: 'Contended surface without arbitration',
    description:
      'At least one surface in this graph has no recorded answer to "who wins here, and why". Either it holds more occupants than its stated `capacity` allows (or holds several while stating no limit at all) and carries no arbitration_rule, or it admits through arbitration_state that the answer is absent (`none`) or accidental (`safe_by_coincidence`). Left unrecorded, that answer lives in whoever remembers the last argument.',
    // 0.28.0 (feedback 852a9721, from a 30-surface field audit). Three changes,
    // each earned by a reported false positive or a reported blind spot:
    //
    //  (a) rule-absence, EXCEPT chained. `composition_mode: 'chained'` means each
    //      occupant wraps the next rather than competing with it. Many occupants
    //      and no arbitration rule is the designed shape, so the reporter's 14
    //      chained slots were 14 standing false positives — and because
    //      `get_anti_pattern_violations_for` attributes by TYPE, they kept the
    //      whole surface roster lit no matter how diligently the genuinely
    //      contended surfaces were documented. The check could never be silenced
    //      by correct modelling, which is the property a check has to have.
    //      Exemption is DECLARE-TO-EARN: an unset `composition_mode` still fires,
    //      so the default posture stays suspicious and silence must be claimed.
    //  (b) `safe_by_coincidence` fires on its own, with no chained exemption. It
    //      is the one state that a written `arbitration_rule` can mask: the field
    //      audit found surfaces whose prose described disjoint enum values doing
    //      the arbitrating with nothing guarding them. Branch (a) cannot see
    //      those, because the rule text is present.
    //  (c) `none` fires on its own too. A graph that says "nobody decided" while
    //      carrying rule text is contradicting itself, and the admission is the
    //      half to believe.
    //
    // `enforced_undocumented` deliberately gets NO branch and NO suppression. It
    // needs none: a surface enforcing an untranscribed rule has no
    // `arbitration_rule`, so branch (a) already fires. Nor does it earn a
    // downgrade — severity is per-anti-pattern, not per-violation, so there is
    // nowhere to put one; and the harm this pattern names is that the settlement
    // is unrecorded, which is exactly what `enforced_undocumented` admits. The
    // graph is the record; code is not. What the state buys is triage, so the
    // remediation text below names the two costs separately.
    //
    // No new anti-pattern was minted for `safe_by_coincidence`. It is a value of
    // the arbitration question, not a different question, and a second detector
    // would fire on the same graphs and double-report through type-keyed
    // attribution — making this family noisier on its first real deployment,
    // which is the exact failure (a) exists to fix. If field evidence later shows
    // it needs its own severity, mint it then.
    //
    // 0.29.0 (feedback af9ae4c2, the same reporter's measured follow-up: 43
    // surfaces, 10 flagged, 7 rightly and 3 wrongly). Branch (a) moved from an
    // aggregate presence count to the per-node `edge_count_vs_property` form.
    //
    //  (d) CAPACITY IS NOW READ. The old branch was a pure edge count: any
    //      surface with more than one occupant and no rule. That flags a header
    //      row declaring room for four and holding exactly four, which is not
    //      contended but PARTITIONED — everyone fits, by design, so nothing is
    //      displaced and there is nothing to decide. All three of the reporter's
    //      false positives were this, and all three had occupancy at or below a
    //      stated capacity. The rule is now `occupancy > (capacity ?? 1)`.
    //
    //      ABSENT CAPACITY BEHAVES AS 1, NOT AS INFINITY. Absence means
    //      unbounded, and it is tempting to read unbounded as "never flag". The
    //      opposite is right: a surface that states no limit has stated no
    //      answer, so two or more occupants is precisely the unrecorded decision
    //      this pattern names. That keeps all four of the reporter's unbounded
    //      true positives (7, 7, 10 and 3 occupants) firing.
    //
    //      The check had to become per-node rather than two ANDed aggregates:
    //      "some surface is over capacity" and "some surface has no rule" are
    //      both true when they are DIFFERENT surfaces, which would have kept
    //      every false positive alive. See `EdgeCountVsPropertyCheck.node_filter`.
    //
    // ADJUDICATED: DOES A CAPACITY-SATISFIED `additive` SURFACE STILL NEED AN
    // ORDERING RULE? The reporter's capacity rule and their own earlier report
    // pull in opposite directions here: 0.28.0 documented that `additive`
    // occupants raise a question of ORDER rather than victory and that the order
    // belongs in `arbitration_rule`, while the capacity rule says a surface
    // where everyone fits has nothing to settle. Ruling: BOTH ARE RIGHT, because
    // they are about different failures, and this detector owns only one of them.
    //
    //   - Contention is about DISPLACEMENT: who is not rendered. Capacity settles
    //     it. If everyone fits, nobody is displaced, and "who wins" is genuinely
    //     moot. That is why reading capacity removes real false positives rather
    //     than merely quieting the check.
    //   - Ordering is about ARRANGEMENT: in what sequence coexisting occupants
    //     appear. Capacity says nothing about it. The reporter's own four-occupant
    //     header row, positioned by runtime width measurement, has a live ordering
    //     question and no displacement question at all.
    //
    // So this check reads capacity and stops at displacement. The ordering concern
    // stays documented on `composition_mode: 'additive'` as guidance, NOT as a
    // detector: minting `additive-surface-without-ordering` today would repeat the
    // 0.28.0 mistake of shipping a second detector on no field evidence, and it
    // would double-report against this one. Mint it when a graph shows unrecorded
    // ordering causing a real defect, with its own severity and remediation.
    //
    // Known consequence, recorded rather than papered over: `arbitration_rule` is
    // now visibly OVERLOADED. It holds a displacement rule for `exclusive`
    // surfaces and an ordering rule for `additive` ones, and this check reads it
    // for only the first. Splitting it (`arbitration_rule` vs `ordering_rule`) is
    // the natural move if the ordering detector is ever minted; it is not worth a
    // breaking property change before then.
    //
    // STILL OPEN (banked at 0.28.0, deliberately NOT changed here): a `chained`
    // slot that honestly declares `arbitration_state: 'none'` re-fires through
    // branch (c), which carries no chained exemption. Current guidance stands:
    // leave `arbitration_state` unset on chained surfaces. Changing (b)/(c) was
    // out of scope for this release and still awaits the field confirmation the
    // reporter will produce populating their 14 chained slots.
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'surface', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'feature',
            edge_type: 'feature_occupies_surface',
            target_type: 'surface',
            comparison: 'exists',
          },
        },
        {
          operator: 'or',
          checks: [
            {
              check: {
                type: 'edge_count_vs_property',
                entity_type: 'surface',
                edge_type: 'feature_occupies_surface',
                direction: 'inbound',
                property: 'capacity',
                property_absent_default: 1,
                node_comparison: 'gt',
                node_filter: { property: 'arbitration_rule', present: false },
                except_property: 'composition_mode',
                except_value: 'chained',
                comparison: 'nonzero',
              },
            },
            {
              check: {
                type: 'entity_count',
                entity_type: 'surface',
                filter: { property: 'arbitration_state', value: 'safe_by_coincidence' },
                comparison: 'nonzero',
              },
            },
            {
              check: {
                type: 'entity_count',
                entity_type: 'surface',
                filter: { property: 'arbitration_state', value: 'none' },
                comparison: 'nonzero',
              },
            },
          ],
        },
      ],
    },
    why_it_matters:
      'Contention over a UI place is settled every time it comes up, and an unrecorded settlement is re-argued at the next feature. The cost is paid in repeated decisions, not in a visible defect. A surface that is safe only by coincidence pays it all at once instead, the first time an occupant is added.',
    remediation:
      'The violation names the offending surfaces in `target_node_ids`; start there rather than re-reading the whole roster. Read `arbitration_state` first: it says what the work actually is. `enforced_undocumented` means the rule already exists in code and needs transcribing into `arbitration_rule`: ten minutes, no meeting. `none` means nobody has decided and someone has to. `safe_by_coincidence` means nothing is enforcing anything and the surface only looks settled; that one wants a guard in code, not just prose. If a flagged surface genuinely holds everything it was designed to hold, the honest fix is to state its `capacity`, not to invent a rule: a surface whose occupancy is at or below a stated capacity is partitioned rather than contended, and it stops firing. Where a design system already answers the question, link the source with `surface_governed_by_design_guideline`. Surfaces whose occupants wrap one another rather than compete should declare `composition_mode: \'chained\'`, which exempts them: that is a factual claim about how the code composes, not a way to quiet the check.',
    stages: ['build', 'beta', 'launch', 'growth', 'mature', 'maintenance'],
    severity: 'medium',
    source: { kind: 'fundamental' },
  },

  {
    id: 'surface-without-job',
    since: '0.27.0',
    name: 'Surface without a job',
    description:
      'The graph has surfaces, but none links to the job it exists to serve. A surface with no job is a place that survives on precedent: it is there because it has always been there.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'surface', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'surface',
            edge_type: 'surface_serves_job',
            target_type: 'job',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'Without a job, there is no test for whether a surface still earns its space. Places accumulate, and the layout argument becomes a matter of taste rather than of purpose.',
    remediation:
      'Link each surface to the job it serves with `surface_serves_job`. A surface that cannot name one is a candidate for removal or for merging into its parent.',
    stages: ['build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'low',
    source: { kind: 'practitioner', attribution: 'Clayton Christensen, Jobs to Be Done' },
  },

  {
    id: 'surface-without-measurement',
    since: '0.27.0',
    name: 'Surface without measurement',
    description:
      'The graph has surfaces, but none links to a metric. Nothing reports whether the place is used, ignored, or in the way.',
    structured_condition: {
      operator: 'and',
      checks: [
        { check: { type: 'entity_count', entity_type: 'surface', comparison: 'nonzero' } },
        {
          check: {
            type: 'relationship',
            source_type: 'surface',
            edge_type: 'surface_measured_by_metric',
            target_type: 'metric',
            comparison: 'not_exists',
          },
        },
      ],
    },
    why_it_matters:
      'An unmeasured surface cannot be retired on evidence. It is defended by whoever built it and challenged by whoever wants its space, with no reading to settle the question.',
    remediation:
      'Attach the reading that would justify keeping the place with `surface_measured_by_metric`. Engagement, or the rate at which its occupants are actually invoked, is usually the honest one.',
    stages: ['build', 'beta', 'launch', 'growth', 'mature'],
    severity: 'low',
    source: { kind: 'fundamental' },
  },
] as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * One `{ property, present, except_property, except_value }` filter declared
 * somewhere in `UPG_ANTI_PATTERNS`, flattened for collectors.
 *
 * @see UPG_PRESENCE_EXCEPT_SPECS
 */
export interface UPGPresenceExceptSpec {
  /** Entity type the count is taken over. */
  entity_type: string
  /** Property whose presence is being counted. */
  property: string
  /** Property that removes an entity from the counted population. */
  except_property: string
  /** Value of `except_property` that triggers the exclusion. */
  except_value: string
}

/** Recursively collect except-filter specs from one condition tree. */
function walkForExceptSpecs(
  cond: IntelligenceCondition,
  out: UPGPresenceExceptSpec[],
): void {
  if ('operator' in cond) {
    for (const child of cond.checks) walkForExceptSpecs(child, out)
    return
  }
  const check = cond.check
  if (check.type !== 'entity_count' || !check.filter) return
  const f = check.filter as Record<string, unknown>
  if (
    typeof f.property !== 'string' ||
    typeof f.except_property !== 'string' ||
    typeof f.except_value !== 'string'
  ) {
    return
  }
  const spec: UPGPresenceExceptSpec = {
    entity_type: check.entity_type,
    property: f.property,
    except_property: f.except_property,
    except_value: f.except_value,
  }
  const seen = out.some(
    (s) =>
      s.entity_type === spec.entity_type &&
      s.property === spec.property &&
      s.except_property === spec.except_property &&
      s.except_value === spec.except_value,
  )
  if (!seen) out.push(spec)
}

/**
 * Every except-qualified presence filter the catalog declares (0.28.0).
 *
 * A collector cannot compute joint property counts speculatively: indexing
 * every (property, other-property, other-value) triple is quadratic in
 * properties-per-node and would tax every `validate_graph` call to serve one
 * detector. Nor can it derive the count arithmetically from the existing
 * indexes, because those record marginals and the question is an intersection.
 *
 * So the catalog declares what it needs and collectors compute exactly that
 * and no more. It stays correct without maintenance because it is derived from
 * the conditions themselves.
 *
 * EMPTY SINCE 0.29.0, AND THAT IS NOT A REGRESSION. Its one declarer was the
 * arbitration branch of `contended-surface-without-arbitration`, which moved to
 * the per-node `edge_count_vs_property` form because the aggregate could not
 * ask "over capacity" and "no rule" of the SAME surface. The mechanism stays
 * supported and tested: an except-qualified presence count is still the right
 * instrument for a detector that needs an intersection of two marginals and no
 * per-node arithmetic, and a future pattern declaring one gets it for free.
 *
 * @example
 * // The shape, as the 0.28.0 contention branch declared it:
 * // { entity_type: 'surface', property: 'arbitration_rule',
 * //   except_property: 'composition_mode', except_value: 'chained' }
 */
export const UPG_PRESENCE_EXCEPT_SPECS: readonly UPGPresenceExceptSpec[] = (() => {
  const out: UPGPresenceExceptSpec[] = []
  for (const ap of UPG_ANTI_PATTERNS) {
    if (ap.structured_condition) walkForExceptSpecs(ap.structured_condition, out)
  }
  return out
})()

/**
 * Canonical key for an except-qualified presence count, shared by the
 * collectors that build `countsByTypeAndPropertyPresenceExcept` and the
 * evaluator that reads it. Both sides must agree, so neither spells it inline.
 *
 * @example
 * presenceExceptKey('arbitration_rule', 'composition_mode', 'chained')
 * // → "arbitration_rule!composition_mode=chained"
 */
export function presenceExceptKey(
  property: string,
  exceptProperty: string,
  exceptValue: string,
): string {
  return `${property}!${exceptProperty}=${exceptValue}`
}

/**
 * One `edge_count_vs_property` check declared somewhere in
 * `UPG_ANTI_PATTERNS`, flattened for collectors (0.29.0).
 *
 * @see UPG_EDGE_COUNT_SPECS
 */
export interface UPGEdgeCountSpec {
  /** Entity type whose nodes are evaluated one at a time. */
  entity_type: string
  /** Edge type counted against each node. */
  edge_type: string
  /** Which end of the edge the evaluated node sits on. */
  direction: 'inbound' | 'outbound'
  /** The node's own numeric property the count is compared against. */
  property: string
  /** Value used when the node does not carry `property` at all. */
  property_absent_default: number
  /** How the count must relate to the property for the node to match. */
  node_comparison: 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
  /** Optional extra per-node presence requirement. */
  node_filter?: { property: string; present: boolean }
  /** Property that removes a node from the evaluated population. */
  except_property?: string
  /** Value of `except_property` that triggers the exclusion. */
  except_value?: string
}

/**
 * Canonical key for one edge-count spec, shared by the collectors that build
 * `nodesByEdgeCountSpec` and the evaluator that reads it. Both sides must
 * agree, so neither spells it inline.
 *
 * Every discriminating field is in the key. Two detectors asking about the same
 * edge and property but with different thresholds, filters or exemptions are
 * different questions and must not collide on one tally.
 *
 * @example
 * edgeCountSpecKey({ entity_type: 'surface', edge_type: 'feature_occupies_surface',
 *   direction: 'inbound', property: 'capacity', property_absent_default: 1,
 *   node_comparison: 'gt', node_filter: { property: 'arbitration_rule', present: false },
 *   except_property: 'composition_mode', except_value: 'chained' })
 * // → "surface|feature_occupies_surface|inbound|capacity|1|gt|arbitration_rule=absent|composition_mode=chained"
 */
export function edgeCountSpecKey(spec: UPGEdgeCountSpec): string {
  const filter = spec.node_filter
    ? `${spec.node_filter.property}=${spec.node_filter.present ? 'present' : 'absent'}`
    : '*'
  const except =
    spec.except_property !== undefined && spec.except_value !== undefined
      ? `${spec.except_property}=${spec.except_value}`
      : '*'
  return [
    spec.entity_type,
    spec.edge_type,
    spec.direction,
    spec.property,
    String(spec.property_absent_default),
    spec.node_comparison,
    filter,
    except,
  ].join('|')
}

/**
 * Canonical key for one `entity_count` filter, shared by the collectors that
 * build `nodesByEntityFilter` and the evaluator that reads it (0.29.0).
 *
 * Covers all four filter forms in `EntityCheck.filter`. The key encodes the
 * filter as the detector wrote it, so a `present: false` filter and a
 * `present: true` filter over the same property are different keys holding
 * different node sets, and neither has to be derived from the other by
 * subtraction.
 *
 * @example
 * entityFilterKey('surface', { property: 'arbitration_state', value: 'none' })
 * // → "surface|arbitration_state=none"
 * entityFilterKey('hypothesis', { status: 'drafted' })
 * // → "hypothesis|status=drafted"
 */
export function entityFilterKey(
  entityType: string,
  filter: Record<string, unknown>,
): string {
  const kind = classifyEntityFilter(filter)
  switch (kind) {
    case 'presence':
      return `${entityType}|${filter.property as string}=${filter.present ? 'present' : 'absent'}`
    case 'value':
      return `${entityType}|${filter.property as string}=${filter.value as string}`
    case 'status':
      return `${entityType}|status=${filter.status as string}`
    case 'unrecognized':
      // Unreachable through the catalog: `walkForEntityFilterSpecs` throws on
      // this shape at module load, so a filter that gets here never made it
      // into a shipped condition. Kept as a distinct key rather than a silent
      // catch-all so that if it somehow IS reached, two different unrecognized
      // filters cannot collide on one tally and dedup each other away.
      return `${entityType}|<unrecognized>`
  }
}

/**
 * Which of the recognised `EntityCheck.filter` shapes this is.
 *
 * The presence form deliberately does NOT branch on `except_property` /
 * `except_value`. Those belong to the aggregate
 * `countsByTypeAndPropertyPresenceExcept` mechanism, which is still supported
 * for counting; ATTRIBUTION for that shape has no declarer, no collector path
 * and no test, and shipping an unexercised parallel path is how the next drift
 * starts. When a detector declares one, its attribution lands with it and with
 * a test. Until then such a filter classifies as `presence` and is attributed
 * on the presence predicate alone, which is a superset and therefore never
 * names a node the detector did not implicate.
 */
export function classifyEntityFilter(
  filter: Record<string, unknown>,
): 'presence' | 'value' | 'status' | 'unrecognized' {
  const hasProperty = typeof filter.property === 'string'
  if (hasProperty && typeof filter.present === 'boolean') return 'presence'
  if (hasProperty && typeof filter.value === 'string') return 'value'
  if (typeof filter.status === 'string') return 'status'
  return 'unrecognized'
}

/**
 * One `entity_count` filter declared somewhere in `UPG_ANTI_PATTERNS`,
 * flattened for collectors (0.29.0). Attribution only: the counts these
 * filters drive are unchanged and still read the aggregate tallies.
 *
 * @see UPG_ENTITY_FILTER_SPECS
 */
export interface UPGEntityFilterSpec {
  /** Entity type the filter is applied to. */
  entity_type: string
  /** The filter exactly as the detector declared it. */
  filter: Record<string, unknown>
  /**
   * Which recognised shape this filter is, resolved once at derivation.
   *
   * Carrying it means a collector switches exhaustively on a closed set rather
   * than re-sniffing the shape and quietly skipping anything it was not taught.
   * A silent skip there produces a forever-empty match list: attribution dies
   * with no error and no failing test, which is the worst possible failure for
   * a feature whose whole job is to name things.
   */
  kind: 'presence' | 'value' | 'status'
}

/** Recursively collect entity-count filter specs from one condition tree. */
function walkForEntityFilterSpecs(
  cond: IntelligenceCondition,
  out: UPGEntityFilterSpec[],
): void {
  if ('operator' in cond) {
    for (const child of cond.checks) walkForEntityFilterSpecs(child, out)
    return
  }
  const check = cond.check
  if (check.type !== 'entity_count' || !check.filter) return
  const kind = classifyEntityFilter(check.filter)
  if (kind === 'unrecognized') {
    // LOUD, AND AT MODULE LOAD. A filter shape nothing can classify would
    // otherwise reach the collector, match nothing forever, and cost the
    // detector its attribution in total silence. Failing here means a spec
    // author learns at the moment they write it, and no shipped build can
    // contain one.
    throw new Error(
      `Unrecognized entity_count filter shape on "${check.entity_type}": ` +
        `${JSON.stringify(check.filter)}. Recognised shapes are ` +
        `{ property, present }, { property, value } and { status }. ` +
        `Teach classifyEntityFilter + the collector before declaring a new one.`,
    )
  }
  const key = entityFilterKey(check.entity_type, check.filter)
  if (out.some((s) => entityFilterKey(s.entity_type, s.filter) === key)) return
  out.push({ entity_type: check.entity_type, filter: check.filter, kind })
}

/**
 * Every `entity_count` filter the catalog declares (0.29.0), so collectors can
 * record which nodes matched each one without indexing the whole graph.
 *
 * The catalog declares five filters in total, which is what makes per-node
 * attribution affordable here: a handful of predicate evaluations per node,
 * rather than an id list for every (type, property, value) triple that happens
 * to exist in the data.
 */
export const UPG_ENTITY_FILTER_SPECS: readonly UPGEntityFilterSpec[] = (() => {
  const out: UPGEntityFilterSpec[] = []
  for (const ap of UPG_ANTI_PATTERNS) {
    if (ap.structured_condition) walkForEntityFilterSpecs(ap.structured_condition, out)
  }
  return out
})()

/**
 * Normalise one `edge_count_vs_property` check into its spec.
 *
 * THE ONLY PLACE THIS SHAPE IS CONSTRUCTED. The spec has nine fields and every
 * one of them is keyed into `edgeCountSpecKey`, so a second construction site
 * that forgot to apply the `direction` default (or added a field) would produce
 * a key that silently misses the collector's entry, and the check would read as
 * "no node matched" rather than failing. Collector, evaluator and attribution
 * all route through here.
 */
export function checkToEdgeCountSpec(check: EdgeCountVsPropertyCheck): UPGEdgeCountSpec {
  return {
    entity_type: check.entity_type,
    edge_type: check.edge_type,
    direction: check.direction ?? 'inbound',
    property: check.property,
    property_absent_default: check.property_absent_default,
    node_comparison: check.node_comparison,
    node_filter: check.node_filter,
    except_property: check.except_property,
    except_value: check.except_value,
  }
}

/** Recursively collect edge-count specs from one condition tree. */
function walkForEdgeCountSpecs(
  cond: IntelligenceCondition,
  out: UPGEdgeCountSpec[],
): void {
  if ('operator' in cond) {
    for (const child of cond.checks) walkForEdgeCountSpecs(child, out)
    return
  }
  const check = cond.check
  if (check.type !== 'edge_count_vs_property') return
  const spec = checkToEdgeCountSpec(check)
  const key = edgeCountSpecKey(spec)
  if (!out.some((s) => edgeCountSpecKey(s) === key)) out.push(spec)
}

/**
 * Every per-node edge-count check the catalog declares (0.29.0).
 *
 * Same contract as `UPG_PRESENCE_EXCEPT_SPECS`: the catalog states what it
 * needs, collectors compute exactly that and nothing more. Indexing every
 * (type, edge type, property) triple speculatively would tax every
 * `validate_graph` call to serve one detector, and unlike the aggregate counts
 * these tallies cannot be derived from each other.
 *
 * Today the list holds one entry (surface occupancy against `capacity`), and it
 * stays correct without maintenance because it is derived from the conditions
 * themselves.
 */
export const UPG_EDGE_COUNT_SPECS: readonly UPGEdgeCountSpec[] = (() => {
  const out: UPGEdgeCountSpec[] = []
  for (const ap of UPG_ANTI_PATTERNS) {
    if (ap.structured_condition) walkForEdgeCountSpecs(ap.structured_condition, out)
  }
  return out
})()

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
