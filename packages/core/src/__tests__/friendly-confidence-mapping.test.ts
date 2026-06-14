/**
 * Pinned friendly confidence mapping (UPG 0.11.1).
 *
 * `low/medium/high` must resolve to ONE canonical `confidence_5` value from a
 * single source (`friendly_aliases` on the scale), so the typed classification
 * writer and the generic writers can never disagree on what `high` means. The
 * 0.10.8 bug was a local map that expanded `high → 5`, off by one from the
 * value-4 backfilled population.
 */
import { describe, it, expect } from 'vitest'
import { UPG_SCALES, friendlyToAssessment } from '../index.js'

describe('confidence_5 friendly aliases (0.11.1)', () => {
  it('pins low/medium/high to the population-matching values', () => {
    expect(UPG_SCALES.confidence_5.friendly_aliases).toEqual({ low: 2, medium: 3, high: 4 })
  })

  it('resolves a friendly word to the canonical value AND label', () => {
    expect(friendlyToAssessment('confidence_5', 'high')).toEqual({ value: 4, label: 'Confident', scale_id: 'confidence_5' })
    expect(friendlyToAssessment('confidence_5', 'medium')).toEqual({ value: 3, label: 'Some evidence', scale_id: 'confidence_5' })
    expect(friendlyToAssessment('confidence_5', 'low')).toEqual({ value: 2, label: 'Hunch', scale_id: 'confidence_5' })
  })

  it('high is Confident (4), never Data-backed (5)', () => {
    expect(friendlyToAssessment('confidence_5', 'high')?.value).toBe(4)
  })

  it('returns null for an unaliased word or a scale without aliases', () => {
    expect(friendlyToAssessment('confidence_5', 'nope')).toBeNull()
    expect(friendlyToAssessment('effort_5', 'high')).toBeNull()
  })
})
