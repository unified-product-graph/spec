/**
 * UPG Hierarchy. `UPG_VALID_CHILDREN` declares which types are permitted as
 * direct children of each parent. Drives add menus, validation, and traversal.
 * Ordering reflects the suggested creation sequence.
 * https://unifiedproductgraph.org/spec | MIT
 */

/** The canonical parent → children map. Keys are parent types, values are ordered child types. */
export const UPG_VALID_CHILDREN: Record<string, readonly string[]> = {
  // ── Foundations (0.9.12): registry canonicals that self-nest. A
  //    specification extends a specification (a dialect of a parent spec); a
  //    primitive composes primitives (a block contains spans). These back the
  //    hierarchy-classified specification_extends_specification /
  //    primitive_composes_primitive catalog edges.
  specification: ['specification'],
  primitive: ['primitive'],
  // An operating_lifecycle (e.g. the content-ops lifecycle) contains its ordered
  // operating_stage children. Backs the operating_lifecycle_contains_operating_stage edge.
  operating_lifecycle: ['operating_stage'],
  // ── Product (root) ─────────────────────────────────────────────────────────
  product: [
    // Strategy
    'vision', 'outcome', 'objective', 'metric', 'decision', 'constraint',
    // User
    'persona',
    // Discovery (via outcome children)
    // Validation (via hypothesis children)
    // Market Intelligence
    'competitor', 'market_trend', 'market_segment', 'competitive_analysis',
    // User Research
    'research_study',
    // Experience Design
    'user_journey', 'user_flow', 'wireframe', 'screen',
    // Design System
    'design_system', 'design_component',
    // Brand Identity
    'brand_identity',
    // Product Specification
    'feature', 'feature_area', 'release', 'roadmap', 'roadmap_theme',
    // Engineering
    'bounded_context', 'code_repository', 'integration_pattern', 'external_api', 'data_flow',
    // Growth
    'funnel', 'acquisition_channel', 'cohort', 'behavioral_segment', 'growth_loop', 'attribution_model',
    // Business Model
    'business_model',
    // Go-To-Market
    'gtm_strategy',
    // Team & Organisation
    // `person` is containment-free (see UPG_CONTAINMENT_FREE_TYPES below)
    // (referenced via edges, not nested under product)
    'team', 'stakeholder', 'department',
    // Data & Analytics
    'data_source', 'event_schema', 'dashboard', 'data_domain', 'glossary_term',
    // Content & Knowledge
    'content_piece', 'knowledge_base_article', 'brand_asset', 'document',
    'documentation_template',
    // Legal
    'legal_entity', 'privacy_policy',
    // Compliance
    'compliance_requirement', 'risk', 'data_contract', 'audit_log_policy', 'compliance_framework',
    // DevOps & Platform
    'service_level_objective', 'incident', 'runbook', 'monitor',
    'ci_pipeline', 'release_strategy', 'on_call_rotation', 'infrastructure_component',
    // Security
    'threat_model', 'security_control', 'security_policy',
    'penetration_test', 'security_review', 'data_classification', 'access_policy',
    // Accessibility
    'a11y_standard', 'a11y_audit', 'a11y_annotation',
    // Quality Assurance
    'test_plan', 'test_suite', 'qa_session', 'test_coverage_report', 'test_environment',
    // Customer Feedback
    'feedback_program', 'user_advisory_board', 'beta_program',
    // Pricing & Packaging
    'pricing_strategy',
    // AI & Machine Learning
    'ai_model', 'model_comparison',
    // Workflows & Agents
    'workflow_template', 'agent_definition',
    // Sales & Revenue
    'pipeline_sales', 'account', 'lead', 'subscription', 'forecast',
    // Program Management
    'program',
    // Marketing
    'marketing_strategy', 'press_release', 'event', 'community_initiative',
    // Customer Success
    'support_ticket', 'customer_feedback', 'churn_reason',
    'customer_health_score', 'playbook', 'service_level_agreement',
    'success_milestone', 'service_blueprint', 'nps_campaign',
    // Localisation
    'locale', 'locale_config',
    // Customer Education
    'education_program',
    // Partners & Ecosystem
    'partner_program', 'api_ecosystem', 'developer_portal',
    // Portfolio
    // product no longer lists product_area as a child: the
    // product↔product_area containment is the single direction
    // product_area_contains_product (product_area → product). The inverse
    // product_categorised_in_product_area edge was collapsed.
    // Workspace
    'workspace',
  ],

  // ── Metric & Outcome hierarchy ──────────────────────────────────────────────
  outcome: ['metric', 'opportunity', 'feature'],

  // ── User & Jobs hierarchy ───────────────────────────────────────────────────
  persona: ['job', 'need', 'switching_cost', 'desired_outcome'],
  job: ['need', 'desired_outcome', 'job_step'],

  // ── Discovery hierarchy ─────────────────────────────────────────────────────
  opportunity: ['solution', 'design_concept', 'feasibility_study', 'design_sprint'],
  // solutions now propose hypothesis (the templated
  // belief), not the legacy hypothesis type.
  solution: ['hypothesis', 'prototype', 'metric'],

  // ── Validation hierarchy ────────────────────────────────────────────────────
  // The validation chain is a single-parent line:
  //   hypothesis ▷ experiment_plan ▷ experiment ▷ experiment_run.
  // hypothesis is canonical (hypothesis_evidence collapsed into evidence;
  // relationship expressed via hypothesis_has_evidence edge; evidence.direction
  // carries supports/refutes/neutral semantics). `test_plan` re-homed to the
  // QA/testing domain, so it is no longer a hypothesis child.
  hypothesis: ['experiment_plan', 'research_plan', 'evidence'],
  // experiment_plan is the canonical validation PLAN (graduated stable,
  //). It designs the experiment it produces; the plan owns the
  // experiment in the containment line. It also retains experiment_run as a
  // child for the v0.2.6 split-migration path
  // (`experiment_plan_ran_as_experiment_run`), where a legacy experiment routes
  // directly to a plan + run pair.
  experiment_plan: ['experiment', 'experiment_run'],
  // experiment is the canonical structured test. It owns its run(s) and the
  // learning/evidence it produces. The optional experiment_run child captures
  // the multi-run / replication case.
  experiment: ['experiment_run', 'learning', 'evidence'],
  // experiment_run carries learning/evidence/metric children (run produces
  // evidence) and self-nests for replications/multi-armed runs (V9: this is
  // where self-nesting genuinely lives, not on `experiment`).
  experiment_run: ['learning', 'evidence', 'metric', 'experiment_run'],

  // ── OKR hierarchy ──────────────────────────────────────────────────────────
  objective: ['key_result', 'metric'],
  key_result: ['metric'],

  // ── Strategic cascade: vision → mission → strategic_pillar → strategic_theme →
  //    { initiative, objective } ───────────────────────────────────────────────
  //
  // strategic_pillar vs strategic_theme ( T3.3 — distinct cascade levels,
  // NOT duplicates; sharpened rather than merged):
  //   - strategic_pillar = a DURABLE structural division of the strategy. A
  //     standing area the org organises around for years (e.g. "Structured
  //     content", "Developer experience"). Few, long-lived; time_horizon is
  //     multi-year / open-ended; carries its own `success_indicator`.
  //   - strategic_theme = a TIME-BOUND thrust WITHIN a pillar. The current bet
  //     for a period (e.g. "Go AI-native this year"). More numerous, rotates;
  //     time_horizon is bounded (Q / FY); has NO `success_indicator` because it
  //     is measured through its child objectives (strategic_theme_contains_objective).
  //     That success-measurement asymmetry is the load-bearing distinction.
  vision: ['mission'],
  mission: ['strategic_pillar'],
  strategic_pillar: ['strategic_theme', 'capability', 'value_stream', 'decision'],
  // v0.5.4: objectives are the specific quarterly bets *within* a
  // strategic theme. The theme is the multi-quarter focus area; objectives are
  // subordinate. Pairs with `strategic_theme_contains_objective` in the edge
  // catalog (hierarchy, strategic_theme → objective, reverse_verb: rolls_up_to;
  // renamed from objective_rolls_up_to_strategic_theme in).
  strategic_theme: ['initiative', 'objective'],
  initiative: ['assumption'],
  // v0.5.2: capability decomposes into sub-capabilities (Wardley
  // value-chain spine) and is realised by user-facing features. Pairs with
  // `capability_depends_on_capability` and `capability_implemented_by_feature`
  // in the edge catalogue. The self-loop guard keeps A → A refused;
  // A → B between distinct capabilities is the supported decomposition.
  capability: ['capability', 'feature'],

  // ── Market hierarchy ────────────────────────────────────────────────────────
  // competitive_analysis hosts classification axes (its dimensions);
  // each axis hosts its values; values are reusable across the row and column
  // dossiers of a 2-axis matrix.
  competitive_analysis: ['competitor', 'market_trend', 'market_segment', 'classification_axis'],
  competitor: ['competitor_feature', 'competitor_signal'],
  classification_axis: ['classification_value'],

  // ── UX Research hierarchy ───────────────────────────────────────────────────
  research_study: [
    'participant', 'observation', 'affinity_cluster', 'research_question',
    'interview_guide', 'insight', 'survey_response',
  ],
  observation: ['quote'],
  // F6: affinity_cluster owns the observations it groups, in addition
  // to the insights it synthesises. Pairs with `affinity_cluster_groups_observation`
  // in the edge catalog (hierarchy). An observation can be both directly owned by
  // its research_study and grouped under an affinity_cluster (multi-parent grammar).
  affinity_cluster: ['insight', 'observation'],
  // insight refines into insight; a raw insight can be distilled
  // into a more specific insight (refines_into chain).
  // v0.5.8: insights own their evidencing quotes;
  // parallel to `observation: ['quote']`. Research-synthesis canon.
  // Pairs with `insight_evidenced_by_quote` in the edge catalog.

  // ── Design hierarchy ────────────────────────────────────────────────────────
  // (v0.9.2) A user_journey owns its steps (the stable 0.1.0 spine)
  // and carries phases as a non-owning band overlay. A journey_phase is NO
  // LONGER a containment parent of journey_step: it SPANS steps via the
  // `journey_phase_spans_journey_step` edge (mirroring the marketing
  // `customer_journey_stage_spans_journey_step` precedent), so each step has
  // exactly one containment parent and the journey has one canonical step list.
  user_journey: ['journey_step', 'journey_phase'],
  journey_step: ['journey_action'],
  // v0.5.8: insights own their evidencing quotes;
  // parallel to `observation: ['quote']`. Research-synthesis canon
  // (insight ← quote evidencing) extends quote's hierarchy parents to
  // both observation (raw-capture parent) and insight (synthesis parent).
  // Pairs with `insight_evidenced_by_quote` in the edge catalog.
  insight: ['design_question', 'insight', 'quote'],
  // v0.5.2: need anchors a Wardley value chain; capabilities
  // fulfil the need at the chain top. Cross-domain hierarchy (need ∈ Design,
  // capability ∈ Strategy) is intentional: Wardley analysis starts from a
  // user need and decomposes into the capabilities required to fulfil it.
  need: ['design_question', 'capability'],
  design_question: ['design_concept'],
  design_concept: ['prototype', 'wireframe'],
  design_component: [
    'design_token', 'design_pattern', 'design_guideline',
    'interaction_spec', 'design_component',
  ], // self-nesting for atomic hierarchy (organism → molecule → atom)
  prototype: ['annotation'],

  // ── Brand hierarchy ─────────────────────────────────────────────────────────
  brand_identity: [
    'brand_colour', 'brand_typography', 'brand_asset', 'brand_voice',
    'brand_logo', 'brand_imagery',
  ],

  // ── Product Specification hierarchy ─────────────────────────────────────────
  // story_task collapsed into canonical task. feature now owns
  // task directly; story-derived tasks implement user_story via
  // task_implements_user_story edge.
  feature: ['epic', 'bug', 'task'],
  feature_area: ['feature', 'feature_area'],
  epic: ['user_story'],
  user_story: ['acceptance_criterion'],
  task: ['task'],

  // ── Engineering hierarchy ───────────────────────────────────────────────────
  bounded_context: [
    'service', 'domain_event', 'decision', 'data_model', 'aggregate',
    'read_model', 'code_repository', 'integration_pattern', 'external_api',
    'data_flow',
    // v0.5.7: BCs publish api_contracts as their "published
    // language" (DDD canon). api_contract has two valid hierarchy parents now:
    // service (per-service exposure) AND bounded_context (BC-level surface).
    'api_contract',
  ],
  service: [
    'api_contract', 'technical_debt_item', 'feature_flag', 'deployment',
    'api_endpoint', 'database_schema', 'queue_topic', 'build_artifact',
    'library_dependency',
  ],
  // v0.5.1 ( C2): contracts contain their endpoints. Service still
  // serves endpoints directly (legacy / non-contract endpoints); both
  // parent-child paths coexist.
  api_contract: ['api_endpoint'],
  decision: ['technical_debt_item'],
  aggregate: ['domain_entity', 'value_object', 'command'],

  // ── Growth hierarchy ────────────────────────────────────────────────────────
  funnel: ['funnel_step'],
  acquisition_channel: ['growth_campaign'],
  growth_campaign: ['experiment_plan', 'variant'],

  // ── Business Model hierarchy ─────────────────────────────────────────────────
  business_model: [
    'value_proposition', 'revenue_stream', 'cost_structure', 'unit_economics',
    'partnership', 'key_resource', 'key_activity',
    'customer_relationship', 'distribution_channel',
  ],
  revenue_stream: ['pricing_tier'],

  // ── Go-To-Market hierarchy ───────────────────────────────────────────────────
  gtm_strategy: [
    'ideal_customer_profile', 'positioning', 'launch', 'content_strategy',
    'sales_motion', 'competitive_battle_card', 'demand_gen_program', 'territory',
  ],
  positioning: ['messaging', 'objection', 'proof_point'],
  value_proposition: ['objection', 'proof_point'],
  competitive_battle_card: ['objection'],
  objection: ['rebuttal'],
  rebuttal: ['proof_point'],

  // ── Team & Organisation hierarchy ───────────────────────────────────────────
  department: ['team', 'stakeholder'],
  team: [
    'role', 'team_okr', 'retrospective', 'dependency', 'skill', 'ceremony',
    'capacity_plan', 'decision',
  ],

  // ── Data & Analytics hierarchy ───────────────────────────────────────────────
  data_source: ['metric', 'data_pipeline', 'data_lineage', 'event_schema'],
  // T0.4 (0.13.0 Wave 1): `outcome` removed as a metric child. It closed a
  // containment cycle (outcome ⊃ metric ⊃ outcome) and was backed only by the CAUSAL
  // `metric_drives_outcome` edge, not a hierarchy edge — the "metric leads to outcome"
  // meaning lives correctly on that causal edge. The real containment (outcome ⊃ metric)
  // is kept. Sub-metric trees (metric ⊃ metric) stay.
  metric: ['metric', 'data_quality_rule', 'metric_quality_assessment'],
  data_domain: ['data_product', 'data_source', 'glossary_term', 'data_model', 'dashboard'],
  dashboard: ['report', 'experiment_run'],

  // ── Content & Knowledge hierarchy ────────────────────────────────────────────
  // release contains features and bugs (GitHub milestone→issue import).
  release: ['changelog', 'feature', 'bug'],
  content_strategy: ['content_calendar', 'content_theme'],
  content_calendar: [
    'content_theme', 'content_piece', 'knowledge_base_article', 'brand_asset',
    'document', 'documentation_template',
  ],

  // ── Operations & CS hierarchy ────────────────────────────────────────────────
  service_blueprint: [
    'user_flow', 'playbook', 'service_level_agreement', 'customer_health_score',
    'support_ticket', 'customer_feedback',
  ],
  customer_health_score: ['nps_campaign', 'success_milestone'],
  customer_feedback: ['churn_reason'],
  user_flow: ['screen', 'customer_journey_stage'],
  customer_journey_stage: ['touchpoint'],

  // ── Legal, Compliance & Risk hierarchy ──────────────────────────────────────
  legal_entity: ['ip_asset', 'contract'],
  contract: ['contract_clause'],
  compliance_framework: [
    'security_audit', 'compliance_requirement', 'privacy_policy',
    'audit_log_policy', 'risk', 'data_contract', 'legal_entity',
  ],

  // ── DevOps & Platform hierarchy ──────────────────────────────────────────────
  infrastructure_component: [
    'service_level_objective', 'monitor', 'ci_pipeline', 'incident',
    'runbook', 'release_strategy', 'on_call_rotation',
  ],
  service_level_objective: ['service_level_indicator', 'error_budget'],
  incident: ['postmortem'],
  monitor: ['alert_rule'],
  ci_pipeline: ['build_artifact'],

  // ── Security hierarchy ───────────────────────────────────────────────────────
  security_policy: [
    'security_control', 'access_policy', 'data_classification', 'threat_model',
    'security_review', 'incident',
  ],
  security_review: ['penetration_test'],
  threat_model: ['threat', 'vulnerability'],

  // ── Sales & Revenue hierarchy ────────────────────────────────────────────────
  pipeline_sales: ['pipeline_stage', 'lead', 'account', 'forecast', 'subscription'],
  account: ['contact', 'deal'],
  deal: ['quote_document'],
  subscription: ['invoice'],

  // ── Program Management hierarchy ─────────────────────────────────────────────
  program: ['project', 'risk_register', 'change_request', 'resource_allocation', 'status_report'],
  project: ['milestone', 'deliverable'],
  risk_register: ['risk'],

  // ── Accessibility hierarchy ──────────────────────────────────────────────────
  a11y_standard: ['a11y_guideline', 'a11y_audit', 'a11y_annotation'],
  a11y_audit: ['a11y_issue'],

  // ── Product Specification expansion ─────────────────────────────────────────
  roadmap: ['roadmap_item', 'roadmap_theme', 'release'],
  roadmap_theme: ['feature'],

  // ── Unified Context Layer hierarchy ─────────────────────────────────────────
  design_system: [
    'design_component', 'design_token', 'design_guideline', 'brand_identity',
    'user_journey', 'user_flow', 'insight',
  ],
  screen: ['screen_state', 'screen', 'design_component', 'wireframe'], // self-nesting + components + wireframes

  // ── Marketing & Communications hierarchy ────────────────────────────────────
  marketing_strategy: [
    'marketing_channel', 'seo_keyword', 'press_release', 'event',
    'community_initiative',
  ],
  marketing_channel: ['marketing_campaign_plan'],
  marketing_campaign_plan: ['email_sequence', 'social_post', 'ad_creative'],

  // ── Localisation & i18n hierarchy ───────────────────────────────────────────
  locale: ['translation_bundle', 'cultural_adaptation', 'regional_pricing', 'locale_config'],
  translation_bundle: ['translation_key'],

  // ── Customer Education & Training hierarchy ──────────────────────────────────
  education_program: [
    'tutorial', 'walkthrough', 'webinar', 'certification', 'help_video',
    'learning_path',
  ],
  // a learning_path can include its terminal certification.
  learning_path: ['tutorial', 'certification'],

  // ── Quality Assurance & Testing hierarchy ────────────────────────────────────
  // test_plan re-homed validation → QA. It is the QA planning layer:
  // the verification approach (scope, environments, pass criteria) that the
  // test suites execute. A test_plan groups the suites that carry it out.
  test_plan: ['test_suite', 'test_environment'],
  test_suite: [
    'test_case', 'regression_test', 'qa_session', 'test_coverage_report',
    'test_environment', 'test_result',
  ],
  test_case: ['test_result'],
  qa_session: ['bug'],

  // ── Partner & Ecosystem Management hierarchy ─────────────────────────────────
  partner_program: [
    'partner_tier', 'integration_partner', 'partner_revenue_share',
    'api_ecosystem', 'developer_portal',
  ],
  api_ecosystem: ['marketplace_listing'],

  // ── Feedback & Voice of Customer hierarchy ───────────────────────────────────
  feedback_program: [
    'feature_request', 'nps_campaign', 'feedback_theme', 'user_advisory_board',
    'beta_program',
  ],
  feature_request: ['feedback_vote'],
  // v0.5.8: CABs convene as quarterly ceremonies;
  // CAB owns its meeting cadence (Stettler, Moore CAB playbook canon).
  // Pairs with `user_advisory_board_convenes_as_ceremony` in the edge
  // catalog. ceremony now has two valid hierarchy parents (team for sprint
  // ceremonies, user_advisory_board for CAB meetings).
  user_advisory_board: ['ceremony'],

  // ── Pricing & Packaging hierarchy ────────────────────────────────────────────
  pricing_strategy: [
    'experiment_plan', 'pricing_tier', 'discount_strategy', 'trial_config', 'paywall',
  ],

  // ── AI/ML Operations hierarchy ───────────────────────────────────────────────
  // The prompt abstraction is corrected: ai_model → prompt_template →
  // prompt_version (a model has templates; each template has versions). The
  // model no longer owns prompt_version directly.
  ai_model: [
    'prompt_template', 'eval_benchmark', 'ai_cost_tracker',
    'hallucination_report', 'ai_guardrail', 'model_comparison',
    'ai_experiment', 'ai_dataset', 'ai_trace',
  ],
  // prompt_template owns its prompt_versions the way a file owns its commits.
  prompt_template: ['prompt_version'],
  // v0.5.7: benchmarks define the metric set they measure
  // (HELM, MLPerf, BIG-bench all spec a metric list). metric already has many
  // hierarchy parents (outcome, objective, key_result, solution, data_source).
  eval_benchmark: ['eval_run', 'metric'],
  // ai_trace spawns child traces for sub-calls (tool calls, chained
  // prompts). Self-nesting enables call-tree representation.
  ai_trace: ['ai_trace'],

  // ── Agentic Workflows & Process hierarchy ────────────────────────────────────
  workflow_template: ['workflow_run', 'review_gate', 'agent_task'],
  workflow_run: ['workflow_artifact'],
  agent_definition: ['agent_session', 'agent_skill', 'agent_hook', 'workflow_template', 'agent_task'],
  // v0.5.8: review gates also vet research insights
  // (ResearchOps insight-review pattern). Pairs with `review_gate_vets_insight`
  // in the edge catalog. The gate now owns two child types: approval records
  // for workflow gates, insights for research-democratisation gates.
  review_gate: ['approval_record', 'insight'],

  // ── Investigation hierarchy ──────────────────────────────────────────────────
  investigation: ['symptom', 'root_cause'],
  root_cause: ['fix'],

  // ── Portfolio layer hierarchy ────────────────────────────────────────────────
  // organization → product_area is the org-axis anchor (who owns what);
  // organization → portfolio is the strategic-axis anchor (where you invest).
  organization: ['portfolio', 'product_area'],
  // portfolios can nest (multi-level investment structures).
  portfolio: ['product', 'portfolio'],
  // product_area is the organisational container for products and can
  // nest (parent → sub-area). product_area also groups features; the
  // "Studio area owns 6 features" mental model.
  product_area: ['product', 'product_area', 'feature'],
} as const

