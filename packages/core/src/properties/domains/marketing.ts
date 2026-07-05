/**
 * UPG Property Schemas: Marketing Operations Domain.
 * MarketingStrategy, MarketingChannel, MarketingCampaignPlan, EmailSequence,
 * SocialPost, SeoKeyword, AdCreative, PressRelease, Event, CommunityInitiative.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate } from '../primitives.js'

// ---------------------------------------------------------------------------
// MARKETING OPERATIONS
// ---------------------------------------------------------------------------

/** Marketing strategy.
 *
 * @example
 * const properties: MarketingStrategyProperties = {
 *   approach: 'inbound',
 *   annual_budget: 42,
 * }
 */
export interface MarketingStrategyProperties {
  /** Overall marketing approach */
  approach?: 'inbound' | 'outbound' | 'product_led' | 'community' | 'hybrid'
  /** Total annual marketing budget */
  annual_budget?: number
  /** Primary objective for the marketing strategy */
  objective?: string
}

/** Marketing channel.
 *
 * @example
 * const properties: MarketingChannelProperties = {
 *   channel_type: 'social',
 *   monthly_budget: 42,
 *   roi: 42,
 * }
 */
export interface MarketingChannelProperties {
  /** Category of marketing channel */
  channel_type?: 'social' | 'email' | 'seo' | 'sem' | 'content' | 'events' | 'other'
  /** Monthly spend allocated to this channel */
  monthly_budget?: number
  /** Return on investment ratio */
  roi?: number
}

/** Marketing campaign plan.
 *
 * @example
 * const properties: MarketingCampaignPlanProperties = {
 *   brief: 'One-page research brief for the Q2 activation study.',
 *   budget: 50000,
 *   start_date: '2026-04-01',
 * }
 */
export interface MarketingCampaignPlanProperties {
  /** Campaign brief summarising objectives and approach */
  brief?: string
  /** Allocated budget for this campaign */
  budget?: number
  /** Campaign start date (ISO format) */
  start_date?: ISODate
  /** Campaign end date (ISO format) */
  end_date?: ISODate
  /** Audience segment the campaign targets */
  target_segment?: string
}

/** Email sequence.
 *
 * @example
 * const properties: EmailSequenceProperties = {
 *   sequence_type: 'onboarding',
 *   email_count: 42,
 *   open_rate: 42,
 * }
 */
export interface EmailSequenceProperties {
  /** Purpose of the email sequence */
  sequence_type?: 'onboarding' | 'nurture' | 're_engagement' | 'sales' | 'other'
  /** Number of emails in the sequence */
  email_count?: number
  /** Average open rate across the sequence (0-1) */
  open_rate?: number
  /** Average click-through rate across the sequence (0-1) */
  click_rate?: number
}

/** Social media post.
 *
 * @example
 * const properties: SocialPostProperties = {
 *   platform: 'twitter',
 *   post_type: 'text',
 *   scheduled_date: '2026-04-01',
 * }
 */
export interface SocialPostProperties {
  /** Social media platform */
  platform?: 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok' | 'other'
  /** Format of the post */
  post_type?: 'text' | 'image' | 'video' | 'carousel' | 'story'
  /** Date the post is scheduled to publish (ISO format) */
  scheduled_date?: ISODate
}

/** SEO keyword.
 *
 * @example
 * const properties: SeoKeywordProperties = {
 *   keyword: 'product graph',
 *   search_volume: 42,
 *   difficulty: 42,
 * }
 */
export interface SeoKeywordProperties {
  /** The keyword or phrase being targeted */
  keyword: string
  /** Estimated monthly search volume */
  search_volume?: number
  /** Keyword difficulty score (0-100) */
  difficulty?: number
  /** Search intent behind the keyword */
  intent?: 'informational' | 'navigational' | 'commercial' | 'transactional'
  /** Current SERP ranking position */
  current_rank?: number
  /** Desired ranking position */
  target_rank?: number
}

/** Ad creative.
 *
 * @example
 * const properties: AdCreativeProperties = {
 *   platform: 'google',
 *   ad_format: 'search',
 *   headline: 'Stop losing AI output in tabs.',
 * }
 */
export interface AdCreativeProperties {
  /** Advertising platform */
  platform?: 'google' | 'meta' | 'linkedin' | 'twitter' | 'other'
  /** Format of the ad unit */
  ad_format?: 'search' | 'display' | 'video' | 'native' | 'social'
  /** Primary headline text */
  headline?: string
  /** Call-to-action text */
  call_to_action?: string
  /** Total spend on this creative */
  spend?: number
  /** Total number of impressions served */
  impressions?: number
  /** Total number of clicks received */
  clicks?: number
}

/** Press release.
 *
 * @example
 * const properties: PressReleaseProperties = {
 *   pr_type: 'product_launch',
 *   publish_date: '2026-04-01',
 *   outlets: ['TechCrunch', 'The Information', 'HN Launch'],
 * }
 */
export interface PressReleaseProperties {
  /** Category of the press release */
  pr_type?: 'product_launch' | 'partnership' | 'funding' | 'milestone' | 'other'
  /** Date the release was or will be published (ISO format) */
  publish_date?: ISODate
  /** Media outlets targeted for distribution */
  outlets?: string[]
}

/** Event.
 *
 * @example
 * const properties: EventProperties = {
 *   event_type: 'conference',
 *   event_date: '2026-04-01',
 *   location: 'Berlin, DE',
 * }
 */
export interface EventProperties {
  /** Format of the event */
  event_type?: 'conference' | 'webinar' | 'meetup' | 'workshop' | 'trade_show' | 'other'
  /** Date of the event (ISO format) */
  event_date?: ISODate
  /** Venue or virtual platform */
  location?: string
  /** Number of attendees */
  attendee_count?: number
}

/** Community initiative.
 *
 * @example
 * const properties: CommunityInitiativeProperties = {
 *   initiative_type: 'forum',
 *   member_count: 42,
 *   engagement_rate: 42,
 * }
 */
export interface CommunityInitiativeProperties {
  /** Platform or format for the community */
  initiative_type?: 'forum' | 'discord' | 'slack' | 'meetup' | 'ambassador' | 'other'
  /** Current number of community members */
  member_count?: number
  /** Percentage of members actively participating */
  engagement_rate?: number
}
