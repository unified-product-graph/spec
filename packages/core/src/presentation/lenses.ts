/**
 * UPG Lenses: role-specific projections combining vocabulary, visibility,
 * workflow, and intelligence. Applied on read.
 * https://unifiedproductgraph.org/spec | MIT
 */

import { UPG_DOMAINS } from '../registry/domains.js'
import type { IntelligenceCondition } from '../intelligence/intelligence.js'
import type { UPGPlaybook } from '../playbooks/types.js'
import { getPlaybookById } from '../playbooks/index.js'

// ─── Interface ──────────────────────────────────────────────────────────────────

/**
 * A single context-sensitive nudge belonging to a lens's intelligence
 * layer. Surfaces a message when a trigger condition evaluates to `true`
 * over the current product graph.
 *
 * Runtimes evaluate `structured_condition`, the machine-readable form.
 * `condition` is a human-readable shadow kept for documentation, prompt
 * engineering, debug output, and grep-ability. The two should describe
 * the same intent; when they diverge (rare), `structured_condition` is
 * the source of truth.
 *
 * @example
 * // A simple "missing thing" nudge that fires when the product has no outcomes.
 * const noOutcomes: UPGLensIntelligencePrompt = {
 *   condition: 'outcomes.length === 0',
 *   structured_condition: {
 *     check: { type: 'entity_count', entity_type: 'outcome', comparison: 'zero' },
 *   },
 *   message: 'No outcomes defined yet. Start with what success looks like: what measurable result should this product drive?',
 * }
 *
 * @example
 * // A compound nudge: features exist but no hypotheses validate them.
 * const featuresWithoutHypotheses: UPGLensIntelligencePrompt = {
 *   condition: 'features.length > 0 && hypotheses.length === 0',
 *   structured_condition: {
 *     operator: 'and',
 *     checks: [
 *       { check: { type: 'entity_count', entity_type: 'feature', comparison: 'nonzero' } },
 *       { check: { type: 'entity_count', entity_type: 'hypothesis', comparison: 'zero' } },
 *     ],
 *   },
 *   message: 'Features without hypotheses means you are building on assumptions. What needs to be true for these features to matter?',
 * }
 */
export interface UPGLensIntelligencePrompt {
  /**
   * Human-readable shadow of `structured_condition`. Kept as documentary reference,
   * useful for prompt engineering, debug output, and search. Not evaluated
   * at runtime; if the two ever diverge, `structured_condition` wins.
   */
  condition: string
  /** Machine-evaluable condition: when to surface this prompt. */
  structured_condition: IntelligenceCondition
  /** The message to show, in the lens's voice */
  message: string
}

/**
 * A contextual projection of the product graph for a specific role,
 * framework, or mode of thinking.
 *
 * A lens combines four orthogonal layers: vocabulary (which labels to
 * use), visibility (which domains to show), workflow (which guided
 * sequence to follow), and intelligence (which nudges to surface). The
 * `.upg` file format is lens-unaware; lenses apply on read only.
 *
 * @example
 * const productLens: UPGLens = {
 *   id: 'product',
 *   name: 'Product',
 *   description: 'Full graph, PM vocabulary, outcome-driven workflow',
 *   icon: 'target',
 *   framework_id: 'ost',
 *   visible_domains: [], // empty = all visible
 *   playbook_id: 'playbook:product-delivery',
 *   benchmark_domains: ['strategy', 'user', 'discovery', 'validation'],
 *   intelligence_prompts: [
 *     {
 *       condition: 'outcomes.length === 0',
 *       structured_condition: {
 *         check: { type: 'entity_count', entity_type: 'outcome', comparison: 'zero' },
 *       },
 *       message: 'No outcomes defined yet. Start with what success looks like.',
 *     },
 *   ],
 *   audience: 'Product managers and founders making strategic decisions',
 *   perspective: 'Outcome-driven, evidence-aware, strategically oriented.',
 * }
 */
