/**
 * Shared property primitives. Scalar aliases and string-literal unions used
 * across every domain property interface. Each type below carries its own
 * one-line declaration.
 * https://unifiedproductgraph.org/spec | MIT
 */

// Re-export UPGAssessment from grammar/scales for convenience.
// Domain property files import from here rather than reaching into grammar/.
export type { UPGAssessment } from '../grammar/scales.js'

// ─── Date / time primitives ───────────────────────────────────────────────────

/** ISO 8601 date (e.g. "2026-06-01"). Communicates date-only intent. */
export type ISODate = string

/** ISO 8601 datetime with timezone (e.g. "2026-06-01T09:00:00Z"). Communicates timestamp intent. */
export type ISODateTime = string

/**
 * ISO 8601 duration string.
 *
 * Format: `PnYnMnDTnHnMnS` (year/month/day prefix P, time prefix T).
 * Common examples:
 *   `P14D`     : 14 days
 *   `P3M`      : 3 months
 *   `PT2H30M`  : 2 hours 30 minutes
 *   `P1Y6M`    : 1 year 6 months
 *
 * Used for retention periods, notice periods, agreement terms, lead times,
 * lookback windows, sprint durations, and any other measured time span.
 */
export type Duration = string

/**
 * 5- or 6-field cron expression.
 *
 * Standard 5-field form: `minute hour day-of-month month day-of-week`
 * Extended 6-field form: `second minute hour day-of-month month day-of-week`
 *
 * Examples:
 *   `'0 9 * * 1'`       : every Monday at 09:00
 *   `'0 0 1 * *'`       : first day of every month at midnight
 *   `'*\/15 * * * *'`   : every 15 minutes
 *
 * Used for scheduled data pipelines, recurring jobs, and automation triggers.
 */
export type Cron = string

/**
 * Flexible, human-readable timeframe label.
 *
 * Accepted forms (not exhaustive; this is an open-shape string):
 *   `'Q1 2026'`          : calendar quarter
 *   `'2026-H1'`          : calendar half-year
 *   `'FY2027 Q2'`        : fiscal quarter
 *   `'12-18 months'`     : relative range
 *   `'now'` / `'ongoing'` : open-ended
 *
 * Used to unify `timeline`, `time_horizon`, `timeframe`, `period`, and
 * `report_period` properties that share the same human-calendar semantics
 * but are too coarse for a precise ISO interval.
 */
export type Timeframe = string

// ─── Identifier primitives ────────────────────────────────────────────────────

/**
 * ISO 4217 three-character alphabetic currency code.
 *
 * Examples: `'USD'`, `'EUR'`, `'GBP'`, `'JPY'`.
 * All characters must be ASCII uppercase letters (A–Z).
 *
 * Used wherever a property JSDoc says "ISO 4217": pricing tiers, contracts,
 * sales quotes, growth campaigns, and localisation settings.
 */
export type ISO4217 = string

/**
 * Semantic version string following semver.org 2.0.0.
 *
 * Format: `MAJOR.MINOR.PATCH[-prerelease][+build]`
 * Examples:
 *   `'1.0.0'`
 *   `'0.3.1'`
 *   `'2.0.0-beta.1'`
 *   `'1.4.0+build.42'`
 *
 * Used for software version fields across `engineering.ts`, `ai.ts`,
 * `content.ts`, `legal.ts`, `product-spec.ts`, and `accessibility.ts`.
 */
export type Semver = string

// ─── Ordinal / assessment primitives ─────────────────────────────────────────

/** Task or strategic priority level */
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

/** Traffic-light health status for initiatives, features, and delivery */
export type HealthStatus = 'on_track' | 'at_risk' | 'off_track'

/**
 * How strict a rule is. Used by constraint entities, design guidelines,
 * security policies, and accessibility standards to classify their
 * imperative force. Pairs with `UPG_ENUM_SCALES.RuleStrength` for
 * per-value labels and descriptions.
 *
 * Members (strict → permissive):
 *   `'must'`     : hard requirement, violation blocks
 *   `'must_not'` : hard prohibition, violation blocks
 *   `'exception'`: documented carve-out from a must / must_not
 *   `'warning'`  : soft signal, should consider, can override with justification
 *   `'guideline'`: recommendation, encouraged, not enforced
 */
export type RuleStrength = 'must' | 'must_not' | 'exception' | 'warning' | 'guideline'

/** Confidence level for assumptions, evidence, and feasibility */
export type Confidence = 'high' | 'medium' | 'low'

/**
 * Three-point ordinal scale: low / medium / high.
 *
 * Intentional alias of `Confidence`. The value set is identical.
 * Use `LowMedHigh` when the property semantics are clearly about magnitude
 * or degree (e.g. `substitutability`, `magnitude`) rather than epistemic
 * confidence. Both types accept the same runtime strings.
 */
export type LowMedHigh = Confidence

// ─── Signal triplet primitives ────────────────────────────────────────────────

/**
 * Urgency level of an inbound signal (customer, support, or market).
 *
 * Used across `feedback.ts` and `customer-success.ts` wherever
 * `signal_urgency` is declared. Extracted to eliminate four identical
 * inline redeclarations.
 */
export type SignalUrgency = 'low' | 'medium' | 'high' | 'critical'

/**
 * Sentiment polarity of an inbound signal.
 *
 * Used across `feedback.ts` and `customer-success.ts` wherever
 * `signal_sentiment` is declared. Member order: positive → neutral →
 * negative → mixed (valence-first).
 */
export type SignalSentiment = 'positive' | 'neutral' | 'negative' | 'mixed'

