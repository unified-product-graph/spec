/**
 * The configuration projection operator (0.30.0).
 *
 * π is the whole union/projection model in one function, so the properties it
 * commits to are pinned here rather than left to the prose: identity on
 * invariant graphs (the zero-migration guarantee), commutativity across axes,
 * partiality as retention, and NO cascade.
 *
 * The no-cascade case is the one worth reading. It looks like a bug until you
 * remember the field report: a navigation row splits in two under a flag and an
 * occupant MOVES into the new row. Cascading deletion from an excluded parent
 * would delete a surface that is genuinely present in that configuration.
 *
 * Fixture names are invented, per the standing anonymity rule.
 */
import { describe, it, expect } from 'vitest'
import {
  projectGraph,
  enumerateProjections,
  readActiveWhen,
  type ProjectableNode,
  type ProjectableEdge,
  type Configuration,
} from '../grammar/projection.js'

const axisNav: ProjectableNode = {
  id: 'ax_nav',
  type: 'configuration_axis',
  properties: { values: ['legacy', 'split'], default_value: 'legacy', kind: 'feature_flag' },
}
const axisPlan: ProjectableNode = {
  id: 'ax_plan',
  type: 'configuration_axis',
  properties: { values: ['free', 'pro'], default_value: 'free' },
}

function surface(id: string): ProjectableNode {
  return { id, type: 'surface', properties: {} }
}

/** varies_by edge: `id` exists only under `values` of `axis`. */
function variesBy(id: string, axis: string, values: string[]): ProjectableEdge {
  return {
    id: `e_var_${id}`,
    source: id,
    target: axis,
    type: 'surface_varies_by_configuration_axis',
    properties: { present_under: values },
  }
}

/** containment edge, optionally qualified. */
function contains(
  parent: string,
  child: string,
  qualifier?: { axis: string; values: string[] },
): ProjectableEdge {
  return {
    id: `e_c_${parent}_${child}`,
    source: parent,
    target: child,
    type: 'surface_contains_surface',
    properties: qualifier ? { active_when: qualifier } : {},
  }
}

describe('identity: a graph declaring no variance projects to itself', () => {
  const nodes = [surface('sf_a'), surface('sf_b')]
  const edges = [contains('sf_a', 'sf_b')]

  it('returns the union under an empty configuration', () => {
    const r = projectGraph(nodes, edges, {})
    expect(r.nodes).toHaveLength(2)
    expect(r.edges).toHaveLength(1)
    expect(r.excluded_node_ids).toEqual([])
  })

  it('returns the union under ANY configuration', () => {
    // The zero-migration guarantee. Every graph written before 0.30.0 declares
    // no variance, so no projection of it can differ from it.
    const configs: Configuration[] = [{ ax_nav: 'legacy' }, { ax_nav: 'split' }, { ax_plan: 'pro' }]
    for (const config of configs) {
      const r = projectGraph(nodes, edges, config)
      expect(r.nodes).toHaveLength(2)
      expect(r.edges).toHaveLength(1)
    }
  })
})

describe('node exclusion and dangling removal', () => {
  // A split-only surface, contained by an always-present shell.
  const nodes = [axisNav, surface('sf_shell'), surface('sf_split_row')]
  const edges = [
    variesBy('sf_split_row', 'ax_nav', ['split']),
    contains('sf_shell', 'sf_split_row'),
  ]

  it('drops the node and its now-dangling edge under the excluded value', () => {
    const r = projectGraph(nodes, edges, { ax_nav: 'legacy' })
    expect(r.nodes.map((n) => n.id)).toEqual(['ax_nav', 'sf_shell'])
    expect(r.excluded_node_ids).toEqual(['sf_split_row'])
    // Both the containment edge AND the varies_by edge itself dangle.
    expect(r.edges).toHaveLength(0)
    expect(r.dangling_edge_count).toBe(2)
  })

  it('keeps everything under the value it is present in', () => {
    const r = projectGraph(nodes, edges, { ax_nav: 'split' })
    expect(r.nodes).toHaveLength(3)
    expect(r.excluded_node_ids).toEqual([])
  })

  it('retains the node when its axis is not named (partiality is retention)', () => {
    const r = projectGraph(nodes, edges, { ax_plan: 'pro' })
    expect(r.nodes).toHaveLength(3)
    expect(r.excluded_node_ids).toEqual([])
  })
})

describe('edge deactivation', () => {
  // Both endpoints exist in every configuration; only the RELATIONSHIP moves.
  // This is the case a node-level declaration cannot express.
  const nodes = [axisNav, surface('sf_row_one'), surface('sf_row_two'), surface('sf_occupant')]
  const edges = [
    contains('sf_row_one', 'sf_occupant', { axis: 'ax_nav', values: ['legacy'] }),
    contains('sf_row_two', 'sf_occupant', { axis: 'ax_nav', values: ['split'] }),
  ]

  it('keeps exactly the branch whose values include the chosen one', () => {
    const legacy = projectGraph(nodes, edges, { ax_nav: 'legacy' })
    expect(legacy.edges.map((e) => e.source)).toEqual(['sf_row_one'])
    expect(legacy.deactivated_edge_count).toBe(1)

    const split = projectGraph(nodes, edges, { ax_nav: 'split' })
    expect(split.edges.map((e) => e.source)).toEqual(['sf_row_two'])
  })

  it('keeps BOTH in the union, which is exactly why validation must project', () => {
    // The union is a superposition: the occupant appears in two rows at once.
    // Any check counting occupancy over the union sees a graph no configuration
    // ever renders, which is the false-positive class this release exists to
    // stop recreating.
    const union = projectGraph(nodes, edges, {})
    expect(union.edges).toHaveLength(2)
  })
})

