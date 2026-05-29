/**
 * UPG Framework Shape Audit: Library
 *
 * Lints `UPG_FRAMEWORKS` for structural inconsistencies between the
 * `data`, `presentation`, `slots`, and `education` layers. The actual
 * CLI lives in `scripts/audit-framework-shape.ts`; this module exposes
 * the pure audit logic so it can be imported by tests and the script
 * without re-implementing the rules in two places.
 *
 * See `scripts/audit-framework-shape.ts` for the full prose description
 * of each issue kind.
 */

import { UPG_FRAMEWORKS } from './definitions/index.js'
import { UPG_ENTITY_META } from '../registry/entity-meta.js'
import type { UPGFramework } from './types.js'

// ── Issue kinds ─────────────────────────────────────────────────────────────

export type FrameworkIssueKind =
  | 'PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE'
  | 'PRESENTATION_COLUMN_UNKNOWN_PROPERTY'
  | 'COMPUTED_EXPRESSION_UNDEFINED_VARIABLE'
  | 'SLOT_DATA_DRIFT'
  | 'WHEN_TO_USE_BOILERPLATE'

export type FrameworkIssueSeverity = 'blocker' | 'warning'

export interface FrameworkIssue {
  kind: FrameworkIssueKind
  severity: FrameworkIssueSeverity
  location: string
  detail: string
}

export interface FrameworkDriftReport {
  framework_id: string
  category: string
  issues: FrameworkIssue[]
}

export interface FrameworkAuditResult {
  summary: {
    total_frameworks: number
    total_issues: number
    by_kind: Record<FrameworkIssueKind, number>
    by_severity: Record<FrameworkIssueSeverity, number>
    clean_frameworks: number
  }
  reports: FrameworkDriftReport[]
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Properties that the renderer derives from any UPG node (always present). */
const UNIVERSAL_NODE_FIELDS = new Set(['title', 'description', 'status'])

/** Identifiers an expression parser should skip: math built-ins and constants. */
const EXPRESSION_RESERVED = new Set([
  'true',
  'false',
  'null',
  'min',
  'max',
  'abs',
  'round',
  'floor',
  'ceil',
  'sqrt',
  'log',
  'pow',
])

const ENTITY_TYPE_NAMES = new Set(UPG_ENTITY_META.map((m) => m.name))

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract identifier-shaped tokens from a math expression.
 * Strips numbers, string literals, operators, parentheses.
 */
function extractIdentifiers(expression: string): string[] {
  const stripped = expression.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '')
  const matches = stripped.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []
  return Array.from(new Set(matches.filter((m) => !EXPRESSION_RESERVED.has(m))))
}

/**
 * Normalise a when_to_use bullet for fuzzy comparison.
 * Lowercases, collapses whitespace, strips trailing punctuation.
 */
function normaliseBullet(bullet: string): string {
  return bullet.toLowerCase().replace(/[.,;:!?]+$/, '').replace(/\s+/g, ' ').trim()
}

/**
 * Audit a single framework for the intrinsic shape issues
 * (column refs, expression vars, slot/data drift).
 * Boilerplate detection is category-scoped; see auditCategoryBoilerplate.
 */
function auditFramework(fw: UPGFramework): FrameworkIssue[] {
  const issues: FrameworkIssue[] = []

  const dataEntityTypes = new Set((fw.data?.entity_types ?? []).map((e) => e.type))
  const requiredProps = fw.data?.required_properties ?? {}
  const computedProps = fw.data?.computed_properties ?? []

  const declaredPropsByEntity: Record<string, Set<string>> = {}
  for (const [entityType, props] of Object.entries(requiredProps)) {
    declaredPropsByEntity[entityType] = new Set(props.map((p) => p.property))
  }
  const computedPropsByEntity: Record<string, Set<string>> = {}
  for (const cp of computedProps) {
    ;(computedPropsByEntity[cp.entity_type] ??= new Set()).add(cp.property)
  }

  const allDeclaredAndComputed = new Set<string>()
  for (const set of Object.values(declaredPropsByEntity)) {
    for (const p of set) allDeclaredAndComputed.add(p)
  }
  for (const set of Object.values(computedPropsByEntity)) {
    for (const p of set) allDeclaredAndComputed.add(p)
  }

  // ── Issue 1: Presentation column reference integrity ─────────────────────
  const layout = fw.presentation?.layout
  if (layout?.type === 'table' && Array.isArray(layout.columns)) {
    for (let i = 0; i < layout.columns.length; i++) {
      const col = layout.columns[i]
      const prop = col.property
      const location = `presentation.layout.columns[${i}].property="${prop}"`

      if (UNIVERSAL_NODE_FIELDS.has(prop)) continue
      if (allDeclaredAndComputed.has(prop)) continue

      if (ENTITY_TYPE_NAMES.has(prop)) {
        issues.push({
          kind: 'PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE',
          severity: 'blocker',
          location,
          detail: `Column references entity type "${prop}" (label "${col.label}") instead of a property. Expected a key in data.required_properties[<entity_type>] or a computed_property name.`,
        })
      } else {
        issues.push({
          kind: 'PRESENTATION_COLUMN_UNKNOWN_PROPERTY',
          severity: 'warning',
          location,
          detail: `Column "${col.label}" references "${prop}" which is not declared in data.required_properties or data.computed_properties. Universal fields are title/description/status.`,
        })
      }
    }
  }

  // ── Issue 2: Computed expression variable resolution ─────────────────────
  for (let i = 0; i < computedProps.length; i++) {
    const cp = computedProps[i]
    const idents = extractIdentifiers(cp.expression)
    const declaredForType = declaredPropsByEntity[cp.entity_type] ?? new Set()
    const computedForType = computedPropsByEntity[cp.entity_type] ?? new Set()

    for (const ident of idents) {
      if (UNIVERSAL_NODE_FIELDS.has(ident)) continue
      if (declaredForType.has(ident)) continue
      if (computedForType.has(ident)) continue
      issues.push({
        kind: 'COMPUTED_EXPRESSION_UNDEFINED_VARIABLE',
        severity: 'blocker',
        location: `data.computed_properties[${i}].expression="${cp.expression}"`,
        detail: `Identifier "${ident}" in expression for "${cp.property}" (entity_type=${cp.entity_type}) is not a declared property, not another computed property, and not a universal field.`,
      })
    }
  }

  // ── Issue 3: Slot ↔ data.entity_types consistency ────────────────────────
  const slotEntityTypes = new Set((fw.slots ?? []).map((s) => s.entityTypeId))
  for (const slotType of slotEntityTypes) {
    if (!dataEntityTypes.has(slotType)) {
      issues.push({
        kind: 'SLOT_DATA_DRIFT',
        severity: 'blocker',
        location: `slots[*].entityTypeId="${slotType}"`,
        detail: `Slot references entity type "${slotType}" but it is not declared in data.entity_types.`,
      })
    }
  }
  for (const dataType of dataEntityTypes) {
    if (!slotEntityTypes.has(dataType) && (fw.slots ?? []).length > 0) {
      issues.push({
        kind: 'SLOT_DATA_DRIFT',
        severity: 'warning',
        location: `data.entity_types[*].type="${dataType}"`,
        detail: `data.entity_types lists "${dataType}" but no slot uses it. Either add a slot for it or remove it from data.entity_types.`,
      })
    }
  }

  return issues
}

