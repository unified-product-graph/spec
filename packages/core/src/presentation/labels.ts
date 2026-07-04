/**
 * UPG Labels: framework-vocabulary Rosetta Stone. Each entity type maps to a
 * canonical label, alt labels, and framework-specific labels. Answers "what
 * does framework X call this concept?"
 *
 * Registry-driven: derived from `UPG_ACTIVE_TYPES` and `UPG_MIGRATIONS`.
 */

import { UPG_ACTIVE_TYPES } from '../registry/entity-meta.js'
import { UPG_MIGRATIONS } from '../grammar/migrations.js'
import { UPG_FRAMEWORKS } from '../frameworks/canonical.js'
import { ENTITY_EMOJI, DEFAULT_ENTITY_EMOJI } from './entity-emoji.js'

/** Seed shape for hand-authored label entries: every field of UPGTypeLabel except
 * `emoji`, which the assembly step below attaches from `ENTITY_EMOJI`. */
type UPGTypeLabelSeed = Omit<UPGTypeLabel, 'emoji'>

// ─── Interface ──────────────────────────────────────────────────────────────────

export interface UPGTypeLabel {
  /** Matches the NodeType string (canonical, post-consolidation) */
  id: string
  /** Default display name */
  canonical_label: string
  /**
   * One distinct, relevant emoji glyph for the type (the canonical, Captain-reviewed
   * set in `entity-emoji.ts`). Always resolves: a type without an explicit glyph
   * falls back to `DEFAULT_ENTITY_EMOJI`. This is THE live emoji source, surfaced
   * by `get_type_label` + `list_type_labels`, so renderers stop hardcoding.
   */
  emoji: string
  /** All known synonyms across frameworks + common usage (lowercase for matching) */
  alt_labels: string[]
  /** Framework-specific labels: { framework_id: "what that framework calls it" } */
  framework_labels: Record<string, string>
  /** Only for types that use the designation pattern */
  designations?: Record<string, string>
}

// ─── Priority entries (high framework coverage) ─────────────────────────────────

/**
 * Hand-authored label entries for types that appear across multiple frameworks.
 * These are the "Rosetta Stone" entries, the ones users will encounter across views.
 */
