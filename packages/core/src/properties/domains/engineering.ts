/**
 * UPG Property Schemas: Engineering Domain.
 * Service, BoundedContext, DomainEvent, ApiContract, TechnicalDebtItem,
 * FeatureFlag, Deployment, DDD building blocks, Investigation, RootCause,
 * Symptom, Fix.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { CauseConfidence, Confidence, Duration, FrequencyRating, ISODate, ISODateTime, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// ENGINEERING LAYER
// ---------------------------------------------------------------------------

/** DDD bounded context.
 *
 * @example
 * const properties: BoundedContextProperties = {
 *   team_owner: 'platform-team',
 *   tech_stack: ['TypeScript', 'Postgres', 'Redis'],
 *   ubiquitous_language: 'Order, Customer, LineItem, Fulfilment, Invoice.',
 * }
 */
export interface BoundedContextProperties {
  /** Owning team */
  team_owner?: string
  /** Technologies used within this context */
  tech_stack?: string[]
  /** Key terms and their definitions */
  ubiquitous_language?: string
}

/** Service or microservice.
 *
 * @example
 * const properties: ServiceProperties = {
 *   service_type: 'web',
 *   tech_stack: ['TypeScript', 'Postgres', 'Redis'],
 * }
 */
export interface ServiceProperties {
  /** Functional classification. Expanded from Backstage's component type vocabulary. */
  service_type?: 'web' | 'api' | 'worker' | 'db' | 'queue' | 'library' | 'mobile' | 'docs' | 'lambda'
  /** Technologies used (e.g. ["TypeScript", "Postgres", "Redis"]) */
  tech_stack?: string[]
  /** Owning person or team. Backstage marks this required; strongly recommended. */
  owner?: string
  /**
   * Service maturity. Answers "how mature is it?".
   * `experimental` = early-stage. `production` = battle-tested.
   * `deprecated` = being phased out.
   */
  lifecycle?: 'experimental' | 'production' | 'deprecated'
  /** Free-form filter tags (e.g. ["payments", "critical-path", "team-alpha"]). */
  tags?: string[]
  /** Named URLs for documentation, dashboards, runbooks. */
  links?: Array<{ title: string; url: string }>
}

/** Domain event in an event-driven architecture.
 *
 * @example
 * const properties: DomainEventProperties = {
 *   event_name: 'node.created',
 *   payload_schema: 'https://schemas.entopo.app/events/node-created.v1.json',
 *   triggered_by: 'user-signup',
 * }
 */
export interface DomainEventProperties {
  /** Event name (e.g. "OrderPlaced") */
  event_name?: string
  /** Payload schema or shape */
  payload_schema?: string
  /** What triggers this event */
  triggered_by?: string
}

/** API contract.
 *
 * @example
 * const properties: ApiContractProperties = {
 *   spec_url: 'https://unifiedproductgraph.org/spec/v0.2',
 *   protocol: 'REST',
 *   version: '0.3.1',
 * }
 */
export interface ApiContractProperties {
  /** URL of the specification document */
  spec_url?: string
  /** Communication protocol */
  protocol?: 'REST' | 'GraphQL' | 'gRPC' | 'AsyncAPI' | 'SOAP' | 'WebSocket' | 'MQTT' | 'other'
  /** API version */
  version?: string
  /** Maintaining person or team. */
  owner?: string
}

/** Technical debt item.
 *
 * @example
 * const properties: TechnicalDebtItemProperties = {
 *   debt_type: 'code',
 *   severity: 4,
 *   effort_to_fix: 4,
 * }
 */
export interface TechnicalDebtItemProperties {
  /**
   * Type of debt.
   * `code` = quality issues. `architecture` = structural problems.
   * `security` = unpatched vulnerabilities. `test` = missing/flaky tests.
   * `docs` = missing or stale documentation. `dependency` = outdated packages.
   */
  debt_type?: 'code' | 'architecture' | 'security' | 'test' | 'docs' | 'dependency'
  /** Severity on system or team. Requires human evaluation. */
  severity?: UPGAssessment
  /** Estimated effort to resolve. Requires team knowledge of the codebase. */
  effort_to_fix?: UPGAssessment
  /** Owning person or team responsible for paydown. */
  owner?: string
  /**
   * Codebase location, service, or module.
   * @example "apps/graph/src/canvas/", "UserService", "auth module"
   */
  affected_area?: string
  /**
   * Ongoing cost of leaving it unresolved (the "interest" in the financial metaphor).
   * @example "~2h/sprint of workarounds", "blocks type-safe refactor of checkout"
   */
  interest?: string
  /**
   * Origin of the debt.
   * `deliberate` = conscious decision to ship something imperfect (prudent or reckless).
   * `inadvertent` = discovered after the fact.
   * Based on Fowler's Technical Debt Quadrant.
   */
  intentionality?: 'deliberate' | 'inadvertent'
}

