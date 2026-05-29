/**
 * playbooks/: UPG Playbook public API.
 *
 * Exports: `UPGPlaybook`, `PlaybookRuntime`, `PlaybookFilter`, `PlaybookRun`,
 * `PlaybookBinding`, `UPG_PLAYBOOKS`, and the lookup helpers
 * (`getCanonicalPlaybookForRegion`, `getPlaybooksForRegion`, `getPlaybookById`).
 */

import type { UPGPlaybook } from './types.js'
import type { UPGRegionId } from '../regions/types.js'
import { UPG_PLAYBOOKS } from './definitions/index.js'

export * from './types.js'
export * from './definitions/index.js'

// Re-export shared step machinery so consumers (mcp-server, Entopo, future
// runtimes) can construct and traverse steps.
export type {
  Step,
  StepKind,
  EntryMode,
  SurfaceId,
  RunContext,
  StepOutput,
  StepOutputKind,
  DomainGuideStep,
  FrameworkInvocationStep,
  EntitySequenceStep,
  SubSequenceStep,
} from '../step-sequence.js'
export {
  isDomainGuideStep,
  isFrameworkInvocationStep,
  isEntitySequenceStep,
  isSubSequenceStep,
} from '../step-sequence.js'

const _playbookById = new Map<string, UPGPlaybook>(
  UPG_PLAYBOOKS.map((p) => [p.id, p]),
)

const _playbooksByRegion = new Map<UPGRegionId, UPGPlaybook[]>()
for (const p of UPG_PLAYBOOKS) {
  const list = _playbooksByRegion.get(p.region) ?? []
  list.push(p)
  _playbooksByRegion.set(p.region, list)
}

/**
 * Look up a canonical playbook shipped with `@unified-product-graph/core` by id.
 * Returns `undefined` when the id is unknown (or namespaces a technique).
 */
export function getPlaybookById(id: string): UPGPlaybook | undefined {
  return _playbookById.get(id)
}

/**
 * Return the single canonical playbook for a region (the "start here" path).
 * Returns `null` when the region has no canonical playbook (W1 invariant
 * violation, caught by `audit-playbook-coverage.ts`).
 */
export function getCanonicalPlaybookForRegion(
  region: UPGRegionId,
): UPGPlaybook | null {
  const list = _playbooksByRegion.get(region) ?? []
  return list.find((p) => p.is_canonical === true) ?? null
}

/**
 * Return every playbook (canonical + specialised) anchored at a region.
 * Order is the canonical `UPG_PLAYBOOKS` order, canonical entry first by
 * convention (catalog authoring discipline).
 */
export function getPlaybooksForRegion(
  region: UPGRegionId,
): readonly UPGPlaybook[] {
  return _playbooksByRegion.get(region) ?? []
}
