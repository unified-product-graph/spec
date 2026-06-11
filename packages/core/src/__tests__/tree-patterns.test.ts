/**
 * Tree-pattern catalogue integrity (get_tree, 0.9.15). Every pattern's anchor,
 * fallbacks, and child_map types must be active entity types; every child_map
 * parent must be reachable from the anchor (anchor or a fallback); every
 * framework_id link must resolve. These guard the patterns get_tree walks.
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_TREE_PATTERNS,
  UPG_TREE_PATTERNS_BY_ID,
  getTreePattern,
  UPG_TYPES_SET,
  UPG_FRAMEWORKS_BY_ID,
} from '../index.js'

const SLUG = /^[a-z][a-z0-9_]*$/

describe('UPG_TREE_PATTERNS integrity', () => {
  it('has the 8 canonical patterns with unique slug ids', () => {
    expect(UPG_TREE_PATTERNS.length).toBe(8)
    const ids = UPG_TREE_PATTERNS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id, `bad id ${id}`).toMatch(SLUG)
    for (const want of ['ost', 'okr', 'user', 'product', 'validation', 'strategy', 'feature_areas', 'delivery']) {
      expect(ids, `missing pattern ${want}`).toContain(want)
    }
  })

  it('every anchor, fallback, and child_map type is an active entity type', () => {
    for (const p of UPG_TREE_PATTERNS) {
      expect(UPG_TYPES_SET.has(p.anchor_type), `${p.id} anchor ${p.anchor_type}`).toBe(true)
      for (const fa of p.fallback_anchors) {
        expect(UPG_TYPES_SET.has(fa), `${p.id} fallback ${fa}`).toBe(true)
      }
      for (const [parent, children] of Object.entries(p.child_map)) {
        expect(UPG_TYPES_SET.has(parent), `${p.id} child_map parent ${parent}`).toBe(true)
        for (const c of children) {
          expect(UPG_TYPES_SET.has(c.type), `${p.id} child_map ${parent} -> ${c.type}`).toBe(true)
        }
      }
    }
  })

  it('every child_map parent is reachable from the anchor or a fallback anchor', () => {
    for (const p of UPG_TREE_PATTERNS) {
      const roots = new Set([p.anchor_type, ...p.fallback_anchors])
      const reachable = new Set(roots)
      // Fixpoint: expand reachable through child_map.
      let grew = true
      while (grew) {
        grew = false
        for (const [parent, children] of Object.entries(p.child_map)) {
          if (!reachable.has(parent)) continue
          for (const c of children) if (!reachable.has(c.type)) { reachable.add(c.type); grew = true }
        }
      }
      for (const parent of Object.keys(p.child_map)) {
        expect(reachable.has(parent), `${p.id}: child_map key ${parent} not reachable from anchor/fallbacks`).toBe(true)
      }
    }
  })

  it('required child slots are well-formed (boolean flag, at least one required slot per pattern)', () => {
    for (const p of UPG_TREE_PATTERNS) {
      let requiredCount = 0
      for (const children of Object.values(p.child_map)) {
        for (const c of children) {
          if (c.required !== undefined) expect(typeof c.required, `${p.id} ${c.type}.required`).toBe('boolean')
          if (c.required) requiredCount++
        }
      }
      // feature_areas and delivery are intentionally all-optional browse views
      // (heterogeneous wiring; gap-flagging would be noise). The framework
      // patterns each declare at least one gap-worthy required child.
      if (p.id !== 'feature_areas' && p.id !== 'delivery') {
        expect(requiredCount, `${p.id} has no required child slot`).toBeGreaterThan(0)
      }
    }
  })

  it('every framework_id link resolves to a canonical framework', () => {
    for (const p of UPG_TREE_PATTERNS) {
      if (p.framework_id !== undefined) {
        expect(UPG_FRAMEWORKS_BY_ID[p.framework_id], `${p.id} framework_id ${p.framework_id}`).toBeDefined()
      }
    }
  })

  it('natural_depth is a positive integer and prose fields are non-empty', () => {
    for (const p of UPG_TREE_PATTERNS) {
      expect(Number.isInteger(p.natural_depth) && p.natural_depth > 0, `${p.id} depth`).toBe(true)
      expect(p.label.length, `${p.id} label`).toBeGreaterThan(0)
      expect(p.description.length, `${p.id} description`).toBeGreaterThan(20)
    }
  })

  it('lookup helpers agree with the array', () => {
    expect(Object.keys(UPG_TREE_PATTERNS_BY_ID).length).toBe(UPG_TREE_PATTERNS.length)
    expect(getTreePattern('ost')?.anchor_type).toBe('outcome')
    expect(getTreePattern('not-a-pattern')).toBeUndefined()
  })
})
