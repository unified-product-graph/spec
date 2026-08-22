/**
 * UPG Property Schemas: Team & Organisation Domain.
 * Team, Role, Stakeholder, TeamOkr, Retrospective, Dependency,
 * Department, Skill, Ceremony, CapacityPlan.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence, ISODate, Priority, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// TEAM & ORGANISATION
// ---------------------------------------------------------------------------

/** Team entity.
 *
 * @example
 * const properties: TeamProperties = {
 *   team_type: 'product',
 *   size: 120,
 *   mission: 'Give every product team the tools to think clearly and ship decisions that compound.',
 * }
 */
export interface TeamProperties {
  /** Functional area of the team */
  team_type?: 'product' | 'engineering' | 'design' | 'growth' | 'customer_success'
  /** Number of people on the team */
  size?: number
  /** Team's mission statement */
  mission?: string
  /**
   * Prefix this team mints node keys with (e.g. `"ENTP"`, giving ``,
   * ``, ...).
   *
   * @remarks
   * SUPERSEDES `product.key_prefix` FOR THIS PRODUCT. The moment any team
   * declares a prefix, the product-level prefix stops being consulted and the
   * declared team prefixes become the candidate set a create surface offers. A
   * product-level prefix that still resolved would win on order alone, and a
   * multi-team product would then silently mint everything under it, which is the
   * defect this field exists to end.
   *
   * A DECLARED PREFIX IS A CANDIDATE BEFORE IT IS OBSERVED. Candidates derived
   * only from keys that already exist cannot see a team's first create, which is
   * the one that most needs asking about.
   *
   * UNIQUENESS IS PRODUCT-SCOPED, AND A TEAM PREFIX DOES NOT WIDEN IT. The key
   * sequence runs per product across entity types, so two teams in one product
   * share one number line and never collide with each other. A team prefix names
   * a team WITHIN that scope; it does not create a sequence that spans products.
   *
   * MINTING IS PRODUCT-SCOPED (normative, 0.33.0). `team` is `portfolio_shared`,
   * so one team node can be referenced from two products. Minting is not
   * portfolio-scoped with it. The rule, and it is a requirement rather than a
   * recommendation:
   *
   * 1. A portfolio-shared team's prefix is NOT a minting candidate in a second
   *    product. The first product a team mints under is the only product that
   *    prefix mints in.
   * 2. Refusal is NO-KEY. The node is created without a key. Refusal MUST NOT be
   *    an exception: a keyless create is a legal outcome everywhere else in the
   *    ladder, and throwing here would break creates that succeed today on every
   *    surface. Throwing stays reserved for a broken invariant, not for policy.
   * 3. The rule applies on the MINT path, not the picker path, and it covers the
   *    INFERRED case. A prefix that was never requested by anyone, and was
   *    derived from keys that already exist in the second product, is refused on
   *    the same terms as one a caller named. A guard that only inspects an
   *    explicitly requested prefix misses the quiet path, and the quiet path is
   *    the one a fixture reproduces.
   *
   * WHY THE SCOPE STOPS AT THE PRODUCT. Key uniqueness is enforced by a
   * `(product_id, key)` index, which permits the same key under two product ids
   * by construction. A prefix that minted in two products would therefore run two
   * independent sequences under one name and hand two different nodes the same
   * citation, with nothing objecting. Portfolio-shared team minting is DEFERRED
   * until a supra-product uniqueness design exists, rather than approximated.
   *
   * This rule states the CONTRACT. The behaviour belongs to whatever mints keys,
   * which is not this package: see `UPGBaseNode.key`.
   *
   * @example "ENTP"
   */
  key_prefix?: string
}

/** Role entity.
 *
 * @example
 * const properties: RoleProperties = {
 *   responsibilities: ['Own delivery timelines', 'Run weekly reviews'],
 *   seniority_range: 'intern',
 *   required_skills: ['product-strategy', 'user-research', 'data-analysis'],
 * }
 */
export interface RoleProperties {
  /** Key responsibilities of the role */
  responsibilities?: string[]
  /** Seniority band this role sits in */
  seniority_range?: 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal' | 'director' | 'executive'
  /** Skills expected for the role (structural refs to Skill entities go via edges) */
  required_skills?: string[]
  /** Role this one reports to (name or role id) */
  reporting_line?: string
}

