/**
 * team_contains_team — second-level team nesting (0.17.2, team_org).
 *
 * department_contains_team covers the first level (department -> team); this
 * covers a sub-team / squad nested inside another team in the same department.
 * Modelled parent -> child like feature_area_contains_feature_area so the org
 * map builds correctly in get_tree (source = parent), with the reverse verb
 * carrying the "part of" upward read. Within-graph only — NOT a cross-product
 * edge.
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_VALID_CHILDREN, getValidChildren } from '../grammar/hierarchy.js'
import { resolveContainmentEdge } from '../index.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'

describe('team_contains_team', () => {
  it('is a parent -> child hierarchy edge between two teams', () => {
    expect(UPG_EDGE_CATALOG.team_contains_team).toMatchObject({
      forward_verb: 'contains',
      reverse_verb: 'belongs_to',
      classification: 'hierarchy',
      source_type: 'team',
      target_type: 'team',
    })
  })

  it('lists team as a valid child of team (self-nesting)', () => {
    expect(UPG_VALID_CHILDREN.team).toContain('team')
    expect(getValidChildren('team')).toContain('team')
  })

  it('resolves as the canonical containment edge for a team -> team pair', () => {
    expect(resolveContainmentEdge('team', 'team')).toBe('team_contains_team')
  })

  it('is within-graph only — not a cross-product edge', () => {
    expect((UPG_CROSS_EDGE_TYPES as readonly string[]).includes('team_contains_team')).toBe(false)
  })

  it('mirrors the department -> team first level (same verbs, one level up)', () => {
    expect(UPG_EDGE_CATALOG.department_contains_team.forward_verb).toBe(
      UPG_EDGE_CATALOG.team_contains_team.forward_verb,
    )
    expect(UPG_EDGE_CATALOG.department_contains_team.reverse_verb).toBe(
      UPG_EDGE_CATALOG.team_contains_team.reverse_verb,
    )
  })
})
