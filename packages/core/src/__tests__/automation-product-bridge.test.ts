/**
 * Automation → product-work bridge (initiative tasks-workflows-2026-08 §5).
 *
 * The Workflows & Agents domain reached product work only at coarse grain
 * (initiative / feature / decision / deliverable) and never at `task`, the leaf
 * of the delivery hierarchy. `agent_task_executes_task` is the single bridging
 * edge: "this agent work item is the execution of that product task".
 *
 * Deliberately ONE edge. A run-level `workflow_run → task` provenance edge was
 * rejected: run state is ops-plane (never canon, per the initiative's residency
 * rule), and the canon-side residue is already covered by
 * `workflow_run_produces_workflow_artifact` +
 * `workflow_artifact_references_deliverable` +
 * `workflow_run_implements_initiative`.
 *
 * Run: npx vitest run src/__tests__/automation-product-bridge.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_EDGE_PAIR_MAP, pickCanonicalEdge } from '../index.js'
import { UPG_DOMAINS } from '../registry/domains.js'

describe('agent_task_executes_task — the delegation bridge', () => {
  it('exists with the delegation endpoints and verbs', () => {
    const def = UPG_EDGE_CATALOG.agent_task_executes_task
    expect(def).toBeDefined()
    expect(def.source_type).toBe('agent_task')
    expect(def.target_type).toBe('task')
    expect(def.forward_verb).toBe('executes')
    expect(def.reverse_verb).toBe('executed_by')
  })

  it('is cross-domain, not hierarchy — neither work item contains the other', () => {
    const def = UPG_EDGE_CATALOG.agent_task_executes_task
    expect(def.classification).toBe('cross-domain')
    // The agent side keeps its own canonical parents; this edge must not have
    // become a second containment path for agent_task.
    expect(UPG_EDGE_CATALOG.workflow_template_defines_agent_task.classification).toBe('hierarchy')
    expect(UPG_EDGE_CATALOG.agent_definition_spawns_agent_task.classification).toBe('hierarchy')
  })

  it('genuinely crosses the automation ↔ product-delivery domain boundary', () => {
    const domainOf = (type: string) =>
      UPG_DOMAINS.find(d => (d.types as readonly string[]).includes(type))?.id
    expect(domainOf('agent_task')).toBe('automation')
    expect(domainOf('task')).not.toBe('automation')
  })

  it('UPG_EDGE_PAIR_MAP indexes the agent_task → task pair', () => {
    expect(UPG_EDGE_PAIR_MAP['agent_task:task']).toContain('agent_task_executes_task')
  })

  it('pickCanonicalEdge resolves the pair to the bridge', () => {
    expect(pickCanonicalEdge('agent_task', 'task', 'cross-domain')).toBe('agent_task_executes_task')
  })
})

describe('the automation domain is no longer task-blind', () => {
  const AUTOMATION_TYPES = [
    'workflow_template', 'workflow_run', 'agent_definition', 'agent_session',
    'agent_task', 'review_gate', 'approval_record', 'workflow_artifact',
    'agent_skill', 'agent_hook',
  ]

  it('at least one automation edge reaches `task`', () => {
    const reaching = Object.entries(UPG_EDGE_CATALOG)
      .filter(([, d]) => AUTOMATION_TYPES.includes(d.source_type) && d.target_type === 'task')
      .map(([k]) => k)
    expect(reaching).toContain('agent_task_executes_task')
  })

  it('the pre-existing coarse-grain product bridges are intact', () => {
    // Regression pins: these are why NO second bridging edge was added.
    for (const [key, source, target] of [
      ['workflow_run_implements_initiative', 'workflow_run', 'initiative'],
      ['workflow_run_produces_workflow_artifact', 'workflow_run', 'workflow_artifact'],
      ['workflow_artifact_references_deliverable', 'workflow_artifact', 'deliverable'],
      ['agent_skill_extends_feature', 'agent_skill', 'feature'],
      ['agent_session_creates_decision', 'agent_session', 'decision'],
    ] as const) {
      const def = UPG_EDGE_CATALOG[key]
      expect(def, `${key} missing`).toBeDefined()
      expect(def.source_type).toBe(source)
      expect(def.target_type).toBe(target)
    }
  })

  it('no run-level workflow_run → task edge was added (ops-plane, not canon)', () => {
    const runToTask = Object.entries(UPG_EDGE_CATALOG)
      .filter(([, d]) => d.source_type === 'workflow_run' && d.target_type === 'task')
    expect(runToTask).toEqual([])
  })
})