/** Person entity. A named, accountable individual.
 *
 * Distinct from `stakeholder` (an interested party: internal/external/investor/regulator)
 * and from `role` (a responsibility slot that may be filled by one or more people).
 *
 * Containment-free: `person` is not nested under `product` / `department` /
 * `team` in the structural hierarchy. People are *referenced* via
 * `node_owned_by_person`, not *contained*. See `UPG_CONTAINMENT_FREE_TYPES`
 * in `grammar/hierarchy.ts`.
 *
 * Properties are minimal: identity, addressability, coordination. HR-shaped
 * fields (`seniority`, `employment_type`, `start_date`) are intentionally
 * out of scope; they encode org-design opinions that vary wildly across
 * companies and have no bearing on product-graph reasoning. UPG is not
 * an HRIS.
 *
 * @example
 * const properties: PersonProperties = {
 *   role_title: 'Product Engineer',
 *   time_zone: 'Europe/Berlin',
 * }
 */
export interface PersonProperties {
  /** Free-text job title. Distinct from the structured `role` entity. */
  role_title?: string
  /** IANA time zone (e.g. "Europe/Berlin"). Useful for capacity / on-call planning. */
  time_zone?: string
}

/** Stakeholder entity.
 *
 * @example
 * const properties: StakeholderProperties = {
 *   stakeholder_type: 'internal',
 *   influence: 4,
 *   interest: 4,
 * }
 */
export interface StakeholderProperties {
  /** Relationship of the stakeholder to the organisation */
  stakeholder_type?: 'internal' | 'external' | 'investor' | 'regulator'
  /** How much influence this stakeholder has over decisions (1 = minimal, 5 = decisive) */
  influence?: UPGAssessment
  /** How much interest this stakeholder has in the outcome (1 = passive, 5 = deeply invested) */
  interest?: UPGAssessment
}

/** TeamOkr entity.
 *
 * @example
 * const properties: TeamOkrProperties = {
 *   period: '2026-Q2',
 *   progress: 42,
 *   objective_statement: 'Reach 1,000 weekly active graphs by end of Q3.',
 * }
 */
export interface TeamOkrProperties {
  /** Time period for the OKR (e.g. "Q2 2026") */
  period?: string
  /** Overall progress toward the objective (0-100%) */
  progress?: number
  /** The team-level objective statement (key results live in child entities) */
  objective_statement?: string
}

/** Retrospective entity.
 *
 * @example
 * const properties: RetrospectiveProperties = {
 *   format: 'start_stop_continue',
 *   period: '2026-Q2',
 *   key_learnings: ['Week-one retention correlates with first committed decision'],
 * }
 */
export interface RetrospectiveProperties {
  /**
   * Closed-set retro format covering established retrospective patterns.
   * Use `'other'` for novel formats; raise a spec proposal if `'other'` recurs.
   */
  format?:
    | 'start_stop_continue'
    | 'four_ls'
    | 'mad_sad_glad'
    | 'sailboat'
    | 'plus_delta'
    | 'lean_coffee'
    | 'other'
  /** Sprint or time period being reflected on */
  period?: string
  /** Key learnings from the retrospective */
  key_learnings?: string[]
  /** Action items agreed upon */
  action_items?: string[]
}

/** Dependency entity.
 *
 * @example
 * const properties: DependencyProperties = {
 *   dependency_type: 'blocks',
 *   resolution: 'Disable the retry loop on 4xx responses.',
 *   criticality: 'high',
 * }
 */
export interface DependencyProperties {
  /** Nature of the dependency relationship */
  dependency_type?: 'blocks' | 'enables' | 'informs'
  /** How the dependency was or will be resolved */
  resolution?: string
  /** How urgent the dependency is to resolve */
  criticality?: Priority
  /** Date by which resolution is needed (ISO 8601) */
  target_date?: ISODate
  /** Whether a workaround exists if the dependency is not resolved in time */
  workaround_available?: boolean
}

