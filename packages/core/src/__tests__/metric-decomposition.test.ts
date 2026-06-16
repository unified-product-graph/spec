/**
 * — metric decomposition contract tests.
 *
 * Asserts that the split landed: metric_quality_assessment exists, the new
 * edge resolves, the property-migration framework drops deprecated keys, and
 * a soft >15-property invariant warns on monoliths going forward.
 *
 * Run: npx vitest run src/__tests__/metric-decomposition.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_ENTITY_TO_DOMAIN } from '../registry/domains.js'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'
import {
  migrateNodeProperties,
  getPropertyMigrations,
} from '../grammar/migrations.js'
import { isLifecycleFreeType } from '../grammar/lifecycles.js'

describe('Metric decomposition', () => {
  it('metric_quality_assessment is registered as a valid entity type', () => {
    expect(UPG_ENTITY_TO_DOMAIN.metric_quality_assessment).toBe('strategy')
  })

  it('metric_quality_assessment is lifecycle-free (point-in-time snapshot)', () => {
    expect(isLifecycleFreeType('metric_quality_assessment')).toBe(true)
  })

  it('canonical edge metric → metric_quality_assessment is registered', () => {
    const edge = UPG_EDGE_CATALOG.metric_assessed_by_metric_quality_assessment
    expect(edge).toBeDefined()
    expect(edge?.source_type).toBe('metric')
    expect(edge?.target_type).toBe('metric_quality_assessment')
    expect(edge?.classification).toBe('hierarchy')
  })

  it('metric_quality_assessment carries the quality/proxy props + provenance', () => {
    const props = UPG_PROPERTY_SCHEMA.metric_quality_assessment
    expect(props).toBeDefined()
    if (!props) return
    // proxy_alternatives removed in 0.12.0 (P14) → metric_quality_assessment_considers_proxy_metric edge.
    const expected = [
      'assessed_at',
      'assessor',
      'quality_correlated',
      'quality_actionable',
      'quality_sensitive',
      'quality_comparative',
      'quality_related',
      'quality_score',
      'proxy_reason',
      'proxy_confidence',
    ]
    for (const key of expected) {
      expect(props, `expected ${key} on metric_quality_assessment`).toHaveProperty(key)
    }
  })

  it('property migration drops deprecated keys when loading 0.2.0 → 0.2.2', () => {
    const node = {
      type: 'metric',
      properties: {
        // Real definition prop — must survive.
        current_value: 100,
        target_value: 200,
        // 9 quality/proxy props — moved to metric_quality_assessment.
        quality_correlated: true,
        quality_score: 4,
        proxy_reason: 'qualitative' as const,
        // 5 sync props — out of canonical spec.
        external_metric_id: 'm-123',
        sync_status: 'synced' as const,
      },
    }
    const { node: migrated, changes } = migrateNodeProperties(node, '0.2.0', '0.2.2')
    const dropped = changes.filter((c) => c.kind === 'dropped').map((c) => c.kind === 'dropped' ? c.key : '')

    expect(migrated.properties).toEqual({ current_value: 100, target_value: 200 })
    expect(dropped.sort()).toEqual(
      [
        'quality_correlated',
        'quality_score',
        'proxy_reason',
        'external_metric_id',
        'sync_status',
      ].sort(),
    )
  })

  it('property migration is a no-op for non-targeted types', () => {
    const node = { type: 'persona', properties: { is_primary: true } }
    const { node: out, changes } = migrateNodeProperties(node, '0.2.0', '0.2.2')
    expect(out).toBe(node)
    expect(changes).toEqual([])
  })

  it('getPropertyMigrations returns the 0.2.2 metric entry in range', () => {
    const entries = getPropertyMigrations('0.2.0', '0.2.2')
    expect(entries.length).toBeGreaterThan(0)
    const metric = entries.find((e) => e.type === 'metric' && e.kind === 'drop_props')
    expect(metric).toBeDefined()
    if (metric?.kind === 'drop_props') {
      expect(metric.drop_props).toContain('quality_score')
      expect(metric.drop_props).toContain('external_metric_id')
    }
  })

  it('soft invariant — no entity type carries more than 15 properties', () => {
    // Hard ceiling that prevents future 34-property monoliths. Bumping a
    // type past the limit triggers a decomposition review. Each entry below
    // must carry a written rationale.
    const ALLOW_OVER_15: ReadonlySet<string> = new Set<string>([
      // metric — 34 props transitionally. split the type (9 quality/
      // proxy props moved to metric_quality_assessment, 5 sync props out of
      // canonical scope), but the deprecated keys still appear in the schema
      // for backwards-compat with consumers. Drop in 0.3.0.
      'metric',
    ])
    const offenders: { type: string; count: number }[] = []
    for (const [type, props] of Object.entries(UPG_PROPERTY_SCHEMA)) {
      if (ALLOW_OVER_15.has(type)) continue
      const count = Object.keys(props).length
      if (count > 15) offenders.push({ type, count })
    }
    expect(
      offenders,
      `Entity types over the 15-property soft ceiling. Decompose or add to ALLOW_OVER_15 with a written rationale.\n${offenders
        .map((o) => `  • ${o.type}: ${o.count} props`)
        .join('\n')}`,
    ).toEqual([])
  })
})
