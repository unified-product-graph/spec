/**
 * Relational path resolution: the shared type-composition logic for the
 * `relational` block's edge paths.
 *
 * One implementation, two consumers — the framework validator (which reports
 * malformed paths as authoring errors) and the shape audit (which checks that
 * every type a path reaches is declared in `data.entity_types`). They must agree
 * on what a path means, so they resolve it with the same function rather than
 * two that drift.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import type { RelationalEdgeStep, UPGFramework } from './types.js'

type EdgeCatalog = Record<string, { source_type: string; target_type: string }>

/** One resolved hop: where the traversal was, and where the step lands it. */
export interface ResolvedStep {
  /** Entity type the traversal is at BEFORE this step */
  from: string
  /** Entity type the traversal is at AFTER this step */
  to: string
}

/** Why a path failed to resolve. `null` `reason` means it resolved cleanly. */
export interface PathResolution {
  /** The type each step lands on, in order */
  steps: ResolvedStep[]
  /** Entity type the whole path lands on, or `null` if it did not resolve */
  endpoint: string | null
  /** Human-readable failure, or `null` on success */
  reason: string | null
  /** Index of the step that failed, or `-1` */
  failedAt: number
}

/**
 * Walk a declared path from a starting entity type.
 *
 * `direction` is read, never inferred: `forward` goes source → target as the
 * catalog declares the edge, `reverse` goes target → source. A step whose
 * starting type does not match the end it claims to enter is a TYPE-COMPOSITION
 * failure and is reported with both types named, because "invalid path" without
 * the mismatch is not actionable.
 */
export function resolveRelationalPath(
  spine: string,
  path: RelationalEdgeStep[],
  catalog: EdgeCatalog = UPG_EDGE_CATALOG as unknown as EdgeCatalog
): PathResolution {
  const steps: ResolvedStep[] = []

  if (path.length === 0) {
    return { steps, endpoint: null, reason: 'path is empty; a projection must declare at least one step', failedAt: 0 }
  }

  let current = spine

  for (let i = 0; i < path.length; i++) {
    const step = path[i]!
    const entry = catalog[step.edge]

    if (!entry) {
      return {
        steps,
        endpoint: null,
        failedAt: i,
        reason: `unknown edge type "${step.edge}" — not in the UPG edge catalog`,
      }
    }

    if (step.direction !== 'forward' && step.direction !== 'reverse') {
      return {
        steps,
        endpoint: null,
        failedAt: i,
        reason: `step direction must be "forward" or "reverse", got "${String(step.direction)}"`,
      }
    }

    const entersAt = step.direction === 'forward' ? entry.source_type : entry.target_type
    const landsOn = step.direction === 'forward' ? entry.target_type : entry.source_type

    if (entersAt !== current) {
      return {
        steps,
        endpoint: null,
        failedAt: i,
        reason:
          `step ${i} ("${step.edge}" ${step.direction}) enters at "${entersAt}" ` +
          `but the traversal is at "${current}". ` +
          `The edge is declared ${entry.source_type} -> ${entry.target_type}; ` +
          `traversing it ${step.direction} requires being at "${entersAt}".`,
      }
    }

    steps.push({ from: current, to: landsOn })
    current = landsOn
  }

  return { steps, endpoint: current, reason: null, failedAt: -1 }
}

/**
 * Every entity type a framework's relational block touches: the spine, plus each
 * type any path passes through or lands on.
 *
 * INTERMEDIATES COUNT. A type that a path merely passes through is still a type
 * the framework depends on, and an instance of it that no row reaches is exactly
 * as invisible as an unreferenced endpoint — an experiment plan with no runs is
 * the motivating case. Excluding intermediates would let a framework depend on a
 * type it never declares.
 *
 * Unresolvable paths contribute the types they reached before failing; the
 * validator reports the failure itself.
 */
export function relationalCoveredEntityTypes(fw: UPGFramework): Set<string> {
  const covered = new Set<string>()
  const rel = fw.relational
  if (!rel) return covered

  covered.add(rel.spine)

  for (const column of rel.columns) {
    if (column.kind !== 'projection') continue
    const resolved = resolveRelationalPath(rel.spine, column.path)
    for (const step of resolved.steps) {
      covered.add(step.from)
      covered.add(step.to)
    }
  }

  return covered
}
