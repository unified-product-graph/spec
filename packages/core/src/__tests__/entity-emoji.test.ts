/**
 * Entity emoji invariants (A1): every active type resolves to a glyph live, so
 * renderers can stop hardcoding and trust `get_type_label({type}).emoji`.
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_TYPE_LABELS,
  UPG_TYPE_LABELS_MAP,
  UPG_ACTIVE_TYPES,
  ENTITY_EMOJI,
  DEFAULT_ENTITY_EMOJI,
} from '../index.js'

describe('entity emoji (A1)', () => {
  it('every active type has a non-empty emoji on its UPGTypeLabel', () => {
    const missing = UPG_TYPE_LABELS.filter((l) => !l.emoji || l.emoji.length === 0)
    expect(missing.map((l) => l.id), 'types without an emoji').toEqual([])
  })

  it('UPG_TYPE_LABELS covers every active type and each resolves an emoji', () => {
    for (const type of UPG_ACTIVE_TYPES) {
      const label = UPG_TYPE_LABELS_MAP.get(type)
      expect(label, `no label for ${type}`).toBeDefined()
      expect(label!.emoji, `no emoji for ${type}`).toBeTruthy()
    }
  })

  it('ENTITY_EMOJI provides an explicit glyph for every active type (no fallback needed)', () => {
    const fellBack = UPG_ACTIVE_TYPES.filter((t) => ENTITY_EMOJI[t] === undefined)
    expect(fellBack, 'active types relying on DEFAULT_ENTITY_EMOJI').toEqual([])
  })

  it('the default glyph is defined for forward-compatibility', () => {
    expect(DEFAULT_ENTITY_EMOJI).toBeTruthy()
  })
})
