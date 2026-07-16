/**
 * UPG Property Schemas: Sales & Revenue Domain.
 * Account, Contact, Lead, Deal, PipelineSales, PipelineStage,
 * QuoteDocument, Subscription, Invoice, Forecast.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// SALES & REVENUE
// ---------------------------------------------------------------------------

/** Sales account.
 *
 * @example
 * const properties: AccountProperties = {
 *   account_type: 'prospect',
 *   industry: 'Developer Tools',
 *   employee_count: 42,
 * }
 */
export interface AccountProperties {
  /** Relationship status of this account */
  account_type?: 'prospect' | 'customer' | 'partner' | 'churned'
  /** Industry vertical the account operates in */
  industry?: string
  /** Number of employees at the account */
  employee_count?: number
  /**
   * Go-to-market tier this account is served at. A segmentation *decision*
   * (how the field org treats the account), distinct from `employee_count`
   * (a raw fact) and aligned with but not identical to the ideal customer
   * profile's `company_size` buckets. `strategic` is the tier that escalates
   * to a dedicated account-plan graph (Tier 3 client model).
   */
  segment?: 'smb' | 'mid_market' | 'enterprise' | 'strategic'
  /**
   * Annual contract value in the account's billing currency. The single most
   * common enterprise account-tiering input; a snapshot that changes on
   * expansion or renewal.
   */
  annual_contract_value?: number
  /**
   * Geographic region the account is managed in (e.g. "EMEA", "NA-West").
   * Free-form: territory taxonomies vary by org and are modelled structurally
   * via the `territory` entity when they need to be queryable.
   */
  region?: string
}

/** Contact.
 *
 * @example
 * const properties: ContactProperties = {
 *   contact_role: 'champion',
 * }
 */
export interface ContactProperties {
  /** Job title or role within the account */
  contact_role?: string
  /** Whether this person has purchasing authority */
  is_decision_maker?: boolean
  /**
   * Role this contact plays in the buying committee (the decision-making unit).
   * The substrate of enterprise multi-threading and of qualification frameworks
   * (MEDDICC/SPICED): a deal with no `champion` and no `economic_buyer` mapped is
   * single-threaded and at risk. `is_decision_maker` becomes largely derivable
   * (`buying_role = economic_buyer`) but is kept for back-compat.
   * @example 'economic_buyer'
   */
  buying_role?: 'champion' | 'economic_buyer' | 'technical_evaluator' | 'end_user' | 'detractor' | 'influencer' | 'procurement' | 'legal' | 'security'
}

/** Lead.
 *
 * @example
 * const properties: LeadProperties = {
 *   lead_score: 42,
 *   qualification_status: 'marketing_qualified',
 * }
 */
export interface LeadProperties {
  /** How this lead was acquired (e.g. "website", "referral", "event") */
  lead_source?: string
  /** Numeric scoring of lead quality */
  lead_score?: number
  /** Current progression status of the lead */
  lead_status?: 'new' | 'contacted' | 'nurturing' | 'converted' | 'disqualified'
  /** Marketing or sales qualification level */
  qualification_status?: 'marketing_qualified' | 'sales_qualified' | 'product_qualified' | 'unqualified'
}

/** Deal.
 *
 * @example
 * const properties: DealProperties = {
 *   deal_value: 42,
 *   close_date: '2026-04-01',
 *   probability: 42,
 * }
 */
