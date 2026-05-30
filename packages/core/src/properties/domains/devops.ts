/**
 * UPG Property Schemas: DevOps & Platform Domain.
 * SLI, SLO, ErrorBudget, Incident, Postmortem, Runbook, Monitor,
 * AlertRule, CiPipeline, ReleaseStrategy, OnCallRotation,
 * InfrastructureComponent.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { IncidentSeverity, ISODateTime, LogLevel, SignalUrgency } from '../primitives.js'

// ---------------------------------------------------------------------------
// DEVOPS & PLATFORM
// ---------------------------------------------------------------------------

/** Service Level Indicator.
 *
 * @example
 * const properties: ServiceLevelIndicatorProperties = {
 *   metric_name: 'weekly_active_teams',
 *   threshold: 10,
 *   current_value: 42,
 * }
 */
export interface ServiceLevelIndicatorProperties {
  /**
   * Indicator metric name.
   * @example "Request latency p99", "Error rate", "Availability"
   */
  metric_name?: string
  /**
   * Threshold that defines a "good" event.
   * @example 200 (ms latency), 0.01 (1% error rate), 99.9 (% availability)
   */
  threshold?: number
  /**
   * Current observed value. Compared against `threshold` for SLO compliance.
   * @example 150 (ms), 0.003 (0.3% error rate)
   */
  current_value?: number
  /**
   * Unit of measurement. Required to interpret `threshold` and `current_value`.
   * @example "ms", "%", "req/s", "errors/min"
   */
  unit?: string
  /**
   * Aggregation over the evaluation window. p99 and avg tell different stories.
   * @example "p99" for tail latency, "avg" for mean throughput, "count" for total events
   */
  aggregation?: 'avg' | 'sum' | 'max' | 'min' | 'p50' | 'p95' | 'p99' | 'count'
  /**
   * Query expression that produces `current_value`. Free-form to fit PromQL,
   * Datadog query strings, SQL, or vendor-specific DSLs.
   * @example 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))'
   */
  measurement_query?: string
  /**
   * Historical baseline. Pairs with `current_value` to indicate drift.
   * @example 99.85
   */
  baseline_value?: number
}

/** Service Level Objective.
 *
 * @example
 * const properties: ServiceLevelObjectiveProperties = {
 *   target_percentage: 42,
 *   window: 'rolling-30-days',
 *   current_percentage: 42,
 * }
 */
export interface ServiceLevelObjectiveProperties {
  /**
   * Target percentage. The reliability commitment.
   * @example 99.9 (three nines), 99.95, 99.99 (four nines)
   */
  target_percentage?: number
  /**
   * Evaluation window.
   * @example "30 days", "rolling 28 days", "calendar quarter"
   */
  window?: string
  /**
   * Current achieved percentage. Compared against `target_percentage` for health.
   * @example 99.92 (above a 99.9 target)
   */
  current_percentage?: number
  /**
   * Measurement mechanism.
   * `metric` = ratio (good/total). `monitor` = monitor-based. `time_slice` = uptime windows.
   */
  slo_type?: 'metric' | 'monitor' | 'time_slice'
  /**
   * Soft alert threshold before the target breaches. Gives teams time to act.
   * @example 99.95 (warn at 99.95% when target is 99.9%)
   */
  warning_threshold?: number
}

/** Error budget.
 *
 * @example
 * const properties: ErrorBudgetProperties = {
 *   budget_remaining: 42,
 *   burn_rate: 42,
 *   policy: 'least-privilege',
 * }
 */
export interface ErrorBudgetProperties {
  /**
   * Remaining budget percentage (0–100).
   * @example 45.2 (45.2% remaining, 54.8% used)
   */
  budget_remaining?: number
  /**
   * Consumption rate as a multiplier against sustainable burn.
   * 1.0 = on track. 2.5 = consuming 2.5x faster than sustainable.
   */
  burn_rate?: number
  /**
   * Policy when the budget hits 0%.
   * @example "Freeze all non-reliability deploys", "Page engineering lead immediately"
   */
  policy?: string
  /**
   * Budget window. Defines reset cadence.
   * @example "30 days", "rolling 28 days"
   */
  budget_window?: string
}

