import { describe, it, expect } from 'vitest'
import { getPropertyDefaultScale } from '../grammar/scales.js'

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
