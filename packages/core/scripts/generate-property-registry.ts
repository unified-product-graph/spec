/**
 * Generate the runtime property registry from TypeScript interfaces.
 *
 * Walks every *.ts file in src/properties/domains/ via the TypeScript
 * Compiler API, finds `*Properties` interface declarations, and emits a
 * runtime schema (src/properties/property-schema.ts).
 *
 * AST-based — replaces a prior regex parser. The regex approach
 * silently dropped multi-line union declarations and was fragile
 * against object-literal unions, parenthesised types, intersections,
 * generics, and imported aliases used in unions. The compiler walks
 * the real type tree, so the entire silent-drop class goes away.
 *
 * Usage: npx tsx scripts/generate-property-registry.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import ts from 'typescript'
import { getPropertyDefaultScale } from '../src/grammar/scales.js'
import { PROPERTY_MODIFIER_OVERLAY } from '../src/properties/property-modifier-overlay.js'

const SRC_DIR = path.join(import.meta.dirname, '..', 'src')

const DOMAIN_DIR = path.join(SRC_DIR, 'properties', 'domains')

const SOURCE_FILES = fs
  .readdirSync(DOMAIN_DIR)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => path.join(DOMAIN_DIR, f))

// ── Program + Type Checker (Q3 — resolve aliases across files) ───────────────
//
// Build a real TS Program over all domain files (entry points). The program
// pulls in the rest of the package (primitives.ts, grammar/*.ts) transitively
// so we can walk type-alias references via the checker.

const PROGRAM = ts.createProgram(SOURCE_FILES, {
  target: ts.ScriptTarget.Latest,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  allowJs: false,
  noEmit: true,
  skipLibCheck: true,
  strict: false,
})
const CHECKER = PROGRAM.getTypeChecker()

// Shape emitted for UPGAssessment fields. Mirrors the canonical interface in
// grammar/scales.ts: kept in sync by a regression test in spec-integrity.
// The top-level `type` is the first-class 'assessment' discriminator; the
// per-property canonical scale is attached as `scale_id` at parse time (it
// depends on the property name, resolved via getPropertyDefaultScale).
const UPG_ASSESSMENT_PROJECTION = {
  type: 'assessment' as const,
  properties: {
    value: { type: 'number', description: 'The numeric value, used for computation.' },
    label: { type: 'string', description: 'The qualitative label (what the assessor meant).' },
    scale_id: { type: 'string', description: 'Which assessment scale this was rated on (optional).' },
    normalized: { type: 'number', description: 'Normalized 0-1 value for cross-tool comparison (optional).' },
  } as Record<string, { type: string; description?: string; enum?: string[] }>,
  required: ['value', 'label'] as string[],
}

type InferResult = {
  type: string
  enum?: string[]
  properties?: Record<string, { type: string; description?: string; enum?: string[] }>
  required?: string[]
}

interface ParsedProperty {
  name: string
  type: string
  enum?: string[]
  scale_id?: string
  description?: string
  /** The `@remarks` half: rationale, edge cases, recipes, design history. */
  notes?: string
  properties?: Record<string, { type: string; description?: string; enum?: string[] }>
  required?: string[]
}

interface ParsedInterface {
  entityType: string
  interfaceName: string
  description?: string
  properties: ParsedProperty[]
}

/** Convert PascalCase interface name to snake_case entity type. */
function interfaceNameToEntityType(name: string): string {
  return name
    .replace(/Properties$/, '')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/j_t_b_d/, 'jtbd')
    .replace(/k_p_i/, 'kpi')
    .replace(/o_k_r/, 'okr')
    .replace(/g_t_m/, 'gtm')
    .replace(/r_a_g/, 'rag')
    .replace(/b_m_c/, 'bmc')
    .replace(/n_p_s/, 'nps')
    .replace(/a_b_/, 'ab_')
    .replace(/a_i_/, 'ai_')
    .replace(/s_l_i$/, 'sli')
    .replace(/s_l_o$/, 'slo')
    .replace(/a_d_r/, 'adr')
    .replace(/c_i_c_d/, 'ci_cd')
    .replace(/r_i_c_e/, 'rice')
    .replace(/q_a_/, 'qa_')
    .replace(/u_x_/, 'ux_')
    .replace(/s_e_o/, 'seo')
    .replace(/l_t_v/, 'ltv')
    .replace(/c_a_c/, 'cac')
}

