/**
 * UPG Domain Usage Guides: operational knowledge for MCP agents.
 *
 * Each guide gives a domain's anchor entity, creation sequence, named
 * patterns (entity + edge chains), required cross-domain bridges, and
 * common mistakes. Surfaced via `get_entity_schema` and `get_product_context`.
 */

import type { UPGEntityType } from '../catalog/entity-catalog.js'
import type { UPGEdgeType } from '../shapes/edges.js'
import type { UPGDomainId } from '../registry/domains.js'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UPGDomainPattern {
  /** Human-readable pattern name (no jargon, spell out acronyms) */
  name: string
  /** What this pattern accomplishes */
  description: string
  /** Entity types involved */
  entity_types: UPGEntityType[]
  /** Edge chain that connects them (in creation order) */
  edge_chain: UPGEdgeType[]
}

export interface UPGDomainBridge {
  /** The edge type that crosses domain boundaries */
  edge_type: UPGEdgeType
  /** The target domain this edge connects to */
  target_domain: UPGDomainId
  /** When this bridge should be created */
  when: string
}

/**
 * A common mistake agents make in a domain. Structured so MCP
 * consumers can proactively surface violations (e.g. "you created a feature
 * without a persona, that's an anti-pattern") instead of only rendering
 * prose. Migrated from `anti_patterns: string[]`; existing copy lives in
 * `description`, and `name` / `affected_entity` / `remediation` are
 * optional for backward migration but preferred for new entries.
 */
export interface UPGAntiPattern {
  /** Short title. Enables compact display and cross-guide search. */
  name?: string
  /** The anti-pattern itself: prose explanation of the mistake. */
  description: string
  /** Which entity type is typically involved in this anti-pattern. */
  affected_entity?: UPGEntityType
  /** What the agent should do instead. */
  remediation?: string
}

export interface UPGDomainUsageGuide {
  /** Domain ID this guide covers */
  domain_id: UPGDomainId
  /** The entity you create first. Everything else hangs from it. */
  anchor_entity: UPGEntityType
  /** Recommended creation sequence */
  creation_sequence: UPGEntityType[]
  /** Named patterns within this domain */
  patterns: UPGDomainPattern[]
  /** Cross-domain edges that should always be created */
  required_bridges: UPGDomainBridge[]
  /** Common mistakes agents make in this domain */
  anti_patterns: UPGAntiPattern[]
}

// ─── Ring 1: Understand ─────────────────────────────────────────────────────

const USER_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'user',
  anchor_entity: 'persona',
  creation_sequence: ['persona', 'job', 'need', 'desired_outcome', 'job_step', 'switching_cost'],
  patterns: [
    {
      name: 'Jobs to Be Done Tree',
      description: 'Each persona pursues jobs, which surface needs and motivate desired outcomes',
      entity_types: ['persona', 'job', 'need', 'desired_outcome'],
      edge_chain: ['persona_pursues_job', 'job_surfaces_need', 'job_motivates_desired_outcome'],
    },
  ],
  required_bridges: [
    // product → persona is the canonical anchor. Every persona
    // should attach to its product directly, not only via lateral
    // ICP / positioning intermediaries.
    { edge_type: 'product_targets_persona', target_domain: 'strategy', when: 'Every persona should attach directly to the product it targets' },
    { edge_type: 'persona_experiences_user_journey', target_domain: 'ux_design', when: 'Every persona should have at least one journey mapped' },
    { edge_type: 'opportunity_addresses_need', target_domain: 'discovery', when: 'Validated needs should feed into opportunity discovery' },
  ],
  anti_patterns: [
    { description: 'Creating features before personas: define who you are building for first' },
    { description: 'Personas without jobs: a persona without jobs to be done is a demographic profile, not actionable' },
    { description: 'Needs without valence: always specify pain, gap, or constraint' },
    // orphan personas attached only via ICP / positioning are a
    // structural smell (those are downstream uses, not the anchor).
    { description: 'Personas without a `product_targets_persona` edge: the persona is reachable laterally but not anchored to the product it serves' },
  ],
}

const USER_RESEARCH_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'user_research',
  anchor_entity: 'research_study',
  creation_sequence: ['research_study', 'research_question', 'interview_guide', 'participant', 'observation', 'quote', 'survey_response', 'affinity_cluster', 'insight'],
  patterns: [
    {
      name: 'Research to Insight Pipeline',
      description: 'Studies capture observations, observations cluster into themes, themes synthesise into insights',
      entity_types: ['research_study', 'observation', 'quote', 'affinity_cluster', 'insight'],
      edge_chain: ['research_study_captures_observation', 'observation_evidenced_by_quote', 'research_study_clusters_into_affinity_cluster', 'affinity_cluster_synthesises_insight'],
    },
  ],
  required_bridges: [
    { edge_type: 'insight_informs_opportunity', target_domain: 'discovery', when: 'Every actionable insight should feed an opportunity' },
    { edge_type: 'insight_characterises_persona', target_domain: 'user', when: 'Insights about user behaviour should enrich personas' },
    { edge_type: 'insight_validates_need', target_domain: 'user', when: 'Research evidence should validate or refute identified needs' },
  ],
  anti_patterns: [
    { description: 'Insights without evidence: every insight must trace back to observations and quotes' },
    { description: 'Orphan quotes: quotes should belong to observations, not float independently' },
    { description: 'Research studies without questions: always define what you want to learn before starting' },
  ],
}

const MARKET_INTELLIGENCE_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'market_intelligence',
  anchor_entity: 'competitive_analysis',
  creation_sequence: ['competitive_analysis', 'competitor', 'competitor_feature', 'market_trend', 'market_segment', 'classification_axis', 'classification_value'],
  patterns: [
    {
      name: 'Competitive Landscape Map',
      description: 'Analyses scope competitors, competitors offer features, features inspire or gap against yours',
      entity_types: ['competitive_analysis', 'competitor', 'competitor_feature'],
      edge_chain: ['competitive_analysis_analyses_competitor', 'competitor_offers_competitor_feature', 'competitor_feature_inspires_feature'],
    },
  ],
  required_bridges: [
    // product → competitive_analysis anchors the analysis to the
    // product whose market it scopes; mirrors `product_targets_persona`
    // for the user domain.
    { edge_type: 'product_contains_competitive_analysis', target_domain: 'strategy', when: 'Every competitive_analysis should attach directly to the product that contains it' },
    { edge_type: 'competitor_competes_for_persona', target_domain: 'user', when: 'Every competitor should link to the personas they compete for' },
    { edge_type: 'market_trend_creates_opportunity', target_domain: 'discovery', when: 'Trends that create new opportunities should be connected' },
    { edge_type: 'positioning_differentiates_from_competitor', target_domain: 'go_to_market', when: 'Positioning should reference specific competitors' },
  ],
  anti_patterns: [
    { description: 'Building without competitive context. Differentiation needs to know who else solves the problem.' },
    { description: 'Feature comparisons without parity status: always assess whether you are ahead, behind, or at parity' },
    { description: 'Stale competitive data: competitive intelligence decays quickly, track analysis dates' },
    // orphan competitive_analysis nodes, surfaced via chain validation.
    { description: 'Competitive analyses without a `product_contains_competitive_analysis` edge: the analysis floats in market_intelligence space without an anchor to which product contains it' },
  ],
}

