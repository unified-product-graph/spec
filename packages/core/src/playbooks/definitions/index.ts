/**
 * Canonical playbook definitions.
 *
 * 12 playbooks across 10 regions:
 * - 10 canonical (one per region; W1 invariant).
 * - 2 specialised (business-growth-metric-driven, business-marketing-audience-first).
 *
 *: no playbook is framework-anchored anymore; framework anchors now
 * live on the canonical playbooks' related_framework_ids.
 *
 * Every existing v0.2.x workflow maps here; cross-region lens workflows
 * (`product-journey`, `full-product-journey`) were dropped; their content
 * is already covered by the 10 canonical region playbooks.
 */

import type { UPGPlaybook } from '../types.js'
import type { Step } from '../../step-sequence.js'

/**
 * Helper to keep entity-sequence step records compact.
 */
function seqStep(
  order: number,
  phase: string,
  entity_types: readonly string[],
  prompt_hint: string,
  options?: { next_sequence_on_gap?: string },
): Step {
  return {
    kind: 'entity_sequence',
    order,
    phase,
    name: phase,
    prompt_hint,
    entity_types,
    ...(options?.next_sequence_on_gap
      ? { next_sequence_on_gap: options.next_sequence_on_gap }
      : {}),
  }
}

/**
 * Helper for one-step domain-guide playbooks (the v0.2 domain-workflow shape).
 */