/**
 * Returns the list of valid child entity types for the given parent type.
 * Returns an empty array for any type not present in the hierarchy.
 *
 * @example
 * getValidChildren('persona')
 * // → ['job', 'need', 'switching_cost', 'desired_outcome']
 *
 * @example
 * getValidChildren('unknown_type')
 * // → []
 */
export function getValidChildren(entityType: string): readonly string[] {
  return UPG_VALID_CHILDREN[entityType] ?? []
}

/**
 * Returns `true` if `childType` is a permitted direct child of `parentType`
 * according to the UPG hierarchy.
 *
 * @example
 * canBeChildOf('job', 'persona')        // → true
 * canBeChildOf('persona', 'product')    // → true
 * canBeChildOf('product', 'persona')    // → false (reversed hierarchy)
 */
export function canBeChildOf(childType: string, parentType: string): boolean {
  return getValidChildren(parentType).includes(childType)
}

/**
 * Containment-free entity types: types that exist in the graph but are
 * *referenced* by other nodes (via edges) rather than *contained* by
 * structural parents. They appear in no `UPG_VALID_CHILDREN` list and
 * have no hierarchy edges into them.
 *
 * This is parallel to `UPG_LIFECYCLE_FREE_TYPES` in `grammar/lifecycles.ts`:
 * both describe what a type *does not have*. Lifecycle-free types lack a
 * status progression; containment-free types lack a structural parent.
 * A type may be one, both, or neither: `person` is both; `theme` is
 * lifecycle-free but structurally contained; `feature` is neither.
 *
 * The G2b hierarchy audit treats absence from `UPG_VALID_CHILDREN` as a
 * defect *unless* the type is in this set. Use this category for types
 * that are orthogonal to product structure: identities, references,
 * cross-cutting concerns that any node might point at.
 *
 * `person` is the first explicit member of the set. Additional candidates
 * (`theme`, `glossary_term`, `learning`, `insight`, `risk`,
 * `classification_value`) will be audited and added one at a time with
 * deliberate justification rather than retrofitted in bulk.
 *
 * @example
 * isContainmentFreeType('person')   // → true
 * isContainmentFreeType('feature')  // → false (nested under product)
 * isContainmentFreeType('roadmap_theme')  // → false (not yet ratified into the set)
 */
export const UPG_CONTAINMENT_FREE_TYPES: ReadonlySet<string> = new Set<string>([
  'person',
  // A framework_exercise has no structural parent: it anchors to the entities
  // it scores via the `framework_exercise_includes_node` edge, not by
  // containment. Modelling it as a product child would force a containment edge
  // and read against the whole point of the exercise model (relational, not
  // hierarchical). Same posture as `person`. See ADR 2026-06-02-framework-exercises.
  'framework_exercise',
])

/**
 * Returns `true` if `entityType` is containment-free, i.e. it deliberately
 * has no structural parent in `UPG_VALID_CHILDREN`. See
 * `UPG_CONTAINMENT_FREE_TYPES` for the rationale and roster.
 */
export function isContainmentFreeType(entityType: string): boolean {
  return UPG_CONTAINMENT_FREE_TYPES.has(entityType)
}