const DISCOVERY_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'discovery',
  anchor_entity: 'opportunity',
  creation_sequence: ['opportunity', 'solution', 'feasibility_study', 'design_sprint'],
  patterns: [
    {
      name: 'Opportunity Solution Tree',
      description: 'Outcomes reveal opportunities, opportunities drive solutions, solutions propose hypotheses',
      entity_types: ['outcome', 'opportunity', 'solution', 'hypothesis'],
      edge_chain: ['outcome_reveals_opportunity', 'opportunity_drives_solution', 'solution_proposes_hypothesis'],
    },
  ],
  required_bridges: [
    { edge_type: 'opportunity_addresses_need', target_domain: 'user', when: 'Every opportunity should address at least one user need' },
    { edge_type: 'solution_proposes_hypothesis', target_domain: 'validation', when: 'Solutions should be tested, not assumed to work' },
    { edge_type: 'insight_informs_opportunity', target_domain: 'user_research', when: 'Opportunities should be grounded in research insights' },
  ],
  anti_patterns: [
    { description: 'Solutions without opportunities: always articulate the problem before proposing solutions' },
    { description: 'Opportunities without needs: if no user feels the pain, the opportunity is imagined' },
    { description: 'Skipping validation. Test every solution before promoting it to a feature.' },
  ],
}

const VALIDATION_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'validation',
  anchor_entity: 'hypothesis',
  // creation_sequence covers every entity registered to the
  // `validation` domain along the canonical chain hypothesis → experiment_plan
  // → experiment → experiment_run. `experiment` is the canonical structured
  // test; experiment_run is its optional replication child. `test_plan`
  // re-homed to the QA/testing domain.
  creation_sequence: ['hypothesis', 'experiment_plan', 'experiment', 'experiment_run', 'evidence', 'learning', 'research_plan'],
  patterns: [
    {
      name: 'Hypothesis Testing Loop',
      description: 'A hypothesis requires a plan (the experiment design), the plan designs an experiment (the structured test), the experiment is executed as run(s) that produce evidence and learnings, and learnings update the hypothesis',
      entity_types: ['hypothesis', 'experiment_plan', 'experiment', 'experiment_run', 'evidence', 'learning'],
      edge_chain: ['hypothesis_requires_experiment_plan', 'experiment_plan_designs_experiment', 'experiment_executed_as_experiment_run', 'experiment_run_yields_evidence', 'experiment_run_produces_learning', 'learning_updates_hypothesis'],
    },
  ],
  required_bridges: [
    { edge_type: 'assumption_becomes_hypothesis', target_domain: 'strategy', when: 'Strategic assumptions should be formalised as testable hypotheses' },
    { edge_type: 'learning_validates_opportunity', target_domain: 'discovery', when: 'Experiment results should validate or invalidate the opportunity' },
    { edge_type: 'learning_informs_feature', target_domain: 'product_spec', when: 'Validated learnings should inform what gets built' },
  ],
  anti_patterns: [
    { description: 'Hypotheses without experiments. An untested hypothesis is an opinion.' },
    { description: 'Experiments without success criteria: define what would change your mind before running the test' },
    { description: 'Building features from unvalidated hypotheses: the most expensive way to learn you were wrong' },
  ],
}

const FEEDBACK_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'feedback',
  anchor_entity: 'feedback_program',
  creation_sequence: ['feedback_program', 'feature_request', 'feedback_vote', 'nps_campaign', 'feedback_theme', 'beta_program', 'user_advisory_board'],
  patterns: [
    {
      name: 'Voice of Customer Pipeline',
      description: 'Programs collect requests, requests accumulate votes, themes emerge from patterns across requests',
      entity_types: ['feedback_program', 'feature_request', 'feedback_vote', 'feedback_theme'],
      edge_chain: ['feedback_program_collects_feature_request', 'feature_request_voted_on_by_feedback_vote', 'feedback_program_identifies_feedback_theme'],
    },
  ],
  required_bridges: [
    { edge_type: 'feature_request_creates_opportunity', target_domain: 'discovery', when: 'High-demand requests should become discovery opportunities' },
    { edge_type: 'feedback_theme_validates_need', target_domain: 'user', when: 'Recurring themes validate that a user need is real' },
    { edge_type: 'nps_campaign_tracks_metric', target_domain: 'strategy', when: 'NPS scores should connect to the metrics they track' },
  ],
  anti_patterns: [
    { description: 'Building what the loudest customer asks for: weight by segment, revenue impact, and strategic alignment' },
    { description: 'Feature requests without provenance: always track where a request came from and who asked' },
    { description: 'Ignoring detractor feedback: negative NPS responses are the highest-signal input you have' },
  ],
}

// ─── Ring 2: Define ─────────────────────────────────────────────────────────

const STRATEGY_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'strategy',
  anchor_entity: 'outcome',
  // creation_sequence covers every entity registered to the `strategy`
  // domain (kept in sync with `UPG_DOMAINS.strategy.types` and
  // enforced by `creation-sequence-matches-registry.test.ts`). Trailing
  // entries are later additions appended in chronological-introduction
  // order. Placement reflects the order in which they would naturally be
  // authored after the canonical strategy spine.
  creation_sequence: ['product', 'vision', 'mission', 'outcome', 'objective', 'key_result', 'metric', 'metric_quality_assessment', 'strategic_theme', 'strategic_pillar', 'initiative', 'capability', 'value_stream', 'assumption', 'decision', 'constraint'],
  patterns: [
    {
      name: 'Strategic Cascade',
      description: 'Vision grounds mission, product pursues outcomes and targets objectives, objectives achieved through key results measured by metrics',
      entity_types: ['vision', 'mission', 'outcome', 'objective', 'key_result', 'metric'],
      edge_chain: ['product_guided_by_vision', 'product_fulfils_mission', 'vision_realised_through_mission', 'product_pursues_outcome', 'product_targets_objective', 'objective_achieved_through_key_result', 'outcome_measured_by_metric'],
    },
  ],
  required_bridges: [
    { edge_type: 'outcome_reveals_opportunity', target_domain: 'discovery', when: 'Outcomes should connect to the opportunities that deliver them' },
    { edge_type: 'outcome_delivered_by_feature', target_domain: 'product_spec', when: 'Strategic outcomes should decompose into shipped features' },
    { edge_type: 'assumption_becomes_hypothesis', target_domain: 'validation', when: 'Risky assumptions should become testable hypotheses' },
  ],
  anti_patterns: [
    { description: 'Outcomes without metrics. Measurement is the signal an outcome happened.' },
    { description: 'Objectives without key results: an objective without measurement is a wish' },
    { description: 'Too many strategic themes: focus beats breadth, aim for 2-4 active themes' },
  ],
}

