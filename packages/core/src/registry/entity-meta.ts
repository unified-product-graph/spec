/**
 * UPG Entity Type Metadata. Immutable `type_id`, human-readable `name`,
 * `maturity` (draft → proposed → stable → deprecated → removed), and version
 * tracking (`since`, `deprecated_in`, `replacement`).
 *
 * ## Maturity Promotion Rubric
 *
 * Promote `proposed → stable` when all of:
 *
 * 1. Referenced by ≥2 framework slots in `src/frameworks/definitions/`.
 * 2. Carries ≥3 properties in `UPG_PROPERTY_SCHEMA`.
 * 3. Has a lifecycle in `UPG_LIFECYCLES` or is documented lifecycle-free.
 * 4. No rename, merge, or restructure ticket open for 30+ days.
 *
 * Demote `proposed → deprecated` when:
 *
 * - 2 minor versions pass without a framework reference.
 * - Canonical overlap with a newer type.
 *
 * `scripts/audit-proposed-promotion.ts` checks the rubric.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type UPGEntityTypeMaturity = 'draft' | 'proposed' | 'stable' | 'deprecated' | 'removed'

/**
 * Identity + lifecycle metadata for a single UPG entity type.
 *
 * @example
 * const personaMeta: EntityTypeMeta = {
 *   name: 'persona',
 *   type_id: 'ent_016',
 *   maturity: 'stable',
 *   since: '0.1.0',
 * }
 *
 * @example
 * // Deprecated type: readable in .upg files, migrates on write.
 * const painPointMeta: EntityTypeMeta = {
 *   name: 'pain_point',
 *   type_id: 'ent_018',
 *   maturity: 'deprecated',
 *   since: '0.1.0',
 *   deprecated_in: '0.1.0',
 *   replacement: 'need',
 * }
 */
export interface EntityTypeMeta {
  /** Human-readable type name (e.g. 'need'). May change across versions. */
  name: string
  /** Immutable identifier (e.g. 'ent_313'). Never changes, even if name changes. */
  type_id: string
  /** Current maturity level */
  maturity: UPGEntityTypeMaturity
  /** UPG version when this type was introduced */
  since: string
  /** UPG version when this type was deprecated (if applicable) */
  deprecated_in?: string
  /** UPG version when this type was removed (if applicable) */
  removed_in?: string
  /** Canonical replacement type (if deprecated) */
  replacement?: string
}

// ─── Entity type registry ──────────────────────────────────────────────────────