/**
 * Channel through which an inbound signal was received.
 *
 * Current call sites declare `signal_channel` as plain `string`; this enum
 * provides the canonical closed set for migration.
 *
 * Members:
 *   `'analytics_event'` : first-party product analytics event (PostHog, Amplitude, etc.)
 *   `'community'`       : forum, Discord, Slack community, etc.
 *   `'email'`           : direct email or newsletter reply
 *   `'in_app'`          : in-product feedback widget, NPS prompt, or beta-feedback panel
 *   `'interview'`       : user or sales interview
 *   `'other'`           : catch-all for unlisted channels
 *   `'review'`          : app store or G2/Capterra review
 *   `'sales_call'`      : sales demo or discovery call
 *   `'social'`          : social media mention or DM
 *   `'support_ticket'`  : helpdesk or in-app support ticket
 *   `'survey'`          : NPS, CSAT, or custom survey
 *   `'usage_session'`   : observed product session (telemetry-derived friction signal)
 */
export type SignalChannel =
  | 'analytics_event'
  | 'community'
  | 'email'
  | 'in_app'
  | 'interview'
  | 'other'
  | 'review'
  | 'sales_call'
  | 'social'
  | 'support_ticket'
  | 'survey'
  | 'usage_session'

// ─── Cadence / recurrence primitives ─────────────────────────────────────────

/**
 * Canonical cadence primitive for recurring activities, publications, and
 * measurement schedules.
 *
 * Closed enum on the qualitative axis "how often does this recur?". Pairs
 * with the `frequency_count` + `frequency_period` (ISO-8601 `Duration`)
 * numeric pair when authors need an exact rate ("3 times per `P7D`")
 * rather than a labelled tier.
 *
 * Members (coarse → fine):
 *   `'continuous'` : always running, no discrete recurrence
 *   `'hourly'`     : recurs every hour
 *   `'daily'`      : recurs every day
 *   `'weekly'`     : recurs every week
 *   `'monthly'`    : recurs every month
 *   `'quarterly'`  : recurs every calendar quarter
 *   `'yearly'`     : recurs every year
 *   `'on_demand'`  : triggered by event, not schedule
 *   `'other'`      : recurs on a cadence not captured by the above tiers
 *
 * Introduced in v0.4.0 as the canonical replacement for ad-hoc
 * `frequency?: string` and `*cadence?: string` properties (Concern 2 axis
 * canonicalisation). Supersedes the domain-local `MetricFrequency`
 * type in `domains/metrics.ts` which is now an alias.
 */
export type Cadence =
  | 'continuous'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'on_demand'
  | 'other'

// ─── Technical / integration primitives ──────────────────────────────────────

/**
 * Communication protocol for API contracts and data flows.
 *
 * Normalised to lowercase. Supersedes two divergent inline enums in
 * `engineering.ts`:
 *   - `ApiContract.protocol` used mixed-case: `'REST' | 'GraphQL' | 'gRPC' | 'AsyncAPI' | 'SOAP' | 'WebSocket' | 'MQTT' | 'other'`
 *   - `DataFlow.protocol` used lowercase: `'rest' | 'graphql' | 'grpc' | 'event' | 'webhook' | 'file'`
 *
 * This primitive is the lowercase superset of both; call-site migration
 * will normalise casing in a follow-up pass.
 *
 * Members (alphabetical):
 *   `'asyncapi'`  : AsyncAPI / event-driven API spec
 *   `'event'`     : generic event/message bus
 *   `'file'`      : file-based transfer (SFTP, S3, etc.)
 *   `'graphql'`   : GraphQL over HTTP
 *   `'grpc'`      : gRPC / Protocol Buffers
 *   `'mqtt'`      : MQTT (IoT / lightweight pub-sub)
 *   `'other'`     : unlisted protocol
 *   `'rest'`      : REST over HTTP
 *   `'soap'`      : SOAP / XML web services
 *   `'webhook'`   : HTTP webhook (push callback)
 *   `'websocket'` : WebSocket bidirectional stream
 */
export type Protocol =
  | 'asyncapi'
  | 'event'
  | 'file'
  | 'graphql'
  | 'grpc'
  | 'mqtt'
  | 'other'
  | 'rest'
  | 'soap'
  | 'webhook'
  | 'websocket'

// ─── Marketing / distribution primitives ─────────────────────────────────────

/**
 * Marketing and advertising platform identifier.
 *
 * Supersedes two overlapping inline enums in `marketing.ts`:
 *   - `SocialPost.platform`:   `'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok' | 'other'`
 *   - `AdCreative.platform`:   `'google' | 'meta' | 'linkedin' | 'twitter' | 'other'`
 *
 * This primitive is the alphabetical superset of both.
 *
 * Members:
 *   `'discord'`   : Discord community / server
 *   `'email'`     : newsletter / email marketing platform
 *   `'google'`    : Google Ads / Search / Display
 *   `'instagram'` : Instagram organic or paid
 *   `'linkedin'`  : LinkedIn organic or paid
 *   `'meta'`      : Meta Ads (Facebook/Instagram ad platform)
 *   `'other'`     : unlisted platform
 *   `'podcast'`   : podcast advertising or distribution
 *   `'reddit'`    : Reddit organic or paid
 *   `'tiktok'`    : TikTok organic or paid
 *   `'twitter'`   : Twitter / X organic or paid
 *   `'youtube'`   : YouTube organic or paid
 */
export type MarketingPlatform =
  | 'discord'
  | 'email'
  | 'google'
  | 'instagram'
  | 'linkedin'
  | 'meta'
  | 'other'
  | 'podcast'
  | 'reddit'
  | 'tiktok'
  | 'twitter'
  | 'youtube'