/** Incident.
 *
 * @example
 * const properties: IncidentProperties = {
 *   incident_type: 'operational',
 *   severity_level: 'sev1',
 *   urgency: 'high',
 * }
 */
export interface IncidentProperties {
  /**
   * Discriminator. Absorbs the deprecated `security_incident` type.
   * When `incident_type === 'security'`, this node replaces the former `security_incident`.
   * @example "security" for a data breach, "operational" for a service outage, "performance" for degradation
   */
  incident_type?: 'operational' | 'security' | 'data_breach' | 'performance' | 'dependency' | 'other'
  /**
   * Incident severity tier (paging classification). `sev1` = critical/system
   * down. `sev2` = major impact. `sev3` = minor impact. `sev4` = minimal.
   * Uses the `IncidentSeverity` scale; distinct from user-impact `severity_5`.
   * @example "sev1" for complete service unavailability
   */
  severity_level?: IncidentSeverity
  /**
   * Notification urgency. Independent of severity. Uses the shared
   * `SignalUrgency` scale (`low` | `medium` | `high` | `critical`);
   * higher tiers escalate the notification channel.
   */
  urgency?: SignalUrgency
  /** ISO timestamp the incident started or was first detected. */
  started_at?: ISODateTime
  /** ISO timestamp first acknowledged by a responder. Used to compute time-to-acknowledge. */
  acknowledged_at?: ISODateTime
  /**
   * ISO timestamp contained. Blast radius limited, bleeding stopped.
   * Containment precedes full resolution, especially for security incidents.
   */
  contained_at?: ISODateTime
  /** ISO timestamp fully resolved. */
  resolved_at?: ISODateTime
  /**
   * Customer or service impact.
   * @example "Users unable to log in", "Payment processing delayed by 30+ seconds for 15% of users"
   */
  impact_summary?: string
}

/** Postmortem.
 *
 * @example
 * const properties: PostmortemProperties = {
 *   timeline: 'Kickoff 2026-04-22, results by 2026-05-15.',
 *   action_items: 'Book the kickoff; draft the research brief; recruit 5 participants.',
 *   detection_method: 'monitoring',
 * }
 */
export interface PostmortemProperties {
  /**
   * Chronological timeline. Events with timestamps in order.
   * @example "03:15 Alert fired. 03:20 On-call acknowledged. 03:45 Root cause identified. 06:30 Service restored."
   */
  timeline?: string
  /**
   * Follow-up actions with owners and due dates.
   * @example "1. Add circuit breaker to auth service (owner: Platform, due: 2026-04-12). 2. Update runbook for DB failover."
   */
  action_items?: string
  /**
   * Detection source. Key learning for improving detection coverage.
   * @example "alert" if monitoring caught it, "customer_report" if a user reported first
   */
  detection_method?: 'monitoring' | 'alert' | 'customer_report' | 'internal_report' | 'automated'
}

/** Runbook.
 *
 * @example
 * const properties: RunbookProperties = {
 *   trigger: 'User opens the third restricted feature in a session.',
 *   steps: ['Open the workspace', 'Pick a persona', 'Commit a decision'],
 *   last_tested: '2026-04-12',
 * }
 */
export interface RunbookProperties {
  /**
   * Triggering event or alert.
   * @example "Error rate exceeds 5% for 5 minutes", "Database connection pool exhausted"
   */
  trigger?: string
  /**
   * Ordered steps, one action per element.
   * @example ["Check Grafana dashboard X", "SSH into affected node", "Restart service Y"]
   */
  steps?: string[]
  /**
   * ISO date last tested or rehearsed. Runbooks degrade if untested.
   * @example "2026-03-15"
   */
  last_tested?: string
  /**
   * Operational maturity. Manual runbooks are candidates for automation investment.
   * `semi_automated` = some steps scripted; human judgment still required.
   */
  automation_level?: 'manual' | 'semi_automated' | 'fully_automated'
}

/** Monitor.
 *
 * @example
 * const properties: MonitorProperties = {
 *   monitor_type: 'uptime',
 *   target: 'Week-one activation ≥ 45%.',
 *   threshold: 10,
 * }
 */
