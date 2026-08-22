import { describe, it, expect } from 'vitest'
import {
  getPropertyDefaultScale,
  getPropertiesForScale,
  PROPERTY_SCALE_MAP,
  PROPERTY_SCALE_MAP_BY_ENTITY,
  UPG_SCALES,
} from '../grammar/scales.js'

describe('getPropertyDefaultScale', () => {
  // ── Default fallback ──────────────────────────────────────────────────────

  it('returns scale_5 for an unknown property', () => {
    expect(getPropertyDefaultScale('feature', 'unknown_property')).toBe('scale_5')
  })

  it('returns scale_5 for an empty property name', () => {
    expect(getPropertyDefaultScale('feature', '')).toBe('scale_5')
  })

  // Option B: risk_level and influence are now mapped to canonical
  // scales (previously fell through to the generic scale_5).
  it('maps risk_level to severity_5 ( Option B)', () => {
    expect(getPropertyDefaultScale('risk', 'risk_level')).toBe('severity_5')
  })

  it('maps influence to importance_5 ( Option B)', () => {
    expect(getPropertyDefaultScale('stakeholder', 'influence')).toBe('importance_5')
  })

  // ── Likelihood (0.35.0) ───────────────────────────────────────────────────
  // `likelihood` moved off `confidence_5`. Confidence is EPISTEMIC (how sure
  // the assessor is); likelihood is how probable the event is. A risk you are
  // certain about and a risk that is certain to happen are different facts.

  it('maps likelihood to likelihood_5, not the epistemic confidence_5', () => {
    expect(getPropertyDefaultScale('risk', 'likelihood')).toBe('likelihood_5')
    expect(getPropertyDefaultScale('risk', 'likelihood')).not.toBe('confidence_5')
  })

  it('the likelihood remap carries threat.likelihood in the same line', () => {
    expect(getPropertyDefaultScale('threat', 'likelihood')).toBe('likelihood_5')
  })

  it('likelihood_5 is a real registered scale, low end to high end', () => {
    const scale = UPG_SCALES.likelihood_5
    expect(scale).toBeDefined()
    expect(scale.min).toBe(1)
    expect(scale.max).toBe(5)
    expect(scale.points.map((p) => p.label)).toEqual([
      'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain',
    ])
  })

  it('holds the deprecated risk.probability on the SAME ladder as likelihood', () => {
    // Captain-ratified 2026-08-22. A staged deprecation exists so a reader can
    // migrate without their data changing meaning; leaving the old spelling on
    // `confidence_5` while the new one moved to `likelihood_5` meant one stored
    // 4 read "Confident" through `probability` and "Likely" through
    // `likelihood`, on one card, from one graph. The two names agree until
    // 1.0.0 drops the old one.
    expect(getPropertyDefaultScale('risk', 'probability')).toBe('likelihood_5')
    expect(getPropertyDefaultScale('risk', 'probability')).toBe(
      getPropertyDefaultScale('risk', 'likelihood'),
    )
  })

  it('leaves forecast.probability on confidence_5 — the override is risk-only', () => {
    // The point of the per-entity layer: correcting ONE entity without
    // disturbing the other. `forecast.probability` is a bare sales percentage
    // and belongs on the epistemic ladder the name-level map gives it.
    expect(getPropertyDefaultScale('forecast', 'probability')).toBe('confidence_5')
    expect(PROPERTY_SCALE_MAP.probability).toBe('confidence_5')
  })

  // ── Per-entity overrides (0.35.0) ─────────────────────────────────────────
  // Layer 1 of the resolver. `impact` means magnitude of BENEFIT on discovery
  // and market entities (high is good) and severity of HARM on a risk (high is
  // bad). One name-keyed map cannot hold both, and sharing `impact_5` rendered
  // a catastrophic risk green.

  it('maps risk.impact to severity_5 via the per-entity override', () => {
    expect(getPropertyDefaultScale('risk', 'impact')).toBe('severity_5')
  })

  it('leaves impact on impact_5 for every OTHER entity', () => {
    expect(getPropertyDefaultScale('opportunity', 'impact')).toBe('impact_5')
    expect(getPropertyDefaultScale('market_trend', 'impact')).toBe('impact_5')
    expect(getPropertyDefaultScale('feature', 'impact')).toBe('impact_5')
    // and the name-level map itself is untouched
    expect(PROPERTY_SCALE_MAP.impact).toBe('impact_5')
  })

  it('an entity with an override still falls through for its other properties', () => {
    // The override is per (entity, property), not per entity: `risk` has one
    // entry, and everything else on `risk` resolves by name as before.
    expect(getPropertyDefaultScale('risk', 'risk_level')).toBe('severity_5') // name-level
    expect(getPropertyDefaultScale('risk', 'confidence')).toBe('confidence_5') // name-level
    expect(getPropertyDefaultScale('risk', 'not_a_property')).toBe('scale_5') // fallback
  })

  it('every per-entity override names a real registered scale', () => {
    for (const [entityType, overrides] of Object.entries(PROPERTY_SCALE_MAP_BY_ENTITY)) {
      for (const [propertyName, scaleId] of Object.entries(overrides)) {
        expect(
          UPG_SCALES[scaleId],
          `${entityType}.${propertyName} overrides to unknown scale "${scaleId}"`,
        ).toBeDefined()
      }
    }
  })

  it('the per-entity layer is kept small and deliberate', () => {
    // A name needing an override on three ENTITIES is a name that should be
    // SPLIT, not overridden (which is what likelihood/probability just did).
    // Bumping this means making that call consciously, so here is the call:
    // raised 1 → 2 on 2026-08-22 for `risk.probability → likelihood_5`, the
    // Captain-ratified ruling that holds a deprecated spelling on the same
    // ladder as its replacement for the length of its window. Both entries are
    // on ONE entity, both came out of one audit, and both close at 1.0.0 when
    // `probability` is dropped — so the layer is not spreading, it is holding
    // one entity's two corrections. A THIRD entity appearing here is the
    // signal this guard is really watching for.
    const overrideCount = Object.values(PROPERTY_SCALE_MAP_BY_ENTITY)
      .reduce((n, o) => n + Object.keys(o).length, 0)
    expect(overrideCount).toBeLessThanOrEqual(2)
    // The stricter half of the same discipline, and the one that does NOT move:
    // every override so far is on `risk`. Widening to a second entity is a
    // different decision from adding a second property to the same entity.
    expect(Object.keys(PROPERTY_SCALE_MAP_BY_ENTITY)).toEqual(['risk'])
  })

  it('getPropertiesForScale reports the NAME-level map only', () => {
    // Documented scope: a bare property name cannot express "impact, but only
    // on risk", so the inverse view stays name-level. `impact` therefore lists
    // under impact_5 and NOT under severity_5, per the function's JSDoc.
    expect(getPropertiesForScale('impact_5')).toContain('impact')
    expect(getPropertiesForScale('severity_5')).not.toContain('impact')
    expect(getPropertiesForScale('likelihood_5')).toEqual(['likelihood'])
  })

  it('still returns scale_5 for an intentionally-unmapped assessment (rarity)', () => {
    expect(getPropertyDefaultScale('competitor', 'rarity')).toBe('scale_5')
  })

  // ── Reach overrides ───────────────────────────────────────────────────────

  it('maps reach to reach_5', () => {
    expect(getPropertyDefaultScale('problem_statement', 'reach')).toBe('reach_5')
  })

  it('maps projected_reach to reach_5', () => {
    expect(getPropertyDefaultScale('experiment_plan', 'projected_reach')).toBe('reach_5')
  })

  // ── Frequency overrides ───────────────────────────────────────────────────

  it('maps frequency to frequency_5', () => {
    expect(getPropertyDefaultScale('problem_statement', 'frequency')).toBe('frequency_5')
  })

  // ── Severity overrides ────────────────────────────────────────────────────

  it('maps severity to severity_5', () => {
    expect(getPropertyDefaultScale('problem_statement', 'severity')).toBe('severity_5')
  })

  it('maps severity_of_finding to severity_5', () => {
    expect(getPropertyDefaultScale('experiment_run', 'severity_of_finding')).toBe('severity_5')
  })

  // ── Pain override ─────────────────────────────────────────────────────────

  it('maps pain to pain_5', () => {
    expect(getPropertyDefaultScale('problem_statement', 'pain')).toBe('pain_5')
  })

  // ── Impact overrides ──────────────────────────────────────────────────────

  it('maps impact to impact_5', () => {
    expect(getPropertyDefaultScale('opportunity', 'impact')).toBe('impact_5')
  })

  it('maps projected_impact to impact_5', () => {
    expect(getPropertyDefaultScale('experiment_plan', 'projected_impact')).toBe('impact_5')
  })

  // ── Confidence override ───────────────────────────────────────────────────

  it('maps confidence to confidence_5', () => {
    expect(getPropertyDefaultScale('hypothesis', 'confidence')).toBe('confidence_5')
  })

  // ── Effort overrides ──────────────────────────────────────────────────────

  it('maps effort to effort_5', () => {
    expect(getPropertyDefaultScale('opportunity', 'effort')).toBe('effort_5')
  })

  it('maps effort_estimate to effort_5', () => {
    expect(getPropertyDefaultScale('feature_request', 'effort_estimate')).toBe('effort_5')
  })

  it('maps effort_to_fix to effort_5', () => {
    expect(getPropertyDefaultScale('bug', 'effort_to_fix')).toBe('effort_5')
  })

  // ── Importance override ───────────────────────────────────────────────────

  it('maps importance to importance_5', () => {
    expect(getPropertyDefaultScale('job_to_be_done', 'importance')).toBe('importance_5')
  })

  // ── Satisfaction override ─────────────────────────────────────────────────

  it('maps current_satisfaction to satisfaction_5', () => {
    expect(getPropertyDefaultScale('job_to_be_done', 'current_satisfaction')).toBe('satisfaction_5')
  })

  // ── entityType is ignored (same result regardless of entity) ─────────────

  it('returns the same scale for reach regardless of entity type', () => {
    const scaleA = getPropertyDefaultScale('problem_statement', 'reach')
    const scaleB = getPropertyDefaultScale('feature', 'reach')
    const scaleC = getPropertyDefaultScale('experiment_plan', 'reach')
    expect(scaleA).toBe('reach_5')
    expect(scaleB).toBe('reach_5')
    expect(scaleC).toBe('reach_5')
  })

  it('returns the same scale for severity regardless of entity type', () => {
    const scaleA = getPropertyDefaultScale('bug', 'severity')
    const scaleB = getPropertyDefaultScale('ai_risk', 'severity')
    const scaleC = getPropertyDefaultScale('customer_complaint', 'severity')
    expect(scaleA).toBe('severity_5')
    expect(scaleB).toBe('severity_5')
    expect(scaleC).toBe('severity_5')
  })

  it('returns scale_5 for unknown property regardless of entity type', () => {
    const scaleA = getPropertyDefaultScale('feature', 'mystery_field')
    const scaleB = getPropertyDefaultScale('persona', 'mystery_field')
    expect(scaleA).toBe('scale_5')
    expect(scaleB).toBe('scale_5')
  })
})