/** Feature flag.
 *
 * @example
 * const properties: FeatureFlagProperties = {
 *   key: 'cta.primary.signup',
 *   flag_status: 'on',
 *   rollout_pct: 42,
 * }
 */
export interface FeatureFlagProperties {
  /** Required. Stable flag key used in code (e.g. "new-checkout-flow"). */
  key: string
  /**
   * Activation state.
   * `on` = enabled for all. `off` = disabled for all.
   * `rollout` = partial via targeting_rules.
   */
  flag_status?: 'on' | 'off' | 'rollout'
  /** Percentage enabled (0–100). Meaningful when `flag_status === 'rollout'`. */
  rollout_pct?: number
  /** Human-readable targeting rules. Full rule evaluation happens in the flag service. */
  targeting_rules?: string
  /** Owning person or team responsible for the flag's lifecycle. */
  owner?: string
  /**
   * Lifecycle classification.
   * `temporary` = should be removed after rollout (kill switch, gradual rollout).
   * `permanent` = long-lived feature gate (entitlement flag).
   * `experiment` = A/B test with a defined end condition.
   */
  flag_type?: 'temporary' | 'permanent' | 'experiment'
  /**
   * ISO date after which this flag should be cleaned up.
   * A temporary flag without an `expiry_date` is a code smell.
   */
  expiry_date?: ISODate
  /** Creation date. Useful for flag age and stale-flag detection. */
  created_date?: ISODate
}

/** Deployment.
 *
 * @example
 * const properties: DeploymentProperties = {
 *   environment: 'prod',
 *   timestamp: '2026-04-17T09:00:00Z',
 *   deploy_status: 'success',
 * }
 */
export interface DeploymentProperties {
  /** Target environment */
  environment?: 'dev' | 'staging' | 'prod'
  /** ISO timestamp */
  timestamp?: string
  /** Current status */
  deploy_status?: 'success' | 'failure' | 'rolling'
  /** Git SHA of the deployed commit */
  sha?: string
  /** Wall-clock duration in seconds. Tracks deployment speed trends. */
  duration_seconds?: number
  /** Triggering person or system. */
  deployer?: string
}

// ─── DDD Types ────────────────────────────────────────────────────────────────

/** DDD aggregate.
 *
 * @example
 * const properties: AggregateProperties = {
 *   aggregate_root: 'Order',
 *   invariants: 'Order total never negative; line items non-empty.',
 * }
 */
export interface AggregateProperties {
  /** Root entity */
  aggregate_root?: string
  /** Enforced business rules */
  invariants?: string
}

/** DDD domain entity.
 *
 * @example
 * const properties: DomainEntityProperties = {
 *   entity_identity: 'aggregate-root',
 *   lifecycle: 'untested → testing → resolved',
 * }
 */
export interface DomainEntityProperties {
  /** Identifier shape (e.g. "UUID", "email") */
  entity_identity?: string
  /** Lifecycle description */
  lifecycle?: string
}

/** DDD value object.
 *
 * @example
 * const properties: ValueObjectProperties = {
 *   immutable: true,
 *   equality_fields: ['id', 'version'],
 * }
 */
export interface ValueObjectProperties {
  /** Whether immutable */
  immutable?: boolean
  /** Fields used for equality */
  equality_fields?: string
}

/** CQRS command.
 *
 * @example
 * const properties: CommandProperties = {
 *   command_handler: 'OrderService.placeOrder',
 *   validation_rules: 'title required; description max 2000 chars; tags must be lower-kebab.',
 * }
 */
export interface CommandProperties {
  /** Processing handler */
  command_handler?: string
  /** Pre-execution validation rules */
  validation_rules?: string
}

/** CQRS read model / projection.
 *
 * @example
 * const properties: ReadModelProperties = {
 *   projection_source: 'order_events',
 *   refresh_strategy: 'sync',
 * }
 */
export interface ReadModelProperties {
  /** Source event or aggregate */
  projection_source?: string
  /** How the model stays current */
  refresh_strategy?: 'sync' | 'async' | 'cron' | 'on_demand'
}

/** API endpoint.
 *
 * @example
 * const properties: ApiEndpointProperties = {
 *   http_method: 'GET',
 *   path: '/docs/spec/v0.2',
 *   auth_required: true,
 * }
 */
