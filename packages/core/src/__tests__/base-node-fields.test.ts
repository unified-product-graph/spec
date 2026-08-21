/**
 * Spec-integrity: `UPG_BASE_NODE_FIELDS` must equal the `UPGBaseNode` key set.
 *
 * A TypeScript interface is erased at runtime, so every consumer that needs to
 * ask "is this key a base field?" needs the names as DATA. Before 0.32.2 each
 * consumer kept its own hand-written copy behind a comment asking the next
 * editor to keep it in sync, and 0.32.0 shipped `key`, `archived` and
 * `archived_at` on the interface without updating a single one of them.
 *
 * `BASE_NODE_FIELD_PRESENCE` in the shape module locks the two together at
 * COMPILE time (`Record<keyof UPGBaseNode, true>` is exhaustive in both
 * directions). This test is the independent check on that lock: it parses the
 * interface declaration out of the source with the TypeScript AST and compares
 * the member names to the exported runtime list, so the derivation is verified
 * against the interface itself rather than against a second copy of it.
 */
import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

import { UPG_BASE_NODE_FIELDS, UPG_BASE_NODE_FIELD_SET, UPG_BASE_NODE_SPECIAL_MERGE_FIELDS } from '../index.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SHAPE_SRC = path.resolve(HERE, '../shapes/base-node.ts')

/** Member names declared by `interface UPGBaseNode`, read from the source. */
function declaredBaseNodeFields(): string[] {
  const source = fs.readFileSync(SHAPE_SRC, 'utf-8')
  const sf = ts.createSourceFile(SHAPE_SRC, source, ts.ScriptTarget.Latest, true)
  const names: string[] = []
  for (const stmt of sf.statements) {
    if (!ts.isInterfaceDeclaration(stmt) || stmt.name.text !== 'UPGBaseNode') continue
    for (const member of stmt.members) {
      if (!ts.isPropertySignature(member) || !member.name) continue
      names.push(member.name.getText(sf))
    }
  }
  return names
}

describe('UPG_BASE_NODE_FIELDS is derived from the UPGBaseNode shape', () => {
  it('finds the interface (guards against the parser silently reading nothing)', () => {
    // A test that extracts zero names would pass every equality below by
    // accident if the runtime list were also empty; assert the fixture is real.
    expect(declaredBaseNodeFields().length).toBeGreaterThan(10)
  })

  it('equals the declared interface key set exactly', () => {
    const declared = declaredBaseNodeFields()
    expect([...UPG_BASE_NODE_FIELDS].sort()).toEqual([...declared].sort())
  })

  it('preserves declaration order', () => {
    expect([...UPG_BASE_NODE_FIELDS]).toEqual(declaredBaseNodeFields())
  })

  it('carries the 0.32.0 base fields that the hand-maintained lists missed', () => {
    // The specific regression. Named explicitly so a future removal of any of
    // the three has to be a deliberate edit to this line.
    for (const field of ['key', 'archived', 'archived_at']) {
      expect(UPG_BASE_NODE_FIELD_SET.has(field)).toBe(true)
    }
  })

  it('exposes the set and the list as the same membership', () => {
    expect(UPG_BASE_NODE_FIELD_SET.size).toBe(UPG_BASE_NODE_FIELDS.length)
    for (const field of UPG_BASE_NODE_FIELDS) {
      expect(UPG_BASE_NODE_FIELD_SET.has(field)).toBe(true)
    }
  })

  it('lists only real base fields as special-merge exclusions', () => {
    // An exclusion naming a field that no longer exists would silently stop
    // excluding anything, quietly changing merge semantics.
    for (const field of UPG_BASE_NODE_SPECIAL_MERGE_FIELDS) {
      expect(UPG_BASE_NODE_FIELD_SET.has(field)).toBe(true)
    }
  })
})
