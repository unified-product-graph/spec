/**
 * UPG Property Map. Type-safe lookup from entity type to property interface.
 * Use `UPGNode<T>` for narrowed `properties` typing at call sites.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { InsightProperties } from './domains/user-research.js'
import type { PersonaProperties, JobProperties, NeedProperties, DesiredOutcomeProperties, JobStepProperties, SwitchingCostProperties } from './domains/users.js'
import type { OpportunityProperties, SolutionProperties, FeasibilityStudyProperties, DesignSprintProperties } from './domains/discovery.js'
import type { HypothesisProperties, HypothesisEvidenceProperties, ExperimentProperties, ExperimentPlanProperties, ExperimentRunProperties, LearningProperties, EvidenceProperties, ResearchPlanProperties } from './domains/validation.js'
import type { CompetitorProperties, CompetitorFeatureProperties, MarketTrendProperties, MarketSegmentProperties, CompetitiveAnalysisProperties, ClassificationAxisProperties, ClassificationValueProperties, ClassificationCommitment, ClassificationCapability, ClassificationCapabilitySurface, EmptyCell, EmptyCellRationaleKind } from './domains/market.js'
import type { ResearchStudyProperties, ParticipantProperties, ObservationProperties, QuoteProperties, AffinityClusterProperties, ResearchQuestionProperties, InterviewGuideProperties, SurveyResponseProperties } from './domains/user-research.js'
import type { UserJourneyProperties, JourneyStepProperties, JourneyPhaseProperties, JourneyActionProperties, DesignQuestionProperties, DesignConceptProperties, PrototypeProperties, WireframeProperties, UserFlowProperties, ScreenProperties, ScreenStateProperties, AnnotationProperties, InteractionSpecProperties } from './domains/ux-design.js'
import type { DesignComponentProperties, DesignTokenProperties, DesignSystemProperties, DesignPatternProperties, DesignGuidelineProperties } from './domains/design-system.js'
import type { BrandIdentityProperties, BrandColourProperties, BrandTypographyProperties, BrandVoiceProperties, BrandLogoProperties, BrandImageryProperties } from './domains/brand.js'
import type { OutcomeProperties, ObjectiveProperties, KeyResultProperties, FeatureAreaProperties, FeatureProperties, EpicProperties, UserStoryProperties, StoryTaskProperties, AcceptanceCriterionProperties, ReleaseProperties, TaskProperties, BugProperties, RoadmapProperties, RoadmapItemProperties, RoadmapThemeProperties, ChangelogProperties } from './domains/product-spec.js'
import type { MetricProperties, MetricQualityAssessmentProperties } from './domains/metrics.js'
import type { BoundedContextProperties, ServiceProperties, DomainEventProperties, ApiContractProperties, TechnicalDebtItemProperties, FeatureFlagProperties, DeploymentProperties, AggregateProperties, DomainEntityProperties, ValueObjectProperties, CommandProperties, ReadModelProperties, ApiEndpointProperties, DatabaseSchemaProperties, QueueTopicProperties, BuildArtifactProperties, CodeRepositoryProperties, LibraryDependencyProperties, IntegrationPatternProperties, ExternalApiProperties, DataFlowProperties, InvestigationProperties, RootCauseProperties, SymptomProperties, FixProperties } from './domains/engineering.js'
import type { FunnelProperties, FunnelStepProperties, AcquisitionChannelProperties, GrowthCampaignProperties, CohortProperties, BehavioralSegmentProperties, GrowthLoopProperties, VariantProperties, AttributionModelProperties } from './domains/growth.js'
import type { BusinessModelProperties, ValuePropositionProperties, RevenueStreamProperties, PricingTierProperties, CostStructureProperties, UnitEconomicsProperties, PartnershipProperties, KeyResourceProperties, KeyActivityProperties, TargetCustomerSegmentProperties,CustomerRelationshipProperties, DistributionChannelProperties } from './domains/business-model.js'
import type { GtmStrategyProperties, IdealCustomerProfileProperties, PositioningProperties, MessagingProperties, LaunchProperties, ContentStrategyProperties, SalesMotionProperties, CompetitiveBattleCardProperties, DemandGenProgramProperties, TerritoryProperties, ObjectionProperties, RebuttalProperties, ProofPointProperties } from './domains/gtm.js'
import type { TeamProperties, RoleProperties, StakeholderProperties, PersonProperties, TeamOkrProperties, RetrospectiveProperties, DependencyProperties, DepartmentProperties, SkillProperties, CeremonyProperties, CapacityPlanProperties } from './domains/team.js'
import type { DataSourceProperties, EventSchemaProperties, DashboardProperties, DataModelProperties, DataQualityRuleProperties, DataProductProperties, DataPipelineProperties, DataLineageProperties, GlossaryTermProperties, DataDomainProperties, ReportProperties } from './domains/data.js'
import type { ContentPieceProperties, KnowledgeBaseArticleProperties, BrandAssetProperties, InternalDocProperties, ContentCalendarProperties, ContentThemeProperties, DocumentationTemplateProperties, DocumentProperties } from './domains/content.js'
import type { LegalEntityProperties, IpAssetProperties, ContractProperties, ContractClauseProperties, PrivacyPolicyProperties } from './domains/legal.js'
import type { ComplianceRequirementProperties, RiskProperties, DataContractProperties, AuditLogPolicyProperties, ComplianceFrameworkProperties, SecurityAuditProperties } from './domains/compliance.js'
import type { ServiceLevelIndicatorProperties, ServiceLevelObjectiveProperties, ErrorBudgetProperties, IncidentProperties, PostmortemProperties, RunbookProperties, MonitorProperties, AlertRuleProperties, CiPipelineProperties, ReleaseStrategyProperties, OnCallRotationProperties, InfrastructureComponentProperties } from './domains/devops.js'
import type { ThreatModelProperties, ThreatProperties, VulnerabilityProperties, SecurityControlProperties, SecurityPolicyProperties, PenetrationTestProperties, SecurityReviewProperties, DataClassificationProperties, AccessPolicyProperties } from './domains/security.js'
import type { A11yStandardProperties, A11yGuidelineProperties, A11yAuditProperties, A11yIssueProperties, A11yAnnotationProperties } from './domains/accessibility.js'
import type { TestPlanProperties, TestSuiteProperties, TestCaseProperties, QaSessionProperties, RegressionTestProperties, TestCoverageReportProperties, TestEnvironmentProperties, TestResultProperties } from './domains/testing.js'
import type { FeedbackProgramProperties, FeatureRequestProperties, FeedbackVoteProperties, NpsCampaignProperties, UserAdvisoryBoardProperties, BetaProgramProperties, FeedbackThemeProperties } from './domains/feedback.js'
import type { PricingStrategyProperties, DiscountStrategyProperties, TrialConfigProperties, PaywallProperties } from './domains/pricing.js'
import type { AiModelProperties, PromptTemplateProperties, PromptVersionProperties, EvalBenchmarkProperties, EvalRunProperties, AiCostTrackerProperties, HallucinationReportProperties, AiGuardrailProperties, ModelComparisonProperties, AiExperimentProperties, AiDatasetProperties, AiTraceProperties } from './domains/ai.js'
import type { WorkflowTemplateProperties, WorkflowRunProperties, AgentDefinitionProperties, AgentSessionProperties, ReviewGateProperties, ApprovalRecordProperties, AgentSkillProperties, AgentHookProperties, WorkflowArtifactProperties, AgentTaskProperties } from './domains/automation.js'
import type { OrganizationProperties, PortfolioProperties, ProductAreaProperties } from './domains/portfolio.js'
import type { WorkspaceProperties, FrameworkExerciseProperties } from './domains/workspace.js'
import type { AccountProperties, ContactProperties, LeadProperties, DealProperties, PipelineSalesProperties, PipelineStageProperties, QuoteDocumentProperties, SubscriptionProperties, InvoiceProperties, ForecastProperties } from './domains/sales.js'
import type { ProgramProperties, ProjectProperties, MilestoneProperties, RiskRegisterProperties, ChangeRequestProperties, DeliverableProperties, ResourceAllocationProperties, StatusReportProperties } from './domains/programs.js'
import type { MarketingStrategyProperties, MarketingChannelProperties, MarketingCampaignPlanProperties, EmailSequenceProperties, SocialPostProperties, SeoKeywordProperties, AdCreativeProperties, PressReleaseProperties, EventProperties, CommunityInitiativeProperties } from './domains/marketing.js'
import type { SupportTicketProperties, CustomerFeedbackProperties, ChurnReasonProperties, CustomerHealthScoreProperties, PlaybookProperties, ServiceLevelAgreementProperties, CustomerJourneyStageProperties, TouchpointProperties, SuccessMilestoneProperties, ServiceBlueprintProperties } from './domains/customer-success.js'
import type { LocaleProperties, TranslationKeyProperties, TranslationBundleProperties, LocaleConfigProperties, CulturalAdaptationProperties, RegionalPricingProperties } from './domains/localisation.js'
import type { EducationProgramProperties, TutorialProperties, WalkthroughProperties, WebinarProperties, CertificationProperties, HelpVideoProperties, LearningPathProperties } from './domains/education.js'
import type { PartnerProgramProperties, PartnerTierProperties, ApiEcosystemProperties, MarketplaceListingProperties, DeveloperPortalProperties, IntegrationPartnerProperties, PartnerRevenueShareProperties } from './domains/ecosystem.js'
import type { ProductProperties, VisionProperties, MissionProperties, StrategicThemeProperties, InitiativeProperties, CapabilityProperties, ValueStreamProperties, StrategicPillarProperties, AssumptionProperties, DecisionProperties, ConstraintProperties } from './domains/strategy.js'
import type { SpecificationProperties, PrimitiveProperties } from './domains/foundations.js'

// ─── Re-export everything so consumers can import from one place ──────────────

export type { InsightProperties }
export type { PersonaProperties, JobProperties, NeedProperties, DesiredOutcomeProperties, JobStepProperties, SwitchingCostProperties }
export type { OpportunityProperties, SolutionProperties, FeasibilityStudyProperties, DesignSprintProperties }
export type { HypothesisProperties, HypothesisEvidenceProperties, ExperimentProperties, ExperimentPlanProperties, ExperimentRunProperties, LearningProperties, EvidenceProperties, ResearchPlanProperties }
export type { CompetitorProperties, CompetitorFeatureProperties, MarketTrendProperties, MarketSegmentProperties, CompetitiveAnalysisProperties, ClassificationAxisProperties, ClassificationValueProperties, ClassificationCommitment, ClassificationCapability, ClassificationCapabilitySurface, EmptyCell, EmptyCellRationaleKind }
export type { ResearchStudyProperties, ParticipantProperties, ObservationProperties, QuoteProperties, AffinityClusterProperties, ResearchQuestionProperties, InterviewGuideProperties, SurveyResponseProperties }
export type { UserJourneyProperties, JourneyStepProperties, JourneyPhaseProperties, JourneyActionProperties, DesignQuestionProperties, DesignConceptProperties, PrototypeProperties, WireframeProperties, UserFlowProperties, ScreenProperties, ScreenStateProperties, AnnotationProperties, InteractionSpecProperties }
export type { DesignComponentProperties, DesignTokenProperties, DesignSystemProperties, DesignPatternProperties, DesignGuidelineProperties }
export type { BrandIdentityProperties, BrandColourProperties, BrandTypographyProperties, BrandVoiceProperties, BrandLogoProperties, BrandImageryProperties }
export type { OutcomeProperties, ObjectiveProperties, KeyResultProperties, FeatureAreaProperties, FeatureProperties, EpicProperties, UserStoryProperties, StoryTaskProperties, AcceptanceCriterionProperties, ReleaseProperties, TaskProperties, BugProperties, RoadmapProperties, RoadmapItemProperties, RoadmapThemeProperties, ChangelogProperties }
export type { MetricProperties, MetricQualityAssessmentProperties }
export type { BoundedContextProperties, ServiceProperties, DomainEventProperties, ApiContractProperties, TechnicalDebtItemProperties, FeatureFlagProperties, DeploymentProperties, AggregateProperties, DomainEntityProperties, ValueObjectProperties, CommandProperties, ReadModelProperties, ApiEndpointProperties, DatabaseSchemaProperties, QueueTopicProperties, BuildArtifactProperties, CodeRepositoryProperties, LibraryDependencyProperties, IntegrationPatternProperties, ExternalApiProperties, DataFlowProperties, InvestigationProperties, RootCauseProperties, SymptomProperties, FixProperties }
export type { SpecificationProperties, PrimitiveProperties }
export type { FunnelProperties, FunnelStepProperties, AcquisitionChannelProperties, GrowthCampaignProperties, CohortProperties, BehavioralSegmentProperties, GrowthLoopProperties, VariantProperties, AttributionModelProperties }
export type { BusinessModelProperties, ValuePropositionProperties, RevenueStreamProperties, PricingTierProperties, CostStructureProperties, UnitEconomicsProperties, PartnershipProperties, KeyResourceProperties, KeyActivityProperties, TargetCustomerSegmentProperties,CustomerRelationshipProperties, DistributionChannelProperties }
export type { GtmStrategyProperties, IdealCustomerProfileProperties, PositioningProperties, MessagingProperties, LaunchProperties, ContentStrategyProperties, SalesMotionProperties, CompetitiveBattleCardProperties, DemandGenProgramProperties, TerritoryProperties, ObjectionProperties, RebuttalProperties, ProofPointProperties }
export type { TeamProperties, RoleProperties, StakeholderProperties, PersonProperties, TeamOkrProperties, RetrospectiveProperties, DependencyProperties, DepartmentProperties, SkillProperties, CeremonyProperties, CapacityPlanProperties }
export type { DataSourceProperties, EventSchemaProperties, DashboardProperties, DataModelProperties, DataQualityRuleProperties, DataProductProperties, DataPipelineProperties, DataLineageProperties, GlossaryTermProperties, DataDomainProperties, ReportProperties }
export type { ContentPieceProperties, KnowledgeBaseArticleProperties, BrandAssetProperties, InternalDocProperties, ContentCalendarProperties, ContentThemeProperties, DocumentationTemplateProperties, DocumentProperties }
export type { LegalEntityProperties, IpAssetProperties, ContractProperties, ContractClauseProperties, PrivacyPolicyProperties }
export type { ComplianceRequirementProperties, RiskProperties, DataContractProperties, AuditLogPolicyProperties, ComplianceFrameworkProperties, SecurityAuditProperties }
export type { ServiceLevelIndicatorProperties, ServiceLevelObjectiveProperties, ErrorBudgetProperties, IncidentProperties, PostmortemProperties, RunbookProperties, MonitorProperties, AlertRuleProperties, CiPipelineProperties, ReleaseStrategyProperties, OnCallRotationProperties, InfrastructureComponentProperties }
export type { ThreatModelProperties, ThreatProperties, VulnerabilityProperties, SecurityControlProperties, SecurityPolicyProperties, PenetrationTestProperties, SecurityReviewProperties, DataClassificationProperties, AccessPolicyProperties }
export type { A11yStandardProperties, A11yGuidelineProperties, A11yAuditProperties, A11yIssueProperties, A11yAnnotationProperties }
export type { TestPlanProperties, TestSuiteProperties, TestCaseProperties, QaSessionProperties, RegressionTestProperties, TestCoverageReportProperties, TestEnvironmentProperties, TestResultProperties }
export type { FeedbackProgramProperties, FeatureRequestProperties, FeedbackVoteProperties, NpsCampaignProperties, UserAdvisoryBoardProperties, BetaProgramProperties, FeedbackThemeProperties }
export type { PricingStrategyProperties, DiscountStrategyProperties, TrialConfigProperties, PaywallProperties }
export type { AiModelProperties, PromptTemplateProperties, PromptVersionProperties, EvalBenchmarkProperties, EvalRunProperties, AiCostTrackerProperties, HallucinationReportProperties, AiGuardrailProperties, ModelComparisonProperties, AiExperimentProperties, AiDatasetProperties, AiTraceProperties }
export type { WorkflowTemplateProperties, WorkflowRunProperties, AgentDefinitionProperties, AgentSessionProperties, ReviewGateProperties, ApprovalRecordProperties, AgentSkillProperties, AgentHookProperties, WorkflowArtifactProperties, AgentTaskProperties }
export type { OrganizationProperties, PortfolioProperties, ProductAreaProperties }
export type { AccountProperties, ContactProperties, LeadProperties, DealProperties, PipelineSalesProperties, PipelineStageProperties, QuoteDocumentProperties, SubscriptionProperties, InvoiceProperties, ForecastProperties }
export type { ProgramProperties, ProjectProperties, MilestoneProperties, RiskRegisterProperties, ChangeRequestProperties, DeliverableProperties, ResourceAllocationProperties, StatusReportProperties }
export type { MarketingStrategyProperties, MarketingChannelProperties, MarketingCampaignPlanProperties, EmailSequenceProperties, SocialPostProperties, SeoKeywordProperties, AdCreativeProperties, PressReleaseProperties, EventProperties, CommunityInitiativeProperties }
export type { SupportTicketProperties, CustomerFeedbackProperties, ChurnReasonProperties, CustomerHealthScoreProperties, PlaybookProperties, ServiceLevelAgreementProperties, CustomerJourneyStageProperties, TouchpointProperties, SuccessMilestoneProperties, ServiceBlueprintProperties }
export type { LocaleProperties, TranslationKeyProperties, TranslationBundleProperties, LocaleConfigProperties, CulturalAdaptationProperties, RegionalPricingProperties }
export type { EducationProgramProperties, TutorialProperties, WalkthroughProperties, WebinarProperties, CertificationProperties, HelpVideoProperties, LearningPathProperties }
export type { PartnerProgramProperties, PartnerTierProperties, ApiEcosystemProperties, MarketplaceListingProperties, DeveloperPortalProperties, IntegrationPartnerProperties, PartnerRevenueShareProperties }
export type { ProductProperties, VisionProperties, MissionProperties, StrategicThemeProperties, InitiativeProperties, CapabilityProperties, ValueStreamProperties, StrategicPillarProperties, AssumptionProperties, DecisionProperties, ConstraintProperties }

// ─── UPGNode typed wrapper ────────────────────────────────────────────────────

import type { UPGBaseNode } from '../shapes/base-node.js'

/** Type-safe lookup from entity type string to its property interface.
 *  Every active entity type has an entry. */