export interface ApiEndpointProperties {
  /** HTTP method */
  http_method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** URL path (e.g. "/api/v1/products/:id") */
  path?: string
  /** Whether authentication is required */
  auth_required?: boolean
  /** Rate limit description (e.g. "100/min") */
  rate_limit?: string
}

/** Database schema.
 *
 * @example
 * const properties: DatabaseSchemaProperties = {
 *   db_type: 'postgres',
 *   schema_version: '1.3.0',
 *   migration_status: 'current',
 * }
 */
export interface DatabaseSchemaProperties {
  /** Engine */
  db_type?: 'postgres' | 'mysql' | 'mongodb' | 'redis' | 'other'
  /** Current schema version */
  schema_version?: string
  /** Pending-migration status */
  migration_status?: 'current' | 'pending' | 'failed'
  /** Owning person or team responsible for design and migrations. */
  owner?: string
  /** Tables or collections in this schema. Useful for migration scope estimation. */
  table_count?: number
}

/** Message queue or topic.
 *
 * @example
 * const properties: QueueTopicProperties = {
 *   queue_type: 'sqs',
 *   retention_hours: 42,
 *   consumer_groups: ['analytics', 'search-indexer'],
 * }
 */
export interface QueueTopicProperties {
  /** Technology */
  queue_type?: 'sqs' | 'kafka' | 'rabbitmq' | 'pubsub' | 'other'
  /** Message retention in hours */
  retention_hours?: number
  /** Consumer group names */
  consumer_groups?: string
  /**
   * Whether a dead-letter queue is configured. Absent or `false` flags a message-loss risk.
   * A DLQ is critical for debugging failed message processing.
   */
  has_dead_letter_queue?: boolean
}

/** Build artifact.
 *
 * @example
 * const properties: BuildArtifactProperties = {
 *   artifact_type: 'docker_image',
 *   version: '0.3.1',
 *   size: 120,
 * }
 */
export interface BuildArtifactProperties {
  /** Type */
  artifact_type?: 'docker_image' | 'npm_package' | 'binary' | 'static_assets' | 'other'
  /** Version */
  version?: string
  /** Human-readable size (e.g. "12.4 MB") */
  size?: string
  /** Registry or storage location */
  registry?: string
  /** URL of the producing CI/CD build run (GitHub Actions, CircleCI, etc.). */
  build_url?: string
}

/** Code repository.
 *
 * @example
 * const properties: CodeRepositoryProperties = {
 *   repo_url: 'https://github.com/arkheiev/entopo',
 *   default_branch: 'main',
 *   language: 'en-GB',
 * }
 */
export interface CodeRepositoryProperties {
  /** URL */
  repo_url?: string
  /** Default branch */
  default_branch?: string
  /** Primary programming language */
  language?: string
  /** Current CI status */
  ci_status?: 'passing' | 'failing' | 'unknown'
  /**
   * Visibility.
   * `internal` = visible within the organisation only (GitHub internal repos).
   */
  visibility?: 'public' | 'private' | 'internal'
}

/** Library or package dependency.
 *
 * @example
 * const properties: LibraryDependencyProperties = {
 *   dep_version: '^0.3.1',
 *   dep_type: 'runtime',
 *   license: 'MIT',
 * }
 */
export interface LibraryDependencyProperties {
  /** Installed version */
  dep_version?: string
  /** Dependency classification */
  dep_type?: 'runtime' | 'dev' | 'peer' | 'optional'
  /** SPDX license identifier */
  license?: string
  /** Whether a newer version is available */
  is_outdated?: boolean
  /** Known vulnerabilities in the installed version. Populated from npm audit, Snyk, etc. */
  vulnerability_count?: number
}

/** Integration pattern between systems.
 *
 * @example
 * const properties: IntegrationPatternProperties = {
 *   pattern_type: 'api',
 *   protocol: 'https',
 * }
 */
export interface IntegrationPatternProperties {
  /** Type */
  pattern_type?: 'api' | 'event' | 'file' | 'database' | 'webhook'
  /** Communication protocol */
  protocol?: string
}

/** External API dependency.
 *
 * @example
 * const properties: ExternalApiProperties = {
 *   provider: 'anthropic',
 *   base_url: 'https://api.entopo.app/v1',
 *   auth_type: 'api_key',
 * }
 */
export interface ExternalApiProperties {
  /** Provider */
  provider?: string
  /** Base URL */
  base_url?: string
  /** Authentication method */
  auth_type?: 'api_key' | 'oauth2' | 'jwt' | 'basic' | 'none'
  /** Rate limit description */
  rate_limits?: string
  /** Availability */
  api_status?: 'active' | 'deprecated' | 'beta' | 'unavailable'
}

