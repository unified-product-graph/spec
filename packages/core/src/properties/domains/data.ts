/**
 * UPG Property Schemas: Data & Analytics Domain.
 * DataSource, EventSchema, Dashboard, DataModel, DataQualityRule,
 * DataProduct, DataPipeline, DataLineage, GlossaryTerm, DataDomain, Report.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence, DataSensitivity, ISODate } from '../primitives.js'

// ---------------------------------------------------------------------------
// DATA & ANALYTICS
// ---------------------------------------------------------------------------

/** DataSource entity.
 *
 * @example
 * const properties: DataSourceProperties = {
 *   source_type: 'database',
 *   connection_status: 'connected',
 *   refresh_cadence: 'hourly',
 * }
 */
export interface DataSourceProperties {
  /** Kind of data source */
  source_type?: 'database' | 'api' | 'event_stream' | 'warehouse'
  /** Current connection health */
  connection_status?: 'connected' | 'disconnected' | 'error'
  /** How often the data is refreshed. Uses the shared `Cadence` scale. */
  refresh_cadence?: Cadence
}

/** EventSchema entity.
 *
 * @example
 * const properties: EventSchemaProperties = {
 *   event_name: 'node.created',
 *   properties: ['title', 'description', 'status'],
 *   trigger_description: 'Fires when a node transitions to the committed state.',
 * }
 */
export interface EventSchemaProperties {
  /** Name of the analytics or tracking event */
  event_name: string
  /** Property names included in the event payload */
  properties?: string[]
  /** Description of what triggers this event */
  trigger_description?: string
}

/** Dashboard entity.
 *
 * @example
 * const properties: DashboardProperties = {
 *   tool: 'looker',
 *   url: 'https://example.com/doc',
 *   audience: 'product-managers',
 * }
 */
export interface DashboardProperties {
  /** Analytics tool hosting this dashboard */
  tool?: 'looker' | 'amplitude' | 'mixpanel' | 'posthog' | 'omni' | 'custom'
  /** URL to the live dashboard */
  url?: string
  /** Intended audience for this dashboard */
  audience?: string
  /** Number of widgets or panels on the dashboard */
  element_count?: number
  /** How often the dashboard data refreshes. Uses the shared `Cadence` scale. */
  refresh_cadence?: Cadence
  /** Number of user-configurable filters */
  filter_count?: number
}

/** DataModel entity.
 *
 * @example
 * const properties: DataModelProperties = {
 *   schema_name: 'public',
 *   database_name: 'entopo_graph',
 *   table_count: 42,
 * }
 */
export interface DataModelProperties {
  /** Name of the schema this model belongs to */
  schema_name?: string
  /** Name of the database containing this model */
  database_name?: string
  /** Number of tables in the model */
  table_count?: number
  /** Total number of columns across all tables */
  column_count?: number
  /** Number of data tests defined for this model */
  test_count?: number
  /** Database paradigm used */
  model_type?: 'relational' | 'document' | 'graph' | 'time_series'
  /** How the model is materialised in the warehouse */
  materialization?: 'view' | 'table' | 'incremental' | 'ephemeral' | 'materialized_view'
  /** Arbitrary metadata key-value pairs */
  meta?: Record<string, unknown>
  /** Free-form categorisation tags */
  tags?: string[]
}

/** DataQualityRule entity.
 *
 * @example
 * const properties: DataQualityRuleProperties = {
 *   rule_type: 'completeness',
 *   test_type: 'unique',
 *   column_ref: 'public.nodes.id',
 * }
 */
export interface DataQualityRuleProperties {
  /** Quality dimension this rule validates */
  rule_type?: 'completeness' | 'accuracy' | 'freshness' | 'uniqueness' | 'consistency'
  /** Specific test implementation */
  test_type?: 'unique' | 'not_null' | 'accepted_values' | 'relationships' | 'custom'
  /** Column or field this rule applies to */
  column_ref?: string
  /** Acceptable threshold value for the rule */
  threshold?: string
  /** Whether to send an alert when the rule is breached */
  alert_on_breach?: boolean
  /** Result of the most recent run */
  last_run_status?: 'pass' | 'fail' | 'error' | 'not_run'
  /** ISO date of the most recent run */
  last_run_date?: ISODate
}

/** DataProduct entity.
 *
 * @example
 * const properties: DataProductProperties = {
 *   data_product_type: 'data product type',
 *   sla_freshness: 'under 5 minutes',
 *   consumers: ['analytics-service', 'search-indexer'],
 * }
 */
export interface DataProductProperties {
  /** Classification of the data product ( Option B). */
  data_product_type?: 'report' | 'dataset' | 'stream' | 'api' | 'ml_feature' | 'other'
  /** Freshness SLA commitment (e.g. "< 1 hour") */
  sla_freshness?: string
}

/** DataPipeline entity.
 *
 * @example
 * const properties: DataPipelineProperties = {
 *   schedule: '0 2 * * *',
 *   avg_runtime: '3m 20s',
 * }
 */
export interface DataPipelineProperties {
  /** Cron or scheduling expression */
  schedule?: string
  /** Average wall-clock runtime per execution */
  avg_runtime?: string
  /** Orchestration tool (e.g. "Airflow", "Dagster", "dbt Cloud") */
  orchestrator?: string
  /** Number of automatic retries on failure */
  retry_count?: number
  /** Delay between retries in seconds */
  retry_delay_seconds?: number
  /** Maximum allowed runtime in seconds before timeout */
  timeout_seconds?: number
  /** Rule that determines when this pipeline triggers */
  trigger_rule?: string
  /** Resource pool this pipeline runs in */
  pool?: string
}

/** DataLineage entity.
 *
 * @example
 * const properties: DataLineageProperties = {
 *   transformation: 'lowercase + trim',
 * }
 */
export interface DataLineageProperties {
  /** Description of how the data is transformed */
  transformation?: string
}

/** GlossaryTerm entity.
 *
 * @example
 * const properties: GlossaryTermProperties = {
 *   term_definition: 'A measurable result a team commits to deliver within a time-boxed period.',
 *   synonyms: ['OKR', 'objective and key result'],
 * }
 */
export interface GlossaryTermProperties {
  /** Plain-language definition of the term */
  term_definition?: string
  /** Alternative names or abbreviations for this term */
  synonyms?: string[]
}

/** DataDomain. A coarse-grained grouping of related data assets (sources,
 *  pipelines, products, glossary terms) under a single stewardship boundary.
 *  Structural relationships go via hierarchy; only stewardship + classification live here.
 *
 * @example
 * const properties: DataDomainProperties = {
 *   steward: 'steward',
 *   domain_type: 'master',
 *   sensitivity: 'public',
 * }
 */
export interface DataDomainProperties {
  /** Accountable person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  steward?: string
  /**
   * Domain contents classification.
   *   `master` = canonical entity data (customers, products).
   *   `operational` = live transactional data.
   *   `analytical` = warehouse / BI data.
   *   `reference` = slow-changing lookup data.
   */
  domain_type?: 'master' | 'operational' | 'analytical' | 'reference'
  /** Sensitivity band applied across the domain */
  sensitivity?: DataSensitivity
}

/** Report entity.
 *
 * @example
 * const properties: ReportProperties = {
 *   report_type: 'weekly-exec',
 *   schedule: '0 2 * * *',
 *   recipients: ['exec-team', 'product-leads'],
 * }
 */
export interface ReportProperties {
  /** Classification of the report (e.g. "weekly metrics", "ad hoc") */
  report_type?: string
  /** How often the report is generated */
  schedule?: string
  /** Tool used to generate the report */
  tool?: string
}