const PRODUCT_SPEC_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'product_spec',
  anchor_entity: 'feature',
  // story_task removed (v0.4.0, collapsed into canonical `task`, see
  // UPG_MIGRATIONS['0.4.0']). theme + changelog appended (were
  // registered to product_spec but missing from the navigation order).
  // `changelog` lives here because it is a structural product-shipping
  // artefact; content domain references it only via cross-domain bridges.
  creation_sequence: ['feature_area', 'feature', 'epic', 'user_story', 'acceptance_criterion', 'task', 'bug', 'release', 'roadmap', 'roadmap_item', 'roadmap_theme', 'changelog'],
  patterns: [
    {
      name: 'Feature Decomposition',
      description: 'Features group into areas, decompose into epics, epics specify user stories (the templated promise), and tasks implement them as the engineering work',
      entity_types: ['feature_area', 'feature', 'epic', 'user_story', 'task'],
      edge_chain: ['feature_area_contains_feature', 'feature_decomposed_into_epic', 'epic_specified_by_user_story', 'task_implements_user_story'],
    },
  ],
  required_bridges: [
    { edge_type: 'feature_tests_hypothesis', target_domain: 'validation', when: 'Features should trace back to validated hypotheses' },
    { edge_type: 'outcome_delivered_by_feature', target_domain: 'strategy', when: 'Every feature should connect to a strategic outcome' },
    { edge_type: 'test_case_covers_user_story', target_domain: 'testing', when: 'User stories should have acceptance tests' },
  ],
  anti_patterns: [
    { description: 'Features without outcomes. Features serve strategic outcomes; the rest is waste.' },
    { description: 'Long-running epics. Split any epic that runs over a month.' },
    { description: 'Roadmap items without owners: every committed item needs a team' },
  ],
}

const UX_DESIGN_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'ux_design',
  anchor_entity: 'user_journey',
  // creation order follows containment: a journey_action is a child
  // of a journey_step, so the step must precede the action. The journey is the
  // anchor; phases are the band overlay; steps are the timeline; actions
  // decompose a step into service-blueprint rows.
  creation_sequence: ['user_journey', 'journey_phase', 'journey_step', 'journey_action', 'screen', 'screen_state', 'user_flow', 'wireframe', 'prototype', 'design_question', 'design_concept'],
  patterns: [
    {
      name: 'Journey to Screen Flow',
      description: 'Journeys map the experience, journey steps are shown on screens, prototypes simulate screens so the design can be tested',
      entity_types: ['user_journey', 'journey_step', 'screen', 'prototype'],
      edge_chain: ['persona_experiences_user_journey', 'user_journey_contains_journey_step', 'journey_step_shown_on_screen', 'prototype_simulates_screen'],
    },
  ],
  required_bridges: [
    { edge_type: 'persona_experiences_user_journey', target_domain: 'user', when: 'Every journey must be anchored to a persona' },
    { edge_type: 'prototype_tests_hypothesis', target_domain: 'validation', when: 'Prototypes should test design hypotheses before building' },
    { edge_type: 'screen_surfaces_feature', target_domain: 'product_spec', when: 'Screens should connect to the features they surface' },
  ],
  anti_patterns: [
    { description: 'Screens without journeys: isolated screens miss the experience context' },
    { description: 'Prototypes without testing: if nobody tests the prototype, it is just art' },
    { description: 'Design questions left open: exploration status should progress to resolved or parked' },
    { description: 'Touchpoints stuffed in the deprecated journey_step.touchpoint string. Touchpoints belong in one of two layers: journey_action is the in-product blueprint layer (the finest band of a journey_step), and the touchpoint entity is the cross-channel customer-success layer (touchpoint_occurs_in_journey_step). Pick the layer; do not duplicate the touch as a free-text string.' },
  ],
}

const DESIGN_SYSTEM_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'design_system',
  anchor_entity: 'design_system',
  creation_sequence: ['design_system', 'design_component', 'design_token', 'design_pattern', 'design_guideline', 'annotation', 'interaction_spec'],
  patterns: [
    {
      name: 'Token to Component Stack',
      description: 'Tokens define primitives, components compose tokens, components follow patterns, guidelines codify rules',
      entity_types: ['design_token', 'design_component', 'design_pattern', 'design_guideline'],
      edge_chain: ['design_system_defines_design_token', 'design_system_contains_design_component', 'design_component_follows_design_pattern'],
    },
  ],
  required_bridges: [
    { edge_type: 'screen_renders_design_component', target_domain: 'ux_design', when: 'Components should link to the screens that render them' },
    { edge_type: 'design_token_reflects_brand_colour', target_domain: 'brand', when: 'Tokens should trace back to brand definitions' },
  ],
  anti_patterns: [
    { description: 'Components without tokens: hard-coded values bypass the design system' },
    { description: 'Patterns without guidelines: document when and how to use each pattern' },
    { description: 'One-off components: if it is used once, it might not belong in the system' },
  ],
}

const BRAND_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'brand',
  anchor_entity: 'brand_identity',
  creation_sequence: ['brand_identity', 'brand_voice', 'brand_colour', 'brand_typography', 'brand_logo', 'brand_imagery', 'brand_asset'],
  patterns: [
    {
      name: 'Brand Identity System',
      description: 'Brand identity anchors all visual and verbal elements: voice, colour, type, logo, imagery',
      entity_types: ['brand_identity', 'brand_voice', 'brand_colour', 'brand_typography', 'brand_logo'],
      edge_chain: ['brand_identity_speaks_with_brand_voice', 'brand_identity_coloured_with_brand_colour', 'brand_identity_typeset_with_brand_typography', 'brand_identity_signed_with_brand_logo'],
    },
  ],
  required_bridges: [
    { edge_type: 'design_token_reflects_brand_colour', target_domain: 'design_system', when: 'Brand colours should be encoded as design tokens' },
    { edge_type: 'messaging_aligns_with_brand_voice', target_domain: 'go_to_market', when: 'GTM messaging should follow brand voice guidelines' },
  ],
  anti_patterns: [
    { description: 'Brand elements without the identity root: everything should hang from brand_identity' },
    { description: 'Orphan brand assets: every asset should link to the brand element it represents' },
    { description: 'Voice without examples: brand voice needs concrete dos and don\'ts' },
  ],
}

const LEGAL_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'legal',
  anchor_entity: 'contract',
  creation_sequence: ['contract', 'contract_clause', 'legal_entity', 'ip_asset', 'privacy_policy'],
  patterns: [
    {
      name: 'Contract Structure',
      description: 'Contracts contain clauses, legal entities are bound by contracts, legal entities protect intellectual property',
      entity_types: ['contract', 'contract_clause', 'legal_entity', 'ip_asset'],
      edge_chain: ['contract_contains_contract_clause', 'legal_entity_bound_by_contract', 'legal_entity_protects_ip_asset'],
    },
  ],
  required_bridges: [
    { edge_type: 'privacy_policy_governs_data_source', target_domain: 'data_analytics', when: 'Privacy policies should connect to the data they govern' },
    { edge_type: 'contract_governs_partnership', target_domain: 'business_model', when: 'Partnership contracts should link to the partnership entity' },
  ],
  anti_patterns: [
    { description: 'IP assets without ownership: every piece of IP must be assigned to a legal entity' },
    { description: 'Contracts without clauses: the detail lives in the clauses, not the contract description' },
    { description: 'Privacy policies without scope: specify which data sources and processing activities are covered' },
  ],
}

// ─── Ring 3: Build ──────────────────────────────────────────────────────────

