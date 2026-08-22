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
   * SUPERSEDES `product.key_prefix` FOR THIS PRODUCT, AND NOTHING ELSE
   * (normative, narrowed in 0.34.0). The moment any team declares a prefix, the
   * PRODUCT-LEVEL prefix stops being consulted. A product-level prefix that still
   * resolved would win on order alone, and a multi-team product would then
   * silently mint everything under it, which is the defect this field exists to
   * end.
   *
   * THE CANDIDATE SET IS THE UNION OF DECLARED AND OBSERVED PREFIXES. A
   * declaration adds a candidate; it does not remove one. A prefix stops being
   * offered only when something claims it or when nothing has ever minted under
   * it, and while more than one candidate stands the create surface keeps asking.
   *
   * WHY THIS WAS NARROWED, stated because 0.33.0 shipped the wider reading and an
   * implementer built against it. The paragraph above made ANY declaration replace
   * the candidate set outright, and its own stated rationale is entirely about
   * `product.key_prefix`: a SINGLE STRING, declared once, that cannot represent
   * two teams. An OBSERVED prefix is not that. It is evidence of a namespace
   * already in active use. Suppressing it reproduces the precise defect this field
   * exists to end, inside one product, and does so silently. Measured on the only
   * keyed graph in the estate: it carries two observed prefixes, 370 keys under
   * one and 662 under the other, and declares neither. Under the wider reading,
   * one team declaring the smaller prefix collapses the candidate set to it, the
   * picker disappears, and every later create mints under it, including the 662
   * keys' worth of work belonging to the other namespace. The sentence over-reached
   * beyond its own reason, and this narrows it back to that reason.
   *
   * Shipped as a CHANGE in 0.34.0 rather than as a patch correction. Read as a
   * correction it is defensible, but implementers had already built to the wider
   * text, and moving a contract under them in a patch is how a patch becomes a
   * surprise.
   *
   * A DECLARED PREFIX IS A CANDIDATE BEFORE IT IS OBSERVED. Candidates derived
   * only from keys that already exist cannot see a team's first create, which is
   * the one that most needs asking about. That is why declaration ADDS to the
   * candidate set; it is not a reason for it to subtract.
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
   * HOW RULE 1 IS DECIDED: THE EVIDENCE RULE (normative, 0.34.0). Rule 1 names a
   * first product without saying how a minter knows which one it is. It is decided
   * by EVIDENCE, not by a stored marker: at mint, if any other IN-SCOPE product
   * already holds a key under the prefix, refuse. Evidence is derivable from the
   * graphs themselves, needs no migration, cannot go stale, and cannot disagree
   * with the keys. A durable home marker could do all three, and would mint state
   * for a fact the graph already carries. The cost is stated rather than hidden:
   * evidence is SCOPE-DEPENDENT, which is why the scope is ruled below in the same
   * breath rather than left open.
   *
   * THE UNDECIDABLE CASE: NEITHER MINTS (normative, 0.34.0). When two products
   * already hold keys under one prefix and nothing establishes which was first,
   * NEITHER mints. No tiebreak is invented. Creation order is not recorded, and
   * `max(existing)` measures import volume rather than precedence, so any tiebreak
   * would be a guess wearing a rule, and a silent one, since it would attribute a
   * namespace to a product with nothing to say it was wrong. Refusing both is the
   * NO-KEY outcome rule 2 already sanctions, and it is recoverable: once either
   * product declares the prefix, the other is unambiguous and a backfill can run.
   *
   * WHAT "IN SCOPE" MEANS: ENGINE-DEFINED, WITH A FLOOR AND A CEILING (normative,
   * 0.34.0). The scope over which the evidence rule looks is defined by the
   * engine, bounded on both sides.
   *
   *   FLOOR. It MUST include every product the engine can enumerate for this
   *   caller. An engine that looks at fewer products than it can see is choosing
   *   not to notice a collision it could have seen.
   *
   *   CEILING. It MUST NEVER include a product the caller could not otherwise
   *   read. A wider read is a cross-tenant information channel: refusing a mint
   *   because of a key in a graph the caller cannot see leaks that the graph
   *   exists and what is in it. This half is a security constraint and is not
   *   negotiable.
   *
   * PORTFOLIO ALTITUDE IS THE WRONG NORMATIVE ALTITUDE, and it was measured rather
   * than argued: deleting the portfolio document changes nothing about minting,
   * because no minter consults the portfolio seam. Stating the invariant there
   * states it where nobody looks. In practice the local engine's scope is every
   * graph in the workspace folder and the cloud engine's is the caller's own
   * product list.
   *
   * THE HONEST CONSEQUENCE, which belongs in the text rather than in a later
   * surprise: the invariant is SCOPE-RELATIVE. Two engines can legitimately
   * disagree about whether one mint is safe, because they can legitimately see
   * different sets of products. That is a real limitation of the evidence rule and
   * the price of the ceiling.
   *
   * IMMUTABLE ONCE ANYTHING HAS MINTED UNDER IT, PER PRODUCT (normative, 0.34.0).
   * Once any key exists under this prefix IN A GIVEN PRODUCT, the declaration
   * cannot be edited for that product. Refusal-shaped and NO-KEY, matching rule 2:
   * never an exception, because a keyless create is legal everywhere else in the
   * ladder.
   *
   *   SCOPED PER PRODUCT, NOT PER TEAM, and the reason is that `team` is
   *   `portfolio_shared`: a team that has never minted in product B must still be
   *   free to declare there. A per-team global lock would strand it.
   *
   *   WHAT IT PREVENTS. Without it, a team edits its prefix after four hundred
   *   mints and one product silently carries two number lines under two names,
   *   with nothing recording that they were ever one sequence.
   *
   *   RENAMING STAYS POSSIBLE BY THE HONEST ROUTE: a migration that rewrites the
   *   existing keys. That is a deliberate act with a visible cost, which is the
   *   difference between renaming a namespace and forking it by accident.
   *
   * THE PICKER MAY OFFER WHAT THE MINT REFUSES, AND THE SURFACE OWNS THE
   * DIVERGENCE (0.34.0). Rule 3 applies on the MINT path and not the picker path,
   * which is deliberate: the picker cannot cheaply know the answer, since knowing
   * it requires reading other products. The consequence is that a surface can
   * present a choice that then fails. The owner is named here rather than left
   * implicit: A CREATE SURFACE THAT OFFERS A PREFIX THE MINT MAY REFUSE MUST BE
   * ABLE TO REPORT THE REFUSAL, AND MUST BE ABLE TO PRESENT NO-KEY AS AN OUTCOME
   * RATHER THAN AS AN ERROR. This is a design obligation on the surface, not a
   * spec mechanic: the spec cannot fix a UX gap and should not pretend to. The
   * union ruling above shrinks the divergence considerably, because the picker now
   * keeps asking in exactly the case that would otherwise resolve wrongly.
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