export interface UPGLens {
  /** Unique identifier (e.g. 'product', 'ux_design', 'engineering') */
  id: string
  /** Human-readable name */
  name: string
  /** One-sentence description of what this lens shows */
  description: string
  /** Lucide icon name for UI rendering */
  icon: string

  // ── Vocabulary ──
  /** Framework ID for label resolution (maps to type-labels.ts framework_labels) */
  framework_id?: string
  /** Custom label overrides (entity type → display label) for cases where no framework covers the translation */
  label_overrides?: Record<string, string>

  // ── Visibility ──
  /** Domain IDs to show (from domains.ts). Empty array = show all. */
  visible_domains: string[]
  /** Specific entity types to always show even if their domain is hidden */
  always_show_types?: string[]
  /** Specific entity types to always hide even if their domain is visible */
  always_hide_types?: string[]

  // ── Playbook ──
  /**
   * Optional ID of the canonical `UPGPlaybook` that best matches this lens's
   * mental model. Structure lives in the playbook registry; the lens owns
   * only presentation (labels, visibility, intelligence).
   *
   * Lenses without a 1:1 region playbook (e.g. `product`, `full`, both
   * cross-region) leave this field unset. Resolved via `getLensPlaybook`.
   *
   * Renamed from `workflow_id` (workflows → playbooks + techniques).
   */
  playbook_id?: string

  // ── Intelligence ──
  /** Which benchmark domain IDs to check */
  benchmark_domains: string[]
  /** Custom intelligence prompts scoped to this lens's perspective */
  intelligence_prompts: UPGLensIntelligencePrompt[]

  // ── Audience ──
  /** Who this lens is designed for */
  audience: string
  /** Plain language description of the perspective this lens provides */
  perspective: string
}

// ─── The 9 Lenses ────────────────────────────────────────────────────────────────