const ENGINEERING_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'engineering',
  anchor_entity: 'service',
  // creation_sequence covers every entity registered to `engineering`
  // (kept in sync with `UPG_DOMAINS.engineering.types` and
  // enforced by `creation-sequence-matches-registry.test.ts`). The trailing
  // RCA quartet (`investigation`, `root_cause`, `symptom`, `fix`) was
  // anchored to engineering at v0.2.0 (entity_meta `ent_315 → ent_318`)
  // because the work product is structurally engineering (code fixes,
  // technical analysis). The devops domain guide intentionally references
  // these entities cross-domain in its "Incident Response Chain" pattern
  // and via the `required_bridges` declarations. Devops is the operator
  // surface; engineering owns the RCA artefacts. Earlier devops
  // creation_sequence entries (`root_cause`, `symptom`) were drift, not
  // ownership, and have been removed from there.
  creation_sequence: ['service', 'bounded_context', 'domain_event', 'api_contract', 'api_endpoint', 'database_schema', 'technical_debt_item', 'feature_flag', 'aggregate', 'domain_entity', 'value_object', 'command', 'read_model', 'queue_topic', 'build_artifact', 'code_repository', 'library_dependency', 'integration_pattern', 'external_api', 'data_flow', 'deployment', 'investigation', 'root_cause', 'symptom', 'fix'],
  patterns: [
    {
      name: 'Domain-Driven Service Map',
      description: 'Bounded contexts deploy services, contexts emit domain events, services publish to queue topics',
      entity_types: ['bounded_context', 'service', 'domain_event', 'queue_topic'],
      edge_chain: ['bounded_context_deploys_service', 'bounded_context_emits_domain_event', 'service_publishes_to_queue_topic'],
    },
    {
      name: 'API Contract Chain',
      description: 'Services expose API contracts, contracts contain their endpoints, endpoints serve features',
      entity_types: ['service', 'api_contract', 'api_endpoint', 'feature'],
      edge_chain: ['service_exposes_api_contract', 'api_contract_contains_api_endpoint', 'api_endpoint_serves_feature'],
    },
  ],
  required_bridges: [
    { edge_type: 'service_powers_feature', target_domain: 'product_spec', when: 'Every service should link to the features it powers' },
    { edge_type: 'monitor_watches_service', target_domain: 'devops', when: 'Production services should have monitoring connected' },
    { edge_type: 'technical_debt_item_blocks_feature', target_domain: 'product_spec', when: 'Tech debt that blocks delivery should be visible to product' },
  ],
  anti_patterns: [
    { description: 'Services without bounded contexts: every service should own a clear domain boundary' },
    { description: 'API contracts without versioning: always track contract status (draft, published, deprecated)' },
    { description: 'Technical debt without severity: prioritise debt by impact on velocity and reliability' },
  ],
}

const DEVOPS_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'devops',
  anchor_entity: 'monitor',
  // creation_sequence covers every entity registered to `devops`
  //. Previous drift removed: `deployment`, `root_cause`,
  // `symptom` belong to the engineering domain per the registry; they
  // remain referenced from the "Incident Response Chain" pattern below as
  // intentional cross-domain hops (the operator surface walks into
  // engineering for the RCA tail). SLI/SLO/CI-pipeline now appear in the
  // sequence (they were registered but unsurfaced).
  creation_sequence: ['monitor', 'alert_rule', 'incident', 'postmortem', 'service_level_indicator', 'service_level_objective', 'runbook', 'error_budget', 'on_call_rotation', 'infrastructure_component', 'ci_pipeline', 'release_strategy'],
  patterns: [
    {
      name: 'Incident Response Chain',
      description: 'Monitors detect symptoms, symptoms trigger incidents, incidents are analysed in postmortems, postmortems identify root causes and produce runbook updates',
      entity_types: ['monitor', 'symptom', 'incident', 'postmortem', 'root_cause', 'runbook'],
      edge_chain: ['monitor_detects_symptom', 'symptom_triggers_incident', 'incident_analysed_in_postmortem', 'postmortem_identifies_root_cause', 'postmortem_produces_runbook'],
    },
  ],
  required_bridges: [
    { edge_type: 'product_ships_via_release', target_domain: 'product_spec', when: 'Deployments should link through the product to the release they ship' },
    { edge_type: 'monitor_watches_service', target_domain: 'engineering', when: 'Incidents connect to services through the monitors that watch them' },
    { edge_type: 'root_cause_manifests_as_technical_debt_item', target_domain: 'engineering', when: 'Systemic root causes should become tech debt items' },
  ],
  anti_patterns: [
    { description: 'Incidents without postmortems: every significant incident should produce learnings' },
    { description: 'Monitors without alert rules. A monitor that does not alert is logging.' },
    { description: 'Runbooks without triggers: define when each runbook should be activated' },
  ],
}

const TESTING_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'testing',
  anchor_entity: 'test_suite',
  // test_plan re-homed validation → QA: the verification-approach
  // plan that the suites execute. Listed first as the QA planning layer.
  creation_sequence: ['test_plan', 'test_suite', 'test_case', 'qa_session', 'regression_test', 'test_coverage_report', 'test_environment', 'test_result'],
  patterns: [
    {
      name: 'Test Pyramid',
      description: 'Suites contain cases, cases validate acceptance criteria and cover user stories, suites are measured by coverage reports',
      entity_types: ['test_suite', 'test_case', 'acceptance_criterion', 'test_coverage_report'],
      edge_chain: ['test_suite_contains_test_case', 'test_case_validates_acceptance_criterion', 'test_suite_measured_by_test_coverage_report'],
    },
  ],
  required_bridges: [
    { edge_type: 'test_case_covers_user_story', target_domain: 'product_spec', when: 'Test cases should trace back to user stories (which in turn trace to features via epics)' },
    { edge_type: 'test_case_validates_acceptance_criterion', target_domain: 'product_spec', when: 'Acceptance criteria define what "done" means and must be validated by tests' },
  ],
  anti_patterns: [
    { description: 'Tests without traceability: every test should link to a requirement or story' },
    { description: 'Test environments without status: track whether environments are available or in use' },
    { description: 'QA sessions without findings: document what was explored and what was found' },
  ],
}

const SECURITY_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'security',
  anchor_entity: 'threat_model',
  creation_sequence: ['threat_model', 'threat', 'vulnerability', 'security_control', 'security_policy', 'penetration_test', 'security_review', 'data_classification', 'access_policy'],
  patterns: [
    {
      name: 'Threat to Control Chain',
      description: 'Threat models identify threats, controls mitigate threats, penetration tests assess the services those controls protect',
      entity_types: ['threat_model', 'threat', 'security_control', 'penetration_test'],
      edge_chain: ['threat_model_identifies_threat', 'security_control_mitigates_threat', 'security_control_protects_service', 'penetration_test_assesses_service'],
    },
  ],
  required_bridges: [
    { edge_type: 'penetration_test_assesses_service', target_domain: 'engineering', when: 'Every critical service should be assessed by a penetration test' },
    { edge_type: 'security_policy_defines_access_policy', target_domain: 'compliance', when: 'Security policies should define the access policies they enforce' },
  ],
  anti_patterns: [
    { description: 'Threats without controls: every identified threat needs a mitigation plan' },
    { description: 'Controls without testing: untested controls may not work when needed' },
    { description: 'Threat models that go stale: review when the system architecture changes' },
  ],
}

const ACCESSIBILITY_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'accessibility',
  anchor_entity: 'a11y_audit',
  creation_sequence: ['a11y_standard', 'a11y_guideline', 'a11y_audit', 'a11y_issue', 'a11y_annotation'],
  patterns: [
    {
      name: 'Audit to Resolution',
      description: 'Standards contain guidelines, standards are verified by audits, audits discover issues and carry annotations back to design',
      entity_types: ['a11y_standard', 'a11y_guideline', 'a11y_audit', 'a11y_issue', 'a11y_annotation'],
      edge_chain: ['a11y_standard_contains_a11y_guideline', 'a11y_standard_verified_by_a11y_audit', 'a11y_audit_discovers_a11y_issue', 'a11y_standard_annotated_with_a11y_annotation'],
    },
  ],
  required_bridges: [
    { edge_type: 'a11y_issue_affects_design_component', target_domain: 'design_system', when: 'Accessibility issues should link to the design components they affect (which in turn render in screens)' },
  ],
  anti_patterns: [
    { description: 'Audits without standards: specify which WCAG level you are auditing against' },
    { description: 'Issues without severity: not all violations are equal, prioritise by impact' },
    { description: 'Accessibility as an afterthought: annotate designs before building, not after' },
  ],
}