// ── Named-reference mappings ─────────────────────────────────────────────────
// These mirror the prior regex generator's behaviour. When a property's type
// is a bare TypeReference to one of these names, emit the mapped shape.

function inferFromTypeName(typeName: string): InferResult | undefined {
  switch (typeName) {
    case 'Scale1to5':
      return { type: 'number' }
    case 'Priority':
      return { type: 'string', enum: ['urgent', 'high', 'medium', 'low', 'none'] }
    case 'RAGStatus':
    case 'HealthStatus':
      return { type: 'string', enum: ['on_track', 'at_risk', 'off_track'] }
    case 'Confidence':
      return { type: 'string', enum: ['high', 'medium', 'low'] }
    case 'UPGAssessment':
      return {
        type: UPG_ASSESSMENT_PROJECTION.type,
        properties: UPG_ASSESSMENT_PROJECTION.properties,
        required: UPG_ASSESSMENT_PROJECTION.required,
      }
    case 'ISODate':
    case 'ISODateTime':
      return { type: 'string' }
    case 'UPGMappingConfidence':
      return { type: 'string', enum: ['high', 'medium', 'low', 'manual'] }
    default:
      return undefined
  }
}

// ── Type-node analysis ───────────────────────────────────────────────────────

/** Strip outer ParenthesizedType wrappers — `(A | B)` → `A | B`. */
function unwrap(node: ts.TypeNode): ts.TypeNode {
  while (ts.isParenthesizedTypeNode(node)) node = node.type
  return node
}

/**
 * Collect string-literal members from a (possibly nested / parenthesised)
 * union. Returns `undefined` if any member isn't a string literal — i.e. the
 * union isn't a pure string-literal enum.
 */
function collectStringLiteralUnion(node: ts.TypeNode): string[] | undefined {
  node = unwrap(node)
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    return [node.literal.text]
  }
  if (ts.isUnionTypeNode(node)) {
    const out: string[] = []
    for (const member of node.types) {
      const sub = collectStringLiteralUnion(member)
      if (!sub) return undefined
      out.push(...sub)
    }
    return out
  }
  return undefined
}

/**
 * Resolve a TypeReferenceNode to its aliased declaration via the type checker
 * and re-infer from the aliased TypeNode. Returns `undefined` if the alias
 * can't be followed or doesn't resolve to a TypeAliasDeclaration we can map.
 *
 * Q3: type-alias references like `Cadence`, `Duration`, `MetricDesignation`,
 * `JourneyType`, etc. — follow to the underlying `type X = …` and infer from
 * the RHS type node. For `type X = 'a' | 'b' | 'c'` we recover the enum. For
 * `type X = string` we recover the primitive.
 */
function resolveTypeAlias(node: ts.TypeReferenceNode): InferResult | undefined {
  const symbol = CHECKER.getSymbolAtLocation(node.typeName)
  if (!symbol) return undefined
  // If this is an import alias, resolve to the original symbol.
  const target = (symbol.flags & ts.SymbolFlags.Alias) !== 0 ? CHECKER.getAliasedSymbol(symbol) : symbol
  const decls = target.declarations
  if (!decls || decls.length === 0) return undefined
  for (const d of decls) {
    if (ts.isTypeAliasDeclaration(d)) {
      // Recurse into the alias RHS. Use the type node directly — preserves
      // string-literal-union detection.
      const sub = inferFromNode(d.type)
      if (sub.type !== '__SKIP__') return sub
    }
    if (ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d)) {
      // Structural type — emit as object (matches existing behaviour for
      // UPGAssessment-class refs which are hard-coded above).
      return { type: 'object' }
    }
    if (ts.isEnumDeclaration(d)) {
      // Numeric / string enums → emit member names as enum values.
      const values: string[] = []
      for (const m of d.members) {
        if (m.name && ts.isIdentifier(m.name)) values.push(m.name.text)
      }
      if (values.length > 0) return { type: 'string', enum: values }
    }
  }
  return undefined
}

