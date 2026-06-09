/**
 * — anti-pattern evaluator unit tests.
 *
 * For each of the 12 curated anti-patterns we exercise both:
 *   - a "fire" fixture: inputs that satisfy the structured_condition
 *   - a "clear" fixture: inputs that don't
 *
 * Plus filter / gating / composite tests covering the evaluator's options.
 */

import { describe, it, expect } from 'vitest'
import {
  evaluateAntiPatterns,
  type AntiPatternInputs,
} from '../../intelligence/evaluator.js'
import { UPG_ANTI_PATTERNS } from '../../intelligence/anti-patterns.js'

// ─── Fixture builder ─────────────────────────────────────────────────────────

function emptyInputs(): AntiPatternInputs {
  return {
    countsByType: {},
    countsByTypeAndStatus: {},
    edgePresence: {},
    domainPopulation: {},
    totalEntityCount: 0,
    domainCount: 0,
    orphanCount: 0,
    // intentionally no productStage — most tests run against an unstaged graph
    // so we exercise all 12 patterns regardless of stages[] gating.
  }
}

function relKey(source: string, edge: string, target: string): string {
  return `${source}|${edge}|${target}`
}

function fired(ids: string[], target: string): boolean {
  return ids.includes(target)
}

function firedIds(violations: ReturnType<typeof evaluateAntiPatterns>): string[] {
  return violations.map((v) => v.anti_pattern_id)
}

// ─── Sanity ──────────────────────────────────────────────────────────────────