/**
 * Category-scoped pass: detect when_to_use bullets that are >50% identical
 * across frameworks within the same category.
 */
function auditCategoryBoilerplate(
  frameworks: UPGFramework[],
): Map<string, FrameworkIssue[]> {
  const issuesByFramework = new Map<string, FrameworkIssue[]>()
  const byCategory: Record<string, UPGFramework[]> = {}
  for (const fw of frameworks) {
    ;(byCategory[fw.category] ??= []).push(fw)
  }

  for (const [category, members] of Object.entries(byCategory)) {
    if (members.length < 2) continue

    const bulletCount = new Map<string, number>()
    for (const fw of members) {
      const bullets = (fw.education?.when_to_use ?? []).map(normaliseBullet)
      for (const b of new Set(bullets)) {
        bulletCount.set(b, (bulletCount.get(b) ?? 0) + 1)
      }
    }

    // Threshold: at least 50% of the category, but never below 2 (otherwise
    // a small category can flag its own unique bullets against itself).
    const sharedThreshold = Math.max(2, Math.ceil(members.length / 2))
    for (const fw of members) {
      const bullets = (fw.education?.when_to_use ?? []).map(normaliseBullet)
      if (bullets.length === 0) continue
      const sharedBullets = bullets.filter(
        (b) => (bulletCount.get(b) ?? 0) >= sharedThreshold,
      )
      const sharedFraction = sharedBullets.length / bullets.length
      if (sharedFraction > 0.5) {
        const list = issuesByFramework.get(fw.id) ?? []
        list.push({
          kind: 'WHEN_TO_USE_BOILERPLATE',
          severity: 'warning',
          location: 'education.when_to_use',
          detail: `${sharedBullets.length}/${bullets.length} when_to_use bullets appear in >=${sharedThreshold} of ${members.length} frameworks in category "${category}". Likely category boilerplate; consider rewriting in framework-specific terms.`,
        })
        issuesByFramework.set(fw.id, list)
      }
    }
  }

  return issuesByFramework
}

// ── Main audit entrypoint ───────────────────────────────────────────────────

export function runFrameworkShapeAudit(
  frameworks: UPGFramework[] = UPG_FRAMEWORKS,
): FrameworkAuditResult {
  const boilerplateByFramework = auditCategoryBoilerplate(frameworks)
  const reports: FrameworkDriftReport[] = []

  for (const fw of frameworks) {
    const intrinsic = auditFramework(fw)
    const boilerplate = boilerplateByFramework.get(fw.id) ?? []
    const issues = [...intrinsic, ...boilerplate]
    reports.push({
      framework_id: fw.id,
      category: fw.category,
      issues,
    })
  }

  const by_kind: Record<FrameworkIssueKind, number> = {
    PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE: 0,
    PRESENTATION_COLUMN_UNKNOWN_PROPERTY: 0,
    COMPUTED_EXPRESSION_UNDEFINED_VARIABLE: 0,
    SLOT_DATA_DRIFT: 0,
    WHEN_TO_USE_BOILERPLATE: 0,
  }
  const by_severity: Record<FrameworkIssueSeverity, number> = {
    blocker: 0,
    warning: 0,
  }
  let totalIssues = 0
  let cleanFrameworks = 0
  for (const r of reports) {
    if (r.issues.length === 0) cleanFrameworks++
    totalIssues += r.issues.length
    for (const i of r.issues) {
      by_kind[i.kind]++
      by_severity[i.severity]++
    }
  }

  return {
    summary: {
      total_frameworks: frameworks.length,
      total_issues: totalIssues,
      by_kind,
      by_severity,
      clean_frameworks: cleanFrameworks,
    },
    reports,
  }
}
