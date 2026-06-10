/**
 * F7 — Maturity Graduation (P-E)
 *
 * The 36-domain wiring audit found pattern P-E: stable, in-use entity types
 * left at `proposed` long past the promotion rubric in `entity-meta.ts`.
 * F7 graduates the SAFE, audit-named set to `stable` (keeping `since`), and
 * records the deliberate DEFERs so a future change can't silently regress them.
 *
 * Graduated proposed → stable:
 *   - classification_axis, classification_value (market intelligence, since 0.4.0)
 *   - brand_logo, brand_imagery (brand, since 0.2.0)
 *   - metric_quality_assessment (strategy, since 0.2.2)
 *
 * Deferred (kept proposed by contract / open ADR):
 *   - user_story — frozen `proposed` by the v0.7.0 re-canon contract;
 *     `user-story-split.test.ts` asserts the invariant.
 *   - experiment_run — kept proposed (the optional multi-run / replication child;
 *     graduated experiment_plan to stable but left the run proposed).
 *   - ai_experiment / ai_dataset / ai_trace — entangled with (open ADR).
 *
 * experiment_plan graduated proposed → stable as the canonical
 * validation plan; it is no longer a deferred-proposed type.
 */

import { describe, it, expect } from 'vitest'
import { UPG_ENTITY_META_BY_NAME } from '../registry/entity-meta.js'

const GRADUATED = [
  'classification_axis',
  'classification_value',
  'brand_logo',
  'brand_imagery',
  'metric_quality_assessment',
] as const

const DEFERRED_PROPOSED = [
  'user_story', // re-canon contract
  'experiment_run', // — optional multi-run / replication child (experiment_plan graduated to stable)
  'ai_experiment', //
  'ai_dataset', //
  'ai_trace', //
] as const

describe('F7 maturity graduation', () => {
  for (const name of GRADUATED) {
    it(`${name} is graduated proposed → stable`, () => {
      const meta = UPG_ENTITY_META_BY_NAME.get(name)
      expect(meta, `${name} must be registered in entity-meta`).toBeDefined()
      expect(meta!.maturity).toBe('stable')
    })
  }

  it('graduation preserves the original `since` version (no version reset)', () => {
    expect(UPG_ENTITY_META_BY_NAME.get('classification_axis')!.since).toBe('0.4.0')
    expect(UPG_ENTITY_META_BY_NAME.get('classification_value')!.since).toBe('0.4.0')
    expect(UPG_ENTITY_META_BY_NAME.get('brand_logo')!.since).toBe('0.2.0')
    expect(UPG_ENTITY_META_BY_NAME.get('brand_imagery')!.since).toBe('0.2.0')
    expect(UPG_ENTITY_META_BY_NAME.get('metric_quality_assessment')!.since).toBe('0.2.2')
  })

  it('graduated types are not deprecated and carry no replacement', () => {
    for (const name of GRADUATED) {
      const meta = UPG_ENTITY_META_BY_NAME.get(name)!
      expect(meta.deprecated_in).toBeUndefined()
      expect(meta.replacement).toBeUndefined()
    }
  })
})

describe('F7 deliberate defers stay proposed', () => {
  for (const name of DEFERRED_PROPOSED) {
    it(`${name} remains proposed (deferred — open contract/ADR)`, () => {
      const meta = UPG_ENTITY_META_BY_NAME.get(name)
      expect(meta, `${name} must be registered in entity-meta`).toBeDefined()
      expect(meta!.maturity).toBe('proposed')
    })
  }
})
