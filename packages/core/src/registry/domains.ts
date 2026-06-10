/**
 * UPG Domains. 36 flat semantic groupings of entity types.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGEntityType } from '../catalog/entity-catalog.js'

// ─── Domain definition ──────────────────────────────────────────────────────────

/**
 * A semantic domain: a flat grouping of related entity types.
 *
 * @example
 * const userDomain: UPGDomain = {
 *   id: 'user',
 *   label: 'User',
 *   description: 'Who your users are and what drives them.',
 *   types: ['persona', 'job', 'need', 'desired_outcome', 'job_step', 'switching_cost'],
 * }
 */
export interface UPGDomain {
  /** Machine-readable domain identifier */
  id: string
  /** Human-readable domain name */
  label: string
  /** Short description of what this domain covers */
  description: string
  /** Entity types in this domain */
  types: readonly string[]
}

// ─── Domain registry ────────────────────────────────────────────────────────────

// No explicit type annotation; `as const satisfies` preserves the literal ID
// tuple so `UPGDomainId` below resolves to a proper union.
export const UPG_DOMAINS = [
  {
    id: 'strategy',
    label: 'Strategy',
    description: 'The high-level direction of your product. Tracks the product itself, vision, mission, strategic themes, strategic pillars, initiatives, and capabilities that define what to build. Outcomes, objectives, and key results (OKRs) measure progress. Metrics quantify success. Assumptions and decisions record the reasoning. Value streams map how value flows. Connects upward to Portfolio and downward to Product Specification and Discovery.',
    types: [
      'product', 'outcome', 'objective', 'key_result', 'metric',
      'metric_quality_assessment',
      'vision', 'mission', 'strategic_theme', 'initiative', 'capability',
      'value_stream', 'strategic_pillar', 'assumption', 'decision',
      'constraint',
    ],
  },
  {
    id: 'user',
    label: 'User',
    description: 'Who your users are and what drives them. Personas represent user archetypes. Jobs capture what users are trying to accomplish, broken into job steps. Needs are the gaps users experience. Desired outcomes define what success looks like. Switching costs capture barriers to change. Feeds into Discovery, Experience Design, and Strategy.',
    types: [
      'persona', 'job', 'need', 'desired_outcome',
      'job_step', 'switching_cost',
    ],
  },
  {
    id: 'discovery',
    label: 'Discovery',
    description: 'Finding and shaping what to build next. Opportunities capture unmet needs worth pursuing. Solutions are candidate responses to opportunities. Feasibility studies assess viability. Design sprints are time-boxed exploration cycles. Bridges User (unmet needs) and Validation (testing ideas) to produce candidates for Product Specification.',
    types: ['opportunity', 'solution', 'feasibility_study', 'design_sprint'],
  },
  {
    id: 'validation',
    label: 'Validation',
    description: 'Testing ideas before committing to build them. Hypotheses state testable beliefs. Experiment plans structure the validation design. Experiments run the tests, with experiment runs capturing replication. Evidence captures what was observed. Learnings distill what was understood. Research plans coordinate broader investigation. Consumes opportunities from Discovery and insights from User Research, producing evidence that informs Strategy and Product Specification.',
    types: ['hypothesis', 'experiment', 'experiment_plan', 'experiment_run', 'learning', 'evidence', 'research_plan'],
  },
  {
    id: 'market_intelligence',
    label: 'Market Intelligence',
    description: 'The competitive landscape your product operates in. Competitors and their competitor features map the field. Market trends track industry shifts. Market segments define addressable audiences. Competitive analyses synthesize the full picture. Classification axes and values express the dimensional structure of the landscape (e.g. CMS Architecture × Editing Paradigm). Informs Strategy (positioning), Go-To-Market (battle cards), and Business Model (differentiation).',
    types: ['competitor', 'competitor_feature', 'market_trend', 'market_segment', 'competitive_analysis', 'classification_axis', 'classification_value'],
  },
  {
    id: 'user_research',
    label: 'User Research',
    description: 'Primary research with real users. Research studies are the container. Participants are who you talk to. Interview guides structure conversations. Observations capture what you see. Quotes preserve exact words. Survey responses collect structured input. Affinity clusters group patterns. Research questions frame what you want to learn. Insights synthesize findings. Feeds User (persona refinement), Discovery (opportunities), and Validation (hypotheses).',
    types: [
      'research_study', 'insight', 'participant', 'observation',
      'quote', 'affinity_cluster', 'research_question', 'interview_guide',
      'survey_response',
    ],
  },
  {
    id: 'ux_design',
    label: 'Experience Design',
    description: 'How users experience and interact with your product. User journeys map end-to-end experiences, broken into journey steps. User flows chart navigation paths. Screens and screen states define what users see. Design questions frame open problems. Design concepts explore possible solutions. Prototypes and wireframes make ideas tangible. Connects User (who) to Product Specification (what) through Design System (how).',
    types: ['user_journey', 'journey_step', 'journey_phase', 'journey_action', 'user_flow', 'screen', 'screen_state', 'design_question', 'design_concept', 'prototype', 'wireframe'],
  },
  {
    id: 'design_system',
    label: 'Design System',
    description: 'The reusable building blocks of your product UI. The design system entity anchors the collection. Design components are the atoms. Design tokens encode colour, spacing, and typography values. Design patterns document recurring solutions. Design guidelines codify usage rules. Annotations mark up designs with notes. Interaction specs define behaviour contracts. Ensures consistency across Experience Design and Engineering. Referenced by Accessibility.',
    types: ['design_component', 'design_token', 'design_system', 'design_pattern', 'design_guideline', 'annotation', 'interaction_spec'],
  },
  {
    id: 'brand',
    label: 'Brand Identity',
    description: 'Your product\'s visual and verbal identity. Brand identity is the root entity. Brand colour, brand typography, brand voice, brand logo, and brand imagery define the palette, type system, tone, mark, and visual language. Design System implements these at the component level. Go-To-Market applies them in external communications.',
    types: ['brand_identity', 'brand_colour', 'brand_typography', 'brand_voice', 'brand_logo', 'brand_imagery', 'brand_asset'],
  },
  {
    id: 'product_spec',
    label: 'Product Specification',
    description: 'What you are building and shipping. Feature areas group related capabilities. Features, epics, and user stories break work down. Acceptance criteria define done. Tasks and bugs track execution. Releases and changelogs mark what shipped. Roadmaps and roadmap items plan what comes next. Roadmap themes group roadmap work around the customer problem it solves, one level down from the strategic themes in Strategy. Translates Strategy into Engineering and tracks delivery through Program Management.',
    types: [
      'feature', 'feature_area', 'epic', 'user_story', 'acceptance_criterion', 'release',
      'task', 'bug', 'roadmap', 'roadmap_item', 'roadmap_theme', 'changelog',
    ],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    description: 'The technical architecture and implementation. Bounded contexts, aggregates, domain entities, value objects, commands, read models, and domain events model the domain. Services, API contracts, API endpoints, and database schemas define interfaces. Queue topics and integration patterns connect systems. External APIs and library dependencies track what you consume. Data flows map how information moves. Code repositories and build artifacts track source and output. Feature flags gate rollout. Deployments mark releases. Technical debt items track shortcuts. Investigations, root causes, symptoms, and fixes handle incidents. Relies on DevOps and Security.',
    types: [
      'bounded_context', 'service', 'domain_event', 'api_contract',
      'technical_debt_item', 'feature_flag', 'deployment', 'aggregate', 'domain_entity',
      'value_object', 'command', 'read_model', 'api_endpoint', 'database_schema',
      'queue_topic', 'build_artifact', 'code_repository', 'library_dependency',
      'integration_pattern', 'external_api', 'data_flow',
      'investigation', 'root_cause', 'symptom', 'fix',
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    description: 'How your product acquires, activates, and retains users. Funnels and funnel steps model conversion paths. Acquisition channels track where users come from. Growth campaigns run targeted experiments. Cohorts group users by behaviour or timing. Behavioral segments slice the user base. Growth loops model self-reinforcing cycles. Variants track A/B test alternatives. Attribution models assign credit across touchpoints. Connects to Data & Analytics, Marketing, and Business Model.',
    types: [
      'funnel', 'funnel_step', 'acquisition_channel',
      'growth_campaign', 'cohort', 'behavioral_segment', 'growth_loop', 'variant',
      'attribution_model',
    ],
  },
  {
    id: 'business_model',
    label: 'Business Model',
    description: 'How your product creates and captures value. The business model entity anchors the canvas. Value propositions define why customers buy. Revenue streams and pricing tiers model income. Cost structures and unit economics track spend. Partnerships and key resources identify what you need. Key activities define what you do. Target customer segments specify who you serve. Customer relationships describe how you engage. Distribution channels map how you deliver. Connects Strategy to Pricing & Packaging and Sales.',
    types: [
      'business_model', 'value_proposition', 'revenue_stream',
      'cost_structure', 'unit_economics', 'partnership', 'key_resource', 'key_activity',
      'customer_relationship', 'distribution_channel',
    ],
  },
  {
    id: 'go_to_market',
    label: 'Go-To-Market',
    description: 'Your plan to bring the product to market. GTM strategies set the overall approach. Ideal customer profiles define who to target. Positioning and messaging frame how you talk about it. Launches coordinate market entry. Content strategies plan thought leadership. Sales motions define how you sell. Competitive battle cards arm the team. Demand gen programs drive pipeline. Territories segment the market. Objections, rebuttals, and proof points handle resistance. Translates Market Intelligence and Business Model into Marketing and Sales.',
    types: [
      'gtm_strategy', 'ideal_customer_profile', 'positioning', 'messaging', 'launch',
      'content_strategy', 'sales_motion', 'competitive_battle_card', 'demand_gen_program',
      'territory', 'objection', 'rebuttal', 'proof_point',
    ],
  },
  {
    id: 'team_org',
    label: 'Team & Organisation',
    description: 'The people and structure behind the product. Teams are the units. Roles define responsibilities. Stakeholders track who has influence. People name accountable individuals. Team OKRs set team-level goals. Retrospectives capture team learnings. Dependencies map cross-team blockers. Departments structure the org. Skills track capabilities. Ceremonies define recurring rituals. Capacity plans model available effort. Connects to Program Management and Product Specification.',
    types: [
      'team', 'role', 'stakeholder', 'person', 'team_okr', 'retrospective',
      'dependency', 'department', 'skill', 'ceremony', 'capacity_plan',
    ],
  },
  {
    id: 'data_analytics',
    label: 'Data & Analytics',
    description: 'How you measure and understand your product. Data sources define where data comes from. Event schemas standardize tracking. Data models structure the warehouse. Data pipelines move data between systems. Data lineage traces provenance. Data quality rules enforce standards. Data products package data for consumption. Data domains organize ownership. Dashboards and reports visualize insights. Glossary terms align vocabulary. Provides the measurement layer for Growth, Strategy, and Quality Assurance.',
    types: [
      'data_source', 'event_schema', 'dashboard',
      'data_model', 'data_quality_rule', 'data_product', 'data_pipeline', 'data_lineage',
      'glossary_term', 'data_domain', 'report',
    ],
  },
  {
    id: 'content',
    label: 'Content & Knowledge',
    description: 'All content your product team creates and manages. Content pieces are individual assets. Knowledge base articles serve users. Brand assets store visual collateral. Internal docs capture team knowledge. Prompt templates standardize AI interactions. Content calendars plan publication. Content themes group editorial focus. Documentation templates ensure consistency. Documents are general-purpose containers. Supports Marketing, Customer Education, and Customer Success.',
    types: [
      'content_piece', 'knowledge_base_article',
      'content_calendar', 'content_theme', 'documentation_template',
      'document',
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    description: 'Legal structure and intellectual property protection. Legal entities define corporate structure. IP assets track patents, trademarks, and copyrights. Contracts and contract clauses manage agreements. Privacy policies govern data handling. Connects to Compliance (regulatory requirements), Security (data classification), and Business Model (partnership agreements).',
    types: ['legal_entity', 'ip_asset', 'contract', 'contract_clause', 'privacy_policy'],
  },
  {
    id: 'devops',
    label: 'DevOps & Platform',
    description: 'The reliability and infrastructure layer. Service level indicators (SLIs) and service level objectives (SLOs) define targets. Error budgets track risk tolerance. Incidents and postmortems handle failures. Runbooks document response procedures. Monitors and alert rules detect problems. CI pipelines automate builds. Release strategies govern rollout. On-call rotations assign responsibility. Infrastructure components model the platform. Supports Engineering and connects to Security and Quality Assurance.',
    types: [
      'service_level_indicator', 'service_level_objective', 'error_budget', 'incident', 'postmortem', 'runbook', 'monitor',
      'alert_rule', 'ci_pipeline', 'release_strategy', 'on_call_rotation',
      'infrastructure_component',
    ],
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Protecting your product and its users. Threat models map attack surfaces. Threats identify specific risks. Vulnerabilities track known weaknesses. Security controls are the mitigations. Security policies set rules. Penetration tests verify defences. Security reviews assess posture. Data classifications label sensitivity. Access policies govern who can reach what. Connects to Engineering, Compliance, and DevOps.',
    types: [
      'threat_model', 'threat', 'vulnerability', 'security_control', 'security_policy',
      'penetration_test', 'security_review', 'data_classification',
      'access_policy',
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Ensuring your product is usable by everyone. A11y standards define the bar (WCAG, etc.). A11y guidelines translate standards into actionable rules. A11y audits assess compliance. A11y issues track violations. A11y annotations mark up designs with accessibility notes. Connects to Design System (component compliance), Experience Design (journey inclusion), and Quality Assurance (testing coverage).',
    types: ['a11y_standard', 'a11y_guideline', 'a11y_audit', 'a11y_issue', 'a11y_annotation'],
  },
  {
    id: 'testing',
    label: 'Quality Assurance',
    description: 'Verifying your product works correctly. Test plans define the verification approach (scope, environments, pass criteria). Test suites group related tests. Test cases define individual checks. QA sessions capture exploratory testing. Regression tests guard against regressions. Test coverage reports measure completeness. Test environments define where tests run. Test results record outcomes. Validates Engineering (code quality) and Product Specification (acceptance criteria). Feeds DevOps (release confidence).',
    types: [
      'test_plan', 'test_suite', 'test_case', 'qa_session', 'regression_test', 'test_coverage_report',
      'test_environment', 'test_result',
    ],
  },
  {
    id: 'feedback',
    label: 'Customer Feedback',
    description: 'The voice of your customers after they use your product. Feedback programs are the containers. Feature requests capture what customers want. Feedback votes quantify demand. NPS campaigns measure satisfaction. User advisory boards provide structured input. Beta programs test with early adopters. Feedback themes group recurring patterns. Feeds User Research (patterns), Discovery (opportunities), and Strategy (priorities).',
    types: [
      'feedback_program', 'feature_request', 'feedback_vote', 'nps_campaign',
      'user_advisory_board', 'beta_program', 'feedback_theme',
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing & Packaging',
    description: 'How you package and price your product. Pricing strategies set the overall approach. Pricing tiers define what customers buy, bundling features, trials, gates, and discounts. Discount strategies manage promotions. Trial configs define free-to-paid conversion mechanics. Paywalls gate premium features. Connects Business Model (revenue streams) to Growth (conversion optimization) and Sales (deal structure).',
    types: [
      'pricing_strategy', 'pricing_tier', 'discount_strategy',
      'trial_config', 'paywall',
    ],
  },
  {
    id: 'ai',
    label: 'AI & Machine Learning',
    description: 'AI and machine learning capabilities within your product. AI models track deployed models. Prompt templates define reusable prompts; prompt versions manage their evolution. Eval benchmarks and eval runs measure quality. AI cost trackers monitor spend. Hallucination reports flag reliability issues. AI guardrails set safety boundaries. Model comparisons evaluate alternatives. AI experiments test new approaches. AI datasets track training data. AI traces log inference chains. Connects to Engineering, Data & Analytics, and Product Specification.',
    types: [
      'ai_model', 'prompt_version', 'eval_benchmark', 'eval_run', 'ai_cost_tracker',
      'hallucination_report', 'ai_guardrail', 'model_comparison',
      'ai_experiment', 'ai_dataset', 'ai_trace', 'prompt_template',
    ],
  },
  {
    id: 'automation',
    label: 'Workflows & Agents',
    description: 'Automated processes and AI agents that operate on your product graph. Workflow templates define reusable processes. Workflow runs are executions. Workflow artifacts are outputs. Agent definitions describe autonomous agents. Agent sessions track their work. Agent skills define capabilities. Agent hooks wire triggers. Agent tasks are discrete units of agent work. Review gates enforce human checkpoints. Approval records log decisions. Extends Engineering and AI to reduce manual work across all domains.',
    types: [
      'workflow_template', 'workflow_run', 'agent_definition', 'agent_session',
      'review_gate', 'approval_record', 'agent_skill', 'agent_hook', 'workflow_artifact',
      'agent_task',
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Multi-product management and organisational hierarchy. Organizations are the top-level entity. Portfolios group products by strategic axis (where you invest). Product areas group products by organisational axis (who owns what). Provides the container for Strategy (per-product direction) and enables cross-product edges that connect shared users, features, and infrastructure.',
    types: ['organization', 'portfolio', 'product_area'],
  },
  {
    id: 'sales',
    label: 'Sales & Revenue',
    description: 'Revenue operations from lead to invoice. Accounts represent companies. Contacts are people within accounts. Leads track inbound interest. Deals are active opportunities. Pipeline sales and pipeline stages model the sales funnel. Quote documents formalize offers. Subscriptions track recurring revenue. Invoices record billing. Forecasts project revenue. Connects Go-To-Market and Pricing & Packaging to Business Model.',
    types: [
      'account', 'contact', 'lead', 'deal', 'pipeline_sales', 'pipeline_stage',
      'quote_document', 'subscription', 'invoice', 'forecast',
    ],
  },
  {
    id: 'program_mgmt',
    label: 'Program Management',
    description: 'Coordinating delivery across teams and timelines. Programs are the highest container. Projects break programs down. Milestones mark key dates. Risk registers track threats to delivery. Change requests manage scope changes. Deliverables define what ships. Resource allocations assign effort. Status reports communicate progress. Connects Product Specification (what to deliver) to Team & Organisation (who delivers).',
    types: [
      'program', 'project', 'milestone', 'risk_register', 'change_request',
      'deliverable', 'resource_allocation', 'status_report',
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Executing campaigns that reach your audience. Marketing strategies set direction. Marketing channels define where you reach people. Marketing campaign plans coordinate execution. Email sequences nurture leads. Social posts engage audiences. SEO keywords target search. Ad creatives drive paid acquisition. Press releases announce news. Events create in-person touchpoints. Community initiatives build grassroots engagement. Implements Go-To-Market and feeds Growth.',
    types: [
      'marketing_strategy', 'marketing_channel', 'marketing_campaign_plan', 'email_sequence',
      'social_post', 'seo_keyword', 'ad_creative', 'press_release', 'event',
      'community_initiative',
    ],
  },
  {
    id: 'customer_success',
    label: 'Customer Success',
    description: 'Keeping customers healthy and reducing churn. Support tickets track issues. Customer feedback captures post-sale voice. Churn reasons explain why customers leave. Customer health scores quantify account risk. Playbooks codify response patterns. Service level agreements set expectations. Customer journey stages map the post-sale arc. Touchpoints track every interaction. Success milestones mark key achievements. Service blueprints model the full service delivery. Connects Customer Feedback to Growth and Product Specification.',
    types: [
      'support_ticket', 'customer_feedback', 'churn_reason',
      'customer_health_score', 'playbook', 'service_level_agreement', 'customer_journey_stage', 'touchpoint',
      'success_milestone', 'service_blueprint',
    ],
  },
  {
    id: 'localisation',
    label: 'Localisation',
    description: 'Adapting your product for global audiences. Locales define supported languages and regions. Translation keys are individual translatable strings. Translation bundles group keys for deployment. Locale configs store per-locale settings. Cultural adaptations track region-specific adjustments beyond language. Regional pricing models location-based pricing. Connects to Content & Knowledge, Pricing & Packaging, and Experience Design.',
    types: [
      'locale', 'translation_key', 'translation_bundle', 'locale_config',
      'cultural_adaptation', 'regional_pricing',
    ],
  },
  {
    id: 'education',
    label: 'Customer Education',
    description: 'Teaching users how to succeed with your product. Education programs are the containers. Tutorials provide step-by-step instruction. Walkthroughs guide users through features. Webinars deliver live education. Certifications validate mastery. Help videos offer visual guidance. Learning paths sequence content into curricula. Supports Customer Success (onboarding), Content & Knowledge (educational material), and Growth (activation).',
    types: [
      'education_program', 'tutorial', 'walkthrough', 'webinar', 'certification',
      'help_video', 'learning_path',
    ],
  },
  {
    id: 'ecosystem',
    label: 'Partners & Ecosystem',
    description: 'The network of partners and integrations around your product. Partner programs define the structure. Partner tiers segment partners by value. API ecosystems track integration surfaces. Marketplace listings manage distribution. Developer portals serve external builders. Integration partners are specific collaborators. Partner revenue shares model economics. Extends Business Model (partnership value) and Engineering (API ecosystem).',
    types: [
      'partner_program', 'partner_tier', 'api_ecosystem', 'marketplace_listing',
      'developer_portal', 'integration_partner', 'partner_revenue_share',
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Meeting regulatory and governance requirements. Compliance frameworks define which standards apply (SOC 2, GDPR, etc.). Compliance requirements are individual mandates. Risks track exposure. Data contracts formalize data-sharing agreements. Audit log policies govern what gets logged. Security audits assess compliance posture. Connects to Legal, Security, and Data & Analytics.',
    types: ['compliance_requirement', 'risk', 'data_contract', 'audit_log_policy', 'compliance_framework', 'security_audit'],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    description: 'Spatial thinking spaces for arranging entities, debating decisions, and committing to the graph. Workspaces are transient canvases that sit alongside all other domains, letting you compose and explore relationships before they become permanent graph structure. A framework exercise is a structured workspace: one run of a framework (MoSCoW, RICE, Kano, …) applied to a chosen set of entities, with each entity\'s result recorded on the exercise-to-entity edge rather than the entity itself.',
    types: ['workspace', 'framework_exercise'],
  },
] as const satisfies readonly UPGDomain[]

// ─── Derived domain ID union ────────────────────────────────────────────────────

/**
 * Union of every canonical domain identifier, derived from UPG_DOMAINS.
 *
 * Adding, removing, or renaming a domain updates this type automatically.
 * Do NOT maintain a separate list here.
 */
export type UPGDomainId = typeof UPG_DOMAINS[number]['id']

// ─── Reverse map: entity type → domain id ───────────────────────────────────────

/**
 * Canonical entity-type → domain-id lookup. O(1) access, derived from
 * `UPG_DOMAINS` at module init. Never maintained by hand.
 *
 * Prefer this over walking `UPG_DOMAINS` in downstream packages: the repeated
 * `UPG_DOMAINS.find(d => d.types.includes(t))?.id` pattern is a drift risk
 * (subtle `includes` vs `indexOf` semantics, missing null-guards, etc.).
 */
export const UPG_ENTITY_TO_DOMAIN: Readonly<Record<UPGEntityType, UPGDomainId>> =
  Object.freeze(
    Object.fromEntries(
      UPG_DOMAINS.flatMap((d) => d.types.map((t) => [t, d.id] as const))
    ) as Record<UPGEntityType, UPGDomainId>
  )

// ─── Helper functions ───────────────────────────────────────────────────────────

/**
 * Get all entity types across all domains.
 *
 * @example
 * const types = getTypes()
 * types.includes('persona')    // → true
 * types.includes('feature')    // → true
 * types.length                 // → 300+ (all active types)
 */
export function getTypes(): string[] {
  return UPG_DOMAINS.flatMap((d) => [...d.types])
}

/**
 * Look up which domain an entity type belongs to.
 *
 * @example
 * const d = getDomainForType('persona')
 * // d?.id     === 'user'
 * // d?.name   === 'User'
 *
 * @example
 * getDomainForType('not_a_type')   // → undefined
 */
export function getDomainForType(entityType: string): UPGDomain | undefined {
  // `types` is a narrow literal tuple per domain; widen for runtime .includes.
  return UPG_DOMAINS.find((d) => (d.types as readonly string[]).includes(entityType))
}

/**
 * Look up the canonical domain id for a typed entity type. O(1).
 *
 * Returns `undefined` only for the degenerate case where an entity type is
 * absent from every domain, which spec-integrity tests guarantee never
 * happens for active types. Callers with a `UPGEntityType` can treat the
 * result as non-null, but the return type keeps the escape hatch for
 * defensive string-typed call sites.
 *
 * @example
 * getDomainIdForType('persona')       // → 'user'
 * getDomainIdForType('feature')       // → 'product_spec'
 * getDomainIdForType('competitor')    // → 'market_intelligence'
 */
export function getDomainIdForType(entityType: UPGEntityType): UPGDomainId | undefined {
  return UPG_ENTITY_TO_DOMAIN[entityType]
}
