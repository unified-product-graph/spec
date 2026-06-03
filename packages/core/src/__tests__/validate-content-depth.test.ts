/**
 * — content-depth validation: property TYPE, property ENUM, and
 * self-loop edges, plus F10 whitespace-only titles.
 *
 * Severity contract (spec-evolution discipline; the real .upg/entopo.upg
 * carries ~44 type/enum drift findings, so promoting these to errors would
 * brick existing graphs on load):
 *   - property type mismatch  -> WARNING (rule 'property-type')
 *   - enum membership          -> WARNING (rule 'property-enum')
 *   - self-loop edge           -> WARNING (rule 'self-loop')
 *   - whitespace-only title    -> ERROR (extends the existing required-title
 *                                  check; closes the "" vs "   " asymmetry)
 *
 * Warnings never flip `valid`, so the document keeps loading. The CLI `verify`
 * command re-classifies the tagged warnings as policy violations (exit 2).
 */

import { describe, it, expect } from 'vitest'
import {
  validateUPGDocument,
  CONTENT_DEPTH_WARNING_RULES,
  type UPGValidationWarning,
} from '../grammar/validate.js'

const baseDoc = (
  nodes: Array<Record<string, unknown>>,
  edges: Array<Record<string, unknown>> = [],
) => ({
  upg_version: '0.2.4',
  exported_at: '2026-04-27T20:00:00Z',
  source: { tool: 'test', tool_version: '0.0.0' },
  product: { id: 'p_test', title: 'Test product' },
  nodes,
  edges,
})

const warningsByRule = (warnings: UPGValidationWarning[], rule: string) =>
  warnings.filter((w) => w.rule === rule)

