/**
 * Configuration drift checks (0.30.0).
 *
 * Ten checks over the declarations themselves. Each has a fire case and, where
 * the boundary is interesting, a clear case, because a check that cannot be
 * cleared by correct modelling is the failure mode this whole surface family
 * has been correcting for two releases.
 *
 * Fixture names are invented, per the standing anonymity rule.
 */
import { describe, it, expect } from 'vitest'
import {
  checkConfigurationDrift,
  type ConfigurationDriftKind,
} from '../grammar/configuration-drift.js'
import type { ProjectableEdge, ProjectableNode } from '../grammar/projection.js'

const axis = (
  id: string,
  values: string[],
  extra: Record<string, unknown> = {},
): ProjectableNode => ({
  id,
  type: 'configuration_axis',
  properties: { values, ...extra },
})

const surface = (id: string): ProjectableNode => ({ id, type: 'surface', properties: {} })

const variesBy = (id: string, axisId: string, values: unknown): ProjectableEdge => ({
  id: `e_var_${id}`,
  source: id,
  target: axisId,
  type: 'surface_varies_by_configuration_axis',
  properties: { present_under: values },
})

const contains = (parent: string, child: string, props: Record<string, unknown> = {}): ProjectableEdge => ({
  id: `e_c_${parent}_${child}`,
  source: parent,
  target: child,
  type: 'surface_contains_surface',
  properties: props,
})

const kinds = (f: ReturnType<typeof checkConfigurationDrift>): ConfigurationDriftKind[] =>
  f.map((x) => x.kind)

describe('axis declarations', () => {
  it('fires when an axis declares no values', () => {
    const f = checkConfigurationDrift([axis('ax', [])], [])
    expect(kinds(f)).toContain('axis_values_empty')
  })

  it('fires when default_value is not one of the values', () => {
    const f = checkConfigurationDrift([axis('ax', ['a', 'b'], { default_value: 'c' })], [])
    expect(kinds(f)).toContain('axis_default_not_a_value')
  })

  it('clears a well-formed axis', () => {
    const f = checkConfigurationDrift([axis('ax', ['a', 'b'], { default_value: 'a' })], [])
    expect(f).toEqual([])
  })

  it('does not require a default_value', () => {
    // An axis with no default is legal: it forces every reader to choose, which
    // is honest. This is also why the alternation DIRECTION convention is not
    // enforced anywhere, since it keys on a default that need not exist.
    expect(checkConfigurationDrift([axis('ax', ['a', 'b'])], [])).toEqual([])
  })
})

describe('conditional existence', () => {
  const nodes = [axis('ax', ['legacy', 'split']), surface('sf')]

  it('fires on an empty present_under', () => {
    const f = checkConfigurationDrift(nodes, [variesBy('sf', 'ax', [])])
    expect(kinds(f)).toContain('present_under_empty')
  })

  it('fires on a present_under value the axis does not declare', () => {
    const f = checkConfigurationDrift(nodes, [variesBy('sf', 'ax', ['legacy', 'beta'])])
    expect(kinds(f)).toContain('present_under_unknown_value')
  })

  it('clears a declaration naming only declared values', () => {
    const f = checkConfigurationDrift(nodes, [variesBy('sf', 'ax', ['legacy'])])
    expect(f).toEqual([])
  })
})

describe('qualifier scope and shape', () => {
  const nodes = [axis('ax', ['legacy', 'split']), surface('sf_a'), surface('sf_b')]

  it('fires when active_when appears on an edge type it is not legal on', () => {
    // The scope restriction is enforced, not merely documented. This is what
    // stops "conditional composition" quietly becoming "conditional anything".
    const illegal: ProjectableEdge = {
      id: 'e_bad',
      source: 'sf_a',
      target: 'sf_b',
      type: 'surface_supersedes_surface',
      properties: { active_when: { axis: 'ax', values: ['legacy'] } },
    }
    const f = checkConfigurationDrift(nodes, [illegal])
    expect(kinds(f)).toContain('qualifier_on_illegal_edge')
  })

  it('fires when the qualifier names an axis that does not exist', () => {
    const f = checkConfigurationDrift(nodes, [
      contains('sf_a', 'sf_b', { active_when: { axis: 'ax_missing', values: ['legacy'] } }),
    ])
    expect(kinds(f)).toContain('qualifier_axis_unresolved')
  })

  it('fires on a malformed qualifier rather than letting it read as invariant', () => {
    // A malformed active_when reads as ABSENT to the projection operator, so
    // the edge silently becomes invariant. Without this check that silence is
    // the whole story, and a broken qualifier looks like a working one.
    const f = checkConfigurationDrift(nodes, [
      contains('sf_a', 'sf_b', { active_when: { axis: 'ax' } }),
    ])
    expect(kinds(f)).toContain('qualifier_axis_unresolved')
  })

  it('fires on a value the named axis does not declare', () => {
    const f = checkConfigurationDrift(nodes, [
      contains('sf_a', 'sf_b', { active_when: { axis: 'ax', values: ['beta'] } }),
    ])
    expect(kinds(f)).toContain('qualifier_unknown_value')
  })

  it('fires on an active_when whose values list is empty', () => {
    // Read literally, an empty list deactivates the edge in EVERY projection
    // and in the union: a way to delete a relationship from the whole graph by
    // writing a property. The operator treats it as absent so nothing vanishes
    // silently, and this check is what stops that leniency from hiding the
    // mistake.
    const f = checkConfigurationDrift(nodes, [
      contains('sf_a', 'sf_b', { active_when: { axis: 'ax', values: [] } }),
    ])
    expect(kinds(f)).toContain('qualifier_values_empty')
  })

  it('clears a well-formed qualifier on a legal edge', () => {
    // Both parent branches are declared, which is what qualifying a
    // containment edge actually commits you to: if the child exists in both
    // configurations, it needs somewhere to live in both. Qualifying the ONLY
    // parent edge instead leaves the child orphaned under the other value, and
    // the orphan check catches exactly that (see below). This fixture was
    // wrong on the first pass and the check found it, which is the behaviour
    // the check exists for.
    const withSecondParent = [...nodes, surface('sf_split_parent')]
    const f = checkConfigurationDrift(withSecondParent, [
      contains('sf_a', 'sf_b', { active_when: { axis: 'ax', values: ['legacy'] } }),
      contains('sf_split_parent', 'sf_b', { active_when: { axis: 'ax', values: ['split'] } }),
    ])
    expect(f).toEqual([])
  })

  it('catches the half-qualified parent: a child stranded under the other value', () => {
    // Qualifying one containment edge without providing the other branch is
    // the most likely mistake when adopting the qualifier, so it gets its own
    // named case rather than living as a surprise inside another test.
    const f = checkConfigurationDrift(nodes, [
      contains('sf_a', 'sf_b', { active_when: { axis: 'ax', values: ['legacy'] } }),
    ])
    const orphan = f.find((x) => x.kind === 'orphaned_under_projection')
    expect(orphan?.node_id).toBe('sf_b')
    expect(orphan?.severity).toBe('warning')
  })
})