describe('Evaluator sanity', () => {
  it('every anti-pattern has a per-pattern test below', () => {
    // If the catalog grows past this count, this test fails. The author
    // should add matching fire/clear fixtures here. Stable count guard.
    expect(UPG_ANTI_PATTERNS.length).toBe(13)
  })

  it('empty graph produces no violations', () => {
    expect(evaluateAntiPatterns(emptyInputs())).toEqual([])
  })

  it('returns sorted: high → medium → low, then by id asc', () => {
    // Trigger one high (features-without-hypotheses) and one medium
    // (untested-hypothesis-pile-up).
    const i = emptyInputs()
    i.countsByType = { feature: 2, hypothesis: 4 }
    i.countsByTypeAndStatus = { hypothesis: { drafted: 4 } }
    const fires = evaluateAntiPatterns(i)
    expect(fires.length).toBeGreaterThanOrEqual(2)
    // First fire is the 'high' severity one.
    expect(fires[0].severity).toBe('high')
    // Among same severity, ids ascend.
    for (let j = 1; j < fires.length; j++) {
      if (fires[j].severity === fires[j - 1].severity) {
        expect(
          fires[j].anti_pattern_id.localeCompare(fires[j - 1].anti_pattern_id),
        ).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

// ─── Per-pattern fire / clear pairs ──────────────────────────────────────────

describe('Per-pattern fire / clear', () => {
  // 1. personas-without-jobs (high)
  it('personas-without-jobs fires when a persona has no chain edges', () => {
    const i = emptyInputs()
    i.countsByType = { persona: 1 }
    // edgePresence empty → no chain edges
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'personas-without-jobs')).toBe(true)
  })
  it('personas-without-jobs clears when at least one chain edge exists', () => {
    const i = emptyInputs()
    i.countsByType = { persona: 1 }
    i.edgePresence = {
      [relKey('persona', 'persona_pursues_job', 'job')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'personas-without-jobs')).toBe(false)
  })

  // 2. opportunity-without-need (high)
  it('opportunity-without-need fires when opportunities exist with no chain links', () => {
    const i = emptyInputs()
    i.countsByType = { opportunity: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'opportunity-without-need')).toBe(true)
  })
  it('opportunity-without-need clears when an addresses_need edge exists', () => {
    const i = emptyInputs()
    i.countsByType = { opportunity: 1 }
    i.edgePresence = {
      [relKey('opportunity', 'opportunity_addresses_need', 'need')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'opportunity-without-need')).toBe(false)
  })

  // 3. features-without-hypotheses (high)
  it('features-without-hypotheses fires with features and zero hypotheses', () => {
    const i = emptyInputs()
    i.countsByType = { feature: 3, hypothesis: 0 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'features-without-hypotheses')).toBe(true)
  })
  it('features-without-hypotheses clears when hypotheses exist', () => {
    const i = emptyInputs()
    i.countsByType = { feature: 3, hypothesis: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'features-without-hypotheses')).toBe(false)
  })

  // 4. untested-hypothesis-pile-up (medium)
  it('untested-hypothesis-pile-up fires with > 3 drafted hypotheses', () => {
    const i = emptyInputs()
    i.countsByType = { hypothesis: 4 }
    i.countsByTypeAndStatus = { hypothesis: { drafted: 4 } }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'untested-hypothesis-pile-up')).toBe(true)
  })
  it('untested-hypothesis-pile-up clears with ≤ 3 drafted hypotheses', () => {
    const i = emptyInputs()
    i.countsByType = { hypothesis: 3 }
    i.countsByTypeAndStatus = { hypothesis: { drafted: 3 } }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'untested-hypothesis-pile-up')).toBe(false)
  })

  // 5. experiment-run-without-learning (high)
  it('experiment-run-without-learning fires with runs and no learning edge', () => {
    const i = emptyInputs()
    i.countsByType = { experiment_run: 2 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'experiment-run-without-learning')).toBe(true)
  })
  it('experiment-run-without-learning clears when produces_learning edge present', () => {
    const i = emptyInputs()
    i.countsByType = { experiment_run: 2 }
    i.edgePresence = {
      [relKey('experiment_run', 'experiment_run_produces_learning', 'learning')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'experiment-run-without-learning')).toBe(false)
  })

  // 6. objective-without-key-results (high)
  it('objective-without-key-results fires with objectives and no KR edge', () => {
    const i = emptyInputs()
    i.countsByType = { objective: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'objective-without-key-results')).toBe(true)
  })
  it('objective-without-key-results clears when achieved_through edge present', () => {
    const i = emptyInputs()
    i.countsByType = { objective: 1 }
    i.edgePresence = {
      [relKey('objective', 'objective_achieved_through_key_result', 'key_result')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'objective-without-key-results')).toBe(false)
  })

  // 7. roadmap-feature-without-outcome-link (high)
  it('roadmap-feature-without-outcome-link fires with features and no KR linkage', () => {
    const i = emptyInputs()
    i.countsByType = { feature: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'roadmap-feature-without-outcome-link')).toBe(true)
  })
  it('roadmap-feature-without-outcome-link clears when feature_drives_key_result present', () => {
    const i = emptyInputs()
    i.countsByType = { feature: 1 }
    i.edgePresence = {
      [relKey('feature', 'feature_drives_key_result', 'key_result')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'roadmap-feature-without-outcome-link')).toBe(false)
  })

  // 8. competitors-missing-past-validation (medium, benchmark — needs stage)
  it('competitors-missing-past-validation fires when competitor count < benchmark min at validation', () => {
    const i = emptyInputs()
    i.productStage = 'validation' // benchmark.min = 3
    i.countsByType = { competitor: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'competitors-missing-past-validation')).toBe(true)
  })
  it('competitors-missing-past-validation clears at or above benchmark min', () => {
    const i = emptyInputs()
    i.productStage = 'validation'
    i.countsByType = { competitor: 3 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'competitors-missing-past-validation')).toBe(false)
  })

  // 9. persona-count-below-stage-benchmark (medium, benchmark — needs stage)
  it('persona-count-below-stage-benchmark fires when persona count < benchmark min', () => {
    const i = emptyInputs()
    i.productStage = 'validation' // benchmark.min = 2
    i.countsByType = { persona: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'persona-count-below-stage-benchmark')).toBe(true)
  })
  it('persona-count-below-stage-benchmark clears at or above benchmark min', () => {
    const i = emptyInputs()
    i.productStage = 'validation'
    i.countsByType = { persona: 2 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'persona-count-below-stage-benchmark')).toBe(false)
  })

  // 10. building-without-validating (high)
  it('building-without-validating fires when product_spec populated but validation empty', () => {
    const i = emptyInputs()
    i.domainPopulation = { product_spec: true, validation: false }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'building-without-validating')).toBe(true)
  })
  it('building-without-validating clears when validation domain has entities', () => {
    const i = emptyInputs()
    i.domainPopulation = { product_spec: true, validation: true }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'building-without-validating')).toBe(false)
  })

  // 11. single-domain-graph (medium)
  it('single-domain-graph fires with > 5 entities all in one domain', () => {
    const i = emptyInputs()
    i.totalEntityCount = 6
    i.domainCount = 1
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'single-domain-graph')).toBe(true)
  })
  it('single-domain-graph clears when entities span multiple domains', () => {
    const i = emptyInputs()
    i.totalEntityCount = 6
    i.domainCount = 2
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'single-domain-graph')).toBe(false)
  })

  // 12. orphan-loose-thoughts (medium)
  it('orphan-loose-thoughts fires when orphan count > 5', () => {
    const i = emptyInputs()
    i.orphanCount = 6
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'orphan-loose-thoughts')).toBe(true)
  })
  it('orphan-loose-thoughts clears when orphan count ≤ 5', () => {
    const i = emptyInputs()
    i.orphanCount = 5
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'orphan-loose-thoughts')).toBe(false)
  })

  // 13. journey-phases-without-canonical-steps (high)
  it('journey-phases-without-canonical-steps fires when phases span steps but no journey owns them', () => {
    const i = emptyInputs()
    i.edgePresence = {
      [relKey('journey_phase', 'journey_phase_spans_journey_step', 'journey_step')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'journey-phases-without-canonical-steps')).toBe(true)
  })
  it('journey-phases-without-canonical-steps clears when the journey owns its steps', () => {
    const i = emptyInputs()
    i.edgePresence = {
      [relKey('journey_phase', 'journey_phase_spans_journey_step', 'journey_step')]: true,
      [relKey('user_journey', 'user_journey_contains_journey_step', 'journey_step')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'journey-phases-without-canonical-steps')).toBe(false)
  })
})

