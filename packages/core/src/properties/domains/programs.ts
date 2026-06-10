/**
 * UPG Property Schemas: Program Management Domain.
 * Program, Project, Milestone, RiskRegister, ChangeRequest,
 * Deliverable, ResourceAllocation, StatusReport.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { HealthStatus, ISODate, Priority } from '../primitives.js'

// ---------------------------------------------------------------------------
// PROGRAM MANAGEMENT
// ---------------------------------------------------------------------------

/** Program.
 *
 * @example
 * const properties: ProgramProperties = {
 *   start_date: '2026-04-01',
 *   end_date: '2026-09-30',
 *   budget: 50000,
 * }
 */
export interface ProgramProperties {
  /** Current status of the program */
  program_status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  /** Program start date (ISO format) */
  start_date?: ISODate
  /** Program end date (ISO format) */
  end_date?: ISODate
  /** Total budget allocated to the program */
  budget?: number
}

/** Project.
 *
 * @example
 * const properties: ProjectProperties = {
 *   start_date: '2026-04-01',
 *   end_date: '2026-09-30',
 *   methodology: 'agile',
 * }
 */
export interface ProjectProperties {
  /** Current status of the project */
  project_status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  /** Project start date (ISO format) */
  start_date?: ISODate
  /** Project end date (ISO format) */
  end_date?: ISODate
  /** Development methodology used */
  methodology?: 'agile' | 'waterfall' | 'kanban' | 'hybrid'
}

/** Milestone.
 *
 * @example
 * const properties: MilestoneProperties = {
 *   due_date: '2026-06-15',
 * }
 */
export interface MilestoneProperties {
  /**
   * Display order of this milestone within its parent project (0-indexed). The
   * scalar ordering convention shared with `journey_step.step_order` and
   * `journey_action.action_order` ( /). Orders the delivery
   * milestones a project moves through, independent of `due_date`.
   */
  milestone_order?: number
  /** Target due date (ISO format) */
  due_date?: ISODate
  /** Whether the milestone was met on time */
  met_on_time?: boolean
}

/** Risk register.
 *
 * @example
 * const properties: RiskRegisterProperties = {
 *   last_reviewed: '2026-02-15',
 * }
 */
export interface RiskRegisterProperties {
  /** Date the register was last reviewed (ISO format) */
  last_reviewed?: string
}

/** Change request.
 *
 * @example
 * const properties: ChangeRequestProperties = {
 *   change_type: 'scope',
 *   priority: 'high',
 *   impact_assessment: 'Medium: affects onboarding success metric.',
 * }
 */
export interface ChangeRequestProperties {
  /** What aspect of the project is being changed */
  change_type?: 'scope' | 'schedule' | 'budget' | 'resource' | 'requirements'
  /** Current approval status of the request */
  approval_status?: 'pending' | 'approved' | 'rejected' | 'deferred'
  /** Priority of the change request */
  priority?: Priority
  /** Description of the change's impact on the project */
  impact_assessment?: string
}

/** Deliverable.
 *
 * @example
 * const properties: DeliverableProperties = {
 *   deliverable_type: 'document',
 *   due_date: '2026-06-15',
 *   acceptance_criteria: 'Given a new signup, when they complete onboarding, then the welcome email fires within 60 seconds.',
 * }
 */
export interface DeliverableProperties {
  /** Kind of deliverable ( Option B). */
  deliverable_type?: 'document' | 'prototype' | 'release' | 'design' | 'report' | 'other'
  /** Due date for the deliverable (ISO format) */
  due_date?: ISODate
  /** Current progress status */
  deliverable_status?: 'not_started' | 'in_progress' | 'in_review' | 'accepted' | 'rejected'
  /** Criteria that must be met for the deliverable to be accepted */
  acceptance_criteria?: string
}

/** Resource allocation.
 *
 * @example
 * const properties: ResourceAllocationProperties = {
 *   resource_type: 'person',
 *   allocation_percentage: 42,
 *   start_date: '2026-04-01',
 * }
 */
export interface ResourceAllocationProperties {
  /** Kind of resource being allocated */
  resource_type?: 'person' | 'team' | 'budget' | 'tool'
  /** Percentage of the resource allocated (0-100) */
  allocation_percentage?: number
  /** Start date of the allocation (ISO format) */
  start_date?: ISODate
  /** End date of the allocation (ISO format) */
  end_date?: ISODate
}

/** Status report.
 *
 * @example
 * const properties: StatusReportProperties = {
 *   report_period: '2026-Q2',
 *   overall_status: 'green',
 *   risks_flagged: 42,
 * }
 */
export interface StatusReportProperties {
  /** Time period the report covers */
  report_period?: string
  /** Overall Red/Amber/Green health status */
  overall_status?: HealthStatus
  /** Number of risks flagged in this report */
  risks_flagged?: number
  /** Description of current blockers */
  blockers?: string
}
