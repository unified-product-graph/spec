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
  /** Accountable person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
}

/** Risk.
 *
 * @example
 * const properties: RiskProperties = {
 *   risk_type: 'technical',
 *   likelihood: 4,
 *   impact: 4,
 * }
 */
export interface RiskProperties {
  /**
   * Domain the risk belongs to. The single kind axis for `risk`: there is no
   * second classification vocabulary.
   *
   * `program` added in v0.26.0 so the retired `risk_item` (Program Management)
   * type has a home on the canonical `risk` after consolidation, rather than a
   * parallel `risk_domain` field free to drift from this one.
   */
  risk_type?: 'technical' | 'business' | 'legal' | 'security' | 'operational' | 'program'
  /**
   * How likely this risk is to materialise. Rated on `likelihood_5`
   * (Rare → Almost certain).
   * @remarks
   * Canonical name since 0.35.0, superseding `probability` below. Three
   * reasons, in order of weight. (1) `probability` was one name for two
   * incompatible types (`UPGAssessment` here, a bare `number` on
   * `forecast.probability`), and `PROPERTY_SCALE_MAP` is keyed by name alone,
   * so a sales percentage and a risk judgment resolved to the same ladder.
   * (2) `likelihood` is already the spec's own word: the RISK_ITEM lifecycle
   * prose says "Likelihood and impact have been evaluated", and
   * `threat.likelihood` has been a `UPGAssessment` all along: one name, one
   * type, one ladder. (3) ISO 31000 says likelihood.
   *
   * The ladder moved with the name: `likelihood_5` is new in 0.35.0 because no
   * probability ladder existed and `confidence_5` is epistemic. It says how
   * sure the assessor is, not how likely the event is.
   */
  likelihood?: UPGAssessment
  /**
   * How likely this risk is to materialise (1 = unlikely, 5 = near certain).
   * @deprecated since="0.35.0" removeIn="1.0.0". Use `likelihood`, which is the
   * spec's own word for this in the risk lifecycle and on `threat`.
   *
   * Both names resolve to the same `likelihood_5` ladder for the length of the
   * deprecation window (`PROPERTY_SCALE_MAP_BY_ENTITY.risk.probability`,
   * Captain-ratified 2026-08-22): a deprecated field that renders on a
   * DIFFERENT ladder from its replacement would make one stored 4 read
   * "Confident" under the old name and "Likely" under the new one, which is the
   * data changing meaning at the rename, which is the exact thing staging
   * exists to prevent. `forecast.probability` is untouched and stays on `confidence_5`.
   *
   * STAGED, not renamed. The field is KEPT and still read: 0.35.0 changes what
   * writers emit and what readers prefer, and changes NO stored bytes. A graph
   * written before 0.35.0 carries `probability` and no `likelihood`, and reads
   * correctly, which is the whole point of staging it.
   *
   * Writers: emit `likelihood`. Readers: prefer `likelihood`, fall back to
   * `probability`. The fallback is a CONTRACT on consumers, not executable
   * spec machinery, exactly as it is for `epic.estimate` → `effort`.
   *
   * `removeIn="1.0.0"` is a deadline, not a wish: at 1.0.0 this field is
   * dropped by a `drop_props` rule in `UPG_PROPERTY_MIGRATIONS`, the same
   * two-step the `removeIn="0.5.0"` properties followed (declared at 0.4.0,
   * dropped by the 0.5.0 rules). Until then there is deliberately no
   * executable rule: see the `'0.35.0'` block in `grammar/migrations.ts`.
   */
  probability?: UPGAssessment
  /**
   * Severity of consequences if the risk materialises. Rated on `severity_5`
   * (Mild inconvenience → Blocker), NOT the benefit-framed `impact_5`.
   * @remarks
   * The ladder is set by `PROPERTY_SCALE_MAP_BY_ENTITY.risk.impact` (0.35.0),
   * the per-entity override layer. `impact` legitimately means magnitude of
   * BENEFIT on discovery and market entities, where high is good; on a risk it
   * means severity of harm, where high is bad. Sharing `impact_5` rendered a
   * catastrophic risk green.
   */
  impact?: UPGAssessment
  /**
   * Planned or implemented mitigation strategy, as prose.
   * @remarks
   * Prose only. A structured list of mitigating ACTIONS is a set of edges:
   * `risk_mitigated_by_node` (0.35.0), pointing at the decisions, features and
   * experiments that actually do the mitigating; a string array of them is
   * unqueryable by construction. Likewise, what the risk puts at stake is
   * `risk_threatens_node`, not a scope-list property.
   */
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
  /** Owning person or team accountable for the contract. Promote to a `node_owned_by_team` edge if ownership must be queryable. */
  owner?: string
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