/**
 * Classify an array element type into the runtime array kind. `string` /
 * `number` elements and pure string-literal-union elements emit 'string[]'
 * (carrying the union as `enum`); structural elements (interfaces, inline
 * object literals) emit 'object[]'.
 *
 * Before 0.9.26 every `Array<Object>` collapsed to a scalar 'object', which
 * made array-valued properties (empty_cells, commitments, capabilities)
 * un-writable: the property-type validator rejected the array against an
 * 'object' declaration. Emitting 'object[]' heals that whole class.
 */
function inferArrayElement(elementNode: ts.TypeNode): InferResult {
  const inner = unwrap(elementNode)
  if (inner.kind === ts.SyntaxKind.StringKeyword) return { type: 'string[]' }
  if (inner.kind === ts.SyntaxKind.NumberKeyword) return { type: 'string[]' }
  const literals = collectStringLiteralUnion(inner)
  if (literals && literals.length > 0) return { type: 'string[]', enum: literals }
  return { type: 'object[]' }
}

/** Map a TypeNode to the simplified runtime InferResult. */
function inferFromNode(node: ts.TypeNode): InferResult {
  node = unwrap(node)

  // String-literal unions (multi-line, parenthesised, single, all collapse here)
  const enumValues = collectStringLiteralUnion(node)
  if (enumValues && enumValues.length > 0) {
    return { type: 'string', enum: enumValues }
  }

  // Primitives by keyword
  if (node.kind === ts.SyntaxKind.StringKeyword) return { type: 'string' }
  if (node.kind === ts.SyntaxKind.NumberKeyword) return { type: 'number' }
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return { type: 'boolean' }

  // Array shapes: T[] and Array<T>. Only the prior regex special-cased
  // `string[]` and `number[]` — everything else fell through to the
  // catch-all `string` fallback. Match that behaviour.
  if (ts.isArrayTypeNode(node)) {
    return inferArrayElement(node.elementType)
  }

  // Type references — named aliases / interfaces / Records / Arrays-by-name
  if (ts.isTypeReferenceNode(node)) {
    const typeName = ts.isIdentifier(node.typeName)
      ? node.typeName.text
      : node.typeName.getText()

    const named = inferFromTypeName(typeName)
    if (named) return named

    // Record<…> / Map<…> — keyed objects.
    if (typeName === 'Record' || typeName === 'Map') {
      return { type: 'object' }
    }
    // Array<T> / Set<T> — inspect the element so arrays of objects emit
    // 'object[]' instead of collapsing to a scalar 'object' (the pre-0.9.26
    // lossiness that made empty_cells / commitments / capabilities un-writable).
    if (typeName === 'Array' || typeName === 'Set') {
      const arg = node.typeArguments?.[0]
      return arg ? inferArrayElement(arg) : { type: 'object[]' }
    }

    // Q3: follow the alias through the type checker. Recovers enums from
    // string-literal-union aliases (Cadence, JourneyType, MetricDesignation,
    // NeedValence, GuardrailStatus, …) and primitives from string-aliases
    // (Duration, ISODate, Cron, Semver, …).
    const resolved = resolveTypeAlias(node)
    if (resolved) return resolved

    // Last resort — unknown structural reference. The prior regex fell back
    // to `string`; we keep `object` here only for truly opaque references
    // (none observed in the current domain corpus).
    return { type: 'object' }
  }

  // Inline object literal: { foo: string; bar: number }
  if (ts.isTypeLiteralNode(node)) return { type: 'object' }

  // Function / constructor / mapped / conditional types — drop (mirrors prior
  // generator which skipped lines containing `=>` or `function`).
  if (
    ts.isFunctionTypeNode(node) ||
    ts.isConstructorTypeNode(node) ||
    ts.isMappedTypeNode(node) ||
    ts.isConditionalTypeNode(node)
  ) {
    return { type: '__SKIP__' }
  }

  // Intersections — treat as object (structural composite)
  if (ts.isIntersectionTypeNode(node)) return { type: 'object' }

  // Unions that aren't pure string literals.
  // If any member is the bare `string` keyword (or resolves to it), the union
  // can't be expressed as a strict enum — collapse to plain string. This
  // mirrors regex behaviour where `'a' | 'b' | string` failed the
  // string-literal-union regex and fell through to the `string` fallback.
  if (ts.isUnionTypeNode(node)) {
    let hasBareString = false
    for (const member of node.types) {
      const m = unwrap(member)
      if (m.kind === ts.SyntaxKind.StringKeyword) {
        hasBareString = true
        break
      }
    }
    if (hasBareString) return { type: 'string' }
    // Pick first non-undefined/null member's primitive type.
    for (const member of node.types) {
      const m = unwrap(member)
      if (m.kind === ts.SyntaxKind.UndefinedKeyword || m.kind === ts.SyntaxKind.NullKeyword) continue
      return inferFromNode(m)
    }
    return { type: 'string' }
  }

  // Fallback
  return { type: 'string' }
}

