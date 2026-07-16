/**
 * Property-modifier overlay ↔ generated schema sync (0.17.6).
 *
 * The overlay (`property-modifier-overlay.ts`) is the curated SOURCE of the
 * modifier annotations; the generator re-emits them onto `property-schema.ts`.
 * Until property-schema.ts formally rejoins `check:generated` (its non-modifier
 * body still has description/scale drift to reconcile), this test is the guard
 * that the two never silently diverge: every overlay entry must match the
 * committed schema, and every modifier in the committed schema must be in the
 * overlay. A mismatch means someone hand-edited one without the other.
 */
import { describe, it, expect } from 'vitest'
import { PROPERTY_MODIFIER_OVERLAY } from '../properties/property-modifier-overlay.js'
import { UPG_PROPERTY_SCHEMA, type PropertyDefinition } from '../properties/property-schema.js'

type Row = { key: string; modifier: string }

function overlayRows(): Row[] {
  const out: Row[] = []
  for (const [type, props] of Object.entries(PROPERTY_MODIFIER_OVERLAY)) {
    for (const [prop, modifier] of Object.entries(props)) out.push({ key: `${type}.${prop}`, modifier })
  }
  return out.sort((a, b) => a.key.localeCompare(b.key))
}

function schemaModifierRows(): Row[] {
  const out: Row[] = []
  for (const [type, props] of Object.entries(UPG_PROPERTY_SCHEMA)) {
    for (const [prop, def] of Object.entries(props as Record<string, PropertyDefinition>)) {
      if (def?.modifier) out.push({ key: `${type}.${prop}`, modifier: def.modifier })
    }
  }
  return out.sort((a, b) => a.key.localeCompare(b.key))
}

describe('property-modifier overlay ↔ schema sync', () => {
  it('the overlay and the committed schema carry exactly the same modifiers', () => {
    expect(overlayRows()).toEqual(schemaModifierRows())
  })

  it('every overlay key names a real top-level property (no dangling annotations)', () => {
    const dangling: string[] = []
    for (const [type, props] of Object.entries(PROPERTY_MODIFIER_OVERLAY)) {
      const schemaProps = UPG_PROPERTY_SCHEMA[type] as Record<string, PropertyDefinition> | undefined
      for (const prop of Object.keys(props)) {
        if (!schemaProps?.[prop]) dangling.push(`${type}.${prop}`)
      }
    }
    expect(dangling).toEqual([])
  })

  it('carries the audited count: 117 annotations (29 derived, 65 snapshot, 23 volatile)', () => {
    // 0.24.0: account.annual_contract_value added as a snapshot (64 -> 65 snapshot).
    const rows = overlayRows()
    expect(rows).toHaveLength(117)
    const by = (m: string) => rows.filter((r) => r.modifier === m).length
    expect(by('derived')).toBe(29)
    expect(by('snapshot')).toBe(65)
    expect(by('volatile')).toBe(23)
  })
})