export interface MonitorProperties {
  /**
   * Measurement kind.
   * `uptime` = availability. `latency` = response time. `error_rate` = failure ratio.
   * `throughput` = req/sec. `log` = log-based. `event` = event-driven.
   * `synthetic` = scripted user-journey tests. `slo_burn` = tracks SLO error budget.
   * @example "synthetic" for a scripted checkout flow test
   */
  monitor_type?: 'uptime' | 'latency' | 'error_rate' | 'throughput' | 'log' | 'event' | 'synthetic' | 'slo_burn' | 'custom'
  /**
   * Service, endpoint, or resource monitored.
   * @example "graph-api /health", "PostgreSQL connection pool", "CDN edge latency"
   */
  target?: string
  /**
   * Alert condition, expressed as a condition rather than a bare number.
   * @example "> 500ms p99", "< 99.9% uptime over 5 minutes", "> 1% error rate"
   */
  threshold?: string
  /**
   * Alert destination on threshold breach.
   * @example "slack:#ops-alerts", "pagerduty:on-call-graph"
   */
  alert_channel?: string
  /**
   * Operational state.
   * `ok` = all clear. `warn` = approaching threshold. `alert` = threshold breached.
   * `no_data` = nothing received (may indicate monitor or service failure). `muted` = silenced.
   */
  monitor_status?: 'ok' | 'warn' | 'alert' | 'no_data' | 'muted'
  /** Currently silenced. Typical during planned maintenance windows. */
  muted?: boolean
}

/** Alert rule.
 *
 * @example
 * const properties: AlertRuleProperties = {
 *   condition: 'personas.length > 0 && opportunities.length === 0',
 *   severity: 'critical',
 *   notification_channel: '#alerts-product',
 * }
 */
export interface AlertRuleProperties {
  /**
   * Triggering query or expression.
   * @example "avg(rate(http_errors_total[5m])) > 0.05"
   */
  condition?: string
  /**
   * Routes notification and escalation. Uses the `LogLevel` scale (operational
   * verbosity, distinct from user-impact `severity_5`).
   * `critical` = page immediately. `warning` = notify, don't page. `info` = log only.
   */
  severity?: LogLevel
  /**
   * Notification destination.
   * @example "pagerduty:sev1-rotation", "slack:#alerts-low"
   */
  notification_channel?: string
  /**
   * Required duration the condition holds before firing. Prevents flapping on transient spikes.
   * @example "5m", "15m", "1h"
   */
  evaluation_window?: string
  /**
   * Escalation behaviour on unacknowledged alerts.
   * @example "Escalate to engineering lead after 10 minutes"
   */
  escalation_policy?: string
}

/** CI pipeline.
 *
 * @example
 * const properties: CiPipelineProperties = {
 *   pipeline_type: 'build',
 *   trigger: 'User opens the third restricted feature in a session.',
 *   avg_duration: '45m',
 * }
 */
export interface CiPipelineProperties {
  /**
   * Pipeline scope, narrowest to broadest.
   * `build` = compile only. `test` = test only. `deploy` = ship to environment.
   * `release` = create release artifact. `full` = commit-to-deploy.
   */
  pipeline_type?: 'build' | 'test' | 'deploy' | 'release' | 'full'
  /**
   * Triggering event.
   * @example "Push to main", "PR merge", "Nightly schedule at 02:00 UTC", "Manual dispatch"
   */
  trigger?: string
  /**
   * Average run duration across recent executions.
   * @example "4m 30s", "12 minutes"
   */
  avg_duration?: string
  /** Result of the most recent run. Current health indicator. */
  last_run_status?: 'success' | 'failure' | 'cancelled' | 'skipped' | 'in_progress'
  /**
   * Primary branch. The branch that triggers production deployments.
   * @example "main", "release/*"
   */
  target_branch?: string
  /**
   * Total runs since creation. Indicates activity level.
   * @example 1452
   */
  run_count?: number
  /**
   * Reliability metric for the pipeline itself: % of runs that succeed.
   * @example 94.3
   */
  success_rate?: number
}

