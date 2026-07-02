/**
 * Property-modifier overlay — the curated source of the `derived | snapshot |
 * volatile` provenance annotations (property-fit audit, 2026-06-16).
 *
 * WHY THIS FILE EXISTS. A modifier is a CURATED audit outcome, not derivable
 * from a property's TypeScript type, and the domain property interfaces
 * (`src/properties/domains/*.ts`) carry no modifier information. Rather than
 * scatter 116 JSDoc tags across ~40 domain files, the audit's decisions live
 * here as one reviewable map. `scripts/generate-property-registry.ts` reads this
 * overlay and emits `modifier: '...'` onto the matching property in the
 * generated `property-schema.ts`, so a regeneration REPRODUCES every annotation
 * instead of silently dropping it (the pre-0.17.6 lossiness that kept
 * property-schema.ts hand-maintained). This closes the modifier-reproduction gap.
 *
 * SHAPE. entityType -> propertyName -> modifier. Top-level scalar properties
 * only — modifiers are a property-level provenance signal and are not applied to
 * nested object keys anywhere in the catalog. To (re)classify a property's
 * volatility, edit THIS map, then run the generator. The generator fails if a
 * key here names a property the generated schema does not have (drift guard), so
 * a rename/removal in the domain source can never leave a dangling annotation.
 *
 * The runtime/queryable surface over these annotations lives in
 * `property-modifiers.ts` (accessors, semantics, guardrail detectors); that
 * module reads the modifiers back off `UPG_PROPERTY_SCHEMA`, not from here.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

/** The three property-modifier values (kept literal so this file is pure generator input). */
export type PropertyModifierValue = 'derived' | 'snapshot' | 'volatile'

/**
 * Curated modifier annotations, keyed entityType -> propertyName -> modifier.
 * 116 annotations across 83 entity types (29 derived, 64 snapshot, 23 volatile).
 */
export const PROPERTY_MODIFIER_OVERLAY: Record<string, Record<string, PropertyModifierValue>> = {
  a11y_audit: { violations_count: 'derived', passes_count: 'derived', incomplete_count: 'derived' },
  a11y_issue: { css_selector: 'volatile', html_snippet: 'volatile' },
  account: { employee_count: 'snapshot' },
  acquisition_channel: { monthly_volume: 'snapshot' },
  affinity_cluster: { child_observation_count: 'derived' },
  agent_hook: { execution_count: 'snapshot' },
  agent_skill: { invocation_count: 'snapshot' },
  ai_dataset: { record_count: 'snapshot', storage_uri: 'volatile' },
  ai_experiment: { artifact_uri: 'volatile' },
  ai_guardrail: { trigger_count: 'snapshot' },
  ai_model: { model_id: 'volatile', latency_p50_ms: 'snapshot', latency_p99_ms: 'snapshot' },
  api_contract: { spec_url: 'volatile' },
  api_ecosystem: { developer_count: 'snapshot', app_count: 'derived' },
  beta_program: { participant_count: 'snapshot' },
  brand_asset: { url: 'volatile' },
  brand_logo: { asset_url: 'volatile' },
  build_artifact: { registry: 'volatile', build_url: 'volatile' },
  churn_reason: { frequency_count: 'snapshot' },
  ci_pipeline: { run_count: 'snapshot', success_rate: 'snapshot' },
  code_repository: { repo_url: 'volatile' },
  community_initiative: { member_count: 'snapshot', engagement_rate: 'snapshot' },
  competitive_battle_card: { win_rate: 'snapshot' },
  content_calendar: { frequency_count: 'snapshot' },
  content_strategy: { frequency_count: 'snapshot' },
  customer_journey_stage: { conversion_rate: 'snapshot' },
  dashboard: { url: 'volatile', element_count: 'derived', filter_count: 'derived' },
  data_model: { table_count: 'derived', column_count: 'derived', test_count: 'derived' },
  data_pipeline: { retry_count: 'snapshot' },
  database_schema: { table_count: 'derived' },
  department: { headcount: 'snapshot' },
  design_concept: { sketch_url: 'volatile' },
  developer_portal: { portal_url: 'volatile', doc_count: 'derived' },
  discount_strategy: { redemption_count: 'snapshot' },
  document: { word_count: 'snapshot' },
  email_sequence: { email_count: 'derived', open_rate: 'snapshot', click_rate: 'snapshot' },
  error_budget: { budget_remaining: 'snapshot', burn_rate: 'snapshot' },
  eval_benchmark: { test_case_count: 'derived' },
  event: { attendee_count: 'snapshot' },
  feature_area: { feature_count: 'derived' },
  feature_flag: { rollout_pct: 'snapshot' },
  feature_request: { vote_count: 'snapshot' },
  feedback_vote: { vote_count: 'snapshot' },
  fix: { files_changed: 'volatile' },
  funnel: { step_count: 'derived', overall_conversion_rate: 'snapshot' },
  funnel_step: { conversion_rate: 'snapshot', drop_off_rate: 'snapshot' },
  help_video: { url: 'volatile' },
  insight: { evidence_count: 'derived' },
  interview_guide: { question_count: 'derived' },
  key_activity: { frequency_count: 'snapshot' },
  key_result: { current_value: 'snapshot' },
  learning_path: { item_count: 'derived', completion_rate: 'snapshot' },
  library_dependency: { vulnerability_count: 'snapshot' },
  market_segment: { growth_rate: 'snapshot' },
  marketing_channel: { monthly_budget: 'snapshot' },
  metric: { current_value: 'snapshot' },
  nps_campaign: { response_count: 'snapshot', response_rate: 'snapshot', promoters_pct: 'snapshot', detractors_pct: 'snapshot' },
  observation: { source_url: 'volatile' },
  organization: { logo_url: 'volatile' },
  participant: { source_url: 'volatile' },
  paywall: { conversion_rate: 'snapshot' },
  penetration_test: { findings_count: 'derived', critical_count: 'derived' },
  pipeline_stage: { conversion_rate: 'snapshot' },
  product: { url: 'volatile', logo_url: 'volatile' },
  quote: { source_url: 'volatile' },
  research_study: { participant_count: 'snapshot' },
  revenue_stream: { arr_contribution_pct: 'snapshot' },
  security_audit: { findings_count: 'derived' },
  seo_keyword: { current_rank: 'snapshot' },
  service_level_indicator: { current_value: 'snapshot' },
  service_level_objective: { current_percentage: 'snapshot' },
  subscription: { monthly_recurring_revenue: 'snapshot' },
  survey_response: { response_count: 'snapshot', completion_rate: 'snapshot' },
  symptom: { frequency_count: 'snapshot' },
  test_suite: { test_count: 'derived', pass_rate: 'snapshot', failed_count: 'snapshot', skipped_count: 'snapshot', flaky_count: 'snapshot' },
  threat_model: { threat_count: 'derived' },
  trial_config: { conversion_rate: 'snapshot' },
  tutorial: { completion_rate: 'snapshot' },
  user_advisory_board: { member_count: 'snapshot' },
  walkthrough: { step_count: 'derived', completion_rate: 'snapshot' },
  wireframe: { linked_prototype_url: 'volatile' },
  workflow_run: { step_count: 'derived' },
  workflow_template: { step_count: 'derived', agent_count: 'derived' },
  workspace: { member_count: 'derived' },
}
