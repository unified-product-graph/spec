/**
 * UPG Edge Catalog. Maps each canonical edge type to its verb pair and classification.
 * https://unifiedproductgraph.org/spec | MIT
 */

// ─── Polymorphic endpoint marker ────────────────────────────────────

/**
 * Wildcard sentinel for `source_type` / `target_type` on polymorphic edges.
 * Matches any node. Polymorphic edges must be registered in
 * `UPG_POLYMORPHIC_EDGE_KEYS`. See `src/ARCHITECTURE.md`, "Polymorphic Edges".
 */
export const UPG_WILDCARD_ENDPOINT = 'node' as const
export type UPGWildcardEndpoint = typeof UPG_WILDCARD_ENDPOINT

// ─── Edge definition shape ────────────────────────────────────────────────────

/**
 * The shape of a single canonical edge in `UPG_EDGE_CATALOG`.
 *
 * @example
 * const personaPursuesJob: UPGEdgeDefinition = {
 *   forward_verb: 'pursues',
 *   reverse_verb: 'pursued_by',
 *   classification: 'semantic',
 *   source_type: 'persona',
 *   target_type: 'job',
 * }
 */
export interface UPGEdgeDefinition {
  /** Active voice verb: "source [forward_verb] target". */
  forward_verb: string
  /** Reverse reading: "target [reverse_verb] source". */
  reverse_verb: string
  /** Structural classification of this edge */
  classification: 'hierarchy' | 'causal' | 'semantic' | 'cross-domain'
  /** Source entity type. `UPGEntityType` or `'node'` (polymorphic wildcard). */
  source_type: string
  /** Target entity type. `UPGEntityType` or `'node'` (polymorphic wildcard). */
  target_type: string
}

// ─── Registry ─────────────────────────────────────────────────────────────────