export const UPG_LENSES: readonly UPGLens[] = [

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. PRODUCT LENS - the strategic command view
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'product',
    name: 'Product',
    description: 'Full graph, PM vocabulary, outcome-driven workflow',
    icon: 'target',
    framework_id: 'ost',
    label_overrides: {
      experiment: 'Experiment',
      learning: 'Validated Learning',
    },
    visible_domains: [], // all domains visible
    // playbook_id intentionally unset: the product lens spans every region;
    // no single canonical playbook captures the cross-region "PM journey"
    // narrative that lived in the v0.2 lens-workflow `product-journey`.
    benchmark_domains: [
      'strategy', 'user', 'discovery', 'validation',
      'market_intelligence', 'product_spec', 'growth',
    ],
    intelligence_prompts: [
      {
        condition: 'outcomes.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'outcome', comparison: 'zero' } },
        message: 'No outcomes defined yet. Start with what success looks like: what measurable result should this product drive?',
      },
      {
        condition: 'hypotheses.untested.length > 3',
        structured_condition: { check: { type: 'entity_count', entity_type: 'hypothesis', filter: { status: 'untested' }, comparison: 'gt', threshold: 3 } },
        message: 'You have untested hypotheses stacking up. Pick the riskiest one and design an experiment before adding more.',
      },
      {
        condition: 'features.length > 0 && hypotheses.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'feature', comparison: 'nonzero' } },
          { check: { type: 'entity_count', entity_type: 'hypothesis', comparison: 'zero' } },
        ] },
        message: 'Features without hypotheses means you are building on assumptions. What needs to be true for these features to matter?',
      },
      {
        condition: 'personas.length > 0 && opportunities.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'persona', comparison: 'nonzero' } },
          { check: { type: 'entity_count', entity_type: 'opportunity', comparison: 'zero' } },
        ] },
        message: 'You know who you are building for, but haven\'t identified opportunities yet. What are the biggest unmet needs?',
      },
      {
        condition: 'competitors.length === 0 && features.length > 3',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'competitor', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'feature', comparison: 'gt', threshold: 3 } },
        ] },
        message: 'You are building without competitive context. Who else solves this problem, and how is your approach different?',
      },
    ],
    audience: 'Product managers, founders making strategic decisions, and anyone thinking about what to build and why',
    perspective: 'Sees the product as a system of outcomes, opportunities, and validated bets. Outcome-driven, evidence-aware, strategically oriented.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. DESIGN LENS - user-centric, journey-first
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'ux_design',
    name: 'Design',
    description: 'User-centric view with design vocabulary, journey-first workflow',
    icon: 'pen-tool',
    framework_id: 'design_thinking',
    label_overrides: {
      need: 'Pain Point',
      insight: 'Finding',
      opportunity: 'Design Opportunity',
      solution: 'Design Concept',
      experiment: 'Usability Test',
      learning: 'Test Finding',
      feature: 'Feature',
    },
    visible_domains: [
      'ux_design', 'user', 'user_research', 'product_spec',
      'feedback', 'accessibility', 'content',
    ],
    always_show_types: ['product', 'outcome'],
    always_hide_types: [
      'database_schema', 'queue_topic', 'build_artifact',
      'ci_pipeline', 'service_level_indicator', 'service_level_objective', 'error_budget',
    ],
    playbook_id: 'playbook:experience-design-brand',
    benchmark_domains: [
      'ux_design', 'user', 'user_research', 'feedback', 'accessibility',
    ],
    intelligence_prompts: [
      {
        condition: 'personas.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'persona', comparison: 'zero' } },
        message: 'No personas yet. Who are you designing for? Start with the person, not the screen.',
      },
      {
        condition: 'user_journeys.length === 0 && screens.length > 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'user_journey', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'screen', comparison: 'nonzero' } },
        ] },
        message: 'You have screens but no user journeys. Without a journey, screens are disconnected pages. Map the experience first.',
      },
      {
        condition: 'prototypes.length > 0 && experiments.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'prototype', comparison: 'nonzero' } },
          { check: { type: 'entity_count', entity_type: 'experiment_run', comparison: 'zero' } },
        ] },
        message: 'You have prototypes that haven\'t been tested. A prototype only validates when a real user touches it.',
      },
      {
        condition: 'design_questions.length === 0 && needs.length > 3',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'design_question', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'need', comparison: 'gt', threshold: 3 } },
        ] },
        message: 'Plenty of needs identified, but no design questions. Reframe the problems as design opportunities.',
      },
      {
        condition: 'a11y_audits.length === 0 && screens.length > 5',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'a11y_audit', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'screen', comparison: 'gt', threshold: 5 } },
        ] },
        message: 'Many screens designed but no accessibility audit. Inclusive design is not a polish step; it is a design constraint.',
      },
    ],
    audience: 'Designers, UX researchers, and anyone focused on the user experience',
    perspective: 'Sees the product through the eyes of the people using it. Journey-first, evidence-based, obsessed with friction and delight.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. ENGINEERING LENS - architecture-first, system-aware
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Architecture-first view of the product as a technical system',
    icon: 'cpu',
    framework_id: 'dora',
    label_overrides: {
      feature: 'Feature',
      epic: 'Epic',
      user_story: 'Story',
      release: 'Release',
      outcome: 'Product Goal',
      experiment: 'Technical Spike',
      need: 'Requirement',
    },
    visible_domains: [
      'engineering', 'product_spec', 'devops', 'data_analytics',
      'security', 'testing', 'ai', 'automation',
    ],
    always_show_types: ['product', 'outcome', 'persona', 'feature'],
    always_hide_types: [
      'brand_identity', 'brand_colour', 'brand_typography', 'brand_voice',
      'positioning', 'messaging', 'content_piece', 'social_post',
    ],
    playbook_id: 'playbook:engineering-platform',
    benchmark_domains: [
      'engineering', 'product_spec', 'devops', 'security', 'testing', 'data_analytics',
    ],
    intelligence_prompts: [
      {
        condition: 'decisions.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'decision', comparison: 'zero' } },
        message: 'No decisions recorded. Document the key technical choices; future you will thank present you.',
      },
      {
        condition: 'services.length > 0 && api_contracts.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'service', comparison: 'nonzero' } },
          { check: { type: 'entity_count', entity_type: 'api_contract', comparison: 'zero' } },
        ] },
        message: 'Services without API contracts. How do they talk to each other? Define the interfaces.',
      },
      {
        condition: 'features.length > 5 && test_suites.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'feature', comparison: 'gt', threshold: 5 } },
          { check: { type: 'entity_count', entity_type: 'test_suite', comparison: 'zero' } },
        ] },
        message: 'Features shipping without test coverage. What happens when something breaks?',
      },
      {
        condition: 'deployments.length > 0 && monitors.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'deployment', comparison: 'nonzero' } },
          { check: { type: 'entity_count', entity_type: 'monitor', comparison: 'zero' } },
        ] },
        message: 'You are deploying but not monitoring. How will you know when something goes wrong in production?',
      },
      {
        condition: 'technical_debt_items.length > 10',
        structured_condition: { check: { type: 'entity_count', entity_type: 'technical_debt_item', comparison: 'gt', threshold: 10 } },
        message: 'Technical debt is piling up. Consider dedicating a percentage of each cycle to paying it down before it compounds.',
      },
    ],
    audience: 'Developers, CTOs, and anyone building the technical system',
    perspective: 'Sees the product as a system of services, data flows, and deployments. Architecture-first, reliability-aware, concerned with how things are built and how they stay running.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. GROWTH LENS - metrics-driven, experiment-focused
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'growth',
    name: 'Growth',
    description: 'Metrics-driven view focused on funnels, loops, and what moves the numbers',
    icon: 'trending-up',
    framework_id: 'aarrr',
    label_overrides: {
      metric: 'Growth Metric',
      experiment: 'Growth Experiment',
      outcome: 'North Star',
      persona: 'User Segment',
      hypothesis: 'Growth Bet',
      learning: 'Experiment Result',
      insight: 'Data Insight',
    },
    visible_domains: [
      'growth', 'business_model', 'go_to_market', 'data_analytics',
      'pricing', 'feedback', 'market_intelligence',
    ],
    always_show_types: ['product', 'outcome', 'persona'],
    always_hide_types: [
      'bounded_context', 'service', 'api_endpoint', 'database_schema',
      'wireframe', 'design_component', 'design_token',
    ],
    playbook_id: 'playbook:business-growth-metric-driven',
    benchmark_domains: [
      'growth', 'business_model', 'data_analytics', 'pricing', 'go_to_market',
    ],
    intelligence_prompts: [
      {
        condition: 'metrics.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'metric', comparison: 'zero' } },
        message: 'No metrics defined. What numbers best capture the value your product creates for users?',
      },
      {
        condition: 'funnels.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'funnel', comparison: 'zero' } },
        message: 'No funnels mapped. You can\'t improve what you can\'t see. Map the user journey from first touch to activation.',
      },
      {
        condition: 'experiment_runs.length > 0 && metrics.length < 3',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'experiment_run', comparison: 'nonzero' } },
          { check: { type: 'entity_count', entity_type: 'metric', comparison: 'lt', threshold: 3 } },
        ] },
        message: 'Running experiments without enough metrics to measure them. Define the input and output metrics before you test.',
      },
      {
        condition: 'channels.length === 1',
        structured_condition: { check: { type: 'entity_count', entity_type: 'acquisition_channel', comparison: 'eq', threshold: 1 } },
        message: 'Only one acquisition channel. Single-channel dependency is risky. What else could work?',
      },
      {
        // The original second clause `users > 100` references a product-runtime
        // count (real users), not a graph entity count, so it cannot be encoded
        // in IntelligenceCondition. The structured form fires on the cohort
        // gap alone; the string preserves the original intent.
        condition: 'cohorts.length === 0 && users > 100',
        structured_condition: { check: { type: 'entity_count', entity_type: 'cohort', comparison: 'zero' } },
        message: 'No cohort analysis yet. Not all users are the same. Segment by behaviour to find what drives retention.',
      },
    ],
    audience: 'Growth marketers, data-driven founders, and anyone optimising acquisition and retention',
    perspective: 'Sees the product as a system of funnels, loops, and numbers. Experiment-driven, metric-obsessed, always asking what moves the needle.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. BUSINESS LENS - viability-focused
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'business',
    name: 'Business',
    description: 'Viability-focused view of the product as a business that needs to sustain itself',
    icon: 'briefcase',
    framework_id: 'bmc',
    label_overrides: {
      outcome: 'Business Outcome',
      persona: 'Customer Archetype',
      need: 'Customer Problem',
      feature: 'Product Capability',
      opportunity: 'Market Opportunity',
      experiment: 'Business Experiment',
      metric: 'Business Metric',
      hypothesis: 'Business Assumption',
    },
    visible_domains: [
      'business_model', 'pricing', 'go_to_market', 'strategy',
      'market_intelligence', 'growth',
    ],
    always_show_types: ['product', 'persona', 'feature', 'outcome'],
    always_hide_types: [
      'wireframe', 'design_component', 'design_token', 'prototype',
      'bounded_context', 'service', 'api_endpoint', 'database_schema',
      'test_suite', 'test_case', 'ci_pipeline',
    ],
    playbook_id: 'playbook:business-gtm-growth',
    benchmark_domains: [
      'business_model', 'pricing', 'go_to_market', 'strategy', 'market_intelligence', 'growth',
    ],
    intelligence_prompts: [
      {
        condition: 'value_propositions.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'value_proposition', comparison: 'zero' } },
        message: 'No value proposition defined. Why would someone pay for this? That needs an answer before anything else.',
      },
      {
        condition: 'revenue_streams.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'revenue_stream', comparison: 'zero' } },
        message: 'No revenue streams. A product without revenue is a hobby. How will this make money?',
      },
      {
        condition: 'revenue_streams.length > 0 && cost_structures.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'revenue_stream', comparison: 'nonzero' } },
          { check: { type: 'entity_count', entity_type: 'cost_structure', comparison: 'zero' } },
        ] },
        message: 'Revenue modeled but no cost structure. You need both sides of the equation to know if this is viable.',
      },
      {
        condition: 'unit_economics.length === 0 && revenue_streams.length > 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'unit_economics', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'revenue_stream', comparison: 'nonzero' } },
        ] },
        message: 'Revenue streams without unit economics. Does each customer generate more value than they cost to acquire and serve?',
      },
      {
        condition: 'gtm_strategies.length === 0 && features.length > 3',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'gtm_strategy', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'feature', comparison: 'gt', threshold: 3 } },
        ] },
        message: 'Building features without a go-to-market plan. Great products fail when nobody knows they exist.',
      },
    ],
    audience: 'Business-minded founders, CFOs, and investors reviewing the product',
    perspective: 'Sees the product as a business that needs to sustain itself. Viability-focused, cost-aware, always asking whether the math works.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. RESEARCH LENS - evidence-first
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'research',
    name: 'Research',
    description: 'Evidence-first view focused on what is known, assumed, and yet to be learned',
    icon: 'microscope',
    label_overrides: {
      need: 'User Need',
      opportunity: 'Research Opportunity',
      solution: 'Proposed Solution',
      feature: 'Product Concept',
      hypothesis: 'Research Hypothesis',
      experiment: 'Study',
      learning: 'Finding',
      insight: 'Research Insight',
      evidence: 'Evidence',
    },
    visible_domains: [
      'user_research', 'user', 'validation', 'discovery',
      'feedback', 'market_intelligence',
    ],
    always_show_types: ['product', 'outcome', 'persona', 'opportunity'],
    always_hide_types: [
      'database_schema', 'service', 'api_endpoint', 'ci_pipeline',
      'design_component', 'design_token', 'pricing_tier', 'revenue_stream',
    ],
    playbook_id: 'playbook:discovery-research-validation',
    benchmark_domains: [
      'user_research', 'user', 'validation', 'discovery', 'feedback',
    ],
    intelligence_prompts: [
      {
        condition: 'research_studies.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'research_study', comparison: 'zero' } },
        message: 'No research studies yet. What do you need to learn? Start with the questions, not the answers.',
      },
      {
        condition: 'observations.length > 10 && insights.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'observation', comparison: 'gt', threshold: 10 } },
          { check: { type: 'entity_count', entity_type: 'insight', comparison: 'zero' } },
        ] },
        message: 'Lots of observations but no synthesized insights. Raw data is not knowledge. Cluster and extract patterns.',
      },
      {
        condition: 'insights.length > 5 && opportunities.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'insight', comparison: 'gt', threshold: 5 } },
          { check: { type: 'entity_count', entity_type: 'opportunity', comparison: 'zero' } },
        ] },
        message: 'Insights without opportunities. Research is powerful when it drives product decisions. What should the product do about what you learned?',
      },
      {
        condition: 'hypothesiss.length > 3 && experiment_plans.length === 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'hypothesis', comparison: 'gt', threshold: 3 } },
          { check: { type: 'entity_count', entity_type: 'experiment_plan', comparison: 'zero' } },
        ] },
        message: 'Hypothesis claims without experiment plans. The whole point of framing a claim is to test it. What is the cheapest way to learn?',
      },
      {
        condition: 'participants.length < 5 && research_studies.length > 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'participant', comparison: 'lt', threshold: 5 } },
          { check: { type: 'entity_count', entity_type: 'research_study', comparison: 'nonzero' } },
        ] },
        message: 'Very few participants. Qualitative research needs enough voices to reveal patterns. Aim for 5-8 per study minimum.',
      },
    ],
    audience: 'User researchers, discovery coaches, and anyone in a research-heavy phase',
    perspective: 'Sees the product through what is known, what is assumed, and what needs investigation. Evidence-first, synthesis-driven, allergic to untested assumptions.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. MARKETING LENS - audience-aware, message-focused
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Audience-aware view focused on reaching, resonating with, and converting people',
    icon: 'megaphone',
    label_overrides: {
      persona: 'Target Audience',
      need: 'Customer Problem',
      outcome: 'Marketing Goal',
      feature: 'Sellable Feature',
      insight: 'Market Insight',
      experiment: 'Campaign Test',
      metric: 'Marketing Metric',
      hypothesis: 'Messaging Hypothesis',
      learning: 'Campaign Learning',
    },
    visible_domains: [
      'go_to_market', 'content', 'growth', 'feedback',
      'marketing', 'market_intelligence',
    ],
    always_show_types: ['product', 'persona', 'value_proposition', 'feature', 'outcome'],
    always_hide_types: [
      'bounded_context', 'service', 'api_endpoint', 'database_schema',
      'test_suite', 'ci_pipeline', 'service_level_indicator', 'service_level_objective',
      'wireframe', 'design_component', 'design_token',
    ],
    playbook_id: 'playbook:business-marketing-audience-first',
    benchmark_domains: [
      'go_to_market', 'content', 'growth', 'market_intelligence', 'feedback',
    ],
    intelligence_prompts: [
      {
        condition: 'positioning.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'positioning', comparison: 'zero' } },
        message: 'No positioning defined. Before any marketing can work, you need to know: who is this for, what category is it in, and why is it different?',
      },
      {
        condition: 'messaging.length === 0 && features.length > 3',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'messaging', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'feature', comparison: 'gt', threshold: 3 } },
        ] },
        message: 'Features without messaging. Features don\'t sell themselves. What is the message that makes someone care?',
      },
      {
        condition: 'channels.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'marketing_channel', comparison: 'zero' } },
        message: 'No channels mapped. Where does your audience spend time? That is where you need to be.',
      },
      {
        condition: 'content_pieces.length === 0 && channels.length > 0',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'content_piece', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'marketing_channel', comparison: 'nonzero' } },
        ] },
        message: 'Channels without content. You know where to show up, but have nothing to say yet. Start with the content that matches your best channel.',
      },
      {
        condition: 'launches.length === 0 && features.length > 5',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'entity_count', entity_type: 'launch', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'feature', comparison: 'gt', threshold: 5 } },
        ] },
        message: 'Building features without a launch plan. Every feature release is a marketing opportunity. Plan the story before the ship date.',
      },
    ],
    audience: 'Marketers, content creators, brand managers, and GTM leads',
    perspective: 'Sees the product as something that needs to reach and resonate with people. Audience-aware, message-focused, always asking what makes someone care.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. COMPETITIVE LENS - rivals, their dated moves, and where we stand
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'competitive',
    name: 'Competitive',
    description: 'The competitive landscape: rivals, their offerings, dated moves, and where we stand',
    icon: 'swords',
    visible_domains: ['market_intelligence'],
    // Parity (#38) and signal (#41) edges reach onto our side of the graph;
    // surface those endpoints so a parity row or a mapped signal shows both ends.
    always_show_types: ['feature', 'capability', 'opportunity'],
    playbook_id: 'playbook:market-competitive',
    benchmark_domains: ['market_intelligence'],
    intelligence_prompts: [
      {
        condition: 'competitors.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'competitor', comparison: 'zero' } },
        message: 'No competitors mapped yet. Name the 3 to 7 closest alternatives, including the status quo and DIY.',
      },
      {
        condition: 'competitor_signals.length === 0',
        structured_condition: { check: { type: 'entity_count', entity_type: 'competitor_signal', comparison: 'zero' } },
        message: 'No competitor signals captured. Log rivals\' dated moves (launches, pricing changes) and map each onto the feature it threatens.',
      },
    ],
    audience: 'Product marketers, strategists, and founders sizing up the field',
    perspective: 'Sees the product through its rivals: who competes, what they ship, the dated moves they make, and where we lead or trail.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. FULL LENS - everything, canonical vocabulary (default)
  // ═══════════════════════════════════════════════════════════════════════════════

  {
    id: 'full',
    name: 'Full',
    description: 'Complete graph with canonical UPG vocabulary: the whole picture',
    icon: 'layout-grid',
    // No framework_id; uses canonical UPG labels
    // No label_overrides; everything stays canonical
    visible_domains: [], // empty = show all
    // playbook_id intentionally unset: the full lens spans every region;
    // the v0.2 lens-workflow `full-product-journey` was a cross-region
    // traversal whose content is now covered by the 10 canonical region
    // playbooks at v0.3.0.
    benchmark_domains: [], // empty = check all benchmark domains
    intelligence_prompts: [
      {
        condition: 'total_entities < 5',
        structured_condition: { check: { type: 'total_entity_count', comparison: 'lt', threshold: 5 } },
        message: 'The graph is nearly empty. Start with the basics: a product, an outcome, and a persona.',
      },
      {
        condition: 'domains_activated < 3',
        structured_condition: { check: { type: 'domain_count', comparison: 'lt', threshold: 3 } },
        message: 'Only a few domains active. A well-rounded product graph touches strategy, users, and at least one of validation, design, or engineering.',
      },
      {
        condition: 'orphan_entities.length > 5',
        structured_condition: { check: { type: 'orphan_count', comparison: 'gt', threshold: 5 } },
        message: 'Several entities without connections. Every entity should relate to something; orphans are loose thoughts waiting to be placed.',
      },
      {
        condition: 'validation_domain.length === 0 && features.length > 3',
        structured_condition: { operator: 'and', checks: [
          { check: { type: 'domain_population', domain_id: 'validation', comparison: 'zero' } },
          { check: { type: 'entity_count', entity_type: 'feature', comparison: 'gt', threshold: 3 } },
        ] },
        message: 'Building without validating. The validation domain (hypotheses, experiments, evidence) exists to prevent building the wrong thing.',
      },
    ],
    audience: 'Anyone who wants to see the complete picture without filtering',
    perspective: 'The complete, unfiltered product graph using canonical UPG vocabulary. Every domain, every type, every connection.',
  },

] as const