export interface UPGPropertyMap {
  // ─── Strategy ───────────────────────────────────────────────────────────────
  /** The product being built: root node of every product graph */
  product: ProductProperties
  /** A measurable outcome the product is working toward */
  outcome: OutcomeProperties
  /** A specific objective tied to a strategic theme or OKR */
  objective: ObjectiveProperties
  /** A quantifiable key result used to measure an objective */
  key_result: KeyResultProperties
  /** A tracked metric, present when a quantitative measure is defined */
  metric: MetricProperties
  /** A point-in-time review of a metric's quality and fitness for purpose. */
  metric_quality_assessment: MetricQualityAssessmentProperties
  /** The long-horizon vision statement for the product */
  vision: VisionProperties
  /** The mission statement: who is served and what core value is delivered */
  mission: MissionProperties
  /** A strategic theme grouping related initiatives under a common direction */
  strategic_theme: StrategicThemeProperties
  /** A time-boxed initiative delivering against a strategic theme */
  initiative: InitiativeProperties
  /** An organisational or technical capability being developed or maintained */
  capability: CapabilityProperties
  /** A value stream mapping the end-to-end flow of value delivery */
  value_stream: ValueStreamProperties
  /** A durable strategic pillar spanning multi-year horizons */
  strategic_pillar: StrategicPillarProperties
  /** An assumption that underpins strategy or design, present when validation is being tracked */
  assumption: AssumptionProperties
  /** A decision record (strategic, product, engineering, or design) */
  decision: DecisionProperties
  /** A named limitation or boundary (resource, technical, regulatory,
   *  temporal, or compliance) that bounds product creation. Edge-defined. */
  constraint: ConstraintProperties