export const UPG_ENTITY_META: readonly EntityTypeMeta[] = [

  // ── Strategic ──
  { name: 'product', type_id: 'ent_001', maturity: 'stable', since: '0.1.0' },
  { name: 'outcome', type_id: 'ent_002', maturity: 'stable', since: '0.1.0' },
  { name: 'kpi', type_id: 'ent_003', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'metric' },
  { name: 'objective', type_id: 'ent_004', maturity: 'stable', since: '0.1.0' },
  { name: 'key_result', type_id: 'ent_005', maturity: 'stable', since: '0.1.0' },
  { name: 'metric', type_id: 'ent_006', maturity: 'stable', since: '0.1.0' },
  { name: 'metric_quality_assessment', type_id: 'ent_339', maturity: 'proposed', since: '0.2.2' },
  { name: 'vision', type_id: 'ent_007', maturity: 'stable', since: '0.1.0' },
  { name: 'mission', type_id: 'ent_008', maturity: 'stable', since: '0.1.0' },
  { name: 'strategic_theme', type_id: 'ent_009', maturity: 'stable', since: '0.1.0' },
  { name: 'initiative', type_id: 'ent_010', maturity: 'stable', since: '0.1.0' },
  { name: 'capability', type_id: 'ent_011', maturity: 'stable', since: '0.1.0' },
  { name: 'value_stream', type_id: 'ent_012', maturity: 'stable', since: '0.1.0' },
  { name: 'strategic_pillar', type_id: 'ent_013', maturity: 'stable', since: '0.1.0' },
  { name: 'assumption', type_id: 'ent_014', maturity: 'stable', since: '0.1.0' },
  { name: 'decision', type_id: 'ent_015', maturity: 'stable', since: '0.1.0' },
  { name: 'constraint', type_id: 'ent_348', maturity: 'stable', since: '0.4.3' },

  // ── User ──
  { name: 'persona', type_id: 'ent_016', maturity: 'stable', since: '0.1.0' },
  { name: 'job', type_id: 'ent_017', maturity: 'stable', since: '0.1.0' },
  { name: 'jtbd', type_id: 'ent_332', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'job' },
  { name: 'pain_point', type_id: 'ent_018', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'need' },
  { name: 'desired_outcome', type_id: 'ent_019', maturity: 'stable', since: '0.1.0' },
  { name: 'job_step', type_id: 'ent_020', maturity: 'stable', since: '0.1.0' },
  { name: 'user_need', type_id: 'ent_021', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'need' },
  { name: 'need', type_id: 'ent_313', maturity: 'stable', since: '0.1.0' },
  { name: 'switching_cost', type_id: 'ent_022', maturity: 'stable', since: '0.1.0' },

  // ── Discovery ──
  { name: 'opportunity', type_id: 'ent_023', maturity: 'stable', since: '0.1.0' },
  { name: 'solution', type_id: 'ent_024', maturity: 'stable', since: '0.1.0' },
  { name: 'feasibility_study', type_id: 'ent_025', maturity: 'stable', since: '0.1.0' },
  { name: 'design_sprint', type_id: 'ent_026', maturity: 'stable', since: '0.1.0' },

  // ── Validation ──
  // (since v0.4.0) `hypothesis` re-promoted to canonical-stable. The
  // v0.2.8 rename to `hypothesis_claim` was over-split: "claim" is implied
  // by being a hypothesis. Canonical name reverts; HypothesisClaimProperties
  // renamed to HypothesisProperties. `hypothesis_claim` is now deprecated
  // (→ `hypothesis`). `hypothesis_evidence` deprecated (→ `evidence`): the
  // dual evidence_type enum smell resolved by enriching canonical `evidence`
  // with evidence_rigor + evidence_source axes. Edge pattern switches to
  // `hypothesis_has_evidence` (neutral, direction on node).
  { name: 'hypothesis', type_id: 'ent_027', maturity: 'stable', since: '0.1.0' },
  { name: 'hypothesis_claim', type_id: 'ent_344', maturity: 'deprecated', since: '0.2.8', deprecated_in: '0.4.0', replacement: 'hypothesis' },
  { name: 'hypothesis_evidence', type_id: 'ent_345', maturity: 'deprecated', since: '0.2.8', deprecated_in: '0.4.0', replacement: 'evidence' },
  // `experiment` is canonical. It has its own property schema
  // (method, start_date, end_date, sample_size, expected_lift) and is the
  // canonical parent of `ab_test` in the hierarchy. Plan/Run split
  // (experiment_plan + experiment_run) remains as the fine-grained option;
  // `experiment` covers the general-purpose use case.
  { name: 'experiment', type_id: 'ent_028', maturity: 'stable', since: '0.1.0' },
  { name: 'experiment_plan', type_id: 'ent_340', maturity: 'proposed', since: '0.2.6' },
  { name: 'experiment_run', type_id: 'ent_341', maturity: 'proposed', since: '0.2.6' },
  { name: 'learning', type_id: 'ent_029', maturity: 'stable', since: '0.1.0' },
  { name: 'test_plan', type_id: 'ent_030', maturity: 'stable', since: '0.1.0' },
  { name: 'evidence', type_id: 'ent_031', maturity: 'stable', since: '0.1.0' },
  { name: 'research_plan', type_id: 'ent_032', maturity: 'stable', since: '0.1.0' },

  // ── Market Intelligence ──
  { name: 'competitor', type_id: 'ent_033', maturity: 'stable', since: '0.1.0' },
  { name: 'competitor_feature', type_id: 'ent_034', maturity: 'stable', since: '0.1.0' },
  { name: 'market_trend', type_id: 'ent_035', maturity: 'stable', since: '0.1.0' },
  { name: 'market_segment', type_id: 'ent_036', maturity: 'stable', since: '0.1.0' },
  { name: 'competitive_analysis', type_id: 'ent_037', maturity: 'stable', since: '0.1.0' },
  // Classification taxonomy hosted by competitive_analysis.
  { name: 'classification_axis', type_id: 'ent_346', maturity: 'proposed', since: '0.4.0' },
  { name: 'classification_value', type_id: 'ent_347', maturity: 'proposed', since: '0.4.0' },

  // ── UX Research ──
  { name: 'research_study', type_id: 'ent_038', maturity: 'stable', since: '0.1.0' },
  { name: 'research_insight', type_id: 'ent_039', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'insight' },
  { name: 'insight', type_id: 'ent_040', maturity: 'stable', since: '0.1.0' },
  { name: 'participant', type_id: 'ent_041', maturity: 'stable', since: '0.1.0' },
  { name: 'observation', type_id: 'ent_042', maturity: 'stable', since: '0.1.0' },
  { name: 'quote', type_id: 'ent_043', maturity: 'stable', since: '0.1.0' },
  { name: 'affinity_cluster', type_id: 'ent_044', maturity: 'stable', since: '0.1.0' },
  { name: 'research_question', type_id: 'ent_045', maturity: 'stable', since: '0.1.0' },
  { name: 'interview_guide', type_id: 'ent_046', maturity: 'stable', since: '0.1.0' },
  { name: 'finding', type_id: 'ent_047', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'insight' },
  { name: 'survey_response', type_id: 'ent_048', maturity: 'stable', since: '0.1.0' },
  { name: 'highlight', type_id: 'ent_049', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'observation' },

  // ── Design ──
  { name: 'user_journey', type_id: 'ent_050', maturity: 'stable', since: '0.1.0' },
  { name: 'journey_step', type_id: 'ent_051', maturity: 'stable', since: '0.1.0' },
  { name: 'ux_insight', type_id: 'ent_052', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'insight' },
  { name: 'design_question', type_id: 'ent_053', maturity: 'stable', since: '0.1.0' },
  { name: 'how_might_we', type_id: 'ent_333', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'design_question' },
  { name: 'design_concept', type_id: 'ent_054', maturity: 'stable', since: '0.1.0' },
  { name: 'prototype', type_id: 'ent_055', maturity: 'stable', since: '0.1.0' },
  { name: 'design_component', type_id: 'ent_056', maturity: 'stable', since: '0.1.0' },
  { name: 'design_token', type_id: 'ent_057', maturity: 'stable', since: '0.1.0' },
  { name: 'brand_identity', type_id: 'ent_058', maturity: 'stable', since: '0.1.0' },
  { name: 'brand_colour', type_id: 'ent_059', maturity: 'stable', since: '0.1.0' },
  { name: 'brand_typography', type_id: 'ent_060', maturity: 'stable', since: '0.1.0' },
  { name: 'brand_voice', type_id: 'ent_061', maturity: 'stable', since: '0.1.0' },
  { name: 'wireframe', type_id: 'ent_062', maturity: 'stable', since: '0.1.0' },
  { name: 'design_pattern', type_id: 'ent_063', maturity: 'stable', since: '0.1.0' },
  { name: 'design_guideline', type_id: 'ent_064', maturity: 'stable', since: '0.1.0' },
  { name: 'annotation', type_id: 'ent_065', maturity: 'stable', since: '0.1.0' },
  { name: 'interaction_spec', type_id: 'ent_066', maturity: 'stable', since: '0.1.0' },
  { name: 'design_system', type_id: 'ent_067', maturity: 'stable', since: '0.1.0' },
  { name: 'user_flow', type_id: 'ent_068', maturity: 'stable', since: '0.1.0' },
  { name: 'screen', type_id: 'ent_069', maturity: 'stable', since: '0.1.0' },
  { name: 'screen_state', type_id: 'ent_070', maturity: 'stable', since: '0.1.0' },
  { name: 'journey_phase', type_id: 'ent_330', maturity: 'proposed', since: '0.2.0' },
  { name: 'journey_action', type_id: 'ent_331', maturity: 'proposed', since: '0.2.0' },
  { name: 'design_decision', type_id: 'ent_319', maturity: 'deprecated', since: '0.2.0', deprecated_in: '0.2.0', replacement: 'decision' },
  { name: 'brand_logo', type_id: 'ent_321', maturity: 'proposed', since: '0.2.0' },
  { name: 'brand_imagery', type_id: 'ent_322', maturity: 'proposed', since: '0.2.0' },

  // ── Product Spec ──
  { name: 'feature_area', type_id: 'ent_314', maturity: 'stable', since: '0.1.0' },
  { name: 'feature', type_id: 'ent_071', maturity: 'stable', since: '0.1.0' },
  { name: 'epic', type_id: 'ent_072', maturity: 'stable', since: '0.1.0' },
  // `user_story` is the templated "As X, I want Y so Z" promise: a stable,
  // lifecycle-free design artefact (UCS pattern P5). The v0.2.7 split EXTRACTED
  // the engineering work into a separate `task` (the lifecycle-bearing work-unit,
  // linked via `task_implements_user_story`); the split was right. But the
  // surviving statement half was renamed to the coined `story_statement`, which
  // raised the adoption barrier. "user story" is the universally-recognised
  // industry term for exactly this artefact. v0.7.0 re-canonicalises
  // the statement under `user_story`; `story_statement` becomes a deprecated
  // alias. `story_task` (the original work half) was already collapsed into
  // canonical `task` at v0.4.0. So the canonical shape is: user_story (statement)
  // + task (work), linked by `task_implements_user_story`.
  { name: 'user_story', type_id: 'ent_073', maturity: 'proposed', since: '0.1.0' },
  { name: 'story_statement', type_id: 'ent_342', maturity: 'deprecated', since: '0.2.7', deprecated_in: '0.7.0', replacement: 'user_story' },
  { name: 'story_task', type_id: 'ent_343', maturity: 'deprecated', since: '0.2.7', deprecated_in: '0.4.0', replacement: 'task' },
  { name: 'acceptance_criterion', type_id: 'ent_074', maturity: 'stable', since: '0.1.0' },
  { name: 'release', type_id: 'ent_075', maturity: 'stable', since: '0.1.0' },
  { name: 'task', type_id: 'ent_076', maturity: 'stable', since: '0.1.0' },
  { name: 'bug', type_id: 'ent_077', maturity: 'stable', since: '0.1.0' },
  { name: 'roadmap', type_id: 'ent_078', maturity: 'stable', since: '0.1.0' },
  { name: 'roadmap_item', type_id: 'ent_079', maturity: 'stable', since: '0.1.0' },
  { name: 'theme', type_id: 'ent_080', maturity: 'stable', since: '0.1.0' },
  { name: 'changelog', type_id: 'ent_081', maturity: 'stable', since: '0.1.0' },

  // ── Engineering ──
  { name: 'bounded_context', type_id: 'ent_082', maturity: 'stable', since: '0.1.0' },
  { name: 'service', type_id: 'ent_083', maturity: 'stable', since: '0.1.0' },
  { name: 'domain_event', type_id: 'ent_084', maturity: 'stable', since: '0.1.0' },
  { name: 'api_contract', type_id: 'ent_085', maturity: 'stable', since: '0.1.0' },
  { name: 'architecture_decision', type_id: 'ent_086', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'decision' },
  { name: 'technical_debt_item', type_id: 'ent_087', maturity: 'stable', since: '0.1.0' },
  { name: 'feature_flag', type_id: 'ent_088', maturity: 'stable', since: '0.1.0' },
  { name: 'deployment', type_id: 'ent_089', maturity: 'stable', since: '0.1.0' },
  { name: 'aggregate', type_id: 'ent_090', maturity: 'stable', since: '0.1.0' },
  { name: 'domain_entity', type_id: 'ent_091', maturity: 'stable', since: '0.1.0' },
  { name: 'value_object', type_id: 'ent_092', maturity: 'stable', since: '0.1.0' },
  { name: 'command', type_id: 'ent_093', maturity: 'stable', since: '0.1.0' },
  { name: 'read_model', type_id: 'ent_094', maturity: 'stable', since: '0.1.0' },
  { name: 'api_endpoint', type_id: 'ent_095', maturity: 'stable', since: '0.1.0' },
  { name: 'database_schema', type_id: 'ent_096', maturity: 'stable', since: '0.1.0' },
  { name: 'queue_topic', type_id: 'ent_097', maturity: 'stable', since: '0.1.0' },
  { name: 'build_artifact', type_id: 'ent_098', maturity: 'stable', since: '0.1.0' },
  { name: 'code_repository', type_id: 'ent_099', maturity: 'stable', since: '0.1.0' },
  { name: 'library_dependency', type_id: 'ent_100', maturity: 'stable', since: '0.1.0' },
  { name: 'integration_pattern', type_id: 'ent_101', maturity: 'stable', since: '0.1.0' },
  { name: 'external_api', type_id: 'ent_102', maturity: 'stable', since: '0.1.0' },
  { name: 'data_flow', type_id: 'ent_103', maturity: 'stable', since: '0.1.0' },
  { name: 'investigation', type_id: 'ent_315', maturity: 'stable', since: '0.2.0' },
  { name: 'root_cause', type_id: 'ent_316', maturity: 'stable', since: '0.2.0' },
  { name: 'symptom', type_id: 'ent_317', maturity: 'stable', since: '0.2.0' },
  { name: 'fix', type_id: 'ent_318', maturity: 'stable', since: '0.2.0' },

  // ── Growth ──
  { name: 'north_star_metric', type_id: 'ent_104', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'metric' },
  { name: 'input_metric', type_id: 'ent_105', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'metric' },
  { name: 'funnel', type_id: 'ent_106', maturity: 'stable', since: '0.1.0' },
  { name: 'funnel_step', type_id: 'ent_107', maturity: 'stable', since: '0.1.0' },
  { name: 'acquisition_channel', type_id: 'ent_108', maturity: 'stable', since: '0.1.0' },
  { name: 'growth_campaign', type_id: 'ent_109', maturity: 'stable', since: '0.1.0' },
  { name: 'campaign', type_id: 'ent_337', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'growth_campaign' },
  { name: 'cohort', type_id: 'ent_110', maturity: 'stable', since: '0.1.0' },
  { name: 'behavioral_segment', type_id: 'ent_111', maturity: 'stable', since: '0.1.0' },
  { name: 'segment', type_id: 'ent_338', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'behavioral_segment' },
  { name: 'growth_loop', type_id: 'ent_112', maturity: 'stable', since: '0.1.0' },
  { name: 'growth_experiment', type_id: 'ent_113', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'experiment_run' },
  { name: 'variant', type_id: 'ent_114', maturity: 'stable', since: '0.1.0' },
  { name: 'attribution_model', type_id: 'ent_115', maturity: 'stable', since: '0.1.0' },

  // ── Business Model ──
  { name: 'business_model', type_id: 'ent_116', maturity: 'stable', since: '0.1.0' },
  { name: 'value_proposition', type_id: 'ent_117', maturity: 'stable', since: '0.1.0' },
  { name: 'revenue_stream', type_id: 'ent_118', maturity: 'stable', since: '0.1.0' },
  { name: 'pricing_tier', type_id: 'ent_119', maturity: 'stable', since: '0.1.0' },
  { name: 'cost_structure', type_id: 'ent_120', maturity: 'stable', since: '0.1.0' },
  { name: 'unit_economics', type_id: 'ent_121', maturity: 'stable', since: '0.1.0' },
  { name: 'partnership', type_id: 'ent_122', maturity: 'stable', since: '0.1.0' },
  { name: 'key_resource', type_id: 'ent_123', maturity: 'stable', since: '0.1.0' },
  { name: 'key_activity', type_id: 'ent_124', maturity: 'stable', since: '0.1.0' },
  { name: 'customer_segment_bm', type_id: 'ent_125', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'market_segment' },
  { name: 'channel_bm', type_id: 'ent_126', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'distribution_channel' },
  { name: 'target_customer_segment', type_id: 'ent_329', maturity: 'deprecated', since: '0.2.0', deprecated_in: '0.2.0', replacement: 'market_segment' },
  { name: 'customer_relationship', type_id: 'ent_127', maturity: 'stable', since: '0.1.0' },
  { name: 'distribution_channel', type_id: 'ent_128', maturity: 'stable', since: '0.1.0' },

  // ── Go-To-Market ──
  { name: 'gtm_strategy', type_id: 'ent_129', maturity: 'stable', since: '0.1.0' },
  { name: 'ideal_customer_profile', type_id: 'ent_130', maturity: 'stable', since: '0.1.0' },
  { name: 'positioning', type_id: 'ent_131', maturity: 'stable', since: '0.1.0' },
  { name: 'messaging', type_id: 'ent_132', maturity: 'stable', since: '0.1.0' },
  { name: 'launch', type_id: 'ent_133', maturity: 'stable', since: '0.1.0' },
  { name: 'content_strategy', type_id: 'ent_134', maturity: 'stable', since: '0.1.0' },
  { name: 'sales_motion', type_id: 'ent_135', maturity: 'stable', since: '0.1.0' },
  { name: 'competitive_battle_card', type_id: 'ent_136', maturity: 'stable', since: '0.1.0' },
  { name: 'demand_gen_program', type_id: 'ent_137', maturity: 'stable', since: '0.1.0' },
  { name: 'territory', type_id: 'ent_138', maturity: 'stable', since: '0.1.0' },
  { name: 'objection', type_id: 'ent_139', maturity: 'stable', since: '0.1.0' },
  { name: 'rebuttal', type_id: 'ent_140', maturity: 'stable', since: '0.1.0' },
  { name: 'proof_point', type_id: 'ent_141', maturity: 'stable', since: '0.1.0' },

  // ── Team & Organisation ──
  { name: 'team', type_id: 'ent_142', maturity: 'stable', since: '0.1.0' },
  { name: 'role', type_id: 'ent_143', maturity: 'stable', since: '0.1.0' },
  { name: 'stakeholder', type_id: 'ent_144', maturity: 'stable', since: '0.1.0' },
  { name: 'person', type_id: 'ent_349', maturity: 'stable', since: '0.5.0' },
  { name: 'product_decision', type_id: 'ent_145', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'decision' },
  { name: 'team_okr', type_id: 'ent_146', maturity: 'stable', since: '0.1.0' },
  { name: 'retrospective', type_id: 'ent_147', maturity: 'stable', since: '0.1.0' },
  { name: 'dependency', type_id: 'ent_148', maturity: 'stable', since: '0.1.0' },
  { name: 'department', type_id: 'ent_149', maturity: 'stable', since: '0.1.0' },
  { name: 'skill', type_id: 'ent_150', maturity: 'stable', since: '0.1.0' },
  { name: 'ceremony', type_id: 'ent_151', maturity: 'stable', since: '0.1.0' },
  { name: 'capacity_plan', type_id: 'ent_152', maturity: 'stable', since: '0.1.0' },

  // ── Data & Analytics ──
  { name: 'data_source', type_id: 'ent_153', maturity: 'stable', since: '0.1.0' },
  { name: 'metric_definition', type_id: 'ent_154', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'metric' },
  { name: 'event_schema', type_id: 'ent_155', maturity: 'stable', since: '0.1.0' },
  { name: 'dashboard', type_id: 'ent_156', maturity: 'stable', since: '0.1.0' },
  { name: 'ab_test', type_id: 'ent_157', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'experiment_run' },
  { name: 'data_model', type_id: 'ent_158', maturity: 'stable', since: '0.1.0' },
  { name: 'data_quality_rule', type_id: 'ent_159', maturity: 'stable', since: '0.1.0' },
  { name: 'data_product', type_id: 'ent_160', maturity: 'stable', since: '0.1.0' },
  { name: 'data_pipeline', type_id: 'ent_161', maturity: 'stable', since: '0.1.0' },
  { name: 'data_lineage', type_id: 'ent_162', maturity: 'stable', since: '0.1.0' },
  { name: 'glossary_term', type_id: 'ent_163', maturity: 'stable', since: '0.1.0' },
  { name: 'data_domain', type_id: 'ent_164', maturity: 'stable', since: '0.1.0' },
  { name: 'report', type_id: 'ent_165', maturity: 'stable', since: '0.1.0' },

  // ── Content & Knowledge ──
  { name: 'content_piece', type_id: 'ent_166', maturity: 'stable', since: '0.1.0' },
  { name: 'knowledge_base_article', type_id: 'ent_167', maturity: 'stable', since: '0.1.0' },
  { name: 'brand_asset', type_id: 'ent_168', maturity: 'stable', since: '0.1.0' },
  { name: 'internal_doc', type_id: 'ent_169', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'document' },
  { name: 'prompt_template', type_id: 'ent_170', maturity: 'stable', since: '0.1.0' },
  { name: 'content_calendar', type_id: 'ent_171', maturity: 'stable', since: '0.1.0' },
  { name: 'content_theme', type_id: 'ent_172', maturity: 'stable', since: '0.1.0' },
  { name: 'documentation_template', type_id: 'ent_173', maturity: 'stable', since: '0.1.0' },
  { name: 'document', type_id: 'ent_320', maturity: 'stable', since: '0.2.0' },

  // ── Legal & Compliance ──
  { name: 'compliance_requirement', type_id: 'ent_174', maturity: 'stable', since: '0.1.0' },
  { name: 'risk', type_id: 'ent_175', maturity: 'stable', since: '0.1.0' },
  { name: 'data_contract', type_id: 'ent_176', maturity: 'stable', since: '0.1.0' },
  { name: 'legal_entity', type_id: 'ent_177', maturity: 'stable', since: '0.1.0' },
  { name: 'ip_asset', type_id: 'ent_178', maturity: 'stable', since: '0.1.0' },
  { name: 'audit_log_policy', type_id: 'ent_179', maturity: 'stable', since: '0.1.0' },
  { name: 'contract', type_id: 'ent_180', maturity: 'stable', since: '0.1.0' },
  { name: 'contract_clause', type_id: 'ent_181', maturity: 'stable', since: '0.1.0' },
  { name: 'privacy_policy', type_id: 'ent_182', maturity: 'stable', since: '0.1.0' },
  { name: 'compliance_framework', type_id: 'ent_183', maturity: 'stable', since: '0.1.0' },
  { name: 'security_audit', type_id: 'ent_184', maturity: 'stable', since: '0.1.0' },

  // ── DevOps & Platform ──
  { name: 'service_level_indicator', type_id: 'ent_185', maturity: 'stable', since: '0.1.0' },
  { name: 'sli', type_id: 'ent_334', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'service_level_indicator' },
  { name: 'service_level_objective', type_id: 'ent_186', maturity: 'stable', since: '0.1.0' },
  { name: 'slo', type_id: 'ent_335', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'service_level_objective' },
  { name: 'error_budget', type_id: 'ent_187', maturity: 'stable', since: '0.1.0' },
  { name: 'incident', type_id: 'ent_188', maturity: 'stable', since: '0.1.0' },
  { name: 'postmortem', type_id: 'ent_189', maturity: 'stable', since: '0.1.0' },
  { name: 'runbook', type_id: 'ent_190', maturity: 'stable', since: '0.1.0' },
  { name: 'monitor', type_id: 'ent_191', maturity: 'stable', since: '0.1.0' },
  { name: 'alert_rule', type_id: 'ent_192', maturity: 'stable', since: '0.1.0' },
  { name: 'ci_pipeline', type_id: 'ent_193', maturity: 'stable', since: '0.1.0' },
  { name: 'release_strategy', type_id: 'ent_194', maturity: 'stable', since: '0.1.0' },
  { name: 'on_call_rotation', type_id: 'ent_195', maturity: 'stable', since: '0.1.0' },
  { name: 'infrastructure_component', type_id: 'ent_196', maturity: 'stable', since: '0.1.0' },

  // ── Security ──
  { name: 'threat_model', type_id: 'ent_197', maturity: 'stable', since: '0.1.0' },
  { name: 'threat', type_id: 'ent_198', maturity: 'stable', since: '0.1.0' },
  { name: 'vulnerability', type_id: 'ent_199', maturity: 'stable', since: '0.1.0' },
  { name: 'security_control', type_id: 'ent_200', maturity: 'stable', since: '0.1.0' },
  { name: 'security_policy', type_id: 'ent_201', maturity: 'stable', since: '0.1.0' },
  { name: 'security_incident', type_id: 'ent_202', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'incident' },
  { name: 'penetration_test', type_id: 'ent_203', maturity: 'stable', since: '0.1.0' },
  { name: 'security_review', type_id: 'ent_204', maturity: 'stable', since: '0.1.0' },
  { name: 'data_classification', type_id: 'ent_205', maturity: 'stable', since: '0.1.0' },
  { name: 'access_policy', type_id: 'ent_206', maturity: 'stable', since: '0.1.0' },

  // ── Accessibility ──
  { name: 'a11y_standard', type_id: 'ent_207', maturity: 'stable', since: '0.1.0' },
  { name: 'a11y_guideline', type_id: 'ent_208', maturity: 'stable', since: '0.1.0' },
  { name: 'a11y_audit', type_id: 'ent_209', maturity: 'stable', since: '0.1.0' },
  { name: 'a11y_issue', type_id: 'ent_210', maturity: 'stable', since: '0.1.0' },
  { name: 'a11y_annotation', type_id: 'ent_211', maturity: 'stable', since: '0.1.0' },

  // ── QA & Testing ──
  { name: 'test_suite', type_id: 'ent_212', maturity: 'stable', since: '0.1.0' },
  { name: 'test_case', type_id: 'ent_213', maturity: 'stable', since: '0.1.0' },
  { name: 'qa_session', type_id: 'ent_214', maturity: 'stable', since: '0.1.0' },
  { name: 'regression_test', type_id: 'ent_215', maturity: 'stable', since: '0.1.0' },
  { name: 'test_coverage_report', type_id: 'ent_216', maturity: 'stable', since: '0.1.0' },
  { name: 'test_environment', type_id: 'ent_217', maturity: 'stable', since: '0.1.0' },
  { name: 'defect_report', type_id: 'ent_218', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'support_ticket' },
  { name: 'test_result', type_id: 'ent_327', maturity: 'proposed', since: '0.2.0' },

  // ── Feedback & Voice of Customer ──
  { name: 'feedback_program', type_id: 'ent_219', maturity: 'stable', since: '0.1.0' },
  { name: 'feature_request', type_id: 'ent_220', maturity: 'stable', since: '0.1.0' },
  { name: 'feedback_vote', type_id: 'ent_221', maturity: 'stable', since: '0.1.0' },
  { name: 'nps_campaign', type_id: 'ent_222', maturity: 'stable', since: '0.1.0' },
  { name: 'user_advisory_board', type_id: 'ent_223', maturity: 'stable', since: '0.1.0' },
  { name: 'beta_program', type_id: 'ent_224', maturity: 'stable', since: '0.1.0' },
  { name: 'feedback_theme', type_id: 'ent_225', maturity: 'stable', since: '0.1.0' },

  // ── Pricing & Packaging ──
  { name: 'pricing_strategy', type_id: 'ent_226', maturity: 'stable', since: '0.1.0' },
  { name: 'pricing_experiment', type_id: 'ent_227', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'experiment_run' },
  { name: 'package', type_id: 'ent_228', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'pricing_tier' },
  { name: 'discount_strategy', type_id: 'ent_229', maturity: 'stable', since: '0.1.0' },
  { name: 'trial_config', type_id: 'ent_230', maturity: 'stable', since: '0.1.0' },
  { name: 'paywall', type_id: 'ent_231', maturity: 'stable', since: '0.1.0' },

  // ── AI/ML Operations ──
  { name: 'ai_model', type_id: 'ent_232', maturity: 'stable', since: '0.1.0' },
  { name: 'prompt_version', type_id: 'ent_233', maturity: 'stable', since: '0.1.0' },
  { name: 'eval_benchmark', type_id: 'ent_234', maturity: 'stable', since: '0.1.0' },
  { name: 'eval_run', type_id: 'ent_235', maturity: 'stable', since: '0.1.0' },
  { name: 'ai_cost_tracker', type_id: 'ent_236', maturity: 'stable', since: '0.1.0' },
  { name: 'hallucination_report', type_id: 'ent_237', maturity: 'stable', since: '0.1.0' },
  { name: 'ai_guardrail', type_id: 'ent_238', maturity: 'stable', since: '0.1.0' },
  { name: 'model_comparison', type_id: 'ent_239', maturity: 'stable', since: '0.1.0' },
  { name: 'ai_experiment', type_id: 'ent_323', maturity: 'proposed', since: '0.2.0' },
  { name: 'ai_dataset', type_id: 'ent_324', maturity: 'proposed', since: '0.2.0' },
  { name: 'ai_trace', type_id: 'ent_325', maturity: 'proposed', since: '0.2.0' },

  // ── Agentic Workflows ──
  { name: 'workflow_template', type_id: 'ent_240', maturity: 'stable', since: '0.1.0' },
  { name: 'workflow_run', type_id: 'ent_241', maturity: 'stable', since: '0.1.0' },
  { name: 'agent_definition', type_id: 'ent_242', maturity: 'stable', since: '0.1.0' },
  { name: 'agent_session', type_id: 'ent_243', maturity: 'stable', since: '0.1.0' },
  { name: 'review_gate', type_id: 'ent_244', maturity: 'stable', since: '0.1.0' },
  { name: 'approval_record', type_id: 'ent_245', maturity: 'stable', since: '0.1.0' },
  { name: 'agent_skill', type_id: 'ent_246', maturity: 'stable', since: '0.1.0' },
  { name: 'agent_hook', type_id: 'ent_247', maturity: 'stable', since: '0.1.0' },
  { name: 'workflow_artifact', type_id: 'ent_248', maturity: 'stable', since: '0.1.0' },
  { name: 'agent_task', type_id: 'ent_326', maturity: 'proposed', since: '0.2.0' },

  // ── Portfolio ──
  { name: 'organization', type_id: 'ent_249', maturity: 'stable', since: '0.1.0' },
  { name: 'portfolio', type_id: 'ent_250', maturity: 'stable', since: '0.1.0' },
  { name: 'product_area', type_id: 'ent_251', maturity: 'stable', since: '0.1.0' },

  // ── Sales & Revenue ──
  { name: 'account', type_id: 'ent_252', maturity: 'stable', since: '0.1.0' },
  { name: 'contact', type_id: 'ent_253', maturity: 'stable', since: '0.1.0' },
  { name: 'lead', type_id: 'ent_254', maturity: 'stable', since: '0.1.0' },
  { name: 'deal', type_id: 'ent_255', maturity: 'stable', since: '0.1.0' },
  { name: 'pipeline_sales', type_id: 'ent_256', maturity: 'stable', since: '0.1.0' },
  { name: 'pipeline_stage', type_id: 'ent_257', maturity: 'stable', since: '0.1.0' },
  { name: 'quote_document', type_id: 'ent_258', maturity: 'stable', since: '0.1.0' },
  { name: 'subscription', type_id: 'ent_259', maturity: 'stable', since: '0.1.0' },
  { name: 'invoice', type_id: 'ent_260', maturity: 'stable', since: '0.1.0' },
  { name: 'forecast', type_id: 'ent_261', maturity: 'stable', since: '0.1.0' },

  // ── Program Management ──
  { name: 'program', type_id: 'ent_262', maturity: 'stable', since: '0.1.0' },
  { name: 'project', type_id: 'ent_263', maturity: 'stable', since: '0.1.0' },
  { name: 'milestone', type_id: 'ent_264', maturity: 'stable', since: '0.1.0' },
  { name: 'risk_register', type_id: 'ent_265', maturity: 'stable', since: '0.1.0' },
  { name: 'risk_item', type_id: 'ent_266', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'risk' },
  { name: 'change_request', type_id: 'ent_267', maturity: 'stable', since: '0.1.0' },
  { name: 'deliverable', type_id: 'ent_268', maturity: 'stable', since: '0.1.0' },
  { name: 'resource_allocation', type_id: 'ent_269', maturity: 'stable', since: '0.1.0' },
  { name: 'status_report', type_id: 'ent_270', maturity: 'stable', since: '0.1.0' },

  // ── Marketing Operations ──
  { name: 'marketing_strategy', type_id: 'ent_271', maturity: 'stable', since: '0.1.0' },
  { name: 'marketing_channel', type_id: 'ent_272', maturity: 'stable', since: '0.1.0' },
  { name: 'marketing_campaign_plan', type_id: 'ent_273', maturity: 'stable', since: '0.1.0' },
  { name: 'email_sequence', type_id: 'ent_274', maturity: 'stable', since: '0.1.0' },
  { name: 'social_post', type_id: 'ent_275', maturity: 'stable', since: '0.1.0' },
  { name: 'seo_keyword', type_id: 'ent_276', maturity: 'stable', since: '0.1.0' },
  { name: 'ad_creative', type_id: 'ent_277', maturity: 'stable', since: '0.1.0' },
  { name: 'press_release', type_id: 'ent_278', maturity: 'stable', since: '0.1.0' },
  { name: 'event', type_id: 'ent_279', maturity: 'stable', since: '0.1.0' },
  { name: 'community_initiative', type_id: 'ent_280', maturity: 'stable', since: '0.1.0' },

  // ── Operations & Customer Success ──
  { name: 'support_ticket', type_id: 'ent_281', maturity: 'stable', since: '0.1.0' },
  { name: 'customer_feedback', type_id: 'ent_282', maturity: 'stable', since: '0.1.0' },
  { name: 'churn_reason', type_id: 'ent_283', maturity: 'stable', since: '0.1.0' },
  { name: 'onboarding_flow', type_id: 'ent_284', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'user_flow' },
  { name: 'customer_health_score', type_id: 'ent_285', maturity: 'stable', since: '0.1.0' },
  { name: 'playbook', type_id: 'ent_286', maturity: 'stable', since: '0.1.0' },
  { name: 'service_level_agreement', type_id: 'ent_287', maturity: 'stable', since: '0.1.0' },
  { name: 'sla', type_id: 'ent_336', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.2.0', replacement: 'service_level_agreement' },
  { name: 'customer_journey_stage', type_id: 'ent_288', maturity: 'stable', since: '0.1.0' },
  { name: 'touchpoint', type_id: 'ent_289', maturity: 'stable', since: '0.1.0' },
  { name: 'success_milestone', type_id: 'ent_290', maturity: 'stable', since: '0.1.0' },
  { name: 'service_blueprint', type_id: 'ent_291', maturity: 'stable', since: '0.1.0' },
  { name: 'nps_score', type_id: 'ent_292', maturity: 'deprecated', since: '0.1.0', deprecated_in: '0.1.0', replacement: 'nps_campaign' },

  // ── Localisation & i18n ──
  { name: 'locale', type_id: 'ent_293', maturity: 'stable', since: '0.1.0' },
  { name: 'translation_key', type_id: 'ent_294', maturity: 'stable', since: '0.1.0' },
  { name: 'translation_bundle', type_id: 'ent_295', maturity: 'stable', since: '0.1.0' },
  { name: 'locale_config', type_id: 'ent_296', maturity: 'stable', since: '0.1.0' },
  { name: 'cultural_adaptation', type_id: 'ent_297', maturity: 'stable', since: '0.1.0' },
  { name: 'regional_pricing', type_id: 'ent_298', maturity: 'stable', since: '0.1.0' },

  // ── Customer Education ──
  { name: 'education_program', type_id: 'ent_299', maturity: 'stable', since: '0.1.0' },
  { name: 'tutorial', type_id: 'ent_300', maturity: 'stable', since: '0.1.0' },
  { name: 'walkthrough', type_id: 'ent_301', maturity: 'stable', since: '0.1.0' },
  { name: 'webinar', type_id: 'ent_302', maturity: 'stable', since: '0.1.0' },
  { name: 'certification', type_id: 'ent_303', maturity: 'stable', since: '0.1.0' },
  { name: 'help_video', type_id: 'ent_304', maturity: 'stable', since: '0.1.0' },
  { name: 'learning_path', type_id: 'ent_305', maturity: 'stable', since: '0.1.0' },

  // ── Partners & Ecosystem ──
  { name: 'partner_program', type_id: 'ent_306', maturity: 'stable', since: '0.1.0' },
  { name: 'partner_tier', type_id: 'ent_307', maturity: 'stable', since: '0.1.0' },
  { name: 'api_ecosystem', type_id: 'ent_308', maturity: 'stable', since: '0.1.0' },
  { name: 'marketplace_listing', type_id: 'ent_309', maturity: 'stable', since: '0.1.0' },
  { name: 'developer_portal', type_id: 'ent_310', maturity: 'stable', since: '0.1.0' },
  { name: 'integration_partner', type_id: 'ent_311', maturity: 'stable', since: '0.1.0' },
  { name: 'partner_revenue_share', type_id: 'ent_312', maturity: 'stable', since: '0.1.0' },

  // ── Workspace ──
  { name: 'workspace', type_id: 'ent_328', maturity: 'proposed', since: '0.2.0' },
  { name: 'framework_exercise', type_id: 'ent_350', maturity: 'proposed', since: '0.8.4' },
] as const

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/** O(1) lookup: type name → metadata */
export const UPG_ENTITY_META_BY_NAME: ReadonlyMap<string, EntityTypeMeta> = new Map(
  UPG_ENTITY_META.map((m) => [m.name, m]),
)

/** O(1) lookup: type_id → metadata */
export const UPG_ENTITY_META_BY_ID: ReadonlyMap<string, EntityTypeMeta> = new Map(
  UPG_ENTITY_META.map((m) => [m.type_id, m]),
)

/** All active (non-deprecated, non-removed) type names */
export const UPG_ACTIVE_TYPES: readonly string[] = UPG_ENTITY_META
  .filter((m) => m.maturity === 'stable' || m.maturity === 'proposed')
  .map((m) => m.name)

/** All deprecated type names */
export const UPG_DEPRECATED_TYPES: readonly string[] = UPG_ENTITY_META
  .filter((m) => m.maturity === 'deprecated')
  .map((m) => m.name)

/**
 * Check if a type name is deprecated.
 *
 * @example
 * isDeprecatedType('pain_point')   // → true  (replaced by 'need')
 * isDeprecatedType('package')      // → true  (replaced by 'pricing_tier')
 * isDeprecatedType('persona')      // → false
 * isDeprecatedType('not_a_type')   // → false (unknown types are not "deprecated")
 */
export function isDeprecatedType(name: string): boolean {
  const meta = UPG_ENTITY_META_BY_NAME.get(name)
  return meta?.maturity === 'deprecated'
}

/**
 * Get the replacement type for a deprecated type.
 *
 * @example
 * getReplacementType('pain_point')   // → 'need'
 * getReplacementType('package')      // → 'pricing_tier'
 * getReplacementType('persona')      // → undefined   (still canonical)
 */
export function getReplacementType(name: string): string | undefined {
  const meta = UPG_ENTITY_META_BY_NAME.get(name)
  return meta?.replacement
}

/**
 * Resolve a type name to its type_id (stable across renames).
 *
 * @example
 * getTypeId('persona')     // → 'ent_016'
 * getTypeId('package')     // → 'ent_228'  (id survives the rename to 'pricing_tier')
 * getTypeId('not_a_type')  // → undefined
 */
export function getTypeId(name: string): string | undefined {
  return UPG_ENTITY_META_BY_NAME.get(name)?.type_id
}

/**
 * Resolve a type_id back to its current name.
 *
 * @example
 * getTypeName('ent_016')   // → 'persona'
 * getTypeName('ent_018')   // → 'pain_point' (deprecated; see `getReplacementType`)
 * getTypeName('ent_9999')  // → undefined
 */
export function getTypeName(typeId: string): string | undefined {
  return UPG_ENTITY_META_BY_ID.get(typeId)?.name
}