// `satisfies` preserves literal key types for downstream
// `UPGEdgeType = keyof typeof UPG_EDGE_CATALOG` while still enforcing shape.
export const UPG_EDGE_CATALOG = {

  // ── Part 1: Core Narrative Spine (Ring 1) ──────────────────────────────────

  // 1.1 User Domain
  // product → persona is the most fundamental relationship in the
  // user domain ("who is this product for?") and was the only way to
  // anchor a fresh persona to its product before this edge existed. Without
  // it, the natural agent path through `/upg-persona` produced an orphan
  // persona only attached laterally via `ideal_customer_profile_maps_to_persona`
  // or `positioning_resonates_with_persona`. Semantic, not hierarchy: a
  // product doesn't "contain" personas; it targets them.
  product_targets_persona: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'semantic', source_type: 'product', target_type: 'persona' },
  persona_pursues_job: { forward_verb: 'pursues', reverse_verb: 'pursued_by', classification: 'semantic', source_type: 'persona', target_type: 'job' },
  persona_experiences_need: { forward_verb: 'experiences', reverse_verb: 'experienced_by', classification: 'semantic', source_type: 'persona', target_type: 'need' },
  persona_aspires_to_desired_outcome: { forward_verb: 'aspires_to', reverse_verb: 'aspirational_for', classification: 'hierarchy', source_type: 'persona', target_type: 'desired_outcome' },
  persona_incurs_switching_cost: { forward_verb: 'incurs', reverse_verb: 'incurred_by', classification: 'hierarchy', source_type: 'persona', target_type: 'switching_cost' },
  job_surfaces_need: { forward_verb: 'surfaces', reverse_verb: 'surfaces_from', classification: 'causal', source_type: 'job', target_type: 'need' },
  job_motivates_desired_outcome: { forward_verb: 'motivates', reverse_verb: 'motivated_by', classification: 'causal', source_type: 'job', target_type: 'desired_outcome' },
  job_decomposes_into_job_step: { forward_verb: 'decomposes_into', reverse_verb: 'step_of', classification: 'hierarchy', source_type: 'job', target_type: 'job_step' },

  // 1.2 Discovery Domain
  outcome_reveals_opportunity: { forward_verb: 'reveals', reverse_verb: 'grounded_in', classification: 'causal', source_type: 'outcome', target_type: 'opportunity' },
  opportunity_drives_solution: { forward_verb: 'drives', reverse_verb: 'addresses', classification: 'causal', source_type: 'opportunity', target_type: 'solution' },
  opportunity_explores_via_design_concept: { forward_verb: 'explores_via', reverse_verb: 'explores', classification: 'hierarchy', source_type: 'opportunity', target_type: 'design_concept' },
  opportunity_assessed_by_feasibility_study: { forward_verb: 'assessed_by', reverse_verb: 'assesses', classification: 'hierarchy', source_type: 'opportunity', target_type: 'feasibility_study' },
  metric_assessed_by_metric_quality_assessment: { forward_verb: 'assessed_by', reverse_verb: 'assesses', classification: 'hierarchy', source_type: 'metric', target_type: 'metric_quality_assessment' },
  opportunity_investigated_via_design_sprint: { forward_verb: 'investigated_via', reverse_verb: 'investigates', classification: 'hierarchy', source_type: 'opportunity', target_type: 'design_sprint' },
  opportunity_addresses_need: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'opportunity', target_type: 'need' },
  opportunity_pursues_outcome: { forward_verb: 'pursues', reverse_verb: 'pursued_by', classification: 'cross-domain', source_type: 'opportunity', target_type: 'outcome' },
  opportunity_contextualises_job: { forward_verb: 'contextualises', reverse_verb: 'contextualised_by', classification: 'cross-domain', source_type: 'opportunity', target_type: 'job' },

  // 1.3 Validation Domain
  solution_proposes_hypothesis: { forward_verb: 'proposes', reverse_verb: 'tests', classification: 'causal', source_type: 'solution', target_type: 'hypothesis' },
  solution_materialises_as_prototype: { forward_verb: 'materialises_as', reverse_verb: 'materialises', classification: 'hierarchy', source_type: 'solution', target_type: 'prototype' },
  // v0.5.4: the explicit graduation moment in Teresa Torres' Solution
  // Tree: a solution that has been validated and committed to delivery becomes
  // a feature. UPG already has `opportunity_drives_solution` and
  // `solution_proposes_hypothesis`; this edge closes the chain to the feature.
  // `becomes` captures the state transition (exploration → delivery commitment),
  // distinct from the structural `capability_implemented_by_feature` (which
  // records how a capability is realised, not when a solution graduates).
  // `evolved_from` in the reverse lets a feature trace its solution ancestry.
  solution_becomes_feature: { forward_verb: 'becomes', reverse_verb: 'evolved_from', classification: 'causal', source_type: 'solution', target_type: 'feature' },
  hypothesis_requires_experiment_plan: { forward_verb: 'requires', reverse_verb: 'planned_for', classification: 'causal', source_type: 'hypothesis', target_type: 'experiment_plan' },
  hypothesis_planned_via_test_plan: { forward_verb: 'planned_via', reverse_verb: 'plans_for', classification: 'hierarchy', source_type: 'hypothesis', target_type: 'test_plan' },
  hypothesis_investigated_via_research_plan: { forward_verb: 'investigated_via', reverse_verb: 'investigates', classification: 'hierarchy', source_type: 'hypothesis', target_type: 'research_plan' },
  experiment_run_produces_learning: { forward_verb: 'produces', reverse_verb: 'learned_from', classification: 'causal', source_type: 'experiment_run', target_type: 'learning' },
  experiment_run_yields_evidence: { forward_verb: 'yields', reverse_verb: 'supports', classification: 'causal', source_type: 'experiment_run', target_type: 'evidence' },
  // (v0.2.7 closure) the legacy duplicate pair
  // `experiment_tested_via_experiment` (line 116) + `experiment_tests_experiment`
  // (line 862) is consolidated into a single canonical run-to-run edge.
  // Multi-armed iterations and replications now express as `tested_via` from
  // one experiment_run to another, preserving the semantic without the
  // ambiguity of two near-identical edges.
  experiment_run_tested_via_experiment_run: { forward_verb: 'tested_via', reverse_verb: 'tests_within', classification: 'hierarchy', source_type: 'experiment_run', target_type: 'experiment_run' },
  learning_updates_hypothesis: { forward_verb: 'updates', reverse_verb: 'updated_by', classification: 'causal', source_type: 'learning', target_type: 'hypothesis' },
  assumption_becomes_hypothesis: { forward_verb: 'becomes', reverse_verb: 'originated_as', classification: 'causal', source_type: 'assumption', target_type: 'hypothesis' },
  // experiment → experiment_plan + experiment_run.
  // Plan owns runs (`ran_as`); runs carry the validation/insight/decision
  // outcomes. v0.2.7 closes the split by retargeting the 18 legacy
  // experiment-edges to plan or run, dropping the `experiment_tests_hypothesis`
  // duplicate (superseded by `experiment_run_validates_hypothesis`), and
  // consolidating the self-edge pair. `validates` retargets from
  // `hypothesis` to `hypothesis_claim` in v0.2.8.
  experiment_plan_ran_as_experiment_run: { forward_verb: 'ran_as', reverse_verb: 'ran_for', classification: 'hierarchy', source_type: 'experiment_plan', target_type: 'experiment_run' },
  experiment_run_validates_hypothesis: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'causal', source_type: 'experiment_run', target_type: 'hypothesis' },
  // (v0.4.0) canonical evidence edge. Neutral direction; polarity
  // (supports/refutes/neutral) lives on evidence.direction. Replaces the
  // deprecated hypothesis_evidence_supports/refutes pair.
  hypothesis_has_evidence: { forward_verb: 'has_evidence', reverse_verb: 'evidences', classification: 'hierarchy', source_type: 'hypothesis', target_type: 'evidence' },
  // hypothesis_evidence_supports/refutes/derived_from edges removed at v0.4.0.
  // UPG_EDGE_MIGRATIONS['0.4.0'] carries 'drop' rules for old graphs.
  // New pattern: hypothesis_has_evidence + evidence.direction ('supports'|'refutes'|'neutral').
  experiment_run_produced_insight_insight: { forward_verb: 'produced_insight', reverse_verb: 'produced_from_run', classification: 'cross-domain', source_type: 'experiment_run', target_type: 'insight' },
  experiment_run_informed_decision_decision: { forward_verb: 'informed_decision', reverse_verb: 'informed_by_run', classification: 'cross-domain', source_type: 'experiment_run', target_type: 'decision' },
  // (v0.2.7) P14 fix: plan declares its target metric via a
  // canonical edge, not a foreign-key property (the v0.2.6 ExperimentPlan
  // interface left this slot pending in line with the principle).
  experiment_plan_targets_metric: { forward_verb: 'targets', reverse_verb: 'targeted_by_plan', classification: 'cross-domain', source_type: 'experiment_plan', target_type: 'metric' },
  experiment_has_plan:                    { forward_verb: 'has_plan',          reverse_verb: 'is_plan_for',      classification: 'hierarchy',  source_type: 'experiment',        target_type: 'experiment_plan' },
  experiment_executed_as_experiment_run:  { forward_verb: 'executed_as',       reverse_verb: 'execution_of',     classification: 'hierarchy',  source_type: 'experiment',        target_type: 'experiment_run' },
  experiment_produces_learning:           { forward_verb: 'produces',          reverse_verb: 'produced_by',      classification: 'causal',     source_type: 'experiment',        target_type: 'learning' },
  experiment_produces_evidence:           { forward_verb: 'produces',          reverse_verb: 'produced_by',      classification: 'causal',     source_type: 'experiment',        target_type: 'evidence' },

  // 1.4 User Research Domain
  product_contains_research_study: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'product', target_type: 'research_study' },
  research_study_enrolls_participant: { forward_verb: 'enrolls', reverse_verb: 'enrolled_in', classification: 'hierarchy', source_type: 'research_study', target_type: 'participant' },
  research_study_captures_observation: { forward_verb: 'captures', reverse_verb: 'captured_in', classification: 'hierarchy', source_type: 'research_study', target_type: 'observation' },
  research_study_clusters_into_affinity_cluster: { forward_verb: 'clusters_into', reverse_verb: 'clustered_from', classification: 'hierarchy', source_type: 'research_study', target_type: 'affinity_cluster' },
  research_study_produces_insight: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'hierarchy', source_type: 'research_study', target_type: 'insight' },
  research_study_investigates_research_question: { forward_verb: 'investigates', reverse_verb: 'investigated_by', classification: 'hierarchy', source_type: 'research_study', target_type: 'research_question' },
  research_study_follows_interview_guide: { forward_verb: 'follows', reverse_verb: 'guides', classification: 'hierarchy', source_type: 'research_study', target_type: 'interview_guide' },
  research_study_collects_survey_response: { forward_verb: 'collects', reverse_verb: 'collected_in', classification: 'hierarchy', source_type: 'research_study', target_type: 'survey_response' },
  observation_evidenced_by_quote: { forward_verb: 'evidenced_by', reverse_verb: 'evidences', classification: 'hierarchy', source_type: 'observation', target_type: 'quote' },
  affinity_cluster_synthesises_insight: { forward_verb: 'synthesises', reverse_verb: 'synthesised_from', classification: 'hierarchy', source_type: 'affinity_cluster', target_type: 'insight' },
  insight_informs_opportunity: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'insight', target_type: 'opportunity' },

  // 1.5 Market Intelligence Domain
  // product → competitive_analysis closes the parallel gap to
  // product → persona. competitive_analysis is the anchor of the
  // market_intelligence domain (per DomainUsageGuide), and a fresh analysis
  // had no canonical edge home; it was reachable only laterally via
  // `competitor_competes_for_persona` + `positioning_differentiates_from_competitor`.
  // Hierarchy: a competitive_analysis is owned by / contained in one product,
  // mirroring `product_contains_research_study` for the research_study anchor.
  // Verb choice: `contains` reads as plain English; `scopes` reads like a
  // programming concern.
  product_contains_competitive_analysis: { forward_verb: 'contains', reverse_verb: 'contained_by', classification: 'hierarchy', source_type: 'product', target_type: 'competitive_analysis' },
  competitor_offers_competitor_feature: { forward_verb: 'offers', reverse_verb: 'offered_by', classification: 'hierarchy', source_type: 'competitor', target_type: 'competitor_feature' },
  competitive_analysis_analyses_competitor: { forward_verb: 'analyses', reverse_verb: 'analysed_in', classification: 'hierarchy', source_type: 'competitive_analysis', target_type: 'competitor' },
  competitive_analysis_identifies_market_trend: { forward_verb: 'identifies', reverse_verb: 'identified_in', classification: 'hierarchy', source_type: 'competitive_analysis', target_type: 'market_trend' },
  competitive_analysis_scopes_market_segment: { forward_verb: 'scopes', reverse_verb: 'scoped_in', classification: 'hierarchy', source_type: 'competitive_analysis', target_type: 'market_segment' },
  market_trend_influences_outcome: { forward_verb: 'influences', reverse_verb: 'influenced_by', classification: 'cross-domain', source_type: 'market_trend', target_type: 'outcome' },
  market_trend_creates_opportunity: { forward_verb: 'creates', reverse_verb: 'created_by', classification: 'cross-domain', source_type: 'market_trend', target_type: 'opportunity' },
  competitor_feature_inspires_solution: { forward_verb: 'inspires', reverse_verb: 'inspired_by', classification: 'cross-domain', source_type: 'competitor_feature', target_type: 'solution' },
  competitor_competes_for_persona: { forward_verb: 'competes_for', reverse_verb: 'contested_by', classification: 'cross-domain', source_type: 'competitor', target_type: 'persona' },
  // v0.7.2 ( §1): competitors hold geographic/market territory; connects the isolated `territory` member to the region anchor.
  competitor_competes_in_territory: { forward_verb: 'competes_in', reverse_verb: 'contested_by', classification: 'cross-domain', source_type: 'competitor', target_type: 'territory' },
  // direct competitor → learning edge (insight surfaced without a formal research study)
  competitor_yields_learning: { forward_verb: 'yields', reverse_verb: 'yielded_by', classification: 'cross-domain', source_type: 'competitor', target_type: 'learning' },
  // v0.5.2: competitors offer capabilities, not just packaged
  // competitor_features. Wardley analysis tracks competitor positions across
  // the same value-chain spine the home team maps: same `capability` nodes,
  // different offerings. Cross-domain (market_intelligence → strategy) so the
  // competitor side of a Wardley map shares one structural vocabulary with
  // the team's own capability decomposition.
  competitor_offers_capability: { forward_verb: 'offers', reverse_verb: 'offered_by', classification: 'cross-domain', source_type: 'competitor', target_type: 'capability' },

  // Classification taxonomy
  //
  // classification_axis hosts classification_value (hierarchy lives in
  // UPG_VALID_CHILDREN). The semantically interesting edges are *occupancy*
  // (a competitor sits on a value) and *anti-fit* (a persona should NOT
  // pick a value / product / competitor). Three anti_fit_for entries match
  // the catalog's singular-source/target grammar (polymorphic targets
  // would be a separate catalog-mechanic change).
  competitive_analysis_dimensioned_by_classification_axis: { forward_verb: 'dimensioned_by', reverse_verb: 'dimensions', classification: 'hierarchy', source_type: 'competitive_analysis', target_type: 'classification_axis' },
  classification_axis_includes_classification_value: { forward_verb: 'includes', reverse_verb: 'value_of', classification: 'hierarchy', source_type: 'classification_axis', target_type: 'classification_value' },
  competitor_classified_as_classification_value: { forward_verb: 'classified_as', reverse_verb: 'classification_of', classification: 'semantic', source_type: 'competitor', target_type: 'classification_value' },
  persona_anti_fit_for_classification_value: { forward_verb: 'is_anti_fit_for', reverse_verb: 'should_not_be_picked_by', classification: 'semantic', source_type: 'persona', target_type: 'classification_value' },
  persona_anti_fit_for_product: { forward_verb: 'is_anti_fit_for', reverse_verb: 'should_not_be_picked_by', classification: 'semantic', source_type: 'persona', target_type: 'product' },
  persona_anti_fit_for_competitor: { forward_verb: 'is_anti_fit_for', reverse_verb: 'should_not_be_picked_by', classification: 'semantic', source_type: 'persona', target_type: 'competitor' },

  // Classification value genealogy
  //
  // Six typed edges between classification_value nodes for taxonomy-internal
  // genealogy. Rescoped from the original "relationship_kind enum on
  // relates_to" because the UPG edge model is verb-only (no instance
  // properties). Six typed verbs match how UPG models semantic
  // relationships elsewhere.
  //
  // Directional (causal): evolves_from, derives_from.
  // Symmetric (semantic): opposite_of, sibling_of, compatible_with,
  // incompatible_with: forward_verb == reverse_verb per the catalog's
  // symmetric convention (see `product_shares_persona_with_product`,
  // `root_cause_shares_cause_with_root_cause`).
  classification_value_evolves_from_classification_value: { forward_verb: 'evolves_from', reverse_verb: 'predecessor_of', classification: 'causal', source_type: 'classification_value', target_type: 'classification_value' },
  classification_value_opposite_of_classification_value: { forward_verb: 'opposite_of', reverse_verb: 'opposite_of', classification: 'semantic', source_type: 'classification_value', target_type: 'classification_value' },
  classification_value_sibling_of_classification_value: { forward_verb: 'sibling_of', reverse_verb: 'sibling_of', classification: 'semantic', source_type: 'classification_value', target_type: 'classification_value' },
  classification_value_derives_from_classification_value: { forward_verb: 'derives_from', reverse_verb: 'parent_of', classification: 'causal', source_type: 'classification_value', target_type: 'classification_value' },
  classification_value_compatible_with_classification_value: { forward_verb: 'compatible_with', reverse_verb: 'compatible_with', classification: 'semantic', source_type: 'classification_value', target_type: 'classification_value' },
  classification_value_incompatible_with_classification_value: { forward_verb: 'incompatible_with', reverse_verb: 'incompatible_with', classification: 'semantic', source_type: 'classification_value', target_type: 'classification_value' },

  // Persona pursues classification_value
  //
  // Persona pursues a paradigm/classification; e.g. "Modern web dev
  // persona pursues Composable Structured-Content Platform paradigm".
  // Mirrors `persona_pursues_job` (same source, same verb pair).
  //
  // NOTE: The brief proposed extending a `pursued_by_persona` edge
  // family but no such family exists in the catalog. The catalog's
  // canonical persona-pursuit pattern is `persona_pursues_X` (persona
  // as source). Following the catalog rather than the brief.
  persona_pursues_classification_value: { forward_verb: 'pursues', reverse_verb: 'pursued_by', classification: 'semantic', source_type: 'persona', target_type: 'classification_value' },

  // 1.6 Feedback & Voice of Customer Domain
  product_tracks_market_trend:            { forward_verb: 'tracks',           reverse_verb: 'tracked_by',       classification: 'semantic',   source_type: 'product',           target_type: 'market_trend' },
  product_has_feedback_program:           { forward_verb: 'has',               reverse_verb: 'owned_by',         classification: 'hierarchy',  source_type: 'product',           target_type: 'feedback_program' },
  product_has_user_advisory_board:        { forward_verb: 'has',               reverse_verb: 'advises',          classification: 'hierarchy',  source_type: 'product',           target_type: 'user_advisory_board' },
  product_runs_beta_program:              { forward_verb: 'runs',              reverse_verb: 'run_by',           classification: 'hierarchy',  source_type: 'product',           target_type: 'beta_program' },
  feedback_program_collects_feature_request: { forward_verb: 'collects', reverse_verb: 'collected_in', classification: 'hierarchy', source_type: 'feedback_program', target_type: 'feature_request' },
  feature_request_voted_on_by_feedback_vote: { forward_verb: 'voted_on_by', reverse_verb: 'votes_for', classification: 'hierarchy', source_type: 'feature_request', target_type: 'feedback_vote' },
  feedback_program_runs_nps_campaign: { forward_verb: 'runs', reverse_verb: 'run_by', classification: 'hierarchy', source_type: 'feedback_program', target_type: 'nps_campaign' },
  feedback_program_identifies_feedback_theme: { forward_verb: 'identifies', reverse_verb: 'identified_in', classification: 'hierarchy', source_type: 'feedback_program', target_type: 'feedback_theme' },
  feature_request_creates_opportunity: { forward_verb: 'creates', reverse_verb: 'created_from_request', classification: 'cross-domain', source_type: 'feature_request', target_type: 'opportunity' },
  feedback_theme_validates_need: { forward_verb: 'validates', reverse_verb: 'validated_by_theme', classification: 'cross-domain', source_type: 'feedback_theme', target_type: 'need' },
  nps_campaign_tracks_metric: { forward_verb: 'tracks', reverse_verb: 'tracked_by_campaign', classification: 'cross-domain', source_type: 'nps_campaign', target_type: 'metric' },
  beta_program_runs_experiment_run: { forward_verb: 'runs', reverse_verb: 'run_in_beta', classification: 'cross-domain', source_type: 'beta_program', target_type: 'experiment_run' },
  user_advisory_board_includes_persona: { forward_verb: 'includes', reverse_verb: 'included_in_board', classification: 'cross-domain', source_type: 'user_advisory_board', target_type: 'persona' },
  feedback_vote_prioritises_roadmap_item: { forward_verb: 'prioritises', reverse_verb: 'prioritised_by_vote', classification: 'cross-domain', source_type: 'feedback_vote', target_type: 'roadmap_item' },
  feedback_program_hosts_user_advisory_board: { forward_verb: 'hosts',         reverse_verb: 'part_of',          classification: 'hierarchy',  source_type: 'feedback_program',  target_type: 'user_advisory_board' },
  feedback_program_has_beta_program:      { forward_verb: 'has',               reverse_verb: 'part_of',          classification: 'hierarchy',  source_type: 'feedback_program',  target_type: 'beta_program' },

  // ── Part 2: Strategic & Execution Spine (Ring 2) ───────────────────────────

  // 2.1 Strategic Domain
  product_pursues_outcome: { forward_verb: 'pursues', reverse_verb: 'pursued_by', classification: 'hierarchy', source_type: 'product', target_type: 'outcome' },
  product_targets_objective: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'hierarchy', source_type: 'product', target_type: 'objective' },
  product_guided_by_vision: { forward_verb: 'guided_by', reverse_verb: 'guides', classification: 'hierarchy', source_type: 'product', target_type: 'vision' },
  // product→{mission,strategic_theme,strategic_pillar,initiative,capability,value_stream,assumption}
  // are semantic "how the product relates to the strategic cascade", not containment.
  // The containment chain is product → vision → mission → strategic_pillar → … so these
  // targets are reachable via the vision/mission hierarchy already.
  product_fulfils_mission: { forward_verb: 'fulfils', reverse_verb: 'fulfilled_by', classification: 'semantic', source_type: 'product', target_type: 'mission' },
  product_organises_around_strategic_theme: { forward_verb: 'organises_around', reverse_verb: 'organises', classification: 'semantic', source_type: 'product', target_type: 'strategic_theme' },
  product_stands_on_strategic_pillar: { forward_verb: 'stands_on', reverse_verb: 'supports', classification: 'semantic', source_type: 'product', target_type: 'strategic_pillar' },
  product_invests_in_initiative: { forward_verb: 'invests_in', reverse_verb: 'investment_of', classification: 'semantic', source_type: 'product', target_type: 'initiative' },
  product_develops_capability: { forward_verb: 'develops', reverse_verb: 'developed_by', classification: 'semantic', source_type: 'product', target_type: 'capability' },
  product_delivers_through_value_stream: { forward_verb: 'delivers_through', reverse_verb: 'delivers_for', classification: 'semantic', source_type: 'product', target_type: 'value_stream' },
  product_holds_assumption: { forward_verb: 'holds', reverse_verb: 'held_by', classification: 'semantic', source_type: 'product', target_type: 'assumption' },
  product_measures_with_metric: { forward_verb: 'measures_with', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'product', target_type: 'metric' },
  outcome_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'outcome', target_type: 'metric' },
  outcome_tracked_by_metric: { forward_verb: 'tracked_by', reverse_verb: 'tracks', classification: 'hierarchy', source_type: 'outcome', target_type: 'metric' },
  objective_achieved_through_key_result: { forward_verb: 'achieved_through', reverse_verb: 'achieves', classification: 'hierarchy', source_type: 'objective', target_type: 'key_result' },
  objective_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'objective', target_type: 'metric' },
  key_result_quantified_by_metric: { forward_verb: 'quantified_by', reverse_verb: 'quantifies', classification: 'hierarchy', source_type: 'key_result', target_type: 'metric' },
  key_result_tracked_by_metric: { forward_verb: 'tracked_by', reverse_verb: 'tracks', classification: 'hierarchy', source_type: 'key_result', target_type: 'metric' },
  vision_realised_through_mission: { forward_verb: 'realised_through', reverse_verb: 'realises', classification: 'hierarchy', source_type: 'vision', target_type: 'mission' },
  mission_supported_by_strategic_pillar: { forward_verb: 'supported_by', reverse_verb: 'supports', classification: 'hierarchy', source_type: 'mission', target_type: 'strategic_pillar' },
  strategic_pillar_organises_strategic_theme: { forward_verb: 'organises', reverse_verb: 'organised_by', classification: 'hierarchy', source_type: 'strategic_pillar', target_type: 'strategic_theme' },
  strategic_pillar_enables_capability: { forward_verb: 'enables', reverse_verb: 'enabled_by', classification: 'hierarchy', source_type: 'strategic_pillar', target_type: 'capability' },
  strategic_pillar_delivers_value_stream: { forward_verb: 'delivers', reverse_verb: 'delivered_by', classification: 'hierarchy', source_type: 'strategic_pillar', target_type: 'value_stream' },
  strategic_pillar_decided_via_decision: { forward_verb: 'decided_via', reverse_verb: 'decided_for', classification: 'hierarchy', source_type: 'strategic_pillar', target_type: 'decision' },
  strategic_theme_pursues_initiative: { forward_verb: 'pursues', reverse_verb: 'pursued_under', classification: 'hierarchy', source_type: 'strategic_theme', target_type: 'initiative' },
  // v0.5.4: three edges that lift strategic_theme from structural
  // isolation to a conceptually central strategy node.
  //
  // `strategic_theme_delivers_outcome`: the causal link from a multi-quarter
  // focus area to the business result it aims to produce.
  //
  // `strategic_theme_measured_by_key_result`: themes are broad; key results
  // make them measurable. Direct link means a dashboard can surface KRs next
  // to the theme without traversing objective.
  //
  // `objective_rolls_up_to_strategic_theme`: the OKR containment edge.
  // an objective is the specific quarterly bet *within* a theme. strategic_theme
  // is the broader multi-quarter focus area; objective is subordinate.
  // Direction: strategic_theme → objective (parent → child, per UPG hierarchy
  // convention where source is the parent). The reverse verb `rolls_up_to`
  // surfaces the upward-rollup read. Mirrors `strategic_pillar_organises_
  // strategic_theme` (pillar → theme), completing the strategic cascade:
  // strategic_pillar → strategic_theme → objective → key_result.
  strategic_theme_delivers_outcome: { forward_verb: 'delivers', reverse_verb: 'delivered_by', classification: 'causal', source_type: 'strategic_theme', target_type: 'outcome' },
  strategic_theme_measured_by_key_result: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'causal', source_type: 'strategic_theme', target_type: 'key_result' },
  objective_rolls_up_to_strategic_theme: { forward_verb: 'contains_objective', reverse_verb: 'rolls_up_to', classification: 'hierarchy', source_type: 'strategic_theme', target_type: 'objective' },
  initiative_assumes_assumption: { forward_verb: 'assumes', reverse_verb: 'assumed_by', classification: 'hierarchy', source_type: 'initiative', target_type: 'assumption' },
  initiative_drives_outcome: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'cross-domain', source_type: 'initiative', target_type: 'outcome' },
  capability_enables_value_stream: { forward_verb: 'enables', reverse_verb: 'enabled_by', classification: 'cross-domain', source_type: 'capability', target_type: 'value_stream' },
  // v0.5.2: three capability-anchored edges that complete the
  // Wardley-style value chain: need → capability → capability → feature.
  // The catalog already had `strategic_pillar_enables_capability` (downward
  // from strategy) and `capability_enables_value_stream` (outward toward
  // delivery). What was missing was the inbound anchor (need fulfils chain
  // start), the intra-capability dependency (value-chain spine), and the
  // implementation hop (capability realised by user-facing feature).
  //
  // Hierarchy classification for all three: capabilities structurally
  // decompose into sub-capabilities, fulfil specific needs, and are
  // realised by concrete features; these are containment relationships,
  // not lateral associations.
  //
  // `capability_depends_on_capability` is a same-type edge. The v0.5.0
  // self-loop guard refuses A → A; A → B between distinct
  // capabilities is the supported shape. A value chain by definition has
  // no node depending on itself, so this is correct.
  need_fulfilled_by_capability: { forward_verb: 'fulfilled_by', reverse_verb: 'fulfils', classification: 'hierarchy', source_type: 'need', target_type: 'capability' },
  capability_depends_on_capability: { forward_verb: 'depends_on', reverse_verb: 'depended_on_by', classification: 'hierarchy', source_type: 'capability', target_type: 'capability' },
  capability_implemented_by_feature: { forward_verb: 'implemented_by', reverse_verb: 'implements', classification: 'hierarchy', source_type: 'capability', target_type: 'feature' },
  vision_guides_objective: { forward_verb: 'guides', reverse_verb: 'guided_by', classification: 'cross-domain', source_type: 'vision', target_type: 'objective' },
  metric_decomposes_into_metric: { forward_verb: 'decomposes_into', reverse_verb: 'rolls_up_to', classification: 'hierarchy', source_type: 'metric', target_type: 'metric' },
  // (since v0.4.0) canonical replacement for the removed
  // `MetricProperties.guardrail_for` string property. Use this edge to
  // link a guard metric structurally to the primary metric it protects.
  metric_guards_metric: { forward_verb: 'guards', reverse_verb: 'guarded_by', classification: 'semantic', source_type: 'metric', target_type: 'metric' },
  metric_segmented_by_persona: { forward_verb: 'segmented_by', reverse_verb: 'segments', classification: 'cross-domain', source_type: 'metric', target_type: 'persona' },
  metric_drives_outcome:                  { forward_verb: 'drives',            reverse_verb: 'driven_by',        classification: 'causal',     source_type: 'metric',            target_type: 'outcome' },

  // 2.2 Product Specification Domain
  product_organises_into_feature_area: { forward_verb: 'organises_into', reverse_verb: 'organises', classification: 'hierarchy', source_type: 'product', target_type: 'feature_area' },
  product_builds_feature: { forward_verb: 'builds', reverse_verb: 'built_by', classification: 'hierarchy', source_type: 'product', target_type: 'feature' },
  product_ships_via_release: { forward_verb: 'ships_via', reverse_verb: 'ships', classification: 'hierarchy', source_type: 'product', target_type: 'release' },
  product_plans_via_roadmap: { forward_verb: 'plans_via', reverse_verb: 'plans_for', classification: 'hierarchy', source_type: 'product', target_type: 'roadmap' },
  product_categorises_by_theme: { forward_verb: 'categorises_by', reverse_verb: 'categorises', classification: 'hierarchy', source_type: 'product', target_type: 'theme' },
  feature_area_contains_feature: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'feature_area', target_type: 'feature' },
  feature_area_contains_feature_area: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'feature_area', target_type: 'feature_area' },
  outcome_delivered_by_feature: { forward_verb: 'delivered_by', reverse_verb: 'delivers', classification: 'cross-domain', source_type: 'outcome', target_type: 'feature' },
  outcome_delivered_via_feature_area: { forward_verb: 'delivered_via', reverse_verb: 'delivers_for', classification: 'cross-domain', source_type: 'outcome', target_type: 'feature_area' },
  feature_decomposed_into_epic: { forward_verb: 'decomposed_into', reverse_verb: 'implements', classification: 'hierarchy', source_type: 'feature', target_type: 'epic' },
  // user_story (P5 templated-statement, the "As X, I want Y so Z" lifecycle-free
  // promise) verifies through acceptance criteria, is covered by test cases, and
  // is specified by epics; the paired `task` carries the lifecycle and the
  // implementation work, and implements the statement. (v0.2.7 split extracted
  // the work into `task`; v0.7.0/ re-canonicalised the statement
  // story_statement → user_story; see UPG_EDGE_MIGRATIONS['0.7.0'].)
  epic_specified_by_user_story: { forward_verb: 'specified_by', reverse_verb: 'specifies', classification: 'hierarchy', source_type: 'epic', target_type: 'user_story' },
  user_story_verified_by_acceptance_criterion: { forward_verb: 'verified_by', reverse_verb: 'verifies', classification: 'hierarchy', source_type: 'user_story', target_type: 'acceptance_criterion' },
  task_implements_user_story: { forward_verb: 'implements', reverse_verb: 'implemented_by', classification: 'cross-domain', source_type: 'task', target_type: 'user_story' },
  feature_affected_by_bug: { forward_verb: 'affected_by', reverse_verb: 'affects', classification: 'hierarchy', source_type: 'feature', target_type: 'bug' },
  // release containment edges, used by the GitHub adapter when
  // importing milestone→issue relationships. resolveContainmentEdge('release',
  // 'feature') / ('release', 'bug') now return canonical keys instead of
  // falling back to node_informs_node with mapping_confidence: 'low'.
  release_contains_feature: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'release', target_type: 'feature' },
  release_contains_bug: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'release', target_type: 'bug' },
  release_documented_in_changelog: { forward_verb: 'documented_in', reverse_verb: 'documents', classification: 'hierarchy', source_type: 'release', target_type: 'changelog' },
  roadmap_contains_roadmap_item: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'roadmap', target_type: 'roadmap_item' },
  roadmap_categorised_by_theme: { forward_verb: 'categorised_by', reverse_verb: 'categorises', classification: 'hierarchy', source_type: 'roadmap', target_type: 'theme' },
  roadmap_schedules_release: { forward_verb: 'schedules', reverse_verb: 'scheduled_in', classification: 'hierarchy', source_type: 'roadmap', target_type: 'release' },
  theme_groups_feature: { forward_verb: 'groups', reverse_verb: 'grouped_in', classification: 'hierarchy', source_type: 'theme', target_type: 'feature' },
  // feature_area is not contained by theme; themes span multiple
  // areas cross-cuttingly. Containment path: product → feature_area.
  theme_spans_feature_area: { forward_verb: 'spans', reverse_verb: 'spanned_by', classification: 'semantic', source_type: 'theme', target_type: 'feature_area' },
  // The legacy `story_task` collapsed into `task` (v0.4.0), so the implements
  // relationship is the canonical `task_implements_user_story` above; there is
  // no separate story_task edge. (v0.2.7 introduced the Statement/Implementation
  // split; v0.7.0/ re-canonicalised the statement to user_story.)
  bug_affects_feature: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'bug', target_type: 'feature' },
  roadmap_item_references_feature: { forward_verb: 'references', reverse_verb: 'referenced_by', classification: 'cross-domain', source_type: 'roadmap_item', target_type: 'feature' },
  feature_decomposes_into_task:           { forward_verb: 'decomposes_into',   reverse_verb: 'implements',       classification: 'hierarchy',  source_type: 'feature',           target_type: 'task' },
  task_has_subtask:                       { forward_verb: 'has_subtask',       reverse_verb: 'is_subtask_of',    classification: 'hierarchy',  source_type: 'task',              target_type: 'task' },

  // 2.3 Legal Domain
  product_owned_by_legal_entity: { forward_verb: 'owned_by', reverse_verb: 'owns', classification: 'hierarchy', source_type: 'product', target_type: 'legal_entity' },
  legal_entity_protects_ip_asset: { forward_verb: 'protects', reverse_verb: 'protected_by', classification: 'hierarchy', source_type: 'legal_entity', target_type: 'ip_asset' },
  legal_entity_bound_by_contract: { forward_verb: 'bound_by', reverse_verb: 'binds', classification: 'hierarchy', source_type: 'legal_entity', target_type: 'contract' },
  contract_contains_contract_clause: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'contract', target_type: 'contract_clause' },
  product_governed_by_privacy_policy: { forward_verb: 'governed_by', reverse_verb: 'governs', classification: 'hierarchy', source_type: 'product', target_type: 'privacy_policy' },
  contract_governs_partnership: { forward_verb: 'governs', reverse_verb: 'governed_by', classification: 'cross-domain', source_type: 'contract', target_type: 'partnership' },

  // 2.4 UX Design Domain
  product_maps_experience_via_user_journey: { forward_verb: 'maps_experience_via', reverse_verb: 'maps_for', classification: 'hierarchy', source_type: 'product', target_type: 'user_journey' },
  product_navigated_via_user_flow: { forward_verb: 'navigated_via', reverse_verb: 'navigates', classification: 'hierarchy', source_type: 'product', target_type: 'user_flow' },
  product_sketched_in_wireframe: { forward_verb: 'sketched_in', reverse_verb: 'sketches', classification: 'hierarchy', source_type: 'product', target_type: 'wireframe' },
  product_contains_screen: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'product', target_type: 'screen' },
  user_journey_contains_journey_step: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'user_journey', target_type: 'journey_step' },
  // peer-to-peer ordering between sibling journey_steps. Classification
  // is `semantic` rather than introducing a new `temporal` value; precedence is
  // a relational pattern, not containment, and existing order helpers
  // (graph traversal) treat 'semantic' as the catch-all for non-causal,
  // non-hierarchical relationships.
  journey_step_precedes_journey_step: { forward_verb: 'precedes', reverse_verb: 'follows', classification: 'semantic', source_type: 'journey_step', target_type: 'journey_step' },
  user_flow_routes_through_screen: { forward_verb: 'routes_through', reverse_verb: 'routed_in', classification: 'hierarchy', source_type: 'user_flow', target_type: 'screen' },
  screen_renders_as_screen_state: { forward_verb: 'renders_as', reverse_verb: 'rendered_by', classification: 'hierarchy', source_type: 'screen', target_type: 'screen_state' },
  need_reframed_as_design_question: { forward_verb: 'reframed_as', reverse_verb: 'reframes', classification: 'causal', source_type: 'need', target_type: 'design_question' },
  design_question_answered_by_design_concept: { forward_verb: 'answered_by', reverse_verb: 'answers', classification: 'causal', source_type: 'design_question', target_type: 'design_concept' },
  design_concept_realised_as_prototype: { forward_verb: 'realised_as', reverse_verb: 'realises', classification: 'causal', source_type: 'design_concept', target_type: 'prototype' },
  design_concept_sketched_in_wireframe: { forward_verb: 'sketched_in', reverse_verb: 'sketches', classification: 'hierarchy', source_type: 'design_concept', target_type: 'wireframe' },
  persona_experiences_user_journey: { forward_verb: 'experiences', reverse_verb: 'experienced_by', classification: 'cross-domain', source_type: 'persona', target_type: 'user_journey' },
  user_journey_maps_persona: { forward_verb: 'maps', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'user_journey', target_type: 'persona' },
  user_journey_addresses_job: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'user_journey', target_type: 'job' },
  user_flow_targets_persona: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'user_flow', target_type: 'persona' },
  journey_step_reveals_need: { forward_verb: 'reveals', reverse_verb: 'revealed_in', classification: 'cross-domain', source_type: 'journey_step', target_type: 'need' },
  need_occurs_in_journey_step: { forward_verb: 'occurs_in', reverse_verb: 'reveals', classification: 'cross-domain', source_type: 'need', target_type: 'journey_step' },
  // a journey_step can declare its primary feature before being
  // decomposed into user_flows. Cross-domain (UX Design → Product Spec).
  journey_step_realised_by_feature: { forward_verb: 'realised_by', reverse_verb: 'realises', classification: 'cross-domain', source_type: 'journey_step', target_type: 'feature' },
  opportunity_improves_user_journey: { forward_verb: 'improves', reverse_verb: 'improved_by', classification: 'cross-domain', source_type: 'opportunity', target_type: 'user_journey' },
  user_journey_passes_through_journey_phase: { forward_verb: 'passes_through', reverse_verb: 'is_phase_of',    classification: 'hierarchy',  source_type: 'user_journey',      target_type: 'journey_phase' },
  journey_phase_has_step:                 { forward_verb: 'has_step',          reverse_verb: 'is_step_in',       classification: 'hierarchy',  source_type: 'journey_phase',     target_type: 'journey_step' },
  journey_step_has_action:                { forward_verb: 'has_action',        reverse_verb: 'is_action_in',     classification: 'hierarchy',  source_type: 'journey_step',      target_type: 'journey_action' },

  // 2.5 UI System Domain
  product_systematised_in_design_system: { forward_verb: 'systematised_in', reverse_verb: 'systematises', classification: 'hierarchy', source_type: 'product', target_type: 'design_system' },
  product_built_with_design_component: { forward_verb: 'built_with', reverse_verb: 'built_for', classification: 'hierarchy', source_type: 'product', target_type: 'design_component' },
  design_system_contains_design_component: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'design_system', target_type: 'design_component' },
  design_system_defines_design_token: { forward_verb: 'defines', reverse_verb: 'defined_in', classification: 'hierarchy', source_type: 'design_system', target_type: 'design_token' },
  design_system_codified_in_design_guideline: { forward_verb: 'codified_in', reverse_verb: 'codifies', classification: 'hierarchy', source_type: 'design_system', target_type: 'design_guideline' },
  design_system_expresses_brand_identity: { forward_verb: 'expresses', reverse_verb: 'expressed_in', classification: 'hierarchy', source_type: 'design_system', target_type: 'brand_identity' },
  design_system_encompasses_user_journey: { forward_verb: 'encompasses', reverse_verb: 'encompassed_in', classification: 'hierarchy', source_type: 'design_system', target_type: 'user_journey' },
  design_system_encompasses_user_flow: { forward_verb: 'encompasses', reverse_verb: 'encompassed_in', classification: 'hierarchy', source_type: 'design_system', target_type: 'user_flow' },
  design_system_informed_by_insight: { forward_verb: 'informed_by', reverse_verb: 'informs', classification: 'hierarchy', source_type: 'design_system', target_type: 'insight' },
  // decision records design choices about the system; not contained by it.
  design_system_decided_via_decision: { forward_verb: 'decided_via', reverse_verb: 'decided_for', classification: 'semantic', source_type: 'design_system', target_type: 'decision' },
  design_component_styled_by_design_token: { forward_verb: 'styled_by', reverse_verb: 'styles', classification: 'hierarchy', source_type: 'design_component', target_type: 'design_token' },
  design_component_follows_design_pattern: { forward_verb: 'follows', reverse_verb: 'followed_by', classification: 'hierarchy', source_type: 'design_component', target_type: 'design_pattern' },
  design_component_governed_by_design_guideline: { forward_verb: 'governed_by', reverse_verb: 'governs', classification: 'hierarchy', source_type: 'design_component', target_type: 'design_guideline' },
  design_component_specified_by_interaction_spec: { forward_verb: 'specified_by', reverse_verb: 'specifies', classification: 'hierarchy', source_type: 'design_component', target_type: 'interaction_spec' },
  design_component_composes_design_component: { forward_verb: 'composes', reverse_verb: 'composed_in', classification: 'hierarchy', source_type: 'design_component', target_type: 'design_component' },
  prototype_annotated_with_annotation: { forward_verb: 'annotated_with', reverse_verb: 'annotates', classification: 'hierarchy', source_type: 'prototype', target_type: 'annotation' },
  screen_renders_design_component: { forward_verb: 'renders', reverse_verb: 'rendered_on', classification: 'hierarchy', source_type: 'screen', target_type: 'design_component' },
  screen_navigates_to_screen: { forward_verb: 'navigates_to', reverse_verb: 'navigated_from', classification: 'hierarchy', source_type: 'screen', target_type: 'screen' },
  screen_surfaces_feature: { forward_verb: 'surfaces', reverse_verb: 'surfaced_on', classification: 'cross-domain', source_type: 'screen', target_type: 'feature' },
  screen_wireframed_as_wireframe: { forward_verb: 'wireframed_as', reverse_verb: 'wireframes', classification: 'hierarchy', source_type: 'screen', target_type: 'wireframe' },
  wireframe_specifies_screen: { forward_verb: 'specifies', reverse_verb: 'specified_by', classification: 'cross-domain', source_type: 'wireframe', target_type: 'screen' },

  // 2.6 Brand Domain
  product_branded_as_brand_identity: { forward_verb: 'branded_as', reverse_verb: 'brands', classification: 'hierarchy', source_type: 'product', target_type: 'brand_identity' },
  brand_identity_coloured_with_brand_colour: { forward_verb: 'coloured_with', reverse_verb: 'colours', classification: 'hierarchy', source_type: 'brand_identity', target_type: 'brand_colour' },
  brand_identity_typeset_with_brand_typography: { forward_verb: 'typeset_with', reverse_verb: 'typesets', classification: 'hierarchy', source_type: 'brand_identity', target_type: 'brand_typography' },
  brand_identity_speaks_with_brand_voice: { forward_verb: 'speaks_with', reverse_verb: 'voices', classification: 'hierarchy', source_type: 'brand_identity', target_type: 'brand_voice' },
  brand_identity_expressed_in_brand_asset: { forward_verb: 'expressed_in', reverse_verb: 'expresses', classification: 'hierarchy', source_type: 'brand_identity', target_type: 'brand_asset' },
  brand_identity_expressed_through_brand_imagery: { forward_verb: 'expressed_through', reverse_verb: 'expresses', classification: 'hierarchy', source_type: 'brand_identity', target_type: 'brand_imagery' },

  // ── Part 3: Build Ring (Ring 3) ────────────────────────────────────────────

  // 3.1 Engineering Domain
  product_bounded_by_bounded_context: { forward_verb: 'bounded_by', reverse_verb: 'bounds', classification: 'hierarchy', source_type: 'product', target_type: 'bounded_context' },
  product_decided_via_decision: { forward_verb: 'decided_via', reverse_verb: 'decides_for', classification: 'hierarchy', source_type: 'product', target_type: 'decision' },
  product_bounded_by_constraint: { forward_verb: 'bounded_by', reverse_verb: 'bounds', classification: 'hierarchy', source_type: 'product', target_type: 'constraint' },
  product_stored_in_code_repository: { forward_verb: 'stored_in', reverse_verb: 'stores', classification: 'hierarchy', source_type: 'product', target_type: 'code_repository' },
  product_integrates_via_integration_pattern: { forward_verb: 'integrates_via', reverse_verb: 'integrates', classification: 'hierarchy', source_type: 'product', target_type: 'integration_pattern' },
  product_connects_to_external_api: { forward_verb: 'connects_to', reverse_verb: 'connected_by', classification: 'hierarchy', source_type: 'product', target_type: 'external_api' },
  product_flows_through_data_flow: { forward_verb: 'flows_through', reverse_verb: 'flows_for', classification: 'hierarchy', source_type: 'product', target_type: 'data_flow' },
  bounded_context_deploys_service: { forward_verb: 'deploys', reverse_verb: 'deployed_in', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'service' },
  bounded_context_emits_domain_event: { forward_verb: 'emits', reverse_verb: 'emitted_by', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'domain_event' },
  bounded_context_decided_via_decision: { forward_verb: 'decided_via', reverse_verb: 'decides_for', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'decision' },
  bounded_context_modelled_as_aggregate: { forward_verb: 'modelled_as', reverse_verb: 'models', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'aggregate' },
  bounded_context_projected_as_read_model: { forward_verb: 'projected_as', reverse_verb: 'projects', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'read_model' },
  bounded_context_persisted_in_data_model: { forward_verb: 'persisted_in', reverse_verb: 'persists', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'data_model' },
  bounded_context_stored_in_code_repository: { forward_verb: 'stored_in', reverse_verb: 'stores', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'code_repository' },
  bounded_context_integrates_via_integration_pattern: { forward_verb: 'integrates_via', reverse_verb: 'integrates', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'integration_pattern' },
  bounded_context_connects_to_external_api: { forward_verb: 'connects_to', reverse_verb: 'connected_by', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'external_api' },
  bounded_context_flows_through_data_flow: { forward_verb: 'flows_through', reverse_verb: 'flows_within', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'data_flow' },
  bounded_context_contains_feature_area: { forward_verb: 'contains', reverse_verb: 'contained_in', classification: 'cross-domain', source_type: 'bounded_context', target_type: 'feature_area' },
  service_exposes_api_contract: { forward_verb: 'exposes', reverse_verb: 'exposed_by', classification: 'hierarchy', source_type: 'service', target_type: 'api_contract' },
  service_carries_technical_debt_item: { forward_verb: 'carries', reverse_verb: 'carried_by', classification: 'hierarchy', source_type: 'service', target_type: 'technical_debt_item' },
  service_toggles_feature_flag: { forward_verb: 'toggles', reverse_verb: 'toggled_by', classification: 'hierarchy', source_type: 'service', target_type: 'feature_flag' },
  service_deployed_as_deployment: { forward_verb: 'deployed_as', reverse_verb: 'deploys', classification: 'hierarchy', source_type: 'service', target_type: 'deployment' },
  // v0.7.2 ( §1): change is the leading cause of incidents (DORA/SRE); connects the isolated `deployment` member to the ops anchor.
  deployment_triggers_incident: { forward_verb: 'triggers', reverse_verb: 'triggered_by', classification: 'causal', source_type: 'deployment', target_type: 'incident' },
  service_serves_api_endpoint: { forward_verb: 'serves', reverse_verb: 'served_by', classification: 'hierarchy', source_type: 'service', target_type: 'api_endpoint' },
  // v0.5.1 ( C2): api_contract and api_endpoint both anchored from
  // service as siblings, leaving the natural parent-child wiring absent. A
  // contract groups endpoints by version/protocol; endpoints belong to a
  // specific contract. Hierarchy classification is correct here: endpoints
  // are structurally contained by their contract, not merely associated.
  api_contract_contains_api_endpoint: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'api_contract', target_type: 'api_endpoint' },
  service_persisted_in_database_schema: { forward_verb: 'persisted_in', reverse_verb: 'persists', classification: 'hierarchy', source_type: 'service', target_type: 'database_schema' },
  service_publishes_to_queue_topic: { forward_verb: 'publishes_to', reverse_verb: 'published_by', classification: 'hierarchy', source_type: 'service', target_type: 'queue_topic' },
  service_produces_build_artifact: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'hierarchy', source_type: 'service', target_type: 'build_artifact' },
  service_depends_on_library_dependency: { forward_verb: 'depends_on', reverse_verb: 'dependency_of', classification: 'hierarchy', source_type: 'service', target_type: 'library_dependency' },
  service_powers_feature_area: { forward_verb: 'powers', reverse_verb: 'powered_by', classification: 'cross-domain', source_type: 'service', target_type: 'feature_area' },
  service_powers_feature: { forward_verb: 'powers', reverse_verb: 'powered_by', classification: 'cross-domain', source_type: 'service', target_type: 'feature' },
  decision_incurs_technical_debt_item: { forward_verb: 'incurs', reverse_verb: 'incurred_by', classification: 'causal', source_type: 'decision', target_type: 'technical_debt_item' },
  aggregate_contains_domain_entity: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'aggregate', target_type: 'domain_entity' },
  aggregate_contains_value_object: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'aggregate', target_type: 'value_object' },
  aggregate_handles_command: { forward_verb: 'handles', reverse_verb: 'handled_by', classification: 'hierarchy', source_type: 'aggregate', target_type: 'command' },
  // v0.5.3 ( C1): the DDD/CQRS event-flow spine. The pre-existing edges
  // above (aggregate_contains_*, aggregate_handles_command, bounded_context_
  // modelled_as_aggregate, bounded_context_emits_domain_event) cover the
  // structural shape (who owns what). These three are the causal edges that
  // make the event-driven dynamics expressible:
  //
  //   command  → produces      → domain_event   (a command emits exactly one
  //                                              event per handle; the command
  //                                              is the cause)
  //   aggregate → emits         → domain_event   (the aggregate is the emitter
  //                                              instance; same event, viewed
  //                                              from its source)
  //   domain_event → projected_to → read_model   (CQRS read-side projection;
  //                                              the event is the cause of
  //                                              the read-model update)
  //
  // All three are classified 'causal' rather than 'hierarchy': the relations
  // are temporal cause-and-effect, not containment. The same domain_event is
  // both produced_by a command AND emitted_by an aggregate; that polysemy is
  // intentional and matches DDD/CQRS literature: a command is the trigger, the
  // aggregate is the source. Composes cleanly with self-loop refusal;
  // none of these are same-type edges.
  aggregate_emits_domain_event: { forward_verb: 'emits', reverse_verb: 'emitted_by', classification: 'causal', source_type: 'aggregate', target_type: 'domain_event' },
  command_produces_domain_event: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'causal', source_type: 'command', target_type: 'domain_event' },
  domain_event_projected_to_read_model: { forward_verb: 'projected_to', reverse_verb: 'projected_from', classification: 'causal', source_type: 'domain_event', target_type: 'read_model' },
  // Engineering: Causal & Investigation Edges
  root_cause_causes_symptom: { forward_verb: 'causes', reverse_verb: 'caused_by', classification: 'causal', source_type: 'root_cause', target_type: 'symptom' },
  root_cause_causes_bug: { forward_verb: 'causes', reverse_verb: 'caused_by', classification: 'causal', source_type: 'root_cause', target_type: 'bug' },
  investigation_revealed_bug: { forward_verb: 'revealed', reverse_verb: 'revealed_by', classification: 'causal', source_type: 'investigation', target_type: 'bug' },
  investigation_revealed_root_cause: { forward_verb: 'revealed', reverse_verb: 'revealed_by', classification: 'causal', source_type: 'investigation', target_type: 'root_cause' },
  fix_resolved_bug: { forward_verb: 'resolved', reverse_verb: 'resolved_by', classification: 'causal', source_type: 'fix', target_type: 'bug' },
  fix_resolved_root_cause: { forward_verb: 'resolved', reverse_verb: 'resolved_by', classification: 'causal', source_type: 'fix', target_type: 'root_cause' },
  fix_derived_from_investigation: { forward_verb: 'derived_from', reverse_verb: 'produced', classification: 'causal', source_type: 'fix', target_type: 'investigation' },
  root_cause_shares_cause_with_root_cause: { forward_verb: 'shares_cause_with', reverse_verb: 'shares_cause_with', classification: 'semantic', source_type: 'root_cause', target_type: 'root_cause' },
  root_cause_manifests_as_technical_debt_item: { forward_verb: 'manifests_as', reverse_verb: 'manifested_by', classification: 'causal', source_type: 'root_cause', target_type: 'technical_debt_item' },
  // investigation and root_cause are causal (triggered by service issues),
  // not contained within a service. Investigation is its own top-level entity.
  service_investigated_via_investigation: { forward_verb: 'investigated_via', reverse_verb: 'investigates', classification: 'causal', source_type: 'service', target_type: 'investigation' },
  service_affected_by_root_cause: { forward_verb: 'affected_by', reverse_verb: 'affects', classification: 'causal', source_type: 'service', target_type: 'root_cause' },
  bug_affects_service: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'bug', target_type: 'service' },
  root_cause_affects_service: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'root_cause', target_type: 'service' },
  root_cause_affects_feature: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'root_cause', target_type: 'feature' },
  investigation_surfaces_symptom:         { forward_verb: 'surfaces',          reverse_verb: 'surfaced_by',      classification: 'hierarchy',  source_type: 'investigation',     target_type: 'symptom' },
  root_cause_resolved_by_fix:             { forward_verb: 'resolved_by',       reverse_verb: 'resolves',         classification: 'causal',     source_type: 'root_cause',        target_type: 'fix' },
  // Engineering: Cross-Domain Edges
  bounded_context_contains_feature: { forward_verb: 'contains', reverse_verb: 'contained_in', classification: 'cross-domain', source_type: 'bounded_context', target_type: 'feature' },
  technical_debt_item_blocks_feature: { forward_verb: 'blocks', reverse_verb: 'blocked_by', classification: 'cross-domain', source_type: 'technical_debt_item', target_type: 'feature' },
  api_endpoint_serves_feature: { forward_verb: 'serves', reverse_verb: 'served_by', classification: 'cross-domain', source_type: 'api_endpoint', target_type: 'feature' },
  design_component_implements_feature: { forward_verb: 'implements', reverse_verb: 'implemented_by', classification: 'cross-domain', source_type: 'design_component', target_type: 'feature' },
  design_component_consumes_service: { forward_verb: 'consumes', reverse_verb: 'consumed_by', classification: 'cross-domain', source_type: 'design_component', target_type: 'service' },
  prototype_validates_feature: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'prototype', target_type: 'feature' },
  wireframe_specifies_feature: { forward_verb: 'specifies', reverse_verb: 'specified_by', classification: 'cross-domain', source_type: 'wireframe', target_type: 'feature' },
  user_flow_requires_feature: { forward_verb: 'requires', reverse_verb: 'required_by', classification: 'cross-domain', source_type: 'user_flow', target_type: 'feature' },

  // 3.2 DevOps & Platform Domain
  product_commits_to_service_level_objective: { forward_verb: 'commits_to', reverse_verb: 'committed_by', classification: 'hierarchy', source_type: 'product', target_type: 'service_level_objective' },
  service_level_objective_measured_by_service_level_indicator: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'service_level_objective', target_type: 'service_level_indicator' },
  service_level_objective_budgets_as_error_budget: { forward_verb: 'budgets_as', reverse_verb: 'budgeted_by', classification: 'hierarchy', source_type: 'service_level_objective', target_type: 'error_budget' },
  product_experiences_incident: { forward_verb: 'experiences', reverse_verb: 'affects', classification: 'hierarchy', source_type: 'product', target_type: 'incident' },
  incident_analysed_in_postmortem: { forward_verb: 'analysed_in', reverse_verb: 'analyses', classification: 'hierarchy', source_type: 'incident', target_type: 'postmortem' },
  product_documented_in_runbook: { forward_verb: 'documented_in', reverse_verb: 'documents', classification: 'hierarchy', source_type: 'product', target_type: 'runbook' },
  product_monitored_by_monitor: { forward_verb: 'monitored_by', reverse_verb: 'monitors', classification: 'hierarchy', source_type: 'product', target_type: 'monitor' },
  monitor_triggers_via_alert_rule: { forward_verb: 'triggers_via', reverse_verb: 'triggered_by', classification: 'hierarchy', source_type: 'monitor', target_type: 'alert_rule' },
  product_built_by_ci_pipeline: { forward_verb: 'built_by', reverse_verb: 'builds', classification: 'hierarchy', source_type: 'product', target_type: 'ci_pipeline' },
  product_released_via_release_strategy: { forward_verb: 'released_via', reverse_verb: 'releases', classification: 'hierarchy', source_type: 'product', target_type: 'release_strategy' },
  product_covered_by_on_call_rotation: { forward_verb: 'covered_by', reverse_verb: 'covers', classification: 'hierarchy', source_type: 'product', target_type: 'on_call_rotation' },
  product_runs_on_infrastructure_component: { forward_verb: 'runs_on', reverse_verb: 'runs', classification: 'hierarchy', source_type: 'product', target_type: 'infrastructure_component' },
  ci_pipeline_produces_build_artifact: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'hierarchy', source_type: 'ci_pipeline', target_type: 'build_artifact' },
  infrastructure_component_committed_to_service_level_objective: { forward_verb: 'committed_to', reverse_verb: 'committed_by', classification: 'hierarchy', source_type: 'infrastructure_component', target_type: 'service_level_objective' },
  infrastructure_component_monitored_by_monitor: { forward_verb: 'monitored_by', reverse_verb: 'monitors', classification: 'hierarchy', source_type: 'infrastructure_component', target_type: 'monitor' },
  infrastructure_component_built_by_ci_pipeline: { forward_verb: 'built_by', reverse_verb: 'builds', classification: 'hierarchy', source_type: 'infrastructure_component', target_type: 'ci_pipeline' },
  infrastructure_component_experiences_incident: { forward_verb: 'experiences', reverse_verb: 'affects', classification: 'hierarchy', source_type: 'infrastructure_component', target_type: 'incident' },
  infrastructure_component_documented_in_runbook: { forward_verb: 'documented_in', reverse_verb: 'documents', classification: 'hierarchy', source_type: 'infrastructure_component', target_type: 'runbook' },
  infrastructure_component_released_via_release_strategy: { forward_verb: 'released_via', reverse_verb: 'releases', classification: 'hierarchy', source_type: 'infrastructure_component', target_type: 'release_strategy' },
  infrastructure_component_covered_by_on_call_rotation: { forward_verb: 'covered_by', reverse_verb: 'covers', classification: 'hierarchy', source_type: 'infrastructure_component', target_type: 'on_call_rotation' },
  service_level_objective_tracks_metric: { forward_verb: 'tracks', reverse_verb: 'tracked_by', classification: 'cross-domain', source_type: 'service_level_objective', target_type: 'metric' },
  service_level_objective_satisfies_service_level_agreement: { forward_verb: 'satisfies', reverse_verb: 'satisfied_by', classification: 'cross-domain', source_type: 'service_level_objective', target_type: 'service_level_agreement' },
  incident_triggers_postmortem: { forward_verb: 'triggers', reverse_verb: 'triggered_by', classification: 'cross-domain', source_type: 'incident', target_type: 'postmortem' },
  incident_breaches_service_level_objective: { forward_verb: 'breaches', reverse_verb: 'breached_by', classification: 'cross-domain', source_type: 'incident', target_type: 'service_level_objective' },
  incident_caused_by_root_cause: { forward_verb: 'caused_by', reverse_verb: 'causes', classification: 'cross-domain', source_type: 'incident', target_type: 'root_cause' },
  incident_exploits_vulnerability: { forward_verb: 'exploits', reverse_verb: 'exploited_by', classification: 'cross-domain', source_type: 'incident', target_type: 'vulnerability' },
  monitor_watches_service: { forward_verb: 'watches', reverse_verb: 'watched_by', classification: 'cross-domain', source_type: 'monitor', target_type: 'service' },
  // v0.7.2 ( §1): an SLI is by definition what monitoring measures (Google SRE); connects the isolated `monitor` member to its sibling SLI.
  monitor_measures_service_level_indicator: { forward_verb: 'measures', reverse_verb: 'measured_by', classification: 'semantic', source_type: 'monitor', target_type: 'service_level_indicator' },
  ci_pipeline_deploys_service: { forward_verb: 'deploys', reverse_verb: 'deployed_by', classification: 'cross-domain', source_type: 'ci_pipeline', target_type: 'service' },
  alert_rule_triggers_runbook: { forward_verb: 'triggers', reverse_verb: 'triggered_by', classification: 'cross-domain', source_type: 'alert_rule', target_type: 'runbook' },
  runbook_mitigates_incident: { forward_verb: 'mitigates', reverse_verb: 'mitigated_by', classification: 'cross-domain', source_type: 'runbook', target_type: 'incident' },
  // v0.5.1 ( C3): postmortem was a pure terminal (zero outgoing
  // edges) despite the devops "Incident Response Chain" pattern routing
  // through it. The existing `investigation_revealed_root_cause` edge
  // anchors on `investigation`, not `postmortem`, so the documented chain
  // (monitor → symptom → incident → postmortem → root_cause) broke at hop
  // 4. Causal: postmortems analyse incidents and identify causes.
  postmortem_identifies_root_cause: { forward_verb: 'identifies', reverse_verb: 'identified_by', classification: 'causal', source_type: 'postmortem', target_type: 'root_cause' },
  // v0.5.1 ( C3): real ops practice; postmortems generate runbook
  // updates as action items. Previously no path between the two existed in
  // the catalog. Causal: the postmortem produces (or updates) the runbook.
  postmortem_produces_runbook: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'causal', source_type: 'postmortem', target_type: 'runbook' },

  // 3.3 Security Domain
  product_models_threats_with_threat_model: { forward_verb: 'models_threats_with', reverse_verb: 'modelled_for', classification: 'hierarchy', source_type: 'product', target_type: 'threat_model' },
  threat_model_identifies_threat: { forward_verb: 'identifies', reverse_verb: 'identified_by', classification: 'hierarchy', source_type: 'threat_model', target_type: 'threat' },
  threat_model_surfaces_vulnerability: { forward_verb: 'surfaces', reverse_verb: 'surfaced_by', classification: 'hierarchy', source_type: 'threat_model', target_type: 'vulnerability' },
  product_enforces_security_control: { forward_verb: 'enforces', reverse_verb: 'enforced_by', classification: 'hierarchy', source_type: 'product', target_type: 'security_control' },
  product_governed_by_security_policy: { forward_verb: 'governed_by', reverse_verb: 'governs', classification: 'hierarchy', source_type: 'product', target_type: 'security_policy' },
  product_experiences_incident_hierarchy: { forward_verb: 'experiences', reverse_verb: 'affects', classification: 'hierarchy', source_type: 'product', target_type: 'incident' },
  product_tested_by_penetration_test: { forward_verb: 'tested_by', reverse_verb: 'tests', classification: 'hierarchy', source_type: 'product', target_type: 'penetration_test' },
  product_reviewed_by_security_review: { forward_verb: 'reviewed_by', reverse_verb: 'reviews', classification: 'hierarchy', source_type: 'product', target_type: 'security_review' },
  product_classifies_data_with_data_classification: { forward_verb: 'classifies_data_with', reverse_verb: 'classifies_data_for', classification: 'hierarchy', source_type: 'product', target_type: 'data_classification' },
  product_restricts_access_with_access_policy: { forward_verb: 'restricts_access_with', reverse_verb: 'restricts_access_for', classification: 'hierarchy', source_type: 'product', target_type: 'access_policy' },
  security_policy_mandates_security_control: { forward_verb: 'mandates', reverse_verb: 'mandated_by', classification: 'hierarchy', source_type: 'security_policy', target_type: 'security_control' },
  security_policy_defines_access_policy: { forward_verb: 'defines', reverse_verb: 'defined_by', classification: 'hierarchy', source_type: 'security_policy', target_type: 'access_policy' },
  security_policy_establishes_data_classification: { forward_verb: 'establishes', reverse_verb: 'established_by', classification: 'hierarchy', source_type: 'security_policy', target_type: 'data_classification' },
  security_policy_requires_threat_model: { forward_verb: 'requires', reverse_verb: 'required_by', classification: 'hierarchy', source_type: 'security_policy', target_type: 'threat_model' },
  security_policy_schedules_security_review: { forward_verb: 'schedules', reverse_verb: 'scheduled_by', classification: 'hierarchy', source_type: 'security_policy', target_type: 'security_review' },
  security_review_commissions_penetration_test: { forward_verb: 'commissions', reverse_verb: 'commissioned_by', classification: 'hierarchy', source_type: 'security_review', target_type: 'penetration_test' },
  security_policy_governs_incident:       { forward_verb: 'governs',           reverse_verb: 'governed_by',      classification: 'hierarchy',  source_type: 'security_policy',   target_type: 'incident' },
  threat_targets_service: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'threat', target_type: 'service' },
  vulnerability_affects_service: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'vulnerability', target_type: 'service' },
  security_control_mitigates_threat: { forward_verb: 'mitigates', reverse_verb: 'mitigated_by', classification: 'cross-domain', source_type: 'security_control', target_type: 'threat' },
  penetration_test_assesses_service: { forward_verb: 'assesses', reverse_verb: 'assessed_by', classification: 'cross-domain', source_type: 'penetration_test', target_type: 'service' },
  security_control_protects_service: { forward_verb: 'protects', reverse_verb: 'protected_by', classification: 'cross-domain', source_type: 'security_control', target_type: 'service' },
  access_policy_governs_service: { forward_verb: 'governs', reverse_verb: 'governed_by', classification: 'cross-domain', source_type: 'access_policy', target_type: 'service' },
  vulnerability_discovered_by_penetration_test: { forward_verb: 'discovered_by', reverse_verb: 'discovers', classification: 'cross-domain', source_type: 'vulnerability', target_type: 'penetration_test' },
  data_classification_applies_to_data_source: { forward_verb: 'applies_to', reverse_verb: 'classified_by', classification: 'cross-domain', source_type: 'data_classification', target_type: 'data_source' },

  // 3.4 Quality Assurance & Testing Domain
  product_maintains_test_suite: { forward_verb: 'maintains', reverse_verb: 'maintained_by', classification: 'hierarchy', source_type: 'product', target_type: 'test_suite' },
  test_suite_contains_test_case: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'test_suite', target_type: 'test_case' },
  product_undergoes_qa_session: { forward_verb: 'undergoes', reverse_verb: 'conducted_on', classification: 'hierarchy', source_type: 'product', target_type: 'qa_session' },
  test_suite_includes_regression_test: { forward_verb: 'includes', reverse_verb: 'included_in', classification: 'hierarchy', source_type: 'test_suite', target_type: 'regression_test' },
  product_measured_by_test_coverage_report: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'product', target_type: 'test_coverage_report' },
  product_provisioned_in_test_environment: { forward_verb: 'provisioned_in', reverse_verb: 'provisions', classification: 'hierarchy', source_type: 'product', target_type: 'test_environment' },
  qa_session_discovers_bug: { forward_verb: 'discovers', reverse_verb: 'discovered_in', classification: 'hierarchy', source_type: 'qa_session', target_type: 'bug' },
  test_suite_tested_via_qa_session: { forward_verb: 'tested_via', reverse_verb: 'tests', classification: 'hierarchy', source_type: 'test_suite', target_type: 'qa_session' },
  test_suite_measured_by_test_coverage_report: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'test_suite', target_type: 'test_coverage_report' },
  test_suite_deployed_in_test_environment: { forward_verb: 'deployed_in', reverse_verb: 'deploys', classification: 'hierarchy', source_type: 'test_suite', target_type: 'test_environment' },
  test_case_validates_acceptance_criterion: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'test_case', target_type: 'acceptance_criterion' },
  test_suite_covers_feature: { forward_verb: 'covers', reverse_verb: 'covered_by', classification: 'cross-domain', source_type: 'test_suite', target_type: 'feature' },
  test_environment_mirrors_deployment: { forward_verb: 'mirrors', reverse_verb: 'mirrored_by', classification: 'cross-domain', source_type: 'test_environment', target_type: 'deployment' },
  regression_test_guards_release: { forward_verb: 'guards', reverse_verb: 'guarded_by', classification: 'cross-domain', source_type: 'regression_test', target_type: 'release' },
  test_case_covers_user_story: { forward_verb: 'covers', reverse_verb: 'covered_by', classification: 'cross-domain', source_type: 'test_case', target_type: 'user_story' },
  qa_session_targets_feature: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'qa_session', target_type: 'feature' },
  test_coverage_report_covers_service: { forward_verb: 'covers', reverse_verb: 'covered_by', classification: 'cross-domain', source_type: 'test_coverage_report', target_type: 'service' },
  test_suite_produces_test_result:        { forward_verb: 'produces',          reverse_verb: 'produced_by',      classification: 'causal',     source_type: 'test_suite',        target_type: 'test_result' },
  test_case_produces_test_result:         { forward_verb: 'produces',          reverse_verb: 'produced_by',      classification: 'causal',     source_type: 'test_case',         target_type: 'test_result' },

  // 3.5 Accessibility Domain
  product_conforms_to_a11y_standard: { forward_verb: 'conforms_to', reverse_verb: 'applies_to', classification: 'hierarchy', source_type: 'product', target_type: 'a11y_standard' },
  a11y_standard_contains_a11y_guideline: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'a11y_standard', target_type: 'a11y_guideline' },
  product_audited_by_a11y_audit: { forward_verb: 'audited_by', reverse_verb: 'audits', classification: 'hierarchy', source_type: 'product', target_type: 'a11y_audit' },
  a11y_audit_discovers_a11y_issue: { forward_verb: 'discovers', reverse_verb: 'discovered_in', classification: 'hierarchy', source_type: 'a11y_audit', target_type: 'a11y_issue' },
  product_annotated_with_a11y_annotation: { forward_verb: 'annotated_with', reverse_verb: 'annotates', classification: 'hierarchy', source_type: 'product', target_type: 'a11y_annotation' },
  a11y_standard_verified_by_a11y_audit: { forward_verb: 'verified_by', reverse_verb: 'verifies', classification: 'hierarchy', source_type: 'a11y_standard', target_type: 'a11y_audit' },
  a11y_standard_annotated_with_a11y_annotation: { forward_verb: 'annotated_with', reverse_verb: 'annotates', classification: 'hierarchy', source_type: 'a11y_standard', target_type: 'a11y_annotation' },
  a11y_issue_affects_design_component: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'a11y_issue', target_type: 'design_component' },
  a11y_audit_covers_feature: { forward_verb: 'covers', reverse_verb: 'covered_by', classification: 'cross-domain', source_type: 'a11y_audit', target_type: 'feature' },

  // 3.6 AI/ML Operations Domain
  product_powered_by_ai_model: { forward_verb: 'powered_by', reverse_verb: 'powers', classification: 'hierarchy', source_type: 'product', target_type: 'ai_model' },
  ai_model_prompted_via_prompt_version: { forward_verb: 'prompted_via', reverse_verb: 'prompts', classification: 'hierarchy', source_type: 'ai_model', target_type: 'prompt_version' },
  ai_model_benchmarked_by_eval_benchmark: { forward_verb: 'benchmarked_by', reverse_verb: 'benchmarks', classification: 'hierarchy', source_type: 'ai_model', target_type: 'eval_benchmark' },
  eval_benchmark_executed_as_eval_run: { forward_verb: 'executed_as', reverse_verb: 'executes', classification: 'hierarchy', source_type: 'eval_benchmark', target_type: 'eval_run' },
  ai_model_costed_by_ai_cost_tracker: { forward_verb: 'costed_by', reverse_verb: 'costs', classification: 'hierarchy', source_type: 'ai_model', target_type: 'ai_cost_tracker' },
  ai_model_flagged_by_hallucination_report: { forward_verb: 'flagged_by', reverse_verb: 'flags', classification: 'hierarchy', source_type: 'ai_model', target_type: 'hallucination_report' },
  ai_model_constrained_by_ai_guardrail: { forward_verb: 'constrained_by', reverse_verb: 'constrains', classification: 'hierarchy', source_type: 'ai_model', target_type: 'ai_guardrail' },
  product_compared_via_model_comparison: { forward_verb: 'compared_via', reverse_verb: 'compares', classification: 'hierarchy', source_type: 'product', target_type: 'model_comparison' },
  ai_model_compared_in_model_comparison: { forward_verb: 'compared_in', reverse_verb: 'compares', classification: 'hierarchy', source_type: 'ai_model', target_type: 'model_comparison' },
  prompt_version_evolves_prompt_template: { forward_verb: 'evolves', reverse_verb: 'evolved_by', classification: 'cross-domain', source_type: 'prompt_version', target_type: 'prompt_template' },
  eval_benchmark_measures_feature: { forward_verb: 'measures', reverse_verb: 'measured_by', classification: 'cross-domain', source_type: 'eval_benchmark', target_type: 'feature' },
  ai_guardrail_enforces_security_policy: { forward_verb: 'enforces', reverse_verb: 'enforced_by', classification: 'cross-domain', source_type: 'ai_guardrail', target_type: 'security_policy' },
  model_comparison_informs_decision: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'model_comparison', target_type: 'decision' },
  ai_cost_tracker_feeds_cost_structure: { forward_verb: 'feeds', reverse_verb: 'fed_by', classification: 'cross-domain', source_type: 'ai_cost_tracker', target_type: 'cost_structure' },
  ai_model_evaluated_through_ai_experiment: { forward_verb: 'evaluated_through', reverse_verb: 'evaluates',     classification: 'hierarchy',  source_type: 'ai_model',          target_type: 'ai_experiment' },
  ai_model_trained_on_ai_dataset:         { forward_verb: 'trained_on',        reverse_verb: 'trains',           classification: 'hierarchy',  source_type: 'ai_model',          target_type: 'ai_dataset' },
  ai_model_produces_ai_trace:             { forward_verb: 'produces',          reverse_verb: 'produced_by',      classification: 'causal',     source_type: 'ai_model',          target_type: 'ai_trace' },

  // 3.7 Agentic Workflows & Process Domain
  product_automated_via_workflow_template: { forward_verb: 'automated_via', reverse_verb: 'automates', classification: 'hierarchy', source_type: 'product', target_type: 'workflow_template' },
  workflow_template_executed_as_workflow_run: { forward_verb: 'executed_as', reverse_verb: 'executes', classification: 'hierarchy', source_type: 'workflow_template', target_type: 'workflow_run' },
  product_assisted_by_agent_definition: { forward_verb: 'assisted_by', reverse_verb: 'assists', classification: 'hierarchy', source_type: 'product', target_type: 'agent_definition' },
  agent_definition_runs_agent_session: { forward_verb: 'runs', reverse_verb: 'run_by', classification: 'hierarchy', source_type: 'agent_definition', target_type: 'agent_session' },
  workflow_template_gated_by_review_gate: { forward_verb: 'gated_by', reverse_verb: 'gates', classification: 'hierarchy', source_type: 'workflow_template', target_type: 'review_gate' },
  review_gate_approved_via_approval_record: { forward_verb: 'approved_via', reverse_verb: 'approves', classification: 'hierarchy', source_type: 'review_gate', target_type: 'approval_record' },
  agent_definition_capable_of_agent_skill: { forward_verb: 'capable_of', reverse_verb: 'enables', classification: 'hierarchy', source_type: 'agent_definition', target_type: 'agent_skill' },
  agent_definition_triggered_via_agent_hook: { forward_verb: 'triggered_via', reverse_verb: 'triggers', classification: 'hierarchy', source_type: 'agent_definition', target_type: 'agent_hook' },
  workflow_run_produces_workflow_artifact: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'hierarchy', source_type: 'workflow_run', target_type: 'workflow_artifact' },
  agent_definition_orchestrates_workflow_template: { forward_verb: 'orchestrates', reverse_verb: 'orchestrated_by', classification: 'hierarchy', source_type: 'agent_definition', target_type: 'workflow_template' },
  workflow_run_implements_initiative: { forward_verb: 'implements', reverse_verb: 'implemented_by', classification: 'cross-domain', source_type: 'workflow_run', target_type: 'initiative' },
  agent_session_creates_decision: { forward_verb: 'creates', reverse_verb: 'created_by', classification: 'cross-domain', source_type: 'agent_session', target_type: 'decision' },
  review_gate_blocks_release: { forward_verb: 'blocks', reverse_verb: 'blocked_by', classification: 'cross-domain', source_type: 'review_gate', target_type: 'release' },
  agent_skill_extends_feature: { forward_verb: 'extends', reverse_verb: 'extended_by', classification: 'cross-domain', source_type: 'agent_skill', target_type: 'feature' },
  workflow_artifact_references_deliverable: { forward_verb: 'references', reverse_verb: 'referenced_by', classification: 'cross-domain', source_type: 'workflow_artifact', target_type: 'deliverable' },
  agent_hook_triggers_ci_pipeline: { forward_verb: 'triggers', reverse_verb: 'triggered_by', classification: 'cross-domain', source_type: 'agent_hook', target_type: 'ci_pipeline' },
  workflow_template_defines_agent_task:   { forward_verb: 'defines',           reverse_verb: 'defined_by',       classification: 'hierarchy',  source_type: 'workflow_template', target_type: 'agent_task' },
  agent_definition_spawns_agent_task:     { forward_verb: 'spawns',            reverse_verb: 'spawned_by',       classification: 'hierarchy',  source_type: 'agent_definition',  target_type: 'agent_task' },

  // ── Part 4: Scale Ring (Ring 4) ────────────────────────────────────────────

  // 4.1 Growth Domain
  product_measures_funnel: { forward_verb: 'measures', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'product', target_type: 'funnel' },
  product_acquires_via_acquisition_channel: { forward_verb: 'acquires_via', reverse_verb: 'acquires_for', classification: 'hierarchy', source_type: 'product', target_type: 'acquisition_channel' },
  product_segments_into_cohort: { forward_verb: 'segments_into', reverse_verb: 'segmented_for', classification: 'hierarchy', source_type: 'product', target_type: 'cohort' },
  product_segments_into_behavioral_segment: { forward_verb: 'segments_into', reverse_verb: 'segmented_for', classification: 'hierarchy', source_type: 'product', target_type: 'behavioral_segment' },
  product_grows_via_growth_loop: { forward_verb: 'grows_via', reverse_verb: 'grows', classification: 'hierarchy', source_type: 'product', target_type: 'growth_loop' },
  product_attributed_via_attribution_model: { forward_verb: 'attributed_via', reverse_verb: 'attributes', classification: 'hierarchy', source_type: 'product', target_type: 'attribution_model' },
  // v0.7.2 ( §1): attribution = distributing credit across channels (the definition); connects the isolated `attribution_model` member to the acquisition_channel hub.
  attribution_model_credits_acquisition_channel: { forward_verb: 'credits', reverse_verb: 'credited_by', classification: 'semantic', source_type: 'attribution_model', target_type: 'acquisition_channel' },
  product_guided_by_metric: { forward_verb: 'guided_by', reverse_verb: 'guides', classification: 'hierarchy', source_type: 'product', target_type: 'metric' },
  funnel_contains_funnel_step: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'funnel', target_type: 'funnel_step' },
  acquisition_channel_runs_growth_campaign: { forward_verb: 'runs', reverse_verb: 'run_by', classification: 'hierarchy', source_type: 'acquisition_channel', target_type: 'growth_campaign' },
  growth_campaign_tests_variant:          { forward_verb: 'tests',             reverse_verb: 'tested_in',        classification: 'hierarchy',  source_type: 'growth_campaign',   target_type: 'variant' },
  growth_campaign_tests_via_experiment_plan: { forward_verb: 'tests_via', reverse_verb: 'tested_in', classification: 'hierarchy', source_type: 'growth_campaign', target_type: 'experiment_plan' },
  // variant is owned by growth_campaign in the hierarchy; experiments
  // test them via a semantic relationship.
  experiment_run_tests_variant: { forward_verb: 'tests', reverse_verb: 'tested_in', classification: 'semantic', source_type: 'experiment_run', target_type: 'variant' },
  metric_decomposed_into_metric: { forward_verb: 'decomposed_into', reverse_verb: 'rolls_up_to', classification: 'hierarchy', source_type: 'metric', target_type: 'metric' },
  metric_drives_metric: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'causal', source_type: 'metric', target_type: 'metric' },
  funnel_step_reveals_need: { forward_verb: 'reveals', reverse_verb: 'visible_in', classification: 'cross-domain', source_type: 'funnel_step', target_type: 'need' },
  funnel_step_tracks_event_schema: { forward_verb: 'tracks', reverse_verb: 'fires_in', classification: 'cross-domain', source_type: 'funnel_step', target_type: 'event_schema' },
  marketing_channel_drives_funnel: { forward_verb: 'drives', reverse_verb: 'fed_by', classification: 'cross-domain', source_type: 'marketing_channel', target_type: 'funnel' },
  metric_measures_key_result: { forward_verb: 'measures', reverse_verb: 'measured_by', classification: 'cross-domain', source_type: 'metric', target_type: 'key_result' },
  behavioral_segment_maps_to_persona: { forward_verb: 'maps_to', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'behavioral_segment', target_type: 'persona' },
  cohort_exposed_to_experiment_run: { forward_verb: 'exposed_to', reverse_verb: 'exposes', classification: 'cross-domain', source_type: 'cohort', target_type: 'experiment_run' },
  acquisition_channel_drives_outcome: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'cross-domain', source_type: 'acquisition_channel', target_type: 'outcome' },
  growth_campaign_targets_behavioral_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'growth_campaign', target_type: 'behavioral_segment' },
  growth_loop_drives_metric: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'cross-domain', source_type: 'growth_loop', target_type: 'metric' },
  // v0.7.2 ( §1): growth loops are the engine behind sustainable channels (Reforge); connects the isolated `growth_loop` member to the acquisition_channel hub.
  growth_loop_fuels_acquisition_channel: { forward_verb: 'fuels', reverse_verb: 'fueled_by', classification: 'semantic', source_type: 'growth_loop', target_type: 'acquisition_channel' },
  variant_tests_hypothesis: { forward_verb: 'tests', reverse_verb: 'tested_by', classification: 'cross-domain', source_type: 'variant', target_type: 'hypothesis' },
  experiment_plan_targets_behavioral_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'experiment_plan', target_type: 'behavioral_segment' },
  funnel_maps_persona: { forward_verb: 'maps', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'funnel', target_type: 'persona' },
  cohort_represents_persona: { forward_verb: 'represents', reverse_verb: 'represented_by', classification: 'cross-domain', source_type: 'cohort', target_type: 'persona' },
  acquisition_channel_targets_behavioral_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'acquisition_channel', target_type: 'behavioral_segment' },
  acquisition_channel_reaches_persona: { forward_verb: 'reaches', reverse_verb: 'reached_by', classification: 'cross-domain', source_type: 'acquisition_channel', target_type: 'persona' },

  // 4.2 Business Model Domain
  product_monetised_via_business_model: { forward_verb: 'monetised_via', reverse_verb: 'monetises', classification: 'hierarchy', source_type: 'product', target_type: 'business_model' },
  business_model_delivers_value_proposition: { forward_verb: 'delivers', reverse_verb: 'delivered_by', classification: 'hierarchy', source_type: 'business_model', target_type: 'value_proposition' },
  business_model_earns_via_revenue_stream: { forward_verb: 'earns_via', reverse_verb: 'earns_for', classification: 'hierarchy', source_type: 'business_model', target_type: 'revenue_stream' },
  business_model_costs_via_cost_structure: { forward_verb: 'costs_via', reverse_verb: 'costs', classification: 'hierarchy', source_type: 'business_model', target_type: 'cost_structure' },
  business_model_measured_by_unit_economics: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'business_model', target_type: 'unit_economics' },
  business_model_partnered_via_partnership: { forward_verb: 'partnered_via', reverse_verb: 'partners_with', classification: 'hierarchy', source_type: 'business_model', target_type: 'partnership' },
  business_model_requires_key_resource: { forward_verb: 'requires', reverse_verb: 'required_by', classification: 'hierarchy', source_type: 'business_model', target_type: 'key_resource' },
  business_model_performs_key_activity: { forward_verb: 'performs', reverse_verb: 'performed_by', classification: 'hierarchy', source_type: 'business_model', target_type: 'key_activity' },
  business_model_targets_market_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'business_model', target_type: 'market_segment' },
  business_model_reaches_via_distribution_channel: { forward_verb: 'reaches_via', reverse_verb: 'reaches_for', classification: 'hierarchy', source_type: 'business_model', target_type: 'distribution_channel' },
  business_model_maintains_customer_relationship: { forward_verb: 'maintains', reverse_verb: 'maintained_by', classification: 'hierarchy', source_type: 'business_model', target_type: 'customer_relationship' },
  business_model_distributes_via_distribution_channel: { forward_verb: 'distributes_via', reverse_verb: 'distributes_for', classification: 'hierarchy', source_type: 'business_model', target_type: 'distribution_channel' },
  revenue_stream_tiered_as_pricing_tier: { forward_verb: 'tiered_as', reverse_verb: 'tiers', classification: 'hierarchy', source_type: 'revenue_stream', target_type: 'pricing_tier' },
  // metric isn't contained by revenue_stream / cost_structure.
  // These are measurement relationships: semantic, not containment.
  revenue_stream_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'semantic', source_type: 'revenue_stream', target_type: 'metric' },
  cost_structure_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'semantic', source_type: 'cost_structure', target_type: 'metric' },
  value_proposition_targets_persona: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'value_proposition', target_type: 'persona' },
  // (since v0.4.0) canonical replacement for the removed
  // `ValueProposition.gain_creators` string property. Link each gain
  // (`outcome`) the proposition delivers structurally.
  value_proposition_delivers_outcome: { forward_verb: 'delivers', reverse_verb: 'delivered_by', classification: 'cross-domain', source_type: 'value_proposition', target_type: 'outcome' },
  // (since v0.4.0) canonical replacement for the removed
  // `ValueProposition.jobs_addressed` string property. Link each
  // jobs-to-be-done the proposition addresses structurally.
  value_proposition_addresses_job: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'value_proposition', target_type: 'job' },
  // (since v0.4.0) canonical replacement for the removed
  // `ValueProposition.pain_reliefs` string property. A pain is modelled
  // as a `need` with `valence='pain'`; link each pain the proposition
  // relieves structurally.
  value_proposition_solves_need: { forward_verb: 'solves', reverse_verb: 'solved_by', classification: 'cross-domain', source_type: 'value_proposition', target_type: 'need' },
  value_proposition_targets_persona_cross_domain: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'value_proposition', target_type: 'persona' },
  revenue_stream_drives_metric: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'cross-domain', source_type: 'revenue_stream', target_type: 'metric' },
  // Ring 5 structural edges
  funnel_step_maps_to_journey_step: { forward_verb: 'maps_to', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'funnel', target_type: 'journey_step' },
  customer_journey_stage_contains_funnel_step: { forward_verb: 'contains', reverse_verb: 'contained_in', classification: 'cross-domain', source_type: 'customer_journey_stage', target_type: 'funnel' },
  customer_journey_stage_spans_journey_step: { forward_verb: 'spans', reverse_verb: 'spanned_by', classification: 'cross-domain', source_type: 'customer_journey_stage', target_type: 'journey_step' },
  dependency_blocks_team: { forward_verb: 'blocks', reverse_verb: 'blocked_by', classification: 'cross-domain', source_type: 'dependency', target_type: 'team' },
  dependency_depends_on_team: { forward_verb: 'depends_on', reverse_verb: 'depended_on_by', classification: 'cross-domain', source_type: 'dependency', target_type: 'team' },
  program_implements_initiative: { forward_verb: 'implements', reverse_verb: 'implemented_by', classification: 'cross-domain', source_type: 'program', target_type: 'initiative' },
  playbook_triggered_by_customer_health_score: { forward_verb: 'triggered_by', reverse_verb: 'triggers', classification: 'cross-domain', source_type: 'playbook', target_type: 'customer_health_score' },

  // edges replacing deleted string properties with proper edges
  partnership_with_integration_partner: { forward_verb: 'with', reverse_verb: 'partners_with', classification: 'cross-domain', source_type: 'partnership', target_type: 'integration_partner' },
  market_segment_includes_persona: { forward_verb: 'includes', reverse_verb: 'included_in', classification: 'cross-domain', source_type: 'market_segment', target_type: 'persona' },
  // inverse direction so resolve_edge_for_pair(persona, market_segment) resolves
  persona_belongs_to_market_segment: { forward_verb: 'belongs_to', reverse_verb: 'includes_persona', classification: 'cross-domain', source_type: 'persona', target_type: 'market_segment' },
  revenue_stream_priced_by_pricing_strategy: { forward_verb: 'priced_by', reverse_verb: 'prices', classification: 'cross-domain', source_type: 'revenue_stream', target_type: 'pricing_strategy' },
  revenue_stream_drives_outcome: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'cross-domain', source_type: 'revenue_stream', target_type: 'outcome' },
  revenue_stream_measured_by_metric_cross_domain: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'cross-domain', source_type: 'revenue_stream', target_type: 'metric' },
  pricing_tier_targets_behavioral_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'pricing_tier', target_type: 'behavioral_segment' },
  key_resource_enables_value_proposition: { forward_verb: 'enables', reverse_verb: 'enabled_by', classification: 'cross-domain', source_type: 'key_resource', target_type: 'value_proposition' },

  // 4.3 Go-To-Market Domain
  product_goes_to_market_via_gtm_strategy: { forward_verb: 'goes_to_market_via', reverse_verb: 'markets', classification: 'hierarchy', source_type: 'product', target_type: 'gtm_strategy' },
  gtm_strategy_targets_ideal_customer_profile: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'hierarchy', source_type: 'gtm_strategy', target_type: 'ideal_customer_profile' },
  gtm_strategy_positions_via_positioning: { forward_verb: 'positions_via', reverse_verb: 'positions', classification: 'hierarchy', source_type: 'gtm_strategy', target_type: 'positioning' },
  gtm_strategy_launches_via_launch: { forward_verb: 'launches_via', reverse_verb: 'launches', classification: 'hierarchy', source_type: 'gtm_strategy', target_type: 'launch' },
  gtm_strategy_educates_via_content_strategy: { forward_verb: 'educates_via', reverse_verb: 'educates', classification: 'hierarchy', source_type: 'gtm_strategy', target_type: 'content_strategy' },
  gtm_strategy_sells_via_sales_motion: { forward_verb: 'sells_via', reverse_verb: 'sells', classification: 'hierarchy', source_type: 'gtm_strategy', target_type: 'sales_motion' },
  gtm_strategy_arms_with_competitive_battle_card: { forward_verb: 'arms_with', reverse_verb: 'arms', classification: 'hierarchy', source_type: 'gtm_strategy', target_type: 'competitive_battle_card' },
  gtm_strategy_generates_demand_via_demand_gen_program: { forward_verb: 'generates_demand_via', reverse_verb: 'generates', classification: 'hierarchy', source_type: 'gtm_strategy', target_type: 'demand_gen_program' },
  gtm_strategy_operates_in_territory: { forward_verb: 'operates_in', reverse_verb: 'operates_for', classification: 'hierarchy', source_type: 'gtm_strategy', target_type: 'territory' },
  positioning_communicated_via_messaging: { forward_verb: 'communicated_via', reverse_verb: 'communicates', classification: 'hierarchy', source_type: 'positioning', target_type: 'messaging' },
  positioning_challenged_by_objection: { forward_verb: 'challenged_by', reverse_verb: 'challenges', classification: 'hierarchy', source_type: 'positioning', target_type: 'objection' },
  positioning_evidenced_by_proof_point: { forward_verb: 'evidenced_by', reverse_verb: 'evidences', classification: 'hierarchy', source_type: 'positioning', target_type: 'proof_point' },
  value_proposition_challenged_by_objection: { forward_verb: 'challenged_by', reverse_verb: 'challenges', classification: 'hierarchy', source_type: 'value_proposition', target_type: 'objection' },
  value_proposition_evidenced_by_proof_point: { forward_verb: 'evidenced_by', reverse_verb: 'evidences', classification: 'hierarchy', source_type: 'value_proposition', target_type: 'proof_point' },
  competitive_battle_card_addresses_objection: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'hierarchy', source_type: 'competitive_battle_card', target_type: 'objection' },
  objection_countered_by_rebuttal: { forward_verb: 'countered_by', reverse_verb: 'counters', classification: 'hierarchy', source_type: 'objection', target_type: 'rebuttal' },
  rebuttal_evidenced_by_proof_point: { forward_verb: 'evidenced_by', reverse_verb: 'evidences', classification: 'hierarchy', source_type: 'rebuttal', target_type: 'proof_point' },
  positioning_references_competitor: { forward_verb: 'references', reverse_verb: 'referenced_by', classification: 'cross-domain', source_type: 'positioning', target_type: 'competitor' },
  positioning_resonates_with_persona: { forward_verb: 'resonates_with', reverse_verb: 'resonated_by', classification: 'cross-domain', source_type: 'positioning', target_type: 'persona' },
  positioning_differentiates_from_competitor: { forward_verb: 'differentiates_from', reverse_verb: 'differentiated_by', classification: 'cross-domain', source_type: 'positioning', target_type: 'competitor' },
  ideal_customer_profile_maps_to_behavioral_segment: { forward_verb: 'maps_to', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'ideal_customer_profile', target_type: 'behavioral_segment' },
  ideal_customer_profile_maps_to_persona: { forward_verb: 'maps_to', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'ideal_customer_profile', target_type: 'persona' },
  ideal_customer_profile_targets_behavioral_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'ideal_customer_profile', target_type: 'behavioral_segment' },
  launch_ships_with_release: { forward_verb: 'ships_with', reverse_verb: 'shipped_in', classification: 'cross-domain', source_type: 'launch', target_type: 'release' },
  launch_amplified_by_growth_campaign: { forward_verb: 'amplified_by', reverse_verb: 'amplifies', classification: 'cross-domain', source_type: 'launch', target_type: 'growth_campaign' },
  launch_ships_feature: { forward_verb: 'ships', reverse_verb: 'shipped_in', classification: 'cross-domain', source_type: 'launch', target_type: 'feature' },
  launch_announces_release: { forward_verb: 'announces', reverse_verb: 'announced_by', classification: 'cross-domain', source_type: 'launch', target_type: 'release' },
  messaging_targets_persona: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'messaging', target_type: 'persona' },
  competitive_battle_card_references_competitor: { forward_verb: 'references', reverse_verb: 'referenced_by', classification: 'cross-domain', source_type: 'competitive_battle_card', target_type: 'competitor' },
  competitor_feature_inspires_feature: { forward_verb: 'inspires', reverse_verb: 'inspired_by', classification: 'cross-domain', source_type: 'competitor_feature', target_type: 'feature' },
  territory_maps_to_behavioral_segment: { forward_verb: 'maps_to', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'territory', target_type: 'behavioral_segment' },

  // GTM restructure: new structural and provenance edges
  positioning_differentiates_via_value_proposition: { forward_verb: 'differentiates_via', reverse_verb: 'differentiates_for', classification: 'cross-domain', source_type: 'positioning', target_type: 'value_proposition' },
  positioning_within_market_segment: { forward_verb: 'within', reverse_verb: 'positioned_by', classification: 'cross-domain', source_type: 'positioning', target_type: 'market_segment' },
  ideal_customer_profile_targets_market_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'ideal_customer_profile', target_type: 'market_segment' },
  launch_amplified_by_marketing_channel: { forward_verb: 'amplified_by', reverse_verb: 'amplifies', classification: 'cross-domain', source_type: 'launch', target_type: 'marketing_channel' },
  sales_motion_qualifies_via_funnel_step: { forward_verb: 'qualifies_via', reverse_verb: 'qualifies_for', classification: 'cross-domain', source_type: 'sales_motion', target_type: 'funnel' },
  objection_sourced_from_quote: { forward_verb: 'sourced_from', reverse_verb: 'surfaced_objection', classification: 'cross-domain', source_type: 'objection', target_type: 'quote' },
  proof_point_derived_from_evidence: { forward_verb: 'derived_from', reverse_verb: 'evidences', classification: 'cross-domain', source_type: 'proof_point', target_type: 'evidence' },
  proof_point_derived_from_insight: { forward_verb: 'derived_from', reverse_verb: 'evidences', classification: 'cross-domain', source_type: 'proof_point', target_type: 'insight' },

  // 4.4 Pricing & Packaging Domain
  product_priced_via_pricing_strategy: { forward_verb: 'priced_via', reverse_verb: 'prices', classification: 'hierarchy', source_type: 'product', target_type: 'pricing_strategy' },
  pricing_strategy_tests_experiment_plan: { forward_verb: 'tests', reverse_verb: 'tested_by', classification: 'hierarchy', source_type: 'pricing_strategy', target_type: 'experiment_plan' },
  pricing_strategy_offers_pricing_tier: { forward_verb: 'offers', reverse_verb: 'offered_by', classification: 'hierarchy', source_type: 'pricing_strategy', target_type: 'pricing_tier' },
  pricing_strategy_discounts_via_discount_strategy: { forward_verb: 'discounts_via', reverse_verb: 'discounts', classification: 'hierarchy', source_type: 'pricing_strategy', target_type: 'discount_strategy' },
  pricing_strategy_trials_via_trial_config: { forward_verb: 'trials_via', reverse_verb: 'trials', classification: 'hierarchy', source_type: 'pricing_strategy', target_type: 'trial_config' },
  pricing_strategy_gates_via_paywall: { forward_verb: 'gates_via', reverse_verb: 'gates', classification: 'hierarchy', source_type: 'pricing_strategy', target_type: 'paywall' },
  pricing_tier_includes_feature: { forward_verb: 'includes', reverse_verb: 'included_in', classification: 'cross-domain', source_type: 'pricing_tier', target_type: 'feature' },
  pricing_tier_gated_by_paywall: { forward_verb: 'gated_by', reverse_verb: 'gates_tier', classification: 'cross-domain', source_type: 'pricing_tier', target_type: 'paywall' },
  pricing_tier_trialed_via_trial_config: { forward_verb: 'trialed_via', reverse_verb: 'trials_tier', classification: 'cross-domain', source_type: 'pricing_tier', target_type: 'trial_config' },
  pricing_tier_discounted_by_discount_strategy: { forward_verb: 'discounted_by', reverse_verb: 'discounts_tier', classification: 'cross-domain', source_type: 'pricing_tier', target_type: 'discount_strategy' },
  experiment_run_tests_pricing_tier: { forward_verb: 'tests', reverse_verb: 'tested_by', classification: 'cross-domain', source_type: 'experiment_run', target_type: 'pricing_tier' },
  trial_config_unlocks_feature: { forward_verb: 'unlocks', reverse_verb: 'unlocked_by', classification: 'cross-domain', source_type: 'trial_config', target_type: 'feature' },
  trial_config_drives_funnel: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'cross-domain', source_type: 'trial_config', target_type: 'funnel' },
  paywall_gates_feature: { forward_verb: 'gates', reverse_verb: 'gated_by', classification: 'cross-domain', source_type: 'paywall', target_type: 'feature' },
  discount_strategy_targets_behavioral_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'discount_strategy', target_type: 'behavioral_segment' },
  pricing_tier_localised_as_regional_pricing: { forward_verb: 'localised_as', reverse_verb: 'localises', classification: 'cross-domain', source_type: 'pricing_tier', target_type: 'regional_pricing' },

  // 4.5 Sales & Revenue Domain
  product_sold_via_pipeline_sales: { forward_verb: 'sold_via', reverse_verb: 'sells', classification: 'hierarchy', source_type: 'product', target_type: 'pipeline_sales' },
  pipeline_sales_contains_pipeline_stage: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'pipeline_sales', target_type: 'pipeline_stage' },
  product_serves_account: { forward_verb: 'serves', reverse_verb: 'served_by', classification: 'hierarchy', source_type: 'product', target_type: 'account' },
  account_contains_contact: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'account', target_type: 'contact' },
  account_negotiates_deal: { forward_verb: 'negotiates', reverse_verb: 'negotiated_by', classification: 'hierarchy', source_type: 'account', target_type: 'deal' },
  product_attracts_lead: { forward_verb: 'attracts', reverse_verb: 'attracted_to', classification: 'hierarchy', source_type: 'product', target_type: 'lead' },
  deal_quoted_via_quote_document: { forward_verb: 'quoted_via', reverse_verb: 'quotes', classification: 'hierarchy', source_type: 'deal', target_type: 'quote_document' },
  product_subscribed_via_subscription: { forward_verb: 'subscribed_via', reverse_verb: 'subscribes', classification: 'hierarchy', source_type: 'product', target_type: 'subscription' },
  subscription_billed_via_invoice: { forward_verb: 'billed_via', reverse_verb: 'bills', classification: 'hierarchy', source_type: 'subscription', target_type: 'invoice' },
  product_forecasted_via_forecast: { forward_verb: 'forecasted_via', reverse_verb: 'forecasts', classification: 'hierarchy', source_type: 'product', target_type: 'forecast' },
  pipeline_sales_qualifies_lead: { forward_verb: 'qualifies', reverse_verb: 'qualified_in', classification: 'hierarchy', source_type: 'pipeline_sales', target_type: 'lead' },
  pipeline_sales_manages_account: { forward_verb: 'manages', reverse_verb: 'managed_in', classification: 'hierarchy', source_type: 'pipeline_sales', target_type: 'account' },
  pipeline_sales_projected_via_forecast: { forward_verb: 'projected_via', reverse_verb: 'projects', classification: 'hierarchy', source_type: 'pipeline_sales', target_type: 'forecast' },
  pipeline_sales_converts_to_subscription: { forward_verb: 'converts_to', reverse_verb: 'converted_from', classification: 'hierarchy', source_type: 'pipeline_sales', target_type: 'subscription' },
  deal_references_ideal_customer_profile: { forward_verb: 'references', reverse_verb: 'referenced_by', classification: 'cross-domain', source_type: 'deal', target_type: 'ideal_customer_profile' },
  lead_becomes_account: { forward_verb: 'becomes', reverse_verb: 'originated_as', classification: 'causal', source_type: 'lead', target_type: 'account' },
  subscription_drives_revenue_stream: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'cross-domain', source_type: 'subscription', target_type: 'revenue_stream' },
  forecast_predicts_revenue_stream: { forward_verb: 'predicts', reverse_verb: 'predicted_by', classification: 'cross-domain', source_type: 'forecast', target_type: 'revenue_stream' },
  // v0.7.2 ( §1): a forecast is the forward projection of a metric; connects the isolated `forecast` member to the analytics anchor.
  forecast_projects_metric: { forward_verb: 'projects', reverse_verb: 'projected_by', classification: 'cross-domain', source_type: 'forecast', target_type: 'metric' },

  // 4.6 Marketing & Communications Domain
  product_markets_through_marketing_strategy: { forward_verb: 'markets_through', reverse_verb: 'markets', classification: 'hierarchy', source_type: 'product', target_type: 'marketing_strategy' },
  marketing_strategy_activates_marketing_channel: { forward_verb: 'activates', reverse_verb: 'activated_by', classification: 'hierarchy', source_type: 'marketing_strategy', target_type: 'marketing_channel' },
  marketing_strategy_targets_seo_keyword: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'hierarchy', source_type: 'marketing_strategy', target_type: 'seo_keyword' },
  marketing_strategy_publishes_press_release: { forward_verb: 'publishes', reverse_verb: 'published_by', classification: 'hierarchy', source_type: 'marketing_strategy', target_type: 'press_release' },
  marketing_strategy_hosts_event: { forward_verb: 'hosts', reverse_verb: 'hosted_by', classification: 'hierarchy', source_type: 'marketing_strategy', target_type: 'event' },
  marketing_strategy_builds_community_via_community_initiative: { forward_verb: 'builds_community_via', reverse_verb: 'builds_for', classification: 'hierarchy', source_type: 'marketing_strategy', target_type: 'community_initiative' },
  marketing_channel_runs_marketing_campaign_plan: { forward_verb: 'runs', reverse_verb: 'run_by', classification: 'hierarchy', source_type: 'marketing_channel', target_type: 'marketing_campaign_plan' },
  marketing_campaign_plan_sends_email_sequence: { forward_verb: 'sends', reverse_verb: 'sent_by', classification: 'hierarchy', source_type: 'marketing_campaign_plan', target_type: 'email_sequence' },
  marketing_campaign_plan_publishes_social_post: { forward_verb: 'publishes', reverse_verb: 'published_by', classification: 'hierarchy', source_type: 'marketing_campaign_plan', target_type: 'social_post' },
  marketing_campaign_plan_runs_ad_creative: { forward_verb: 'runs', reverse_verb: 'run_by', classification: 'hierarchy', source_type: 'marketing_campaign_plan', target_type: 'ad_creative' },
  product_announced_via_press_release: { forward_verb: 'announced_via', reverse_verb: 'announces', classification: 'hierarchy', source_type: 'product', target_type: 'press_release' },
  product_hosts_event: { forward_verb: 'hosts', reverse_verb: 'hosted_by', classification: 'hierarchy', source_type: 'product', target_type: 'event' },
  product_engages_via_community_initiative: { forward_verb: 'engages_via', reverse_verb: 'engages', classification: 'hierarchy', source_type: 'product', target_type: 'community_initiative' },
  marketing_campaign_plan_targets_behavioral_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'marketing_campaign_plan', target_type: 'behavioral_segment' },
  event_generates_lead: { forward_verb: 'generates', reverse_verb: 'generated_at', classification: 'cross-domain', source_type: 'event', target_type: 'lead' },
  seo_keyword_drives_content_piece: { forward_verb: 'drives', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'seo_keyword', target_type: 'content_piece' },
  ad_creative_references_messaging: { forward_verb: 'references', reverse_verb: 'expressed_in', classification: 'cross-domain', source_type: 'ad_creative', target_type: 'messaging' },
  community_initiative_surfaces_insight_about_persona: { forward_verb: 'surfaces_insight_about', reverse_verb: 'understood_through', classification: 'cross-domain', source_type: 'community_initiative', target_type: 'persona' },

  // ── Part 5: Operate Ring (Ring 5) ──────────────────────────────────────────

  // 5.1 Operations & Customer Success Domain
  product_supports_via_support_ticket: { forward_verb: 'supports_via', reverse_verb: 'supports', classification: 'hierarchy', source_type: 'product', target_type: 'support_ticket' },
  product_listens_via_customer_feedback: { forward_verb: 'listens_via', reverse_verb: 'listened_to', classification: 'hierarchy', source_type: 'product', target_type: 'customer_feedback' },
  product_loses_because_churn_reason: { forward_verb: 'loses_because', reverse_verb: 'causes_churn_for', classification: 'hierarchy', source_type: 'product', target_type: 'churn_reason' },
  product_onboards_via_user_flow: { forward_verb: 'onboards_via', reverse_verb: 'onboards', classification: 'hierarchy', source_type: 'product', target_type: 'user_flow' },
  product_health_scored_via_customer_health_score: { forward_verb: 'health_scored_via', reverse_verb: 'scores', classification: 'hierarchy', source_type: 'product', target_type: 'customer_health_score' },
  product_operated_via_playbook: { forward_verb: 'operated_via', reverse_verb: 'operates', classification: 'hierarchy', source_type: 'product', target_type: 'playbook' },
  product_guarantees_via_service_level_agreement: { forward_verb: 'guarantees_via', reverse_verb: 'guarantees', classification: 'hierarchy', source_type: 'product', target_type: 'service_level_agreement' },
  product_celebrates_via_success_milestone: { forward_verb: 'celebrates_via', reverse_verb: 'celebrates', classification: 'hierarchy', source_type: 'product', target_type: 'success_milestone' },
  product_blueprinted_via_service_blueprint: { forward_verb: 'blueprinted_via', reverse_verb: 'blueprints', classification: 'hierarchy', source_type: 'product', target_type: 'service_blueprint' },
  product_measured_by_nps_campaign: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'product', target_type: 'nps_campaign' },
  service_blueprint_contains_user_flow: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'service_blueprint', target_type: 'user_flow' },
  service_blueprint_contains_playbook: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'service_blueprint', target_type: 'playbook' },
  service_blueprint_contains_service_level_agreement: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'service_blueprint', target_type: 'service_level_agreement' },
  service_blueprint_contains_customer_health_score: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'service_blueprint', target_type: 'customer_health_score' },
  service_blueprint_contains_support_ticket: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'service_blueprint', target_type: 'support_ticket' },
  service_blueprint_contains_customer_feedback: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'service_blueprint', target_type: 'customer_feedback' },
  customer_health_score_tracked_by_nps_campaign: { forward_verb: 'tracked_by', reverse_verb: 'tracks', classification: 'hierarchy', source_type: 'customer_health_score', target_type: 'nps_campaign' },
  customer_health_score_contains_success_milestone: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'customer_health_score', target_type: 'success_milestone' },
  customer_feedback_reveals_churn_reason: { forward_verb: 'reveals', reverse_verb: 'revealed_by', classification: 'hierarchy', source_type: 'customer_feedback', target_type: 'churn_reason' },
  user_flow_contains_customer_journey_stage: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'user_flow', target_type: 'customer_journey_stage' },
  customer_journey_stage_contains_touchpoint: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'customer_journey_stage', target_type: 'touchpoint' },
  support_ticket_reveals_need: { forward_verb: 'reveals', reverse_verb: 'revealed_by_ticket', classification: 'cross-domain', source_type: 'support_ticket', target_type: 'need' },
  customer_feedback_creates_observation: { forward_verb: 'creates', reverse_verb: 'created_from_feedback', classification: 'cross-domain', source_type: 'customer_feedback', target_type: 'observation' },
  churn_reason_generates_hypothesis: { forward_verb: 'generates', reverse_verb: 'generated_from_churn', classification: 'cross-domain', source_type: 'churn_reason', target_type: 'hypothesis' },
  user_flow_maps_user_journey: { forward_verb: 'maps', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'user_flow', target_type: 'user_journey' },
  service_level_agreement_governs_service: { forward_verb: 'governs', reverse_verb: 'governed_by_sla', classification: 'cross-domain', source_type: 'service_level_agreement', target_type: 'service' },
  touchpoint_occurs_in_journey_step: { forward_verb: 'occurs_in', reverse_verb: 'has_touchpoint', classification: 'cross-domain', source_type: 'touchpoint', target_type: 'journey_step' },
  nps_campaign_tracks_customer_health_score: { forward_verb: 'tracks', reverse_verb: 'tracked_by_nps', classification: 'cross-domain', source_type: 'nps_campaign', target_type: 'customer_health_score' },
  playbook_targets_customer_journey_stage: { forward_verb: 'targets', reverse_verb: 'targeted_by_playbook', classification: 'cross-domain', source_type: 'playbook', target_type: 'customer_journey_stage' },
  success_milestone_validates_outcome: { forward_verb: 'validates', reverse_verb: 'validated_by_milestone', classification: 'cross-domain', source_type: 'success_milestone', target_type: 'outcome' },
  customer_health_score_informs_playbook: { forward_verb: 'informs', reverse_verb: 'informed_by_health_score', classification: 'cross-domain', source_type: 'customer_health_score', target_type: 'playbook' },
  customer_feedback_becomes_feature_request: { forward_verb: 'becomes', reverse_verb: 'originated_from', classification: 'cross-domain', source_type: 'customer_feedback', target_type: 'feature_request' },
  support_ticket_reports_bug: { forward_verb: 'reports', reverse_verb: 'reported_by', classification: 'cross-domain', source_type: 'support_ticket', target_type: 'bug' },
  support_ticket_reveals_need_cross_domain: { forward_verb: 'reveals', reverse_verb: 'revealed_by', classification: 'cross-domain', source_type: 'support_ticket', target_type: 'need' },
  churn_reason_reveals_need: { forward_verb: 'reveals', reverse_verb: 'revealed_by', classification: 'cross-domain', source_type: 'churn_reason', target_type: 'need' },

  // 5.2 Content & Knowledge Domain
  product_publishes_content_piece: { forward_verb: 'publishes', reverse_verb: 'published_by', classification: 'hierarchy', source_type: 'product', target_type: 'content_piece' },
  product_documents_in_knowledge_base_article: { forward_verb: 'documents_in', reverse_verb: 'documented_by', classification: 'hierarchy', source_type: 'product', target_type: 'knowledge_base_article' },
  product_expressed_via_brand_asset: { forward_verb: 'expressed_via', reverse_verb: 'expresses', classification: 'hierarchy', source_type: 'product', target_type: 'brand_asset' },
  product_documented_in_document: { forward_verb: 'documented_in', reverse_verb: 'documents', classification: 'hierarchy', source_type: 'product', target_type: 'document' },
  product_prompted_via_prompt_template: { forward_verb: 'prompted_via', reverse_verb: 'prompts', classification: 'hierarchy', source_type: 'product', target_type: 'prompt_template' },
  product_templated_via_documentation_template: { forward_verb: 'templated_via', reverse_verb: 'templates', classification: 'hierarchy', source_type: 'product', target_type: 'documentation_template' },
  product_records_in_document: { forward_verb: 'records_in', reverse_verb: 'records', classification: 'hierarchy', source_type: 'product', target_type: 'document' },
  content_strategy_scheduled_in_content_calendar: { forward_verb: 'scheduled_in', reverse_verb: 'schedules', classification: 'hierarchy', source_type: 'content_strategy', target_type: 'content_calendar' },
  content_strategy_themed_by_content_theme: { forward_verb: 'themed_by', reverse_verb: 'themes', classification: 'hierarchy', source_type: 'content_strategy', target_type: 'content_theme' },
  content_calendar_contains_content_theme: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'content_calendar', target_type: 'content_theme' },
  content_calendar_schedules_content_piece: { forward_verb: 'schedules', reverse_verb: 'scheduled_in', classification: 'hierarchy', source_type: 'content_calendar', target_type: 'content_piece' },
  content_calendar_schedules_knowledge_base_article: { forward_verb: 'schedules', reverse_verb: 'scheduled_in', classification: 'hierarchy', source_type: 'content_calendar', target_type: 'knowledge_base_article' },
  content_calendar_schedules_brand_asset: { forward_verb: 'schedules', reverse_verb: 'scheduled_in', classification: 'hierarchy', source_type: 'content_calendar', target_type: 'brand_asset' },
  content_calendar_schedules_document: { forward_verb: 'schedules', reverse_verb: 'scheduled_in', classification: 'hierarchy', source_type: 'content_calendar', target_type: 'document' },
  content_calendar_schedules_prompt_template: { forward_verb: 'schedules', reverse_verb: 'scheduled_in', classification: 'hierarchy', source_type: 'content_calendar', target_type: 'prompt_template' },
  content_calendar_schedules_documentation_template: { forward_verb: 'schedules', reverse_verb: 'scheduled_in', classification: 'hierarchy', source_type: 'content_calendar', target_type: 'documentation_template' },
  content_piece_supports_messaging: { forward_verb: 'supports', reverse_verb: 'supported_by', classification: 'cross-domain', source_type: 'content_piece', target_type: 'messaging' },
  content_piece_part_of_growth_campaign: { forward_verb: 'part_of', reverse_verb: 'includes', classification: 'cross-domain', source_type: 'content_piece', target_type: 'growth_campaign' },
  knowledge_base_article_documents_feature: { forward_verb: 'documents', reverse_verb: 'documented_by', classification: 'cross-domain', source_type: 'knowledge_base_article', target_type: 'feature' },
  changelog_documents_release: { forward_verb: 'documents', reverse_verb: 'documented_in', classification: 'cross-domain', source_type: 'changelog', target_type: 'release' },
  prompt_template_powers_feature: { forward_verb: 'powers', reverse_verb: 'powered_by', classification: 'cross-domain', source_type: 'prompt_template', target_type: 'feature' },
  content_theme_targets_persona: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'content_theme', target_type: 'persona' },
  // v0.7.2 ( §1): topic-cluster / content-pillar model; themes organize pieces. Connects the isolated `content_theme` AND `content_piece` members.
  content_theme_organizes_content_piece: { forward_verb: 'organizes', reverse_verb: 'organized_under', classification: 'semantic', source_type: 'content_theme', target_type: 'content_piece' },
  // Document Provenance Edges
  document_describes_feature: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'feature' },
  document_describes_vision: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'vision' },
  document_describes_persona: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'persona' },
  document_describes_competitor: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'competitor' },
  document_describes_strategic_pillar: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'strategic_pillar' },
  document_describes_market_segment: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'market_segment' },
  document_describes_revenue_stream: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'revenue_stream' },
  document_describes_positioning: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'positioning' },
  document_describes_decision: { forward_verb: 'describes', reverse_verb: 'described_by', classification: 'semantic', source_type: 'document', target_type: 'decision' },
  document_contains_insight: { forward_verb: 'contains', reverse_verb: 'contained_in', classification: 'semantic', source_type: 'document', target_type: 'insight' },

  // 5.3 Customer Education & Training Domain
  product_educates_via_education_program: { forward_verb: 'educates_via', reverse_verb: 'educates', classification: 'hierarchy', source_type: 'product', target_type: 'education_program' },
  education_program_teaches_via_tutorial: { forward_verb: 'teaches_via', reverse_verb: 'teaches', classification: 'hierarchy', source_type: 'education_program', target_type: 'tutorial' },
  education_program_guides_via_walkthrough: { forward_verb: 'guides_via', reverse_verb: 'guides', classification: 'hierarchy', source_type: 'education_program', target_type: 'walkthrough' },
  education_program_presents_via_webinar: { forward_verb: 'presents_via', reverse_verb: 'presents', classification: 'hierarchy', source_type: 'education_program', target_type: 'webinar' },
  education_program_certifies_via_certification: { forward_verb: 'certifies_via', reverse_verb: 'certifies', classification: 'hierarchy', source_type: 'education_program', target_type: 'certification' },
  education_program_demonstrates_via_help_video: { forward_verb: 'demonstrates_via', reverse_verb: 'demonstrates', classification: 'hierarchy', source_type: 'education_program', target_type: 'help_video' },
  education_program_structures_via_learning_path: { forward_verb: 'structures_via', reverse_verb: 'structures', classification: 'hierarchy', source_type: 'education_program', target_type: 'learning_path' },
  learning_path_contains_tutorial: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'learning_path', target_type: 'tutorial' },
  learning_path_includes_certification: { forward_verb: 'includes', reverse_verb: 'included_in_path', classification: 'hierarchy', source_type: 'learning_path', target_type: 'certification' },
  tutorial_explains_feature: { forward_verb: 'explains', reverse_verb: 'explained_by_tutorial', classification: 'cross-domain', source_type: 'tutorial', target_type: 'feature' },
  walkthrough_maps_user_flow: { forward_verb: 'maps', reverse_verb: 'mapped_by_walkthrough', classification: 'cross-domain', source_type: 'walkthrough', target_type: 'user_flow' },
  certification_validates_skill: { forward_verb: 'validates', reverse_verb: 'validated_by_certification', classification: 'cross-domain', source_type: 'certification', target_type: 'skill' },
  help_video_documents_screen: { forward_verb: 'documents', reverse_verb: 'documented_by_video', classification: 'cross-domain', source_type: 'help_video', target_type: 'screen' },
  tutorial_references_knowledge_base_article: { forward_verb: 'references', reverse_verb: 'referenced_by_tutorial', classification: 'cross-domain', source_type: 'tutorial', target_type: 'knowledge_base_article' },
  webinar_generates_content_piece: { forward_verb: 'generates', reverse_verb: 'generated_from_webinar', classification: 'cross-domain', source_type: 'webinar', target_type: 'content_piece' },

  // ── Part 6: Extend Ring (Ring 6) ───────────────────────────────────────────

  // 6.1 Team & Organisation Domain
  product_staffed_by_team: { forward_verb: 'staffed_by', reverse_verb: 'staffs', classification: 'hierarchy', source_type: 'product', target_type: 'team' },
  product_influenced_by_stakeholder: { forward_verb: 'influenced_by', reverse_verb: 'influences', classification: 'hierarchy', source_type: 'product', target_type: 'stakeholder' },
  product_decided_via_decision_hierarchy: { forward_verb: 'decided_via', reverse_verb: 'decides', classification: 'hierarchy', source_type: 'product', target_type: 'decision' },
  product_organised_into_department: { forward_verb: 'organised_into', reverse_verb: 'organises', classification: 'hierarchy', source_type: 'product', target_type: 'department' },
  department_contains_team: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'department', target_type: 'team' },
  department_includes_stakeholder: { forward_verb: 'includes', reverse_verb: 'included_in', classification: 'hierarchy', source_type: 'department', target_type: 'stakeholder' },
  // NOTE: `person` is a containment-free entity type (see
  // UPG_CONTAINMENT_FREE_TYPES in grammar/hierarchy.ts). It is referenced
  // by other nodes via `node_owned_by_person` but is not structurally
  // contained by product / department / team. Hierarchy edges for person
  // are deliberately omitted; adding them only to satisfy a hierarchy
  // audit would invert the orthogonality the type was introduced to express.
  team_staffed_with_role: { forward_verb: 'staffed_with', reverse_verb: 'staffed_in', classification: 'hierarchy', source_type: 'team', target_type: 'role' },
  team_targets_team_okr: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'hierarchy', source_type: 'team', target_type: 'team_okr' },
  team_reflects_in_retrospective: { forward_verb: 'reflects_in', reverse_verb: 'reflects', classification: 'hierarchy', source_type: 'team', target_type: 'retrospective' },
  team_depends_on_dependency: { forward_verb: 'depends_on', reverse_verb: 'dependency_of', classification: 'hierarchy', source_type: 'team', target_type: 'dependency' },
  team_skilled_in_skill: { forward_verb: 'skilled_in', reverse_verb: 'skilled_by', classification: 'hierarchy', source_type: 'team', target_type: 'skill' },
  team_practices_ceremony: { forward_verb: 'practices', reverse_verb: 'practiced_by', classification: 'hierarchy', source_type: 'team', target_type: 'ceremony' },
  team_planned_via_capacity_plan: { forward_verb: 'planned_via', reverse_verb: 'plans', classification: 'hierarchy', source_type: 'team', target_type: 'capacity_plan' },
  team_decides_decision: { forward_verb: 'decides', reverse_verb: 'decided_by', classification: 'hierarchy', source_type: 'team', target_type: 'decision' },
  decision_references_decision: { forward_verb: 'references', reverse_verb: 'referenced_by', classification: 'cross-domain', source_type: 'decision', target_type: 'decision' },
  stakeholder_maps_to_persona: { forward_verb: 'maps_to', reverse_verb: 'mapped_by', classification: 'cross-domain', source_type: 'stakeholder', target_type: 'persona' },
  team_okr_aligns_with_objective: { forward_verb: 'aligns_with', reverse_verb: 'aligned_by', classification: 'cross-domain', source_type: 'team_okr', target_type: 'objective' },
  team_okr_aligns_with_key_result: { forward_verb: 'aligns_with', reverse_verb: 'aligned_by', classification: 'cross-domain', source_type: 'team_okr', target_type: 'key_result' },
  ceremony_involves_team: { forward_verb: 'involves', reverse_verb: 'involved_in', classification: 'cross-domain', source_type: 'ceremony', target_type: 'team' },

  // 6.2 Program Management Domain
  product_managed_via_program: { forward_verb: 'managed_via', reverse_verb: 'manages', classification: 'hierarchy', source_type: 'product', target_type: 'program' },
  program_contains_project: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'program', target_type: 'project' },
  project_targets_milestone: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'hierarchy', source_type: 'project', target_type: 'milestone' },
  project_produces_deliverable: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'hierarchy', source_type: 'project', target_type: 'deliverable' },
  program_tracked_via_risk_register: { forward_verb: 'tracked_via', reverse_verb: 'tracks', classification: 'hierarchy', source_type: 'program', target_type: 'risk_register' },
  risk_register_contains_risk: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'risk_register', target_type: 'risk' },
  program_changed_via_change_request: { forward_verb: 'changed_via', reverse_verb: 'changes', classification: 'hierarchy', source_type: 'program', target_type: 'change_request' },
  program_resourced_via_resource_allocation: { forward_verb: 'resourced_via', reverse_verb: 'resources', classification: 'hierarchy', source_type: 'program', target_type: 'resource_allocation' },
  program_reported_via_status_report: { forward_verb: 'reported_via', reverse_verb: 'reports', classification: 'hierarchy', source_type: 'program', target_type: 'status_report' },
  program_contains_epic: { forward_verb: 'contains', reverse_verb: 'contained_in', classification: 'cross-domain', source_type: 'program', target_type: 'epic' },
  project_implements_initiative: { forward_verb: 'implements', reverse_verb: 'implemented_by', classification: 'cross-domain', source_type: 'project', target_type: 'initiative' },
  project_delivers_epic: { forward_verb: 'delivers', reverse_verb: 'delivered_by', classification: 'cross-domain', source_type: 'project', target_type: 'epic' },
  milestone_gates_release: { forward_verb: 'gates', reverse_verb: 'gated_by', classification: 'cross-domain', source_type: 'milestone', target_type: 'release' },
  milestone_triggers_release: { forward_verb: 'triggers', reverse_verb: 'triggered_by', classification: 'cross-domain', source_type: 'milestone', target_type: 'release' },
  deliverable_ships_feature: { forward_verb: 'ships', reverse_verb: 'shipped_by', classification: 'cross-domain', source_type: 'deliverable', target_type: 'feature' },

  // 6.3 Compliance Domain
  product_constrained_by_compliance_requirement: { forward_verb: 'constrained_by', reverse_verb: 'constrains', classification: 'hierarchy', source_type: 'product', target_type: 'compliance_requirement' },
  product_exposed_to_risk: { forward_verb: 'exposed_to', reverse_verb: 'exposes', classification: 'hierarchy', source_type: 'product', target_type: 'risk' },
  product_bound_by_data_contract: { forward_verb: 'bound_by', reverse_verb: 'binds', classification: 'hierarchy', source_type: 'product', target_type: 'data_contract' },
  product_audited_via_audit_log_policy: { forward_verb: 'audited_via', reverse_verb: 'audits', classification: 'hierarchy', source_type: 'product', target_type: 'audit_log_policy' },
  product_governed_by_compliance_framework: { forward_verb: 'governed_by', reverse_verb: 'governs', classification: 'hierarchy', source_type: 'product', target_type: 'compliance_framework' },
  compliance_framework_mandates_compliance_requirement: { forward_verb: 'mandates', reverse_verb: 'mandated_by', classification: 'hierarchy', source_type: 'compliance_framework', target_type: 'compliance_requirement' },
  compliance_framework_verified_by_security_audit: { forward_verb: 'verified_by', reverse_verb: 'verifies', classification: 'hierarchy', source_type: 'compliance_framework', target_type: 'security_audit' },
  compliance_framework_requires_privacy_policy: { forward_verb: 'requires', reverse_verb: 'required_by', classification: 'hierarchy', source_type: 'compliance_framework', target_type: 'privacy_policy' },
  compliance_framework_requires_audit_log_policy: { forward_verb: 'requires', reverse_verb: 'required_by', classification: 'hierarchy', source_type: 'compliance_framework', target_type: 'audit_log_policy' },
  compliance_framework_identifies_risk: { forward_verb: 'identifies', reverse_verb: 'identified_by', classification: 'hierarchy', source_type: 'compliance_framework', target_type: 'risk' },
  compliance_framework_governs_data_contract: { forward_verb: 'governs', reverse_verb: 'governed_by', classification: 'hierarchy', source_type: 'compliance_framework', target_type: 'data_contract' },
  compliance_framework_applies_to_legal_entity: { forward_verb: 'applies_to', reverse_verb: 'subject_to', classification: 'hierarchy', source_type: 'compliance_framework', target_type: 'legal_entity' },
  compliance_requirement_constrains_feature: { forward_verb: 'constrains', reverse_verb: 'constrained_by', classification: 'cross-domain', source_type: 'compliance_requirement', target_type: 'feature' },
  compliance_requirement_constrains_decision: { forward_verb: 'constrains', reverse_verb: 'constrained_by', classification: 'cross-domain', source_type: 'compliance_requirement', target_type: 'decision' },
  risk_manifests_as_technical_debt_item: { forward_verb: 'manifests_as', reverse_verb: 'manifested_by', classification: 'cross-domain', source_type: 'risk', target_type: 'technical_debt_item' },
  data_contract_governs_data_source: { forward_verb: 'governs', reverse_verb: 'governed_by', classification: 'cross-domain', source_type: 'data_contract', target_type: 'data_source' },
  compliance_framework_requires_security_control: { forward_verb: 'requires', reverse_verb: 'required_by', classification: 'cross-domain', source_type: 'compliance_framework', target_type: 'security_control' },
  security_audit_validates_compliance_framework: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'security_audit', target_type: 'compliance_framework' },

  // 6.4 Localisation & i18n Domain
  product_localised_in_locale: { forward_verb: 'localised_in', reverse_verb: 'localises', classification: 'hierarchy', source_type: 'product', target_type: 'locale' },
  product_configured_via_locale_config: { forward_verb: 'configured_via', reverse_verb: 'configures', classification: 'hierarchy', source_type: 'product', target_type: 'locale_config' },
  locale_translated_via_translation_bundle: { forward_verb: 'translated_via', reverse_verb: 'translates', classification: 'hierarchy', source_type: 'locale', target_type: 'translation_bundle' },
  locale_adapted_via_cultural_adaptation: { forward_verb: 'adapted_via', reverse_verb: 'adapts', classification: 'hierarchy', source_type: 'locale', target_type: 'cultural_adaptation' },
  locale_priced_in_regional_pricing: { forward_verb: 'priced_in', reverse_verb: 'prices_for', classification: 'hierarchy', source_type: 'locale', target_type: 'regional_pricing' },
  locale_configured_via_locale_config: { forward_verb: 'configured_via', reverse_verb: 'configures', classification: 'hierarchy', source_type: 'locale', target_type: 'locale_config' },
  translation_bundle_contains_translation_key: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'translation_bundle', target_type: 'translation_key' },
  screen_translated_via_translation_bundle: { forward_verb: 'translated_via', reverse_verb: 'translates', classification: 'cross-domain', source_type: 'screen', target_type: 'translation_bundle' },
  cultural_adaptation_targets_persona: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'cultural_adaptation', target_type: 'persona' },

  // 6.5 Partner & Ecosystem Management Domain
  product_partnered_via_partner_program: { forward_verb: 'partnered_via', reverse_verb: 'partners', classification: 'hierarchy', source_type: 'product', target_type: 'partner_program' },
  partner_program_tiers_as_partner_tier: { forward_verb: 'tiers_as', reverse_verb: 'tiered_by', classification: 'hierarchy', source_type: 'partner_program', target_type: 'partner_tier' },
  product_exposed_via_api_ecosystem: { forward_verb: 'exposed_via', reverse_verb: 'exposes', classification: 'hierarchy', source_type: 'product', target_type: 'api_ecosystem' },
  api_ecosystem_lists_marketplace_listing: { forward_verb: 'lists', reverse_verb: 'listed_in', classification: 'hierarchy', source_type: 'api_ecosystem', target_type: 'marketplace_listing' },
  product_documented_via_developer_portal: { forward_verb: 'documented_via', reverse_verb: 'documents', classification: 'hierarchy', source_type: 'product', target_type: 'developer_portal' },
  partner_program_includes_integration_partner: { forward_verb: 'includes', reverse_verb: 'included_in', classification: 'hierarchy', source_type: 'partner_program', target_type: 'integration_partner' },
  partner_program_shares_revenue_via_partner_revenue_share: { forward_verb: 'shares_revenue_via', reverse_verb: 'shares', classification: 'hierarchy', source_type: 'partner_program', target_type: 'partner_revenue_share' },
  partner_program_exposes_api_ecosystem: { forward_verb: 'exposes', reverse_verb: 'exposed_by', classification: 'hierarchy', source_type: 'partner_program', target_type: 'api_ecosystem' },
  partner_program_documents_developer_portal: { forward_verb: 'documents', reverse_verb: 'documented_by', classification: 'hierarchy', source_type: 'partner_program', target_type: 'developer_portal' },
  api_ecosystem_exposes_api_endpoint: { forward_verb: 'exposes', reverse_verb: 'exposed_through_ecosystem', classification: 'cross-domain', source_type: 'api_ecosystem', target_type: 'api_endpoint' },
  marketplace_listing_extends_feature: { forward_verb: 'extends', reverse_verb: 'extended_by_listing', classification: 'cross-domain', source_type: 'marketplace_listing', target_type: 'feature' },
  integration_partner_connects_external_api: { forward_verb: 'connects', reverse_verb: 'connected_by_partner', classification: 'cross-domain', source_type: 'integration_partner', target_type: 'external_api' },
  developer_portal_documents_api_contract: { forward_verb: 'documents', reverse_verb: 'documented_in_portal', classification: 'cross-domain', source_type: 'developer_portal', target_type: 'api_contract' },
  partner_tier_qualifies_integration_partner: { forward_verb: 'qualifies', reverse_verb: 'qualified_by_tier', classification: 'cross-domain', source_type: 'partner_tier', target_type: 'integration_partner' },
  partner_revenue_share_governs_partner_tier: { forward_verb: 'governs', reverse_verb: 'governed_by_rev_share', classification: 'cross-domain', source_type: 'partner_revenue_share', target_type: 'partner_tier' },
  marketplace_listing_references_help_video: { forward_verb: 'references', reverse_verb: 'referenced_by_listing', classification: 'cross-domain', source_type: 'marketplace_listing', target_type: 'help_video' },

  // ── Part 7: Data & Analytics Domain ───────────────────────────────────────

  product_ingests_from_data_source: { forward_verb: 'ingests_from', reverse_verb: 'ingested_by', classification: 'hierarchy', source_type: 'product', target_type: 'data_source' },
  product_tracks_via_event_schema: { forward_verb: 'tracks_via', reverse_verb: 'tracks', classification: 'hierarchy', source_type: 'product', target_type: 'event_schema' },
  product_visualised_in_dashboard: { forward_verb: 'visualised_in', reverse_verb: 'visualises', classification: 'hierarchy', source_type: 'product', target_type: 'dashboard' },
  product_organised_into_data_domain: { forward_verb: 'organised_into', reverse_verb: 'organises', classification: 'hierarchy', source_type: 'product', target_type: 'data_domain' },
  product_defined_by_glossary_term: { forward_verb: 'defined_by', reverse_verb: 'defines', classification: 'hierarchy', source_type: 'product', target_type: 'glossary_term' },
  data_source_defines_metric: { forward_verb: 'defines', reverse_verb: 'defined_by', classification: 'hierarchy', source_type: 'data_source', target_type: 'metric' },
  data_source_processed_via_data_pipeline: { forward_verb: 'processed_via', reverse_verb: 'processes', classification: 'hierarchy', source_type: 'data_source', target_type: 'data_pipeline' },
  data_source_traced_via_data_lineage: { forward_verb: 'traced_via', reverse_verb: 'traces', classification: 'hierarchy', source_type: 'data_source', target_type: 'data_lineage' },
  data_source_emits_event_schema: { forward_verb: 'emits', reverse_verb: 'emitted_by', classification: 'hierarchy', source_type: 'data_source', target_type: 'event_schema' },
  metric_validated_by_data_quality_rule: { forward_verb: 'validated_by', reverse_verb: 'validates', classification: 'hierarchy', source_type: 'metric', target_type: 'data_quality_rule' },
  data_domain_produces_data_product: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'hierarchy', source_type: 'data_domain', target_type: 'data_product' },
  data_domain_contains_data_source: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'data_domain', target_type: 'data_source' },
  data_domain_defines_glossary_term: { forward_verb: 'defines', reverse_verb: 'defined_in', classification: 'hierarchy', source_type: 'data_domain', target_type: 'glossary_term' },
  data_domain_modelled_in_data_model: { forward_verb: 'modelled_in', reverse_verb: 'models', classification: 'hierarchy', source_type: 'data_domain', target_type: 'data_model' },
  data_domain_visualised_in_dashboard: { forward_verb: 'visualised_in', reverse_verb: 'visualises', classification: 'hierarchy', source_type: 'data_domain', target_type: 'dashboard' },
  dashboard_contains_report: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'dashboard', target_type: 'report' },
  dashboard_contains_experiment_run: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'dashboard', target_type: 'experiment_run' },
  metric_measures_metric: { forward_verb: 'measures', reverse_verb: 'measured_by', classification: 'cross-domain', source_type: 'metric', target_type: 'metric' },
  metric_measures_metric_cross_domain: { forward_verb: 'measures', reverse_verb: 'measured_by', classification: 'cross-domain', source_type: 'metric', target_type: 'metric' },
  // `experiment_tests_hypothesis` dropped, superseded by
  // the canonical `experiment_run_validates_hypothesis` (causal) introduced
  // in v0.2.6. Authors expressing "this experiment tests this hypothesis"
  // should use the validates edge from the run side.
  // `experiment_tests_experiment` was a near-duplicate of
  // `experiment_tested_via_experiment` and is consolidated into the single
  // canonical `experiment_run_tested_via_experiment_run` edge above.
  event_schema_tracks_funnel_step: { forward_verb: 'tracks', reverse_verb: 'tracked_by', classification: 'cross-domain', source_type: 'event_schema', target_type: 'funnel_step' },
  dashboard_tracks_metric: { forward_verb: 'tracks', reverse_verb: 'tracked_by', classification: 'cross-domain', source_type: 'dashboard', target_type: 'metric' },
  data_product_serves_dashboard: { forward_verb: 'serves', reverse_verb: 'served_by', classification: 'cross-domain', source_type: 'data_product', target_type: 'dashboard' },
  data_pipeline_feeds_data_product: { forward_verb: 'feeds', reverse_verb: 'fed_by', classification: 'cross-domain', source_type: 'data_pipeline', target_type: 'data_product' },

  // ── Part 8: Portfolio & Workspace (Nucleus) ────────────────────────────────

  // 8.1 Portfolio Hierarchy
  organization_invests_via_portfolio: { forward_verb: 'invests_via', reverse_verb: 'invested_in_by', classification: 'hierarchy', source_type: 'organization', target_type: 'portfolio' },
  organization_organised_into_product_area: { forward_verb: 'organised_into', reverse_verb: 'organised_by', classification: 'hierarchy', source_type: 'organization', target_type: 'product_area' },
  portfolio_contains_product: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'portfolio', target_type: 'product' },
  product_area_contains_product: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'product_area', target_type: 'product' },
  portfolio_contains_portfolio: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'portfolio', target_type: 'portfolio' },
  product_area_contains_product_area: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'product_area', target_type: 'product_area' },
  // decision B: product_area groups features (the natural "Studio area owns 6 features" mental model)
  product_area_contains_feature: { forward_verb: 'contains', reverse_verb: 'belongs_to', classification: 'hierarchy', source_type: 'product_area', target_type: 'feature' },
  product_categorised_in_product_area: { forward_verb: 'categorised_in', reverse_verb: 'categorises', classification: 'hierarchy', source_type: 'product', target_type: 'product_area' },

  // 8.2 Cross-Product Edges
  // direct product-level shorthand edges for market-intelligence shapes.
  // These are shortcuts: canonical deep paths go via competitive_analysis and gtm_strategy.
  // Use these edges when the intermediate anchor node hasn't been authored yet.
  product_has_competitor: { forward_verb: 'has', reverse_verb: 'is_competitor_of', classification: 'cross-domain', source_type: 'product', target_type: 'competitor' },
  product_addresses_market_segment: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'product', target_type: 'market_segment' },
  product_has_positioning: { forward_verb: 'has', reverse_verb: 'is_positioning_for', classification: 'cross-domain', source_type: 'product', target_type: 'positioning' },
  product_has_feature_request: { forward_verb: 'has', reverse_verb: 'is_request_for', classification: 'cross-domain', source_type: 'product', target_type: 'feature_request' },
  product_shares_persona_with_product: { forward_verb: 'shares_persona_with', reverse_verb: 'shares_persona_with', classification: 'semantic', source_type: 'product', target_type: 'product' },
  product_shares_competitor_with_product: { forward_verb: 'shares_competitor_with', reverse_verb: 'shares_competitor_with', classification: 'semantic', source_type: 'product', target_type: 'product' },
  product_shares_metric_with_product: { forward_verb: 'shares_metric_with', reverse_verb: 'shares_metric_with', classification: 'semantic', source_type: 'product', target_type: 'product' },
  product_depends_on_product: { forward_verb: 'depends_on', reverse_verb: 'dependency_of', classification: 'semantic', source_type: 'product', target_type: 'product' },
  product_cannibalises_product: { forward_verb: 'cannibalises', reverse_verb: 'cannibalised_by', classification: 'causal', source_type: 'product', target_type: 'product' },
  product_succeeds_product: { forward_verb: 'succeeds', reverse_verb: 'succeeded_by', classification: 'causal', source_type: 'product', target_type: 'product' },

  // 8.3 Workspace Edges
  product_thinks_in_workspace: { forward_verb: 'thinks_in', reverse_verb: 'thinks_for', classification: 'hierarchy', source_type: 'product', target_type: 'workspace' },
  workspace_produced_decision: { forward_verb: 'produced', reverse_verb: 'produced_in', classification: 'causal', source_type: 'workspace', target_type: 'decision' },

  // ── P14 edges (replacing foreign-key properties) ─────────────────────────
  feature_addresses_job: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'feature', target_type: 'job' },
  feature_drives_key_result: { forward_verb: 'drives', reverse_verb: 'driven_by', classification: 'cross-domain', source_type: 'feature', target_type: 'key_result' },
  quote_relates_to_job: { forward_verb: 'relates_to', reverse_verb: 'evidenced_by_quote', classification: 'cross-domain', source_type: 'quote', target_type: 'job' },
  // changelog is a historical record; features it references are
  // owned by feature_area / theme / product. Relationship is semantic.
  changelog_includes_feature: { forward_verb: 'includes', reverse_verb: 'included_in', classification: 'semantic', source_type: 'changelog', target_type: 'feature' },
  ai_trace_spawns_ai_trace: { forward_verb: 'spawns', reverse_verb: 'spawned_by', classification: 'hierarchy', source_type: 'ai_trace', target_type: 'ai_trace' },

  // ── Part 9: Cross-Layer Influence Edges ────────────────────────────────────

  product_expressed_as_design_component: { forward_verb: 'expressed_as', reverse_verb: 'expresses', classification: 'cross-domain', source_type: 'product', target_type: 'design_component' },
  product_manifests_in_design_component: { forward_verb: 'manifests_in', reverse_verb: 'manifested_by', classification: 'cross-domain', source_type: 'product', target_type: 'design_component' },
  product_enables_flow_user_flow: { forward_verb: 'enables_flow', reverse_verb: 'flow_enabled_by', classification: 'cross-domain', source_type: 'product', target_type: 'user_flow' },
  design_component_surfaces_insight_insight: { forward_verb: 'surfaces_insight', reverse_verb: 'insight_surfaced_by', classification: 'cross-domain', source_type: 'design_component', target_type: 'insight' },
  design_component_specifies_for_service: { forward_verb: 'specifies_for', reverse_verb: 'specified_by', classification: 'cross-domain', source_type: 'design_component', target_type: 'service' },
  design_token_tokenised_as_service: { forward_verb: 'tokenised_as', reverse_verb: 'tokenises', classification: 'cross-domain', source_type: 'design_token', target_type: 'service' },
  design_component_requires_data_from_service: { forward_verb: 'requires_data_from', reverse_verb: 'provides_data_to', classification: 'cross-domain', source_type: 'design_component', target_type: 'service' },
  service_implements_design_component: { forward_verb: 'implements', reverse_verb: 'implemented_by', classification: 'cross-domain', source_type: 'service', target_type: 'design_component' },
  service_constrains_interaction_design_component: { forward_verb: 'constrains_interaction', reverse_verb: 'interaction_constrained_by', classification: 'cross-domain', source_type: 'service', target_type: 'design_component' },
  service_enables_pattern_design_component: { forward_verb: 'enables_pattern', reverse_verb: 'pattern_enabled_by', classification: 'cross-domain', source_type: 'service', target_type: 'design_component' },
  service_constrains_scope_product: { forward_verb: 'constrains_scope', reverse_verb: 'scope_constrained_by', classification: 'cross-domain', source_type: 'service', target_type: 'product' },
  node_informs_node: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'semantic', source_type: 'node', target_type: 'node' },
  node_constrains_node: { forward_verb: 'constrains', reverse_verb: 'constrained_by', classification: 'semantic', source_type: 'node', target_type: 'node' },
  node_inspires_node: { forward_verb: 'inspires', reverse_verb: 'inspired_by', classification: 'semantic', source_type: 'node', target_type: 'node' },
  // Decision-Specific Edges
  decision_influences_node: { forward_verb: 'influences', reverse_verb: 'influenced_by', classification: 'semantic', source_type: 'decision', target_type: 'node' },
  decision_constrained_by_node: { forward_verb: 'constrained_by', reverse_verb: 'constrains', classification: 'semantic', source_type: 'decision', target_type: 'node' },
  decision_superseded_by_decision: { forward_verb: 'superseded_by', reverse_verb: 'supersedes', classification: 'causal', source_type: 'decision', target_type: 'decision' },
  decision_produces_node: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'causal', source_type: 'decision', target_type: 'node' },
  // Design-Decision Cross-Domain Edges
  decision_affects_design_component: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'decision', target_type: 'design_component' },
  decision_affects_screen: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'decision', target_type: 'screen' },
  decision_informs_decision: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'decision', target_type: 'decision' },
  // Constraint edges: typed source = a `constraint` entity. The
  // pre-existing polymorphic `node_constrains_node` (line above) stays for
  // arbitrary constrain-relationships between any entities; these typed
  // edges are what authors and renderers reach for when the source is a
  // named Constraint node.
  constraint_constrains_feature: { forward_verb: 'constrains', reverse_verb: 'constrained_by', classification: 'cross-domain', source_type: 'constraint', target_type: 'feature' },
  constraint_constrains_initiative: { forward_verb: 'constrains', reverse_verb: 'constrained_by', classification: 'semantic', source_type: 'constraint', target_type: 'initiative' },
  constraint_constrains_metric: { forward_verb: 'constrains', reverse_verb: 'constrained_by', classification: 'semantic', source_type: 'constraint', target_type: 'metric' },
  constraint_owned_by_team: { forward_verb: 'owned_by', reverse_verb: 'owns', classification: 'cross-domain', source_type: 'constraint', target_type: 'team' },

  // ── Part 10: Research-to-User Cross-Domain Bridges ─────────────────────────

  insight_validates_need: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'insight', target_type: 'need' },
  insight_reveals_desired_outcome: { forward_verb: 'reveals', reverse_verb: 'revealed_by', classification: 'cross-domain', source_type: 'insight', target_type: 'desired_outcome' },
  insight_informs_job: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'insight', target_type: 'job' },
  insight_characterises_persona: { forward_verb: 'characterises', reverse_verb: 'characterised_by', classification: 'cross-domain', source_type: 'insight', target_type: 'persona' },
  insight_validates_need_cross_domain: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'insight', target_type: 'need' },
  observation_reveals_need: { forward_verb: 'reveals', reverse_verb: 'revealed_by', classification: 'cross-domain', source_type: 'observation', target_type: 'need' },
  observation_characterises_persona: { forward_verb: 'characterises', reverse_verb: 'characterised_by', classification: 'cross-domain', source_type: 'observation', target_type: 'persona' },
  quote_evidences_need: { forward_verb: 'evidences', reverse_verb: 'evidenced_by', classification: 'cross-domain', source_type: 'quote', target_type: 'need' },
  quote_evidences_job: { forward_verb: 'evidences', reverse_verb: 'evidenced_by', classification: 'cross-domain', source_type: 'quote', target_type: 'job' },
  insight_enriches_persona: { forward_verb: 'enriches', reverse_verb: 'enriched_by', classification: 'cross-domain', source_type: 'insight', target_type: 'persona' },
  insight_validates_value_proposition: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'insight', target_type: 'value_proposition' },
  insight_validates_strategic_pillar: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'insight', target_type: 'strategic_pillar' },
  insight_surfaces_opportunity: { forward_verb: 'surfaces', reverse_verb: 'surfaced_by', classification: 'cross-domain', source_type: 'insight', target_type: 'opportunity' },
  insight_informs_solution: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'insight', target_type: 'solution' },
  insight_inspires_design_question: { forward_verb: 'inspires', reverse_verb: 'inspired_by', classification: 'cross-domain', source_type: 'insight', target_type: 'design_question' },
  insight_inspires_design_concept: { forward_verb: 'inspires', reverse_verb: 'inspired_by', classification: 'cross-domain', source_type: 'insight', target_type: 'design_concept' },
  observation_yields_insight: { forward_verb: 'yields', reverse_verb: 'yielded_by', classification: 'cross-domain', source_type: 'observation', target_type: 'insight' },
  insight_refines_into_insight: { forward_verb: 'refines_into', reverse_verb: 'refined_from', classification: 'hierarchy', source_type: 'insight', target_type: 'insight' },
  insight_informs_opportunity_cross_domain: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'insight', target_type: 'opportunity' },
  insight_validates_persona: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'insight', target_type: 'persona' },
  // Validation-to-Discovery Feedback Loops
  learning_validates_opportunity: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'learning', target_type: 'opportunity' },
  learning_validates_solution: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'learning', target_type: 'solution' },
  learning_refines_hypothesis: { forward_verb: 'refines', reverse_verb: 'refined_by', classification: 'cross-domain', source_type: 'learning', target_type: 'hypothesis' },
  learning_validates_need: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'learning', target_type: 'need' },
  learning_validates_job: { forward_verb: 'validates', reverse_verb: 'validated_by', classification: 'cross-domain', source_type: 'learning', target_type: 'job' },
  learning_informs_feature: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'learning', target_type: 'feature' },
  evidence_supports_opportunity: { forward_verb: 'supports', reverse_verb: 'supported_by', classification: 'cross-domain', source_type: 'evidence', target_type: 'opportunity' },
  // `evidence_supports_hypothesis` dropped, superseded by
  // the canonical `hypothesis_evidence_supports_hypothesis_claim` edge.
  // The legacy generic `evidence` entity remains valid for non-hypothesis
  // evidence trails (e.g. learning → evidence chains in experiment runs);
  // hypothesis-specific evidence now lives on its own dedicated entity.
  experiment_run_tests_feature: { forward_verb: 'tests', reverse_verb: 'tested_by', classification: 'cross-domain', source_type: 'experiment_run', target_type: 'feature' },
  experiment_run_measures_metric: { forward_verb: 'measures', reverse_verb: 'measured_by', classification: 'cross-domain', source_type: 'experiment_run', target_type: 'metric' },
  experiment_run_guards_metric: { forward_verb: 'guards', reverse_verb: 'guarded_by', classification: 'cross-domain', source_type: 'experiment_run', target_type: 'metric' },
  experiment_run_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'experiment_run', target_type: 'metric' },
  solution_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'hierarchy', source_type: 'solution', target_type: 'metric' },

  // ── Cross-domain: Ownership ──────────────────────────────────────────────────
  node_owned_by_team: { forward_verb: 'owned_by', reverse_verb: 'owns', classification: 'cross-domain', source_type: 'node', target_type: 'team' },
  node_owned_by_role: { forward_verb: 'owned_by', reverse_verb: 'owns', classification: 'cross-domain', source_type: 'node', target_type: 'role' },
  node_owned_by_stakeholder: { forward_verb: 'owned_by', reverse_verb: 'owns', classification: 'cross-domain', source_type: 'node', target_type: 'stakeholder' },
  node_owned_by_department: { forward_verb: 'owned_by', reverse_verb: 'owns', classification: 'cross-domain', source_type: 'node', target_type: 'department' },
  node_owned_by_person: { forward_verb: 'owned_by', reverse_verb: 'owns', classification: 'cross-domain', source_type: 'node', target_type: 'person' },

  // ── Cross-domain: Architecture (DDD) ─────────────────────────────────────────
  // Service, domain_event, domain_entity, aggregate, read_model, api_contract,
  // value_object, command, and data_model are DDD building blocks that all
  // belong to a bounded context. Polymorphic because the relationship is
  // universal across the DDD type family. Verbs follow DDD literature:
  // aggregate belongs_to context, context contains aggregates.
  node_belongs_to_bounded_context: { forward_verb: 'belongs_to', reverse_verb: 'contains', classification: 'cross-domain', source_type: 'node', target_type: 'bounded_context' },

  // ── New edges replacing deleted string properties ────────────────────

  // Marketing
  marketing_strategy_pursues_outcome: { forward_verb: 'pursues', reverse_verb: 'pursued_by', classification: 'cross-domain', source_type: 'marketing_strategy', target_type: 'outcome' },
  marketing_channel_feeds_acquisition_channel: { forward_verb: 'feeds', reverse_verb: 'fed_by', classification: 'cross-domain', source_type: 'marketing_channel', target_type: 'acquisition_channel' },

  // Sales
  deal_at_pipeline_stage: { forward_verb: 'at_stage', reverse_verb: 'contains_deal', classification: 'cross-domain', source_type: 'deal', target_type: 'pipeline_stage' },
  subscription_subscribes_to_pricing_tier: { forward_verb: 'subscribes_to', reverse_verb: 'subscribed_by', classification: 'cross-domain', source_type: 'subscription', target_type: 'pricing_tier' },
  lead_sourced_from_acquisition_channel: { forward_verb: 'sourced_from', reverse_verb: 'generated', classification: 'cross-domain', source_type: 'lead', target_type: 'acquisition_channel' },
  account_partners_via_partnership: { forward_verb: 'partners_via', reverse_verb: 'partnered_with', classification: 'cross-domain', source_type: 'account', target_type: 'partnership' },

  // Customer Success
  customer_health_score_composed_of_metric: { forward_verb: 'composed_of', reverse_verb: 'composes', classification: 'cross-domain', source_type: 'customer_health_score', target_type: 'metric' },
  service_level_agreement_measures_metric: { forward_verb: 'measures', reverse_verb: 'measured_by', classification: 'cross-domain', source_type: 'service_level_agreement', target_type: 'metric' },

  // Content
  prompt_template_targets_ai_model: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'prompt_template', target_type: 'ai_model' },

  // Education
  education_program_targets_persona: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'education_program', target_type: 'persona' },

  // Programs
  milestone_gates_deliverable: { forward_verb: 'gates', reverse_verb: 'gated_by', classification: 'cross-domain', source_type: 'milestone', target_type: 'deliverable' },

  // Data
  data_lineage_sourced_from_data_source: { forward_verb: 'sourced_from', reverse_verb: 'feeds_lineage', classification: 'cross-domain', source_type: 'data_lineage', target_type: 'data_source' },
  data_lineage_feeds_data_source: { forward_verb: 'feeds', reverse_verb: 'fed_by_lineage', classification: 'cross-domain', source_type: 'data_lineage', target_type: 'data_source' },
  data_pipeline_reads_from_data_source: { forward_verb: 'reads_from', reverse_verb: 'read_by', classification: 'cross-domain', source_type: 'data_pipeline', target_type: 'data_source' },
  data_pipeline_writes_to_data_source: { forward_verb: 'writes_to', reverse_verb: 'written_by', classification: 'cross-domain', source_type: 'data_pipeline', target_type: 'data_source' },

  // Compliance
  audit_log_policy_tracks_event_schema: { forward_verb: 'tracks', reverse_verb: 'tracked_by', classification: 'cross-domain', source_type: 'audit_log_policy', target_type: 'event_schema' },

  // Localisation
  cultural_adaptation_targets_market_segment: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'cross-domain', source_type: 'cultural_adaptation', target_type: 'market_segment' },

  // Feedback
  feature_request_from_behavioral_segment: { forward_verb: 'from', reverse_verb: 'requested_by', classification: 'cross-domain', source_type: 'feature_request', target_type: 'behavioral_segment' },
  feature_request_in_feature_area: { forward_verb: 'in_area', reverse_verb: 'has_request', classification: 'cross-domain', source_type: 'feature_request', target_type: 'feature_area' },
  feedback_vote_from_behavioral_segment: { forward_verb: 'from', reverse_verb: 'voted_by', classification: 'cross-domain', source_type: 'feedback_vote', target_type: 'behavioral_segment' },

  // AI
  ai_experiment_uses_ai_model: { forward_verb: 'uses', reverse_verb: 'used_by', classification: 'cross-domain', source_type: 'ai_experiment', target_type: 'ai_model' },

  // ── Intelligence-guide canonical edges ─────────────────────────
  // These edges back up domain-guide patterns whose original references had
  // drifted. Each is its own canonical graph contract, not an alias.

  // Product Spec ↔ Validation
  feature_tests_hypothesis: { forward_verb: 'tests', reverse_verb: 'tested_by', classification: 'cross-domain', source_type: 'feature', target_type: 'hypothesis' },

  // UX Design (internal hierarchy)
  // screens aren't contained by journey_step or prototype. They are
  // their own entities (owned by product / user_flow / screen itself).
  // These edges describe rendering or referencing relationships, classification = semantic.
  journey_step_shown_on_screen: { forward_verb: 'shown_on', reverse_verb: 'shows', classification: 'semantic', source_type: 'journey_step', target_type: 'screen' },
  prototype_simulates_screen: { forward_verb: 'simulates', reverse_verb: 'simulated_in', classification: 'semantic', source_type: 'prototype', target_type: 'screen' },

  // UX Design ↔ Validation
  prototype_tests_hypothesis: { forward_verb: 'tests', reverse_verb: 'tested_by', classification: 'cross-domain', source_type: 'prototype', target_type: 'hypothesis' },

  // Design System ↔ Brand
  design_token_reflects_brand_colour: { forward_verb: 'reflects', reverse_verb: 'reflected_in', classification: 'cross-domain', source_type: 'design_token', target_type: 'brand_colour' },

  // Brand (internal hierarchy)
  brand_identity_signed_with_brand_logo: { forward_verb: 'signed_with', reverse_verb: 'signs', classification: 'hierarchy', source_type: 'brand_identity', target_type: 'brand_logo' },

  // Go-To-Market ↔ Brand
  messaging_aligns_with_brand_voice: { forward_verb: 'aligns_with', reverse_verb: 'voiced_via', classification: 'cross-domain', source_type: 'messaging', target_type: 'brand_voice' },

  // Legal ↔ Data & Analytics
  privacy_policy_governs_data_source: { forward_verb: 'governs', reverse_verb: 'governed_by_policy', classification: 'cross-domain', source_type: 'privacy_policy', target_type: 'data_source' },

  // DevOps (causal SRE chain)
  monitor_detects_symptom: { forward_verb: 'detects', reverse_verb: 'surfaced_by', classification: 'causal', source_type: 'monitor', target_type: 'symptom' },
  symptom_triggers_incident: { forward_verb: 'triggers', reverse_verb: 'triggered_by', classification: 'causal', source_type: 'symptom', target_type: 'incident' },

  // ── (since v0.4.0) canonical replacements for narrative-string properties ──
  // Each edge here replaces a string property on the source entity that
  // was tagged `@deprecated since="0.4.0" removeIn="0.5.0"` in the
  // corresponding domain file. Names follow the
  // `subject_verb_object` catalog grammar; targets are existing entity
  // types in `entity-catalog.ts`.
  /** Replaces `LearningProperties.metric: string`. Links a learning to the metric it was observed on. */
  learning_observed_on_metric: { forward_verb: 'observed_on', reverse_verb: 'observed_in', classification: 'cross-domain', source_type: 'learning', target_type: 'metric' },
  /** Replaces `ModelComparisonProperties.winner: string`. Links a model comparison to the ai_model that won. */
  model_comparison_winner_is_ai_model: { forward_verb: 'won_by', reverse_verb: 'wins', classification: 'cross-domain', source_type: 'model_comparison', target_type: 'ai_model' },
  /** Replaces `DataProductProperties.consumers: string`. Links a data product to each consuming service (per JSDoc example values like `analytics-service`, `search-indexer`). */
  data_product_consumed_by_service: { forward_verb: 'consumed_by', reverse_verb: 'consumes', classification: 'cross-domain', source_type: 'data_product', target_type: 'service' },
  /** Replaces `ReportProperties.recipients: string`. Links a report to each receiving team (per JSDoc example values like `exec-team`, `product-leads`). */
  report_distributed_to_team: { forward_verb: 'distributed_to', reverse_verb: 'receives', classification: 'cross-domain', source_type: 'report', target_type: 'team' },
  /** Replaces `ServiceLevelAgreementProperties.customer: string`. Links an SLA to the account it covers (the existing JSDoc already hinted this was the canonical shape). */
  service_level_agreement_covers_account: { forward_verb: 'covers', reverse_verb: 'covered_by_sla', classification: 'cross-domain', source_type: 'service_level_agreement', target_type: 'account' },

  // ── v0.4.1: Cross-domain edge clusters ───────────────────────────────────
  //
  // Added 2026-05-16 after Wave 4 stress-test against a saturated Notion
  // workspace surfaced 9 genuinely-missing cross-domain bridges. Clusters E
  // and F flagged in the same stress-test were already complete in v0.4.0
  // those rejections were Entopo runtime-snapshot drift, not spec gaps.

  // Cluster A: Testing to Bug.
  // test_suite_covers_feature / qa_session_targets_feature /
  // eval_benchmark_measures_feature / test_case_validates_acceptance_criterion
  // / test_*_produces_test_result already exist (v0.3.x). The one outstanding
  // hop was regression-test ↔ bug; regression tests are written to guard
  // against a specific known bug, distinct from `release_contains_bug`.
  regression_test_addresses_bug: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'regression_test', target_type: 'bug' },

  // Cluster B: DevOps cross-domain.
  // service_level_objective_tracks_metric / monitor_watches_service /
  // ci_pipeline_deploys_service / runbook_mitigates_incident /
  // infrastructure_component_covered_by_on_call_rotation already exist.
  // Two genuinely missing: an incident's impact on user-facing features
  // (distinct from the SLO/postmortem bridges) and the bridge from a
  // release strategy to the concrete deployments it governs.
  incident_affects_feature: { forward_verb: 'affects', reverse_verb: 'affected_by', classification: 'cross-domain', source_type: 'incident', target_type: 'feature' },
  release_strategy_used_by_deployment: { forward_verb: 'used_by', reverse_verb: 'uses', classification: 'cross-domain', source_type: 'release_strategy', target_type: 'deployment' },

  // Cluster C: User Research linkage matrix.
  // research_study → {participant, research_question, survey_response,
  // interview_guide} containment edges already exist (49/49 in Wave 4).
  // Missing: the lateral bridges from atoms collected during the study to
  // the discovery-domain entities they evidence.
  participant_voiced_quote: { forward_verb: 'voiced', reverse_verb: 'voiced_by', classification: 'cross-domain', source_type: 'participant', target_type: 'quote' },
  // v0.7.2 ( §1): personas are evidence-based abstractions of real participants; connects the isolated `participant` member to the users anchor.
  participant_represents_persona: { forward_verb: 'represents', reverse_verb: 'represented_by', classification: 'cross-domain', source_type: 'participant', target_type: 'persona' },
  research_question_addressed_by_insight: { forward_verb: 'addressed_by', reverse_verb: 'addresses', classification: 'cross-domain', source_type: 'research_question', target_type: 'insight' },
  survey_response_evidences_insight: { forward_verb: 'evidences', reverse_verb: 'evidenced_by', classification: 'cross-domain', source_type: 'survey_response', target_type: 'insight' },

  // Cluster D: Engineering finishing touches.
  // feature_flag had only `service_toggles_feature_flag`; the user-visible
  // gating relationship was missing. data_model ↔ database_schema is the
  // logical-to-physical mapping (data_model is bounded-context-level;
  // database_schema is the persisted shape). read_model → aggregate is the
  // canonical CQRS projection direction (read_model projects from the
  // write-side aggregate).
  feature_flag_gates_feature: { forward_verb: 'gates', reverse_verb: 'gated_by', classification: 'cross-domain', source_type: 'feature_flag', target_type: 'feature' },
  data_model_persisted_in_database_schema: { forward_verb: 'persisted_in', reverse_verb: 'persists', classification: 'cross-domain', source_type: 'data_model', target_type: 'database_schema' },
  read_model_projects_aggregate: { forward_verb: 'projects', reverse_verb: 'projected_as', classification: 'cross-domain', source_type: 'read_model', target_type: 'aggregate' },

  // ─── v0.5.5: business-/GTM-canvas wiring ─────────────────
  // The Part 1 slot-connectivity audit (Agent O2) surfaced 240 missing ordered
  // pairs across 5 Tier-1 business/GTM canvases. Most are artifacts of the
  // canvas declaring too many slot types, but ~29 represent real, named
  // relationships from the canonical source literature (Osterwalder's BMC,
  // Maurya's Lean Canvas, Patton's Opportunity Canvas, Strategyzer's Test
  // Card + Learning Card, and GTM Playbook practice). Added here.
  //
  // Discipline applied: LOW-confidence pairs (e.g., cost_structure → persona,
  // metric → solution, all hierarchy-reverse edges already covered by reverse
  // traversal) are NOT added. See Part 2a report for the full rationale.

  // Business Model Canvas: canonical Osterwalder relationships
  // (the 9-block canvas has explicit named flows: VP ↔ segments, channels
  // ↔ segments, activities/resources/partners produce VP, costs driven by
  // activities/resources). These 15 edges close the BMC structural spine.
  key_activity_delivers_value_proposition: { forward_verb: 'delivers', reverse_verb: 'delivered_by', classification: 'causal', source_type: 'key_activity', target_type: 'value_proposition' },
  key_activity_uses_key_resource: { forward_verb: 'uses', reverse_verb: 'used_by', classification: 'cross-domain', source_type: 'key_activity', target_type: 'key_resource' },
  key_resource_enables_key_activity: { forward_verb: 'enables', reverse_verb: 'enabled_by', classification: 'cross-domain', source_type: 'key_resource', target_type: 'key_activity' },
  partnership_performs_key_activity: { forward_verb: 'performs', reverse_verb: 'performed_by', classification: 'cross-domain', source_type: 'partnership', target_type: 'key_activity' },
  partnership_provides_key_resource: { forward_verb: 'provides', reverse_verb: 'provided_by', classification: 'cross-domain', source_type: 'partnership', target_type: 'key_resource' },
  customer_relationship_with_market_segment: { forward_verb: 'with', reverse_verb: 'maintained_by', classification: 'cross-domain', source_type: 'customer_relationship', target_type: 'market_segment' },
  distribution_channel_reaches_market_segment: { forward_verb: 'reaches', reverse_verb: 'reached_by', classification: 'cross-domain', source_type: 'distribution_channel', target_type: 'market_segment' },
  distribution_channel_delivers_value_proposition: { forward_verb: 'delivers', reverse_verb: 'delivered_by', classification: 'cross-domain', source_type: 'distribution_channel', target_type: 'value_proposition' },
  value_proposition_addresses_market_segment: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'value_proposition', target_type: 'market_segment' },
  revenue_stream_captured_from_market_segment: { forward_verb: 'captured_from', reverse_verb: 'yields_revenue_via', classification: 'cross-domain', source_type: 'revenue_stream', target_type: 'market_segment' },
  cost_structure_driven_by_key_activity: { forward_verb: 'driven_by', reverse_verb: 'drives_cost_via', classification: 'causal', source_type: 'cost_structure', target_type: 'key_activity' },
  cost_structure_driven_by_key_resource: { forward_verb: 'driven_by', reverse_verb: 'drives_cost_via', classification: 'causal', source_type: 'cost_structure', target_type: 'key_resource' },
  value_proposition_yields_revenue_stream: { forward_verb: 'yields', reverse_verb: 'yielded_by', classification: 'causal', source_type: 'value_proposition', target_type: 'revenue_stream' },
  // MEDIUM-confidence (verb-naming): relationships and partnerships *support*
  // a VP but the "support" verb is one of several plausible choices
  // (could be 'contributes_to' or 'shapes'). REVIEW: medium-confidence;
  // surfaced by; verify naming.
  customer_relationship_supports_value_proposition: { forward_verb: 'supports', reverse_verb: 'supported_by', classification: 'cross-domain', source_type: 'customer_relationship', target_type: 'value_proposition' },
  partnership_supports_value_proposition: { forward_verb: 'supports', reverse_verb: 'supported_by', classification: 'cross-domain', source_type: 'partnership', target_type: 'value_proposition' },

  // Lean Canvas: Maurya's problem-solution-customer triangle. The catalog
  // already has `opportunity_drives_solution` and `value_proposition_solves_
  // need`, but the *direct* solution → need link (problem-solution fit) and
  // capability → VP (the "unfair advantage" capability) are canonical Lean
  // Startup vocabulary that should resolve in one hop.
  solution_addresses_need: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'causal', source_type: 'solution', target_type: 'need' },
  capability_enables_value_proposition: { forward_verb: 'enables', reverse_verb: 'enabled_by', classification: 'causal', source_type: 'capability', target_type: 'value_proposition' },
  // Competitor → need closes the "Existing Alternatives" lean-canvas slot:
  // a competitor exists *because* it addresses the same underlying need.
  competitor_addresses_need: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'competitor', target_type: 'need' },

  // GTM Playbook: the canonical flow (ICP → positioning → messaging → launch
  // → sales). gtm_strategy already fans out to all six children. What's
  // missing is the *lateral* dependencies: different ICPs need different
  // positionings, messaging, and sales motions; messaging is the artifact
  // that launches use and that sales motions weaponise.
  ideal_customer_profile_informs_positioning: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'causal', source_type: 'ideal_customer_profile', target_type: 'positioning' },
  ideal_customer_profile_shapes_messaging: { forward_verb: 'shapes', reverse_verb: 'shaped_by', classification: 'causal', source_type: 'ideal_customer_profile', target_type: 'messaging' },
  ideal_customer_profile_shapes_sales_motion: { forward_verb: 'shapes', reverse_verb: 'shaped_by', classification: 'causal', source_type: 'ideal_customer_profile', target_type: 'sales_motion' },
  messaging_used_in_launch: { forward_verb: 'used_in', reverse_verb: 'uses', classification: 'cross-domain', source_type: 'messaging', target_type: 'launch' },
  messaging_enables_sales_motion: { forward_verb: 'enables', reverse_verb: 'enabled_by', classification: 'cross-domain', source_type: 'messaging', target_type: 'sales_motion' },

  // Test Card + Learning Card (Strategyzer): canonical validation flow
  // hypothesis → test_plan → experiment_run → evidence → learning → decision.
  // The catalog already had the hypothesis → test_plan and experiment_run →
  // {hypothesis, evidence, learning, decision} edges. Missing: the
  // test_plan ran-as bridge (mirrors `experiment_plan_ran_as_experiment_run`
  // for the test_plan/test-card pair), the evidence → learning interpretation
  // step, and the learning → decision commitment step.
  test_plan_ran_as_experiment_run: { forward_verb: 'ran_as', reverse_verb: 'ran_for', classification: 'hierarchy', source_type: 'test_plan', target_type: 'experiment_run' },
  evidence_interpreted_as_learning: { forward_verb: 'interpreted_as', reverse_verb: 'interpreted_from', classification: 'causal', source_type: 'evidence', target_type: 'learning' },
  learning_informs_decision: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'causal', source_type: 'learning', target_type: 'decision' },

  // Opportunity Canvas: Patton's "Assumptions" slot is meant to capture the
  // riskiest beliefs about each of the other slots (problem, users, solution).
  // The catalog already has `assumption_becomes_hypothesis` (the test-to-validate
  // flow) and `initiative_assumes_assumption` (the owner side). Missing: the
  // *subject* of the assumption: what is the assumption about?
  // MEDIUM-confidence (verb-naming): "concerns" is one of several plausible
  // verbs (could be 'about', 'applies_to', 'targets'). REVIEW: medium-confidence;
  // surfaced by; verify naming.
  assumption_concerns_need: { forward_verb: 'concerns', reverse_verb: 'has_assumption', classification: 'semantic', source_type: 'assumption', target_type: 'need' },
  assumption_concerns_persona: { forward_verb: 'concerns', reverse_verb: 'has_assumption', classification: 'semantic', source_type: 'assumption', target_type: 'persona' },
  assumption_concerns_solution: { forward_verb: 'concerns', reverse_verb: 'has_assumption', classification: 'semantic', source_type: 'assumption', target_type: 'solution' },

  // ─── v0.5.6: design/UX canvas wiring ─────────────────────
  // The Part 1 audit (Agent O2) also surfaced 75 missing ordered slot pairs
  // across three Tier-1 design/UX canvases:
  //   - Lean UX Canvas (Gothelf, 8 slots, 42 pairs, 36 null)
  //   - Persona Canvas (Cooper/Pichler, 6 slots, 30 pairs, 20 null)
  //   - Design Sprint (Knapp/GV, 5 slots, 20 pairs, 19 null)
  // Of those 75, ~50 are slot-pair artifacts (no canonical relationship in the
  // source literature (e.g. `outcome → persona`, `quote → desired_outcome`)
  // or hierarchy-reverses already covered by reverse traversal of an existing
  // edge. Part 2b adds 13 HIGH-confidence + 2 MEDIUM-confidence edges that map
  // to explicitly-named relationships in the source literature.

  // Lean UX Canvas: Gothelf's hypothesis template explicitly binds
  // hypothesis → feature → persona → outcome ("We believe [feature] for
  // [persona] will result in [outcome]"). The catalog already had
  // `feature_tests_hypothesis` (the experiment-side reverse) and
  // `experiment_run_validates_hypothesis`. Missing: the forward subject
  // arrows from the hypothesis to its components.
  hypothesis_targets_outcome: { forward_verb: 'targets', reverse_verb: 'targeted_by', classification: 'causal', source_type: 'hypothesis', target_type: 'outcome' },
  hypothesis_concerns_persona: { forward_verb: 'concerns', reverse_verb: 'has_hypothesis', classification: 'semantic', source_type: 'hypothesis', target_type: 'persona' },
  // Lean UX block 5 (Solutions) is paired with block 1 (Business Problem,
  // expressed as `need`). Features address needs. Parallel to the existing
  // `feature_addresses_job`; features address both jobs and needs.
  feature_addresses_need: { forward_verb: 'addresses', reverse_verb: 'addressed_by', classification: 'cross-domain', source_type: 'feature', target_type: 'need' },
  // Lean UX block 2 (Business Outcomes) and block 8 (Experiments) form the
  // measurement loop. Parallel to `experiment_run_measures_metric`; outcomes
  // are the higher-level business measure that experiments target.
  experiment_run_measures_outcome: { forward_verb: 'measures', reverse_verb: 'measured_by', classification: 'cross-domain', source_type: 'experiment_run', target_type: 'outcome' },
  // Persona pursues business/user outcome. The catalog has
  // `persona_aspires_to_desired_outcome` (for the JTBD `desired_outcome`
  // subtype) and `product_pursues_outcome`. Lean UX block 4 (User Outcomes
  // & Benefits) directly ties persona to outcome. Use `pursues` to mirror
  // `persona_pursues_job`; same verb, lateral within the user domain.
  persona_pursues_outcome: { forward_verb: 'pursues', reverse_verb: 'pursued_by', classification: 'semantic', source_type: 'persona', target_type: 'outcome' },
  // Completes the assumption-subject pattern from Part 2a (assumption concerns
  // need / persona / solution). Lean UX block 7 (Assumptions) and Opportunity
  // Canvas both let assumptions concern outcomes or features. MEDIUM-confidence
  // (verb-naming): "concerns" inherits the Part 2a debate. REVIEW: medium-
  // confidence; pattern-completion of's `assumption_concerns_*`.
  assumption_concerns_outcome: { forward_verb: 'concerns', reverse_verb: 'has_assumption', classification: 'semantic', source_type: 'assumption', target_type: 'outcome' },
  assumption_concerns_feature: { forward_verb: 'concerns', reverse_verb: 'has_assumption', classification: 'semantic', source_type: 'assumption', target_type: 'feature' },

  // Persona Canvas (Pichler/Cooper). The canvas has explicit slots for
  // {persona, desired_outcome, need, observation, job, quote}. Most relationships
  // were already in the catalog (`persona_pursues_job`, `persona_experiences_need`,
  // `persona_aspires_to_desired_outcome`, `job_motivates_desired_outcome`,
  // `observation_characterises_persona`, `observation_evidenced_by_quote`,
  // `quote_evidences_need`, `observation_reveals_need`). Missing: the quote
  // direction from the persona's mouth, the Ulwick need ↔ desired_outcome link,
  // and the parallel "observation reveals job" edge.
  //
  // Quotes voice personas: Persona Canvas's Quotes slot is explicitly
  // "what the persona says". Parallel to `observation_characterises_persona`
  // but for verbal evidence. Cross-domain because quotes are research artifacts
  // and persona is a user-domain entity.
  quote_voices_persona: { forward_verb: 'voices', reverse_verb: 'voiced_by', classification: 'cross-domain', source_type: 'quote', target_type: 'persona' },
  // Need ↔ desired_outcome: Ulwick's outcome-driven innovation. A need is
  // measured by the desired outcomes that quantify its satisfaction. Causal
  // because the need creates the outcome's existence as a measurable target.
  // Reverse traversal closes `desired_outcome → need` via this single edge.
  need_measured_by_desired_outcome: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'causal', source_type: 'need', target_type: 'desired_outcome' },
  // Observation reveals job: parallel to `observation_reveals_need` (already
  // in catalog). Persona Canvas's Behaviours slot (observations) explicitly
  // surfaces jobs the persona performs. Same `reveals` verb maintains
  // observation's surfacing-verb family (reveals_need, reveals_job, characterises_persona).
  observation_reveals_job: { forward_verb: 'reveals', reverse_verb: 'revealed_by', classification: 'cross-domain', source_type: 'observation', target_type: 'job' },

  // Design Sprint (Knapp/GV). The five-day flow is
  // design_question → design_concept → decision → user_flow → observation.
  // The catalog already had `design_question_answered_by_design_concept`
  // (Day 1 → Day 2). Missing: Days 3-5 closure.
  //
  // Day 3 Decide: the design question gets a resolution. Parallel to
  // `design_question_answered_by_design_concept` but at the commitment level:
  // a sprint exits with one decision per HMW question.
  design_question_resolved_by_decision: { forward_verb: 'resolved_by', reverse_verb: 'resolves', classification: 'causal', source_type: 'design_question', target_type: 'decision' },
  // Day 3 Decide picks the winning design_concept. Parallel structure to
  // `decision_selects_*` family (no existing siblings in the catalog yet, but
  // the verb is the sprint's canonical action: "Decide" = pick the sketch).
  decision_selects_design_concept: { forward_verb: 'selects', reverse_verb: 'selected_by', classification: 'causal', source_type: 'decision', target_type: 'design_concept' },
  // Day 5 Test: observations validate (or invalidate) the prototype's
  // user_flow. Causal because the test produces the observations. Parallel
  // to `experiment_run_validates_hypothesis`; observation is to user_flow
  // what experiment_run is to hypothesis in the sprint world.
  user_flow_validated_by_observation: { forward_verb: 'validated_by', reverse_verb: 'validates', classification: 'causal', source_type: 'user_flow', target_type: 'observation' },
  // MEDIUM-confidence (polysemy with prototype): in a Design Sprint the
  // prototype is often expressed as a user_flow, and `design_concept_realised_as_prototype`
  // already exists. Adding `design_concept_realised_as_user_flow` widens the
  // grammar; concepts can be prototypes OR flows depending on the sprint
  // (low-fidelity flows are valid prototypes). REVIEW: medium-confidence;
  // could be argued as redundant with prototype edge.
  design_concept_realised_as_user_flow: { forward_verb: 'realised_as', reverse_verb: 'realises', classification: 'causal', source_type: 'design_concept', target_type: 'user_flow' },
  // MEDIUM-confidence (subsumed by learning?): `learning_informs_decision`
  // (Part 2a) already covers the synthesised-insight path. This adds the more
  // direct observation → decision link, useful when a sprint observation
  // immediately changes a follow-up commitment without intermediate learning
  // synthesis. REVIEW: medium-confidence; potential duplication with
  // learning_informs_decision through the synthesis layer.
  observation_informs_decision: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'observation', target_type: 'decision' },

  // ─── v0.5.7: engineering + AI canvas wiring ──────────────
  // The Part 1 audit (Agent O2) surfaced missing ordered slot pairs across
  // four Tier-1 engineering + AI canvases:
  //   - Bounded Context Canvas (Nick Tune / DDD Crew, 6 slots, 30 pairs, 24 null)
  //   - LLM Evaluation Framework (NLP community, 6 slots, 30 pairs, 26 null)
  //   - API Design First (OpenAPI Initiative, 5 unique slot types, 20 pairs, 19 null)
  //   - Multi-Agent Orchestration (AutoGen/CrewAI/LangGraph, 6 slots, 30 pairs, 25 null)
  // Many of these pairs were closed in v0.5.3 (Agent S: DDD/CQRS event chain)
  // and earlier waves. The remaining gaps fall into two camps: real canonical
  // relationships in the source literature (added here, 11 HIGH-confidence)
  // versus slot-pair artifacts, hierarchy reverses, or paths mediated through
  // another entity (NOT added; see Part 2c handoff report).

  // Bounded Context Canvas: Tune's "Business Decisions" slot maps to
  // `api_contract` (the loose framework mapping treats published contracts as
  // the decisions a BC publishes). The contract level relationship exists in
  // DDD literature ("published language") above the per-service exposure
  // already in the catalog (`service_exposes_api_contract`). Adding the BC-
  // level structural parent gives the contract two valid hierarchy parents
  // (service AND bounded_context), matching DDD canon: a context's published
  // language is the union of its services' contracts.
  bounded_context_publishes_api_contract: { forward_verb: 'publishes', reverse_verb: 'published_by', classification: 'hierarchy', source_type: 'bounded_context', target_type: 'api_contract' },
  // CQRS saga / process-manager pattern (Vernon, Young). An event handler can
  // issue a new command in response to a domain event, closing the reactive
  // loop the existing chain only covers in one direction
  // (command_produces_domain_event). Without this, sagas can be recorded only
  // by burying the link in node_informs_node. Causal because the event's
  // arrival is the trigger; the issued command is the effect.
  domain_event_triggers_command: { forward_verb: 'triggers', reverse_verb: 'triggered_by', classification: 'causal', source_type: 'domain_event', target_type: 'command' },

  // LLM Evaluation Framework: the canvas presents Latency as `metric` and
  // wires Accuracy (eval_benchmark), Coherence (eval_run), Cost
  // (ai_cost_tracker), Safety (ai_guardrail) as the other dimensions.
  // The existing chain covers ai_model → eval_benchmark → eval_run, plus
  // ai_model → metric mediated through outcome. Missing: the direct outputs.
  //
  // Eval runs produce metric values: every benchmark execution writes a
  // result row of (metric, value, timestamp) per (model, benchmark) pair.
  // Causal because the run is what creates the metric reading; the metric
  // exists as a definition before the run, but the value is produced.
  eval_run_produces_metric: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'causal', source_type: 'eval_run', target_type: 'metric' },
  // Benchmarks define their metric set. HELM, MLPerf, BIG-bench all specify
  // which metrics constitute the benchmark (accuracy, BLEU, F1, latency).
  // Hierarchy mirrors `data_source_defines_metric` (same verb pattern). Adds
  // eval_benchmark as a valid hierarchy parent of metric; metric already has
  // many parents (outcome, objective, key_result, solution, data_source).
  eval_benchmark_defines_metric: { forward_verb: 'defines', reverse_verb: 'defined_by', classification: 'hierarchy', source_type: 'eval_benchmark', target_type: 'metric' },

  // API Design First: the canvas threads contract → endpoint → review
  // (decision) → mock (domain_entity) → implementation (data_flow). The
  // existing chain covers api_contract → api_endpoint via Agent S's
  // v0.5.1 work. Missing: the typed-payload edges and the design-decision
  // attachment.
  //
  // Endpoints reference domain entities as request/response payloads.
  // Semantic (not hierarchy) because endpoints don't contain entity
  // definitions; they bind to them by name. Within engineering domain.
  api_endpoint_references_domain_entity: { forward_verb: 'references', reverse_verb: 'referenced_by', classification: 'semantic', source_type: 'api_endpoint', target_type: 'domain_entity' },
  // API design decisions (auth scheme, versioning policy, REST vs gRPC,
  // pagination) are recorded against the contract during review. Cross-domain
  // because decision lives in the strategy/outcomes domain and api_contract
  // in engineering. Parallel to `bounded_context_decided_via_decision` but at
  // the contract grain.
  api_contract_records_decision: { forward_verb: 'records', reverse_verb: 'recorded_in', classification: 'cross-domain', source_type: 'api_contract', target_type: 'decision' },
  // Data flows transport domain entities (DFD canonical). The arrow on a
  // data-flow diagram carries a named payload. Causal because the flow
  // moves the entity from one process node to another; without the flow
  // the entity is local. Same engineering domain.
  data_flow_transports_domain_entity: { forward_verb: 'transports', reverse_verb: 'transported_by', classification: 'causal', source_type: 'data_flow', target_type: 'domain_entity' },
  // Endpoints participate in data flows (DFD nodes that emit/consume flows).
  // Semantic because participation is associational membership, not
  // containment (a flow is composed of many node-participations, not owned
  // by one endpoint).
  api_endpoint_participates_in_data_flow: { forward_verb: 'participates_in', reverse_verb: 'involves', classification: 'semantic', source_type: 'api_endpoint', target_type: 'data_flow' },

  // Multi-Agent Orchestration: the canvas wires agent_definition →
  // workflow_template → workflow_run → workflow_artifact with agent_hook and
  // review_gate as cross-cutting concerns. The existing catalog covers the
  // template-level structure (orchestrates / executed_as / gated_by). Missing:
  // the runtime/execution facts that the canvas surfaces under "Handoff Rules"
  // and "Aggregation".
  //
  // Agents produce artifacts as their direct output. Polysemic with
  // `workflow_run_produces_workflow_artifact` (already in catalog); both are
  // canonical: the artifact has a structural run-producer AND a logical
  // agent-producer. Mirrors `aggregate_emits_domain_event` +
  // `command_produces_domain_event` polysemy.
  agent_definition_produces_workflow_artifact: { forward_verb: 'produces', reverse_verb: 'produced_by', classification: 'causal', source_type: 'agent_definition', target_type: 'workflow_artifact' },
  // Hooks fire during runs. The existing `agent_definition_triggered_via_agent_hook`
  // covers the hook→agent registration; this adds the hook→run runtime
  // attribution. Causal: the run is the execution context in which the
  // hook actually fires.
  agent_hook_fires_during_workflow_run: { forward_verb: 'fires_during', reverse_verb: 'fires_via', classification: 'causal', source_type: 'agent_hook', target_type: 'workflow_run' },
  // Runs pass through review gates. The catalog has the template-level
  // `workflow_template_gated_by_review_gate` (the gate is declared on the
  // template). This adds the run-level traversal: the gate is a checkpoint
  // the run actually traverses. Distinct enough from the template-level
  // declaration to warrant its own edge: queries asking "which runs blocked
  // on this gate?" need the run-level link.
  workflow_run_passes_through_review_gate: { forward_verb: 'passes_through', reverse_verb: 'gates_run', classification: 'causal', source_type: 'workflow_run', target_type: 'review_gate' },

  // ─── v0.5.8: strategy + research + feedback canvas wiring ─
  // The Part 1 audit (Agent O2), re-run on Agent W's v0.5.7 base, surfaced
  // missing slot pairs across eight Tier-1 strategy / research / feedback
  // canvases:
  //   - McKinsey 7S (Peters & Waterman, 6 unique types, 30 pairs, 29 null)
  //   - Strategy Diamond (Hambrick & Fredrickson, 5 types, 20 pairs, 15 null)
  //   - Research Democratisation (ResearchOps, 5 types, 20 pairs, 20 null)
  //   - Research Ops Framework (ResearchOps Community, 5 types, 20 pairs, 19 null)
  //   - Usability Test Plan (Nielsen, 5 types, 20 pairs, 19 null)
  //   - Behavioural Cohort Analysis (Amplitude/Mixpanel, 5 types, 20 pairs, 19 null)
  //   - Customer Advisory Board (B2B canon, 5 types, 20 pairs, 19 null)
  //   - Customer Effort Score (Dixon/Toman/DeLisi, 5 types, 20 pairs, 19 null)
  // Part 2d adds HIGH-confidence edges that map to explicitly-named
  // relationships in the source literature. Most remaining pairs are LOW-
  // confidence: slot-pair artifacts (the 7S model is a "they all interact"
  // diagram with no directional verbs), hierarchy reverses (the catalog has
  // the forward edge, reverse traversal covers them), or mediated paths
  // (e.g. participant → insight via observation/quote). Continues Part 2a/2b/2c
  // discipline: quality of the catalog over score on the audit.

  // ── McKinsey 7S (3 HIGH) ──────────────────────────────────────────────────
  // 7S itself names no verbs between elements ("alignment", not causation).
  // Edges added here are drawn from the adjacent strategy-cascade and SAFe
  // literature where the verb IS named.
  //
  // Vision → strategic_theme: the standard strategy cascade
  // (vision → mission → strategic_theme → objective). The catalog already has
  // `vision_realised_through_mission` and `vision_guides_objective`. This
  // closes the missing link between vision and themes: "the vision guides
  // which themes we pursue this year". Causal because the vision shapes
  // theme selection; mirrors `vision_guides_objective` verb family.
  vision_guides_strategic_theme: { forward_verb: 'guides', reverse_verb: 'guided_by', classification: 'causal', source_type: 'vision', target_type: 'strategic_theme' },
  // Strategic_theme → capability: SAFe canon. Themes require investment
  // capabilities. Pairs with the existing `strategic_pillar → capability`
  // hierarchy (pillars contain capabilities) and `capability_enables_value_stream`.
  // Causal: themes drive capability investment decisions. Verb "requires"
  // mirrors the well-used catalog family
  // (hypothesis_requires_experiment_plan, business_model_requires_key_resource).
  strategic_theme_requires_capability: { forward_verb: 'requires', reverse_verb: 'required_by', classification: 'causal', source_type: 'strategic_theme', target_type: 'capability' },
  // Strategic_theme → value_stream: SAFe canon. Themes flow through value
  // streams to delivery. Parallel to `strategic_pillar_delivers_value_stream`
  // (hierarchy) at the pillar level; this is the theme-level lateral.
  // Semantic because themes don't OWN value streams (the value stream is
  // pillar-owned in SAFe), they flow through them. Verb "flows_through"
  // mirrors `product_flows_through_data_flow`, `bounded_context_flows_through_data_flow`.
  strategic_theme_flows_through_value_stream: { forward_verb: 'flows_through', reverse_verb: 'channels', classification: 'semantic', source_type: 'strategic_theme', target_type: 'value_stream' },

  // ── Strategy Diamond (4 HIGH) ─────────────────────────────────────────────
  // Hambrick & Fredrickson's diamond names five elements (Arenas, Vehicles,
  // Differentiators, Staging, Economic Logic) but explicitly says they must
  // be "internally consistent"; no directional verbs in the source. Edges
  // added here come from the adjacent BMC + market-entry literature where
  // the verb pair IS named. Several other null pairs from the audit are
  // already covered by reverse traversal (market_segment → distribution_channel
  // via `distribution_channel_reaches_market_segment`, etc.), explicitly
  // NOT re-added in the forward direction.
  //
  // Initiative → market_segment: "staging" maps to initiatives; initiatives
  // enter market segments (market-entry canon per Lafley/Martin, A.G. Ricci).
  // Distinct from `product_addresses_market_segment` (product-level): the
  // initiative is the unit of market entry. Cross-domain because initiative
  // sits in Strategy and market_segment in Market Intelligence.
  initiative_enters_market_segment: { forward_verb: 'enters', reverse_verb: 'entered_by', classification: 'cross-domain', source_type: 'initiative', target_type: 'market_segment' },
  // Initiative → value_proposition: initiatives realise VPs. The diamond's
  // "Differentiators" facet is realised by initiative-level work. Parallel
  // to `solution_becomes_feature` (v0.5.4) but at the initiative level.
  // Causal because the initiative's execution is what makes the VP real
  // for customers. The reverse-direction `value_proposition → initiative`
  // would be wrong: VPs don't launch initiatives; initiatives realise VPs.
  initiative_realises_value_proposition: { forward_verb: 'realises', reverse_verb: 'realised_by', classification: 'causal', source_type: 'initiative', target_type: 'value_proposition' },
  // Initiative → revenue_stream: initiatives unlock revenue streams. The
  // diamond's "Economic Logic" facet wires initiatives to the revenue they
  // generate. Causal because the initiative's success produces the revenue
  // stream's growth (or its existence, net-new revenue streams). Distinct
  // from `business_model_earns_via_revenue_stream` (hierarchical model →
  // stream) and `subscription_drives_revenue_stream` (subscription product).
  initiative_unlocks_revenue_stream: { forward_verb: 'unlocks', reverse_verb: 'unlocked_by', classification: 'causal', source_type: 'initiative', target_type: 'revenue_stream' },
  // Distribution_channel → revenue_stream: BMC canon (Osterwalder's
  // "How does each Channel result in revenue?" question is the direct
  // channel-to-revenue link). Channels MONETISE the value proposition; the
  // revenue stream is the monetisation. Causal because the channel's
  // operation is what produces revenue. Distinct from
  // `revenue_stream_captured_from_market_segment` (revenue ← market).
  distribution_channel_generates_revenue_stream: { forward_verb: 'generates', reverse_verb: 'generated_by', classification: 'causal', source_type: 'distribution_channel', target_type: 'revenue_stream' },

  // ── Research Democratisation (1 HIGH) ─────────────────────────────────────
  // The framework's slots (tutorial, interview_guide, design_guideline,
  // review_gate, insight) are PRACTICES, not entities with directional verbs
  // in the literature. Most slot pairs are NOT canonical relationships.
  // The single ResearchOps-named relationship is the insight-review gate.
  //
  // Review_gate → insight: ResearchOps canon. Insights pass through a
  // review gate before publication to the insight repository
  // (Hilliard, Tucker, ResearchOps Community guides). Hierarchy because
  // the gate's job is to approve/reject the insight (gate OWNS the
  // approval lifecycle). Parallel to `review_gate_approved_via_approval_record`
  // (existing). Verb "vets" captures the validation semantics; reverse
  // "vetted_by" reads as "this insight was vetted by this review gate".
  review_gate_vets_insight: { forward_verb: 'vets', reverse_verb: 'vetted_by', classification: 'hierarchy', source_type: 'review_gate', target_type: 'insight' },

  // ── Research Ops Framework (2 HIGH) ───────────────────────────────────────
  // ReOps Community's 8 pillars are conceptual groupings, not verb-linked.
  // Two pairs ARE named in the source literature:
  //
  // Research_plan → participant: ResearchOps governance. The plan defines
  // recruitment criteria. The existing `research_study_enrolls_participant`
  // is at the study (execution) level. This adds the plan (governance)
  // level; research plans DECIDE who to recruit before the study runs.
  // Causal because the plan's recruitment criteria produce the participant
  // pool. Distinct from the enrollment edge: a plan can recruit and never
  // run; a study only enrolls participants the plan recruited.
  research_plan_recruits_participant: { forward_verb: 'recruits', reverse_verb: 'recruited_into', classification: 'causal', source_type: 'research_plan', target_type: 'participant' },
  // Insight → design_guideline: standard research-to-design handoff. The
  // insight informs the guideline. Parallel to `insight_inspires_design_concept`,
  // `insight_inspires_design_question` (existing). Cross-domain because
  // insight is in User Research and design_guideline is in Design System.
  // This edge benefits multiple frameworks beyond ReOps (any research →
  // design system pipeline).
  insight_informs_design_guideline: { forward_verb: 'informs', reverse_verb: 'informed_by', classification: 'cross-domain', source_type: 'insight', target_type: 'design_guideline' },

  // ── Usability Test Plan (1 HIGH) ──────────────────────────────────────────
  // NN/G's test plan format flows: question → recruit → tasks/scenarios →
  // findings. Most pairs are mediated through research_study (which
  // enrolls participants, captures observations, produces insights, all
  // existing). The one direct, named edge is question → task.
  //
  // Research_question → task: the question DRIVES task design. In NN/G
  // methodology "the research questions generate the tasks we ask participants
  // to perform". Causal because the question is what produces the task.
  // Distinct from `research_question_addressed_by_insight` (existing,
  // question ← insight closure). The task uses the canonical `task` entity
  // (sprint-task / user-task share semantics: "thing to do").
  research_question_generates_task: { forward_verb: 'generates', reverse_verb: 'generated_by', classification: 'causal', source_type: 'research_question', target_type: 'task' },

  // ── Behavioural Cohort Analysis (3 HIGH) ──────────────────────────────────
  // Amplitude/Mixpanel canon: cohorts are DEFINED by behavior, MEASURED by
  // metrics, COMPARED to find drivers. The three direct edges are all
  // explicitly named in the source product-analytics literature.
  //
  // Cohort → behavioral_segment: Amplitude's "Define a behavioural cohort"
  // workflow literally selects a behavioral_segment as the cohort criterion.
  // The cohort entity is time-windowed group (signup date, retention
  // metrics); behavioral_segment is the qualifying behavior. Semantic
  // because the behavior doesn't CAUSE the cohort (the analyst selects it);
  // it DEFINES which users qualify. Parallel to `cohort_represents_persona`
  // (existing); both express "what this cohort is".
  cohort_defined_by_behavioral_segment: { forward_verb: 'defined_by', reverse_verb: 'defines', classification: 'semantic', source_type: 'cohort', target_type: 'behavioral_segment' },
  // Cohort → metric: cohort outcomes ARE metrics (retention_day_7,
  // retention_day_30 are explicit properties on the cohort entity). The
  // existing schema bakes this in; the edge makes it queryable as a graph
  // relationship. Causal because the cohort's existence produces the
  // metric reading (a metric exists in the abstract; the cohort produces a
  // specific value). Mirrors `revenue_stream_measured_by_metric`.
  cohort_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'causal', source_type: 'cohort', target_type: 'metric' },
  // Behavioral_segment → metric: segments are evaluated against metric
  // thresholds (the standard Amplitude/Mixpanel pattern). Causal because
  // the metric reading distinguishes segment membership. Parallel to
  // `cohort_measured_by_metric` above; both extend
  // `metric_segmented_by_persona` (existing) into the cohort/segment world.
  behavioral_segment_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'causal', source_type: 'behavioral_segment', target_type: 'metric' },

  // ── Customer Advisory Board (3 HIGH) ──────────────────────────────────────
  // B2B CAB canon (Stettler, Moore, Pragmatic Marketing playbooks) names
  // three direct relationships: CABs CONVENE ceremonies, SURFACE research
  // questions (the agenda), and OUTPUT initiatives (the action commitments).
  //
  // User_advisory_board → ceremony: CABs convene as quarterly meetings;
  // each meeting is a ceremony entity. Hierarchy because the CAB OWNS
  // its ceremonies (the board defines the cadence; ceremonies belong to
  // it). Extends ceremony's hierarchy parents (previously only `team`).
  // Verb "convenes_as" captures the meeting cadence semantic.
  user_advisory_board_convenes_as_ceremony: { forward_verb: 'convenes_as', reverse_verb: 'convenes', classification: 'hierarchy', source_type: 'user_advisory_board', target_type: 'ceremony' },
  // User_advisory_board → research_question: CAB agendas are structured
  // around research questions the company wants strategic input on
  // (Stettler's CAB playbook explicit pattern: "prepare 3-5 strategic
  // questions for the quarterly meeting"). Cross-domain because the CAB
  // is a feedback program and research_question is in UX Research. Verb
  // "surfaces" mirrors `insight_surfaces_opportunity`.
  user_advisory_board_surfaces_research_question: { forward_verb: 'surfaces', reverse_verb: 'surfaced_by', classification: 'cross-domain', source_type: 'user_advisory_board', target_type: 'research_question' },
  // User_advisory_board → initiative: CAB outputs are commitments and
  // direction for product initiatives, the explicit "outcomes" of any
  // well-run CAB (Stettler, Moore). Cross-domain because CAB is in
  // Feedback/VoC and initiative is in Strategy. Verb "shapes" captures
  // the influence-not-ownership semantic: CABs don't OWN initiatives,
  // they shape them.
  user_advisory_board_shapes_initiative: { forward_verb: 'shapes', reverse_verb: 'shaped_by', classification: 'cross-domain', source_type: 'user_advisory_board', target_type: 'initiative' },

  // ── Customer Effort Score (3 HIGH) ────────────────────────────────────────
  // Dixon/Toman/DeLisi's "Effortless Experience" canon: CES is a metric
  // collected via feedback programs, segments customers by effort score,
  // surfaces themes for service improvement. Three direct edges are named
  // in the source literature.
  //
  // Feedback_program → metric: CES, NPS, CSAT are all metrics collected
  // via feedback programs. Causal because the program's execution
  // produces the metric reading. Parallel to `feedback_program_runs_nps_campaign`
  // (existing) but at the metric level (the campaign is the runtime; the
  // metric is the recorded value).
  feedback_program_measured_by_metric: { forward_verb: 'measured_by', reverse_verb: 'measures', classification: 'causal', source_type: 'feedback_program', target_type: 'metric' },
  // Metric → behavioral_segment: parallel to existing
  // `metric_segmented_by_persona` (cross-domain): a metric's distribution
  // segments users into behavioral groups (high-effort vs low-effort in
  // CES; promoters/passives/detractors in NPS). Cross-domain because
  // metric is in Strategy/Analytics and behavioral_segment is in Growth.
  metric_segmented_by_behavioral_segment: { forward_verb: 'segmented_by', reverse_verb: 'segments', classification: 'cross-domain', source_type: 'metric', target_type: 'behavioral_segment' },
  // Feedback_theme → insight: themes aggregate raw feedback into patterns;
  // patterns ARE insights. Parallel to `observation_yields_insight` and
  // `affinity_cluster_synthesises_insight`; feedback_theme is the
  // feedback-domain analogue. Cross-domain because feedback_theme is in
  // Feedback/VoC and insight is in UX Research.
  feedback_theme_surfaces_insight: { forward_verb: 'surfaces', reverse_verb: 'surfaced_by', classification: 'cross-domain', source_type: 'feedback_theme', target_type: 'insight' },

  // ── Cross-framework canonical research edges (2 HIGH) ─────────────────────
  // Agent V (Part 2b) flagged research-discovery edges as broadly useful
  // beyond any single framework. Two qualify here:
  //
  // Insight → quote: standard research synthesis canon. Insights are
  // EVIDENCED by quotes. The catalog has `observation_evidenced_by_quote`
  // (observation ← quote) but not the insight ← quote evidencing pattern.
  // Hierarchy because the quote is structurally subordinate (the insight
  // owns its evidencing quotes). Useful across usability-test-plan,
  // research-democratisation, research-ops-framework, and any future
  // research-synthesis pipeline.
  insight_evidenced_by_quote: { forward_verb: 'evidenced_by', reverse_verb: 'evidences', classification: 'hierarchy', source_type: 'insight', target_type: 'quote' },
  // Journey_step → observation: CX research canon. Journey steps are
  // INSTRUMENTED with observations (think-aloud notes, behavioural events,
  // pain-point captures at each step). Cross-domain because journey_step
  // is in Experience Design and observation is in UX Research. Parallel
  // to `journey_step_reveals_need` (existing); both express "what
  // research surfaces at this step". Useful for any journey-based
  // research method (CX mapping, service blueprint, behavioural cohort).
  journey_step_yields_observation: { forward_verb: 'yields', reverse_verb: 'yielded_in', classification: 'cross-domain', source_type: 'journey_step', target_type: 'observation' },

} satisfies Record<string, UPGEdgeDefinition>

