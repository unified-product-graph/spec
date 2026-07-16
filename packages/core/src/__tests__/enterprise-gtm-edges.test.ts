/**
 * Enterprise GTM coordination batch — 0.24.0 Track 1 (Waves A + B).
 *
 * The catalog modelled each go-to-market department's nouns but almost none of
 * the handoffs between them (audit `2026-07-16-enterprise-gtm-coverage-audit.md`).
 * This batch wires sixteen lateral coordination edges (the buying committee onto
 * the deal, the enablement demand side, the win/loss loop, account-scoped
 * post-sale, and the audience-projection lattice) plus a deepening of the Deal /
 * Contact / Account / Messaging property surfaces. None of the edges are
 * hierarchy, so UPG_VALID_CHILDREN is untouched.
 *
 * This test pins the edge shapes (existence, endpoints, verbs, classification,
 * pair-map indexing, and the two cross_product_eligible flags) and locks the new
 * property enums. The interface ↔ schema sync is separately enforced by
 * property-schema-coverage.test.ts.
 *
 * Run: npx vitest run src/__tests__/enterprise-gtm-edges.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG, isCrossProductEligible } from '../catalog/edge-catalog.js'
import { UPG_EDGE_PAIR_MAP } from '../index.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'

// The 16 Wave A edges: [key, source, target, forward, reverse, classification].
const WAVE_A: Array<[string, string, string, string, string, string]> = [
  ['deal_involves_contact', 'deal', 'contact', 'involves', 'involved_in', 'semantic'],
  ['deal_challenged_by_objection', 'deal', 'objection', 'challenged_by', 'challenges', 'cross-domain'],
  ['deal_armed_with_competitive_battle_card', 'deal', 'competitive_battle_card', 'armed_with', 'arms', 'cross-domain'],
  ['deal_lost_to_competitor', 'deal', 'competitor', 'lost_to', 'won', 'causal'],
  ['deal_closed_via_contract', 'deal', 'contract', 'closed_via', 'closes', 'cross-domain'],
  ['deal_blocked_by_feature', 'deal', 'feature', 'blocked_by', 'blocks', 'cross-domain'],
  ['research_study_analyzes_deal', 'research_study', 'deal', 'analyzes', 'analyzed_by', 'cross-domain'],
  ['account_raises_support_ticket', 'account', 'support_ticket', 'raises', 'raised_by', 'cross-domain'],
  ['account_health_scored_via_customer_health_score', 'account', 'customer_health_score', 'health_scored_via', 'scores', 'cross-domain'],
  ['account_lost_because_churn_reason', 'account', 'churn_reason', 'lost_because', 'causes_churn_for', 'cross-domain'],
  ['account_implements_via_project', 'account', 'project', 'implements_via', 'implements', 'cross-domain'],
  ['subscription_renews_via_deal', 'subscription', 'deal', 'renews_via', 'renews', 'causal'],
  ['account_participates_in_beta_program', 'account', 'beta_program', 'participates_in', 'has_participant', 'cross-domain'],
  ['deal_gated_by_security_review', 'deal', 'security_review', 'gated_by', 'gates', 'cross-domain'],
  ['feature_communicated_via_messaging', 'feature', 'messaging', 'communicated_via', 'communicates', 'cross-domain'],
  ['launch_coordinated_via_project', 'launch', 'project', 'coordinated_via', 'coordinates', 'cross-domain'],
]

describe('0.24.0 — enterprise GTM coordination edges', () => {
  it.each(WAVE_A)(
    '%s exists with the ratified endpoints, verbs, and classification',
    (key, source, target, forward, reverse, classification) => {
      const def = (UPG_EDGE_CATALOG as Record<string, { source_type: string; target_type: string; forward_verb: string; reverse_verb: string; classification: string }>)[key]
      expect(def, `${key} must exist in the catalog`).toBeDefined()
      expect(def.source_type).toBe(source)
      expect(def.target_type).toBe(target)
      expect(def.forward_verb).toBe(forward)
      expect(def.reverse_verb).toBe(reverse)
      expect(def.classification).toBe(classification)
    },
  )

  it.each(WAVE_A)('%s is indexed in UPG_EDGE_PAIR_MAP under source:target', (key, source, target) => {
    expect(UPG_EDGE_PAIR_MAP[`${source}:${target}`]).toContain(key)
  })

  it('none of the 16 edges are hierarchy (UPG_VALID_CHILDREN untouched)', () => {
    for (const [key, source, target, , , classification] of WAVE_A) {
      expect(classification, `${key} must not be a hierarchy edge`).not.toBe('hierarchy')
      // The target must NOT have become a valid child of the source via this batch.
      const children = (UPG_VALID_CHILDREN as Record<string, readonly string[]>)[source] ?? []
      expect(children, `${key}: ${target} must not be a child of ${source}`).not.toContain(target)
    }
  })

  it('exactly deal_blocked_by_feature and research_study_analyzes_deal are minted cross_product_eligible', () => {
    expect(isCrossProductEligible('deal_blocked_by_feature')).toBe(true)
    expect(isCrossProductEligible('research_study_analyzes_deal')).toBe(true)
    // The other 14 stay within-graph.
    for (const [key] of WAVE_A) {
      if (key === 'deal_blocked_by_feature' || key === 'research_study_analyzes_deal') continue
      expect(isCrossProductEligible(key), `${key} must NOT be cross_product_eligible`).toBe(false)
    }
  })

  it('the deal is no longer a 5-edge forecast row — it is a coordination hub', () => {
    const dealTouching = Object.values(UPG_EDGE_CATALOG).filter(
      (d) => d.source_type === 'deal' || d.target_type === 'deal',
    )
    // Pre-batch the deal touched 5 edges; the batch adds 8 more that touch a deal.
    expect(dealTouching.length).toBeGreaterThanOrEqual(13)
  })
})

describe('0.24.0 — enterprise GTM property deepening', () => {
  it('deal gains the Event-axis outcome and motion enums', () => {
    expect((UPG_PROPERTY_SCHEMA.deal?.deal_outcome as { enum?: string[] })?.enum).toEqual(['won', 'lost', 'no_decision'])
    expect((UPG_PROPERTY_SCHEMA.deal?.deal_type as { enum?: string[] })?.enum).toEqual(['new_business', 'expansion', 'renewal'])
    expect((UPG_PROPERTY_SCHEMA.deal?.qualification_framework as { enum?: string[] })?.enum).toEqual(['meddicc', 'bant', 'spiced', 'custom'])
    // Event-axis, not lifecycle: there is no deal_status property.
    expect(UPG_PROPERTY_SCHEMA.deal?.deal_status).toBeUndefined()
  })

  it('deal.qualification_score is an assessment on the confidence_5 scale', () => {
    const q = UPG_PROPERTY_SCHEMA.deal?.qualification_score as { type?: string; scale_id?: string }
    expect(q?.type).toBe('assessment')
    expect(q?.scale_id).toBe('confidence_5')
  })

  it('contact gains the buying-committee role enum (nine roles)', () => {
    expect((UPG_PROPERTY_SCHEMA.contact?.buying_role as { enum?: string[] })?.enum).toEqual([
      'champion', 'economic_buyer', 'technical_evaluator', 'end_user', 'detractor', 'influencer', 'procurement', 'legal', 'security',
    ])
  })

  it('account gains the GTM tier, ACV, and region', () => {
    expect((UPG_PROPERTY_SCHEMA.account?.segment as { enum?: string[] })?.enum).toEqual(['smb', 'mid_market', 'enterprise', 'strategic'])
    expect(UPG_PROPERTY_SCHEMA.account?.annual_contract_value?.type).toBe('number')
    expect(UPG_PROPERTY_SCHEMA.account?.region?.type).toBe('string')
  })

  it('messaging.channel accepts the internal enablement channel (additive)', () => {
    const channel = UPG_PROPERTY_SCHEMA.messaging?.channel as { enum?: string[] }
    expect(channel?.enum).toContain('enablement')
    // Additive: the pre-existing channels are untouched.
    expect(channel.enum).toEqual(
      expect.arrayContaining(['landing_page', 'email', 'social', 'ad', 'pitch', 'press', 'in_product', 'enablement', 'other']),
    )
  })
})
