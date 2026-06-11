/**
 * — Curated Anti-Patterns Integrity Tests
 *
 * Asserts every entry in `UPG_ANTI_PATTERNS` is well-formed:
 *
 *   1. Ids are unique slugs (`^[a-z][a-z0-9-]*$`).
 *   2. `structured_condition` is well-formed (leaf check or compound
 *      `and`/`or` with valid children).
 *   3. Every entity_type referenced in a leaf check exists in the catalog.
 *   4. Every edge_type referenced in a relationship check exists in the catalog.
 *   5. Stages are valid `UPG_PRODUCT_STAGES` values.
 *   6. Severity is in the controlled vocab.
 *   7. Domain ids in `DomainPopulationCheck` match a registered domain.
 *   8. Required prose fields (description, why_it_matters, remediation) are non-empty.
 *
 * Adding a new anti-pattern surfaces here automatically — no test file edit
 * required as long as it conforms.
 */

import { describe, it, expect } from 'vitest'
import {
  UPG_ANTI_PATTERNS,
  getAntiPatternById,
  getAntiPatternsForStage,
  getAntiPatternsBySeverity,
  type UPGCuratedAntiPattern,
  type UPGAntiPatternSeverity,
} from '../intelligence/anti-patterns.js'
import type { IntelligenceCondition } from '../intelligence/intelligence.js'
import { UPG_ENTITY_META } from '../registry/entity-meta.js'
import { UPG_DOMAINS } from '../registry/domains.js'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_PRODUCT_STAGES } from '../intelligence/benchmarks/types.js'

const VALID_SEVERITIES: readonly UPGAntiPatternSeverity[] = ['high', 'medium', 'low']
const VALID_STAGES = new Set<string>(UPG_PRODUCT_STAGES)
const VALID_DOMAINS = new Set(UPG_DOMAINS.map((d) => d.id))
const VALID_ENTITY_TYPES = new Set(UPG_ENTITY_META.map((m) => m.name))
const VALID_EDGE_TYPES = new Set(Object.keys(UPG_EDGE_CATALOG))

// ─── Recursive condition walker ──────────────────────────────────────────────

function walkCondition(cond: IntelligenceCondition | undefined, fn: (leaf: object) => void): void {
  // Portfolio-scoped patterns carry no structured_condition (their detector is
  // cross-product, evaluated by portfolio_validate); nothing to walk.
  if (!cond) return
  if ('check' in cond) {
    fn(cond.check)
    return
  }
  if ('operator' in cond) {
    expect(cond.operator === 'and' || cond.operator === 'or').toBe(true)
    expect(Array.isArray(cond.checks)).toBe(true)
    expect(cond.checks.length, 'compound checks must have ≥1 child').toBeGreaterThanOrEqual(1)
    for (const child of cond.checks) walkCondition(child, fn)
    return
  }
  throw new Error(`Malformed IntelligenceCondition: ${JSON.stringify(cond)}`)
}

// ─── Per-rule integrity ──────────────────────────────────────────────────────