  // ─── Users & Needs ──────────────────────────────────────────────────────────
  /** A user persona representing a segment of people the product serves */
  persona: PersonaProperties
  /** A job-to-be-done: the progress a user is trying to make */
  job: JobProperties
  /** A user need derived from research or synthesis */
  need: NeedProperties
  /** A desired outcome: the specific result a user wants from a job step */
  desired_outcome: DesiredOutcomeProperties
  /** A discrete step within a job-to-be-done */
  job_step: JobStepProperties
  /** A switching cost that prevents a user from adopting the product */
  switching_cost: SwitchingCostProperties

  // ─── Discovery ──────────────────────────────────────────────────────────────
  /** A product opportunity identified from user needs or market gaps */
  opportunity: OpportunityProperties
  /** A proposed solution to an opportunity, present before commitment */
  solution: SolutionProperties
  /** A feasibility study assessing viability of a solution */
  feasibility_study: FeasibilityStudyProperties
  /** A design sprint run to explore and test a solution space */
  design_sprint: DesignSprintProperties

  // ─── Validation ─────────────────────────────────────────────────────────────
  /** A testable belief: the canonical validation design artefact. */
  hypothesis: HypothesisProperties
  /** @deprecated since v0.4.0. Use `evidence` + `hypothesis_has_evidence` edge instead. */
  hypothesis_evidence: HypothesisEvidenceProperties
  /** A general-purpose experiment entity (canonical-stable). Use `experiment_plan` + `experiment_run` for fine-grained plan/run separation. */
  experiment: ExperimentProperties
  /** Planning intent for a structured test of a hypothesis (UCS pattern P4, work-unit). Pairs with `experiment_run`. */
  experiment_plan: ExperimentPlanProperties
  /** Execution evidence for a structured test of a hypothesis (UCS pattern P6, event-occurrence). Pairs with `experiment_plan`. */
  experiment_run: ExperimentRunProperties
  /** A learning captured from an experiment or research activity */
  learning: LearningProperties
  /** A test plan defining scope and method for a validation activity */
  test_plan: TestPlanProperties
  /** A piece of evidence supporting or refuting a hypothesis */
  evidence: EvidenceProperties
  /** A research plan outlining goals, methods, and participant criteria */
  research_plan: ResearchPlanProperties