/** Data flow between services.
 *
 * @example
 * const properties: DataFlowProperties = {
 *   trigger: 'User opens the third restricted feature in a session.',
 *   data_type: 'string',
 *   direction: 'unidirectional',
 * }
 */
export interface DataFlowProperties {
  /** What triggers the flow */
  trigger?: string
  /** Type of data transferred */
  data_type?: string
  /** Direction */
  direction?: 'unidirectional' | 'bidirectional'
  /** Communication protocol */
  protocol?: 'rest' | 'graphql' | 'grpc' | 'event' | 'webhook' | 'file'
}

// ─── Investigation cluster ────────────────────────────────────────────────────

/** Active thread of inquiry: debugging, architecture exploration, RCA.
 *
 * Container for root-cause analysis. Binds symptoms (observable behaviour),
 * root causes (structural reasons), and fixes (remediations). Lifecycle is
 * tracked via `UPGBaseNode.status` (canonical lifecycle slot).
 *
 * Per UPG principle P14, structural relationships are edges:
 *   observed signals: `investigation_observes_symptom`
 *   identified cause: `investigation_identifies_root_cause`
 *   planned remediation: `investigation_resolves_via_fix`
 *   parent incident: `incident_triggers_investigation`
 *
 * @example
 * const properties: InvestigationProperties = {
 *   severity: 4,
 *   hypothesis: 'Removing the manual setup step lifts week-one activation by 15%.',
 *   findings: 'Three out of five participants gave up before reaching the canvas.',
 *   started_at: '2026-04-22T09:15:00Z',
 *   resolved_at: '2026-04-26T17:30:00Z',
 *   lead_investigator: 'sam.patel@arkheiev.com',
 *   category: 'activation',
 * }
 */
export interface InvestigationProperties {
  /**
   * Believed severity of the underlying issue. Drives prioritisation across investigations.
   *
   * Canonicalised in v0.4.0: the ad-hoc `'low' | 'medium' | 'high' | 'critical'`
   * shape was replaced by `UPGAssessment` so every "severity" property reports
   * on the same axis. Migration: `low → 2`, `medium → 3`, `high → 4`, `critical → 5`.
   */
  severity?: UPGAssessment
  /** Working hypothesis about the root cause */
  hypothesis?: string
  /** Findings discovered so far */
  findings?: string
  /** ISO timestamp the investigation began */
  started_at?: ISODateTime
  /** ISO timestamp the investigation was concluded. Pairs with `status === 'resolved' | 'abandoned'`. */
  resolved_at?: ISODateTime
  /** Lead investigator (email or handle). Distinct from the team owning the affected service. */
  lead_investigator?: string
  /** Originating session */
  session_id?: string
  /**
   * Kind of issue under investigation. Distinct from `RootCauseProperties.cause_category`,
   * which captures *why something went wrong*.
   */
  category?:
    | 'performance'
    | 'security'
    | 'data_quality'
    | 'reliability'
    | 'cost'
    | 'compliance'
    | 'other'
}

/** Underlying architectural or systemic issue.
 *
 * The structural reason a `symptom` was observable. Captured during an
 * `investigation` and resolved by one or more `fix` entities.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   parent investigation: `investigation_identifies_root_cause`
 *   explained symptoms: `root_cause_causes_symptom`
 *   resolving fixes: `fix_addresses_root_cause`
 *
 * @example
 * const properties: RootCauseProperties = {
 *   cause_category: 'code',
 *   severity: 4,
 *   cause_confidence: 'confirmed',
 *   evidence_summary: 'Trace shows retry loop on 4xx responses; reproduced in staging with synthetic 401.',
 *   category: 'architecture',
 *   affected_area: 'Billing settlement service',
 *   verified: true,
 * }
 */
export interface RootCauseProperties {
  /** Severity (1 = minor, 5 = critical) */
  severity?: UPGAssessment
  /**
   * Closed-enum cause category for RCA reporting and dashboards.
   * Distinct from the legacy free-form `category`.
   */
  cause_category?: 'code' | 'config' | 'process' | 'dependency' | 'data' | 'infrastructure' | 'human_error' | 'other'
  /**
   * Team certainty about this cause.
   * `hypothesised` = educated guess. `likely` = evidence points here.
   * `confirmed` = reproduced.
   *
   * Renamed from `confidence` in v0.4.0 to disambiguate from the entity-wide
   * `UPGAssessment`-typed epistemic confidence used elsewhere. The 3-tier shape
   * stays as a discrete RCA-lifecycle marker.
   */
  cause_confidence?: CauseConfidence
  /** One-paragraph evidence summary. Log lines, traces, repro steps. Detailed artefacts go on linked `evidence` nodes. */
  evidence_summary?: string
  /** Legacy free-form category. Retained for v0.2 baseline; new graphs prefer `cause_category`. */
  category?: 'architecture' | 'design' | 'data' | 'infrastructure' | 'process' | 'dependency' | 'other'
  /** Affected area of the system */
  affected_area?: string
  /** Verified through investigation */
  verified?: boolean
}

