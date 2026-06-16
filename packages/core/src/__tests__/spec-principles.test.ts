/**
 * Spec Principle Tests
 *
 * Automated checks for the 18 governing principles of the UPG spec.
 * Each testable principle from schema-principles-and-process.md is encoded here.
 *
 * Run: npx vitest run src/__tests__/spec-principles.test.ts
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// ─── Layer 1: Vocabulary ─────────────────────────────────────────────────────
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'

// ─── Layer 1B: Registry ──────────────────────────────────────────────────────
import { UPG_ENTITY_META } from '../registry/entity-meta.js'
import { UPG_DOMAINS, getTypes } from '../registry/domains.js'

// ─── Layer 2: Grammar ────────────────────────────────────────────────────────
import { UPG_VALID_CHILDREN, UPG_CONTAINMENT_FREE_TYPES } from '../grammar/hierarchy.js'
import { UPG_SCALES } from '../grammar/scales.js'

// ─── Computed sets ───────────────────────────────────────────────────────────

const allActiveTypes = UPG_ENTITY_META
  .filter((m) => m.maturity === 'stable' || m.maturity === 'proposed')
  .map((m) => m.name)
const allActiveTypesSet = new Set(allActiveTypes)

// Known acceptable abbreviations (P1 allowlist)
const ALLOWED_ABBREVIATIONS = new Set([
  'a11y', 'api', 'ci', 'ip', 'qa', 'ai', 'ml', 'nps', 'seo', 'gtm',
  'okr', 'ddd', 'cac', 'ltv', 'mrr', 'arr',
])

// ─────────────────────────────────────────────────────────────────────────────
// P1 — Readability Over Brevity
// ─────────────────────────────────────────────────────────────────────────────

describe('P1 — Readability Over Brevity', () => {
  it('no active type name is a bare abbreviation (unless allowlisted)', () => {
    const bad: string[] = []
    for (const t of allActiveTypes) {
      // Check each word in the snake_case name
      const words = t.split('_')
      for (const w of words) {
        // Pure abbreviations: all consonants or ≤3 chars with no vowels
        if (w.length <= 3 && !/[aeiou]/.test(w) && !ALLOWED_ABBREVIATIONS.has(w) && !ALLOWED_ABBREVIATIONS.has(t)) {
          bad.push(`${t} (word "${w}" looks like an unexpanded abbreviation)`)
        }
      }
    }
    expect(bad).toEqual([])
  })

  it('every type name is at least 3 characters', () => {
    const bad = allActiveTypes.filter((t) => t.length < 3)
    expect(bad, `Type names shorter than 3 chars: ${bad.join(', ')}`).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P3 — Complete Property Schemas
// ─────────────────────────────────────────────────────────────────────────────

describe('P3 — Complete Property Schemas', () => {
  it('every active entity type has a property interface in UPGPropertyMap', () => {
    // Read the source file and extract registered type keys
    const mapSource = readFileSync(
      join(__dirname, '..', 'properties', 'property-map.ts'),
      'utf-8',
    )
    // Match lines like "  persona: PersonaProperties" or "  design_question: DesignQuestionProperties"
    const keyMatches = mapSource.matchAll(/^\s{2}(\w+):\s+\w+/gm)
    const propertyMapKeys = new Set([...keyMatches].map((m) => m[1]))

    const missing: string[] = []
    for (const t of allActiveTypes) {
      if (!propertyMapKeys.has(t)) missing.push(t)
    }
    expect(missing, `Active types missing property interfaces: ${missing.join(', ')}`).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P4 — Hierarchy Is Grammar
// ─────────────────────────────────────────────────────────────────────────────

describe('P4 — Hierarchy Is Grammar', () => {
  const allChildTypes = new Set<string>()
  for (const children of Object.values(UPG_VALID_CHILDREN)) {
    for (const child of children) allChildTypes.add(child)
  }
  // Types that appear as hierarchy keys (parents)
  const allParentTypes = new Set(Object.keys(UPG_VALID_CHILDREN))

  it('every active type appears as either a parent or a child in the hierarchy (unless containment-free)', () => {
    // Containment-free types (UPG_CONTAINMENT_FREE_TYPES) deliberately have
    // no structural parent — they are referenced via edges. The "Hierarchy
    // Is Grammar" principle still holds; containment-free types are a
    // grammar category, not an exemption from grammar. See
    // grammar/hierarchy.ts for the rationale.
    const orphans: string[] = []
    for (const t of allActiveTypes) {
      if (UPG_CONTAINMENT_FREE_TYPES.has(t)) continue
      if (!allParentTypes.has(t) && !allChildTypes.has(t)) {
        orphans.push(t)
      }
    }
    expect(orphans, `Types not in hierarchy at all: ${orphans.join(', ')}`).toEqual([])
  })

  it('no hierarchy key references a deprecated type', () => {
    const deprecated = new Set(
      UPG_ENTITY_META.filter((m) => m.maturity === 'deprecated').map((m) => m.name),
    )
    const bad: string[] = []
    for (const parent of Object.keys(UPG_VALID_CHILDREN)) {
      if (deprecated.has(parent)) bad.push(`parent: ${parent}`)
    }
    for (const [parent, children] of Object.entries(UPG_VALID_CHILDREN)) {
      for (const child of children) {
        if (deprecated.has(child)) bad.push(`${parent} → ${child}`)
      }
    }
    expect(bad, `Deprecated types in hierarchy:\n${bad.join('\n')}`).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P5 + P18 — Edges Have Forward and Reverse Verbs
// ─────────────────────────────────────────────────────────────────────────────

describe('P5 + P18 — Edges Have Verbs', () => {
  it('every edge has a non-empty forward_verb', () => {
    const bad: string[] = []
    for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
      if (!def.forward_verb || def.forward_verb.trim() === '') {
        bad.push(key)
      }
    }
    expect(bad).toEqual([])
  })

  it('every edge has a non-empty reverse_verb', () => {
    const bad: string[] = []
    for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
      if (!def.reverse_verb || def.reverse_verb.trim() === '') {
        bad.push(key)
      }
    }
    expect(bad).toEqual([])
  })

  it('no edge uses source/target type that is not an active entity type', () => {
    // 'node' is a valid wildcard type for polymorphic edges (any-to-any relationships)
    const WILDCARD_TYPES = new Set(['node'])
    const bad: string[] = []
    for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
      if (!allActiveTypesSet.has(def.source_type) && !WILDCARD_TYPES.has(def.source_type)) {
        bad.push(`${key}: source_type "${def.source_type}" not active`)
      }
      if (!allActiveTypesSet.has(def.target_type) && !WILDCARD_TYPES.has(def.target_type)) {
        bad.push(`${key}: target_type "${def.target_type}" not active`)
      }
    }
    expect(bad, `Edges with non-active types:\n${bad.join('\n')}`).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P6 — Domains Are Semantic Boundaries
// ─────────────────────────────────────────────────────────────────────────────

describe('P6 — Domains Are Semantic Boundaries', () => {
  it('every domain has a non-empty description', () => {
    const bad: string[] = []
    for (const d of UPG_DOMAINS) {
      if (!d.description || d.description.length < 20) {
        bad.push(`${d.id}: description too short or missing`)
      }
    }
    expect(bad).toEqual([])
  })

  it('every domain has at least 1 entity type', () => {
    // Runtime guard: the literal type narrowing would eliminate this branch,
    // so widen to number for the assertion to remain meaningful.
    const empty = UPG_DOMAINS.filter((d) => (d.types.length as number) === 0)
    expect(empty.map((d) => d.id)).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P14 — Foreign Keys Are Edges
// ─────────────────────────────────────────────────────────────────────────────

describe('P14 — Foreign Keys Are Edges', () => {
  it('no property file has fields ending in _id that reference graph entities', () => {
    const propsDir = join(__dirname, '..', 'properties', 'domains')
    const files = readdirSync(propsDir).filter((f) => f.endsWith('.ts'))

    // Known acceptable _id fields (external system IDs, not graph FKs)
    const allowlist = new Set([
      'tax_id', 'model_id', 'cve_id', 'rule_id', 'external_metric_id',
      'session_id', 'trace_id', 'run_id', 'benchmark_id', 'dataset_id',
      'pipeline_id', 'template_id', 'workflow_id', 'agent_id',
      'scale_id', 'bundle_id', 'locale_id', 'framework_id',
    ])

    const violations: string[] = []
    for (const file of files) {
      const content = readFileSync(join(propsDir, file), 'utf-8')
      const lines = content.split('\n')
      lines.forEach((line, i) => {
        const match = line.match(/(\w+_id)\??:\s*string/)
        if (match && !allowlist.has(match[1])) {
          // Check if it looks like a graph entity reference
          const fieldName = match[1]
          if (fieldName.endsWith('_id') && !line.includes('external') && !line.includes('P14')) {
            violations.push(`${file}:${i + 1} — ${fieldName}`)
          }
        }
      })
    }
    expect(violations, `Potential FK-as-property violations:\n${violations.join('\n')}`).toEqual([])
  })

  // Scalar-vs-edge ADR (2026-06-16): a property whose name resolves to a canonical
  // entity type is an entity reference and should be an edge, not a scalar.
  //
  // KEPT SKIPPED after the 0.12.0 P14-conformance sweep (Buckets A1/A2 removed the
  // real orphan/shadow offenders). The name-based heuristic below is too coarse to
  // be a hard gate: run against current source it flags ~23 hits, but ~20 are false
  // positives the rule cannot tell apart by name alone — content fields *named after
  // a concept that is also an entity* (`hypothesis`, `objective`, `mission`, `theme`,
  // `evidence`, `learning`, `positioning`) and compound descriptors that merely *end*
  // with an entity token (`agent_role`, `decision_outcome`, `triggering_event`,
  // `capacity_constraint`, `owning_team`). A field holding hypothesis *prose* is
  // indistinguishable from one holding a hypothesis *reference* without semantics.
  //
  // The real enforcement is therefore (a) the audit + the UPG_SCALAR_TO_EDGE_MIGRATIONS
  // registry (every conversion is recorded there), and (b) a future curated
  // `entity-reference-as-scalar` anti-pattern whose graph-instance detector needs a new
  // `dangling_scalar_reference` IntelligenceCondition check (value equals another node's
  // title with no edge between them) — deferred until that check primitive lands. This
  // block stays as a discovery aid for the next sweep, not a CI gate.
  it.skip('no property names a first-class entity as a scalar (use an edge)', async () => {
    const { UPG_ENTITY_META } = await import('../registry/entity-meta.js')
    const names = new Set(UPG_ENTITY_META.filter((e) => e.maturity !== 'removed').map((e) => e.name))
    const propsDir = join(__dirname, '..', 'properties', 'domains')
    const exempt = new Set(['competitor', 'axis', 'from_value', 'to_value']) // competitor_signal snapshot
    const violations: string[] = []
    for (const file of readdirSync(propsDir).filter((f) => f.endsWith('.ts'))) {
      readFileSync(join(propsDir, file), 'utf-8')
        .split('\n')
        .forEach((line, i) => {
          const m = line.match(/(\w+)\??:\s*(string|string\[\])\b/)
          if (!m) return
          const prop = m[1]
          const named = names.has(prop) || [...names].some((n) => prop.endsWith(`_${n}`))
          if (!named || exempt.has(prop)) return
          if (line.includes('@p14-exempt') || line.includes('display-cache')) return
          violations.push(`${file}:${i + 1} — ${prop}`)
        })
    }
    expect(violations, `entity-name scalars (should be edges):\n${violations.join('\n')}`).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P15 — Status Is a Two-Level Lifecycle
// ─────────────────────────────────────────────────────────────────────────────

describe('P15 — Two-Level Lifecycle', () => {
  it('every lifecycle has at least 2 phases', async () => {
    const { UPG_LIFECYCLES } = await import('../grammar/lifecycles.js')
    const bad: string[] = []
    for (const lc of UPG_LIFECYCLES) {
      if (lc.phases.length < 2) {
        bad.push(`${lc.entity_type}: only ${lc.phases.length} phase(s)`)
      }
    }
    expect(bad).toEqual([])
  })

  it('every lifecycle initial_phase is a valid phase in that lifecycle', async () => {
    const { UPG_LIFECYCLES } = await import('../grammar/lifecycles.js')
    const bad: string[] = []
    for (const lc of UPG_LIFECYCLES) {
      const phaseIds = new Set(lc.phases.map((p) => p.id))
      if (!phaseIds.has(lc.initial_phase)) {
        bad.push(`${lc.entity_type}: initial_phase "${lc.initial_phase}" not in phases`)
      }
    }
    expect(bad).toEqual([])
  })

  it('every lifecycle terminal_phase is a valid phase in that lifecycle', async () => {
    const { UPG_LIFECYCLES } = await import('../grammar/lifecycles.js')
    const bad: string[] = []
    for (const lc of UPG_LIFECYCLES) {
      const phaseIds = new Set(lc.phases.map((p) => p.id))
      for (const tp of lc.terminal_phases) {
        if (!phaseIds.has(tp)) {
          bad.push(`${lc.entity_type}: terminal_phase "${tp}" not in phases`)
        }
      }
    }
    expect(bad).toEqual([])
  })

  it('every lifecycle phase has valid transitions_to targets', async () => {
    const { UPG_LIFECYCLES } = await import('../grammar/lifecycles.js')
    const bad: string[] = []
    for (const lc of UPG_LIFECYCLES) {
      const phaseIds = new Set(lc.phases.map((p) => p.id))
      for (const phase of lc.phases) {
        for (const target of phase.transitions_to) {
          if (!phaseIds.has(target)) {
            bad.push(`${lc.entity_type}.${phase.id} → "${target}" (not a valid phase)`)
          }
        }
      }
    }
    expect(bad).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P17 — Assessments Are Qualitative
// ─────────────────────────────────────────────────────────────────────────────

describe('P17 — Assessments Are Qualitative', () => {
  it('no property file imports or references Scale1to5', () => {
    const propsDir = join(__dirname, '..', 'properties', 'domains')
    const files = readdirSync(propsDir).filter((f) => f.endsWith('.ts'))
    const violations: string[] = []
    for (const file of files) {
      const content = readFileSync(join(propsDir, file), 'utf-8')
      if (content.includes('Scale1to5')) {
        violations.push(file)
      }
    }
    expect(violations, `Files still using Scale1to5: ${violations.join(', ')}`).toEqual([])
  })

  it('every spec-defined scale has 5 points with values 1-5', () => {
    const bad: string[] = []
    for (const [id, scale] of Object.entries(UPG_SCALES)) {
      if (scale.points.length !== 5) {
        bad.push(`${id}: has ${scale.points.length} points (expected 5)`)
      }
      const values = scale.points.map((p) => p.value)
      if (JSON.stringify(values) !== JSON.stringify([1, 2, 3, 4, 5])) {
        bad.push(`${id}: values are [${values}] (expected [1,2,3,4,5])`)
      }
    }
    expect(bad).toEqual([])
  })

  it('every scale point has a non-empty label and description', () => {
    const bad: string[] = []
    for (const [id, scale] of Object.entries(UPG_SCALES)) {
      for (const point of scale.points) {
        if (!point.label) bad.push(`${id}[${point.value}]: missing label`)
        if (!point.description) bad.push(`${id}[${point.value}]: missing description`)
      }
    }
    expect(bad).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// P8 — No Orphan Entity Types
// ─────────────────────────────────────────────────────────────────────────────

describe('P8 — No Orphan Entity Types', () => {
  it('every active type appears as source or target in at least one edge', () => {
    const allTypes = getTypes()
    const edgeEntries = Object.values(UPG_EDGE_CATALOG)

    // Collect all types that appear in any edge definition
    const typesInEdges = new Set<string>()
    for (const edge of edgeEntries) {
      typesInEdges.add(edge.source_type)
      typesInEdges.add(edge.target_type)
    }

    // Also include types that appear in the hierarchy (as parent or child)
    const typesInHierarchy = new Set<string>()
    for (const [parent, children] of Object.entries(UPG_VALID_CHILDREN)) {
      typesInHierarchy.add(parent)
      for (const child of children) {
        typesInHierarchy.add(child)
      }
    }

    const orphans = allTypes.filter(
      (t) => !typesInEdges.has(t) && !typesInHierarchy.has(t),
    )

    expect(
      orphans,
      `Orphan types (no edges and not in hierarchy): ${orphans.join(', ')}`,
    ).toEqual([])
  })
})