  // ─── Market Intelligence ─────────────────────────────────────────────────────
  /** A competitor in the market, present when competitive tracking is active */
  competitor: CompetitorProperties
  /** A specific feature offered by a competitor */
  competitor_feature: CompetitorFeatureProperties
  /** A market trend that may affect product strategy */
  market_trend: MarketTrendProperties
  /** A segment of the addressable market being targeted */
  market_segment: MarketSegmentProperties
  /** A structured competitive analysis comparing product position */
  competitive_analysis: CompetitiveAnalysisProperties
  /** A dimension along which subjects are classified */
  classification_axis: ClassificationAxisProperties
  /** A value on a classification axis: one position in a taxonomy */
  classification_value: ClassificationValueProperties

  // ─── User Research ───────────────────────────────────────────────────────────
  /** A formal user research study (interview series, survey, usability test) */
  research_study: ResearchStudyProperties
  /** An insight synthesised from research: a meaningful pattern or finding */
  insight: InsightProperties
  /** A research participant, present when participant tracking is needed */
  participant: ParticipantProperties
  /** A raw observation recorded during research */
  observation: ObservationProperties
  /** A verbatim or paraphrased quote from a participant */
  quote: QuoteProperties
  /** A cluster of affinity-mapped observations sharing a common theme */
  affinity_cluster: AffinityClusterProperties
  /** A research question guiding a study or sprint */
  research_question: ResearchQuestionProperties
  /** An interview guide structuring a qualitative session */
  interview_guide: InterviewGuideProperties
  /** A single survey response from a participant */
  survey_response: SurveyResponseProperties

  // ─── Experience Design ───────────────────────────────────────────────────────
  /** An open design question framing a problem to be solved */
  design_question: DesignQuestionProperties
  /** A user journey map visualising experience across touchpoints */
  user_journey: UserJourneyProperties
  /** A discrete action at a journey step, classified by service layer */
  journey_action: JourneyActionProperties
  /** A single step within a user journey */
  journey_step: JourneyStepProperties
  /** A phase grouping journey steps into a named stage */
  journey_phase: JourneyPhaseProperties
  /** A design concept being explored or evaluated */
  design_concept: DesignConceptProperties
  /** A prototype built to test a design concept */
  prototype: PrototypeProperties
  /** A wireframe representing a screen layout at varying fidelity */
  wireframe: WireframeProperties
  /** A user flow showing task-level paths through the product */
  user_flow: UserFlowProperties
  /** A screen in the product UI, present when screen mapping is tracked */
  screen: ScreenProperties
  /** A specific UI state of a screen (empty, loading, error, etc.) */
  screen_state: ScreenStateProperties
  /** A design annotation on a screen or component */
  annotation: AnnotationProperties
  /** An interaction specification defining animation and transition behaviour */
  interaction_spec: InteractionSpecProperties

  // ─── Design System ───────────────────────────────────────────────────────────
  /** A reusable UI component in the design system */
  design_component: DesignComponentProperties
  /** A design token: a named value for colour, spacing, typography, etc. */
  design_token: DesignTokenProperties
  /** The design system itself, covering governance, tooling, and coverage metadata */
  design_system: DesignSystemProperties
  /** A recurring interaction or layout pattern documented in the design system */
  design_pattern: DesignPatternProperties
  /** A design guideline stating how and when to apply a pattern or token */
  design_guideline: DesignGuidelineProperties

  // ─── Brand Identity ──────────────────────────────────────────────────────────
  /** The brand identity, covering values, personality, and positioning */
  brand_identity: BrandIdentityProperties
  /** A specific brand colour with usage guidance */
  brand_colour: BrandColourProperties
  /** A brand typography pairing (typeface, scale, and usage rules) */
  brand_typography: BrandTypographyProperties
  /** The brand voice: tone, register, and writing principles */
  brand_voice: BrandVoiceProperties
  /** A brand logo variant (full, icon, wordmark, etc.) */
  brand_logo: BrandLogoProperties
  /** Brand imagery guidelines covering photography and illustration style */
  brand_imagery: BrandImageryProperties