// ── JSDoc extraction ─────────────────────────────────────────────────────────

/**
 * Extract the leading JSDoc text for an AST node, returning a single
 * space-joined description string (matching the prior regex generator's
 * normalisation). Honors @example as a description terminator so trailing
 * example blocks don't bleed into the schema description.
 */
function getJsDocDescription(
  node: ts.Node,
  opts: { includeTags: boolean; firstLineOnly?: boolean },
): string | undefined {
  return getJsDocParts(node, opts).description
}

/**
 * Read both documentation tiers from a node in ONE traversal.
 *
 * The two tiers come from a single JSDoc block, so reading them with two
 * independent walks parsed every comment on every member twice for a result
 * that was already in hand the first time. At roughly 1500 members that is a
 * doubling of the generator's parse cost for nothing.
 *
 * Each tier keeps its own first-match-wins rule, unchanged: the description is
 * the first JSDoc block yielding non-empty joined text, the notes are the first
 * `@remarks` tag with non-empty content. They are resolved independently and
 * the walk stops as soon as both are settled.
 *
 * Canonical statement of the two-tier convention:
 * packages/upg-spec/src/properties/PROPERTIES.md. Restated here for the reader
 * in front of it; if the two disagree, PROPERTIES.md wins.
 */
function getJsDocParts(
  node: ts.Node,
  opts: { includeTags: boolean; firstLineOnly?: boolean },
): { description?: string; notes?: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsdocs = (ts as any).getJSDocCommentsAndTags(node) as ts.Node[]
  if (!jsdocs || jsdocs.length === 0) return {}

  let description: string | undefined
  let notes: string | undefined

  for (const j of jsdocs) {
    if (j.kind !== ts.SyntaxKind.JSDoc) continue
    const jd = j as ts.JSDoc

    if (notes === undefined && jd.tags) {
      for (const tag of jd.tags) {
        if (tag.tagName.text !== 'remarks') continue
        const tc = tag.comment
        let text = ''
        if (typeof tc === 'string') text = tc
        else if (Array.isArray(tc)) text = tc.map((p) => p.text).join('')
        const trimmed = normalizeWhitespace(text)
        if (trimmed) {
          notes = trimmed
          break
        }
      }
    }

    if (description !== undefined) {
      if (notes !== undefined) break
      continue
    }

    // 1) Body text (the comment block before any @tags)
    const parts: string[] = []
    const raw = jd.comment
    let body = ''
    if (typeof raw === 'string') {
      body = raw
    } else if (Array.isArray(raw)) {
      body = raw.map((p) => p.text).join('')
    }
    if (opts.firstLineOnly) {
      // Match the regex generator's `(.+?)` non-greedy capture which
      // terminated at the first line break. Interface descriptions used
      // this mode so a multi-paragraph block emitted only its lead line.
      const nlIdx = body.indexOf('\n')
      if (nlIdx >= 0) body = body.slice(0, nlIdx)
    }
    parts.push(body)

    // 2) Tag text — Q1: preserve @example / @deprecated tag content in
    //    *property* descriptions, matching the regex's previous output.
    //    The regex concatenated every `*` continuation line of a property's
    //    JSDoc, which included @example and @deprecated blocks.
    //
    //    For *interface* descriptions the regex only grabbed the first
    //    content line (its `descMatch = jsdoc.match(/\*\s+(.+?)…/)`
    //    terminates at the next line break), so we omit tags there.
    if (opts.includeTags && jd.tags) {
      for (const tag of jd.tags) {
        const tagName = tag.tagName.text
        // Mirror the regex's de facto inclusion set — everything that
        // appeared in the comment block as continuation lines. @param /
        // @returns / @template / @internal were not present on properties.
        // `@remarks` is the LONGFORM half of the two-tier convention and is
        // extracted separately into `notes`. Excluding it here is what keeps a
        // summary short: everything a caller must not get wrong stays in the
        // description, the rationale and edge cases move behind the tag.
        if (tagName === 'param' || tagName === 'returns' || tagName === 'template' || tagName === 'internal' || tagName === 'remarks') continue

        let tagText = ''
        const tc = tag.comment
        if (typeof tc === 'string') {
          tagText = tc
        } else if (Array.isArray(tc)) {
          tagText = tc.map((p) => p.text).join('')
        }
        if (!tagText.trim() && 'text' in tag && typeof (tag as { text?: unknown }).text === 'string') {
          tagText = (tag as { text: string }).text
        }

        const piece = tagText.trim() ? `@${tagName} ${tagText.trim()}` : `@${tagName}`
        parts.push(piece)
      }
    }

    const joined = parts.join(' ').trim()
    if (joined) description = normalizeWhitespace(joined)
    if (description !== undefined && notes !== undefined) break
  }
  return { description, notes }
}

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