/**
 * Which way a stakeholder leans. Pairs with `UPG_ENUM_SCALES.EngagementPosture`
 * for per-value labels and descriptions.
 */
export type EngagementPosture = 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker'

/** Stakeholder entity.
 *
 * @example
 * const properties: StakeholderProperties = {
 *   stakeholder_type: 'internal',
 *   influence: 4,
 *   interest: 4,
 *   engagement_posture: 'skeptic',
 *   engagement_cadence: 'monthly',
 * }
 */
export interface StakeholderProperties {
  /** Relationship of the stakeholder to the organisation */
  stakeholder_type?: 'internal' | 'external' | 'investor' | 'regulator'
  /** How much influence this stakeholder has over decisions (1 = minimal, 5 = decisive) */
  influence?: UPGAssessment
  /** How much interest this stakeholder has in the outcome (1 = passive, 5 = deeply invested) */
  interest?: UPGAssessment
  /**
   * Which way this stakeholder leans: actively for, actively against, or
   * neither. The third axis of the stakeholder model (0.35.0), beside the
   * power/interest grid `influence` and `interest` describe.
   * @remarks
   * `influence` and `interest` are magnitudes and carry no direction: a
   * high-influence, high-interest stakeholder can be the strongest champion or
   * the one who kills it, and the grid renders them identically. This closed
   * enum is what makes "who blocks this?" a query rather than a reading
   * exercise. Pairs with `UPG_ENUM_SCALES.EngagementPosture`. Posture is about
   * the person's stance; it is NOT delivery health, which belongs to work
   * items, and NOT the relationship's operational state.
   */
  engagement_posture?: EngagementPosture
  /**
   * How often this stakeholder is engaged. Uses the shared `Cadence` scale.
   * @remarks
   * Typed as `Cadence` rather than free text on purpose: v0.4.0 introduced that
   * enum precisely to retire strings like `"2x/week"`, and a cadence that
   * cannot be compared across stakeholders cannot answer "who have we not
   * spoken to this quarter?". WHERE you meet them (the channel) is an
   * app-level concern and is deliberately not modelled here.
   */
  engagement_cadence?: Cadence
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
