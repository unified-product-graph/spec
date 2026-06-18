/**
 * Template conformance gate — keeps @unified-product-graph/templates in lockstep
 * with the live spec (@unified-product-graph/core).
 *
 * This is the drift-guard for the templates package, the same pattern used for
 * the site's CLI/SDK reference (#2176). It re-runs, as assertions, the 2026-06-18
 * audit that found 75 invalid properties + 27 invalid status values after the
 * 0.10→0.16 property-fit cleanups (Pattern D/E/G) moved the schema underneath
 * frozen templates. Any future spec change that removes a property, renames a
 * status phase, or retires an edge will now fail CI here instead of silently
 * shipping a stale template.
 *
 * Sources of truth, all from core:
 *   - entity type validity      → UPG_TYPES_SET / isDeprecatedType
 *   - property keys             → getPropertySchema(type)
 *   - status values             → getLifecycleForType(type).phases
 *   - canonical edge per pair   → pickCanonicalEdge(source, target)
 *
 * Placeholder values ("{{...}}") are skipped for status, since they are filled
 * at apply time, not authored literally.
 */
import { describe, it, expect } from 'vitest'
import * as core from '@unified-product-graph/core'
import { ALL_TEMPLATES, STARTER_SEEDS } from '../index.js'

const typeOk = (t: string): boolean =>
  (core as any).UPG_TYPES_SET?.has?.(t) ?? (core as any).UPG_TYPES?.includes?.(t) ?? false

const isPlaceholder = (v: unknown): boolean => typeof v === 'string' && v.includes('{{')