// ── File walk ────────────────────────────────────────────────────────────────

function parseFile(filePath: string): ParsedInterface[] {
  // Use the SourceFile from the Program so the type checker can resolve
  // cross-file alias references (Q3).
  const sf = PROGRAM.getSourceFile(filePath)
  if (!sf) {
    throw new Error(`Source file not found in program: ${filePath}`)
  }

  const interfaces: ParsedInterface[] = []

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Properties')) {
      const interfaceName = node.name.text
      const entityType = interfaceNameToEntityType(interfaceName)
      const description = getJsDocDescription(node, { includeTags: false, firstLineOnly: true })

      const properties: ParsedProperty[] = []
      // RESOLVE `extends` (0.33.0). `UPG_PROPERTY_SCHEMA` is a FLAT per-type map,
      // so an inherited member is invisible to it unless it is resolved here.
      // 0.33.0 lifted `member_query` and `presentation` onto a shared
      // `UPGQueryDrivenLayer` that `composition` and `workspace` both extend, and
      // without this the lift silently DELETED both fields from composition's
      // runtime entry: a shipped 0.32.0 field, removed from the mirror by a
      // refactor the type system considered a no-op.
      //
      // Same-file lookup only, which is all any current case needs, and a missing
      // base is a hard error rather than a silent skip: a quietly empty base is
      // exactly the failure this block exists to end.
      const inheritedMembers: ts.TypeElement[] = []
      for (const heritage of node.heritageClauses ?? []) {
        if (heritage.token !== ts.SyntaxKind.ExtendsKeyword) continue
        for (const expr of heritage.types) {
          if (!ts.isIdentifier(expr.expression)) continue
          const baseName = expr.expression.text
          let base: ts.InterfaceDeclaration | undefined
          const findBase = (n: ts.Node): void => {
            if (ts.isInterfaceDeclaration(n) && n.name.text === baseName) base = n
            ts.forEachChild(n, findBase)
          }
          ts.forEachChild(sf!, findBase)
          if (!base) {
            throw new Error(
              `${interfaceName} extends ${baseName}, which was not found in ${filePath}. ` +
                `The property registry resolves heritage within one file; move the base ` +
                `interface into this file or declare the members directly.`,
            )
          }
          inheritedMembers.push(...base.members)
        }
      }
      // Inherited first, so a redeclaration in the extending interface wins on
      // the de-duplication below, matching how TypeScript narrows an override.
      const seenMemberNames = new Set<string>()
      const allMembers = [...inheritedMembers, ...node.members].reverse().filter((m) => {
        if (!ts.isPropertySignature(m) || !m.name || !ts.isIdentifier(m.name)) return true
        if (seenMemberNames.has(m.name.text)) return false
        seenMemberNames.add(m.name.text)
        return true
      }).reverse()

      for (const member of allMembers) {
        if (!ts.isPropertySignature(member)) continue
        if (!member.name || !ts.isIdentifier(member.name)) continue
        if (!member.type) continue

        const propName = member.name.text
        const inferred = inferFromNode(member.type)
        if (inferred.type === '__SKIP__') continue

        // For first-class 'assessment' properties, resolve the canonical scale
        // for this property name (e.g. severity -> severity_5). This replaces
        // the consumer-side getPropertyDefaultScale(name) !== 'scale_5' heuristic.
        const scaleId = inferred.type === 'assessment'
          ? getPropertyDefaultScale(entityType, propName)
          : undefined

        const { description: propDescription, notes: propNotes } = getJsDocParts(member, { includeTags: true })
        properties.push({
          name: propName,
          type: inferred.type,
          ...(inferred.enum ? { enum: inferred.enum } : {}),
          ...(scaleId ? { scale_id: scaleId } : {}),
          ...(inferred.properties ? { properties: inferred.properties } : {}),
          ...(inferred.required ? { required: inferred.required } : {}),
          ...(propDescription ? { description: propDescription } : {}),
          ...(propNotes ? { notes: propNotes } : {}),
        })
      }

      if (properties.length > 0) {
        interfaces.push({ entityType, interfaceName, description, properties })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sf)
  return interfaces
}