describe('UPG_ANTI_PATTERNS shape', () => {
  it('contains 13–20 entries (ticket scope + F5 enforcement + 0.9.13 foundations)', () => {
    expect(UPG_ANTI_PATTERNS.length).toBeGreaterThanOrEqual(13)
    expect(UPG_ANTI_PATTERNS.length).toBeLessThanOrEqual(20)
  })

  it('scope is graph (default) or portfolio, and the two carry conditions consistently', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      const scope = ap.scope ?? 'graph'
      expect(['graph', 'portfolio'], `${ap.id} scope ${scope}`).toContain(scope)
      if (scope === 'portfolio') {
        // Portfolio patterns are evaluated by portfolio_validate, not the
        // single-graph evaluator, so they carry no structured_condition and
        // declare the version that introduced them.
        expect(ap.structured_condition, `${ap.id} portfolio pattern must omit structured_condition`).toBeUndefined()
        expect(ap.since, `${ap.id} portfolio pattern must record a since version`).toBeTruthy()
      } else {
        expect(ap.structured_condition, `${ap.id} graph pattern must carry a structured_condition`).toBeDefined()
      }
    }
  })

  it('every id is a unique kebab-case slug', () => {
    const seen = new Set<string>()
    const slugRe = /^[a-z][a-z0-9-]*$/
    for (const ap of UPG_ANTI_PATTERNS) {
      expect(slugRe.test(ap.id), `bad id format: ${ap.id}`).toBe(true)
      expect(seen.has(ap.id), `duplicate id: ${ap.id}`).toBe(false)
      seen.add(ap.id)
    }
  })

  it('every entry has non-empty prose (name, description, why_it_matters, remediation)', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      expect(ap.name, `${ap.id} name`).toBeTruthy()
      expect(ap.name.length, `${ap.id} name length`).toBeLessThanOrEqual(60)
      expect(ap.description.length, `${ap.id} description`).toBeGreaterThan(40)
      expect(ap.why_it_matters.length, `${ap.id} why_it_matters`).toBeGreaterThan(20)
      expect(ap.remediation.length, `${ap.id} remediation`).toBeGreaterThan(20)
    }
  })

  it('every severity is in the controlled vocab', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      expect(VALID_SEVERITIES, `${ap.id} severity ${ap.severity}`).toContain(ap.severity)
    }
  })

  it('every stage is a valid UPG_PRODUCT_STAGES value', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      expect(ap.stages.length, `${ap.id} has at least 1 stage`).toBeGreaterThan(0)
      for (const stage of ap.stages) {
        expect(VALID_STAGES.has(stage), `${ap.id} stage ${stage}`).toBe(true)
      }
    }
  })
})

describe('Structured_condition well-formedness', () => {
  it('every condition is a leaf check or compound with valid operator', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      walkCondition(ap.structured_condition, () => {})
    }
  })

  it('every entity_type referenced exists in UPG_ENTITY_META', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      walkCondition(ap.structured_condition, (leaf) => {
        const l = leaf as { type: string; entity_type?: string; source_type?: string; target_type?: string }
        for (const k of ['entity_type', 'source_type', 'target_type'] as const) {
          if (l[k] !== undefined) {
            expect(VALID_ENTITY_TYPES.has(l[k]!), `${ap.id} ${k}=${l[k]}`).toBe(true)
          }
        }
      })
    }
  })

  it('every edge_type referenced exists in UPG_EDGE_CATALOG', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      walkCondition(ap.structured_condition, (leaf) => {
        const l = leaf as { type: string; edge_type?: string }
        if (l.type === 'relationship' && l.edge_type) {
          expect(VALID_EDGE_TYPES.has(l.edge_type), `${ap.id} edge ${l.edge_type}`).toBe(true)
        }
      })
    }
  })

  it('every domain_id in DomainPopulationCheck matches a registered domain', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      walkCondition(ap.structured_condition, (leaf) => {
        const l = leaf as { type: string; domain_id?: string }
        if (l.type === 'domain_population' && l.domain_id) {
          expect(VALID_DOMAINS.has(l.domain_id as never), `${ap.id} domain ${l.domain_id}`).toBe(true)
        }
      })
    }
  })

  it('every threshold-bearing comparison includes a threshold', () => {
    for (const ap of UPG_ANTI_PATTERNS) {
      walkCondition(ap.structured_condition, (leaf) => {
        const l = leaf as { type: string; comparison?: string; threshold?: number }
        const needsThreshold = l.comparison && !['zero', 'nonzero', 'exists', 'not_exists', 'below_min', 'above_max', 'within_range', 'missing'].includes(l.comparison)
        if (needsThreshold) {
          expect(l.threshold, `${ap.id} ${l.type} ${l.comparison} needs threshold`).toBeDefined()
        }
      })
    }
  })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