// ─── Polymorphic edge registry ──────────────────────────────────────

/** The `UPGEdgeType` union derived from the registry above. Declared here (not
 *  in `shapes/edges.ts`) so the polymorphic list below can reference it
 *  without creating a cyclic import. */
type _UPGEdgeTypeLocal = keyof typeof UPG_EDGE_CATALOG

/**
 * Canonical allow-list of edges that use the `'node'` wildcard endpoint.
 *
 * Three semantic families are sanctioned:
 *
 * 1. **Universal semantic verbs**: any node can inform / constrain / inspire
 *    any other node. The meaning is deliberately abstract; consumers render
 *    them as plain relational signals.
 * 2. **Decision-to-anything**: a decision can influence, be constrained by,
 *    or produce any kind of node. Decisions cut across domains; binding the
 *    target would force a combinatorial explosion.
 * 3. **Universal ownership**: any node can be owned by a team, role,
 *    stakeholder, department, or person. Ownership is not per-entity-type.
 *
 * Adding a new polymorphic edge requires extending this array AND the
 * spec-integrity regression test, which forces a conscious decision and
 * keeps consumers (MCP, Entopo, audit tools) able to enumerate the full set.
 */
export const UPG_POLYMORPHIC_EDGE_KEYS: readonly _UPGEdgeTypeLocal[] = [
  // Universal semantic verbs
  'node_informs_node',
  'node_constrains_node',
  'node_inspires_node',
  // Decision-to-anything
  'decision_influences_node',
  'decision_constrained_by_node',
  'decision_produces_node',
  // Universal ownership
  'node_owned_by_team',
  'node_owned_by_role',
  'node_owned_by_stakeholder',
  'node_owned_by_department',
  'node_owned_by_person',
  // Universal architecture references
  'node_belongs_to_bounded_context',
] as const

const _POLY_KEY_SET = new Set<string>(UPG_POLYMORPHIC_EDGE_KEYS)

/**
 * True if the edge uses the `'node'` wildcard at either endpoint. Derived
 * dynamically from `source_type`/`target_type`, not from the allow-list,
 * so an accidentally-added polymorphic edge still returns true and surfaces
 * via the invariant test rather than silently passing.
 *
 * @example
 * isPolymorphicEdge('node_owned_by_team')    // → true  (source is 'node' wildcard)
 * isPolymorphicEdge('persona_pursues_job')   // → false (both endpoints typed)
 */
export function isPolymorphicEdge(key: _UPGEdgeTypeLocal): boolean {
  const def = UPG_EDGE_CATALOG[key]
  return def.source_type === UPG_WILDCARD_ENDPOINT || def.target_type === UPG_WILDCARD_ENDPOINT
}

/**
 * True if the edge is in the registered polymorphic allow-list.
 *
 * @example
 * isRegisteredPolymorphicEdge('node_owned_by_team')    // → true
 * isRegisteredPolymorphicEdge('persona_pursues_job')   // → false
 */
export function isRegisteredPolymorphicEdge(key: _UPGEdgeTypeLocal): boolean {
  return _POLY_KEY_SET.has(key)
}
