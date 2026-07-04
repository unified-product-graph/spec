/**
 * UPG Entity Type Catalog.
 * https://unifiedproductgraph.org/spec | MIT
 */

// ─── Unified entity type ──────────────────────────────────────────────────────

/**
 * The union of every active entity type, across the flat domain registry.
 * Count is computed at module init as `UPG_TYPES.length` (see `UPG_ENTITY_COUNT`);
 * no hard-coded total is kept here, so the comment can't drift from the catalog.
 *
 * @see registry/domains.ts for domain groupings
 * @see registry/entity-meta.ts for type IDs and maturity
 * @see grammar/hierarchy.ts for parent-child rules
 */
export type UPGEntityType =
  // Foundations (0.9.12; operating lifecycle 0.11.6)
  | 'specification' | 'primitive'
  | 'operating_lifecycle' | 'operating_stage'
  // Strategy
  | 'product' | 'outcome' | 'objective' | 'key_result' | 'metric'
  | 'metric_quality_assessment'
  | 'vision' | 'mission' | 'strategic_theme' | 'initiative' | 'capability'
  | 'value_stream' | 'strategic_pillar' | 'assumption' | 'decision'
  | 'constraint' | 'strategic_question'
  // Users & Needs
  | 'persona' | 'job' | 'need' | 'desired_outcome'
  | 'job_step' | 'switching_cost'
  // Discovery
  | 'opportunity' | 'solution' | 'feasibility_study' | 'design_sprint'
  // Validation: `hypothesis` canonical (re-promoted); `hypothesis_evidence`
  // deprecated at v0.4.0 (→ `evidence`), retained until v0.5.0.
  | 'hypothesis' | 'hypothesis_evidence'
  | 'experiment' | 'experiment_plan' | 'experiment_run'
  | 'learning' | 'test_plan' | 'evidence' | 'research_plan'
  // Market Intelligence
  | 'competitor' | 'competitor_feature' | 'competitor_signal' | 'market_trend' | 'market_segment' | 'competitive_analysis'
  // Classification: taxonomy axes and their values, hosted by competitive_analysis
  | 'classification_axis' | 'classification_value'
  // User Research
  | 'research_study' | 'insight' | 'participant' | 'observation'
  | 'quote' | 'affinity_cluster' | 'research_question' | 'interview_guide'
  | 'survey_response'
  // Experience Design
  | 'user_journey' | 'journey_step' | 'journey_phase' | 'journey_action' | 'design_question' | 'design_concept'
  | 'prototype' | 'wireframe' | 'user_flow' | 'screen' | 'screen_state'
  | 'annotation' | 'interaction_spec'
  // Design System
  | 'design_component' | 'design_token' | 'design_system' | 'design_pattern' | 'design_guideline'
  // Brand Identity
  | 'brand_identity' | 'brand_colour' | 'brand_typography' | 'brand_voice' | 'brand_logo' | 'brand_imagery'
  // Product Spec
  | 'feature_area' | 'feature' | 'epic' | 'user_story' | 'story_statement' | 'story_task' | 'acceptance_criterion' | 'release'
  | 'task' | 'bug' | 'roadmap' | 'roadmap_item' | 'theme' | 'roadmap_theme' | 'changelog'
  | 'planning_cycle'
  // Engineering
  | 'bounded_context' | 'service' | 'domain_event' | 'api_contract'
  | 'technical_debt_item' | 'feature_flag' | 'deployment' | 'aggregate' | 'domain_entity'
  | 'value_object' | 'command' | 'read_model' | 'api_endpoint' | 'database_schema'
  | 'queue_topic' | 'build_artifact' | 'code_repository' | 'library_dependency'
  | 'integration_pattern' | 'external_api' | 'data_flow'
  | 'investigation' | 'root_cause' | 'symptom' | 'fix'
  // Growth
  | 'funnel' | 'funnel_step' | 'acquisition_channel'
  | 'growth_campaign' | 'cohort' | 'behavioral_segment' | 'growth_loop' | 'variant'
  | 'attribution_model'
  // Business Model
  | 'business_model' | 'value_proposition' | 'revenue_stream' | 'pricing_tier'
  | 'cost_structure' | 'unit_economics' | 'partnership' | 'key_resource' | 'key_activity'
  | 'customer_relationship' | 'distribution_channel'
  // Go-To-Market
  | 'gtm_strategy' | 'ideal_customer_profile' | 'positioning' | 'messaging' | 'launch'
  | 'content_strategy' | 'sales_motion' | 'competitive_battle_card' | 'demand_gen_program'
  | 'territory' | 'objection' | 'rebuttal' | 'proof_point'
  // Team & Organisation
  | 'team' | 'role' | 'stakeholder' | 'person' | 'team_okr' | 'retrospective'
  | 'dependency' | 'department' | 'skill' | 'ceremony' | 'capacity_plan'
  // Data & Analytics
  | 'data_source' | 'event_schema' | 'dashboard'
  | 'data_model' | 'data_quality_rule' | 'data_product' | 'data_pipeline' | 'data_lineage'
  | 'glossary_term' | 'data_domain' | 'report'
  // Content & Knowledge
  | 'content_piece' | 'knowledge_base_article' | 'brand_asset'
  | 'prompt_template' | 'content_calendar' | 'content_theme' | 'documentation_template'
  | 'document'
  // Legal
  | 'legal_entity' | 'ip_asset' | 'contract' | 'contract_clause' | 'privacy_policy'
  // Compliance
  | 'compliance_requirement' | 'risk' | 'data_contract' | 'audit_log_policy'
  | 'compliance_framework' | 'security_audit'
  // DevOps
  | 'service_level_indicator' | 'service_level_objective' | 'error_budget' | 'incident' | 'postmortem' | 'runbook' | 'monitor'
  | 'alert_rule' | 'ci_pipeline' | 'release_strategy' | 'on_call_rotation'
  | 'infrastructure_component'
  // Security
  | 'threat_model' | 'threat' | 'vulnerability' | 'security_control' | 'security_policy'
  | 'penetration_test' | 'security_review' | 'data_classification'
  | 'access_policy'
  // Accessibility
  | 'a11y_standard' | 'a11y_guideline' | 'a11y_audit' | 'a11y_issue' | 'a11y_annotation'
  // Quality Assurance
  | 'test_suite' | 'test_case' | 'qa_session' | 'regression_test' | 'test_coverage_report'
  | 'test_environment' | 'test_result'
  // Customer Feedback
  | 'feedback_program' | 'feature_request' | 'feedback_vote' | 'nps_campaign'
  | 'user_advisory_board' | 'beta_program' | 'feedback_theme'
  // Pricing
  | 'pricing_strategy' | 'discount_strategy'
  | 'trial_config' | 'paywall'
  // AI & Machine Learning
  | 'ai_model' | 'prompt_version' | 'eval_benchmark' | 'eval_run' | 'ai_cost_tracker'
  | 'hallucination_report' | 'ai_guardrail' | 'model_comparison'
  | 'ai_experiment' | 'ai_dataset' | 'ai_trace'
  // Workflows & Agents
  | 'workflow_template' | 'workflow_run' | 'agent_definition' | 'agent_session'
  | 'review_gate' | 'approval_record' | 'agent_skill' | 'agent_hook' | 'workflow_artifact'
  | 'agent_task'
  // Portfolio & Organisation
  | 'organization' | 'portfolio' | 'product_area'
  // Workspace
  | 'workspace' | 'framework_exercise'
  // Sales
  | 'account' | 'contact' | 'lead' | 'deal' | 'pipeline_sales' | 'pipeline_stage'
  | 'quote_document' | 'subscription' | 'invoice' | 'forecast'
  // Program Management
  | 'program' | 'project' | 'milestone' | 'risk_register' | 'change_request'
  | 'deliverable' | 'resource_allocation' | 'status_report'
  // Marketing
  | 'marketing_strategy' | 'marketing_channel' | 'marketing_campaign_plan' | 'email_sequence'
  | 'social_post' | 'seo_keyword' | 'ad_creative' | 'press_release' | 'event'
  | 'community_initiative'
  // Customer Success
  | 'support_ticket' | 'customer_feedback' | 'churn_reason'
  | 'customer_health_score' | 'playbook' | 'service_level_agreement' | 'customer_journey_stage' | 'touchpoint'
  | 'success_milestone' | 'service_blueprint'
  // Localisation
  | 'locale' | 'translation_key' | 'translation_bundle' | 'locale_config'
  | 'cultural_adaptation' | 'regional_pricing'
  // Customer Education
  | 'education_program' | 'tutorial' | 'walkthrough' | 'webinar' | 'certification'
  | 'help_video' | 'learning_path'
  // Partners & Ecosystem
  | 'partner_program' | 'partner_tier' | 'api_ecosystem' | 'marketplace_listing'
  | 'developer_portal' | 'integration_partner' | 'partner_revenue_share'

// ─── Deprecated types (bridge closed) ───────────────────────────────────────
/**
 * No entity types are currently deprecated; this union is `never`. The
 * deprecated-name bridge, which previously widened this union to early
 * aliases (`jtbd`, `pain_point`, `kpi`, …), is closed, so runtime callers no
 * longer need an alias-aware type.
 *
 * Narrowed to `never` so any code that still references this union for
 * widening cascades a type error and gets cleaned up. Migration runtime
 * (`migrateNode`, `UPG_MIGRATIONS`, `getReplacementType`) keeps its own
 * internal list of historical names; it does NOT depend on this union.
 *
 * @see ../grammar/migrations.ts for runtime migration helpers
 * @see scripts/check-no-deprecated-symbols.ts for the string-literal guard
 */
export type DeprecatedUPGEntityType = never

/** All entity types. `DeprecatedUPGEntityType` is `never`, so this equals `UPGEntityType`. */
export type AnyUPGEntityType = UPGEntityType | DeprecatedUPGEntityType