  // ─── Product Spec ────────────────────────────────────────────────────────────
  /** A feature area grouping related features under a product section */
  feature_area: FeatureAreaProperties
  /** A product feature: a discrete unit of user-facing functionality */
  feature: FeatureProperties
  /** An epic grouping related user stories under a deliverable theme */
  epic: EpicProperties
  /** The "As X, I want Y so Z" templated promise: a user story (UCS pattern P5, templated-statement). Implemented by `task` via `task_implements_user_story`. */
  user_story: UserStoryProperties
  /**
   * @deprecated since v0.4.0. story_task collapsed into task.
   * Use the `task` entry below.
   */
  story_task: StoryTaskProperties
  /** An acceptance criterion defining when a story or feature is complete */
  acceptance_criterion: AcceptanceCriterionProperties
  /** A product release, present when versioned delivery is tracked */
  release: ReleaseProperties
  /** A discrete task assigned to a person or team */
  task: TaskProperties
  /** A bug report, present when a defect is being tracked */
  bug: BugProperties
  /** A product roadmap grouping features and themes over a planning horizon */
  roadmap: RoadmapProperties
  /** A single item on a roadmap: a feature, epic, or theme with timing */
  roadmap_item: RoadmapItemProperties
  /** A thematic grouping used to cluster work on the roadmap, around the customer problem */
  roadmap_theme: RoadmapThemeProperties
  /** A changelog entry recording what shipped in a release */
  changelog: ChangelogProperties

  // ─── Foundations ─────────────────────────────────────────────────────────────
  /** A governed specification (query language, protocol, format) products implement, expose, or conform to */
  specification: SpecificationProperties
  /** A foundational compositional unit a specification defines (a block, a reference, a query value) */
  primitive: PrimitiveProperties
  // ─── Engineering ─────────────────────────────────────────────────────────────
  /** A bounded context defining the scope of a domain model */
  bounded_context: BoundedContextProperties
  /** A deployable service within the system architecture */
  service: ServiceProperties
  /** A domain event signalling something meaningful happened in the system */
  domain_event: DomainEventProperties
  /** An API contract specifying the interface between services or clients */
  api_contract: ApiContractProperties
  /** A technical debt item, present when debt is being tracked for remediation */
  technical_debt_item: TechnicalDebtItemProperties
  /** A feature flag controlling runtime behaviour without deployment */
  feature_flag: FeatureFlagProperties
  /** A deployment record, present when a specific release was deployed */
  deployment: DeploymentProperties
  /** A DDD aggregate: a cluster of domain objects with a consistency boundary */
  aggregate: AggregateProperties
  /** A domain entity: an object with identity that changes over time */
  domain_entity: DomainEntityProperties
  /** A value object: an immutable domain concept identified by its attributes */
  value_object: ValueObjectProperties
  /** A command representing an intent to change system state */
  command: CommandProperties
  /** A read model: a query-optimised projection of domain state */
  read_model: ReadModelProperties
  /** A specific API endpoint, present when endpoint-level tracking is needed */
  api_endpoint: ApiEndpointProperties
  /** A database schema (table structure, constraints, and migration status) */
  database_schema: DatabaseSchemaProperties
  /** A message queue topic or channel */
  queue_topic: QueueTopicProperties
  /** A build artifact produced by the CI pipeline */
  build_artifact: BuildArtifactProperties
  /** A code repository, present when repo-level tracking is needed */
  code_repository: CodeRepositoryProperties
  /** A library dependency tracked for version and licence compliance */
  library_dependency: LibraryDependencyProperties
  /** An integration pattern documenting how two systems communicate */
  integration_pattern: IntegrationPatternProperties
  /** An external API consumed by the product */
  external_api: ExternalApiProperties
  /** A data flow tracing how data moves between components */
  data_flow: DataFlowProperties
  /** An investigation into a production issue or unexpected behaviour */
  investigation: InvestigationProperties
  /** The root cause identified during an incident investigation */
  root_cause: RootCauseProperties
  /** A symptom observed during an incident, present before root cause is known */
  symptom: SymptomProperties
  /** A fix applied to resolve a bug or incident */
  fix: FixProperties

  // ─── Growth ──────────────────────────────────────────────────────────────────
  /** A conversion funnel tracking user progression through a key flow */
  funnel: FunnelProperties
  /** A single step within a conversion funnel */
  funnel_step: FunnelStepProperties
  /** An acquisition channel bringing new users or leads into the product */
  acquisition_channel: AcquisitionChannelProperties
  /** A growth campaign driving acquisition, activation, or retention */
  growth_campaign: GrowthCampaignProperties
  /** A user cohort grouped by shared behaviour or acquisition date */
  cohort: CohortProperties
  /** A behavioural segment defined by in-product actions */
  behavioral_segment: BehavioralSegmentProperties
  /** A growth loop: a self-reinforcing cycle that compounds user or revenue growth */
  growth_loop: GrowthLoopProperties
  /** A variant in an A/B or multivariate experiment */
  variant: VariantProperties
  /** An attribution model defining how credit is assigned to acquisition channels */
  attribution_model: AttributionModelProperties

  // ─── Business Model ──────────────────────────────────────────────────────────
  /** The overall business model, present when BMC-level structure is tracked */
  business_model: BusinessModelProperties
  /** A value proposition: the core promise made to a customer segment */
  value_proposition: ValuePropositionProperties
  /** A revenue stream: a mechanism through which the product earns money */
  revenue_stream: RevenueStreamProperties
  /** A pricing tier defining what a customer gets at a given price point */
  pricing_tier: PricingTierProperties
  /** The cost structure (fixed and variable costs underpinning the business model) */
  cost_structure: CostStructureProperties
  /** Unit economics: per-unit revenue, cost, and margin metrics */
  unit_economics: UnitEconomicsProperties
  /** A partnership: a strategic relationship with an external organisation */
  partnership: PartnershipProperties
  /** A key resource required to deliver value (people, IP, infrastructure) */
  key_resource: KeyResourceProperties
  /** A key activity the business must perform to deliver its value proposition */
  key_activity: KeyActivityProperties
  /** A customer relationship type: how the business interacts with a segment */
  customer_relationship: CustomerRelationshipProperties
  /** A distribution channel through which value reaches the customer */
  distribution_channel: DistributionChannelProperties

