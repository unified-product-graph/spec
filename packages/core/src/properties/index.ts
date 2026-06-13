/**
 * properties/: Layer 3: What Things Carry.
 * Typed property interfaces per domain, `UPGPropertyMap`, `UPGNode<T>`,
 * and the auto-generated runtime schema.
 *
 *   import type { FeatureProperties } from '@unified-product-graph/core'
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

// ─── Shared primitives ────────────────────────────────────────────────────────
export * from './primitives.js'

// ─── Domain property files ────────────────────────────────────────────────────
export * from './domains/portfolio.js'
export * from './domains/strategy.js'
export * from './domains/users.js'
export * from './domains/discovery.js'
export * from './domains/validation.js'
export * from './domains/market.js'
export * from './domains/user-research.js'
export * from './domains/ux-design.js'
export * from './domains/design-system.js'
export * from './domains/brand.js'
export * from './domains/product-spec.js'
export * from './domains/metrics.js'
export * from './domains/engineering.js'
export * from './domains/devops.js'
export * from './domains/testing.js'
export * from './domains/security.js'
export * from './domains/accessibility.js'
export * from './domains/feedback.js'
export * from './domains/data.js'
export * from './domains/content.js'
export * from './domains/legal.js'
export * from './domains/compliance.js'
export * from './domains/team.js'
export * from './domains/programs.js'
export * from './domains/ai.js'
export * from './domains/automation.js'
export * from './domains/business-model.js'
export * from './domains/growth.js'
export * from './domains/gtm.js'
export * from './domains/pricing.js'
export * from './domains/sales.js'
export * from './domains/marketing.js'
export * from './domains/customer-success.js'
export * from './domains/localisation.js'
export * from './domains/education.js'
export * from './domains/ecosystem.js'
export * from './domains/workspace.js'

// ─── Property map: UPGPropertyMap, UPGNode<T> ────────────────────────────────
export * from './property-map.js'

// ─── Auto-generated schema ───────────────────────────────────────────────────
export * from './property-schema.js'

// ─── Edge property validation (carries_properties edges) ─────────────────────
export * from './edge-property-validation.js'