describe('no cascade: a child is not dropped because its parent was', () => {
  // The reported case, reduced. Under `split` the old row disappears and the
  // occupant moves to the new row; the occupant itself exists in both.
  const nodes = [axisNav, surface('sf_legacy_row'), surface('sf_split_row'), surface('sf_occupant')]
  const edges = [
    variesBy('sf_legacy_row', 'ax_nav', ['legacy']),
    variesBy('sf_split_row', 'ax_nav', ['split']),
    contains('sf_legacy_row', 'sf_occupant', { axis: 'ax_nav', values: ['legacy'] }),
    contains('sf_split_row', 'sf_occupant', { axis: 'ax_nav', values: ['split'] }),
  ]

  it('keeps the occupant when its legacy parent is excluded', () => {
    const r = projectGraph(nodes, edges, { ax_nav: 'split' })
    const ids = r.nodes.map((n) => n.id)
    expect(ids).toContain('sf_occupant')
    expect(ids).not.toContain('sf_legacy_row')
    // It is reparented, not orphaned: the split row contains it here.
    expect(r.edges.filter((e) => e.type === 'surface_contains_surface').map((e) => e.source)).toEqual(
      ['sf_split_row'],
    )
  })

  it('keeps it in the other direction too', () => {
    const r = projectGraph(nodes, edges, { ax_nav: 'legacy' })
    const ids = r.nodes.map((n) => n.id)
    expect(ids).toContain('sf_occupant')
    expect(ids).not.toContain('sf_split_row')
  })
})

describe('commutativity across axes', () => {
  const nodes = [axisNav, axisPlan, surface('sf_a'), surface('sf_b'), surface('sf_c')]
  const edges = [
    variesBy('sf_a', 'ax_nav', ['split']),
    variesBy('sf_b', 'ax_plan', ['pro']),
    contains('sf_c', 'sf_a'),
    contains('sf_c', 'sf_b'),
  ]

  it('gives the same result in either order, and applied together', () => {
    // Each axis's predicate reads only that axis, so multi-axis projection
    // needs no ordering rule. Pinned because a future qualifier that read two
    // axes at once would quietly break it.
    const both = projectGraph(nodes, edges, { ax_nav: 'legacy', ax_plan: 'free' })

    const navFirst = projectGraph(nodes, edges, { ax_nav: 'legacy' })
    const navThenPlan = projectGraph(navFirst.nodes, navFirst.edges, { ax_plan: 'free' })

    const planFirst = projectGraph(nodes, edges, { ax_plan: 'free' })
    const planThenNav = projectGraph(planFirst.nodes, planFirst.edges, { ax_nav: 'legacy' })

    const ids = (r: { nodes: ProjectableNode[] }) => r.nodes.map((n) => n.id).sort()
    expect(ids(navThenPlan)).toEqual(ids(both))
    expect(ids(planThenNav)).toEqual(ids(both))
    expect(ids(both)).toEqual(['ax_nav', 'ax_plan', 'sf_c'])
  })
})

describe('malformed declarations fail toward showing too much', () => {
  it('a varies_by edge with no readable present_under leaves the node in place', () => {
    // Stating a dependency without saying what it depends on must not silently
    // delete a surface from every projection. The validator names it instead.
    const nodes = [axisNav, surface('sf_a')]
    const edges: ProjectableEdge[] = [
      { id: 'e', source: 'sf_a', target: 'ax_nav', type: 'surface_varies_by_configuration_axis', properties: {} },
    ]
    const r = projectGraph(nodes, edges, { ax_nav: 'legacy' })
    expect(r.nodes.map((n) => n.id)).toContain('sf_a')
  })

  it('a malformed active_when reads as absent, so the edge stays invariant', () => {
    expect(readActiveWhen({ source: 'a', target: 'b', properties: { active_when: 'nonsense' } })).toBeUndefined()
    expect(readActiveWhen({ source: 'a', target: 'b', properties: { active_when: { axis: 'x' } } })).toBeUndefined()
    expect(readActiveWhen({ source: 'a', target: 'b', properties: {} })).toBeUndefined()
    expect(
      readActiveWhen({ source: 'a', target: 'b', properties: { active_when: { axis: 'x', values: ['v'] } } }),
    ).toEqual({ axis: 'x', values: ['v'] })
  })
})

describe('enumerateProjections', () => {
  it('is the union plus one entry per declared value, never the cartesian product', () => {
    // 1 + 2 + 2 = 5, not 1 + 4. Linear in the declarations by design.
    const list = enumerateProjections([axisNav, axisPlan, surface('sf_a')])
    expect(list).toHaveLength(5)
    expect(list[0]).toEqual({ configuration: {} })
    expect(list.filter((p) => p.axis === 'ax_nav').map((p) => p.value)).toEqual(['legacy', 'split'])
  })

  it('returns only the union for a graph with no axes', () => {
    expect(enumerateProjections([surface('sf_a')])).toEqual([{ configuration: {} }])
  })
})