  // ─── Go-To-Market ────────────────────────────────────────────────────────────
  /** The GTM strategy, present when go-to-market planning is formalised */
  gtm_strategy: GtmStrategyProperties
  /** An ideal customer profile defining the best-fit buyer */
  ideal_customer_profile: IdealCustomerProfileProperties
  /** A positioning statement defining where the product sits in the market */
  positioning: PositioningProperties
  /** A messaging framework (headlines, value pillars, and proof points) */
  messaging: MessagingProperties
  /** A product launch, present when a coordinated launch is being planned */
  launch: LaunchProperties
  /** A content strategy defining themes, formats, and channels */
  content_strategy: ContentStrategyProperties
  /** A sales motion: the repeatable process used to close deals */
  sales_motion: SalesMotionProperties
  /** A competitive battle card for use by the sales team */
  competitive_battle_card: CompetitiveBattleCardProperties
  /** A demand generation programme driving pipeline */
  demand_gen_program: DemandGenProgramProperties
  /** A sales territory defining geographic or segment-based coverage */
  territory: TerritoryProperties
  /** A common sales objection raised by prospects */
  objection: ObjectionProperties
  /** A rebuttal to a specific sales objection */
  rebuttal: RebuttalProperties
  /** A proof point substantiating a claim in messaging or sales */
  proof_point: ProofPointProperties

  // ─── Team & Organisation ─────────────────────────────────────────────────────
  /** A team: a group of people working on a shared scope */
  team: TeamProperties
  /** A role: a function or responsibility within the team or organisation */
  role: RoleProperties
  /** A stakeholder with interest in or influence over the product */
  stakeholder: StakeholderProperties
  /** A named, accountable individual, distinct from `stakeholder` (interested party) and `role` (responsibility slot) */
  person: PersonProperties
  /** An OKR set at the team level */
  team_okr: TeamOkrProperties
  /** A retrospective, present when team reflections are being tracked */
  retrospective: RetrospectiveProperties
  /** A cross-team dependency that may block delivery */
  dependency: DependencyProperties
  /** A department or organisational unit */
  department: DepartmentProperties
  /** A skill tracked for hiring, development, or capacity planning */
  skill: SkillProperties
  /** A recurring team ceremony (standup, sprint review, planning, etc.) */
  ceremony: CeremonyProperties
  /** A capacity plan mapping team bandwidth to upcoming work */
  capacity_plan: CapacityPlanProperties

  // ─── Data & Analytics ────────────────────────────────────────────────────────
  /** A data source feeding the analytics or data platform */
  data_source: DataSourceProperties
  /** An event schema defining the structure of a tracked event */
  event_schema: EventSchemaProperties
  /** A dashboard, present when a reporting surface is being tracked */
  dashboard: DashboardProperties
  /** A data model covering entity relationships and schema structure */
  data_model: DataModelProperties
  /** A data quality rule defining expectations on a dataset or field */
  data_quality_rule: DataQualityRuleProperties
  /** A data product: a curated, discoverable dataset made available to consumers */
  data_product: DataProductProperties
  /** A data pipeline moving or transforming data between systems */
  data_pipeline: DataPipelineProperties
  /** A data lineage record tracing data from source to destination */
  data_lineage: DataLineageProperties
  /** A glossary term defining a business or technical concept */
  glossary_term: GlossaryTermProperties
  /** A data domain grouping related data assets under a common owner */
  data_domain: DataDomainProperties
  /** A report: a scheduled or on-demand analytical output */
  report: ReportProperties

  // ─── Content & Knowledge ─────────────────────────────────────────────────────
  /** A content piece (blog post, video, podcast, whitepaper, or case study) */
  content_piece: ContentPieceProperties
  /** A knowledge base article for customers, developers, or internal teams */
  knowledge_base_article: KnowledgeBaseArticleProperties
  /** A brand asset (logo, illustration, photo, or video) */
  brand_asset: BrandAssetProperties
  /** A prompt template used for AI-assisted workflows */
  prompt_template: PromptTemplateProperties
  /** A content calendar organising publishing activity over a period */
  content_calendar: ContentCalendarProperties
  /** A content theme grouping related content under a strategic topic */
  content_theme: ContentThemeProperties
  /** A documentation template defining structure for a class of documents */
  documentation_template: DocumentationTemplateProperties
  /** A document entity: provenance container linking to a source file */
  document: DocumentProperties

  // ─── Legal ───────────────────────────────────────────────────────────────────
  /** A legal entity (company, subsidiary, or contracting party) */
  legal_entity: LegalEntityProperties
  /** An intellectual property asset (patent, trademark, copyright, or trade secret) */
  ip_asset: IpAssetProperties
  /** A contract between the company and an external party */
  contract: ContractProperties
  /** A specific clause within a contract, present when clause-level tracking is needed */
  contract_clause: ContractClauseProperties
  /** A privacy policy document, present when policy tracking is active */
  privacy_policy: PrivacyPolicyProperties

  // ─── Compliance ──────────────────────────────────────────────────────────────
  /** A compliance requirement from a regulation, standard, or customer contract */
  compliance_requirement: ComplianceRequirementProperties
  /** A risk: a potential event with negative impact on the product or business */
  risk: RiskProperties
  /** A data contract defining agreed schema and SLAs between producer and consumer */
  data_contract: DataContractProperties
  /** An audit log policy defining retention and access rules */
  audit_log_policy: AuditLogPolicyProperties
  /** A compliance framework being adhered to (SOC 2, ISO 27001, GDPR, etc.) */
  compliance_framework: ComplianceFrameworkProperties
  /** A security audit, present when a formal review has been conducted */
  security_audit: SecurityAuditProperties

  // ─── DevOps ──────────────────────────────────────────────────────────────────
  /** A service level indicator: a specific measurement of service behaviour */
  service_level_indicator: ServiceLevelIndicatorProperties
  /** A service level objective: a target range for an SLI */
  service_level_objective: ServiceLevelObjectiveProperties
  /** An error budget derived from an SLO, present when reliability is tracked */
  error_budget: ErrorBudgetProperties
  /** An incident: a production event requiring response */
  incident: IncidentProperties
  /** A postmortem written after an incident is resolved */
  postmortem: PostmortemProperties
  /** A runbook documenting how to respond to an operational scenario */
  runbook: RunbookProperties
  /** A monitor watching a system metric or log pattern */
  monitor: MonitorProperties
  /** An alert rule defining when a monitor fires a notification */
  alert_rule: AlertRuleProperties
  /** A CI pipeline configuration (build, test, and deploy stages) */
  ci_pipeline: CiPipelineProperties
  /** A release strategy defining how changes are deployed (blue-green, canary, etc.) */
  release_strategy: ReleaseStrategyProperties
  /** An on-call rotation assigning responders to incidents by schedule */
  on_call_rotation: OnCallRotationProperties
  /** An infrastructure component (server, container, network resource, etc.) */
  infrastructure_component: InfrastructureComponentProperties

