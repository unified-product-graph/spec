/**
 * Alias-collision gate (F4 · · pattern P-B).
 *
 * `presentation/labels.ts` is the Rosetta Stone: every entity type maps to a
 * canonical label plus `alt_labels` (search affordances + framework synonyms).
 * `buildTypeAliases()` turns every alt_label into a resolver entry, so a search
 * or import for that token resolves to the owning type.
 *
 * The defect (P-B): many types carried an `alt_label` that equals ANOTHER
 * type's canonical label, or a bare token claimed by several sibling types. A
 * search for type B's own name then mis-resolved to type A. This is the
 * generalisation of the alias contract (`journey_phase` / `outcome`).
 *
 * This suite makes the collision class un-drift-able along two axes:
 *
 *   1. CANONICAL-LABEL collisions: no type's `alt_labels` may equal any *other*
 *      type's canonical label (case-insensitive, trimmed). A bare search for
 *      "Capability" must resolve to `capability`, never to `feature`.
 *
 *   2. SHARED bare-token collisions (audit-named set): a curated set of bare
 *      tokens the audit flagged as 3-way / 2-way collisions ("segment",
 *      "channel", "audit", "security assessment", "concept", "campaign") must
 *      each be claimed by AT MOST ONE type. Sibling types keep a *qualified*
 *      affordance ("market segment", "distribution channel") instead.
 *
 * Two documented escape hatches are encoded as explicit constants
 * (FRAMEWORK_SLOT_EXEMPTIONS, SHARED_TOKEN_ALLOWED) so that an exemption is a
 * deliberate, reviewed choice rather than silent drift. Adding to either list
 * is a visible spec decision.
 */
import { describe, it, expect } from 'vitest'
import { UPG_TYPE_LABELS } from '../presentation/labels.js'
import { UPG_FRAMEWORKS } from '../frameworks/canonical.js'

const norm = (s: string): string => s.trim().toLowerCase()

// ── Documented exemptions ───────────────────────────────────────────────────

/**
 * Framework-slot collisions are NOT a search-affordance bug: they exist because
 * a canonical framework legitimately *calls* entity X by a label that happens to
 * be another type's canonical name. These alt_labels are auto-generated from
 * `UPG_FRAMEWORKS[*].slots[*].label` (the Rosetta Stone's whole purpose) and
 * cannot be stripped in `labels.ts` without breaking the framework mapping. They
 * are framework-scoped, not bare resolver tokens, so they do not misresolve a
 * plain search the way a hand-authored bare alias does.
 *
 * Each entry is `type -> [colliding labels]`. Encoded so the gate can prove it
 * is exhaustive over every NON-framework collision, and so that promoting a
 * framework slot to a renamed label later is a single, visible edit.
 *
 *  - need / "symptom":        a symptom-framing slot names the underlying need.
 *  - experiment_run / "experiment":  run-as-experiment framing in growth slots.
 *  - insight / "root cause":  RCA-framework slot label for the derived insight.
 *  - key_activity / "service":  BMC key-activity slot framed as a service.
 *  - portfolio / "initiative":  portfolio-framework slot framed as an initiative.
 */
const FRAMEWORK_SLOT_EXEMPTIONS: Record<string, string[]> = {
  need: ['symptom'],
  experiment_run: ['experiment'],
  insight: ['root cause'],
  key_activity: ['service'],
  portfolio: ['initiative'],
}

/**
 * Bare tokens the audit flagged (P-B), now owned by exactly one type. The gate
 * asserts each is claimed by AT MOST ONE type's `alt_labels`. Listing them
 * explicitly keeps the contract bounded and reviewed: this is the named subset
 * the F4 sweep resolved, not an attempt to deduplicate every near-synonym in
 * the Rosetta Stone (that broader hygiene is tracked separately).
 */
const SHARED_TOKEN_TARGETS: string[] = [
  'segment',
  'channel',
  'audit',
  'security assessment',
  'concept',
  'campaign',
]