function domainGuideStep(
  domain_id: string,
  phase: string,
  name: string,
  prompt_hint: string,
  options?: { next_sequence_on_gap?: string },
): Step {
  return {
    kind: 'domain_guide',
    order: 1,
    phase,
    name,
    prompt_hint,
    domain_id,
    ...(options?.next_sequence_on_gap
      ? { next_sequence_on_gap: options.next_sequence_on_gap }
      : {}),
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Region 1 - strategy_outcomes (anchor `objective`)
// ════════════════════════════════════════════════════════════════════════════

export const STRATEGY_OUTCOMES_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:strategy-outcomes',
  name: 'Strategy & Outcomes',
  version: '0.2.0',
  description:
    'Cascade vision through themes, outcomes, objectives, key results, and the bets you are making to get there.',
  region: 'strategy_outcomes',
  is_canonical: true,
  related_framework_ids: ['okr-framework', 'three-horizons', 'north-star-metric', 'metrics-tree', 'wardley-map'],
  // DT-PB-3: anchor is `outcome`, not `objective`. The creation_sequence
  // creates outcome (step 3) before objective (step 4), and outcome is the
  // strategy region's gravitational centre (objectives translate outcomes).
  target_anchor_entity: 'outcome',
  creation_sequence: [
    seqStep(1, 'Vision & Mission',
      ['vision', 'mission'],
      'Name what you are building toward and how you will get there. Vision is the destination; mission is the orientation. One of each, no more.'),
    seqStep(2, 'Themes',
      ['strategic_theme', 'strategic_pillar'],
      'Choose 2–4 strategic themes that focus the work. Past four, you have lost focus, not gained coverage.'),
    seqStep(3, 'Outcomes',
      ['outcome'],
      'Frame the changes in the world the product is trying to cause: shifts in behavior, perception, or position. Not features shipped.'),
    seqStep(4, 'Objectives',
      ['objective'],
      'Translate outcomes into directional bets the team commits to within a horizon. An objective is an ambition with a deadline attached.'),
    seqStep(5, 'Key Results',
      ['key_result', 'metric'],
      'Give each objective 2–4 measurable key results. Without measurement, the objective is a wish.'),
    seqStep(6, 'Initiatives & Capabilities',
      ['initiative', 'capability'],
      'Group features and work streams into initiatives the team will actually execute. Name the capabilities they build.'),
    seqStep(7, 'Assumptions & Decisions',
      ['assumption', 'decision'],
      'Capture the bets you are making (assumptions) and the choices you have ratified (decisions). These guard the work against silent drift.',
      { next_sequence_on_gap: 'playbook:discovery-research-validation' }),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 2 - users_needs (anchor `persona`)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Canonical users_needs playbook: net-new authored content per Q.C of the
 * decision doc. Persona has 25 inbound cross-edges; the spec's gravitational
 * centre. Skeleton-only is not acceptable here.
 */
export const USERS_NEEDS_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:users-needs',
  name: 'Users & Needs',
  version: '0.1.0',
  description:
    'Bootstrap personas, jobs, needs, and desired outcomes: the user side of every product graph.',
  region: 'users_needs',
  is_canonical: true,
  related_framework_ids: ['persona-canvas', 'empathy-map', 'value-proposition-canvas', 'kano-model'],
  target_anchor_entity: 'persona',
  creation_sequence: [
    seqStep(
      1,
      'Anchor',
      ['persona'],
      'Capture 1–3 user archetypes you are building for. Keep the set small: one persona per distinct mental model.',
    ),
    seqStep(
      2,
      'Jobs',
      ['job'],
      'Name the jobs each persona is trying to get done. What progress are they trying to make?',
    ),
    seqStep(
      3,
      'Job steps',
      ['job_step'],
      'Decompose each job into the observable steps a persona walks through (when this is useful).',
    ),
    seqStep(
      4,
      'Needs',
      ['need'],
      'Capture what each persona requires to make progress on each job: the explicit asks and gaps.',
    ),
    seqStep(
      5,
      'Desired outcomes',
      ['desired_outcome'],
      'Frame measurable success criteria each persona would accept: the “done” signal for the job.',
    ),
    seqStep(
      6,
      'Switching costs',
      ['switching_cost'],
      'List what stops each persona from moving from their current solution: the friction to overcome.',
    ),
    seqStep(
      7,
      'Participants',
      ['participant'],
      'Optional, post-research: research-resolved instances of personas (real people you spoke with).',
    ),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 3 - discovery_research_validation (anchor `opportunity`)
// ════════════════════════════════════════════════════════════════════════════

export const DISCOVERY_RESEARCH_VALIDATION_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:discovery-research-validation',
  name: 'Discovery, Research & Validation',
  version: '0.1.0',
  description:
    'Evidence-first discovery sequence: plan → recruit → observe → synthesize → insight → opportunity → hypothesis → test.',
  region: 'discovery_research_validation',
  is_canonical: true,
  related_framework_ids: ['double-diamond', 'opportunity-solution-tree', 'build-measure-learn', 'hypothesis-board'],
  target_anchor_entity: 'opportunity',
  creation_sequence: [
    seqStep(1, 'Plan',
      ['research_plan', 'research_question', 'interview_guide', 'research_study'],
      'Define what you need to learn: research questions, study design, interview guides.'),
    seqStep(2, 'Recruit',
      ['participant', 'persona', 'behavioral_segment'],
      'Find the right participants. Who can teach you what you need to know?'),
    seqStep(3, 'Observe',
      ['observation', 'quote', 'survey_response'],
      'Gather raw data: observations, quotes, survey responses, field notes.'),
    seqStep(4, 'Synthesize',
      ['affinity_cluster', 'feedback_theme'],
      'Make sense of the data: cluster, pattern-match, extract themes.'),
    seqStep(5, 'Insight',
      ['insight', 'evidence', 'learning'],
      'Crystallize learnings into actionable insights. What did you discover?'),
    seqStep(6, 'Opportunity',
      ['opportunity', 'need', 'desired_outcome'],
      'Connect insights to opportunities. What should the product do about this?'),
    seqStep(7, 'Hypothesis',
      ['hypothesis', 'assumption'],
      'Frame testable hypotheses from research. What assumptions need validation?'),
    seqStep(8, 'Test',
      // DT-PB-1: was `experiment` — which resolves to NO canonical edge with
      // hypothesis or test_plan, forcing an orphan. `experiment_run` is the
      // hypothesis-linked test unit (experiment_run_validates_hypothesis,
      // test_plan_ran_as_experiment_run, experiment_run_yields_evidence).
      ['experiment_run', 'test_plan', 'evidence'],
      'Validate with targeted experiment runs. Close the loop between research and action.'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 4 - market_competitive (anchor `competitor`)
// ════════════════════════════════════════════════════════════════════════════

export const MARKET_COMPETITIVE_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:market-competitive',
  name: 'Market & Competitive',
  version: '0.2.0',
  description:
    'Map the competitive landscape: define the market, name the alternatives, read trends, find moves.',
  region: 'market_competitive',
  is_canonical: true,
  related_framework_ids: ['porter-five-forces', 'swot-analysis', 'value-chain-analysis', 'wardley-map', 'bullseye-framework'],
  target_anchor_entity: 'competitor',
  creation_sequence: [
    seqStep(1, 'Market',
      ['market_segment', 'classification_axis', 'classification_value'],
      'Frame the market you compete in. What axes distinguish segments: size, vertical, sophistication, urgency?'),
    seqStep(2, 'Competitors',
      ['competitor'],
      'List the 3–7 closest alternatives, including DIY, status quo, and adjacent solutions. "No competition" is rarely true.'),
    seqStep(3, 'Their offerings',
      ['competitor_feature'],
      'For the top 3–5 competitors, catalog what they actually ship, not their marketing claims.'),
    seqStep(4, 'Trends',
      ['market_trend'],
      'Capture the shifts in technology, behavior, regulation, or economy that change the playing field underneath everyone.'),
    seqStep(5, 'Analysis',
      ['competitive_analysis'],
      'Synthesize into structured comparisons: feature parity matrices, win/loss patterns, positioning maps.'),
    seqStep(6, 'Moves',
      ['competitive_battle_card'],
      'Look where competitors are weak and trends are strong. That intersection is where your moves live: arm the team with battle cards that turn each competitor weakness into a position you can win. (Partnership moves belong in the business & GTM playbook, where `partnership` connects.)'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 5 - experience_design_brand (anchor `user_journey`)
// ════════════════════════════════════════════════════════════════════════════

export const EXPERIENCE_DESIGN_BRAND_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:experience-design-brand',
  name: 'Experience, Design & Brand',
  version: '0.1.0',
  description:
    'Journey-first design sequence: research → personas → journeys → define → ideate → prototype → test → design system.',
  region: 'experience_design_brand',
  is_canonical: true,
  related_framework_ids: ['double-diamond', 'atomic-design', 'story-map'],
  target_anchor_entity: 'user_journey',
  creation_sequence: [
    seqStep(1, 'Research',
      ['research_study', 'participant', 'observation', 'quote', 'survey_response'],
      'Understand the problem space: observe real users, gather evidence.'),
    seqStep(2, 'Personas',
      ['persona', 'job', 'need', 'desired_outcome'],
      'Synthesize research into archetypes. Who are you designing for?'),
    seqStep(3, 'Journeys',
      ['user_journey', 'journey_step', 'user_flow', 'touchpoint'],
      'Map how users move through the experience. Where is the friction?'),
    seqStep(4, 'Define',
      ['design_question', 'insight', 'affinity_cluster', 'opportunity'],
      'Frame the design challenge: How Might We questions, insights, opportunities.'),
    seqStep(5, 'Ideate',
      ['design_concept', 'solution', 'screen', 'screen_state'],
      'Generate solutions: concepts, screens, interaction ideas.'),
    seqStep(6, 'Prototype',
      ['wireframe', 'prototype', 'interaction_spec', 'design_component'],
      'Build testable artifacts: wireframes, prototypes, interaction specs.'),
    seqStep(7, 'Test',
      ['experiment', 'learning', 'evidence', 'feedback_theme'],
      'Put prototypes in front of users: observe, learn, iterate.'),
    seqStep(8, 'Design System',
      ['design_system', 'design_component', 'design_token', 'design_pattern', 'design_guideline'],
      'Codify patterns: components, tokens, guidelines that scale.'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 6 - product_delivery (anchor `feature`)
// ════════════════════════════════════════════════════════════════════════════

export const PRODUCT_DELIVERY_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:product-delivery',
  name: 'Product Delivery',
  version: '0.2.0',
  description:
    'Shape what gets built: features, epics, user stories, releases, milestones, and the dependencies between them.',
  region: 'product_delivery',
  is_canonical: true,
  related_framework_ids: ['story-map', 'rice-scoring', 'moscow', 'now-next-later', 'shape-up', 'kano-model'],
  target_anchor_entity: 'feature',
  creation_sequence: [
    seqStep(1, 'Features',
      ['feature'],
      'Name the units of value the product delivers. Each feature should be a thing a user can describe in plain language.'),
    seqStep(2, 'Epics',
      ['epic'],
      'Group related features into epics that ship together. Epics are user-visible; tasks are not.'),
    seqStep(3, 'Stories',
      ['user_story', 'acceptance_criterion'],
      'Write each feature from the user perspective. "As [persona], I want [job], so that [outcome]." Define acceptance criteria.'),
    seqStep(4, 'Tasks & Dependencies',
      ['task', 'dependency'],
      'Decompose stories into the smallest unit of work an engineer can pick up. Surface the dependencies between them.'),
    seqStep(5, 'Releases & Milestones',
      ['release', 'milestone'],
      'Bundle stories into releases. Milestones mark moments of strategic significance: first paying customer, first 1000 users.'),
    seqStep(6, 'Roadmap Themes & Changelog',
      ['roadmap_theme', 'changelog'],
      'Group roadmap work into roadmap themes around the customer problem. Maintain a changelog the team and customers can read together.'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 7 - engineering_platform (anchor `service`)
// ════════════════════════════════════════════════════════════════════════════

export const ENGINEERING_PLATFORM_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:engineering-platform',
  name: 'Engineering & Platform',
  version: '0.1.0',
  description:
    'Architecture-first engineering sequence: architecture → services → data → build → test → deploy → monitor → security.',
  region: 'engineering_platform',
  is_canonical: true,
  related_framework_ids: ['c4-model', 'adr-log', 'dora-metrics'],
  target_anchor_entity: 'service',
  creation_sequence: [
    seqStep(1, 'Architecture',
      ['bounded_context', 'decision', 'service', 'aggregate'],
      'Define the system shape: bounded contexts, services, key decisions.'),
    seqStep(2, 'Services & APIs',
      ['service', 'api_endpoint', 'api_contract', 'external_api', 'integration_pattern'],
      'Map the service layer: endpoints, contracts, integrations.'),
    seqStep(3, 'Data',
      ['database_schema', 'domain_event', 'event_schema', 'data_model', 'data_pipeline', 'queue_topic'],
      'Design the data layer: schemas, events, pipelines.'),
    seqStep(4, 'Build',
      ['feature', 'epic', 'user_story', 'task', 'technical_debt_item'],
      'Scope the work: features, epics, stories, tasks.'),
    seqStep(5, 'Test',
      ['test_suite', 'test_case', 'qa_session', 'regression_test', 'test_coverage_report'],
      'Verify the system: test suites, coverage, QA sessions.'),
    seqStep(6, 'Deploy',
      ['deployment', 'ci_pipeline', 'feature_flag', 'release', 'release_strategy'],
      'Ship reliably: pipelines, feature flags, release strategy.'),
    seqStep(7, 'Monitor',
      ['service_level_indicator', 'service_level_objective', 'monitor', 'alert_rule', 'incident', 'runbook', 'on_call_rotation'],
      'Keep it running: SLIs, monitors, alerts, incident response.'),
    seqStep(8, 'Security',
      ['threat_model', 'threat', 'vulnerability', 'security_control', 'security_policy', 'access_policy'],
      'Keep it safe: threat models, controls, access policies.'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 8 - business_gtm_growth (anchor `value_proposition`)
// ════════════════════════════════════════════════════════════════════════════

export const BUSINESS_GTM_GROWTH_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:business-gtm-growth',
  name: 'Business, GTM & Growth',
  version: '0.1.0',
  description:
    'Viability-first business sequence: value prop → customer → revenue → costs → unit economics → GTM → competitive advantage.',
  region: 'business_gtm_growth',
  is_canonical: true,
  related_framework_ids: ['business-model-canvas', 'pirate-metrics-aarrr', 'north-star-metric', 'product-led-growth-framework', 'marketing-mix-4ps'],
  target_anchor_entity: 'value_proposition',
  creation_sequence: [
    seqStep(1, 'Value Proposition',
      ['value_proposition', 'product', 'need', 'desired_outcome'],
      'Define the value you create. Why should someone pay for this?'),
    seqStep(2, 'Customer',
      ['persona', 'market_segment', 'ideal_customer_profile'],
      'Know your customer: segments, ICPs, what they are willing to pay for.'),
    seqStep(3, 'Revenue',
      ['revenue_stream', 'pricing_tier', 'pricing_strategy', 'discount_strategy', 'trial_config', 'paywall'],
      'Design the revenue engine: streams, pricing tiers, discounts.'),
    seqStep(4, 'Cost Structure',
      ['cost_structure', 'unit_economics', 'key_resource', 'key_activity'],
      'Map the costs. What does it take to build, deliver, and support this?'),
    seqStep(5, 'Unit Economics',
      ['unit_economics', 'metric'],
      'Prove the math works: LTV, CAC, margins, breakeven.'),
    seqStep(6, 'Go-To-Market',
      ['gtm_strategy', 'positioning', 'messaging', 'distribution_channel', 'launch'],
      'Plan the path to customers: positioning, channels, launch strategy.'),
    seqStep(7, 'Competitive Advantage',
      ['competitor', 'competitive_analysis', 'market_trend', 'partnership'],
      'Understand the landscape: competitors, differentiation, moats.'),
  ],
}

export const BUSINESS_GROWTH_METRIC_DRIVEN_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:business-growth-metric-driven',
  name: 'Metric-Driven Growth',
  version: '0.1.0',
  description:
    'Metric-driven growth sequence: north star → funnel → channels → segments → experiments → measure → iterate.',
  region: 'business_gtm_growth',
  creation_sequence: [
    seqStep(1, 'North Star',
      ['metric', 'outcome', 'objective'],
      'Define the one metric that matters most: the number that captures the value you create.'),
    seqStep(2, 'Funnel',
      ['funnel', 'funnel_step', 'user_flow'],
      'Map how users flow from awareness to value. Where are the drops?'),
    seqStep(3, 'Channels',
      ['acquisition_channel', 'growth_campaign', 'attribution_model'],
      'Identify where users come from. Which channels are scalable and cost-effective?'),
    seqStep(4, 'Segments',
      ['cohort', 'behavioral_segment', 'persona', 'ideal_customer_profile'],
      'Break users into cohorts. Who retains, who converts, who churns?'),
    seqStep(5, 'Experiments',
      ['experiment', 'variant', 'hypothesis', 'growth_loop'],
      'Run experiments to move the numbers: A/B tests, pricing tests, growth loops.'),
    seqStep(6, 'Measure',
      ['metric', 'dashboard', 'event_schema', 'data_source'],
      'Track results: dashboards, event schemas, metric definitions.'),
    seqStep(7, 'Iterate',
      ['learning', 'evidence', 'insight'],
      'Learn and loop: what worked, what didn’t, what to try next.'),
  ],
}

export const BUSINESS_MARKETING_AUDIENCE_FIRST_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:business-marketing-audience-first',
  name: 'Audience-First Marketing',
  version: '0.1.0',
  description:
    'Audience-first marketing sequence: positioning → messaging → audience → channels → content → launch → measure.',
  region: 'business_gtm_growth',
  creation_sequence: [
    seqStep(1, 'Positioning',
      ['positioning', 'competitive_analysis', 'competitor', 'market_segment'],
      "Define where you sit in the customer's mind. Who is this for, and why is it different?"),
    seqStep(2, 'Messaging',
      ['messaging', 'value_proposition', 'proof_point', 'objection', 'rebuttal'],
      'Craft the words that resonate: value props, taglines, proof points.'),
    seqStep(3, 'Audience',
      ['persona', 'ideal_customer_profile', 'market_segment', 'behavioral_segment'],
      'Know who you are speaking to: personas, ICPs, segments.'),
    seqStep(4, 'Channels',
      ['acquisition_channel', 'distribution_channel', 'marketing_channel'],
      'Choose where to show up. Which channels reach your audience cost-effectively?'),
    seqStep(5, 'Content',
      ['content_strategy', 'content_piece', 'content_calendar', 'content_theme', 'brand_asset'],
      'Create what resonates: content strategy, calendar, individual pieces.'),
    seqStep(6, 'Launch',
      ['launch', 'growth_campaign', 'demand_gen_program', 'press_release', 'event'],
      'Orchestrate the go-to-market: launch plans, campaigns, press.'),
    seqStep(7, 'Measure',
      ['metric', 'dashboard', 'attribution_model', 'funnel', 'nps_campaign'],
      'Track what works: attribution, conversion, engagement metrics.'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 9 - analytics_data (anchor `metric`)
// ════════════════════════════════════════════════════════════════════════════

export const ANALYTICS_DATA_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:analytics-data',
  name: 'Analytics & Data',
  version: '0.2.0',
  description:
    'Bootstrap the measurement plane: sources, schemas, pipelines, metrics, dashboards, and the rules that keep them honest.',
  region: 'analytics_data',
  is_canonical: true,
  related_framework_ids: ['metrics-tree', 'north-star-metric', 'pirate-metrics-aarrr', 'dora-metrics'],
  target_anchor_entity: 'metric',
  creation_sequence: [
    seqStep(1, 'Data Sources',
      ['data_source'],
      'List where the truth lives: the systems that emit events you can measure. Product, billing, support, CRM, external.'),
    seqStep(2, 'Event Schemas',
      ['event_schema'],
      'Define the events you will instrument. Schema first; instrumentation second. Each event needs a name, properties, and emit conditions.'),
    seqStep(3, 'Pipelines & Models',
      ['data_pipeline', 'data_model'],
      'Move data from source to warehouse. Define transformations and the resulting models the rest of the org consumes.'),
    seqStep(4, 'Metrics',
      ['metric'],
      'Define the numbers the team will look at. Group into North Star, input metrics, guardrail metrics, and diagnostic metrics.'),
    seqStep(5, 'Dashboards',
      ['dashboard'],
      'Compose metrics into dashboards by audience: leadership weekly, team daily, on-call always-on.'),
    seqStep(6, 'Data Quality',
      ['data_quality_rule'],
      'Set the rules that guard against silent drift: freshness, completeness, accuracy, schema integrity.'),
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Region 10 - operations_quality (anchor `incident`)
// ════════════════════════════════════════════════════════════════════════════

export const OPERATIONS_QUALITY_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:operations-quality',
  name: 'Operations & Quality',
  version: '0.2.0',
  description:
    'The operational backbone: pipelines, monitoring, incident response, security, quality gates, compliance, support. Specialised playbooks cover team rituals.',
  region: 'operations_quality',
  is_canonical: true,
  related_framework_ids: ['raci-matrix', 'retrospective', 'team-health-check', 'raid-log'],
  target_anchor_entity: 'incident',
  creation_sequence: [
    seqStep(1, 'DevOps Backbone',
      ['deployment', 'ci_pipeline', 'runbook'],
      'Establish the pipeline. How does code go from commit to production reliably and reversibly?'),
    seqStep(2, 'Monitoring & SLOs',
      ['service_level_indicator', 'service_level_objective', 'monitor', 'alert_rule'],
      'Decide what you measure for availability, latency, and quality. Set targets. Wire alerts to people, not silence.'),
    seqStep(3, 'Incident Response',
      ['incident', 'postmortem', 'root_cause'],
      'Define how you respond when things break. Every incident gets a postmortem; every postmortem identifies root causes; root causes drive change.'),
    seqStep(4, 'Security',
      ['threat_model', 'threat', 'vulnerability', 'security_control', 'access_policy'],
      'Model what could go wrong. Catalog known threats. Wire controls and access policies that actually constrain risk.'),
    seqStep(5, 'Quality Gates',
      ['test_suite', 'test_case', 'regression_test', 'qa_session', 'feature', 'bug'],
      'Establish what does not ship until tests pass. Define the test pyramid: unit, integration, end-to-end. Quality is a delivery concern: gates guard the features they cover and the bugs they catch, which is also where incidents trace back (a shipped defect becomes a production incident).'),
    seqStep(6, 'Compliance & Accessibility',
      ['compliance_framework', 'a11y_audit', 'security_policy'],
      'Map the frameworks you must comply with: SOC 2, GDPR, HIPAA, WCAG. Surface controls and audit cadence.'),
    seqStep(7, 'Customer Support',
      ['support_ticket', 'knowledge_base_article'],
      'Define how customers reach you when things break, and how you build collective memory from each interaction.'),
  ],
}

// ─── Aggregate ──────────────────────────────────────────────────────────────

/**
 * Every canonical playbook shipped with `@unified-product-graph/core`.
 *
 * Spans the ten canonical regions: one canonical playbook per region (the
 * W1 invariant) plus zero or more specialised playbooks per region, three
 * of which are framework-anchored (BMC, AARRR, build-measure-learn).
 *
 * Order: by region (1 → 10), canonical first within each region.
 */
export const UPG_PLAYBOOKS: readonly UPGPlaybook[] = [
  // Region 1 - strategy_outcomes
  STRATEGY_OUTCOMES_PLAYBOOK,
  // Region 2 - users_needs
  USERS_NEEDS_PLAYBOOK,
  // Region 3 - discovery_research_validation
  DISCOVERY_RESEARCH_VALIDATION_PLAYBOOK,
  // Region 4 - market_competitive
  MARKET_COMPETITIVE_PLAYBOOK,
  // Region 5 - experience_design_brand
  EXPERIENCE_DESIGN_BRAND_PLAYBOOK,
  // Region 6 - product_delivery
  PRODUCT_DELIVERY_PLAYBOOK,
  // Region 7 - engineering_platform
  ENGINEERING_PLATFORM_PLAYBOOK,
  // Region 8 - business_gtm_growth
  BUSINESS_GTM_GROWTH_PLAYBOOK,
  BUSINESS_GROWTH_METRIC_DRIVEN_PLAYBOOK,
  BUSINESS_MARKETING_AUDIENCE_FIRST_PLAYBOOK,
  // Region 9 - analytics_data
  ANALYTICS_DATA_PLAYBOOK,
  // Region 10 - operations_quality
  OPERATIONS_QUALITY_PLAYBOOK,
]