/** Release strategy.
 *
 * @example
 * const properties: ReleaseStrategyProperties = {
 *   strategy_type: 'blue_green',
 *   canary_percentage: 42,
 *   rollback_criteria: 'If week-one activation drops by 3 percentage points over 48h, roll back.',
 * }
 */
export interface ReleaseStrategyProperties {
  /**
   * How a new version reaches production.
   * `blue_green` = instant switch between two identical environments.
   * `canary` = gradual percentage rollout. `rolling` = replace instances incrementally.
   * `recreate` = take down old, bring up new. `feature_flag` = code ships, features gated.
   * @example "canary" for gradual rollout, "blue_green" for instant switch with instant rollback
   */
  strategy_type?: 'blue_green' | 'canary' | 'rolling' | 'recreate' | 'feature_flag'
  /**
   * Traffic routed to canary. Applies when `strategy_type === 'canary'`.
   * @example 5 (5% initial canary before full rollout)
   */
  canary_percentage?: number
  /**
   * Rollback triggers, automatic or manual.
   * @example "Error rate > 1% over 5 minutes", "Latency p99 > 2x baseline"
   */
  rollback_criteria?: string
  /**
   * Soak time before promoting to full production.
   * @example "30m", "2h", "24h"
   */
  bake_time?: string
  /** Whether the system rolls back on threshold breach without human intervention. */
  auto_rollback?: boolean
}

/** On-call rotation.
 *
 * @example
 * const properties: OnCallRotationProperties = {
 *   schedule: '0 2 * * *',
 *   escalation_policy: 'pagerduty-primary',
 *   rotation_cadence: 'daily',
 * }
 */
export interface OnCallRotationProperties {
  /**
   * Human-readable schedule of who is on call when.
   * @example "Weekly rotation, Monday 09:00 UTC handoff", "Follow-the-sun (US, EU, APAC)"
   */
  schedule?: string
  /**
   * Escalation when the primary doesn't respond.
   * @example "5 min to respond, then escalate to secondary. 10 min to secondary, then page engineering lead."
   */
  escalation_policy?: string
  /**
   * Cycle cadence.
   * `weekly` for standard team rotations. `daily` for high-incident-volume teams.
   */
  rotation_cadence?: 'daily' | 'weekly' | 'biweekly' | 'custom'
  /**
   * Shift handoff time. Affects team coordination and sleep.
   * @example "09:00 UTC", "17:00 local"
   */
  handoff_time?: string
}

/** Infrastructure component.
 *
 * @example
 * const properties: InfrastructureComponentProperties = {
 *   component_type: 'compute',
 *   provider: 'anthropic',
 *   region: 'eu-west-1',
 * }
 */
export interface InfrastructureComponentProperties {
  /**
   * Resource category.
   * `compute` = VMs or containers. `storage` = object/block/file.
   * `network` = VPC, load balancer, DNS. `database` = managed DB services.
   * `cdn` = content delivery. `queue` = message broker or event bus.
   * @example "database" for a managed PostgreSQL instance
   */
  component_type?: 'compute' | 'storage' | 'network' | 'database' | 'cdn' | 'queue' | 'other'
  /**
   * Cloud or infrastructure provider.
   * @example "AWS", "Vercel", "Cloudflare", "Supabase", "Fly.io"
   */
  provider?: string
  /**
   * Geographic deployment region.
   * @example "us-east-1", "eu-west-1", "global" (CDN or multi-region)
   */
  region?: string
  /**
   * Monthly cost in base currency (USD).
   * @example 250.00
   */
  cost_monthly?: number
  /**
   * Environment.
   * `production` = live traffic. `staging` = pre-release.
   * `development` = developer sandbox. `shared` = cross-environment services (e.g. logging).
   */
  environment?: 'production' | 'staging' | 'development' | 'shared'
  /**
   * Operational status.
   * `healthy` = normal. `degraded` = partial impairment. `down` = unavailable.
   * `maintenance` = intentionally offline.
   */
  component_status?: 'healthy' | 'degraded' | 'down' | 'maintenance'
}