describe('Helpers', () => {
  it('getAntiPatternById returns the matching entry', () => {
    const features = getAntiPatternById('features-without-hypotheses')
    expect(features).toBeDefined()
    expect(features!.severity).toBe('high')
    expect(getAntiPatternById('not-a-real-pattern-xyz')).toBeUndefined()
  })

  it('getAntiPatternsForStage filters correctly', () => {
    for (const stage of UPG_PRODUCT_STAGES) {
      const filtered = getAntiPatternsForStage(stage)
      expect(filtered.every((ap) => ap.stages.includes(stage)), `stage ${stage}`).toBe(true)
    }
  })

  it('every concept-stage entry surfaces in the concept filter', () => {
    const concept = getAntiPatternsForStage('concept')
    const expected = UPG_ANTI_PATTERNS.filter((ap) => ap.stages.includes('concept'))
    expect(concept.length).toBe(expected.length)
  })

  it('getAntiPatternsBySeverity returns at least one high-severity entry', () => {
    const high = getAntiPatternsBySeverity('high')
    expect(high.length).toBeGreaterThanOrEqual(1)
    expect(high.every((ap) => ap.severity === 'high')).toBe(true)
  })
})

// ─── Cross-cutting ───────────────────────────────────────────────────────────

describe('Coverage', () => {
  it('the curated set spans high + medium severity tiers', () => {
    const severities = new Set(UPG_ANTI_PATTERNS.map((ap) => ap.severity))
    expect(severities.has('high')).toBe(true)
    expect(severities.has('medium')).toBe(true)
  })

  it('the curated set spans both leaf and compound conditions', () => {
    let leafCount = 0
    let compoundCount = 0
    for (const ap of UPG_ANTI_PATTERNS) {
      if (!ap.structured_condition) continue
      if ('check' in ap.structured_condition) leafCount++
      if ('operator' in ap.structured_condition) compoundCount++
    }
    expect(leafCount).toBeGreaterThan(0)
    expect(compoundCount).toBeGreaterThan(0)
  })

  it('the curated set spans multiple stages (validation, build, growth)', () => {
    const stages = new Set<string>()
    for (const ap of UPG_ANTI_PATTERNS) {
      for (const s of ap.stages) stages.add(s)
    }
    expect(stages.has('validation')).toBe(true)
    expect(stages.has('build')).toBe(true)
    expect(stages.has('growth')).toBe(true)
  })
})

// ───: v0.2 multi-chain coverage ─────────────────────────────────────

describe('Personas-without-jobs honours v0.2 multi-chain model', () => {
  const ap = getAntiPatternById('personas-without-jobs')!

  it('entry exists', () => {
    expect(ap).toBeDefined()
  })

  it('condition is a compound and with at least 5 checks (entity_count + 4 chain edges)', () => {
    expect(ap.structured_condition && 'operator' in ap.structured_condition).toBe(true)
    if (ap.structured_condition && 'operator' in ap.structured_condition) {
      expect(ap.structured_condition.operator).toBe('and')
      expect(ap.structured_condition.checks.length).toBeGreaterThanOrEqual(5)
    }
  })

  it('covers all four v0.2 persona chain edge types', () => {
    const edgesRequired = [
      'persona_pursues_job',
      'persona_experiences_need',
      'persona_aspires_to_desired_outcome',
      'persona_incurs_switching_cost',
    ]
    const edgesFound = new Set<string>()
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; edge_type?: string }
      if (l.type === 'relationship' && l.edge_type) edgesFound.add(l.edge_type)
    })
    for (const edge of edgesRequired) {
      expect(edgesFound.has(edge), `missing chain edge: ${edge}`).toBe(true)
    }
  })

  it('all chain edge checks use not_exists comparison', () => {
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; comparison?: string }
      if (l.type === 'relationship') {
        expect(l.comparison).toBe('not_exists')
      }
    })
  })
})