const PRIORITY_LABELS: UPGTypeLabelSeed[] = [

  // ── need (CONSOLIDATED: replaces pain_point + user_need) ─────────────────────

  {
    id: 'need',
    canonical_label: 'Need',
    alt_labels: [
      'pain point', 'pain', 'user need', 'customer need',
      'problem', 'struggle', 'customer pain', 'frustration',
      'gap', 'unmet need', 'user problem',
    ],
    framework_labels: {
      lean_canvas: 'Problem',
      design_thinking: 'Pain Point',
      ost: 'Opportunity (need)',
      jtbd: 'Struggle',
      vpc: 'Customer Pain',
    },
    designations: {
      pain: 'Pain Point',
      gap: 'Need',
      desire: 'Desire',
      constraint: 'Constraint',
    },
  },

  // ── opportunity ──────────────────────────────────────────────────────────────

  {
    id: 'opportunity',
    canonical_label: 'Opportunity',
    alt_labels: ['product opportunity', 'market opportunity', 'user opportunity'],
    framework_labels: {
      ost: 'Opportunity',
    },
  },

  // ── solution ─────────────────────────────────────────────────────────────────

  {
    id: 'solution',
    canonical_label: 'Solution',
    // 'concept' stripped (P-B /): bare "concept" was shared with the
    // distinct `design_concept` type. `design_concept` keeps it; here a search
    // for a solution uses "approach" / "proposed solution".
    alt_labels: ['proposed solution', 'solution idea', 'approach'],
    framework_labels: {
      ost: 'Solution',
      design_thinking: 'Solution',
      lean_canvas: 'Solution',
      rice: 'Scored Solution',
    },
  },

  // ── experiment (CONSOLIDATED: absorbs ab_test, growth_experiment, pricing_experiment) ──

  {
    id: 'experiment',
    canonical_label: 'Experiment',
    // V6: dropped 'test' (too generic; collides) and 'validation'
    // (the domain name). The deprecated growth/pricing/ab experiment types
    // redirect to `experiment` (V2), so their labels stay here.
    alt_labels: [
      'ab test', 'a/b test', 'split test',
      'growth experiment', 'pricing experiment', 'usability test',
      'discovery experiment',
    ],
    framework_labels: {
      ost: 'Experiment',
      design_thinking: 'Test',
      lean_startup: 'Experiment',
    },
    designations: {
      discovery: 'Discovery Experiment',
      ab_test: 'A/B Test',
      growth: 'Growth Experiment',
      pricing: 'Pricing Experiment',
      usability: 'Usability Test',
    },
  },

  // ── hypothesis ───────────────────────────────────────────────────────────────

  {
    id: 'hypothesis',
    canonical_label: 'Hypothesis',
    alt_labels: ['bet', 'testable assumption', 'leap of faith'],
    framework_labels: {
      lean_startup: 'Hypothesis',
      running_lean: 'Riskiest Assumption',
      lean_canvas: 'Riskiest Assumption',
    },
  },

  // ── metric (CONSOLIDATED: absorbs kpi, north_star_metric, input_metric, metric_definition) ──

  {
    id: 'metric',
    canonical_label: 'Metric',
    alt_labels: [
      'kpi', 'key performance indicator', 'north star metric', 'nsm',
      'input metric', 'output metric', 'metric definition',
      'measure', 'indicator', 'signal', 'counter metric', 'guardrail metric',
    ],
    framework_labels: {
      aarrr: 'Pirate Metric',
      dora: 'DORA Metric',
      lean_canvas: 'Key Metric',
      okr_tree: 'Key Result Metric',
    },
    designations: {
      north_star: 'North Star',
      kpi: 'KPI',
      driver: 'Driver',
      input: 'Input',
      guardrail: 'Guardrail',
      proxy: 'Proxy',
      health: 'Health',
      vanity: 'Vanity',
      metric: 'Metric',
    },
  },

  // ── user_journey ─────────────────────────────────────────────────────────────

  {
    id: 'user_journey',
    canonical_label: 'User Journey',
    alt_labels: ['journey map', 'customer journey', 'experience map', 'journey'],
    framework_labels: {
      design_thinking: 'Journey Map',
      lean_canvas: 'Customer Journey',
    },
    designations: {
      current_state: 'Current State',
      future_state: 'Future State',
      day_in_the_life: 'Day in the Life',
      service_blueprint: 'Service Blueprint',
    },
  },

  // ── persona ──────────────────────────────────────────────────────────────────

  {
    id: 'persona',
    canonical_label: 'Persona',
    alt_labels: ['user persona', 'buyer persona', 'customer persona', 'user type', 'archetype', 'actor'],
    framework_labels: {
      design_thinking: 'Persona',
      lean_canvas: 'Customer Segment',
      bmc: 'Customer Archetype',
    },
  },

  // ── desired_outcome ──────────────────────────────────────────────────────────

  {
    id: 'desired_outcome',
    canonical_label: 'Desired Outcome',
    alt_labels: ['gain', 'user gain', 'customer gain', 'expected outcome'],
    framework_labels: {
      ost: 'Desired Outcome',
      jtbd: 'Desired Outcome',
      vpc: 'Customer Gain',
    },
  },

  // ── insight (CONSOLIDATED: absorbs research_insight, finding, ux_insight) ────

  {
    id: 'insight',
    canonical_label: 'Insight',
    alt_labels: [
      'research insight', 'finding', 'ux insight', 'user insight',
      'discovery', 'key finding', 'research finding', 'design insight',
      'analytics insight', 'feedback insight',
    ],
    framework_labels: {
      design_thinking: 'Finding',
      ost: 'Insight',
    },
    designations: {
      atomic: 'Atomic Insight',
      composite: 'Composite Insight',
      strategic: 'Strategic Insight',
    },
  },

  // ── job ──────────────────────────────────────────────────────────────────────

  {
    id: 'job',
    canonical_label: 'Job',
    alt_labels: ['job to be done', 'jtbd', 'job', 'customer job', 'user job', 'functional job', 'social job', 'emotional job'],
    framework_labels: {
      ost: 'Opportunity (job)',
      design_thinking: 'Task',
      jtbd: 'Job',
      vpc: 'Customer Job',
    },
  },

  // ── outcome ──────────────────────────────────────────────────────────────────

  {
    id: 'outcome',
    canonical_label: 'Outcome',
    // 'desired outcome' stripped (P-B /): it was the canonical label of
    // the distinct `desired_outcome` (Ulwick JTBD) type. The OST framework_label
    // below still surfaces "Desired Outcome" in OST context, framework-scoped.
    alt_labels: ['product outcome', 'business outcome', 'target outcome'],
    framework_labels: {
      ost: 'Desired Outcome',
      okr_tree: 'Outcome',
    },
  },

  // ── objective ────────────────────────────────────────────────────────────────

  {
    id: 'objective',
    canonical_label: 'Objective',
    alt_labels: ['goal', 'strategic goal', 'team goal'],
    framework_labels: {
      okr_tree: 'Objective',
    },
  },

  // ── key_result ───────────────────────────────────────────────────────────────

  {
    id: 'key_result',
    canonical_label: 'Key Result',
    alt_labels: ['kr', 'measurable result', 'target'],
    framework_labels: {
      okr_tree: 'Key Result',
    },
  },

  // ── feature ──────────────────────────────────────────────────────────────────

  {
    id: 'feature',
    canonical_label: 'Feature',
    // 'capability' stripped (P-B /): it is the canonical label of the
    // distinct `capability` type (Wardley / DDD). A search for "capability" must
    // resolve there, not to a feature.
    alt_labels: ['product feature', 'functionality'],
    framework_labels: {
      rice: 'Scored Item',
      moscow: 'Prioritised Item',
      kano: 'Classified Feature',
    },
  },

  // ── user_story ───────────────────────────────────────────────────────────────

  {
    id: 'user_story',
    canonical_label: 'User Story',
    alt_labels: ['story', 'requirement', 'as a... i want... so that...'],
    framework_labels: {
      moscow: 'Prioritised Story',
    },
  },

  // ── Business Model Canvas types ──────────────────────────────────────────────

  {
    id: 'value_proposition',
    canonical_label: 'Value Proposition',
    alt_labels: ['value prop', 'vp', 'unique value proposition', 'uvp', 'unfair advantage'],
    framework_labels: {
      bmc: 'Value Proposition',
      lean_canvas: 'Unique Value Proposition',
      vpc: 'Value Map',
    },
  },
  {
    id: 'partnership',
    canonical_label: 'Partnership',
    alt_labels: ['key partner', 'partner', 'key partners', 'strategic partner'],
    framework_labels: {
      bmc: 'Key Partner',
    },
  },
  {
    id: 'key_resource',
    canonical_label: 'Key Resource',
    alt_labels: ['resource', 'key asset', 'critical resource'],
    framework_labels: {
      bmc: 'Key Resource',
    },
  },
  {
    id: 'key_activity',
    canonical_label: 'Key Activity',
    alt_labels: ['activity', 'core activity', 'critical activity'],
    framework_labels: {
      bmc: 'Key Activity',
    },
  },
  {
    id: 'target_customer_segment',
    canonical_label: 'Target Customer Segment',
    alt_labels: ['customer segment', 'segment', 'target segment', 'audience'],
    framework_labels: {
      bmc: 'Customer Segment',
      lean_canvas: 'Customer Segment',
    },
  },
  {
    id: 'customer_relationship',
    canonical_label: 'Customer Relationship',
    alt_labels: ['relationship', 'engagement model', 'customer engagement'],
    framework_labels: {
      bmc: 'Customer Relationship',
    },
  },
  {
    id: 'distribution_channel',
    canonical_label: 'Distribution Channel',
    // bare 'channel' stripped (P-B /): shared 3-way with
    // `acquisition_channel` and `marketing_channel`. BMC/Lean-Canvas framework
    // contexts still surface "Channel" via framework_labels below.
    alt_labels: ['distribution channel', 'sales channel', 'delivery channel', 'distribution'],
    framework_labels: {
      bmc: 'Channel',
      lean_canvas: 'Channel',
    },
  },
  {
    id: 'revenue_stream',
    canonical_label: 'Revenue Stream',
    alt_labels: ['revenue', 'income stream', 'monetization'],
    framework_labels: {
      bmc: 'Revenue Stream',
      lean_canvas: 'Revenue Stream',
    },
  },
  {
    id: 'cost_structure',
    canonical_label: 'Cost Structure',
    alt_labels: ['costs', 'expense', 'cost base', 'operating cost'],
    framework_labels: {
      bmc: 'Cost Structure',
      lean_canvas: 'Cost Structure',
    },
  },

  // ── Design Thinking types ────────────────────────────────────────────────────

  {
    id: 'observation',
    canonical_label: 'Observation',
    alt_labels: ['field note', 'user observation', 'behavioural note', 'ethnographic note'],
    framework_labels: {
      design_thinking: 'Observation',
    },
  },
  {
    id: 'design_question',
    canonical_label: 'Design Question',
    alt_labels: ['hmw', 'how might we', 'design challenge', 'problem reframe', 'opportunity question'],
    framework_labels: {
      design_thinking: 'How Might We',
    },
  },
  {
    id: 'design_concept',
    canonical_label: 'Design Concept',
    alt_labels: ['concept', 'design idea', 'concept sketch'],
    framework_labels: {
      design_thinking: 'Concept',
    },
  },
  {
    id: 'prototype',
    canonical_label: 'Prototype',
    alt_labels: ['mockup', 'mock', 'poc', 'proof of concept', 'lo-fi', 'hi-fi'],
    framework_labels: {
      design_thinking: 'Prototype',
    },
  },

  // ── AARRR types ──────────────────────────────────────────────────────────────

  {
    id: 'funnel',
    canonical_label: 'Funnel',
    alt_labels: ['conversion funnel', 'user funnel', 'marketing funnel', 'sales funnel'],
    framework_labels: {
      aarrr: 'AARRR Funnel',
    },
  },
  {
    id: 'funnel_step',
    canonical_label: 'Funnel Step',
    alt_labels: ['funnel stage', 'conversion stage', 'lifecycle stage'],
    framework_labels: {
      aarrr: 'Pirate Metric Stage',
    },
  },

  // ── DORA types ───────────────────────────────────────────────────────────────

  {
    id: 'deployment',
    canonical_label: 'Deployment',
    alt_labels: ['deploy', 'release deployment', 'ship event'],
    framework_labels: {
      dora: 'Deployment',
    },
  },
  {
    id: 'ci_pipeline',
    canonical_label: 'CI Pipeline',
    alt_labels: ['pipeline', 'ci/cd', 'build pipeline', 'github actions workflow'],
    framework_labels: {
      dora: 'Deployment Pipeline',
    },
  },
  {
    id: 'service_level_indicator',
    canonical_label: 'Service Level Indicator',
    alt_labels: ['sli', 'reliability indicator'],
    framework_labels: {
      dora: 'SLI',
    },
  },
  {
    id: 'service_level_objective',
    canonical_label: 'Service Level Objective',
    alt_labels: ['slo', 'reliability target'],
    framework_labels: {
      dora: 'SLO',
    },
  },

  // ── Consolidated types (non-priority but have designations) ──────────────────

  {
    id: 'decision',
    canonical_label: 'Decision',
    alt_labels: ['product decision', 'strategic decision', 'team decision', 'adr', 'architecture decision record', 'tech decision', 'design decision'],
    framework_labels: {},
    designations: {
      product: 'Product Decision',
      architecture: 'Architecture Decision',
      strategic: 'Strategic Decision',
      operational: 'Operational Decision',
    },
  },
  {
    id: 'risk',
    canonical_label: 'Risk',
    alt_labels: ['risk item', 'project risk', 'programme risk'],
    framework_labels: {},
    designations: {
      technical: 'Technical Risk',
      business: 'Business Risk',
      legal: 'Legal Risk',
      security: 'Security Risk',
      program: 'Program Risk',
    },
  },
  {
    id: 'incident',
    canonical_label: 'Incident',
    alt_labels: ['outage', 'service incident', 'security incident', 'production incident'],
    framework_labels: {
      dora: 'Incident',
    },
    designations: {
      operational: 'Operational Incident',
      security: 'Security Incident',
      performance: 'Performance Incident',
    },
  },
  {
    id: 'user_flow',
    canonical_label: 'User Flow',
    alt_labels: ['flow', 'task flow', 'user path', 'navigation path', 'onboarding flow'],
    framework_labels: {},
    designations: {
      onboarding: 'Onboarding Flow',
      activation: 'Activation Flow',
      checkout: 'Checkout Flow',
      general: 'User Flow',
    },
  },
  {
    id: 'support_ticket',
    canonical_label: 'Support Ticket',
    alt_labels: [
      'ticket', 'support case', 'customer issue', 'help request',
      'defect report', 'bug report',
    ],
    framework_labels: {},
    designations: {
      question: 'Support Question',
      bug: 'Bug Report',
      feature_request: 'Feature Request',
      defect: 'Defect Report',
    },
  },
]