/**
 * Shared-token allow-list: bare tokens that MAY legitimately remain claimed by
 * more than one type (genuine domain-equivalent synonyms whose disambiguation
 * is out of F4 scope). Empty for the audit-named set — every target above is
 * resolved to a single owner. Present so a future, intentional shared synonym
 * is a visible decision rather than a silent gate weakening.
 */
const SHARED_TOKEN_ALLOWED = new Set<string>()

// ── Derived lookups ─────────────────────────────────────────────────────────

// normalised canonical label -> owning type id
const canonicalByLabel = new Map<string, string>()
for (const e of UPG_TYPE_LABELS) canonicalByLabel.set(norm(e.canonical_label), e.id)

// framework-slot labels per type (the auto-generated, non-strippable source)
const slotLabelsByType = new Map<string, Set<string>>()
for (const fw of UPG_FRAMEWORKS) {
  for (const slot of fw.slots ?? []) {
    if (!slot.entityTypeId) continue
    const set = slotLabelsByType.get(slot.entityTypeId) ?? new Set<string>()
    set.add(norm(slot.label))
    slotLabelsByType.set(slot.entityTypeId, set)
  }
}

const isExempt = (typeId: string, altLabel: string): boolean =>
  (FRAMEWORK_SLOT_EXEMPTIONS[typeId] ?? []).some((l) => norm(l) === norm(altLabel))

// ── Tests ────────────────────────────────────────────────────────────────────

describe('alias collision: no alt_label equals another type canonical label', () => {
  it('every non-exempt canonical-label collision is resolved', () => {
    const collisions: string[] = []
    for (const e of UPG_TYPE_LABELS) {
      for (const alt of e.alt_labels) {
        const owner = canonicalByLabel.get(norm(alt))
        if (owner && owner !== e.id && !isExempt(e.id, alt)) {
          collisions.push(`"${e.id}" claims alt_label "${alt}" which is the canonical label of "${owner}"`)
        }
      }
    }
    expect(collisions, `alt_label / canonical-label collisions:\n${collisions.join('\n')}`).toEqual([])
  })

  it('every declared framework-slot exemption is real (still a collision, still slot-derived)', () => {
    // Guards against a stale exemption: if a fix later removes the collision, the
    // exemption must be removed too (an exemption must never out-live its cause).
    for (const [typeId, labels] of Object.entries(FRAMEWORK_SLOT_EXEMPTIONS)) {
      const entry = UPG_TYPE_LABELS.find((e) => e.id === typeId)
      expect(entry, `exempt type "${typeId}" is not a real type`).toBeDefined()
      for (const label of labels) {
        const owner = canonicalByLabel.get(norm(label))
        expect(owner && owner !== typeId,
          `exemption "${typeId}" / "${label}" no longer collides with any canonical label — remove the exemption`).toBe(true)
        expect(slotLabelsByType.get(typeId)?.has(norm(label)),
          `exemption "${typeId}" / "${label}" is NOT framework-slot-derived — it must be stripped, not exempted`).toBe(true)
      }
    }
  })
})

describe('alias collision: audit-named bare tokens are owned by at most one type', () => {
  it('no SHARED_TOKEN_TARGET is claimed by two or more types', () => {
    const offenders: string[] = []
    for (const token of SHARED_TOKEN_TARGETS) {
      if (SHARED_TOKEN_ALLOWED.has(token)) continue
      const claimants = UPG_TYPE_LABELS
        .filter((e) => e.alt_labels.some((a) => norm(a) === norm(token)))
        .map((e) => e.id)
      if (claimants.length > 1) {
        offenders.push(`bare token "${token}" is claimed by ${claimants.length} types: [${claimants.join(', ')}]`)
      }
    }
    expect(offenders, `shared bare-token collisions:\n${offenders.join('\n')}`).toEqual([])
  })
})