export interface DealProperties {
  /** Monetary value of the deal */
  deal_value?: number
  /** Expected close date (ISO format) */
  close_date?: ISODate
  /** Likelihood of closing (0-100%) */
  probability?: number
  /**
   * Terminal result of the deal. An Event-axis outcome (the verdict on a
   * one-time event), NOT a lifecycle phase, so it is `deal_outcome` and not
   * `deal_status` per the status-convention Rule 3. Lifecycle (open/won/lost as
   * phases) belongs on the base `status` slot; this records the win/loss verdict
   * a closed deal carries and gives `deal_lost_to_competitor` / win-loss study
   * derivations their anchor.
   * @example 'won'
   */
  deal_outcome?: 'won' | 'lost' | 'no_decision'
  /**
   * Motion this deal belongs to. Mirrors `PipelineSales.pipeline_type` at the
   * deal grain; `renewal` is the value `subscription_renews_via_deal` points at.
   * @example 'expansion'
   */
  deal_type?: 'new_business' | 'expansion' | 'renewal'
  /**
   * The single most-used CRM field: the next concrete action to move the deal.
   * Free text on purpose (a coordination note, not a structured task).
   * @example 'Send security questionnaire to procurement'
   */
  next_step?: string
  /** When the `next_step` is due (ISO format). */
  next_step_date?: ISODate
  /**
   * Qualification framework this deal is scored against. Names the rubric so the
   * `qualification_score` is interpretable; per-pillar booleans (MEDDICC's Metrics /
   * Economic buyer / Decision criteria / …) are deferred until `custom` recurrence
   * proves the demand.
   * @example 'meddicc'
   */
  qualification_framework?: 'meddicc' | 'bant' | 'spiced' | 'custom'
  /**
   * How well-qualified the deal is, on the canonical `confidence_5` scale
   * (UPGAssessment: numeric value plus a high/medium/low label). Coarse by
   * design; the granular per-pillar breakdown is deferred (see
   * `qualification_framework`).
   */
  qualification_score?: UPGAssessment
}

/** Sales pipeline.
 *
 * @example
 * const properties: PipelineSalesProperties = {
 *   pipeline_type: 'ci',
 *   avg_cycle_days: 42,
 * }
 */
export interface PipelineSalesProperties {
  /** Classification of the pipeline ( Option B). */
  pipeline_type?: 'new_business' | 'expansion' | 'renewal' | 'partner' | 'other'
  /** Average days from opportunity creation to close */
  avg_cycle_days?: number
}

/** Pipeline stage.
 *
 * @example
 * const properties: PipelineStageProperties = {
 *   stage_order: 42,
 *   conversion_rate: 0.08,
 *   avg_days_in_stage: 42,
 * }
 */
export interface PipelineStageProperties {
  /** Position of this stage in the pipeline sequence */
  stage_order?: number
  /** Percentage of deals that advance from this stage */
  conversion_rate?: number
  /** Average number of days deals spend in this stage */
  avg_days_in_stage?: number
}

/** Quote document.
 *
 * @example
 * const properties: QuoteDocumentProperties = {
 *   total_amount: 42,
 *   valid_until: '2026-12-31',
 *   currency: 'USD',
 * }
 */
export interface QuoteDocumentProperties {
  /** Current status of the quote */
  quote_status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  /** Total monetary amount of the quote */
  total_amount?: number
  /** Expiration date of the quote (ISO format) */
  valid_until?: string
  /** Currency code (e.g. "USD", "EUR") */
  currency?: string
}

/** Subscription.
 *
 * @example
 * const properties: SubscriptionProperties = {
 *   monthly_recurring_revenue: 42,
 *   start_date: '2026-04-01',
 *   renewal_date: '2026-04-01',
 * }
 */
export interface SubscriptionProperties {
  /** Monthly recurring revenue from this subscription */
  monthly_recurring_revenue?: number
  /** Subscription start date (ISO format) */
  start_date?: ISODate
  /** Next renewal date (ISO format) */
  renewal_date?: ISODate
  /** Current status of the subscription */
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'paused'
}

/** Invoice.
 *
 * @example
 * const properties: InvoiceProperties = {
 *   amount: 1200,
 *   due_date: '2026-06-15',
 *   currency: 'USD',
 * }
 */
export interface InvoiceProperties {
  /** Current payment status of the invoice */
  invoice_status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'voided'
  /** Total amount billed */
  amount?: number
  /** Payment due date (ISO format) */
  due_date?: ISODate
  /** Currency code (e.g. "USD", "EUR") */
  currency?: string
}

/** Revenue forecast.
 *
 * @example
 * const properties: ForecastProperties = {
 *   forecast_period: '2026-H2',
 *   predicted_revenue: 42,
 *   confidence: 4,
 * }
 */
export interface ForecastProperties {
  /** Time period the forecast covers (e.g. "Q2 2026") */
  forecast_period?: string
  /** Predicted revenue amount */
  predicted_revenue?: number
  /** Confidence in the prediction (1 = speculative, 5 = high conviction) */
  confidence?: UPGAssessment
  /** Forecasting methodology used */
  methodology?: string
}
