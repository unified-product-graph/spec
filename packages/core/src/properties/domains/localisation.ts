/**
 * UPG Property Schemas: Localisation & i18n Domain.
 * Locale, TranslationKey, TranslationBundle, LocaleConfig,
 * CulturalAdaptation, RegionalPricing.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate } from '../primitives.js'

// ---------------------------------------------------------------------------
// LOCALISATION & i18n
// ---------------------------------------------------------------------------

/** Locale.
 *
 * @example
 * const properties: LocaleProperties = {
 *   language_code: 'en-GB',
 *   region_code: 'eu-west-1',
 *   is_default: true,
 * }
 */
export interface LocaleProperties {
  /** ISO 639-1 language code (e.g. "en", "de", "ja") */
  language_code: string
  /** ISO 3166-1 region code (e.g. "US", "GB", "DE") */
  region_code?: string
  /** Whether this is the default/fallback locale */
  is_default?: boolean
  /** Rollout status of this locale */
  /** Percentage of strings translated (0-100) */
  translation_coverage?: number
}

/** Translation key.
 *
 * @example
 * const properties: TranslationKeyProperties = {
 *   key_path: 'billing.plan.tier',
 *   source_text: 'I just paste everything into a doc and hope I find it again.',
 *   context_hint: 'Hover over any node to see its outbound relationships.',
 * }
 */
export interface TranslationKeyProperties {
  /** Dot-separated key path (e.g. "onboarding.welcome.title") */
  key_path: string
  /** Original source-language text */
  source_text?: string
  /** Contextual hint for translators */
  context_hint?: string
  /** Maximum character length for the translated string */
  max_length?: number
}

/** Translation bundle.
 *
 * @example
 * const properties: TranslationBundleProperties = {
 *   bundle_scope: 'core',
 *   last_synced: '2026-04-17T08:00:00Z',
 * }
 */
export interface TranslationBundleProperties {
  /**
   * Bundle scope. Closed set of common translation bundle groupings.
   * Use `'other'` for product-specific module bundles.
   */
  bundle_scope?:
    | 'core'
    | 'onboarding'
    | 'settings'
    | 'errors'
    | 'marketing'
    | 'help'
    | 'legal'
    | 'other'
  /** Translation completion percentage (0-100) */
  /** ISO timestamp of the last sync with the translation service */
  last_synced?: string
}

/** Locale configuration.
 *
 * @example
 * const properties: LocaleConfigProperties = {
 *   date_format: 'YYYY-MM-DD',
 *   number_format: '0,0.00',
 *   currency: 'USD',
 * }
 */
export interface LocaleConfigProperties {
  /** Date formatting pattern (e.g. "MM/DD/YYYY", "DD.MM.YYYY") */
  date_format?: string
  /** Number formatting convention (e.g. "1,000.00", "1.000,00") */
  number_format?: string
  /** Default currency code for this locale */
  currency?: string
  /** Text direction for the locale's script */
  text_direction?: 'ltr' | 'rtl'
  /** Default timezone (e.g. "Europe/Berlin", "America/New_York") */
  timezone?: string
}

/** Cultural adaptation.
 *
 * @example
 * const properties: CulturalAdaptationProperties = {
 *   adaptation_type: 'content',
 *   rationale: 'Reduces support burden and lifts activation, both priorities this quarter.',
 * }
 */
export interface CulturalAdaptationProperties {
  /** Aspect of the product being adapted */
  adaptation_type?: 'content' | 'imagery' | 'ux' | 'legal' | 'payment'
  /** Market or region the adaptation targets */
  /** Reason for the cultural adaptation */
  rationale?: string
}

/** Regional pricing.
 *
 * @example
 * const properties: RegionalPricingProperties = {
 *   currency: 'USD',
 *   price_override: 42,
 *   ppp_factor: 42,
 * }
 */
export interface RegionalPricingProperties {
  /** Local currency code */
  currency?: string
  /** Overridden price for this region */
  price_override?: number
  /** Purchasing power parity adjustment factor */
  ppp_factor?: number
  /** Date the regional pricing takes effect (ISO format) */
  effective_date?: ISODate
}
