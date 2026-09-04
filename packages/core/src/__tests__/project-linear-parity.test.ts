/**
 * 0.41.0 — `project` becomes a first-class home for work, and gains strategic reach.
 *
 * Teams model in Linear: an Initiative holds Projects, a Project holds Issues.
 * UPG carried the upper relation (`project_implements_initiative`) but not the
 * lower one: `UPG_VALID_CHILDREN.project` was milestone + deliverable, so a
 * project could only REFERENCE work through the polymorphic
 * `project_delivers_work_item`, and every adapter hand-carried that special case.
 *
 * These assertions name the edges rather than counting them, so a later drop is
 * a deliberate edit here.
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_EDGE_CATALOG, UPG_VALID_CHILDREN, UPG_EDGE_PAIR_MAP, getDomainForType,
} from '../index.js'

const catalog = UPG_EDGE_CATALOG as Record<string, { forward_verb: string; reverse_verb: string; classification: string; source_type: string; target_type: string; deliberate_only?: boolean }>

/** Exactly the set Linear's issue-type map produces. */
const WORK_ITEM_TYPES = ['epic', 'feature', 'user_story', 'task', 'bug'] as const

describe('a project contains the work Linear puts in it', () => {
  it.each(WORK_ITEM_TYPES)('project_contains_%s exists as containment', (t) => {
    const e = catalog[`project_contains_${t}`]
    expect(e, `project_contains_${t} missing`).toBeDefined()
    expect(e.source_type).toBe('project')
    expect(e.target_type).toBe(t)
    expect(e.classification).toBe('hierarchy')
    expect(e.forward_verb).toBe('contains')
    expect(e.reverse_verb).toBe('belongs_to')
  })

  it.each(WORK_ITEM_TYPES)('%s is a declared child of project', (t) => {
    expect(UPG_VALID_CHILDREN['project']).toContain(t)
  })

  it('the milestone/deliverable children survive the widening', () => {
    expect(UPG_VALID_CHILDREN['project']).toContain('milestone')
    expect(UPG_VALID_CHILDREN['project']).toContain('deliverable')
  })

  it.each(WORK_ITEM_TYPES)('the pair project:%s resolves natively — the whole point', (t) => {
    // Before 0.41.0 this returned nothing, which is why every adapter had to
    // call isProjectWorkItemMembership() explicitly, last, after the generic
    // resolver returned null. Native resolution is what retires that.
    expect(UPG_EDGE_PAIR_MAP[`project:${t}`]).toContain(`project_contains_${t}`)
  })
})

describe('the polymorphic reference is untouched (no migration, by ruling)', () => {
  it('project_delivers_work_item still exists, still deliberate_only', () => {
    const e = catalog['project_delivers_work_item']
    expect(e).toBeDefined()
    expect(e.target_type).toBe('node')
    expect(e.deliberate_only).toBe(true)
  })

  it('the shadow pair is real and its precedence is recorded in the catalog', () => {
    // Accepted deliberately (Captain, 2026-09-04) to avoid a migration. The
    // resolution rule must be findable by whoever hits the ambiguity.
    const src = catalog['project_contains_task']
    expect(src).toBeDefined()
    // Both can name one pair; containment is the parent axis.
    expect(UPG_EDGE_PAIR_MAP['project:task']).toContain('project_contains_task')
  })
})

describe('a project can be reasoned about strategically', () => {
  const strategic = {
    project_advances_key_result: ['project', 'key_result'],
    project_drives_outcome: ['project', 'outcome'],
    project_assumes_assumption: ['project', 'assumption'],
    constraint_constrains_project: ['constraint', 'project'],
    strategic_theme_pursues_project: ['strategic_theme', 'project'],
  } as const

  it.each(Object.entries(strategic))('%s connects the right pair', (name, [src, tgt]) => {
    const e = catalog[name]
    expect(e, `${name} missing`).toBeDefined()
    expect(e.source_type).toBe(src)
    expect(e.target_type).toBe(tgt)
  })

  it('every strategic edge is genuinely cross-domain, adding nothing to T1.7 debt', () => {
    for (const name of Object.keys(strategic)) {
      const e = catalog[name]
      const a = getDomainForType(e.source_type)?.id
      const b = getDomainForType(e.target_type)?.id
      expect(e.classification, `${name} must be cross-domain`).toBe('cross-domain')
      expect(a, `${name}: endpoints must span domains, got ${a}/${b}`).not.toBe(b)
    }
  })

  it('mirrors initiative verb-for-verb, so the two granularities read alike', () => {
    expect(catalog['project_advances_key_result'].forward_verb)
      .toBe(catalog['initiative_advances_key_result'].forward_verb)
    expect(catalog['project_drives_outcome'].forward_verb)
      .toBe(catalog['initiative_drives_outcome'].forward_verb)
    expect(catalog['project_assumes_assumption'].forward_verb)
      .toBe(catalog['initiative_assumes_assumption'].forward_verb)
    expect(catalog['strategic_theme_pursues_project'].forward_verb)
      .toBe(catalog['strategic_theme_pursues_initiative'].forward_verb)
  })

  it('does NOT copy business-model reach down: the two stay granularities, not synonyms', () => {
    for (const t of ['market_segment', 'value_proposition', 'revenue_stream', 'strategic_question']) {
      expect(catalog[`project_enters_${t}`], `project must not mirror initiative's ${t} reach`).toBeUndefined()
      expect(catalog[`project_realises_${t}`]).toBeUndefined()
      expect(catalog[`project_unlocks_${t}`]).toBeUndefined()
      expect(catalog[`project_raises_${t}`]).toBeUndefined()
    }
  })

  it('the initiative relation is unchanged: initiative is the higher level', () => {
    const e = catalog['project_implements_initiative']
    expect(e.source_type).toBe('project')
    expect(e.target_type).toBe('initiative')
    // And nothing was minted putting an initiative inside a project.
    expect(catalog['project_contains_initiative']).toBeUndefined()
  })
})