describe('templates are conformant with the live spec', () => {
  // Guard: the property/status/edge checks below reach into core via optional
  // chaining and skip silently when a helper is absent — convenient, but it
  // means a core refactor that renames a helper would turn this whole gate into
  // a vacuous pass. Assert up front that every introspection helper the gate
  // depends on still resolves, so such a regression fails loudly here instead.
  it('core exposes every introspection helper the gate relies on', () => {
    const c = core as any
    expect(typeof c.getPropertySchema, 'getPropertySchema').toBe('function')
    expect(typeof c.getLifecycleForType, 'getLifecycleForType').toBe('function')
    expect(typeof c.pickCanonicalEdge, 'pickCanonicalEdge').toBe('function')
    expect(typeof c.isDeprecatedType, 'isDeprecatedType').toBe('function')
    expect(Array.isArray(c.UPG_PRODUCT_STAGES) && c.UPG_PRODUCT_STAGES.length, 'UPG_PRODUCT_STAGES').toBeTruthy()
    expect((c.UPG_TYPES_SET?.size ?? c.UPG_TYPES?.length) || 0, 'UPG type registry').toBeGreaterThan(0)
  })

  it('every template set has the required shape', () => {
    expect(ALL_TEMPLATES.length).toBeGreaterThan(0)
    for (const tpl of ALL_TEMPLATES) {
      expect(tpl.id, 'template id').toBeTruthy()
      expect(tpl.name, `${tpl.id} name`).toBeTruthy()
      expect(tpl.description, `${tpl.id} description`).toBeTruthy()
      expect(tpl.entities.length, `${tpl.id} entities`).toBeGreaterThan(0)
    }
  })

  it('every entity uses a known, non-deprecated type', () => {
    const offenders: string[] = []
    for (const tpl of ALL_TEMPLATES) {
      tpl.entities.forEach((e, i) => {
        if ((core as any).isDeprecatedType?.(e.type)) {
          offenders.push(`${tpl.id}[${i}] ${e.type} is deprecated`)
        } else if (!typeOk(e.type)) {
          offenders.push(`${tpl.id}[${i}] ${e.type} is unknown`)
        }
      })
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('every default property exists in the current schema for its type', () => {
    const offenders: string[] = []
    for (const tpl of ALL_TEMPLATES) {
      tpl.entities.forEach((e, i) => {
        const schema = (core as any).getPropertySchema?.(e.type)
        const validKeys = schema ? new Set(Object.keys(schema)) : null
        for (const k of Object.keys(e.default_properties ?? {})) {
          if (k === 'status') continue // base-node field, validated separately
          if (validKeys && !validKeys.has(k)) {
            offenders.push(`${tpl.id}[${i}] ${e.type}.${k}`)
          }
        }
      })
    }
    expect(offenders, `invalid properties:\n${offenders.join('\n')}`).toEqual([])
  })

  it('every literal status value is valid for its type lifecycle', () => {
    const offenders: string[] = []
    for (const tpl of ALL_TEMPLATES) {
      tpl.entities.forEach((e, i) => {
        const st = e.default_status ?? (e.default_properties?.status as string | undefined)
        if (!st || isPlaceholder(st)) return
        const lc = (core as any).getLifecycleForType?.(e.type)
        const phases: string[] | null = lc?.phases?.map((p: { id: string }) => p.id) ?? null
        if (phases && !phases.includes(st)) {
          offenders.push(`${tpl.id}[${i}] ${e.type} status="${st}" (valid: ${phases.join('|')})`)
        }
      })
    }
    expect(offenders, `invalid status:\n${offenders.join('\n')}`).toEqual([])
  })

  it('every edge is typed with the canonical edge for its endpoint pair', () => {
    const offenders: string[] = []
    for (const tpl of ALL_TEMPLATES) {
      const types = tpl.entities.map((e) => e.type)
      for (const ed of tpl.edges ?? []) {
        const inBounds =
          ed.source_index >= 0 &&
          ed.source_index < types.length &&
          ed.target_index >= 0 &&
          ed.target_index < types.length
        if (!inBounds) {
          offenders.push(`${tpl.id} edge ${ed.source_index}->${ed.target_index} out of bounds`)
          continue
        }
        const s = types[ed.source_index]
        const t = types[ed.target_index]
        // pickCanonicalEdge returns the edge type as a bare string (e.g.
        // "persona_pursues_job"); tolerate an object shape too for safety.
        const canonical = (core as any).pickCanonicalEdge?.(s, t)
        const canonicalType: string | undefined =
          typeof canonical === 'string' ? canonical : canonical?.type ?? canonical?.id
        if (!canonicalType) {
          offenders.push(`${tpl.id} ${s}->${t}: no canonical edge resolves`)
        } else if (!ed.type) {
          offenders.push(`${tpl.id} ${s}->${t}: edge is untyped (expected "${canonicalType}")`)
        } else if (ed.type !== canonicalType) {
          offenders.push(`${tpl.id} ${s}->${t}: type="${ed.type}" but canonical is "${canonicalType}"`)
        }
      }
    }
    expect(offenders, `edge issues:\n${offenders.join('\n')}`).toEqual([])
  })

  it('every literal enum property value is allowed by the schema', () => {
    // The property-key check above proves the key exists; this proves the
    // *value* is in range. Without it, a typo like pattern: "b2b" (valid key,
    // bogus value) would ship silently — enum membership isn't otherwise gated.
    const offenders: string[] = []
    for (const tpl of ALL_TEMPLATES) {
      tpl.entities.forEach((e, i) => {
        const schema = (core as any).getPropertySchema?.(e.type)
        if (!schema) return
        for (const [k, v] of Object.entries(e.default_properties ?? {})) {
          if (k === 'status') continue // lifecycle phase, validated separately
          const allowed: unknown = schema[k]?.enum
          if (!Array.isArray(allowed)) continue // not an enum property
          const values = Array.isArray(v) ? v : [v]
          for (const val of values) {
            if (isPlaceholder(val)) continue // filled at apply time
            if (typeof val === 'string' && !allowed.includes(val)) {
              offenders.push(`${tpl.id}[${i}] ${e.type}.${k}="${val}" (allowed: ${(allowed as string[]).join('|')})`)
            }
          }
        }
      })
    }
    expect(offenders, `invalid enum values:\n${offenders.join('\n')}`).toEqual([])
  })

  it('every template stage is a canonical UPG product stage', () => {
    const stages: string[] = (core as any).UPG_PRODUCT_STAGES ?? []
    const valid = new Set(stages)
    const offenders: string[] = []
    for (const tpl of ALL_TEMPLATES) {
      for (const s of tpl.stages ?? []) {
        if (!valid.has(s)) {
          offenders.push(`${tpl.id}: stage "${s}" is not canonical (valid: ${stages.join('|')})`)
        }
      }
    }
    expect(offenders, `non-canonical stages:\n${offenders.join('\n')}`).toEqual([])
  })
})

describe('starter seeds (the upg init quickstart roster) are conformant', () => {
  it('exposes a seed list for every roster key', () => {
    const keys = Object.keys(STARTER_SEEDS)
    expect(keys).toContain('blank')
    expect(keys.length).toBeGreaterThan(1)
  })

  it('every seed node uses a known, non-deprecated type', () => {
    const offenders: string[] = []
    for (const [key, seeds] of Object.entries(STARTER_SEEDS)) {
      for (const s of seeds) {
        if ((core as any).isDeprecatedType?.(s.type)) {
          offenders.push(`${key}: ${s.type} is deprecated`)
        } else if (!typeOk(s.type)) {
          offenders.push(`${key}: ${s.type} is unknown`)
        }
        expect(s.title, `${key} seed title`).toBeTruthy()
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('blank is empty', () => {
    expect(STARTER_SEEDS.blank).toEqual([])
  })
})