// ─── Standard labels (canonical_label + alt_labels, no framework labels) ────────

/**
 * Standard label entries for types that don't appear in major frameworks.
 * Most engineering, ops, security, and administrative types live here.
 * canonical_label is Title Case of the id; alt_labels are common synonyms.
 */
const STANDARD_LABELS: Record<string, Pick<UPGTypeLabel, 'alt_labels'>> = {
  // Strategic layer
  // 'service' stripped (P-B /): canonical label of the distinct `service` type.
  product: { alt_labels: ['offering', 'app', 'platform'] },
  vision: { alt_labels: ['product vision', 'north star vision', 'long-term vision'] },
  mission: { alt_labels: ['mission statement', 'purpose'] },
  strategic_theme: { alt_labels: ['focus area', 'strategic focus area'] }, // N6: not 'theme'/'strategic pillar' (own types)
  initiative: { alt_labels: ['strategic initiative', 'program initiative', 'workstream'] },
  capability: { alt_labels: ['business capability', 'organizational capability'] },
  value_stream: { alt_labels: ['value chain', 'stream'] },
  strategic_pillar: { alt_labels: ['pillar', 'foundation'] },
  assumption: { alt_labels: ['belief', 'working assumption', 'premise'] },
  strategic_question: { alt_labels: ['open question', 'coordination question', 'ownership question'] },

  // User layer
  job_step: { alt_labels: ['job stage', 'job phase', 'job map step'] },
  switching_cost: { alt_labels: ['lock-in', 'migration cost', 'switching barrier'] },

  // Discovery layer
  feasibility_study: { alt_labels: ['feasibility assessment', 'viability study', 'tech spike'] },
  design_sprint: { alt_labels: ['sprint', 'gv sprint', 'google ventures sprint'] },

  // Validation layer
  learning: { alt_labels: ['validated learning', 'lesson learned', 'takeaway'] },
  // test_plan re-homed validation → QA; its label entry now lives in
  // the Quality Assurance & Testing layer below.
  research_plan: { alt_labels: ['study plan', 'research brief'] },
  evidence: { alt_labels: ['proof', 'supporting data', 'signal'] },
  variant: { alt_labels: ['test variant', 'experiment arm', 'variation'] },

  // Market layer
  competitor: { alt_labels: ['rival', 'alternative', 'competitive product', 'competing product'] },
  competitor_feature: { alt_labels: ['competitive feature', 'rival capability'] },
  market_trend: { alt_labels: ['trend', 'industry trend', 'macro trend'] },
  // bare 'segment' stripped (P-B /): shared 2-way with `behavioral_segment`.
  // 'market segment' is the qualified, unambiguous form.
  market_segment: { alt_labels: ['market segment', 'market slice', 'tam segment', 'sam segment'] },
  competitive_analysis: { alt_labels: ['competitor analysis', 'competitive landscape', 'market analysis'] },

  // UX Research layer
  research_study: { alt_labels: ['study', 'user study', 'research project', 'ux study'] },
  participant: { alt_labels: ['research participant', 'interviewee', 'respondent', 'test subject'] },
  quote: { alt_labels: ['user quote', 'verbatim', 'voice of customer'] },
  affinity_cluster: { alt_labels: ['cluster', 'affinity group', 'theme cluster', 'affinity note'] },
  research_question: { alt_labels: ['rq', 'study question', 'inquiry'] },
  interview_guide: { alt_labels: ['discussion guide', 'interview script', 'moderator guide'] },
  survey_response: { alt_labels: ['survey answer', 'questionnaire response'] },

  // Design layer
  // alt_labels must not collide with other entity types' canonical
  // names or alt_labels, or the string->type resolver is ambiguous.
  // Dropped 'customer journey' (collides with customer_journey_stage),
  // 'touchpoint' and 'journey phase' (both distinct entity surfaces: a
  // touchpoint is the journey_step.touchpoint property, a phase is journey_phase).
  user_journey: { alt_labels: ['journey map', 'experience map', 'journey'] },
  journey_step: { alt_labels: ['journey moment', 'journey stage'] },
  design_component: { alt_labels: ['component', 'ui component', 'design element'] },
  design_token: { alt_labels: ['token', 'style token', 'css variable'] },
  wireframe: { alt_labels: ['wireflow', 'lo-fi mockup', 'skeleton'] },
  design_pattern: { alt_labels: ['ui pattern', 'ux pattern', 'interaction pattern'] },
  design_guideline: { alt_labels: ['style guide', 'design rule', 'design standard'] },
  annotation: { alt_labels: ['design annotation', 'spec note', 'callout'] },
  interaction_spec: { alt_labels: ['interaction specification', 'motion spec', 'behaviour spec'] },
  design_system: { alt_labels: ['component library', 'style system', 'ui kit'] },
  screen: { alt_labels: ['page', 'view', 'route', 'ui state'] },
  screen_state: { alt_labels: ['view state', 'empty state', 'loading state', 'error state'] },

  // Brand layer
  brand_identity: { alt_labels: ['brand', 'brand guidelines', 'brand book'] },
  brand_imagery: { alt_labels: ['brand image', 'visual asset', 'brand photo'] },
  brand_logo: { alt_labels: ['logo', 'logomark', 'wordmark', 'brand mark'] },
  brand_colour: { alt_labels: ['brand color', 'colour palette', 'color palette'] },
  brand_typography: { alt_labels: ['typeface', 'font family', 'type system'] },
  brand_voice: { alt_labels: ['tone of voice', 'brand tone', 'writing style'] },

  // Product Specification layer
  // 'initiative' stripped (P-B /): canonical label of the distinct `initiative` type.
  epic: { alt_labels: ['large story', 'feature set'] },
  feature_area: { alt_labels: ['feature group', 'capability area', 'module'] },
  acceptance_criterion: { alt_labels: ['ac', 'done criterion', 'acceptance criteria', 'definition of done'] },
  release: { alt_labels: ['version', 'ship', 'launch version', 'build'] },
  task: { alt_labels: ['work item', 'todo', 'subtask', 'ticket'] },
  bug: { alt_labels: ['defect', 'issue', 'regression'] },
  fix: { alt_labels: ['bugfix', 'patch', 'remediation'] },
  roadmap: { alt_labels: ['product roadmap', 'release plan', 'timeline'] },
  roadmap_item: { alt_labels: ['roadmap entry', 'planned item'] },
  roadmap_theme: { alt_labels: ['product theme', 'roadmap theme'] }, //: renamed from bare 'theme' (N6 lineage)
  planning_cycle: { alt_labels: ['sprint', 'iteration', 'cycle', 'program increment', 'pi', 'cadence', 'time-box', 'cooldown', 'quarter'] },

  // Engineering layer
  bounded_context: { alt_labels: ['context', 'domain boundary', 'module boundary'] },
  service: { alt_labels: ['microservice', 'backend service', 'api service'] },
  // 'event' stripped (P-B /): canonical label of the distinct `event` type.
  domain_event: { alt_labels: ['system event', 'business event'] },
  // 'contract' stripped (P-B /): canonical label of the distinct `contract` (legal) type.
  api_contract: { alt_labels: ['api spec', 'api schema', 'openapi spec'] },
  technical_debt_item: { alt_labels: ['tech debt', 'debt', 'tech debt item', 'cleanup'] },
  feature_flag: { alt_labels: ['flag', 'toggle', 'feature toggle', 'release flag'] },
  aggregate: { alt_labels: ['aggregate root', 'ddd aggregate'] },
  domain_entity: { alt_labels: ['entity', 'ddd entity', 'domain object'] },
  value_object: { alt_labels: ['vo', 'ddd value object'] },
  command: { alt_labels: ['cqrs command', 'write command', 'mutation'] },
  read_model: { alt_labels: ['projection', 'query model', 'cqrs read model'] },
  api_endpoint: { alt_labels: ['endpoint', 'route', 'api route'] },
  database_schema: { alt_labels: ['schema', 'db schema', 'table definition'] },
  queue_topic: { alt_labels: ['topic', 'message queue', 'event bus topic', 'pubsub topic'] },
  build_artifact: { alt_labels: ['artifact', 'binary', 'docker image', 'package'] },
  code_repository: { alt_labels: ['repo', 'repository', 'git repo', 'codebase'] },
  // 'dependency' stripped (P-B /): canonical label of the distinct `dependency` type.
  library_dependency: { alt_labels: ['package', 'library', 'npm package'] },
  integration_pattern: { alt_labels: ['integration', 'pattern', 'middleware pattern'] },
  external_api: { alt_labels: ['third-party api', 'vendor api', 'saas integration'] },
  data_flow: { alt_labels: ['data movement', 'data transfer', 'pipeline flow'] },

  // Growth layer
  // bare 'channel' stripped (P-B /): shared 3-way (see distribution_channel).
  acquisition_channel: { alt_labels: ['acquisition channel', 'traffic source', 'user source'] },
  growth_campaign: { alt_labels: ['campaign', 'marketing campaign', 'ad campaign', 'growth campaign'] },
  cohort: { alt_labels: ['user cohort', 'retention cohort', 'signup cohort'] },
  // bare 'segment' stripped (P-B /): shared 2-way with `market_segment`.
  // 'behavioral segment' / 'user segment' keep the affordance unambiguously.
  behavioral_segment: { alt_labels: ['user segment', 'audience segment', 'behavioural segment'] },
  growth_loop: { alt_labels: ['viral loop', 'referral loop', 'flywheel'] },
  attribution_model: { alt_labels: ['attribution', 'marketing attribution', 'channel attribution'] },

  // Business Model layer
  business_model: { alt_labels: ['model', 'biz model'] },
  pricing_tier: { alt_labels: ['plan', 'pricing plan', 'tier'] },
  unit_economics: { alt_labels: ['unit econ', 'ltv/cac', 'economics'] },

  // Go-To-Market layer
  gtm_strategy: { alt_labels: ['go-to-market strategy', 'go to market', 'gtm plan', 'launch strategy'] },
  ideal_customer_profile: { alt_labels: ['icp', 'target customer', 'ideal buyer'] },
  positioning: { alt_labels: ['market positioning', 'positioning statement', 'brand position'] },
  messaging: { alt_labels: ['messaging framework', 'value messaging', 'key messages'] },
  launch: { alt_labels: ['product launch', 'go-live', 'ship date'] },
  content_strategy: { alt_labels: ['editorial strategy', 'content plan'] },
  sales_motion: { alt_labels: ['sales model', 'sales approach', 'plg', 'self-serve', 'sales-led'] },
  competitive_battle_card: { alt_labels: ['battle card', 'competitive card', 'win/loss card'] },
  demand_gen_program: { alt_labels: ['demand generation', 'demand gen', 'lead gen program'] },
  territory: { alt_labels: ['sales territory', 'region', 'geo'] },
  objection: { alt_labels: ['customer objection', 'sales objection', 'pushback'] },
  rebuttal: { alt_labels: ['counter-argument', 'objection handler', 'response'] },
  proof_point: { alt_labels: ['evidence point', 'case study reference', 'social proof'] },

  // Team & Organisation layer
  team: { alt_labels: ['squad', 'pod', 'tribe', 'team unit'] },
  role: { alt_labels: ['position', 'job title', 'responsibility'] },
  stakeholder: { alt_labels: ['sponsor', 'decision maker', 'approver'] },
  team_okr: { alt_labels: ['team objective', 'team goal'] },
  retrospective: { alt_labels: ['retro', 'sprint retro', 'team retro', 'post-mortem'] },
  dependency: { alt_labels: ['team dependency', 'cross-team dependency', 'blocker'] },
  department: { alt_labels: ['org unit', 'division', 'business unit'] },
  // 'capability' stripped (P-B /): canonical label of the distinct `capability` type.
  skill: { alt_labels: ['competency', 'expertise'] },
  ceremony: { alt_labels: ['ritual', 'meeting cadence', 'standup', 'retrospective meeting'] },
  capacity_plan: { alt_labels: ['resourcing plan', 'staffing plan', 'headcount plan'] },

  // Data & Analytics layer
  data_source: { alt_labels: ['source', 'data origin', 'database'] },
  event_schema: { alt_labels: ['tracking plan', 'event definition', 'analytics event'] },
  dashboard: { alt_labels: ['analytics dashboard', 'report dashboard', 'monitoring dashboard'] },
  data_model: { alt_labels: ['erd', 'entity relationship diagram', 'schema model'] },
  data_quality_rule: { alt_labels: ['data rule', 'quality check', 'data validation'] },
  data_product: { alt_labels: ['data asset', 'data offering'] },
  // 'data flow' stripped (P-B /): canonical label of the distinct `data_flow` type.
  data_pipeline: { alt_labels: ['etl', 'elt', 'ingestion pipeline'] },
  data_lineage: { alt_labels: ['lineage', 'data provenance', 'data trail'] },
  glossary_term: { alt_labels: ['term', 'definition', 'business term'] },
  data_domain: { alt_labels: ['data area', 'data subject area'] },
  report: { alt_labels: ['analytics report', 'business report'] },

  // Operations & Customer Success layer
  customer_feedback: { alt_labels: ['feedback', 'user feedback', 'csat response'] },
  churn_reason: { alt_labels: ['cancellation reason', 'churn driver', 'attrition cause'] },
  customer_health_score: { alt_labels: ['health score', 'customer health', 'account health'] },
  playbook: { alt_labels: ['cs playbook', 'success playbook', 'engagement playbook'] },
  service_level_agreement: { alt_labels: ['sla', 'service agreement', 'support agreement', 'response time commitment'] },
  customer_journey_stage: { alt_labels: ['journey stage', 'lifecycle stage', 'customer stage'] },
  touchpoint: { alt_labels: ['interaction point', 'contact point', 'engagement point'] },
  success_milestone: { alt_labels: ['cs milestone', 'onboarding milestone', 'adoption milestone'] },
  service_blueprint: { alt_labels: ['blueprint', 'service map', 'service design'] },
  nps_campaign: { alt_labels: ['nps survey', 'nps score', 'net promoter score', 'nps'] },

  // Content & Knowledge layer
  content_piece: { alt_labels: ['content', 'article', 'blog post', 'content asset'] },
  document: { alt_labels: ['doc', 'general document', 'file'] },
  knowledge_base_article: { alt_labels: ['kb article', 'help article', 'faq', 'support doc'] },
  brand_asset: { alt_labels: ['asset', 'creative asset', 'marketing asset'] },
  internal_doc: { alt_labels: ['internal document', 'wiki page', 'confluence page', 'notion doc'] },
  prompt_template: { alt_labels: ['prompt', 'ai prompt', 'system prompt', 'template'] },
  changelog: { alt_labels: ['release notes', "what's new", 'update log'] },
  content_calendar: { alt_labels: ['editorial calendar', 'publishing schedule'] },
  content_theme: { alt_labels: ['editorial theme', 'content pillar', 'topic cluster'] },
  documentation_template: { alt_labels: ['doc template', 'template'] },

  // Legal, Compliance & Risk layer
  compliance_requirement: { alt_labels: ['regulation', 'compliance rule', 'regulatory requirement'] },
  data_contract: { alt_labels: ['data agreement', 'data sharing agreement'] },
  legal_entity: { alt_labels: ['company', 'subsidiary', 'legal body'] },
  ip_asset: { alt_labels: ['intellectual property', 'patent', 'trademark', 'ip'] },
  audit_log_policy: { alt_labels: ['audit policy', 'logging policy', 'retention policy'] },
  contract: { alt_labels: ['agreement', 'legal contract'] },
  contract_clause: { alt_labels: ['clause', 'term', 'provision'] },
  privacy_policy: { alt_labels: ['privacy notice', 'data privacy policy'] },
  compliance_framework: { alt_labels: ['regulatory framework', 'iso standard', 'soc2'] },
  security_audit: { alt_labels: ['audit', 'compliance audit', 'security assessment'] },

  // DevOps & Platform layer
  error_budget: { alt_labels: ['reliability budget', 'downtime budget'] },
  investigation: { alt_labels: ['incident investigation', 'root cause analysis', 'debugging'] },
  postmortem: { alt_labels: ['post-mortem', 'incident review', 'rca', 'root cause analysis'] },
  // 'playbook' stripped (P-B /): canonical label of the distinct `playbook` type.
  runbook: { alt_labels: ['operations guide', 'sop', 'standard operating procedure'] },
  monitor: { alt_labels: ['health check', 'synthetic monitor', 'uptime check'] },
  alert_rule: { alt_labels: ['alert', 'pager rule', 'notification rule'] },
  release_strategy: { alt_labels: ['rollout strategy', 'deployment strategy', 'canary release'] },
  root_cause: { alt_labels: ['root cause', 'underlying cause', 'origin'] },
  symptom: { alt_labels: ['indicator', 'sign', 'manifestation'] },
  on_call_rotation: { alt_labels: ['on-call schedule', 'pager rotation', 'incident rotation'] },
  infrastructure_component: { alt_labels: ['infra', 'cloud resource', 'server', 'container'] },

  // Security layer
  threat_model: { alt_labels: ['threat analysis', 'stride model', 'attack surface'] },
  threat: { alt_labels: ['attack vector', 'security threat', 'risk vector'] },
  vulnerability: { alt_labels: ['vuln', 'cve', 'security flaw', 'weakness'] },
  security_control: { alt_labels: ['control', 'safeguard', 'countermeasure', 'mitigation'] },
  security_policy: { alt_labels: ['infosec policy', 'security standard'] },
  penetration_test: { alt_labels: ['pentest', 'pen test', 'security test'] },
  // bare 'audit' / 'security assessment' stripped (P-B /): both owned by
  // `security_audit`. A `security_review` is a code-review-scoped activity; the
  // qualified 'security code review' keeps it findable without colliding.
  security_review: { alt_labels: ['code review', 'security code review'] },
  data_classification: { alt_labels: ['classification', 'sensitivity level', 'data label'] },
  access_policy: { alt_labels: ['iam policy', 'rbac rule', 'permission', 'access control'] },

  // Sales & Revenue layer
  // 'organization' stripped (P-B /): canonical label of the distinct `organization` type.
  account: { alt_labels: ['customer account', 'client'] },
  // 'person' stripped (P-B /): canonical label of the distinct `person` type.
  contact: { alt_labels: ['buyer', 'champion'] },
  lead: { alt_labels: ['prospect', 'mql', 'sql', 'marketing lead'] },
  // 'opportunity' stripped (P-B /): canonical label of the distinct `opportunity` (OST) type.
  deal: { alt_labels: ['sales opportunity', 'opp'] },
  pipeline_sales: { alt_labels: ['sales pipeline', 'deal pipeline', 'revenue pipeline'] },
  pipeline_stage: { alt_labels: ['deal stage', 'sales stage'] },
  // bare 'quote' qualified to 'sales quote' (P-B /): 'quote' is the
  // canonical label of the distinct `quote` type. The qualified form keeps the
  // sales-document search affordance without misresolving.
  quote_document: { alt_labels: ['sales quote', 'proposal', 'estimate', 'quotation'] },
  subscription: { alt_labels: ['recurring revenue', 'saas subscription', 'plan'] },
  invoice: { alt_labels: ['bill', 'payment request'] },
  forecast: { alt_labels: ['revenue forecast', 'sales forecast', 'projection'] },

  // Program Management layer
  program: { alt_labels: ['programme', 'initiative portfolio'] },
  project: { alt_labels: ['workstream', 'work package'] },
  milestone: { alt_labels: ['checkpoint', 'gate', 'deadline'] },
  risk_register: { alt_labels: ['risk log', 'risk tracker'] },
  change_request: { alt_labels: ['cr', 'rfc', 'scope change', 'change order'] },
  deliverable: { alt_labels: ['output', 'work product', 'artifact'] },
  resource_allocation: { alt_labels: ['allocation', 'assignment', 'staffing'] },
  status_report: { alt_labels: ['sitrep', 'progress report', 'weekly update'] },

  // Accessibility layer
  a11y_standard: { alt_labels: ['accessibility standard', 'wcag', 'ada requirement'] },
  a11y_guideline: { alt_labels: ['accessibility guideline', 'wcag guideline'] },
  a11y_audit: { alt_labels: ['accessibility audit', 'a11y review'] },
  a11y_issue: { alt_labels: ['accessibility issue', 'a11y bug', 'accessibility violation'] },
  a11y_annotation: { alt_labels: ['accessibility annotation', 'aria note'] },

  // Marketing & Communications layer
  marketing_strategy: { alt_labels: ['marketing plan', 'growth strategy'] },
  // bare 'channel' stripped (P-B /): shared 3-way (see distribution_channel).
  marketing_channel: { alt_labels: ['marketing channel', 'paid channel', 'organic channel'] },
  marketing_campaign_plan: { alt_labels: ['campaign plan', 'launch campaign'] },
  email_sequence: { alt_labels: ['drip campaign', 'nurture sequence', 'email flow'] },
  social_post: { alt_labels: ['tweet', 'linkedin post', 'social media post'] },
  seo_keyword: { alt_labels: ['keyword', 'search term', 'target keyword'] },
  ad_creative: { alt_labels: ['ad', 'advertisement', 'creative'] },
  press_release: { alt_labels: ['pr', 'media release', 'announcement'] },
  event: { alt_labels: ['conference', 'meetup', 'webinar event', 'launch event'] },
  community_initiative: { alt_labels: ['community program', 'community project', 'developer community'] },

  // Localisation & i18n layer
  locale: { alt_labels: ['language', 'region', 'l10n target'] },
  translation_key: { alt_labels: ['i18n key', 'message key', 'string key'] },
  translation_bundle: { alt_labels: ['language file', 'locale bundle', 'message bundle'] },
  locale_config: { alt_labels: ['locale settings', 'regional config'] },
  cultural_adaptation: { alt_labels: ['localization', 'cultural customization', 'market adaptation'] },
  regional_pricing: { alt_labels: ['geo pricing', 'ppp pricing', 'local pricing'] },

  // Customer Education & Training layer
  education_program: { alt_labels: ['training program', 'onboarding program', 'academy'] },
  tutorial: { alt_labels: ['how-to', 'guide', 'getting started'] },
  walkthrough: { alt_labels: ['product tour', 'guided tour', 'interactive guide'] },
  webinar: { alt_labels: ['live demo', 'online workshop', 'virtual event'] },
  certification: { alt_labels: ['cert', 'credential', 'badge'] },
  help_video: { alt_labels: ['tutorial video', 'screencast', 'how-to video'] },
  learning_path: { alt_labels: ['curriculum', 'course track', 'learning journey'] },

  // Quality Assurance & Testing layer
  // test_plan re-homed validation → QA: QA-shaped labels only.
  // 'validation plan' and 'experiment plan' stripped — those belong to the
  // validation-side `experiment_plan` type.
  test_plan: { alt_labels: ['test strategy', 'qa plan', 'master test plan'] },
  test_suite: { alt_labels: ['test collection', 'test group'] },
  test_case: { alt_labels: ['test', 'test scenario', 'verification step'] },
  qa_session: { alt_labels: ['testing session', 'exploratory test', 'qa round'] },
  regression_test: { alt_labels: ['regression', 'regression check'] },
  test_coverage_report: { alt_labels: ['coverage report', 'coverage'] },
  test_environment: { alt_labels: ['staging', 'qa environment', 'sandbox'] },
  test_result: { alt_labels: ['test outcome', 'test run result', 'assertion result'] },

  // Partner & Ecosystem Management layer
  partner_program: { alt_labels: ['partnership program', 'channel program'] },
  partner_tier: { alt_labels: ['partner level', 'partnership tier'] },
  api_ecosystem: { alt_labels: ['platform ecosystem', 'developer ecosystem', 'integration ecosystem'] },
  marketplace_listing: { alt_labels: ['listing', 'app store listing', 'marketplace entry'] },
  developer_portal: { alt_labels: ['dev portal', 'api docs site', 'developer hub'] },
  integration_partner: { alt_labels: ['tech partner', 'integration vendor'] },
  partner_revenue_share: { alt_labels: ['rev share', 'commission', 'affiliate payout'] },

  // Feedback & Voice of Customer layer
  feedback_program: { alt_labels: ['voice of customer program', 'voc program'] },
  feature_request: { alt_labels: ['request', 'product request', 'enhancement request'] },
  feedback_vote: { alt_labels: ['upvote', 'vote', 'user vote'] },
  user_advisory_board: { alt_labels: ['cab', 'customer advisory board', 'advisory council'] },
  beta_program: { alt_labels: ['beta', 'early access', 'preview program'] },
  feedback_theme: { alt_labels: ['feedback cluster', 'feedback category'] }, // N6: not bare 'theme'

  // Pricing & Packaging layer
  pricing_strategy: { alt_labels: ['pricing model', 'monetization strategy'] },
  package: { alt_labels: ['product package', 'bundle', 'sku'] },
  discount_strategy: { alt_labels: ['discount', 'promotion', 'coupon strategy'] },
  trial_config: { alt_labels: ['free trial', 'trial settings', 'trial period'] },
  paywall: { alt_labels: ['gate', 'upgrade wall', 'monetization gate'] },

  // AI/ML Operations layer
  ai_dataset: { alt_labels: ['training data', 'dataset', 'ml dataset'] },
  ai_experiment: { alt_labels: ['ml experiment', 'model experiment'] },
  ai_model: { alt_labels: ['model', 'ml model', 'llm', 'machine learning model'] },
  prompt_version: { alt_labels: ['prompt revision', 'prompt iteration'] },
  eval_benchmark: { alt_labels: ['benchmark', 'evaluation', 'eval suite'] },
  eval_run: { alt_labels: ['evaluation run', 'benchmark run', 'eval result'] },
  ai_cost_tracker: { alt_labels: ['llm cost', 'token usage', 'ai spend'] },
  hallucination_report: { alt_labels: ['hallucination', 'factuality error', 'grounding failure'] },
  ai_guardrail: { alt_labels: ['guardrail', 'safety rail', 'content filter'] },
  ai_trace: { alt_labels: ['inference trace', 'llm trace', 'ai log'] },
  model_comparison: { alt_labels: ['model eval', 'a/b model test', 'model benchmark'] },

  // Agentic Workflows & Process layer
  agent_task: { alt_labels: ['agent work item', 'automated task'] },
  workflow_template: { alt_labels: ['workflow', 'process template', 'automation'] },
  workflow_run: { alt_labels: ['run', 'execution', 'workflow execution'] },
  agent_definition: { alt_labels: ['agent', 'ai agent', 'autonomous agent'] },
  agent_session: { alt_labels: ['session', 'agent run', 'agent conversation'] },
  review_gate: { alt_labels: ['approval gate', 'quality gate', 'stage gate'] },
  approval_record: { alt_labels: ['approval', 'sign-off', 'authorization'] },
  // bare 'skill' qualified to 'agent skill' (P-B /): 'skill' is the
  // canonical label of the distinct team_org `skill` type.
  agent_skill: { alt_labels: ['agent skill', 'tool', 'agent capability'] },
  agent_hook: { alt_labels: ['hook', 'trigger', 'callback'] },
  workflow_artifact: { alt_labels: ['artifact', 'output artifact', 'generated artifact'] },

  // Portfolio layer
  organization: { alt_labels: ['org', 'company', 'enterprise', 'organisation'] },
  portfolio: { alt_labels: ['product portfolio', 'product line', 'product suite'] },
  product_area: { alt_labels: ['area', 'product domain', 'vertical'] },
  workspace: { alt_labels: ['canvas', 'thinking space', 'working area'] },
}