// ─── Lookup helpers ──────────────────────────────────────────────────────────────

/** O(1) lens lookup by id */
const _lensIndex = new Map(UPG_LENSES.map((l) => [l.id, l]))

/**
 * Get a lens by its id. Returns undefined if not found.
 *
 * @example
 * const lens = getLens('product')
 * // lens?.id === 'product'
 * // lens?.name === 'Product'
 * getLens('not_a_lens')   // → undefined
 */
export function getLens(id: string): UPGLens | undefined {
  return _lensIndex.get(id)
}

/**
 * Get all lenses that include a given domain in their visible_domains.
 * Lenses with an empty `visible_domains` list match every domain.
 *
 * @example
 * const lenses = getLensesForDomain('user')
 * // includes 'product', 'research', and 'full' (the latter via empty-visible-domains rule)
 */
export function getLensesForDomain(domainId: string): UPGLens[] {
  return UPG_LENSES.filter(
    (l) => l.visible_domains.length === 0 || l.visible_domains.includes(domainId),
  )
}

/**
 * Get all entity types visible through a given lens.
 *
 * Resolves the lens's visible_domains to concrete entity types from the
 * domain registry, then applies always_show_types and always_hide_types.
 *
 * If visible_domains is empty (show all), returns all types from all domains
 * minus always_hide_types.
 *
 * @example
 * const productLens = getLens('product')!
 * const types = getVisibleTypes(productLens)
 * // types.includes('persona')   → true
 * // types.includes('feature')   → true
 * // types.includes('api_endpoint') → false (filtered out for the product lens)
 */