const DATA_ANALYTICS_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'data_analytics',
  anchor_entity: 'data_source',
  creation_sequence: ['data_source', 'event_schema', 'data_pipeline', 'data_model', 'data_quality_rule', 'data_product', 'data_lineage', 'data_domain', 'glossary_term', 'dashboard', 'report'],
  patterns: [
    {
      name: 'Data Pipeline Flow',
      description: 'Sources feed pipelines, pipelines feed data products, data domains model entities and surface them in dashboards',
      entity_types: ['data_source', 'data_pipeline', 'data_product', 'data_domain', 'data_model', 'dashboard'],
      edge_chain: ['data_pipeline_reads_from_data_source', 'data_pipeline_feeds_data_product', 'data_domain_modelled_in_data_model', 'data_domain_visualised_in_dashboard'],
    },
  ],
  required_bridges: [
    { edge_type: 'funnel_step_tracks_event_schema', target_domain: 'growth', when: 'Analytics events should link to the funnel steps they track (which trace back to features)' },
    { edge_type: 'dashboard_tracks_metric', target_domain: 'strategy', when: 'Dashboards should track the strategic metrics they display' },
  ],
  anti_patterns: [
    { description: 'Events without schemas: every tracked event needs a defined payload structure' },
    { description: 'Dashboards without audience: specify who needs this data and why' },
    { description: 'Data pipelines without quality rules: validate data at ingestion, not after analysis' },
  ],
}

const AI_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'ai',
  anchor_entity: 'ai_model',
  creation_sequence: ['ai_model', 'prompt_template', 'prompt_version', 'eval_benchmark', 'eval_run', 'ai_experiment', 'ai_dataset', 'ai_cost_tracker', 'ai_guardrail', 'hallucination_report', 'model_comparison', 'ai_trace'],
  patterns: [
    {
      name: 'Model Evaluation Loop',
      description: 'Models benchmarked against eval benchmarks, benchmarks executed as eval runs, models compared across runs',
      entity_types: ['ai_model', 'eval_benchmark', 'eval_run', 'model_comparison'],
      edge_chain: ['ai_model_benchmarked_by_eval_benchmark', 'eval_benchmark_executed_as_eval_run', 'ai_model_compared_in_model_comparison'],
    },
  ],
  required_bridges: [
    { edge_type: 'ai_dataset_sourced_from_data_source', target_domain: 'data_analytics', when: 'AI datasets should trace provenance to the data sources they draw from' },
    { edge_type: 'ai_guardrail_enforces_security_policy', target_domain: 'security', when: 'AI guardrails should map to the security policies that constrain them' },
  ],
  anti_patterns: [
    { description: 'Models without evaluation: always benchmark before deploying' },
    { description: 'Prompts without versioning: track prompt iterations like code versions' },
    { description: 'Cost tracking as an afterthought: monitor spend from day one' },
  ],
}

const AUTOMATION_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'automation',
  anchor_entity: 'workflow_template',
  creation_sequence: ['workflow_template', 'workflow_run', 'agent_definition', 'agent_session', 'agent_skill', 'agent_hook', 'agent_task', 'review_gate', 'approval_record', 'workflow_artifact'],
  patterns: [
    {
      name: 'Agent Workflow',
      description: 'Agents orchestrate workflow templates, templates execute as runs, templates are gated by review gates for quality',
      entity_types: ['agent_definition', 'workflow_template', 'workflow_run', 'review_gate'],
      edge_chain: ['agent_definition_orchestrates_workflow_template', 'workflow_template_executed_as_workflow_run', 'workflow_template_gated_by_review_gate'],
    },
  ],
  required_bridges: [
    { edge_type: 'agent_skill_extends_feature', target_domain: 'product_spec', when: 'Agent capabilities should map to product features they extend' },
    { edge_type: 'review_gate_approved_via_approval_record', target_domain: 'program_mgmt', when: 'Quality gates should connect to approval workflows' },
  ],
  anti_patterns: [
    { description: 'Agents without skills: define what each agent can do explicitly' },
    { description: 'Workflows without gates: autonomous processes need human checkpoints' },
    { description: 'Sessions without outcomes: track what each agent run accomplished' },
  ],
}

// ─── Ring 4: Grow ───────────────────────────────────────────────────────────

const BUSINESS_MODEL_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'business_model',
  anchor_entity: 'business_model',
  creation_sequence: ['business_model', 'value_proposition', 'revenue_stream', 'cost_structure', 'unit_economics', 'partnership', 'key_resource', 'key_activity', 'customer_relationship', 'distribution_channel'],
  patterns: [
    {
      name: 'Business Model Canvas',
      description: 'The nine building blocks: value proposition, segments, channels, relationships, revenue, resources, activities, partners, costs',
      entity_types: ['business_model', 'value_proposition', 'revenue_stream', 'cost_structure'],
      edge_chain: ['product_monetised_via_business_model', 'business_model_delivers_value_proposition', 'business_model_earns_via_revenue_stream', 'business_model_costs_via_cost_structure'],
    },
  ],
  required_bridges: [
    { edge_type: 'value_proposition_targets_persona', target_domain: 'user', when: 'Every value proposition should target specific personas' },
    { edge_type: 'revenue_stream_tiered_as_pricing_tier', target_domain: 'pricing', when: 'Revenue streams should connect to pricing tiers' },
    { edge_type: 'business_model_targets_market_segment', target_domain: 'market_intelligence', when: 'The business model should specify which market segments it serves' },
  ],
  anti_patterns: [
    { description: 'Business models without unit economics: know your LTV/CAC ratio' },
    { description: 'Value propositions without persona links: who specifically benefits?' },
    { description: 'Revenue streams without pricing: how does the money actually flow?' },
  ],
}

const GROWTH_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'growth',
  anchor_entity: 'funnel',
  creation_sequence: ['funnel', 'funnel_step', 'acquisition_channel', 'growth_campaign', 'cohort', 'behavioral_segment', 'growth_loop', 'variant', 'attribution_model'],
  patterns: [
    {
      name: 'Pirate Metrics Funnel',
      description: 'Product measures funnels, funnels contain steps, acquisition channels run campaigns that reach segments, cohorts track retention through experiments',
      entity_types: ['funnel', 'funnel_step', 'acquisition_channel', 'growth_campaign', 'cohort'],
      edge_chain: ['product_measures_funnel', 'funnel_contains_funnel_step', 'acquisition_channel_runs_growth_campaign', 'cohort_exposed_to_experiment_run'],
    },
  ],
  required_bridges: [
    { edge_type: 'funnel_step_maps_to_journey_step', target_domain: 'ux_design', when: 'Funnel steps should map to user journey touchpoints' },
    { edge_type: 'growth_campaign_targets_behavioral_segment', target_domain: 'user', when: 'Campaigns should target specific user segments' },
    { edge_type: 'acquisition_channel_drives_outcome', target_domain: 'strategy', when: 'Channels should connect to the strategic outcomes they drive' },
  ],
  anti_patterns: [
    { description: 'Funnels without steps: define the stages users pass through' },
    { description: 'Growth without retention: acquiring users who churn is expensive waste' },
    { description: 'Campaigns without attribution. Attribution is what makes optimisation possible.' },
  ],
}