// ─── Build the complete map ─────────────────────────────────────────────────────

/**
 * Convert snake_case to Title Case, respecting known abbreviations.
 */
function toTitleCase(id: string): string {
  const UPPER = new Set([
    'kpi', 'jtbd', 'okr', 'sli', 'slo', 'sla', 'api', 'ci', 'ip', 'qa',
    'ai', 'ml', 'ab', 'bm', 'nps', 'seo', 'gtm', 'erd',
  ])
  return id
    .split('_')
    .map((w) => {
      if (UPPER.has(w)) return w.toUpperCase()
      if (w === 'a11y') return 'A11y'
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(' ')
}

/**
 * Collect old type names that migrate into a given canonical type.
 * These become additional alt_labels automatically.
 */
function getMigrationAliases(canonicalType: string): string[] {
  const aliases: string[] = []
  for (const migrations of Object.values(UPG_MIGRATIONS)) {
    for (const m of migrations) {
      if (m.to === canonicalType) {
        // Add the old type name as a Title Case alias
        aliases.push(m.from.replace(/_/g, ' '))
      }
    }
  }
  return aliases
}

// ─── Reverse-generated framework labels from framework definitions ────────────

/**
 * Reverse-generate framework_labels and alt_labels from the canonical framework
 * library. For each framework, each slot tells us "this framework calls entity
 * type X by label Y". Aggregating across all 346 frameworks gives us the
 * complete Rosetta Stone mapping.
 */
interface GeneratedLabelData {
  framework_labels: Record<string, string>
  slot_alt_labels: string[]
}

const _generatedLabels: Map<string, GeneratedLabelData> = new Map()

for (const fw of UPG_FRAMEWORKS) {
  if (!fw.slots) continue
  for (const slot of fw.slots) {
    const entityType = slot.entityTypeId
    if (!entityType) continue

    let entry = _generatedLabels.get(entityType)
    if (!entry) {
      entry = { framework_labels: {}, slot_alt_labels: [] }
      _generatedLabels.set(entityType, entry)
    }

    // Map framework ID → slot label (e.g. "lean-canvas" → "Revenue Streams")
    if (!entry.framework_labels[fw.id]) {
      entry.framework_labels[fw.id] = slot.label
    }

    // Collect unique slot labels as potential alt_labels
    const normalised = slot.label.toLowerCase()
    if (!entry.slot_alt_labels.includes(normalised)) {
      entry.slot_alt_labels.push(normalised)
    }
  }
}

// Index priority labels by id for O(1) lookup during assembly
const _priorityIndex = new Map(PRIORITY_LABELS.map((p) => [p.id, p]))

/**
 * The complete Rosetta Stone: one UPGTypeLabel for every active type.
 *
 * Assembly logic:
 * 1. If a type has a PRIORITY_LABELS entry → use it (richest framework_labels)
 * 2. Else if a type has a STANDARD_LABELS entry → build from that
 * 3. Else → auto-generate from the type name (canonical_label only)
 *
 * In all cases, migration aliases are merged into alt_labels automatically.
 */
export const UPG_TYPE_LABELS: UPGTypeLabel[] = UPG_ACTIVE_TYPES.map((typeName) => {
  const migrationAliases = getMigrationAliases(typeName)

  const generated = _generatedLabels.get(typeName)

  // 1. Priority entry (hand-authored with framework_labels)
  const priority = _priorityIndex.get(typeName)
  if (priority) {
    // Merge migration aliases + generated slot labels into alt_labels
    const existingSet = new Set(priority.alt_labels.map((a) => a.toLowerCase()))
    const newAliases = migrationAliases.filter((a) => !existingSet.has(a.toLowerCase()))
    const slotAliases = (generated?.slot_alt_labels ?? []).filter((a) => !existingSet.has(a) && !newAliases.some((n) => n.toLowerCase() === a))

    // Merge generated framework_labels (hand-authored take priority)
    const mergedFrameworkLabels = {
      ...(generated?.framework_labels ?? {}),
      ...priority.framework_labels, // hand-authored wins
    }

    return {
      ...priority,
      emoji: ENTITY_EMOJI[typeName] ?? DEFAULT_ENTITY_EMOJI,
      alt_labels: [...priority.alt_labels, ...newAliases, ...slotAliases],
      framework_labels: mergedFrameworkLabels,
    }
  }

  // 2. Standard entry (alt_labels only, enrich with generated framework_labels)
  const standard = STANDARD_LABELS[typeName]
  if (standard) {
    const existingSet = new Set(standard.alt_labels.map((a) => a.toLowerCase()))
    const newAliases = migrationAliases.filter((a) => !existingSet.has(a.toLowerCase()))
    const slotAliases = (generated?.slot_alt_labels ?? []).filter((a) => !existingSet.has(a) && !newAliases.some((n) => n.toLowerCase() === a))

    return {
      id: typeName,
      canonical_label: toTitleCase(typeName),
      emoji: ENTITY_EMOJI[typeName] ?? DEFAULT_ENTITY_EMOJI,
      alt_labels: [...standard.alt_labels, ...newAliases, ...slotAliases],
      framework_labels: generated?.framework_labels ?? {},
    }
  }

  // 3. Auto-generated (enrich with generated data)
  const slotAliases = (generated?.slot_alt_labels ?? []).filter((a) => !migrationAliases.some((m) => m.toLowerCase() === a))

  return {
    id: typeName,
    canonical_label: toTitleCase(typeName),
    emoji: ENTITY_EMOJI[typeName] ?? DEFAULT_ENTITY_EMOJI,
    alt_labels: [...migrationAliases, ...slotAliases],
    framework_labels: generated?.framework_labels ?? {},
  }
})

// ─── Lookup helpers ─────────────────────────────────────────────────────────────

/** O(1) lookup by entity type id */
export const UPG_TYPE_LABELS_MAP: ReadonlyMap<string, UPGTypeLabel> = new Map(
  UPG_TYPE_LABELS.map((entry) => [entry.id, entry]),
)

/**
 * Resolve the display label for an entity type, with optional framework context.
 *
 * Priority:
 * 1. If frameworkId provided and a framework_labels entry exists → use it
 * 2. If designation provided and a designations entry exists → use it
 * 3. Fall back to canonical_label
 * 4. Fall back to Title Case of the id
 *
 * @example
 * resolveLabel('persona')                 // → 'Persona'       (canonical)
 * resolveLabel('need', 'lean_canvas')     // → 'Problem'       (framework-specific)
 * resolveLabel('need', undefined, 'pain') // → 'Pain Point'    (designation-specific)
 * resolveLabel('not_a_type')              // → 'Not A Type'    (Title Case fallback)
 */
export function resolveLabel(
  entityType: string,
  frameworkId?: string,
  designation?: string,
): string {
  const entry = UPG_TYPE_LABELS_MAP.get(entityType)
  if (!entry) {
    // Unknown type: best-effort Title Case
    return toTitleCase(entityType)
  }

  if (frameworkId && entry.framework_labels[frameworkId]) {
    return entry.framework_labels[frameworkId]
  }

  if (designation && entry.designations?.[designation]) {
    return entry.designations[designation]
  }

  return entry.canonical_label
}

// ─── Auto-generated TYPE_ALIASES ────────────────────────────────────────────────

/**
 * Build the TYPE_ALIASES map from alt_labels.
 *
 * Replaces the hand-maintained TYPE_ALIASES in validation.ts.
 * Maps every alt_label (and its snake_case variant) → canonical entity type id.
 *
 * Collision rule: first entry wins (entries earlier in UPG_TYPE_LABELS take priority).
 *
 * @example
 * const aliases = buildTypeAliases()
 * aliases['jtbd']              // → 'job'        (JTBD alt-label → canonical)
 * aliases['job_to_be_done']    // → 'job'
 * aliases['problem']           // → 'need'       (Lean Canvas label → canonical)
 */
export function buildTypeAliases(): Record<string, string> {
  const aliases: Record<string, string> = {}

  for (const entry of UPG_TYPE_LABELS) {
    for (const label of entry.alt_labels) {
      // Normalise to snake_case for matching
      const snaked = label.toLowerCase().replace(/[\s\-\/]+/g, '_')

      // First entry wins; don't overwrite existing aliases
      if (!aliases[snaked]) {
        aliases[snaked] = entry.id
      }

      // Also store the raw lowercase version (for natural-language matching)
      const lower = label.toLowerCase()
      if (lower !== snaked && !aliases[lower]) {
        aliases[lower] = entry.id
      }
    }
  }

  return aliases
}

/** Pre-built alias map. Import this instead of calling buildTypeAliases() repeatedly. */
export const UPG_TYPE_ALIASES: Record<string, string> = buildTypeAliases()
