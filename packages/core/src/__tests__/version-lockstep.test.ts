/**
 * Release hygiene — UPG_VERSION must track the package train.
 *
 * `UPG_VERSION` (the catalogue version) stamps the `upg_version` field of every
 * `.upg` file the SDK writes, and is reported by `get_spec_version`. It is a
 * MANUAL constant; the 0.8.8 release bumped every package.json to 0.8.8 but left
 * `UPG_VERSION` at 0.8.7, so 0.8.8 tooling stamped files as 0.8.7 and the MCP
 * server reported the wrong catalogue version. This test makes that class of
 * lockstep miss impossible to ship: it fails the moment a release bumps
 * package.json without moving UPG_VERSION with it.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { UPG_VERSION } from '../index.js'

const here = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(resolve(here, '..', '..', 'package.json'), 'utf8'))

describe('release hygiene: UPG_VERSION tracks the package version', () => {
  it('UPG_VERSION (catalogue) === @unified-product-graph/core package.json version', () => {
    expect(UPG_VERSION).toBe(pkg.version)
  })
})