  // ─── Security ────────────────────────────────────────────────────────────────
  /** A threat model documenting attack surfaces and adversary assumptions */
  threat_model: ThreatModelProperties
  /** A specific threat identified within a threat model */
  threat: ThreatProperties
  /** A vulnerability: a known weakness that could be exploited */
  vulnerability: VulnerabilityProperties
  /** A security control mitigating one or more threats */
  security_control: SecurityControlProperties
  /** A security policy governing how the system or team handles a security domain */
  security_policy: SecurityPolicyProperties
  /** A penetration test, present when external security testing is tracked */
  penetration_test: PenetrationTestProperties
  /** A security review of a feature, service, or architecture change */
  security_review: SecurityReviewProperties
  /** A data classification label applied to a dataset or field */
  data_classification: DataClassificationProperties
  /** An access policy defining who can do what on which resource */
  access_policy: AccessPolicyProperties

  // ─── Accessibility ───────────────────────────────────────────────────────────
  /** An accessibility standard the product is conforming to (WCAG 2.1 AA, etc.) */
  a11y_standard: A11yStandardProperties
  /** A specific accessibility guideline derived from a standard */
  a11y_guideline: A11yGuidelineProperties
  /** An accessibility audit, present when a formal review has been run */
  a11y_audit: A11yAuditProperties
  /** An accessibility issue found during audit or user research */
  a11y_issue: A11yIssueProperties
  /** An accessibility annotation on a design or component */
  a11y_annotation: A11yAnnotationProperties

  // ─── Quality Assurance ───────────────────────────────────────────────────────
  /** A test suite grouping related test cases */
  test_suite: TestSuiteProperties
  /** A test case: a single scenario with expected inputs and outputs */
  test_case: TestCaseProperties
  /** A QA session, present when exploratory testing is being tracked */
  qa_session: QaSessionProperties
  /** A regression test ensuring previously fixed behaviour does not break */
  regression_test: RegressionTestProperties
  /** A test coverage report measuring how much code is exercised by tests */
  test_coverage_report: TestCoverageReportProperties
  /** A test environment configuration used to run a test suite */
  test_environment: TestEnvironmentProperties
  /** The result of a test run (pass, fail, or flaky) */
  test_result: TestResultProperties

  // ─── Customer Feedback ───────────────────────────────────────────────────────
  /** A feedback programme, present when structured customer feedback is collected */
  feedback_program: FeedbackProgramProperties
  /** A feature request submitted by a customer or prospect */
  feature_request: FeatureRequestProperties
  /** A vote on a feature request, present when voting is tracked */
  feedback_vote: FeedbackVoteProperties
  /** An NPS campaign, present when Net Promoter Score is being measured */
  nps_campaign: NpsCampaignProperties
  /** A user advisory board: a formal group of customers shaping product direction */
  user_advisory_board: UserAdvisoryBoardProperties
  /** A beta programme, present when pre-release access is being managed */
  beta_program: BetaProgramProperties
  /** A feedback theme clustering related requests or complaints */
  feedback_theme: FeedbackThemeProperties

  // ─── Pricing ─────────────────────────────────────────────────────────────────
  /** The pricing strategy, present when pricing approach is formalised */
  pricing_strategy: PricingStrategyProperties
  /** A discount strategy defining when and how discounts are applied */
  discount_strategy: DiscountStrategyProperties
  /** A trial configuration, present when a free trial or pilot is offered */
  trial_config: TrialConfigProperties
  /** A paywall: the gate between free and paid access */
  paywall: PaywallProperties

  // ─── AI & Machine Learning ───────────────────────────────────────────────────
  /** An AI model used by or integrated into the product */
  ai_model: AiModelProperties
  /** A versioned prompt, present when prompt engineering is tracked */
  prompt_version: PromptVersionProperties
  /** An evaluation benchmark defining pass/fail criteria for a model */
  eval_benchmark: EvalBenchmarkProperties
  /** A single evaluation run against a benchmark */
  eval_run: EvalRunProperties
  /** An AI cost tracker monitoring token usage and spend */
  ai_cost_tracker: AiCostTrackerProperties
  /** A hallucination report, present when model output accuracy is audited */
  hallucination_report: HallucinationReportProperties
  /** An AI guardrail: a safety or quality constraint applied to model output */
  ai_guardrail: AiGuardrailProperties
  /** A model comparison evaluating two or more models on the same benchmark */
  model_comparison: ModelComparisonProperties
  /** An AI experiment testing a model, prompt, or pipeline change */
  ai_experiment: AiExperimentProperties
  /** A dataset used to train, fine-tune, or evaluate a model */
  ai_dataset: AiDatasetProperties
  /** A trace capturing inputs, outputs, and latency for a model invocation */
  ai_trace: AiTraceProperties

  // ─── Workflows & Agents ──────────────────────────────────────────────────────
  /** A workflow template defining a reusable multi-step process */
  workflow_template: WorkflowTemplateProperties
  /** A workflow run: a live execution of a workflow template */
  workflow_run: WorkflowRunProperties
  /** An agent definition: the configuration and capabilities of an AI agent */
  agent_definition: AgentDefinitionProperties
  /** An agent session: a single interaction run by an agent */
  agent_session: AgentSessionProperties
  /** A review gate requiring human approval before a workflow continues */
  review_gate: ReviewGateProperties
  /** An approval record: the decision made at a review gate */
  approval_record: ApprovalRecordProperties
  /** A skill available to an agent: a named, callable capability */
  agent_skill: AgentSkillProperties
  /** A hook executed before or after a workflow step */
  agent_hook: AgentHookProperties
  /** An artifact produced by a workflow run */
  workflow_artifact: WorkflowArtifactProperties
  /** A task assigned to an agent within a workflow run */
  agent_task: AgentTaskProperties

  // ─── Portfolio & Organisation ─────────────────────────────────────────────────
  /** An organisation: the company or entity that owns a portfolio of products */
  organization: OrganizationProperties
  /** A portfolio grouping multiple products under a common strategy */
  portfolio: PortfolioProperties
  /** A product area: a named section of the product with its own ownership */
  product_area: ProductAreaProperties

  // ─── Workspace ──────────────────────────────────────────────────────────────
  /** A workspace: the collaboration boundary for a team or organisation */
  workspace: WorkspaceProperties
  /** A framework exercise: one run of a framework over a set of entities */
  framework_exercise: FrameworkExerciseProperties

  // ─── Sales ───────────────────────────────────────────────────────────────────
  /** An account: a company or organisation in the CRM */
  account: AccountProperties
  /** A contact: an individual person at an account */
  contact: ContactProperties
  /** A lead: an unqualified prospect entering the sales funnel */
  lead: LeadProperties
  /** A deal: a qualified sales opportunity being pursued */
  deal: DealProperties
  /** The sales pipeline, present when pipeline-level metadata is tracked */
  pipeline_sales: PipelineSalesProperties
  /** A stage within the sales pipeline */
  pipeline_stage: PipelineStageProperties
  /** A quote document sent to a prospect */
  quote_document: QuoteDocumentProperties
  /** A subscription: a recurring revenue relationship with a customer */
  subscription: SubscriptionProperties
  /** An invoice issued to a customer */
  invoice: InvoiceProperties
  /** A sales forecast, present when revenue prediction is tracked */
  forecast: ForecastProperties