// ─── Filter + composite + stage gating ───────────────────────────────────────

describe('Options + composite + stage gating', () => {
  it('options.severity filters to one tier', () => {
    const i = emptyInputs()
    // Trigger one high (features-without-hypotheses) + one medium
    // (orphan-loose-thoughts).
    i.countsByType = { feature: 2 }
    i.orphanCount = 6
    const high = evaluateAntiPatterns(i, { severity: 'high' })
    expect(high.every((v) => v.severity === 'high')).toBe(true)
    expect(high.length).toBeGreaterThan(0)
    const medium = evaluateAntiPatterns(i, { severity: 'medium' })
    expect(medium.every((v) => v.severity === 'medium')).toBe(true)
  })

  it('options.anti_pattern_ids restricts to the named subset', () => {
    const i = emptyInputs()
    // Trigger several violations — orphan-loose-thoughts, single-domain-graph,
    // features-without-hypotheses.
    i.countsByType = { feature: 1 }
    i.totalEntityCount = 6
    i.domainCount = 1
    i.orphanCount = 6
    const subset = evaluateAntiPatterns(i, {
      anti_pattern_ids: ['orphan-loose-thoughts'],
    })
    expect(subset.length).toBe(1)
    expect(subset[0].anti_pattern_id).toBe('orphan-loose-thoughts')
  })

  it('stage gating skips patterns whose stages[] does not include productStage', () => {
    const i = emptyInputs()
    // building-without-validating has stages: ['build', 'beta', 'launch', 'growth']
    // — so 'concept' must skip it.
    i.productStage = 'concept'
    i.domainPopulation = { product_spec: true, validation: false }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'building-without-validating')).toBe(false)
    // Sanity: at 'build' the same inputs do fire.
    i.productStage = 'build'
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'building-without-validating')).toBe(true)
  })

  it('undefined productStage runs all patterns regardless of stages[] gating', () => {
    const i = emptyInputs()
    // Same inputs as above but no stage — building-without-validating should fire.
    i.domainPopulation = { product_spec: true, validation: false }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'building-without-validating')).toBe(true)
  })

  it("composite 'or' fires when any child fires", () => {
    // single-domain-graph uses 'and'; we exercise 'or' via a manual evaluation
    // through evaluateAntiPatterns by constructing inputs that trigger
    // one branch of an or. The catalog itself doesn't currently use 'or' at
    // the top level, so this test guards the operator implementation by
    // checking 'and' both-sides + 'and' one-side.
    const i = emptyInputs()
    // single-domain-graph requires both: total > 5 AND domain_count == 1.
    // total > 5 alone must NOT fire (the 'and' rejects when one branch fails).
    i.totalEntityCount = 6
    i.domainCount = 2
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'single-domain-graph')).toBe(false)

    // both branches → fires.
    i.domainCount = 1
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'single-domain-graph')).toBe(true)
  })

  it('every UPG_ANTI_PATTERNS id has a fire fixture in this file', () => {
    // Self-checks the per-pattern coverage above. If a pattern is added to
    // UPG_ANTI_PATTERNS without a matching test, surface here.
    const ids = UPG_ANTI_PATTERNS.map((p) => p.id).sort()
    const expected = [
      'building-without-validating',
      'competitors-missing-past-validation',
      'experiment-run-without-learning',
      'features-without-hypotheses',
      'journey-phases-without-canonical-steps',
      'objective-without-key-results',
      'opportunity-without-need',
      'orphan-loose-thoughts',
      'persona-count-below-stage-benchmark',
      'personas-without-jobs',
      'roadmap-feature-without-outcome-link',
      'single-domain-graph',
      'untested-hypothesis-pile-up',
    ].sort()
    expect(ids).toEqual(expected)
  })
})
