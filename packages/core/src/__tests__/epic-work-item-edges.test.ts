/**
 * Epic-level work-item edges — feedback df99026a.
 *
 * The product-delivery hierarchy let `task` and `bug` attach only at `feature`
 * (feature_decomposes_into_task, feature_affected_by_bug), while `epic`'s only
 * child was `user_story` (epic_specified_by_user_story). Importing a real
 * tracker (Linear/Jira) forced heterogeneous tickets — bugs, spikes, infra
 * tasks that belong to ONE epic — to be mislabelled `user_story` to keep the
 * epic grouping. These two additive edges mirror the feature-level twins so a
 * bug/task can nest under its epic with its true type. Everything downstream
 * (pair map, pickCanonicalEdge, resolveContainmentEdge, the adapter import path)
 * derives from the catalog, so the two entries are the whole change.
 *
 * Run: npx vitest run src/__tests__/epic-work-item-edges.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import {
  UPG_EDGE_PAIR_MAP,
  resolveContainmentEdge,
  pickCanonicalEdge,
} from '../index.js'

describe('df99026a — epic → task', () => {
  it('epic_decomposes_into_task exists and mirrors feature_decomposes_into_task', () => {
    const def = UPG_EDGE_CATALOG.epic_decomposes_into_task
    const twin = UPG_EDGE_CATALOG.feature_decomposes_into_task
    expect(def).toBeDefined()
    expect(def.source_type).toBe('epic')
    expect(def.target_type).toBe('task')
    expect(def.classification).toBe('hierarchy')
    expect(def.forward_verb).toBe(twin.forward_verb)
    expect(def.reverse_verb).toBe(twin.reverse_verb)
  })

  it('resolveContainmentEdge("epic","task") returns the canonical edge', () => {
    expect(resolveContainmentEdge('epic', 'task')).toBe('epic_decomposes_into_task')
  })

  it('UPG_EDGE_PAIR_MAP indexes the epic → task pair', () => {
    expect(UPG_EDGE_PAIR_MAP['epic:task']).toContain('epic_decomposes_into_task')
  })
})

describe('df99026a — epic → bug', () => {
  it('epic_affected_by_bug exists and mirrors feature_affected_by_bug', () => {
    const def = UPG_EDGE_CATALOG.epic_affected_by_bug
    const twin = UPG_EDGE_CATALOG.feature_affected_by_bug
    expect(def).toBeDefined()
    expect(def.source_type).toBe('epic')
    expect(def.target_type).toBe('bug')
    expect(def.classification).toBe('hierarchy')
    expect(def.forward_verb).toBe(twin.forward_verb)
    expect(def.reverse_verb).toBe(twin.reverse_verb)
  })

  it('resolveContainmentEdge("epic","bug") returns the canonical edge', () => {
    expect(resolveContainmentEdge('epic', 'bug')).toBe('epic_affected_by_bug')
  })

  it('UPG_EDGE_PAIR_MAP indexes the epic → bug pair', () => {
    expect(UPG_EDGE_PAIR_MAP['epic:bug']).toContain('epic_affected_by_bug')
  })
})

describe('df99026a — epic is no longer a user_story-only parent', () => {
  it('epic has outgoing hierarchy edges to user_story, task, and bug', () => {
    const outgoing = Object.entries(UPG_EDGE_CATALOG)
      .filter(([, def]) => def.source_type === 'epic')
      .map(([key]) => key)
    expect(outgoing).toEqual(
      expect.arrayContaining([
        'epic_specified_by_user_story',
        'epic_decomposes_into_task',
        'epic_affected_by_bug',
      ]),
    )
  })

  it('pickCanonicalEdge picks the epic hierarchy edge for both work-item pairs', () => {
    expect(pickCanonicalEdge('epic', 'task', 'hierarchy')).toBe('epic_decomposes_into_task')
    expect(pickCanonicalEdge('epic', 'bug', 'hierarchy')).toBe('epic_affected_by_bug')
  })
})