/** Observable behaviour produced by a root cause.
 *
 * The visible side of an issue. Upstream of `root_cause` (which explains it)
 * and orthogonal to `bug` (a tracked work item; a symptom is a raw observation).
 *
 * Per UPG principle P14, structural relationships are edges:
 *   observed in: `investigation_observes_symptom`
 *   explained by: `root_cause_causes_symptom`
 *   reported via: `support_ticket_reports_symptom`
 *
 * @example
 * const properties: SymptomProperties = {
 *   symptom_description: 'Users see a blank canvas after refreshing during an unsaved edit.',
 *   first_observed_at: '2026-04-22T14:08:00Z',
 *   severity: 4,
 *   frequency_rating: 'occasional',
 *   affected_users_estimate: 120,
 *   reproducibility: 'intermittent',
 *   steps_to_reproduce: '1. Open canvas. 2. Edit a node. 3. Hard-refresh before autosave fires.',
 * }
 */
export interface SymptomProperties {
  /** Plain-language description of observed behaviour. Primary content of the entity. */
  symptom_description?: string
  /** ISO timestamp first observed in the wild. Pairs with `frequency_rating` and `reproducibility` for triage. */
  first_observed_at?: ISODateTime
  /**
   * Severity for affected users. Independent of how widespread the symptom is.
   *
   * Canonicalised in v0.4.0: the ad-hoc `'low' | 'medium' | 'high' | 'critical'`
   * shape was replaced by `UPGAssessment`.
   */
  severity?: UPGAssessment
  /** Exact observation count in the period. Pairs with `frequency_period` for a precise rate. */
  frequency_count?: number
  /**
   * Recurrence period (ISO-8601 `Duration`).
   * @example 'P7D' (per week), 'P1D' (per day), 'PT1H' (per hour)
   */
  frequency_period?: Duration
  /**
   * Qualitative frequency tier. Canonical replacement for the legacy
   * `'once' | 'sporadic' | 'frequent' | 'constant' | string` shape.
   * Use when an exact rate is unknown.
   * Migration: `once → rare`, `sporadic → occasional`,
   * `frequent → regular`, `constant → constant`.
   */
  frequency_rating?: FrequencyRating
  /** Approximate count of users affected. Snapshot estimate. */
  affected_users_estimate?: number
  /** Reproduction reliability */
  reproducibility?: 'always' | 'frequent' | 'intermittent' | 'rare' | 'once'
  /** Steps to reproduce */
  steps_to_reproduce?: string
}

/** Specific change that resolved an issue.
 *
 * Remediation side of an RCA. The concrete change (code, config, process)
 * that resolved or mitigated a `root_cause`.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   addresses cause: `fix_addresses_root_cause`
 *   relates to investigation: `investigation_resolves_via_fix`
 *   delivered by: `deployment_delivers_fix`
 *   validated by: `test_case_validates_fix` / `regression_test_guards_fix`
 *
 * @example
 * const properties: FixProperties = {
 *   fix_type: 'permanent',
 *   commit: 'a3f1c9e',
 *   files_changed: ['packages/upg-spec/src/shapes/document.ts'],
 *   deployed_at: '2026-04-26T18:02:00Z',
 *   fixed_date: '2026-04-26',
 *   verified: true,
 *   verified_by_test: true,
 * }
 */
export interface FixProperties {
  /**
   * Kind of fix.
   * `hotfix` = urgent patch. `permanent` = proper structural fix.
   * `workaround` = mitigates symptom without addressing root cause; should track a follow-up.
   */
  fix_type?: 'hotfix' | 'permanent' | 'workaround' | 'configuration' | 'process_change'
  /** Git commit SHA */
  commit?: string
  /** Files changed */
  files_changed?: string[]
  /** ISO timestamp landed in the target environment. */
  deployed_at?: ISODateTime
  /** Application date (ISO date). Coarser-grained complement to `deployed_at`. */
  fixed_date?: ISODate
  /** Verified in production */
  verified?: boolean
  /** Validated by an automated regression or integration test. Distinct from `verified` (human judgment). */
  verified_by_test?: boolean
}
