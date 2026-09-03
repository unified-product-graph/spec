/**
 * 0.38.0 — a deprecated alias resolves its domain THROUGH its replacement.
 *
 * The field case (Data, domains-generator work, 2026-09-03): 36 icon-carrying
 * deprecated aliases (kpi, pain_point, sla, jtbd, ...) had no direct row in
 * UPG_DOMAINS, so their tone rendered neutral in every surface — while every
 * one of their replacements had a domain all along. The fix is a RULE in
 * `getDomainForType`, not 36 rows: alias rows in UPG_DOMAINS would make
 * deprecated names look canonical to every consumer that iterates a domain's
 * `types`, and duplicated assignments would drift.
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_DOMAINS,
  getDomainForType,
  isDeprecatedType,
  getReplacementType,
  UPG_ENTITY_META,
} from '../index.js'

/** The 36 aliases from the field report, verbatim. */
const FIELD_ALIASES = [
  'ab_test', 'architecture_decision', 'campaign', 'channel_bm',
  'customer_segment_bm', 'defect_report', 'design_decision', 'finding',
  'growth_experiment', 'highlight', 'how_might_we', 'hypothesis_claim',
  'hypothesis_evidence', 'input_metric', 'internal_doc', 'jtbd', 'kpi',
  'metric_definition', 'north_star_metric', 'nps_score', 'onboarding_flow',
  'package', 'pain_point', 'pricing_experiment', 'product_decision',
  'research_insight', 'risk_item', 'security_incident', 'segment', 'sla',
  'sli', 'slo', 'story_task', 'target_customer_segment', 'user_need',
  'ux_insight',
] as const

describe('deprecated aliases resolve their domain through their replacement', () => {
  it('every one of the 36 field-reported aliases now resolves to a domain', () => {
    const unresolved = FIELD_ALIASES.filter((t) => getDomainForType(t) === undefined)
    expect(unresolved, 'aliases still resolving tone-neutral').toEqual([])
  })

  it("each alias resolves to exactly its replacement's domain, never a different one", () => {
    for (const alias of FIELD_ALIASES) {
      const replacement = getReplacementType(alias)
      expect(replacement, `${alias} must have a replacement`).toBeTruthy()
      expect(getDomainForType(alias)?.id).toBe(getDomainForType(replacement!)?.id)
    }
  })

  it('generalises: EVERY deprecated type with a replacement resolves to a domain', () => {
    // Not just the 36 the field happened to render icons for — the rule holds
    // for the whole deprecated tier, so the next alias never re-opens this.
    const deprecatedNames = UPG_ENTITY_META
      .filter((m) => m.maturity === 'deprecated')
      .map((m) => m.name)
    const withReplacement = deprecatedNames.filter((n) => getReplacementType(n))
    expect(withReplacement.length).toBeGreaterThan(0)
    const unresolved = withReplacement.filter((n) => getDomainForType(n) === undefined)
    expect(unresolved, 'deprecated types whose replacement has no domain').toEqual([])
  })

  it('no deprecated name appears DIRECTLY in any domain rows (rule, not rows)', () => {
    const leaked: string[] = []
    for (const d of UPG_DOMAINS) {
      for (const t of d.types as readonly string[]) {
        if (isDeprecatedType(t)) leaked.push(`${d.id}.${t}`)
      }
    }
    expect(leaked, 'alias rows would make deprecated names look canonical').toEqual([])
  })

  it('an unknown name still resolves to nothing', () => {
    expect(getDomainForType('not_a_real_type_xyz')).toBeUndefined()
  })
})
