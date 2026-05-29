/**
 * grammar/: Layer 2: How Things Behave.
 * Hierarchy rules, lifecycles, scales, migrations, document validation.
 */

export * from './hierarchy.js'
export * from './lifecycles.js'
export * from './scales.js'
export * from './enum-scales.js'
export * from './migrations.js'
export * from './status-migrations.js'
export * from './slugify.js'
export { validateUPGDocument, isUPGDocument } from './validate.js'
export type { UPGValidationResult, UPGValidationError, UPGValidationWarning } from './validate.js'
