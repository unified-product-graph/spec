/**
 * UPG Property Schemas: Automation & Agentic Workflows Domain.
 * WorkflowTemplate, WorkflowRun, AgentDefinition, AgentSession, ReviewGate,
 * ApprovalRecord, AgentSkill, AgentHook, WorkflowArtifact, AgentTask.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODateTime, Priority } from '../primitives.js'

// ---------------------------------------------------------------------------
// AGENTIC WORKFLOWS
// ---------------------------------------------------------------------------

/** Workflow template.
 *
 * @example
 * const properties: WorkflowTemplateProperties = {
 *   template_type: 'sequential',
 *   step_count: 42,
 *   agent_count: 42,
 * }
 */
export interface WorkflowTemplateProperties {
  /** Execution pattern for the workflow steps */
  template_type?: 'sequential' | 'parallel' | 'conditional' | 'loop'
  /** Number of steps in the workflow */
  step_count?: number
  /** Number of agents involved in the workflow */
  agent_count?: number
  /** Estimated wall-clock duration of a full run */
  estimated_duration?: string
  /** Schema describing the workflow's state object */
  state_schema?: string
  /** Whether the workflow supports checkpointing for recovery */
  checkpoint_enabled?: boolean
  /** Whether a human approval step is required */
  human_in_loop?: boolean
  /** Version label for this workflow template (e.g. "2.1") */
  version?: string
}

/** Workflow run.
 *
 * @example
 * const properties: WorkflowRunProperties = {
 *   started_at: '2026-04-01T00:00:00Z',
 *   completed_at: '2026-04-01T00:00:00Z',
 *   run_status: 'pending',
 * }
 */
export interface WorkflowRunProperties {
  /** ISO timestamp when the run started */
  started_at?: ISODateTime
  /** ISO timestamp when the run completed */
  completed_at?: ISODateTime
  /** Current execution status of the run */
  run_status?: 'pending' | 'running' | 'completed' | 'failed' | 'canceled'
  /** Event or action that triggered this run */
  triggering_event?: string
  /** Number of steps executed in this run */
  step_count?: number
  /** Total tokens consumed across all steps */
  total_tokens?: number
  /** Total monetary cost of the run */
  total_cost?: number
  /** Error message if the run failed */
  error_message?: string
}

/** Agent definition.
 *
 * @example
 * const properties: AgentDefinitionProperties = {
 *   agent_role: 'research-copilot',
 *   agent_scope: 'Persona interviews within the growth domain.',
 *   goal: 'Cut time-to-first-value from 7 days to 2.',
 * }
 */
export interface AgentDefinitionProperties {
  /** Role the agent plays within a workflow */
  agent_role?: string
  /** Boundaries of what this agent can act on */
  agent_scope?: string
  /** Primary objective the agent is trying to achieve */
  goal?: string
  /** Context or persona narrative for the agent */
  backstory?: string
  /** List of tool names the agent can invoke */
  /** Reference to the AI model powering this agent */
  model_ref?: string
  /** Whether the agent can delegate tasks to other agents */
  allow_delegation?: boolean
  /** Whether the agent retains memory across sessions */
  memory_enabled?: boolean
  /** Maximum number of reasoning iterations allowed */
  max_iterations?: number
  /** Hard timeout for agent execution in seconds */
  max_execution_time_seconds?: number
  /** Whether the agent can execute generated code */
  allow_code_execution?: boolean
  /** Whether the agent can process images and other media */
  multimodal?: boolean
  /** Operational status of this agent definition */
  agent_status?: 'active' | 'disabled' | 'testing'
  /** Version label for this agent definition (e.g. "1.4.2") */
  version?: string
}

/** Agent session.
 *
 * @example
 * const properties: AgentSessionProperties = {
 *   session_start: '2026-04-17T09:00:00Z',
 *   session_end: '2026-04-17T09:48:00Z',
 *   turns: 42,
 * }
 */