describe('content-depth validation', () => {
  describe('property TYPE checks (F5)', () => {
    it('warns when an assessment-typed property is a primitive number', () => {
      const doc = baseDoc([
        { id: 'n1', type: 'need', title: 'A real need', properties: { frequency: 99 } },
      ])
      const result = validateUPGDocument(doc)
      const typeWarnings = warningsByRule(result.warnings, 'property-type')
      expect(typeWarnings.length).toBe(1)
      expect(typeWarnings[0].path).toBe('$.nodes[0].properties.frequency')
      expect(typeWarnings[0].message).toContain('should be assessment')
      expect(typeWarnings[0].message).toContain('got number')
    })

    it('does NOT flip valid for a type mismatch (warning, not error)', () => {
      const doc = baseDoc([
        { id: 'n1', type: 'need', title: 'A real need', properties: { frequency: 99 } },
      ])
      const result = validateUPGDocument(doc)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('accepts a well-formed assessment object for an assessment property', () => {
      const doc = baseDoc([
        {
          id: 'n1',
          type: 'need',
          title: 'A real need',
          properties: { frequency: { value: 4, label: 'often', scale_id: 'frequency_5' } },
        },
      ])
      const result = validateUPGDocument(doc)
      expect(warningsByRule(result.warnings, 'property-type')).toEqual([])
    })

    it('warns when an object-typed value is supplied as a string', () => {
      // market_trend.impact is an assessment (object); a bare string is wrong.
      const doc = baseDoc([
        { id: 'n1', type: 'market_trend', title: 'AI', properties: { impact: 'high' } },
      ])
      const result = validateUPGDocument(doc)
      const typeWarnings = warningsByRule(result.warnings, 'property-type')
      expect(typeWarnings.length).toBeGreaterThanOrEqual(1)
      expect(typeWarnings.some((w) => w.path.endsWith('.impact'))).toBe(true)
    })

    it('does not check properties absent from the entity schema (author extensions)', () => {
      const doc = baseDoc([
        {
          id: 'n1',
          type: 'need',
          title: 'A real need',
          properties: { not_a_spec_property: 12345, another_extra: { freeform: true } },
        },
      ])
      const result = validateUPGDocument(doc)
      expect(warningsByRule(result.warnings, 'property-type')).toEqual([])
      expect(warningsByRule(result.warnings, 'property-enum')).toEqual([])
    })

    it('treats null/undefined property values as absent, not a mismatch', () => {
      const doc = baseDoc([
        { id: 'n1', type: 'need', title: 'A real need', properties: { frequency: null, valence: undefined } },
      ])
      const result = validateUPGDocument(doc)
      expect(warningsByRule(result.warnings, 'property-type')).toEqual([])
      expect(warningsByRule(result.warnings, 'property-enum')).toEqual([])
    })

    it('skips property checks entirely for unknown / alias entity types', () => {
      const doc = baseDoc([
        { id: 'n1', type: 'not_a_real_type_xyz', title: 'X', properties: { frequency: 99 } },
      ])
      const result = validateUPGDocument(doc)
      expect(warningsByRule(result.warnings, 'property-type')).toEqual([])
    })
  })

  describe('property ENUM checks (F5)', () => {
    it('warns when a closed-enum property has an out-of-set value', () => {
      const doc = baseDoc([
        { id: 'n1', type: 'need', title: 'A real need', properties: { valence: 'banana' } },
      ])
      const result = validateUPGDocument(doc)
      const enumWarnings = warningsByRule(result.warnings, 'property-enum')
      expect(enumWarnings.length).toBe(1)
      expect(enumWarnings[0].path).toBe('$.nodes[0].properties.valence')
      expect(enumWarnings[0].message).toContain('"banana"')
      expect(enumWarnings[0].message).toContain('pain')
    })

    it('does NOT flip valid for an enum violation (warning, not error)', () => {
      const doc = baseDoc([
        { id: 'n1', type: 'need', title: 'A real need', properties: { valence: 'banana' } },
      ])
      const result = validateUPGDocument(doc)
      expect(result.valid).toBe(true)
    })

    it('accepts an in-set enum value', () => {
      const doc = baseDoc([
        { id: 'n1', type: 'need', title: 'A real need', properties: { valence: 'pain' } },
      ])
      const result = validateUPGDocument(doc)
      expect(warningsByRule(result.warnings, 'property-enum')).toEqual([])
    })

    it('skips the enum check when the value already failed the type check', () => {
      // valence is enum string; a number both type-mismatches and cannot be
      // enum-checked. Exactly one (type) warning should fire, no enum warning.
      const doc = baseDoc([
        { id: 'n1', type: 'need', title: 'A real need', properties: { valence: 7 } },
      ])
      const result = validateUPGDocument(doc)
      expect(warningsByRule(result.warnings, 'property-type').length).toBe(1)
      expect(warningsByRule(result.warnings, 'property-enum')).toEqual([])
    })

    it('flags both findings for the canonical F5 repro', () => {
      const doc = baseDoc([
        {
          id: 'n1',
          type: 'need',
          title: 'A real need',
          properties: { frequency: 99, valence: 'banana' },
        },
      ])
      const result = validateUPGDocument(doc)
      expect(warningsByRule(result.warnings, 'property-type').length).toBe(1)
      expect(warningsByRule(result.warnings, 'property-enum').length).toBe(1)
      expect(result.valid).toBe(true) // still loads
    })
  })

  describe('self-loop edges (F8)', () => {
    it('warns when an edge has source === target', () => {
      const doc = baseDoc(
        [{ id: 'n1', type: 'persona', title: 'Solo' }],
        [{ id: 'e1', source: 'n1', target: 'n1', type: 'relates_to' }],
      )
      const result = validateUPGDocument(doc)
      const selfLoops = warningsByRule(result.warnings, 'self-loop')
      expect(selfLoops.length).toBe(1)
      expect(selfLoops[0].path).toBe('$.edges[0]')
      expect(selfLoops[0].message).toContain('source and target are the same node')
    })

    it('does NOT flip valid for a self-loop (warning, not error)', () => {
      const doc = baseDoc(
        [{ id: 'n1', type: 'persona', title: 'Solo' }],
        [{ id: 'e1', source: 'n1', target: 'n1', type: 'relates_to' }],
      )
      const result = validateUPGDocument(doc)
      expect(result.valid).toBe(true)
    })

    it('does not warn for a normal edge between distinct nodes', () => {
      const doc = baseDoc(
        [
          { id: 'n1', type: 'persona', title: 'A' },
          { id: 'n2', type: 'persona', title: 'B' },
        ],
        [{ id: 'e1', source: 'n1', target: 'n2', type: 'relates_to' }],
      )
      const result = validateUPGDocument(doc)
      expect(warningsByRule(result.warnings, 'self-loop')).toEqual([])
    })
  })

  describe('whitespace-only titles ( F10)', () => {
    it('flags a whitespace-only title as an ERROR (closes the "" vs "   " gap)', () => {
      const doc = baseDoc([{ id: 'n1', type: 'persona', title: '   ' }])
      const result = validateUPGDocument(doc)
      expect(result.valid).toBe(false)
      const titleError = result.errors.find((e) => e.path === '$.nodes[0].title')
      expect(titleError).toBeDefined()
      expect(titleError?.message).toContain('blank')
    })

    it('still flags an empty-string title as an error (unchanged behaviour)', () => {
      const doc = baseDoc([{ id: 'n1', type: 'persona', title: '' }])
      const result = validateUPGDocument(doc)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.path === '$.nodes[0].title')).toBe(true)
    })

    it('accepts a title with leading/trailing whitespace around real content', () => {
      const doc = baseDoc([{ id: 'n1', type: 'persona', title: '  Real  ' }])
      const result = validateUPGDocument(doc)
      expect(result.errors.some((e) => e.path === '$.nodes[0].title')).toBe(false)
    })
  })

  describe('warning-rule contract', () => {
    it('exposes the content-depth warning rules (incl. framework-score)', () => {
      expect([...CONTENT_DEPTH_WARNING_RULES].sort()).toEqual(
        ['framework-score', 'property-enum', 'property-type', 'self-loop'],
      )
    })

    it('every content-depth finding carries a recognised rule code', () => {
      const doc = baseDoc(
        [{ id: 'n1', type: 'need', title: 'A real need', properties: { frequency: 99, valence: 'banana' } }],
        [{ id: 'e1', source: 'n1', target: 'n1', type: 'relates_to' }],
      )
      const result = validateUPGDocument(doc)
      const tagged = result.warnings.filter((w) => w.rule !== undefined)
      expect(tagged.length).toBe(3)
      for (const w of tagged) {
        expect(CONTENT_DEPTH_WARNING_RULES.has(w.rule!)).toBe(true)
      }
    })
  })
})