const GTM_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'go_to_market',
  anchor_entity: 'gtm_strategy',
  creation_sequence: ['gtm_strategy', 'ideal_customer_profile', 'positioning', 'messaging', 'launch', 'content_strategy', 'sales_motion', 'competitive_battle_card', 'demand_gen_program', 'territory', 'objection', 'rebuttal', 'proof_point'],
  patterns: [
    {
      name: 'Positioning Cascade',
      description: 'Strategy defines positioning, positioning spawns messaging variants, messaging addresses objections with rebuttals backed by proof points',
      entity_types: ['positioning', 'messaging', 'objection', 'rebuttal', 'proof_point'],
      edge_chain: ['gtm_strategy_positions_via_positioning', 'positioning_communicated_via_messaging', 'positioning_challenged_by_objection', 'objection_countered_by_rebuttal', 'rebuttal_evidenced_by_proof_point'],
    },
  ],
  required_bridges: [
    { edge_type: 'positioning_differentiates_via_value_proposition', target_domain: 'business_model', when: 'Positioning should reference your value propositions' },
    { edge_type: 'positioning_differentiates_from_competitor', target_domain: 'market_intelligence', when: 'Positioning should explicitly differentiate from competitors' },
    { edge_type: 'ideal_customer_profile_maps_to_persona', target_domain: 'user', when: 'ICP should link to the personas it represents' },
  ],
  anti_patterns: [
    { description: 'Positioning without competitors. Differentiation requires a comparison frame.' },
    { description: 'Messaging without channel variants. Each channel needs its own variant.' },
    { description: 'Objections without rebuttals: if you know the objection, prepare the answer' },
  ],
}

const PRICING_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'pricing',
  anchor_entity: 'pricing_strategy',
  creation_sequence: ['pricing_strategy', 'pricing_tier', 'discount_strategy', 'trial_config', 'paywall'],
  patterns: [
    {
      name: 'Pricing Tier Structure',
      description: 'Strategy offers tiers, tiers include features, tiers gated by paywalls, tiers trialed via trial configs',
      entity_types: ['pricing_strategy', 'pricing_tier', 'paywall', 'trial_config'],
      edge_chain: ['pricing_strategy_offers_pricing_tier', 'pricing_tier_includes_feature', 'pricing_tier_gated_by_paywall', 'pricing_tier_trialed_via_trial_config'],
    },
  ],
  required_bridges: [
    { edge_type: 'pricing_tier_includes_feature', target_domain: 'product_spec', when: 'Every tier should specify which features it includes' },
    { edge_type: 'pricing_tier_targets_behavioral_segment', target_domain: 'growth', when: 'Tiers should map to user segments (free users, power users, teams)' },
  ],
  anti_patterns: [
    { description: 'Pricing without tiers: even a single price point is a tier' },
    { description: 'Tiers without feature differentiation: users need to understand what they get at each level' },
    { description: 'Trials without conversion tracking: measure how many trial users convert to paid' },
  ],
}

const SALES_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'sales',
  anchor_entity: 'pipeline_sales',
  creation_sequence: ['pipeline_sales', 'pipeline_stage', 'lead', 'deal', 'account', 'contact', 'quote_document', 'subscription', 'invoice', 'forecast'],
  patterns: [
    {
      name: 'Sales Pipeline',
      description: 'Pipelines qualify leads, leads become accounts, accounts negotiate deals that progress through pipeline stages and convert to subscriptions',
      entity_types: ['pipeline_sales', 'lead', 'account', 'deal', 'pipeline_stage', 'subscription'],
      edge_chain: ['pipeline_sales_qualifies_lead', 'lead_becomes_account', 'account_negotiates_deal', 'deal_at_pipeline_stage', 'pipeline_sales_converts_to_subscription'],
    },
  ],
  required_bridges: [
    { edge_type: 'lead_sourced_from_acquisition_channel', target_domain: 'growth', when: 'Track where leads come from for attribution' },
    { edge_type: 'subscription_subscribes_to_pricing_tier', target_domain: 'pricing', when: 'Subscriptions should link to the tier purchased' },
    { edge_type: 'account_partners_via_partnership', target_domain: 'business_model', when: 'Partner accounts should link to the partnership entity' },
  ],
  anti_patterns: [
    { description: 'Deals without pipeline stages: every deal needs a current position in the pipeline' },
    { description: 'Leads without source attribution. Attribution drives channel optimisation.' },
    { description: 'Forecasts without probability: weight deals by likelihood to close' },
  ],
}

const MARKETING_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'marketing',
  anchor_entity: 'marketing_strategy',
  creation_sequence: ['marketing_strategy', 'marketing_channel', 'marketing_campaign_plan', 'email_sequence', 'social_post', 'ad_creative', 'seo_keyword', 'press_release', 'event', 'community_initiative'],
  patterns: [
    {
      name: 'Campaign Execution Chain',
      description: 'Strategy activates channels, channels run campaigns, campaigns publish creative across formats',
      entity_types: ['marketing_strategy', 'marketing_channel', 'marketing_campaign_plan', 'ad_creative'],
      edge_chain: ['marketing_strategy_activates_marketing_channel', 'marketing_channel_runs_marketing_campaign_plan', 'marketing_campaign_plan_runs_ad_creative'],
    },
  ],
  required_bridges: [
    { edge_type: 'marketing_strategy_pursues_outcome', target_domain: 'strategy', when: 'Marketing strategy should connect to strategic outcomes' },
    { edge_type: 'marketing_channel_feeds_acquisition_channel', target_domain: 'growth', when: 'Marketing channels should feed growth acquisition channels' },
    { edge_type: 'marketing_campaign_plan_targets_behavioral_segment', target_domain: 'growth', when: 'Campaigns should target specific user segments' },
  ],
  anti_patterns: [
    { description: 'Campaigns without channels: every campaign runs on specific channels' },
    { description: 'Channels without budget: allocate and track spend per channel' },
    { description: 'Marketing without growth connection: marketing feeds the funnel, connect them' },
  ],
}

// ─── Ring 5: Operate ────────────────────────────────────────────────────────

const CUSTOMER_SUCCESS_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'customer_success',
  anchor_entity: 'customer_health_score',
  // `nps_campaign` previously appeared here but is registered to the
  // `feedback` domain. Customer success references NPS via cross-domain
  // bridges, not direct ownership.
  creation_sequence: ['customer_health_score', 'playbook', 'service_level_agreement', 'support_ticket', 'customer_feedback', 'churn_reason', 'customer_journey_stage', 'touchpoint', 'success_milestone', 'service_blueprint'],
  patterns: [
    {
      name: 'Health-Driven Playbook Activation',
      description: 'Health scores trigger playbooks that target customer journey stages, customer feedback reveals churn reasons that inform the next playbook',
      entity_types: ['customer_health_score', 'playbook', 'customer_journey_stage', 'customer_feedback', 'churn_reason'],
      edge_chain: ['playbook_triggered_by_customer_health_score', 'playbook_targets_customer_journey_stage', 'customer_feedback_reveals_churn_reason'],
    },
  ],
  required_bridges: [
    { edge_type: 'customer_health_score_composed_of_metric', target_domain: 'strategy', when: 'Health scores should be composed of measurable metrics' },
    { edge_type: 'service_level_agreement_measures_metric', target_domain: 'strategy', when: 'SLAs should connect to the metrics they measure' },
    { edge_type: 'customer_feedback_becomes_feature_request', target_domain: 'feedback', when: 'Feedback signals should flow into feature requests where they can be prioritised' },
  ],
  anti_patterns: [
    { description: 'Health scores without components: define which metrics compose the score' },
    { description: 'Playbooks without triggers: specify what conditions activate each playbook' },
    { description: 'Churn reasons without analysis: understand patterns, not just individual cases' },
    { description: 'Conflating the two journey models. customer_journey_stage models the post-sale AARRR lifecycle (a customer-success timeline; use stage_order to sequence stages); journey_phase models in-product experience phases of a single user_journey. They are different lenses, not duplicates. Likewise, the touchpoint entity is the cross-channel customer-success layer, distinct from the in-product journey_action.' },
  ],
}