export interface AgentSessionProperties {
  /** ISO timestamp when the session began */
  session_start?: string
  /** ISO timestamp when the session ended */
  session_end?: string
  /** Number of conversational turns in the session */
  turns?: number
  /** Total tokens consumed during the session */
  tokens_used?: number
  /** Total monetary cost of the session */
  cost?: number
  /** List of tools invoked during the session */
  tools_invoked?: string[]
  /** Number of errors encountered during the session */
  error_count?: number
  /** Current status of the session */
  session_status?: 'active' | 'completed' | 'errored' | 'timed_out'
  /** Brief summary of the session's output */
  output_summary?: string
}

/** Agent task. A discrete task assigned to an agent.
 *
 * @example
 * const properties: AgentTaskProperties = {
 *   description: 'Short narrative describing the entity and why it exists.',
 *   expected_output: 'A ranked list of opportunities with confidence scores.',
 *   context: 'Leads a 12-person product team at a mid-size B2B SaaS (50–200 employees).',
 * }
 */
export interface AgentTaskProperties {
  /** What the agent should accomplish */
  description: string
  /** Description of the expected output format or content */
  expected_output?: string
  /** Additional context provided to the agent for this task */
  context?: string
  /** Tools the agent may use for this task */
  tools?: string[]
  /** File path where the agent should write output */
  output_file?: string
  /** Whether this task blocks downstream tasks */
  blocking?: boolean
  /** Relative priority of this task */
  priority?: Priority
}

/** Review gate.
 *
 * @example
 * const properties: ReviewGateProperties = {
 *   gate_type: 'human_review',
 *   required_approvers: ['eng-lead', 'security-reviewer'],
 *   gate_status: 'pending',
 * }
 */
export interface ReviewGateProperties {
  /** Kind of review required at this gate */
  gate_type?: 'human_review' | 'automated_check' | 'approval'
  /** People or roles that must approve */
  required_approvers?: string[]
  /** Current approval status of the gate */
  gate_status?: 'pending' | 'approved' | 'rejected' | 'bypassed'
}

/** Approval record.
 *
 * @example
 * const properties: ApprovalRecordProperties = {
 *   approved: true,
 *   comment: 'Revisit once we have Q2 interview data.',
 *   approved_at: '2026-04-01T00:00:00Z',
 * }
 */
export interface ApprovalRecordProperties {
  /** Whether the item was approved or rejected */
  approved?: boolean
  /** Reviewer's comment or rationale */
  comment?: string
  /** ISO timestamp when the approval was given */
  approved_at?: ISODateTime
}

/** Agent skill.
 *
 * @example
 * const properties: AgentSkillProperties = {
 *   skill_trigger: '/upg-research',
 *   skill_description: 'Turns a transcript into a ranked list of opportunities.',
 *   invocation_count: 42,
 * }
 */
export interface AgentSkillProperties {
  /** Display name of the skill */
  /** Event or command that activates this skill */
  skill_trigger?: string
  /** Human-readable description of what the skill does */
  skill_description?: string
  /** Number of times this skill has been invoked */
  invocation_count?: number
}

/** Agent hook.
 *
 * @example
 * const properties: AgentHookProperties = {
 *   hook_event: 'node.committed',
 *   hook_action: 'post-to-slack',
 *   hook_status: 'active',
 * }
 */
export interface AgentHookProperties {
  /** Event that triggers this hook */
  hook_event?: string
  /** Action performed when the hook fires */
  hook_action?: string
  /** Operational status of the hook */
  hook_status?: 'active' | 'disabled' | 'error'
  /** Number of times this hook has fired */
  execution_count?: number
}

/** Workflow artifact.
 *
 * @example
 * const properties: WorkflowArtifactProperties = {
 *   artifact_type: 'document',
 *   artifact_url: 'https://builds.entopo.app/artifacts/entopo-0.3.1.tgz',
 *   produced_at: '2026-04-01T00:00:00Z',
 * }
 */
export interface WorkflowArtifactProperties {
  /** Kind of output produced by the workflow */
  artifact_type?: 'document' | 'code' | 'data' | 'report' | 'other'
  /** URL or path to the artifact */
  artifact_url?: string
  /** ISO timestamp when the artifact was produced */
  produced_at?: ISODateTime
}