/** Department entity. A department is the single org tier above a team.
 * Division, org unit and business unit are alternative LABELS for this type, not
 * separate types.
 *
 * @remarks
 * THE LABEL RULING, STATED HERE BECAUSE ONE LINE IN A LABEL ARRAY WAS TOO QUIET.
 * `division`, `org unit` and `business unit` have been `alt_labels` on this type
 * since 0.1.0 and the ruling is right: a synonym is not a tier. It was also
 * findable only from the labels file, and a pre-scan for org modelling duly
 * reported `division` and `org_unit` as entity types. Two phantom types reached a
 * commissioning brief before a census caught them.
 *
 * THE BOUNDARY AGAINST `organization`, because one phrase reaching two types is
 * the confusion this ruling exists to end. "Business unit" names a structural
 * tier INSIDE a company and belongs here. Its alt_labels on `organization` are
 * org, company, enterprise and organisation, deliberately not this one.
 *
 * THE TEST IS INCORPORATION, AND THE NODE IS THE OPERATING COMPANY. A separately
 * incorporated operating company is an `organization`; a division inside one
 * company is a `department`. Do not read the incorporation test as "one node per
 * legal entity", which is a different and wrong rule: an `organization` is the
 * operating company as people experience it, and one organisation can span
 * several legal entities wherever structure follows tax or jurisdiction rather
 * than how the work is run. `legal_entity` is `organization`'s own declared
 * neighbour for exactly that reason. The test picks the boundary; it does not
 * pick the noun.
 *
 * DEPARTMENTS ARE FLAT, AND THAT IS THE CONSTRAINT THE RULING RAISES.
 * `team_contains_team` exists and `department_contains_department` does not, so a
 * three-level org chart is expressed as nested TEAMS under one department. That
 * is a deliberate constraint rather than a gap, and it is what makes a separate
 * division tier unnecessary rather than merely undesirable.
 *
 * @example
 * const properties: DepartmentProperties = {
 *   headcount: 42,
 *   budget: 50000,
 *   department_mission: 'Keep the product reliable, secure, and fast.',
 * }
 */
export interface DepartmentProperties {
  /** Total number of people in the department */
  headcount?: number
  /** Annual budget allocated to the department */
  budget?: number
  /** Charter / purpose statement for the department */
  department_mission?: string
  /** Department leader (person or role reference). Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  leader?: string
  /** Fiscal year the headcount / budget numbers apply to */
  fiscal_year?: string
}

/** Skill entity.
 *
 * @example
 * const properties: SkillProperties = {
 *   skill_category: 'research',
 *   proficiency_levels: ['novice', 'competent', 'expert'],
 *   domain: 'user',
 * }
 */
export interface SkillProperties {
  /** Category of the skill ( Option B). */
  skill_category?: 'technical' | 'leadership' | 'design' | 'product' | 'business' | 'operations' | 'other'
  /** Description of proficiency levels for this skill */
  proficiency_levels?: string[]
  /** Problem domain the skill applies to (e.g. "payments", "accessibility") */
  domain?: string
  /** How scarce this skill is in the labour market this team hires from */
  rarity?: UPGAssessment
  /** Typical hours of deliberate practice to reach working proficiency */
  hours_to_proficiency?: number
}

/** Ceremony entity.
 *
 * @example
 * const properties: CeremonyProperties = {
 *   ceremony_type: 'standup',
 *   cadence: 'quarterly',
 *   duration_minutes: 45,
 * }
 */
export interface CeremonyProperties {
  /** Kind of recurring meeting */
  ceremony_type?: 'standup' | 'planning' | 'review' | 'retro' | 'sync' | 'demo' | 'other'
  /** How often the ceremony occurs. Uses the shared `Cadence` scale. */
  cadence?: Cadence
  /** Typical duration of the meeting in minutes */
  duration_minutes?: number
  /** People or roles who attend. Promote individuals to `node_owned_by_person` edges if participation must be queryable. */
  participants?: string
}

/** CapacityPlan entity.
 *
 * @example
 * const properties: CapacityPlanProperties = {
 *   plan_period: '2026-Q2',
 *   total_capacity: 42,
 *   allocated: 42,
 * }
 */
export interface CapacityPlanProperties {
  /** Time period the plan covers (e.g. "Sprint 14", "Q2 2026") */
  plan_period?: string
  /** Total available capacity in person-days or story points */
  total_capacity?: number
  /** Capacity already allocated to work */
  allocated?: number
  /** Remaining unallocated capacity */
  available?: number
}
