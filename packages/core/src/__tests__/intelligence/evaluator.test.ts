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
import { isThinCoverageAdvisory, THIN_GRAPH_THRESHOLD } from '../../intelligence/validation-profiles.js'

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
  it('every graph-scoped anti-pattern has a per-pattern test below', () => {
    // If the catalog grows past this count, this test fails. The author
    // should add matching fire/clear fixtures here. Stable count guard.
    // 13 original + 2 F5 enforcement + 2 operating-function (0.17.0) + 4
    // portfolio-scoped (3 foundations 0.9.13 + the 0.17.0 org-link, evaluated by
    // portfolio_validate not here) + 1 planning-cadence (0.20.0) + 3 surface
    // (0.27.0) = 25.
    expect(UPG_ANTI_PATTERNS.length).toBe(25)
    expect(UPG_ANTI_PATTERNS.filter((p) => (p.scope ?? 'graph') !== 'portfolio').length).toBe(21)
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

// ─── Thin-graph coverage softening (0.17.0, companion C) ─────────────────────

describe('Thin-graph coverage softening', () => {
  it('coverage patterns are advisory below the thin threshold', () => {
    expect(isThinCoverageAdvisory('single-domain-graph', THIN_GRAPH_THRESHOLD - 1)).toBe(true)
    expect(isThinCoverageAdvisory('competitors-missing-past-validation', 3)).toBe(true)
  })
  it('coverage patterns gate at or above the threshold', () => {
    expect(isThinCoverageAdvisory('single-domain-graph', THIN_GRAPH_THRESHOLD)).toBe(false)
    expect(isThinCoverageAdvisory('single-domain-graph', 20)).toBe(false)
  })
  it('non-coverage patterns are never softened by thinness', () => {
    expect(isThinCoverageAdvisory('features-without-hypotheses', 1)).toBe(false)
    expect(isThinCoverageAdvisory('orphan-loose-thoughts', 1)).toBe(false)
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

  // 7b. planning-cycle-without-scheduled-work (low, 0.20.0)
  it('planning-cycle-without-scheduled-work fires with a cycle that schedules nothing and nests nothing', () => {
    const i = emptyInputs()
    i.countsByType = { planning_cycle: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'planning-cycle-without-scheduled-work')).toBe(true)
  })
  it('planning-cycle-without-scheduled-work clears when the cycle schedules a user_story', () => {
    const i = emptyInputs()
    i.countsByType = { planning_cycle: 1 }
    i.edgePresence = {
      [relKey('planning_cycle', 'planning_cycle_schedules_user_story', 'user_story')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'planning-cycle-without-scheduled-work')).toBe(false)
  })

  // 8. competitors-missing-past-validation (medium, benchmark — needs stage).
  // Fires from build onward (0.17.2: dropped validation so the name "past
  // validation" holds and young concept/validation graphs are exempt).
  it('competitors-missing-past-validation fires when competitor count < benchmark min at build', () => {
    const i = emptyInputs()
    i.productStage = 'build' // benchmark.min = 3
    i.countsByType = { competitor: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'competitors-missing-past-validation')).toBe(true)
  })
  it('competitors-missing-past-validation does not fire at validation (young-graph exempt)', () => {
    const i = emptyInputs()
    i.productStage = 'validation'
    i.countsByType = { competitor: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'competitors-missing-past-validation')).toBe(false)
  })
  it('competitors-missing-past-validation clears at or above benchmark min', () => {
    const i = emptyInputs()
    i.productStage = 'build'
    i.countsByType = { competitor: 3 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'competitors-missing-past-validation')).toBe(false)
  })

  // 9. persona-count-below-stage-benchmark (medium, benchmark — needs stage).
  // Fires from beta onward (0.17.2: dropped validation/build so a one-persona
  // beachhead graph at build is not a false alarm).
  it('persona-count-below-stage-benchmark fires when persona count < benchmark min at beta', () => {
    const i = emptyInputs()
    i.productStage = 'beta' // benchmark.min = 3
    i.countsByType = { persona: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'persona-count-below-stage-benchmark')).toBe(true)
  })
  it('persona-count-below-stage-benchmark does not fire at build (beachhead-persona exempt)', () => {
    const i = emptyInputs()
    i.productStage = 'build'
    i.countsByType = { persona: 1 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'persona-count-below-stage-benchmark')).toBe(false)
  })
  it('persona-count-below-stage-benchmark clears at or above benchmark min', () => {
    const i = emptyInputs()
    i.productStage = 'beta'
    i.countsByType = { persona: 3 }
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
  it('single-domain-graph does not fire at build but does at beta (0.17.2 young-graph exempt)', () => {
    const atBuild = emptyInputs()
    atBuild.productStage = 'build'
    atBuild.totalEntityCount = 6
    atBuild.domainCount = 1
    expect(fired(firedIds(evaluateAntiPatterns(atBuild)), 'single-domain-graph')).toBe(false)
    const atBeta = emptyInputs()
    atBeta.productStage = 'beta'
    atBeta.totalEntityCount = 6
    atBeta.domainCount = 1
    expect(fired(firedIds(evaluateAntiPatterns(atBeta)), 'single-domain-graph')).toBe(true)
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

  // 14. insights-without-evidence (high) — F5
  it('insights-without-evidence fires when insights exist with no evidence link', () => {
    const i = emptyInputs()
    i.countsByType = { insight: 2 }
    // edgePresence empty → no observation / survey / quote backing
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'insights-without-evidence')).toBe(true)
  })
  it('insights-without-evidence clears when at least one evidence link exists', () => {
    const i = emptyInputs()
    i.countsByType = { insight: 2 }
    i.edgePresence = {
      [relKey('observation', 'observation_yields_insight', 'insight')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'insights-without-evidence')).toBe(false)
  })
  it('insights-without-evidence also clears via a quote link', () => {
    const i = emptyInputs()
    i.countsByType = { insight: 1 }
    i.edgePresence = {
      [relKey('insight', 'insight_evidenced_by_quote', 'quote')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'insights-without-evidence')).toBe(false)
  })

  // 15. feature-requests-without-provenance (medium) — F5
  it('feature-requests-without-provenance fires when requests exist with no source link', () => {
    const i = emptyInputs()
    i.countsByType = { feature_request: 3 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'feature-requests-without-provenance')).toBe(true)
  })
  it('feature-requests-without-provenance clears when a provenance link exists', () => {
    const i = emptyInputs()
    i.countsByType = { feature_request: 3 }
    i.edgePresence = {
      [relKey('feedback_program', 'feedback_program_collects_feature_request', 'feature_request')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'feature-requests-without-provenance')).toBe(false)
  })
  it('feature-requests-without-provenance also clears via a behavioural-segment link', () => {
    const i = emptyInputs()
    i.countsByType = { feature_request: 1 }
    i.edgePresence = {
      [relKey('feature_request', 'feature_request_from_behavioral_segment', 'behavioral_segment')]: true,
    }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'feature-requests-without-provenance')).toBe(false)
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

  // operating-function-without-north-star (operating concern; operating_function only)
  it('operating-function-without-north-star fires for a function with content but no metric', () => {
    const i = emptyInputs()
    i.memberKind = 'operating_function'
    i.totalEntityCount = 6
    i.countsByType = { account: 4 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'operating-function-without-north-star')).toBe(true)
  })
  it('operating-function-without-north-star still fires when a metric exists but none is north-star', () => {
    const i = emptyInputs()
    i.memberKind = 'operating_function'
    i.totalEntityCount = 6
    i.countsByType = { account: 4, metric: 1 }
    i.countsByTypeAndProperty = { metric: { designation: { vanity: 1 } } }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'operating-function-without-north-star')).toBe(true)
  })
  it('operating-function-without-north-star clears when a north-star metric exists', () => {
    const i = emptyInputs()
    i.memberKind = 'operating_function'
    i.totalEntityCount = 6
    i.countsByType = { account: 4, metric: 1 }
    i.countsByTypeAndProperty = { metric: { designation: { north_star: 1 } } }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'operating-function-without-north-star')).toBe(false)
  })

  // operating-function-without-operating-content (operating concern)
  it('operating-function-without-operating-content fires when only strategy/team_org are populated', () => {
    const i = emptyInputs()
    i.memberKind = 'operating_function'
    i.totalEntityCount = 6
    i.domainPopulation = { strategy: true, team_org: true }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'operating-function-without-operating-content')).toBe(true)
  })
  it('operating-function-without-operating-content clears when an operating domain is populated', () => {
    const i = emptyInputs()
    i.memberKind = 'operating_function'
    i.totalEntityCount = 6
    i.domainPopulation = { strategy: true, sales: true }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'operating-function-without-operating-content')).toBe(false)
  })

  // Profile evaluate-scope (0.17.0): a member kind only evaluates its profile's
  // concern families, so product-spine noise never reaches a function graph and
  // operating patterns never reach a product graph.
  it('operating_function does NOT evaluate product-spine patterns', () => {
    const i = emptyInputs()
    i.memberKind = 'operating_function'
    i.countsByType = { feature: 2 } // would fire features-without-hypotheses for a product
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'features-without-hypotheses')).toBe(false)
  })
  it('a product graph (default) evaluates product-spine and skips operating patterns', () => {
    const i = emptyInputs()
    i.totalEntityCount = 6
    i.countsByType = { feature: 2 }
    const ids = firedIds(evaluateAntiPatterns(i))
    expect(fired(ids, 'features-without-hypotheses')).toBe(true)
    expect(fired(ids, 'operating-function-without-north-star')).toBe(false)
  })

  // ── surface (0.27.0, reworked 0.28.0) ─────────────────────────────────────
  // contended-surface-without-arbitration exercises the property-PRESENCE
  // filter, which the value-keyed filter cannot express: the collector only
  // indexes values that exist, so "nobody filled this in" has to be derived
  // from countsByType minus the presence count.
  //
  // 0.28.0 qualifies that filter with a declared exemption
  // (`composition_mode: 'chained'`) and adds two admission branches
  // (`arbitration_state` of `safe_by_coincidence` / `none`). The helper below
  // builds inputs the way a CURRENT collector would, so each test states only
  // the surface population it cares about.
  //
  // The full firing matrix (rule = arbitration_rule, state = arbitration_state):
  //
  //   state                  rule      chained?  fires   via
  //   ---------------------  --------  --------  ------  ------------------
  //   (unset)                absent    no        YES     presence
  //   (unset)                absent    YES       no      exempted
  //   (unset)                present   either    no      -
  //   enforced_documented    absent    no        YES     presence
  //   enforced_documented    present   either    no      -
  //   enforced_undocumented  absent    no        YES     presence
  //   enforced_undocumented  present   either    no      -
  //   safe_by_coincidence    present   either    YES     admission
  //   none                   present   either    YES     admission
  const surfaceInputs = (opts: {
    total: number
    /** Surfaces declaring composition_mode: 'chained'. */
    chained?: number
    /** Surfaces carrying a non-empty arbitration_rule AND not chained. */
    ruleNotChained?: number
    /** Surfaces carrying a non-empty arbitration_rule, chained or not. */
    ruleAll?: number
    /** arbitration_state value → count. */
    states?: Record<string, number>
    /** Omit the 0.28.0 index entirely, as a pre-0.28.0 collector would. */
    staleCollector?: boolean
  }) => {
    const i = emptyInputs()
    i.totalEntityCount = 10 + opts.total
    i.countsByType = { surface: opts.total, feature: 4 }
    i.edgePresence = { [relKey('feature', 'feature_occupies_surface', 'surface')]: true }
    i.countsByTypeAndPropertyPresence = { surface: { arbitration_rule: opts.ruleAll ?? 0 } }
    i.countsByTypeAndProperty = {
      surface: {
        composition_mode: { chained: opts.chained ?? 0 },
        arbitration_state: opts.states ?? {},
      },
    }
    if (!opts.staleCollector) {
      i.countsByTypeAndPropertyPresenceExcept = {
        surface: { 'arbitration_rule!composition_mode=chained': opts.ruleNotChained ?? 0 },
      }
    }
    return i
  }
  const contended = (i: ReturnType<typeof surfaceInputs>) =>
    fired(firedIds(evaluateAntiPatterns(i)), 'contended-surface-without-arbitration')

  it('fires when features occupy surfaces that carry no arbitration_rule', () => {
    expect(contended(surfaceInputs({ total: 3 }))).toBe(true)
  })
  it('still fires when only SOME surfaces carry a rule', () => {
    expect(contended(surfaceInputs({ total: 3, ruleAll: 2, ruleNotChained: 2 }))).toBe(true)
  })
  it('clears when every surface carries a rule', () => {
    expect(contended(surfaceInputs({ total: 3, ruleAll: 3, ruleNotChained: 3 }))).toBe(false)
  })
  it('clears when no feature occupies any surface', () => {
    const i = surfaceInputs({ total: 3 })
    i.edgePresence = {}
    expect(contended(i)).toBe(false)
  })

  // ── the chained exemption (the reported false positive) ────────────────────
  it('clears when the ONLY rule-less surfaces have declared composition_mode chained', () => {
    // The reported field case, reduced: 30 surfaces, 14 of them chained slots
    // with many occupants and no rule BY DESIGN, the other 16 documented. Before
    // 0.28.0 this graph could not be silenced by correct modelling at all — and
    // because get_anti_pattern_violations_for attributes by TYPE, the 14 kept
    // the whole surface roster lit.
    expect(contended(surfaceInputs({ total: 30, chained: 14, ruleAll: 16, ruleNotChained: 16 })))
      .toBe(false)
  })
  it('still fires when one non-chained surface remains undocumented among chained ones', () => {
    // 30 surfaces, 14 chained, only 15 of the remaining 16 documented. The
    // exemption must not blanket the neighbours.
    expect(contended(surfaceInputs({ total: 30, chained: 14, ruleAll: 15, ruleNotChained: 15 })))
      .toBe(true)
  })
  it('exemption is DECLARE-TO-EARN: an unset composition_mode still fires', () => {
    // Same shape as the exempted case but with nothing declared. The default
    // posture stays suspicious; silence has to be claimed.
    expect(contended(surfaceInputs({ total: 30, chained: 0, ruleAll: 16, ruleNotChained: 16 })))
      .toBe(true)
  })
  it('a chained surface that ALSO carries a rule does not over-credit the exemption', () => {
    // 5 surfaces: 2 chained (1 of which also wrote a rule), 3 non-chained of
    // which 2 wrote rules. Eligible = 3, with-rule-and-not-chained = 2, so one
    // genuinely undocumented surface remains and the check must still fire.
    expect(contended(surfaceInputs({ total: 5, chained: 2, ruleAll: 3, ruleNotChained: 2 })))
      .toBe(true)
  })

  // ── arbitration_state: the admissions ──────────────────────────────────────
  it('safe_by_coincidence fires even when every surface carries a rule', () => {
    // The state a written rule can MASK: prose describing disjoint enum values
    // doing the arbitrating with nothing guarding them reads as documented to
    // the presence branch. This is the branch that catches it.
    expect(contended(surfaceInputs({
      total: 3, ruleAll: 3, ruleNotChained: 3, states: { safe_by_coincidence: 1 },
    }))).toBe(true)
  })
  it('safe_by_coincidence fires even when the surface is chained', () => {
    // No chained exemption on the admission branches on purpose: declaring the
    // hazard outranks any claim about how occupants compose.
    expect(contended(surfaceInputs({
      total: 3, chained: 3, ruleAll: 3, ruleNotChained: 0, states: { safe_by_coincidence: 1 },
    }))).toBe(true)
  })
  it('none fires even when every surface carries a rule', () => {
    // A graph asserting "nobody decided" while carrying rule text contradicts
    // itself. The admission is the half to believe.
    expect(contended(surfaceInputs({
      total: 3, ruleAll: 3, ruleNotChained: 3, states: { none: 1 },
    }))).toBe(true)
  })
  it('enforced_undocumented does NOT suppress: it fires through the presence branch', () => {
    // Enforced in code, never transcribed → no arbitration_rule → presence
    // branch fires. The state changes the REMEDIATION (ten minutes of typing,
    // not a design meeting), not whether the pattern is reported.
    expect(contended(surfaceInputs({
      total: 3, ruleAll: 0, ruleNotChained: 0, states: { enforced_undocumented: 3 },
    }))).toBe(true)
  })
  it('enforced_documented does NOT silence the check on its own', () => {
    // The escape-hatch guard. Claiming the rule is documented without writing
    // one leaves the presence branch firing, so the enum cannot be used the way
    // arbitration_rule's docs forbid placeholder text from being used.
    expect(contended(surfaceInputs({
      total: 3, ruleAll: 0, ruleNotChained: 0, states: { enforced_documented: 3 },
    }))).toBe(true)
  })
  it('enforced_documented WITH a written rule clears, which is the only clean exit', () => {
    expect(contended(surfaceInputs({
      total: 3, ruleAll: 3, ruleNotChained: 3, states: { enforced_documented: 3 },
    }))).toBe(false)
  })

  // ── degradation ────────────────────────────────────────────────────────────
  it('a stale collector over-reports rather than silently under-reporting', () => {
    // A pre-0.28.0 collector emits no except index. Reading it as zero means
    // every eligible surface looks rule-less, so the check fires where it might
    // not need to. For a detector whose job is noticing omissions, a false
    // alarm is the safe failure and a missed one is not.
    expect(contended(surfaceInputs({
      total: 3, ruleAll: 3, ruleNotChained: 3, staleCollector: true,
    }))).toBe(true)
  })

  it('surface-without-job fires when surfaces exist with no serves_job edge', () => {
    const i = emptyInputs()
    i.totalEntityCount = 10
    i.countsByType = { surface: 2 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'surface-without-job')).toBe(true)
  })
  it('surface-without-job clears once a surface serves a job', () => {
    const i = emptyInputs()
    i.totalEntityCount = 10
    i.countsByType = { surface: 2, job: 1 }
    i.edgePresence = { [relKey('surface', 'surface_serves_job', 'job')]: true }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'surface-without-job')).toBe(false)
  })

  it('surface-without-measurement fires when surfaces exist with no metric edge', () => {
    const i = emptyInputs()
    i.totalEntityCount = 10
    i.countsByType = { surface: 2 }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'surface-without-measurement')).toBe(true)
  })
  it('surface-without-measurement clears once a surface is measured', () => {
    const i = emptyInputs()
    i.totalEntityCount = 10
    i.countsByType = { surface: 2, metric: 1 }
    i.edgePresence = { [relKey('surface', 'surface_measured_by_metric', 'metric')]: true }
    expect(fired(firedIds(evaluateAntiPatterns(i)), 'surface-without-measurement')).toBe(false)
  })
  it('both surface coverage companions are thin-graph advisory, the contention one is not', () => {
    // They presuppose a graph big enough to expect breadth; a 3-node stub that
    // sketched one surface has not drifted.
    expect(isThinCoverageAdvisory('surface-without-job', THIN_GRAPH_THRESHOLD - 1)).toBe(true)
    expect(isThinCoverageAdvisory('surface-without-measurement', THIN_GRAPH_THRESHOLD - 1)).toBe(true)
    expect(isThinCoverageAdvisory('contended-surface-without-arbitration', THIN_GRAPH_THRESHOLD - 1)).toBe(false)
  })

  it('every graph-scoped UPG_ANTI_PATTERNS id has a fire fixture in this file', () => {
    // Self-checks the per-pattern coverage above. If a pattern is added to
    // UPG_ANTI_PATTERNS without a matching test, surface here. Portfolio-scoped
    // patterns are evaluated by portfolio_validate (cross-product + registry),
    // not the single-graph evaluator, so they are excluded here.
    const ids = UPG_ANTI_PATTERNS.filter((p) => (p.scope ?? 'graph') !== 'portfolio')
      .map((p) => p.id)
      .sort()
    const expected = [
      'building-without-validating',
      'competitors-missing-past-validation',
      'experiment-run-without-learning',
      'feature-requests-without-provenance',
      'features-without-hypotheses',
      'insights-without-evidence',
      'journey-phases-without-canonical-steps',
      'objective-without-key-results',
      'operating-function-without-north-star',
      'operating-function-without-operating-content',
      'opportunity-without-need',
      'orphan-loose-thoughts',
      'persona-count-below-stage-benchmark',
      'personas-without-jobs',
      'planning-cycle-without-scheduled-work',
      'roadmap-feature-without-outcome-link',
      'single-domain-graph',
      'contended-surface-without-arbitration',
      'surface-without-job',
      'surface-without-measurement',
      'untested-hypothesis-pile-up',
    ].sort()
    expect(ids).toEqual(expected)
  })
})