  // ─── Program Management ──────────────────────────────────────────────────────
  /** A programme grouping related projects under a strategic objective */
  program: ProgramProperties
  /** A project: a time-boxed initiative with a defined scope */
  project: ProjectProperties
  /** A milestone marking a significant point in a project or release */
  milestone: MilestoneProperties
  /** A risk register capturing identified risks and mitigations */
  risk_register: RiskRegisterProperties
  /** A change request, present when a formal change process is followed */
  change_request: ChangeRequestProperties
  /** A deliverable: a tangible output committed to a stakeholder */
  deliverable: DeliverableProperties
  /** A resource allocation mapping team capacity to projects */
  resource_allocation: ResourceAllocationProperties
  /** A status report summarising progress against plan */
  status_report: StatusReportProperties

  // ─── Marketing ───────────────────────────────────────────────────────────────
  /** The marketing strategy, present when marketing is formalised at the programme level */
  marketing_strategy: MarketingStrategyProperties
  /** A marketing channel: a medium used to reach the target audience */
  marketing_channel: MarketingChannelProperties
  /** A marketing campaign plan, present when a campaign is being planned */
  marketing_campaign_plan: MarketingCampaignPlanProperties
  /** An email sequence: a series of automated emails sent to a segment */
  email_sequence: EmailSequenceProperties
  /** A social post, present when social content is being planned or tracked */
  social_post: SocialPostProperties
  /** An SEO keyword being targeted in content or paid search */
  seo_keyword: SeoKeywordProperties
  /** An ad creative: copy and visual used in a paid media placement */
  ad_creative: AdCreativeProperties
  /** A press release, present when media outreach is being tracked */
  press_release: PressReleaseProperties
  /** An event (physical or virtual) being planned or tracked */
  event: EventProperties
  /** A community initiative building engagement with users or prospects */
  community_initiative: CommunityInitiativeProperties

  // ─── Customer Success ────────────────────────────────────────────────────────
  /** A support ticket raised by a customer */
  support_ticket: SupportTicketProperties
  /** Customer feedback collected outside a formal research study */
  customer_feedback: CustomerFeedbackProperties
  /** A churn reason explaining why a customer cancelled */
  churn_reason: ChurnReasonProperties
  /** A customer health score, present when account health is tracked */
  customer_health_score: CustomerHealthScoreProperties
  /** A playbook: a documented response to a customer scenario */
  playbook: PlaybookProperties
  /** A service level agreement defining commitments to a customer */
  service_level_agreement: ServiceLevelAgreementProperties
  /** A stage in the customer journey post-purchase */
  customer_journey_stage: CustomerJourneyStageProperties
  /** A touchpoint where the customer interacts with the product or team */
  touchpoint: TouchpointProperties
  /** A success milestone marking a meaningful achievement in the customer lifecycle */
  success_milestone: SuccessMilestoneProperties
  /** A service blueprint mapping frontstage and backstage activities */
  service_blueprint: ServiceBlueprintProperties

  // ─── Localisation ────────────────────────────────────────────────────────────
  /** A locale: a language and region combination supported by the product */
  locale: LocaleProperties
  /** A translation key mapping a string identifier to localised text */
  translation_key: TranslationKeyProperties
  /** A translation bundle: a collection of keys for a single locale */
  translation_bundle: TranslationBundleProperties
  /** A locale configuration defining date, number, and currency formatting */
  locale_config: LocaleConfigProperties
  /** A cultural adaptation: a locale-specific change beyond string translation */
  cultural_adaptation: CulturalAdaptationProperties
  /** A regional pricing configuration adjusting price for a locale */
  regional_pricing: RegionalPricingProperties

  // ─── Customer Education ──────────────────────────────────────────────────────
  /** An education programme: a structured curriculum for customer learning */
  education_program: EducationProgramProperties
  /** A tutorial walking a user through a feature or workflow */
  tutorial: TutorialProperties
  /** A walkthrough: an in-product guided tour */
  walkthrough: WalkthroughProperties
  /** A webinar: a live or recorded educational session */
  webinar: WebinarProperties
  /** A certification awarded upon completing a learning path */
  certification: CertificationProperties
  /** A help video: a short screencast explaining a feature */
  help_video: HelpVideoProperties
  /** A learning path: a sequenced collection of tutorials, videos, and assessments */
  learning_path: LearningPathProperties

  // ─── Partners & Ecosystem ────────────────────────────────────────────────────
  /** A partner programme defining tiers, benefits, and requirements */
  partner_program: PartnerProgramProperties
  /** A partner tier within a programme (Bronze, Silver, Gold, etc.) */
  partner_tier: PartnerTierProperties
  /** The API ecosystem: developer community and integration surface */
  api_ecosystem: ApiEcosystemProperties
  /** A marketplace listing, present when the product is listed on a platform */
  marketplace_listing: MarketplaceListingProperties
  /** A developer portal providing documentation and sandbox access */
  developer_portal: DeveloperPortalProperties
  /** An integration partner building on top of the product API */
  integration_partner: IntegrationPartnerProperties
  /** A partner revenue share arrangement defining commercial terms */
  partner_revenue_share: PartnerRevenueShareProperties
}

/** A fully typed UPG node. `UPGBaseNode` narrowed to a specific entity type.
 *
 * `T` is an entity-type literal from `UPGPropertyMap`. When supplied, it
 * constrains `type` to that literal and narrows `properties` to the matching
 * `*Properties` interface. When omitted, `T` defaults to the full union: the
 * node accepts any entity type and `properties` widens to the union of all
 * domain property shapes.
 *
 * @example
 * // Narrowed by T: `type` is locked to 'feature' and `properties` to
 * // FeatureProperties.
 * const featureNode: UPGNode<'feature'> = {
 *   id: 'feat-1',
 *   type: 'feature',
 *   title: 'Dark mode',
 *   properties: { priority: 'high' },
 * }
 *
 * @example
 * // A different instantiation of T: the generic lets a single helper
 * // signature return the correctly typed node for any entity type.
 * const personaNode: UPGNode<'persona'> = {
 *   id: 'p-1',
 *   type: 'persona',
 *   title: 'Solo founder',
 *   properties: { is_primary: true, experience_level: 'intermediate' },
 * }
 */
export type UPGNode<T extends keyof UPGPropertyMap = keyof UPGPropertyMap> = UPGBaseNode & {
  type: T
  properties?: UPGPropertyMap[T]
}

