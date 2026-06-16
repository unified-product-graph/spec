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
 *   email: 'ada@example.com',
 *   role_title: 'Product Engineer',
 *   time_zone: 'Europe/Berlin',
 * }
 */
export interface PersonProperties {
  /** Primary contact email. Stable identifier for de-duplication. */
  email?: string
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

/** Department entity.
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
  /** Department leader (person or role reference) */
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
  /** People or roles who attend */
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
