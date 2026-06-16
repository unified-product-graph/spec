/**
 * UPG Region catalog (topology only). The 10 canonical super-domain regions:
 * entities, edges, anchors, shape archetype, atomic-domain composition.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGRegion } from './types.js'

export const UPG_REGIONS: readonly UPGRegion[] = [
  {
    id: "strategy_outcomes",
    label: "Strategy & Outcomes",
    order: 1,
    shape: "cascade",
    mental_model: "Aspiration → direction → bet → measurable → proof.",
    operators: [
      "CEO",
      "PM",
      "leadership",
      "strategy team",
    ],
    composes_atomic_domains: [
      "strategy",
    ],
    entities: [
      {
        type: "product",
        role: "container",
      },
      {
        type: "vision",
        role: "root",
      },
      {
        type: "mission",
        role: "container",
      },
      {
        type: "strategic_pillar",
        role: "hub",
      },
      {
        type: "strategic_theme",
        role: "container",
      },
      {
        type: "initiative",
        role: "container",
      },
      {
        type: "capability",
        role: "leaf",
      },
      {
        type: "value_stream",
        role: "container",
      },
      {
        type: "objective",
        role: "anchor",
      },
      {
        type: "key_result",
        role: "hub",
      },
      {
        type: "metric",
        role: "leaf",
        notes: "also anchors Analytics; canonical home is Strategy",
      },
      {
        type: "metric_quality_assessment",
        role: "leaf",
      },
      {
        type: "decision",
        role: "hub",
        notes: "polymorphic across domains",
      },
      {
        type: "assumption",
        role: "leaf",
      },
      {
        type: "constraint",
        role: "leaf",
      },
      {
        type: "outcome",
        role: "hub",
      },
    ],
    anchor: {
      type: "objective",
      rationale: "The single entity where P5 language meets P3 measurement. The accountability question of strategy flows through it.",
      outbound_cross_edge_count: 0,
      inbound_cross_edge_count: 1,
    },
    intra_edges: [
      "vision_realised_through_mission",
      "vision_guides_objective",
      "mission_supported_by_strategic_pillar",
      "strategic_pillar_organises_strategic_theme",
      "strategic_pillar_enables_capability",
      "strategic_pillar_delivers_value_stream",
      "strategic_pillar_decided_via_decision",
      "strategic_theme_pursues_initiative",
      "initiative_assumes_assumption",
      "initiative_drives_outcome",
      "objective_achieved_through_key_result",
      "objective_measured_by_metric",
      "key_result_quantified_by_metric",
      "outcome_measured_by_metric",
      "metric_decomposes_into_metric",
      "metric_guards_metric",
      "metric_drives_metric",
    ],
    boundary_edges: [
      {
        direction: "export",
        edge_id: "outcome_reveals_opportunity",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "export",
        edge_id: "assumption_becomes_hypothesis",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "export",
        edge_id: "outcome_delivered_by_feature",
        crosses_into: "product_delivery",
      },
      {
        direction: "export",
        edge_id: "outcome_delivered_via_feature_area",
        crosses_into: "product_delivery",
      },
      {
        direction: "import",
        edge_id: "feature_drives_key_result",
        crosses_into: "product_delivery",
      },
      {
        direction: "sideways",
        edge_id: "insight_validates_strategic_pillar",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "sideways",
        edge_id: "document_describes_strategic_pillar",
        crosses_into: "experience_design_brand",
      },
    ],
  },
  {
    id: "users_needs",
    label: "Users & Needs",
    order: 2,
    shape: "convergent",
    mental_model: "Who → what they want to do → what is in their way → what they would accept as done.",
    operators: [
      "researcher",
      "PM",
      "designer",
      "marketer",
    ],
    composes_atomic_domains: [
      "user",
    ],
    entities: [
      {
        type: "persona",
        role: "anchor",
      },
      {
        type: "job",
        role: "hub",
      },
      {
        type: "need",
        role: "hub",
      },
      {
        type: "desired_outcome",
        role: "leaf",
      },
      {
        type: "switching_cost",
        role: "leaf",
      },
      {
        type: "job_step",
        role: "leaf",
      },
      {
        type: "participant",
        role: "leaf",
        notes: "research-resolved persona; canonical home is Discovery/Research/Validation",
      },
    ],
    anchor: {
      type: "persona",
      rationale: "Persona carries 25 inbound cross-edge types from 13 atomic domains, making it the graph's gravitational centre. Solve persona's P1 SoT and all P1 members inherit.",
      outbound_cross_edge_count: 1,
      inbound_cross_edge_count: 25,
    },
    intra_edges: [
      "persona_pursues_job",
      "persona_experiences_need",
      "persona_aspires_to_desired_outcome",
      "persona_incurs_switching_cost",
      "persona_delegates_to_persona",
      "job_surfaces_need",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "competitor_competes_for_persona",
        crosses_into: "market_competitive",
      },
      {
        direction: "import",
        edge_id: "market_segment_includes_persona",
        crosses_into: "market_competitive",
      },
      {
        direction: "import",
        edge_id: "insight_characterises_persona",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "import",
        edge_id: "observation_characterises_persona",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "import",
        edge_id: "user_journey_maps_persona",
        crosses_into: "experience_design_brand",
      },
      {
        direction: "import",
        edge_id: "user_flow_targets_persona",
        crosses_into: "experience_design_brand",
      },
      {
        direction: "import",
        edge_id: "cohort_represents_persona",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "import",
        edge_id: "funnel_maps_persona",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "import",
        edge_id: "acquisition_channel_reaches_persona",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "import",
        edge_id: "value_proposition_targets_persona",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "import",
        edge_id: "ideal_customer_profile_maps_to_persona",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "import",
        edge_id: "positioning_resonates_with_persona",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "import",
        edge_id: "messaging_targets_persona",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "import",
        edge_id: "content_theme_targets_persona",
        crosses_into: "experience_design_brand",
      },
      {
        direction: "import",
        edge_id: "metric_segmented_by_persona",
        crosses_into: "analytics_data",
      },
      {
        direction: "import",
        edge_id: "user_advisory_board_includes_persona",
        crosses_into: "operations_quality",
      },
      {
        direction: "import",
        edge_id: "stakeholder_maps_to_persona",
        crosses_into: "operations_quality",
      },
      {
        direction: "import",
        edge_id: "cultural_adaptation_targets_persona",
        crosses_into: "operations_quality",
      },
      {
        direction: "import",
        edge_id: "education_program_targets_persona",
        crosses_into: "operations_quality",
      },
      {
        direction: "import",
        edge_id: "document_describes_persona",
        crosses_into: "experience_design_brand",
      },
      {
        direction: "export",
        edge_id: "persona_experiences_user_journey",
        crosses_into: "experience_design_brand",
      },
      {
        direction: "sideways",
        edge_id: "product_shares_persona_with_product",
        crosses_into: "users_needs",
      },
    ],
  },
  {
    id: "discovery_research_validation",
    label: "Discovery, Research & Validation",
    order: 3,
    shape: "directed-cyclic",
    mental_model: "Question → hypothesis → test → evidence → decision → loop back.",
    operators: [
      "PM",
      "researcher",
      "designer-in-exploration",
    ],
    composes_atomic_domains: [
      "discovery",
      "validation",
      "user_research",
    ],
    entities: [
      {
        type: "opportunity",
        role: "anchor",
      },
      {
        type: "solution",
        role: "container",
      },
      {
        type: "feasibility_study",
        role: "leaf",
      },
      {
        type: "design_sprint",
        role: "leaf",
      },
      {
        type: "hypothesis",
        role: "hub",
      },
      {
        type: "experiment",
        role: "hub",
      },
      {
        type: "experiment_plan",
        role: "container",
      },
      {
        type: "experiment_run",
        role: "container",
        notes: "self-nesting",
      },
      {
        type: "learning",
        role: "leaf",
      },
      {
        type: "evidence",
        role: "leaf",
      },
      {
        type: "research_plan",
        role: "leaf",
      },
      {
        type: "research_study",
        role: "container",
      },
      {
        type: "participant",
        role: "leaf",
      },
      {
        type: "observation",
        role: "leaf",
      },
      {
        type: "quote",
        role: "leaf",
      },
      {
        type: "insight",
        role: "hub",
        notes: "self-nesting refines_into",
      },
      {
        type: "affinity_cluster",
        role: "container",
      },
      {
        type: "survey_response",
        role: "leaf",
      },
      {
        type: "interview_guide",
        role: "leaf",
      },
      {
        type: "research_question",
        role: "leaf",
      },
    ],
    anchor: {
      type: "opportunity",
      rationale: "Sits on the import border (receives from Strategy/Users/Market/Feedback) and anchors the internal chain (drives solution → hypothesis → experiment).",
      outbound_cross_edge_count: 4,
      inbound_cross_edge_count: 6,
    },
    intra_edges: [
      "opportunity_drives_solution",
      "opportunity_explores_via_design_concept",
      "opportunity_assessed_by_feasibility_study",
      "opportunity_investigated_via_design_sprint",
      "opportunity_addresses_need",
      "opportunity_pursues_outcome",
      "opportunity_contextualises_job",
      "insight_informs_opportunity",
      "insight_surfaces_opportunity",
      "insight_validates_persona",
      "insight_refines_into_insight",
      "learning_validates_opportunity",
      "evidence_supports_opportunity",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "outcome_reveals_opportunity",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "import",
        edge_id: "market_trend_creates_opportunity",
        crosses_into: "market_competitive",
      },
      {
        direction: "import",
        edge_id: "feature_request_creates_opportunity",
        crosses_into: "product_delivery",
      },
      {
        direction: "import",
        edge_id: "assumption_becomes_hypothesis",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "export",
        edge_id: "opportunity_improves_user_journey",
        crosses_into: "experience_design_brand",
      },
      {
        direction: "export",
        edge_id: "insight_informs_opportunity",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "sideways",
        edge_id: "insight_characterises_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "sideways",
        edge_id: "observation_characterises_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "sideways",
        edge_id: "insight_validates_value_proposition",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "sideways",
        edge_id: "feature_tests_hypothesis",
        crosses_into: "product_delivery",
      },
      {
        direction: "sideways",
        edge_id: "competitor_feature_inspires_solution",
        crosses_into: "market_competitive",
      },
    ],
  },
  {
    id: "market_competitive",
    label: "Market & Competitive",
    order: 4,
    shape: "tributary",
    mental_model: "Landscape → rivals → moves → response.",
    operators: [
      "product marketer",
      "strategy",
      "researcher",
    ],
    composes_atomic_domains: [
      "market_intelligence",
    ],
    entities: [
      {
        type: "competitor",
        role: "anchor",
        notes: "dual P9 container",
      },
      {
        type: "competitor_feature",
        role: "leaf",
      },
      {
        type: "competitor_signal",
        role: "leaf",
        notes: "a dated competitor move (feature launch, pricing change, ...) emitted by a competitor",
      },
      {
        type: "market_trend",
        role: "leaf",
      },
      {
        type: "market_segment",
        role: "container",
      },
      {
        type: "competitive_analysis",
        role: "container",
      },
      {
        type: "classification_axis",
        role: "container",
        notes: "taxonomy dimension of a 2-axis matrix",
      },
      {
        type: "classification_value",
        role: "leaf",
        notes: "one position on an axis; competitors classify against values",
      },
    ],
    anchor: {
      type: "competitor",
      rationale: "The spec's clearest dual-pattern entity: identity in \"rivals\" view, container in \"their catalog\" view. Stress-tests UCS pattern assignment.",
      outbound_cross_edge_count: 1,
      inbound_cross_edge_count: 4,
    },
    intra_edges: [
      "competitor_offers_competitor_feature",
      "competitor_emits_competitor_signal",
      "competitive_analysis_analyses_competitor",
      "competitive_analysis_dimensioned_by_classification_axis",
      "classification_axis_includes_classification_value",
      "competitor_classified_as_classification_value",
    ],
    boundary_edges: [
      {
        direction: "export",
        edge_id: "competitor_feature_inspires_solution",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "export",
        edge_id: "competitor_feature_inspires_feature",
        crosses_into: "product_delivery",
      },
      {
        direction: "export",
        edge_id: "market_trend_creates_opportunity",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "export",
        edge_id: "competitor_competes_for_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "export",
        edge_id: "market_segment_includes_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "sideways",
        edge_id: "positioning_references_competitor",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "sideways",
        edge_id: "positioning_differentiates_from_competitor",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "sideways",
        edge_id: "business_model_targets_market_segment",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "sideways",
        edge_id: "product_shares_competitor_with_product",
        crosses_into: "market_competitive",
      },
      {
        direction: "import",
        edge_id: "document_describes_competitor",
        crosses_into: "experience_design_brand",
      },
    ],
  },
  {
    id: "experience_design_brand",
    label: "Experience, Design & Brand",
    order: 5,
    shape: "multi-hierarchy",
    mental_model: "Journey (over time) + design system (in pieces) + brand (as a whole) + content (what it says).",
    operators: [
      "designer",
      "UX researcher",
      "brand strategist",
      "content strategist",
    ],
    composes_atomic_domains: [
      "ux_design",
      "design_system",
      "brand",
      "content",
    ],
    entities: [
      {
        type: "user_journey",
        role: "anchor",
      },
      {
        type: "journey_phase",
        role: "container",
      },
      {
        type: "journey_step",
        role: "container",
      },
      {
        type: "journey_action",
        role: "leaf",
      },
      {
        type: "user_flow",
        role: "container",
      },
      {
        type: "screen",
        role: "leaf",
      },
      {
        type: "screen_state",
        role: "leaf",
      },
      {
        type: "wireframe",
        role: "leaf",
      },
      {
        type: "prototype",
        role: "leaf",
      },
      {
        type: "annotation",
        role: "leaf",
      },
      {
        type: "design_concept",
        role: "leaf",
      },
      {
        type: "design_question",
        role: "hub",
      },
      {
        type: "design_system",
        role: "root",
      },
      {
        type: "design_component",
        role: "hub",
        notes: "self-nesting atom→organism",
      },
      {
        type: "design_token",
        role: "leaf",
      },
      {
        type: "design_pattern",
        role: "leaf",
      },
      {
        type: "design_guideline",
        role: "leaf",
      },
      {
        type: "interaction_spec",
        role: "leaf",
      },
      {
        type: "brand_identity",
        role: "root",
      },
      {
        type: "brand_colour",
        role: "leaf",
      },
      {
        type: "brand_typography",
        role: "leaf",
      },
      {
        type: "brand_imagery",
        role: "leaf",
      },
      {
        type: "brand_voice",
        role: "leaf",
      },
      {
        type: "brand_logo",
        role: "leaf",
      },
      {
        type: "brand_asset",
        role: "leaf",
      },
      {
        type: "content_piece",
        role: "leaf",
      },
      {
        type: "knowledge_base_article",
        role: "leaf",
      },
      {
        type: "content_calendar",
        role: "container",
      },
      {
        type: "documentation_template",
        role: "leaf",
      },
      {
        type: "document",
        role: "leaf",
      },
      {
        type: "content_theme",
        role: "hub",
      },
    ],
    anchor: {
      type: "user_journey",
      rationale: "The one entity where time is the primary layout dimension. Stress-tests P9 with ordered, left-to-right sequenced children.",
      outbound_cross_edge_count: 3,
      inbound_cross_edge_count: 2,
    },
    intra_edges: [
      "user_journey_contains_journey_step",
      "design_system_contains_design_component",
      "brand_identity_coloured_with_brand_colour",
      "design_component_composes_design_component",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "need_reframed_as_design_question",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "opportunity_explores_via_design_concept",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "import",
        edge_id: "user_journey_maps_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "user_flow_targets_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "export",
        edge_id: "service_implements_design_component",
        crosses_into: "engineering_platform",
      },
      {
        direction: "export",
        edge_id: "wireframe_specifies_feature",
        crosses_into: "product_delivery",
      },
      {
        direction: "sideways",
        edge_id: "content_theme_targets_persona",
        crosses_into: "users_needs",
      },
    ],
  },
  {
    id: "product_delivery",
    label: "Product & Delivery",
    order: 6,
    shape: "work-breakdown",
    mental_model: "Area → feature → epic → story → task, governed by release / roadmap / theme.",
    operators: [
      "PM",
      "engineering manager",
      "release manager",
      "delivery lead",
    ],
    composes_atomic_domains: [
      "product_spec",
      "program_mgmt",
      "feedback",
    ],
    entities: [
      {
        type: "feature",
        role: "anchor",
      },
      {
        type: "feature_area",
        role: "container",
        notes: "self-nesting",
      },
      {
        type: "epic",
        role: "container",
      },
      {
        type: "user_story",
        role: "container",
        notes: "dual P5",
      },
      {
        type: "acceptance_criterion",
        role: "leaf",
      },
      {
        type: "task",
        role: "leaf",
      },
      {
        type: "bug",
        role: "leaf",
      },
      {
        type: "release",
        role: "container",
      },
      {
        type: "roadmap",
        role: "container",
      },
      {
        type: "roadmap_item",
        role: "leaf",
      },
      {
        type: "roadmap_theme",
        role: "container",
        notes: "semantic spanner, not containment",
      },
      {
        type: "changelog",
        role: "leaf",
      },
      {
        type: "feedback_program",
        role: "container",
      },
      {
        type: "feature_request",
        role: "leaf",
      },
      {
        type: "feedback_vote",
        role: "leaf",
      },
      {
        type: "nps_campaign",
        role: "leaf",
      },
      {
        type: "user_advisory_board",
        role: "container",
      },
      {
        type: "beta_program",
        role: "leaf",
      },
      {
        type: "feedback_theme",
        role: "leaf",
      },
      {
        type: "program",
        role: "container",
      },
      {
        type: "project",
        role: "container",
      },
      {
        type: "milestone",
        role: "leaf",
      },
      {
        type: "risk_register",
        role: "container",
      },
      {
        type: "change_request",
        role: "leaf",
      },
      {
        type: "deliverable",
        role: "leaf",
      },
      {
        type: "resource_allocation",
        role: "leaf",
      },
      {
        type: "status_report",
        role: "leaf",
      },
    ],
    anchor: {
      type: "feature",
      rationale: "The accountability entity, the narrowest scope answering \"what did we commit to?\". Every other P4 in the domain is feature-adjacent.",
      outbound_cross_edge_count: 4,
      inbound_cross_edge_count: 4,
    },
    intra_edges: [
      "feature_area_contains_feature",
      "feature_area_contains_feature_area",
      "feature_decomposed_into_epic",
      "feature_affected_by_bug",
      "epic_specified_by_user_story",
      "user_story_verified_by_acceptance_criterion",
      "task_implements_user_story",
      "roadmap_contains_roadmap_item",
      "roadmap_categorised_by_roadmap_theme",
      "roadmap_schedules_release",
      "release_documented_in_changelog",
      "roadmap_theme_spans_feature_area",
      "milestone_gates_release",
      "roadmap_item_references_feature",
      "feature_request_voted_on_by_feedback_vote",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "outcome_delivered_by_feature",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "import",
        edge_id: "outcome_delivered_via_feature_area",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "import",
        edge_id: "competitor_feature_inspires_feature",
        crosses_into: "market_competitive",
      },
      {
        direction: "import",
        edge_id: "bounded_context_contains_feature_area",
        crosses_into: "engineering_platform",
      },
      {
        direction: "export",
        edge_id: "feature_drives_key_result",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "export",
        edge_id: "feature_addresses_job",
        crosses_into: "users_needs",
      },
      {
        direction: "export",
        edge_id: "feature_tests_hypothesis",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "export",
        edge_id: "feature_request_creates_opportunity",
        crosses_into: "discovery_research_validation",
      },
      {
        direction: "import",
        edge_id: "wireframe_specifies_feature",
        crosses_into: "experience_design_brand",
      },
      {
        direction: "sideways",
        edge_id: "service_powers_feature",
        crosses_into: "engineering_platform",
      },
      {
        direction: "sideways",
        edge_id: "service_powers_feature_area",
        crosses_into: "engineering_platform",
      },
      {
        direction: "sideways",
        edge_id: "bug_affects_service",
        crosses_into: "engineering_platform",
      },
      {
        direction: "sideways",
        edge_id: "test_case_validates_acceptance_criterion",
        crosses_into: "operations_quality",
      },
    ],
  },
  {
    id: "engineering_platform",
    label: "Engineering & Platform",
    order: 7,
    shape: "dag",
    mental_model: "Bounded context → service → endpoint/schema/queue → deployment, governed by dependencies and contracts.",
    operators: [
      "engineer",
      "architect",
      "platform team",
      "ML engineer",
    ],
    composes_atomic_domains: [
      "engineering",
      "ai",
      "automation",
    ],
    entities: [
      {
        type: "bounded_context",
        role: "root",
      },
      {
        type: "service",
        role: "anchor",
      },
      {
        type: "api_endpoint",
        role: "leaf",
      },
      {
        type: "api_contract",
        role: "leaf",
      },
      {
        type: "database_schema",
        role: "leaf",
      },
      {
        type: "aggregate",
        role: "container",
      },
      {
        type: "domain_entity",
        role: "leaf",
      },
      {
        type: "value_object",
        role: "leaf",
      },
      {
        type: "command",
        role: "leaf",
      },
      {
        type: "read_model",
        role: "leaf",
      },
      {
        type: "domain_event",
        role: "leaf",
      },
      {
        type: "code_repository",
        role: "container",
        notes: "external-source",
      },
      {
        type: "integration_pattern",
        role: "leaf",
      },
      {
        type: "external_api",
        role: "leaf",
      },
      {
        type: "data_flow",
        role: "leaf",
      },
      {
        type: "queue_topic",
        role: "leaf",
      },
      {
        type: "library_dependency",
        role: "leaf",
      },
      {
        type: "build_artifact",
        role: "leaf",
      },
      {
        type: "deployment",
        role: "leaf",
      },
      {
        type: "feature_flag",
        role: "leaf",
      },
      {
        type: "technical_debt_item",
        role: "leaf",
      },
      {
        type: "investigation",
        role: "container",
      },
      {
        type: "root_cause",
        role: "container",
      },
      {
        type: "symptom",
        role: "leaf",
      },
      {
        type: "fix",
        role: "leaf",
      },
      {
        type: "ai_model",
        role: "container",
      },
      {
        type: "prompt_template",
        role: "container",
      },
      {
        type: "prompt_version",
        role: "leaf",
      },
      {
        type: "eval_benchmark",
        role: "container",
      },
      {
        type: "eval_run",
        role: "leaf",
      },
      {
        type: "ai_cost_tracker",
        role: "leaf",
      },
      {
        type: "hallucination_report",
        role: "leaf",
      },
      {
        type: "ai_guardrail",
        role: "leaf",
      },
      {
        type: "model_comparison",
        role: "leaf",
      },
      {
        type: "ai_experiment",
        role: "leaf",
      },
      {
        type: "ai_dataset",
        role: "leaf",
      },
      {
        type: "ai_trace",
        role: "container",
        notes: "self-nesting inference chain",
      },
      {
        type: "workflow_template",
        role: "container",
      },
      {
        type: "workflow_run",
        role: "container",
      },
      {
        type: "workflow_artifact",
        role: "leaf",
      },
      {
        type: "agent_definition",
        role: "container",
      },
      {
        type: "agent_session",
        role: "leaf",
      },
      {
        type: "agent_skill",
        role: "leaf",
      },
      {
        type: "agent_hook",
        role: "leaf",
      },
      {
        type: "agent_task",
        role: "leaf",
      },
      {
        type: "review_gate",
        role: "container",
      },
      {
        type: "approval_record",
        role: "leaf",
      },
    ],
    anchor: {
      type: "service",
      rationale: "Has 9 hierarchy children, more than any other entity in v0.2. Stress-tests P9 rendering with rich child catalogs.",
      outbound_cross_edge_count: 4,
      inbound_cross_edge_count: 4,
    },
    intra_edges: [
      "service_exposes_api_contract",
      "service_serves_api_endpoint",
      "service_persisted_in_database_schema",
      "service_publishes_to_queue_topic",
      "service_deployed_as_deployment",
      "service_produces_build_artifact",
      "service_depends_on_library_dependency",
      "service_carries_technical_debt_item",
      "service_toggles_feature_flag",
      "service_affected_by_root_cause",
      "service_investigated_via_investigation",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "bounded_context_contains_feature_area",
        crosses_into: "product_delivery",
      },
      {
        direction: "import",
        edge_id: "service_powers_feature",
        crosses_into: "product_delivery",
      },
      {
        direction: "import",
        edge_id: "service_powers_feature_area",
        crosses_into: "product_delivery",
      },
      {
        direction: "import",
        edge_id: "bug_affects_service",
        crosses_into: "product_delivery",
      },
      {
        direction: "import",
        edge_id: "incident_caused_by_root_cause",
        crosses_into: "operations_quality",
      },
      {
        direction: "import",
        edge_id: "service_level_agreement_governs_service",
        crosses_into: "operations_quality",
      },
      {
        direction: "export",
        edge_id: "service_implements_design_component",
        crosses_into: "experience_design_brand",
      },
    ],
  },
  {
    id: "business_gtm_growth",
    label: "Business, GTM & Growth",
    order: 8,
    shape: "multi-hub",
    mental_model: "Value prop → positioning → messaging → funnel → revenue, all anchored on persona.",
    operators: [
      "founder",
      "product marketer",
      "growth PM",
      "sales",
      "pricing strategist",
    ],
    composes_atomic_domains: [
      "business_model",
      "go_to_market",
      "growth",
      "sales",
      "pricing",
      "marketing",
      "ecosystem",
    ],
    entities: [
      {
        type: "business_model",
        role: "root",
      },
      {
        type: "value_proposition",
        role: "anchor",
      },
      {
        type: "revenue_stream",
        role: "container",
      },
      {
        type: "cost_structure",
        role: "leaf",
      },
      {
        type: "unit_economics",
        role: "leaf",
      },
      {
        type: "partnership",
        role: "leaf",
      },
      {
        type: "key_resource",
        role: "leaf",
      },
      {
        type: "key_activity",
        role: "leaf",
      },
      {
        type: "customer_relationship",
        role: "leaf",
      },
      {
        type: "distribution_channel",
        role: "leaf",
      },
      {
        type: "pricing_strategy",
        role: "root",
      },
      {
        type: "pricing_tier",
        role: "leaf",
      },
      {
        type: "discount_strategy",
        role: "leaf",
      },
      {
        type: "trial_config",
        role: "leaf",
      },
      {
        type: "paywall",
        role: "leaf",
      },
      {
        type: "gtm_strategy",
        role: "root",
      },
      {
        type: "ideal_customer_profile",
        role: "hub",
      },
      {
        type: "positioning",
        role: "hub",
      },
      {
        type: "messaging",
        role: "leaf",
      },
      {
        type: "content_strategy",
        role: "container",
      },
      {
        type: "sales_motion",
        role: "leaf",
      },
      {
        type: "demand_gen_program",
        role: "leaf",
      },
      {
        type: "territory",
        role: "leaf",
      },
      {
        type: "objection",
        role: "leaf",
      },
      {
        type: "rebuttal",
        role: "container",
      },
      {
        type: "proof_point",
        role: "leaf",
      },
      {
        type: "launch",
        role: "leaf",
      },
      {
        type: "competitive_battle_card",
        role: "leaf",
      },
      {
        type: "funnel",
        role: "root",
      },
      {
        type: "funnel_step",
        role: "leaf",
      },
      {
        type: "acquisition_channel",
        role: "hub",
      },
      {
        type: "cohort",
        role: "leaf",
      },
      {
        type: "behavioral_segment",
        role: "container",
      },
      {
        type: "growth_loop",
        role: "leaf",
      },
      {
        type: "growth_campaign",
        role: "container",
      },
      {
        type: "attribution_model",
        role: "leaf",
      },
      {
        type: "variant",
        role: "leaf",
      },
      {
        type: "account",
        role: "container",
      },
      {
        type: "contact",
        role: "leaf",
      },
      {
        type: "lead",
        role: "leaf",
      },
      {
        type: "deal",
        role: "container",
      },
      {
        type: "pipeline_sales",
        role: "container",
      },
      {
        type: "pipeline_stage",
        role: "leaf",
      },
      {
        type: "quote_document",
        role: "leaf",
      },
      {
        type: "subscription",
        role: "container",
      },
      {
        type: "invoice",
        role: "leaf",
      },
      {
        type: "forecast",
        role: "leaf",
      },
      {
        type: "marketing_strategy",
        role: "container",
      },
      {
        type: "marketing_channel",
        role: "container",
      },
      {
        type: "marketing_campaign_plan",
        role: "container",
      },
      {
        type: "email_sequence",
        role: "leaf",
      },
      {
        type: "social_post",
        role: "leaf",
      },
      {
        type: "seo_keyword",
        role: "leaf",
      },
      {
        type: "ad_creative",
        role: "leaf",
      },
      {
        type: "press_release",
        role: "leaf",
      },
      {
        type: "event",
        role: "leaf",
      },
      {
        type: "community_initiative",
        role: "leaf",
      },
      {
        type: "partner_program",
        role: "container",
      },
      {
        type: "partner_tier",
        role: "leaf",
      },
      {
        type: "api_ecosystem",
        role: "container",
      },
      {
        type: "marketplace_listing",
        role: "leaf",
      },
      {
        type: "developer_portal",
        role: "leaf",
      },
      {
        type: "integration_partner",
        role: "leaf",
      },
      {
        type: "partner_revenue_share",
        role: "leaf",
      },
    ],
    anchor: {
      type: "value_proposition",
      rationale: "Touches all three sub-domains and crosses into Users, Strategy, and Discovery. Designing it forces resolution of structured slots + scored objections + proof points.",
      outbound_cross_edge_count: 5,
      inbound_cross_edge_count: 3,
    },
    intra_edges: [
      "business_model_delivers_value_proposition",
      "business_model_earns_via_revenue_stream",
      "business_model_costs_via_cost_structure",
      "business_model_measured_by_unit_economics",
      "business_model_distributes_via_distribution_channel",
      "business_model_maintains_customer_relationship",
      "business_model_requires_key_resource",
      "business_model_performs_key_activity",
      "business_model_partnered_via_partnership",
      "value_proposition_challenged_by_objection",
      "value_proposition_evidenced_by_proof_point",
      "gtm_strategy_targets_ideal_customer_profile",
      "gtm_strategy_positions_via_positioning",
      "gtm_strategy_launches_via_launch",
      "gtm_strategy_arms_with_competitive_battle_card",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "value_proposition_targets_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "value_proposition_addresses_job",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "value_proposition_solves_need",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "messaging_targets_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "positioning_resonates_with_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "ideal_customer_profile_maps_to_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "cohort_represents_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "import",
        edge_id: "business_model_targets_market_segment",
        crosses_into: "market_competitive",
      },
      {
        direction: "export",
        edge_id: "value_proposition_delivers_outcome",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "export",
        edge_id: "revenue_stream_drives_metric",
        crosses_into: "analytics_data",
      },
      {
        direction: "sideways",
        edge_id: "positioning_references_competitor",
        crosses_into: "market_competitive",
      },
      {
        direction: "sideways",
        edge_id: "insight_validates_value_proposition",
        crosses_into: "discovery_research_validation",
      },
    ],
  },
  {
    id: "analytics_data",
    label: "Analytics & Data",
    order: 9,
    shape: "polymorphic-target",
    mental_model: "Event → data source → metric → dashboard.",
    operators: [
      "data scientist",
      "analyst",
      "PM",
      "founder",
    ],
    composes_atomic_domains: [
      "data_analytics",
    ],
    entities: [
      {
        type: "metric",
        role: "anchor",
        notes: "canonical home is Strategy; anchors Analytics as the measurement plane",
      },
      {
        type: "data_source",
        role: "container",
      },
      {
        type: "event_schema",
        role: "leaf",
      },
      {
        type: "dashboard",
        role: "container",
      },
      {
        type: "data_model",
        role: "leaf",
      },
      {
        type: "data_domain",
        role: "container",
      },
      {
        type: "data_product",
        role: "leaf",
      },
      {
        type: "data_pipeline",
        role: "leaf",
      },
      {
        type: "data_lineage",
        role: "leaf",
      },
      {
        type: "glossary_term",
        role: "leaf",
      },
      {
        type: "report",
        role: "leaf",
      },
      {
        type: "data_quality_rule",
        role: "leaf",
      },
    ],
    anchor: {
      type: "metric",
      rationale: "The graph's most cross-referenced leaf-type. Inbound from 10+ entity types across 5+ super-domains. Designing its card designs the atomic unit of truth.",
      outbound_cross_edge_count: 2,
      inbound_cross_edge_count: 10,
    },
    intra_edges: [
      "metric_decomposes_into_metric",
      "metric_drives_metric",
      "metric_guards_metric",
      "metric_validated_by_data_quality_rule",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "outcome_measured_by_metric",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "import",
        edge_id: "objective_measured_by_metric",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "import",
        edge_id: "key_result_quantified_by_metric",
        crosses_into: "strategy_outcomes",
      },
      {
        direction: "import",
        edge_id: "revenue_stream_measured_by_metric_cross_domain",
        crosses_into: "business_gtm_growth",
      },
      {
        direction: "import",
        edge_id: "service_level_objective_tracks_metric",
        crosses_into: "operations_quality",
      },
      {
        direction: "import",
        edge_id: "service_level_agreement_measures_metric",
        crosses_into: "operations_quality",
      },
      {
        direction: "sideways",
        edge_id: "metric_segmented_by_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "export",
        edge_id: "product_shares_metric_with_product",
        crosses_into: "analytics_data",
      },
    ],
  },
  {
    id: "operations_quality",
    label: "Operations & Quality",
    order: 10,
    shape: "event-driven",
    mental_model: "Policy → commitment → signal → event → response → learning.",
    operators: [
      "SRE",
      "security team",
      "QA",
      "compliance officer",
      "customer success",
      "legal",
    ],
    composes_atomic_domains: [
      "devops",
      "security",
      "testing",
      "compliance",
      "legal",
      "accessibility",
      "customer_success",
      "localisation",
      "education",
      "team_org",
    ],
    entities: [
      {
        type: "incident",
        role: "anchor",
      },
      {
        type: "postmortem",
        role: "leaf",
      },
      {
        type: "runbook",
        role: "leaf",
      },
      {
        type: "monitor",
        role: "leaf",
      },
      {
        type: "service_level_objective",
        role: "hub",
      },
      {
        type: "service_level_indicator",
        role: "leaf",
      },
      {
        type: "error_budget",
        role: "leaf",
      },
      {
        type: "service_level_agreement",
        role: "leaf",
      },
      {
        type: "deployment",
        role: "leaf",
        notes: "canonical home is Engineering; release event surfaced to Ops",
      },
      {
        type: "alert_rule",
        role: "leaf",
      },
      {
        type: "ci_pipeline",
        role: "container",
      },
      {
        type: "release_strategy",
        role: "leaf",
      },
      {
        type: "on_call_rotation",
        role: "leaf",
      },
      {
        type: "infrastructure_component",
        role: "container",
      },
      {
        type: "test_plan",
        role: "container",
      },
      {
        type: "test_suite",
        role: "container",
      },
      {
        type: "qa_session",
        role: "container",
      },
      {
        type: "test_case",
        role: "leaf",
      },
      {
        type: "test_result",
        role: "leaf",
      },
      {
        type: "regression_test",
        role: "leaf",
      },
      {
        type: "test_coverage_report",
        role: "leaf",
      },
      {
        type: "test_environment",
        role: "leaf",
      },
      {
        type: "threat_model",
        role: "root",
      },
      {
        type: "threat",
        role: "leaf",
      },
      {
        type: "security_control",
        role: "leaf",
      },
      {
        type: "security_policy",
        role: "leaf",
      },
      {
        type: "vulnerability",
        role: "leaf",
      },
      {
        type: "penetration_test",
        role: "leaf",
      },
      {
        type: "security_review",
        role: "container",
      },
      {
        type: "data_classification",
        role: "leaf",
      },
      {
        type: "access_policy",
        role: "leaf",
      },
      {
        type: "a11y_standard",
        role: "leaf",
      },
      {
        type: "a11y_guideline",
        role: "leaf",
      },
      {
        type: "a11y_audit",
        role: "leaf",
      },
      {
        type: "a11y_issue",
        role: "leaf",
      },
      {
        type: "a11y_annotation",
        role: "leaf",
      },
      {
        type: "compliance_requirement",
        role: "leaf",
      },
      {
        type: "compliance_framework",
        role: "container",
      },
      {
        type: "risk",
        role: "leaf",
      },
      {
        type: "data_contract",
        role: "leaf",
      },
      {
        type: "audit_log_policy",
        role: "leaf",
      },
      {
        type: "security_audit",
        role: "leaf",
      },
      {
        type: "customer_feedback",
        role: "leaf",
      },
      {
        type: "support_ticket",
        role: "leaf",
        notes: "dual P7",
      },
      {
        type: "churn_reason",
        role: "leaf",
      },
      {
        type: "customer_health_score",
        role: "leaf",
      },
      {
        type: "playbook",
        role: "leaf",
      },
      {
        type: "service_blueprint",
        role: "root",
      },
      {
        type: "customer_journey_stage",
        role: "container",
      },
      {
        type: "touchpoint",
        role: "leaf",
      },
      {
        type: "success_milestone",
        role: "leaf",
      },
      {
        type: "team",
        role: "container",
      },
      {
        type: "department",
        role: "container",
      },
      {
        type: "role",
        role: "leaf",
      },
      {
        type: "person",
        role: "leaf",
      },
      {
        type: "stakeholder",
        role: "leaf",
        notes: "maps_to persona",
      },
      {
        type: "team_okr",
        role: "leaf",
      },
      {
        type: "retrospective",
        role: "leaf",
      },
      {
        type: "dependency",
        role: "leaf",
      },
      {
        type: "skill",
        role: "leaf",
      },
      {
        type: "ceremony",
        role: "leaf",
      },
      {
        type: "capacity_plan",
        role: "leaf",
      },
      {
        type: "legal_entity",
        role: "container",
      },
      {
        type: "ip_asset",
        role: "leaf",
      },
      {
        type: "contract",
        role: "container",
      },
      {
        type: "contract_clause",
        role: "leaf",
      },
      {
        type: "privacy_policy",
        role: "leaf",
      },
      {
        type: "locale",
        role: "container",
      },
      {
        type: "translation_key",
        role: "leaf",
      },
      {
        type: "translation_bundle",
        role: "container",
      },
      {
        type: "locale_config",
        role: "leaf",
      },
      {
        type: "cultural_adaptation",
        role: "leaf",
      },
      {
        type: "regional_pricing",
        role: "leaf",
      },
      {
        type: "education_program",
        role: "container",
      },
      {
        type: "tutorial",
        role: "leaf",
      },
      {
        type: "walkthrough",
        role: "leaf",
      },
      {
        type: "webinar",
        role: "leaf",
      },
      {
        type: "certification",
        role: "leaf",
      },
      {
        type: "help_video",
        role: "leaf",
      },
      {
        type: "learning_path",
        role: "container",
      },
    ],
    anchor: {
      type: "incident",
      rationale: "Forces every other domain to pay attention. References a service (Engineering), may trigger a feature_request (Product), produces a learning (Discovery), may breach an SLA. Cross-domain event propagation test.",
      outbound_cross_edge_count: 4,
      inbound_cross_edge_count: 1,
    },
    intra_edges: [
      "service_level_objective_measured_by_service_level_indicator",
      "service_level_objective_budgets_as_error_budget",
      "service_level_objective_satisfies_service_level_agreement",
      "incident_analysed_in_postmortem",
      "incident_triggers_postmortem",
      "incident_breaches_service_level_objective",
      "incident_exploits_vulnerability",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "product_experiences_incident",
        crosses_into: "product_delivery",
      },
      {
        direction: "import",
        edge_id: "test_case_validates_acceptance_criterion",
        crosses_into: "product_delivery",
      },
      {
        direction: "export",
        edge_id: "customer_feedback_becomes_feature_request",
        crosses_into: "product_delivery",
      },
      {
        direction: "export",
        edge_id: "incident_caused_by_root_cause",
        crosses_into: "engineering_platform",
      },
      {
        direction: "export",
        edge_id: "service_level_agreement_governs_service",
        crosses_into: "engineering_platform",
      },
      {
        direction: "export",
        edge_id: "service_level_objective_tracks_metric",
        crosses_into: "analytics_data",
      },
      {
        direction: "sideways",
        edge_id: "user_advisory_board_includes_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "sideways",
        edge_id: "cultural_adaptation_targets_persona",
        crosses_into: "users_needs",
      },
      {
        direction: "sideways",
        edge_id: "education_program_targets_persona",
        crosses_into: "users_needs",
      },
    ],
  },
  {
    id: "foundations",
    label: "Foundations",
    order: 11,
    shape: "polymorphic-target",
    mental_model: "Shared specs and primitives that many products implement, expose, and conform to.",
    operators: [
      "platform architect",
      "standards author",
      "staff engineer",
      "API designer",
    ],
    composes_atomic_domains: [
      "foundations",
    ],
    entities: [
      {
        type: "specification",
        role: "anchor",
      },
      {
        type: "primitive",
        role: "container",
      },
      {
        type: "operating_lifecycle",
        role: "container",
      },
      {
        type: "operating_stage",
        role: "leaf",
      },
    ],
    anchor: {
      type: "specification",
      rationale: "The specification is the rulebook many products point at: they implement, expose, and conform to it, and primitives are defined by it. It is the high-inbound canonical of the Foundations region.",
      outbound_cross_edge_count: 0,
      inbound_cross_edge_count: 6,
    },
    intra_edges: [
      "specification_extends_specification",
      "specification_competes_with_specification",
      "primitive_defined_by_specification",
      "primitive_composes_primitive",
      "operating_lifecycle_contains_operating_stage",
    ],
    boundary_edges: [
      {
        direction: "import",
        edge_id: "journey_phase_realises_operating_stage",
        crosses_into: "experience_design_brand",
      },
      {
        direction: "export",
        edge_id: "operating_stage_measured_by_metric",
        crosses_into: "analytics_data",
      },
    ],
  },
] as const

export const UPG_REGION_MAP: Readonly<Record<string, UPGRegion>> =
  Object.fromEntries(UPG_REGIONS.map((r) => [r.id, r]))

export function getRegion(id: string): UPGRegion | undefined {
  return UPG_REGION_MAP[id]
}

export function getRegionForEntityType(entityType: string): UPGRegion | undefined {
  return UPG_REGIONS.find((r) =>
    r.entities.some((e) => e.type === entityType),
  )
}

export const UPG_REGION_COUNT = UPG_REGIONS.length