// ── Main ─────────────────────────────────────────────────────────────────────

const allInterfaces: ParsedInterface[] = []
const seenTypes = new Set<string>()

for (const file of SOURCE_FILES) {
  const parsed = parseFile(file)
  for (const iface of parsed) {
    if (!seenTypes.has(iface.entityType)) {
      seenTypes.add(iface.entityType)
      allInterfaces.push(iface)
    }
  }
}

// Edge-defined active entity types: they carry NO scalar properties (their
// substance lives in edges + framework-scoped scoring), so no `*Properties`
// interface declares them and the walk above skips them. But the completeness
// invariant (audit-completeness G3 / spec-integrity) requires EVERY active type
// to have a UPG_PROPERTY_SCHEMA entry — an empty `{}` means "no typed
// properties" (distinct from absent). Emit those entries here. A new active
// type with no properties will fail that invariant until it is added here.
const EDGE_DEFINED_ENTITIES: Record<string, string> = {
  opportunity: 'A problem worth solving, grounded in user need and business value.',
}
for (const [entityType, description] of Object.entries(EDGE_DEFINED_ENTITIES)) {
  if (seenTypes.has(entityType)) continue
  seenTypes.add(entityType)
  const interfaceName =
    entityType.replace(/(^|_)([a-z])/g, (_m, _s, c) => c.toUpperCase()) + 'Properties'
  allInterfaces.push({ entityType, interfaceName, description, properties: [] })
}

allInterfaces.sort((a, b) => a.entityType.localeCompare(b.entityType))