describe('Opportunity-without-need honours v0.2 multi-chain model', () => {
  const ap = getAntiPatternById('opportunity-without-need')!

  it('entry exists', () => {
    expect(ap).toBeDefined()
  })

  it('condition is a compound and with at least 5 checks (entity_count + 4 chain edges)', () => {
    expect(ap.structured_condition && 'operator' in ap.structured_condition).toBe(true)
    if (ap.structured_condition && 'operator' in ap.structured_condition) {
      expect(ap.structured_condition.operator).toBe('and')
      expect(ap.structured_condition.checks.length).toBeGreaterThanOrEqual(5)
    }
  })

  it('covers all valid opportunity upstream chain edge types', () => {
    const edgesRequired = [
      'opportunity_addresses_need',
      'opportunity_pursues_outcome',
      'opportunity_contextualises_job',
      'outcome_reveals_opportunity',
    ]
    const edgesFound = new Set<string>()
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; edge_type?: string }
      if (l.type === 'relationship' && l.edge_type) edgesFound.add(l.edge_type)
    })
    for (const edge of edgesRequired) {
      expect(edgesFound.has(edge), `missing chain edge: ${edge}`).toBe(true)
    }
  })

  it('all chain edge checks use not_exists comparison', () => {
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; comparison?: string }
      if (l.type === 'relationship') {
        expect(l.comparison).toBe('not_exists')
      }
    })
  })

  it('includes outcome_reveals_opportunity to cover reverse-direction chain', () => {
    let found = false
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; edge_type?: string; source_type?: string }
      if (l.type === 'relationship' && l.edge_type === 'outcome_reveals_opportunity') {
        expect(l.source_type).toBe('outcome')
        found = true
      }
    })
    expect(found, 'outcome_reveals_opportunity check missing').toBe(true)
  })
})

// ─── F5: anti-pattern enforcement additions ────────────────────────

describe('F5 insights-without-evidence enforces evidence-backed insights', () => {
  const ap = getAntiPatternById('insights-without-evidence')!

  it('entry exists and is high severity', () => {
    expect(ap).toBeDefined()
    expect(ap.severity).toBe('high')
  })

  it('is a compound `and` (insight present + all evidence links absent)', () => {
    expect(ap.structured_condition && 'operator' in ap.structured_condition).toBe(true)
    if (ap.structured_condition && 'operator' in ap.structured_condition) {
      expect(ap.structured_condition.operator).toBe('and')
      expect(ap.structured_condition.checks.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('covers all three primary-evidence edge types', () => {
    const required = [
      'observation_yields_insight',
      'survey_response_evidences_insight',
      'insight_evidenced_by_quote',
    ]
    const found = new Set<string>()
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; edge_type?: string }
      if (l.type === 'relationship' && l.edge_type) found.add(l.edge_type)
    })
    for (const edge of required) {
      expect(found.has(edge), `missing evidence edge: ${edge}`).toBe(true)
    }
  })

  it('all relationship checks use not_exists (fires only when evidence is fully absent)', () => {
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; comparison?: string }
      if (l.type === 'relationship') expect(l.comparison).toBe('not_exists')
    })
  })
})

describe('F5 feature-requests-without-provenance enforces sourced requests', () => {
  const ap = getAntiPatternById('feature-requests-without-provenance')!

  it('entry exists and is medium severity', () => {
    expect(ap).toBeDefined()
    expect(ap.severity).toBe('medium')
  })

  it('is a compound `and` (feature_request present + all provenance links absent)', () => {
    expect(ap.structured_condition && 'operator' in ap.structured_condition).toBe(true)
    if (ap.structured_condition && 'operator' in ap.structured_condition) {
      expect(ap.structured_condition.operator).toBe('and')
      expect(ap.structured_condition.checks.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('covers all three provenance edge types', () => {
    const required = [
      'feedback_program_collects_feature_request',
      'customer_feedback_becomes_feature_request',
      'feature_request_from_behavioral_segment',
    ]
    const found = new Set<string>()
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; edge_type?: string }
      if (l.type === 'relationship' && l.edge_type) found.add(l.edge_type)
    })
    for (const edge of required) {
      expect(found.has(edge), `missing provenance edge: ${edge}`).toBe(true)
    }
  })

  it('all relationship checks use not_exists (fires only when provenance is fully absent)', () => {
    walkCondition(ap.structured_condition, (leaf) => {
      const l = leaf as { type: string; comparison?: string }
      if (l.type === 'relationship') expect(l.comparison).toBe('not_exists')
    })
  })
})

// ─── Type-only smoke test ────────────────────────────────────────────────────

const _typeCheck: UPGCuratedAntiPattern = UPG_ANTI_PATTERNS[0]
void _typeCheck
