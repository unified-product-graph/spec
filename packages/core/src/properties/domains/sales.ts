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