const lines: string[] = [
  '/**',
  ' * UPG Property Registry: Runtime schema for entity types',
  ' *',
  ' * AUTO-GENERATED by scripts/generate-property-registry.ts',
  ' * Do not edit manually. Run: npx tsx scripts/generate-property-registry.ts',
  ' *',
  " * Sources: property types / enums / descriptions come from the domain",
  " * interfaces in src/properties/domains/*.ts (their JSDoc); the `modifier`",
  " * provenance annotations (derived / snapshot / volatile, property-fit audit)",
  " * come from the curated src/properties/property-modifier-overlay.ts. Both are",
  " * re-emitted here, so a regeneration reproduces this file exactly (no",
  " * wall-clock timestamp: generation is deterministic). This file is a GATED",
  " * artifact — check:generated re-runs the generator and fails on any drift, so",
  " * edit the sources above, never this file.",
  ` * Entity types with properties: ${allInterfaces.length}`,
  ' */',
  '',
  'export interface PropertyDefinition {',
  "  type: 'string' | 'number' | 'boolean' | 'string[]' | 'object' | 'object[]' | 'assessment'",
  '  /**',
  '   * The CONTRACT: what the property means and the semantics a caller must',
  '   * not get wrong. Two or three sentences. This is what a hover card, a',
  '   * tooltip and a token-conscious agent read.',
  '   */',
  '  description?: string',
  '  /**',
  '   * The LONGFORM half (`@remarks` in the source JSDoc): rationale, edge',
  '   * cases, workflow recipes, design history. The reference page renders it',
  '   * behind a disclosure; hovers and schema summaries leave it out.',
  '   *',
  '   * Semantics MOVE here, they are never deleted. A field that stops being',
  '   * findable is worse than a field that is long, which is the lesson a',
  '   * reporter taught by concluding a capability did not exist when it was',
  '   * documented somewhere they did not read.',
  '   */',
  '  notes?: string',
  '  enum?: string[]',
  "  /** For 'assessment'-typed fields: the canonical UPG scale this property is rated on (e.g. 'confidence_5'). */",
  '  scale_id?: string',
  '  /** For object/assessment fields: nested property shapes. */',
  '  properties?: Record<string, PropertyDefinition>',
  '  /** For object/assessment fields: required keys within `properties`. */',
  '  required?: string[]',
  '  /**',
  '   * Provenance / volatility modifier (property-fit audit, 2026-06-16). Marks a property',
  '   * whose value is not authored-and-stable, so tooling (`validate_graph`, renderers, export)',
  '   * can treat it accordingly:',
  "   *  - `'derived'`  — computed from edges/children at read-time; never hand-authored.",
  '   *                   `validate_graph` flags a stored value that contradicts the graph.',
  "   *  - `'snapshot'` — a stale-stamped cache of a live reading; SHOULD pair with a `*_as_of`",
  '   *                   timestamp. Definition entities carry live state only as a snapshot.',
  "   *  - `'volatile'` — an environment-specific pointer (URL / path / id) that may rot or be",
  '   *                   stripped on export; not portable modeling knowledge (open-standard',
  '   *                   data-boundary ADR). Enforcement lands in `validate_graph` (mcp-server).',
  '   * Sourced from property-modifier-overlay.ts.',
  '   */',
  "  modifier?: 'derived' | 'snapshot' | 'volatile'",
  '}',
  '',
  'export type PropertySchema = Record<string, PropertyDefinition>',
  '',
  '/**',
  ' * Runtime property schemas for all entity types with typed properties.',
  ' * Entity types not listed here have no typed properties (just title/description/status/tags).',
  ' */',
  'export const UPG_PROPERTY_SCHEMA: Record<string, PropertySchema> = {',
]