const CONTENT_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'content',
  anchor_entity: 'content_piece',
  // `changelog` previously appeared here but is registered to the
  // `product_spec` domain (it is a release artefact). Content references
  // it only via cross-domain links; the canonical home is product_spec.
  //
  creation_sequence: ['content_piece', 'knowledge_base_article', 'document', 'content_calendar', 'content_theme', 'documentation_template'],
  patterns: [
    {
      name: 'Editorial Pipeline',
      description: 'Strategy is themed, calendars organise themes and schedule pieces, pieces support messaging',
      entity_types: ['content_strategy', 'content_theme', 'content_calendar', 'content_piece', 'messaging'],
      edge_chain: ['content_strategy_themed_by_content_theme', 'content_calendar_contains_content_theme', 'content_calendar_schedules_content_piece', 'content_piece_supports_messaging'],
    },
  ],
  required_bridges: [
    { edge_type: 'content_piece_supports_messaging', target_domain: 'go_to_market', when: 'Content should reinforce GTM messaging (which in turn ladders up to positioning)' },
    { edge_type: 'knowledge_base_article_documents_feature', target_domain: 'product_spec', when: 'Help articles should link to the features they explain' },
  ],
  anti_patterns: [
    { description: 'Content without themes. Authority compounds when content stays on theme.' },
    { description: 'Knowledge bases without feature links: help articles must stay current with the product' },
    { description: 'Documents without types: always classify the document purpose (RFC, guide, spec, etc.)' },
  ],
}

const EDUCATION_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'education',
  anchor_entity: 'education_program',
  creation_sequence: ['education_program', 'tutorial', 'walkthrough', 'webinar', 'certification', 'help_video', 'learning_path'],
  patterns: [
    {
      name: 'Learning Path',
      description: 'Programs structure via learning paths, paths contain tutorials and include certifications',
      entity_types: ['education_program', 'learning_path', 'tutorial', 'certification'],
      edge_chain: ['education_program_structures_via_learning_path', 'learning_path_contains_tutorial', 'learning_path_includes_certification'],
    },
  ],
  required_bridges: [
    { edge_type: 'education_program_targets_persona', target_domain: 'user', when: 'Programs should target specific user personas' },
    { edge_type: 'tutorial_explains_feature', target_domain: 'product_spec', when: 'Tutorials should link to the features they explain' },
  ],
  anti_patterns: [
    { description: 'Programs without audience: define who this education is for' },
    { description: 'Tutorials without the feature they teach: keep learning content connected to the product' },
    { description: 'Certifications without assessment: verify learning, do not just award badges' },
  ],
}

// ─── Ring 6: Extend ─────────────────────────────────────────────────────────

const TEAM_ORG_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'team_org',
  anchor_entity: 'team',
  creation_sequence: ['team', 'role', 'stakeholder', 'person', 'team_okr', 'retrospective', 'dependency', 'department', 'skill', 'ceremony', 'capacity_plan'],
  patterns: [
    {
      name: 'Team Structure',
      description: 'Teams are staffed with roles, target OKRs, reflect in retrospectives, and are blocked by dependencies',
      entity_types: ['team', 'role', 'team_okr', 'retrospective', 'dependency'],
      edge_chain: ['team_staffed_with_role', 'team_targets_team_okr', 'team_reflects_in_retrospective', 'dependency_blocks_team'],
    },
  ],
  required_bridges: [
    { edge_type: 'node_owned_by_team', target_domain: 'product_spec', when: 'Features and epics should have team ownership' },
    { edge_type: 'team_okr_aligns_with_objective', target_domain: 'strategy', when: 'Team OKRs should align with product-level objectives' },
  ],
  anti_patterns: [
    { description: 'Teams without OKRs: every team needs clear goals' },
    { description: 'Dependencies without both teams linked: a dependency must connect blocker and blocked' },
    { description: 'Retrospectives without action items: reflection without action is just venting' },
  ],
}

const PROGRAM_MGMT_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'program_mgmt',
  anchor_entity: 'program',
  creation_sequence: ['program', 'project', 'milestone', 'risk_register', 'change_request', 'deliverable', 'resource_allocation', 'status_report'],
  patterns: [
    {
      name: 'Program Execution',
      description: 'Programs contain projects, projects target milestones, milestones gate deliverables, programs are tracked via risk registers',
      entity_types: ['program', 'project', 'milestone', 'deliverable', 'risk_register'],
      edge_chain: ['program_contains_project', 'project_targets_milestone', 'milestone_gates_deliverable', 'program_tracked_via_risk_register'],
    },
  ],
  required_bridges: [
    { edge_type: 'program_implements_initiative', target_domain: 'strategy', when: 'Programs should implement strategic initiatives' },
    { edge_type: 'dependency_blocks_team', target_domain: 'team_org', when: 'Cross-team dependencies should be visible as blockers to the team that owns them' },
  ],
  anti_patterns: [
    { description: 'Programs without milestones: define checkpoints to measure progress' },
    { description: 'Risk registers without risk assessments: quantify likelihood and impact' },
    { description: 'Change requests without approval tracking: document who approved what and when' },
  ],
}

const LOCALISATION_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'localisation',
  anchor_entity: 'locale',
  creation_sequence: ['locale', 'translation_key', 'translation_bundle', 'locale_config', 'cultural_adaptation', 'regional_pricing'],
  patterns: [
    {
      name: 'Localisation Pipeline',
      description: 'Locales translated via translation bundles, bundles contain translation keys',
      entity_types: ['locale', 'translation_key', 'translation_bundle'],
      edge_chain: ['locale_translated_via_translation_bundle', 'translation_bundle_contains_translation_key'],
    },
  ],
  required_bridges: [
    { edge_type: 'cultural_adaptation_targets_market_segment', target_domain: 'market_intelligence', when: 'Cultural adaptations should link to the markets they serve' },
    { edge_type: 'pricing_tier_localised_as_regional_pricing', target_domain: 'pricing', when: 'Pricing tiers should localise into regional pricing per market' },
  ],
  anti_patterns: [
    { description: 'Locales without translation bundles: a locale without strings is just a flag' },
    { description: 'Cultural adaptations without rationale: document why an adaptation is needed' },
    { description: 'Regional pricing without market research: price sensitivity varies by region' },
  ],
}

