/**
 * UPG Property Schemas: Compliance Domain.
 * ComplianceRequirement, Risk, DataContract, AuditLogPolicy,
 * ComplianceFramework, SecurityAudit.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// COMPLIANCE
// ---------------------------------------------------------------------------

/** Compliance requirement.
 *
 * @example
 * const properties: ComplianceRequirementProperties = {
 *   regulation: 'gdpr',
 *   compliance_status: 'compliant',
 * }
 */
export interface ComplianceRequirementProperties {
  /** Regulation or standard this requirement derives from */
  regulation?: 'gdpr' | 'ccpa' | 'hipaa' | 'soc2' | 'iso27001' | 'pci_dss' | 'other'
  /** Current compliance posture */
  compliance_status?: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
}

/** Risk.
 *
 * @example
 * const properties: RiskProperties = {
 *   risk_type: 'technical',
 *   probability: 4,
 *   impact: 4,
 * }
 */
export interface RiskProperties {
  /** Domain the risk belongs to */
  risk_type?: 'technical' | 'business' | 'legal' | 'security' | 'operational'
  /** How likely this risk is to materialise (1 = unlikely, 5 = near certain) */
  probability?: UPGAssessment
  /** Severity of consequences if the risk materialises (1 = negligible, 5 = catastrophic) */
  impact?: UPGAssessment
  /** Planned or implemented mitigation strategy */
  mitigation?: string
}

/** Data contract.
 *
 * @example
 * const properties: DataContractProperties = {
 *   retention_period: '365 days',
 *   deletion_policy: 'retain-90-days',
 *   third_party_sharing: true,
 * }
 */
export interface DataContractProperties {
  /** How long data is retained before deletion */
  retention_period?: string
  /** Policy governing data deletion */
  deletion_policy?: string
  /** Whether data is shared with third parties */
  third_party_sharing?: boolean
}

/** Audit log policy.
 *
 * @example
 * const properties: AuditLogPolicyProperties = {
 *   scope: 'Covers in-product onboarding; excludes lifecycle email.',
 *   retention_days: 42,
 * }
 */
export interface AuditLogPolicyProperties {
  /** What systems or actions are covered by the audit log */
  scope?: string
  /** Number of days audit logs are retained */
  retention_days?: number
  /** Types of events being logged */
  event_types?: string[]
}

/** Compliance framework.
 *
 * @example
 * const properties: ComplianceFrameworkProperties = {
 *   audit_date: '2026-04-01',
 *   next_audit: '2026-10-15',
 * }
 */
export interface ComplianceFrameworkProperties {
  /** Name of the framework (e.g. "SOC 2 Type II", "ISO 27001") */
  framework_name?: string
  /** Date of the last audit (ISO format) */
  audit_date?: ISODate
  /** Date of the next scheduled audit (ISO format) */
  next_audit?: string
}

/** Security audit.
 *
 * @example
 * const properties: SecurityAuditProperties = {
 *   audit_scope: 'All customer-facing APIs and the billing service.',
 *   findings_count: 42,
 * }
 */
export interface SecurityAuditProperties {
  /** Systems or processes covered by the audit */
  audit_scope?: string
  /** Total number of findings */
  findings_count?: number
  /** Number of critical-severity findings */
  critical_findings?: number
}