function escapeSingleQuotes(s: string): string {
  return s.replace(/'/g, "\\'")
}

// Track which overlay annotations we actually emit, so a key that names a
// property the schema no longer has fails the build (drift guard below) instead
// of silently vanishing. Modifiers apply to top-level scalar properties only.
const emittedModifiers = new Set<string>()

for (const iface of allInterfaces) {
  lines.push(`  // ${iface.interfaceName}${iface.description ? `: ${iface.description}` : ''}`)
  // Property-less (edge-defined) entity: emit an inline empty entry so the type
  // is present in UPG_PROPERTY_SCHEMA (a `{}` means "no typed properties").
  if (iface.properties.length === 0) {
    lines.push(`  ${iface.entityType}: {},`)
    continue
  }
  lines.push(`  ${iface.entityType}: {`)
  for (const prop of iface.properties) {
    const modifier = PROPERTY_MODIFIER_OVERLAY[iface.entityType]?.[prop.name]

    const parts: string[] = [`type: '${prop.type}'`]
    if (prop.enum) parts.push(`enum: [${prop.enum.map((v) => `'${v}'`).join(', ')}]`)
    if (prop.scale_id) parts.push(`scale_id: '${prop.scale_id}'`)
    if (prop.description) parts.push(`description: '${escapeSingleQuotes(prop.description)}'`)
    if (prop.notes) parts.push(`notes: '${escapeSingleQuotes(prop.notes)}'`)
    // Re-emit the curated modifier LAST (matches the audit annotation order:
    // `{ type, [enum], [scale_id], [description], modifier }`). Only scalar
    // properties carry modifiers; a nested-object property never does.
    if (modifier && !prop.properties) {
      parts.push(`modifier: '${modifier}'`)
      emittedModifiers.add(`${iface.entityType}.${prop.name}`)
    }

    if (prop.properties) {
      const headerParts = [`type: '${prop.type}'`]
      if (prop.scale_id) headerParts.push(`scale_id: '${prop.scale_id}'`)
      if (prop.description) headerParts.push(`description: '${escapeSingleQuotes(prop.description)}'`)
      if (prop.notes) headerParts.push(`notes: '${escapeSingleQuotes(prop.notes)}'`)
      lines.push(`    ${prop.name}: {`)
      lines.push(`      ${headerParts.join(', ')},`)
      lines.push('      properties: {')
      for (const [childName, childDef] of Object.entries(prop.properties)) {
        const childParts: string[] = [`type: '${childDef.type}'`]
        if (childDef.enum) childParts.push(`enum: [${childDef.enum.map((v) => `'${v}'`).join(', ')}]`)
        if (childDef.description) childParts.push(`description: '${escapeSingleQuotes(childDef.description)}'`)
        lines.push(`        ${childName}: { ${childParts.join(', ')} },`)
      }
      lines.push('      },')
      if (prop.required && prop.required.length > 0) {
        lines.push(`      required: [${prop.required.map((r) => `'${r}'`).join(', ')}],`)
      }
      lines.push('    },')
    } else {
      lines.push(`    ${prop.name}: { ${parts.join(', ')} },`)
    }
  }
  lines.push('  },')
}

lines.push('}')
lines.push('')
lines.push('/**')
lines.push(' * Get the property schema for an entity type.')
lines.push(' * Returns undefined if the type has no typed properties.')
lines.push(' */')
lines.push('export function getPropertySchema(entityType: string): PropertySchema | undefined {')
lines.push('  return UPG_PROPERTY_SCHEMA[entityType]')
lines.push('}')
lines.push('')

// ── Modifier drift guard ─────────────────────────────────────────────────────
// Every overlay annotation must have landed on a real property. A key that
// names a (type, property) the schema no longer has (renamed / removed in the
// domain source, or a nested-object property that can't carry a modifier) is a
// hard error: fix the overlay, never let a curated annotation silently vanish.
const overlayKeys: string[] = []
for (const [type, props] of Object.entries(PROPERTY_MODIFIER_OVERLAY)) {
  for (const prop of Object.keys(props)) overlayKeys.push(`${type}.${prop}`)
}
const unmatched = overlayKeys.filter((k) => !emittedModifiers.has(k)).sort()
if (unmatched.length > 0) {
  console.error(
    `\n✗ property-modifier-overlay.ts references ${unmatched.length} propert${unmatched.length === 1 ? 'y' : 'ies'} not emitted into the schema:\n` +
      unmatched.map((k) => `    - ${k}`).join('\n') +
      `\n  Each must be a top-level scalar property of a live domain interface. ` +
      `Update property-modifier-overlay.ts (the property was likely renamed or removed in src/properties/domains/).`,
  )
  process.exit(1)
}

const output = lines.join('\n')
const outPath = path.join(SRC_DIR, 'properties', 'property-schema.ts')
fs.writeFileSync(outPath, output, 'utf-8')

console.log(
  `Generated property registry: ${allInterfaces.length} entity types, ${emittedModifiers.size} modifier annotations re-emitted from the overlay.`,
)
console.log(`Written to: ${outPath}`)