describe('alternation', () => {
  const nodes = [
    axis('ax', ['legacy', 'split']),
    axis('ax_plan', ['free', 'pro']),
    surface('sf_chips'),
    surface('sf_badge'),
  ]
  const alternates: ProjectableEdge = {
    id: 'e_alt',
    source: 'sf_chips',
    target: 'sf_badge',
    type: 'surface_alternates_with_surface',
    properties: {},
  }

  it('clears the genuine case: same axis, disjoint values', () => {
    const f = checkConfigurationDrift(nodes, [
      variesBy('sf_chips', 'ax', ['legacy']),
      variesBy('sf_badge', 'ax', ['split']),
      alternates,
    ])
    expect(f).toEqual([])
  })

  it('fires when the two surfaces vary on different axes', () => {
    const f = checkConfigurationDrift(nodes, [
      variesBy('sf_chips', 'ax', ['legacy']),
      variesBy('sf_badge', 'ax_plan', ['pro']),
      alternates,
    ])
    expect(kinds(f)).toContain('alternation_axis_mismatch')
  })

  it('fires when an endpoint declares no variance at all', () => {
    const f = checkConfigurationDrift(nodes, [variesBy('sf_chips', 'ax', ['legacy']), alternates])
    expect(kinds(f)).toContain('alternation_axis_mismatch')
  })

  it('fires when their present_under sets overlap', () => {
    // The contradiction D2 named: the graph is asserting "one of these" and
    // "both, together" about the same pair.
    const f = checkConfigurationDrift(nodes, [
      variesBy('sf_chips', 'ax', ['legacy', 'split']),
      variesBy('sf_badge', 'ax', ['split']),
      alternates,
    ])
    expect(kinds(f)).toContain('alternation_overlap')
  })

  it('never DERIVES an alternation from disjointness alone', () => {
    // Two unrelated surfaces gated by the same flag are disjoint without being
    // alternatives to each other. Derivation is used to check a declared edge,
    // never to propose one, so a graph with no alternates edge is silent here.
    const f = checkConfigurationDrift(nodes, [
      variesBy('sf_chips', 'ax', ['legacy']),
      variesBy('sf_badge', 'ax', ['split']),
    ])
    expect(f).toEqual([])
  })
})

describe('orphaned under projection', () => {
  const nodes = [axis('ax', ['legacy', 'split']), surface('sf_row'), surface('sf_child')]

  it('warns when a surface loses every parent in some projection', () => {
    // The child is present in both configurations but its only parent exists
    // only under legacy, so under split it is present with nowhere to live.
    // That is a modelling gap, not something the operator should silently fix
    // by deleting the child.
    const f = checkConfigurationDrift(nodes, [
      variesBy('sf_row', 'ax', ['legacy']),
      contains('sf_row', 'sf_child'),
    ])
    const orphan = f.find((x) => x.kind === 'orphaned_under_projection')
    expect(orphan).toBeDefined()
    expect(orphan?.node_id).toBe('sf_child')
    expect(orphan?.severity).toBe('warning')
  })

  it('clears when the child is reparented under the other value', () => {
    // The reported case done correctly: the occupant moves to the new row.
    const nodesWithSplit = [...nodes, surface('sf_split_row')]
    const f = checkConfigurationDrift(nodesWithSplit, [
      variesBy('sf_row', 'ax', ['legacy']),
      variesBy('sf_split_row', 'ax', ['split']),
      contains('sf_row', 'sf_child'),
      contains('sf_split_row', 'sf_child'),
    ])
    expect(kinds(f)).not.toContain('orphaned_under_projection')
  })

  it('stays silent about a surface that has no parent anywhere', () => {
    // A parentless surface is a pre-existing modelling state with nothing to do
    // with configuration. Reporting it here would bury the real finding under
    // noise the author cannot act on from this check.
    const f = checkConfigurationDrift(nodes, [variesBy('sf_row', 'ax', ['legacy'])])
    expect(kinds(f)).not.toContain('orphaned_under_projection')
  })
})

describe('a graph with no configuration at all', () => {
  it('produces no findings, so the scope costs nothing until an axis exists', () => {
    const f = checkConfigurationDrift(
      [surface('sf_a'), surface('sf_b')],
      [contains('sf_a', 'sf_b')],
    )
    expect(f).toEqual([])
  })
})