export function getVisibleTypes(lens: UPGLens): string[] {
  // Resolve base types from visible domains
  let baseTypes: string[]

  if (lens.visible_domains.length === 0) {
    // Show all: collect every type from every domain
    baseTypes = UPG_DOMAINS.flatMap((d) => [...d.types])
  } else {
    // Filter to lens's visible domains
    baseTypes = UPG_DOMAINS
      .filter((d) => lens.visible_domains.includes(d.id))
      .flatMap((d) => [...d.types])
  }

  // Add always_show_types that aren't already in the set
  const typeSet = new Set(baseTypes)
  if (lens.always_show_types) {
    for (const t of lens.always_show_types) {
      typeSet.add(t)
    }
  }

  // Remove always_hide_types
  if (lens.always_hide_types) {
    for (const t of lens.always_hide_types) {
      typeSet.delete(t)
    }
  }

  return [...typeSet]
}

/**
 * Get the default lens (Full).
 *
 * @example
 * const lens = getDefaultLens()
 * // lens.id   === 'full'
 * // lens.name === 'Full'   // shows every type across every domain
 */
export function getDefaultLens(): UPGLens {
  return _lensIndex.get('full')!
}

/**
 * Get all lens IDs.
 *
 * @example
 * getLensIds()
 * // → ['product', 'ux_design', 'engineering', 'growth', 'business', 'research', 'marketing', 'full']
 */
export function getLensIds(): string[] {
  return UPG_LENSES.map((l) => l.id)
}

/**
 * Resolve a lens to its associated `UPGPlaybook`. Returns undefined if the
 * lens has no `playbook_id` (cross-region lenses like `product` and `full`),
 * or if the id does not resolve in the canonical playbook registry.
 *
 * Renamed from `getLensWorkflow` (workflows → playbooks + techniques).
 *
 * @example
 * const lens = getLens('design')!
 * const playbook = getLensPlaybook(lens)
 * // playbook?.id matches lens.playbook_id, the bootstrap path for the
 * // experience_design_brand region.
 */
export function getLensPlaybook(lens: UPGLens): UPGPlaybook | undefined {
  if (!lens.playbook_id) return undefined
  return getPlaybookById(lens.playbook_id)
}