const ECOSYSTEM_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'ecosystem',
  anchor_entity: 'partner_program',
  creation_sequence: ['partner_program', 'partner_tier', 'api_ecosystem', 'marketplace_listing', 'developer_portal', 'integration_partner', 'partner_revenue_share'],
  patterns: [
    {
      name: 'Partner Ecosystem',
      description: 'Programs tier partners, tiers qualify integration partners, API ecosystems expose marketplace listings',
      entity_types: ['partner_program', 'partner_tier', 'integration_partner', 'api_ecosystem', 'marketplace_listing'],
      edge_chain: ['partner_program_tiers_as_partner_tier', 'partner_tier_qualifies_integration_partner', 'partner_program_exposes_api_ecosystem', 'api_ecosystem_lists_marketplace_listing'],
    },
  ],
  required_bridges: [
    { edge_type: 'integration_partner_connects_external_api', target_domain: 'engineering', when: 'Partner integrations connect to engineering through external APIs' },
    { edge_type: 'revenue_stream_tiered_as_pricing_tier', target_domain: 'pricing', when: 'Partner revenue streams should connect to pricing tiers' },
  ],
  anti_patterns: [
    { description: 'Partner programs without tiers: define what partners get at each level' },
    { description: 'Marketplace listings without review process: quality control matters' },
    { description: 'Developer portals without documentation: APIs need docs to drive adoption' },
  ],
}

const COMPLIANCE_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'compliance',
  anchor_entity: 'compliance_framework',
  creation_sequence: ['compliance_framework', 'compliance_requirement', 'risk', 'data_contract', 'security_audit', 'audit_log_policy'],
  patterns: [
    {
      name: 'Compliance Chain',
      description: 'Frameworks mandate requirements, frameworks are verified by security audits, frameworks identify risks that constrain what you can build',
      entity_types: ['compliance_framework', 'compliance_requirement', 'security_audit', 'risk'],
      edge_chain: ['compliance_framework_mandates_compliance_requirement', 'compliance_framework_verified_by_security_audit', 'compliance_framework_identifies_risk'],
    },
  ],
  required_bridges: [
    { edge_type: 'compliance_framework_requires_security_control', target_domain: 'security', when: 'Compliance requirements should map to security controls' },
    { edge_type: 'audit_log_policy_tracks_event_schema', target_domain: 'data_analytics', when: 'Audit policies should specify which events are logged' },
    { edge_type: 'data_contract_governs_data_source', target_domain: 'data_analytics', when: 'Data contracts should connect to the sources they govern' },
  ],
  anti_patterns: [
    { description: 'Compliance without a framework: always specify which standard you are working toward' },
    { description: 'Requirements without audit evidence: compliance claims need proof' },
    { description: 'Data contracts without both parties: a contract binds a provider and consumer' },
  ],
}

// ─── Nucleus ────────────────────────────────────────────────────────────────

const PORTFOLIO_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'portfolio',
  anchor_entity: 'organization',
  creation_sequence: ['organization', 'portfolio', 'product_area'],
  patterns: [
    {
      name: 'Portfolio Hierarchy',
      description: 'Organisation invests in portfolios, portfolios contain products, product areas organise ownership across the org',
      entity_types: ['organization', 'portfolio', 'product', 'product_area'],
      edge_chain: ['organization_invests_via_portfolio', 'portfolio_contains_product', 'organization_organised_into_product_area', 'product_area_contains_product'],
    },
  ],
  required_bridges: [
    { edge_type: 'product_area_contains_product', target_domain: 'strategy', when: 'Product areas should contain the products they manage' },
  ],
  anti_patterns: [
    { description: 'Products without a product area: every product should be classified' },
    { description: 'Portfolios without strategic alignment: portfolio decisions should reflect strategy' },
  ],
}

const WORKSPACE_GUIDE: UPGDomainUsageGuide = {
  domain_id: 'workspace',
  anchor_entity: 'workspace',
  creation_sequence: ['workspace', 'framework_exercise'],
  patterns: [],
  required_bridges: [],
  anti_patterns: [
    { description: 'Workspaces are containers for exploration: do not over-structure them' },
    { description: 'Workspace content is transient by default: promote discoveries to the graph, do not leave them in the workspace' },
  ],
}

// ─── Registry ───────────────────────────────────────────────────────────────

export const UPG_DOMAIN_GUIDES: readonly UPGDomainUsageGuide[] = [
  // Nucleus
  PORTFOLIO_GUIDE,
  WORKSPACE_GUIDE,
  // Ring 1: Understand
  USER_GUIDE,
  USER_RESEARCH_GUIDE,
  MARKET_INTELLIGENCE_GUIDE,
  DISCOVERY_GUIDE,
  VALIDATION_GUIDE,
  FEEDBACK_GUIDE,
  // Ring 2: Define
  STRATEGY_GUIDE,
  PRODUCT_SPEC_GUIDE,
  UX_DESIGN_GUIDE,
  DESIGN_SYSTEM_GUIDE,
  BRAND_GUIDE,
  LEGAL_GUIDE,
  // Ring 3: Build
  ENGINEERING_GUIDE,
  DEVOPS_GUIDE,
  TESTING_GUIDE,
  SECURITY_GUIDE,
  ACCESSIBILITY_GUIDE,
  DATA_ANALYTICS_GUIDE,
  AI_GUIDE,
  AUTOMATION_GUIDE,
  // Ring 4: Grow
  BUSINESS_MODEL_GUIDE,
  GROWTH_GUIDE,
  GTM_GUIDE,
  PRICING_GUIDE,
  SALES_GUIDE,
  MARKETING_GUIDE,
  // Ring 5: Operate
  CUSTOMER_SUCCESS_GUIDE,
  CONTENT_GUIDE,
  EDUCATION_GUIDE,
  // Ring 6: Extend
  TEAM_ORG_GUIDE,
  PROGRAM_MGMT_GUIDE,
  LOCALISATION_GUIDE,
  ECOSYSTEM_GUIDE,
  COMPLIANCE_GUIDE,
]

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Look up the usage guide for a domain.
 *
 * @example
 * const guide = getGuideForDomain('user')
 * // guide?.anchor_entity     === 'persona'
 * // guide?.creation_sequence === ['persona', 'job', 'need', ...]
 *
 * @example
 * getGuideForDomain('not_a_domain')   // → undefined
 */
export function getGuideForDomain(domainId: UPGDomainId | string): UPGDomainUsageGuide | undefined {
  return UPG_DOMAIN_GUIDES.find((g) => g.domain_id === domainId)
}

/**
 * Get the anchor entity for a domain (the entity you create first).
 *
 * @example
 * getAnchorEntity('user')                 // → 'persona'
 * getAnchorEntity('market_intelligence')  // → 'competitive_analysis'
 * getAnchorEntity('not_a_domain')         // → undefined
 */
export function getAnchorEntity(domainId: UPGDomainId | string): UPGEntityType | undefined {
  return getGuideForDomain(domainId)?.anchor_entity
}

/**
 * Get all anti-patterns across all domains, flattened and tagged by domain.
 *
 * @example
 * const all = getAntiPatterns()
 * // all[0].domain                   === 'user'
 * // all[0].anti_pattern.name        === 'persona_without_jobs' (example)
 * // all.length                      // one entry per anti-pattern across all guides
 */
export function getAntiPatterns(): Array<{ domain: UPGDomainId; anti_pattern: UPGAntiPattern }> {
  return UPG_DOMAIN_GUIDES.flatMap((g) =>
    g.anti_patterns.map((ap) => ({ domain: g.domain_id, anti_pattern: ap }))
  )
}
