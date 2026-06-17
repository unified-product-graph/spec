/**
 * UPG Property Schemas: Content & Knowledge Domain.
 * ContentPiece, KnowledgeBaseArticle, BrandAsset, InternalDoc,
 * ContentCalendar, ContentTheme, DocumentationTemplate, Document.
 * (`PromptTemplate` moved to the AI domain file —.)
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence, Duration, FrequencyRating, ISODateTime } from '../primitives.js'

// ---------------------------------------------------------------------------
// CONTENT & KNOWLEDGE
// ---------------------------------------------------------------------------

/** Content piece.
 *
 * @example
 * const properties: ContentPieceProperties = {
 *   content_type: 'blog',
 *   url: 'https://example.com/doc',
 * }
 */
export interface ContentPieceProperties {
  /** Format of the content */
  content_type?: 'blog' | 'video' | 'podcast' | 'whitepaper' | 'case_study' | 'other'
  /** URL where the content is published */
  url?: string
}

/** Knowledge base article.
 *
 * @example
 * const properties: KnowledgeBaseArticleProperties = {
 *   audience: 'customer',
 *   url: 'https://example.com/doc',
 * }
 */
export interface KnowledgeBaseArticleProperties {
  /** Who this article is intended for */
  audience?: 'customer' | 'internal' | 'developer' | 'admin'
  /** URL of the published article */
  url?: string
}

/** Brand asset.
 *
 * @example
 * const properties: BrandAssetProperties = {
 *   asset_type: 'logo',
 *   url: 'https://example.com/doc',
 *   usage_rights: 'Internal use only. Do not redistribute without written approval.',
 * }
 */
export interface BrandAssetProperties {
  /** Category of the brand asset */
  asset_type?: 'logo' | 'icon' | 'illustration' | 'photo' | 'video' | 'template'
  /** URL or path to the asset file */
  url?: string
  /** Usage rights or licensing restrictions */
  usage_rights?: string
}

/** Internal document.
 *
 * @example
 * const properties: InternalDocProperties = {
 *   doc_type: 'rfc',
 *   url: 'https://example.com/doc',
 * }
 */
export interface InternalDocProperties {
  /** Classification of the document */
  doc_type?: 'rfc' | 'runbook' | 'guide' | 'spec' | 'onboarding' | 'other'
  /** URL or path to the document */
  url?: string
}

/** Document. Provenance container linking to source files.
 *
 * Container for any narrative artefact (spec, RFC, brief, report, runbook,
 * case-study, session note) that the rest of the graph cites or describes.
 * Lifecycle (draft → review → published → archived) is governed by the
 * canonical `PUBLISHING_TEMPLATE`.
 *
 * Per UPG principle P14, "what this document is about" is expressed as edges:
 *   parent product: `product_documented_in_document`
 *   subject coverage: `document_describes_*` (feature, vision, persona,
 *     competitor, strategic_pillar, market_segment, revenue_stream,
 *     positioning, decision, …)
 *   contained insights: `document_contains_insight`
 *   scheduling: `content_calendar_schedules_document`
 *
 * @example
 * const properties: DocumentProperties = {
 *   path: '/docs/spec/v0.2/upg-core.md',
 *   source_url: 'https://github.com/unified-product-graph/core/blob/main/spec/v0.2/upg-core.md',
 *   platform: 'markdown',
 *   document_type: 'spec',
 *   last_updated: '2026-04-28T13:27:08Z',
 *   word_count: 2480,
 *   content_summary: 'Defines the v0.2 entity catalogue, edge catalogue, and migration adapters.',
 * }
 */
export interface DocumentProperties {
  /** File path or workspace-relative location. Use `source_url` for off-platform links. */
  path?: string
  /** Canonical retrievable URL */
  source_url?: string
  /** Hosting platform */
  platform?: 'markdown' | 'notion' | 'figma' | 'google_docs' | 'confluence' | 'github' | 'linear' | 'other'
  /** Purpose classification */
  document_type?: 'vision' | 'plan' | 'decision' | 'research' | 'spec' | 'audit' | 'session' | 'feedback' | 'case-study' | 'narrative' | 'bug-report' | 'archive-collection' | 'rfc' | 'runbook' | 'guide' | 'onboarding' | 'brief' | 'report' | 'reference'
  /** ISO 8601 last-meaningful-update */
  last_updated?: ISODateTime
  /** Approximate word count. Useful for planning, indexing, summarisation. */
  word_count?: number
  /** 1–3 sentence summary. Drives previews, search snippets, embedding context. */
  content_summary?: string
  /** Primary language (BCP 47 tag, e.g. "en", "en-GB", "fr") */
  language?: string
}

/** Content calendar.
 *
 * @example
 * const properties: ContentCalendarProperties = {
 *   calendar_period: '2026-Q2',
 *   publish_cadence: 'weekly',
 * }
 */
export interface ContentCalendarProperties {
  /** Covered period (e.g. "Q2 2026") */
  calendar_period?: string
  /**
   * Publishing cadence (canonical `Cadence` since v0.4.0).
   * Retyped from the legacy free-form `publish_cadence: string`. For exact
   * rates ("3 per week"), set `frequency_count` + `frequency_period`.
   *
   * BREAKING in v0.4.0: previous string values like `"3x/week"` no longer
   * type-check. Map to `'weekly'` + `frequency_count: 3` + `frequency_period: 'P7D'`.
   */
  publish_cadence?: Cadence
  /** Exact count in the period. Pairs with `frequency_period`. */
  frequency_count?: number
  /** Recurrence period (ISO-8601 `Duration`, e.g. `'P7D'`) */
  frequency_period?: Duration
  /** Qualitative rate tier when an exact rate is unknown */
  frequency_rating?: FrequencyRating
}

/** Content theme.
 *
 * @example
 * const properties: ContentThemeProperties = {
 *   theme_category: 'activation',
 * }
 */
export interface ContentThemeProperties {
  /** Category or topic area of the theme */
  theme_category?: string
}

/** Documentation template.
 *
 * @example
 * const properties: DocumentationTemplateProperties = {
 *   template_type: 'weekly-review',
 *   sections: ['Summary', 'Evidence', 'Recommendation'],
 *   version: '0.3.1',
 * }
 */
export interface DocumentationTemplateProperties {
  /** Kind of document this template produces */
  template_type?: string
  /** Sections or outline of the template */
  sections?: string[]
  /** Version identifier of the template */
  version?: string
}
