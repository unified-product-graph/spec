/**
 * UPG Property Schemas: Security Domain.
 * ThreatModel, Threat, Vulnerability, SecurityControl, SecurityPolicy,
 * PenetrationTest, SecurityReview, DataClassification, AccessPolicy.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence, DataSensitivity, ISODate, ISODateTime, UPGAssessment, RuleStrength } from '../primitives.js'

// ---------------------------------------------------------------------------
// SECURITY
// ---------------------------------------------------------------------------

/** Threat model.
 *
 * @example
 * const properties: ThreatModelProperties = {
 *   methodology: 'stride',
 *   scope: 'Covers in-product onboarding; excludes lifecycle email.',
 *   last_reviewed: '2026-02-15',
 * }
 */
export interface ThreatModelProperties {
  /**
   * Methodology.
   * `stride` = Spoofing, Tampering, Repudiation, Information Disclosure, DoS,
   *   Elevation of Privilege (OWASP standard).
   * `dread` = Damage, Reproducibility, Exploitability, Affected users,
   *   Discoverability (numeric scoring).
   * `pasta` = Process for Attack Simulation and Threat Analysis (7-stage).
   * `attack_tree` = hierarchical tree of attack paths.
   * @example "stride" is the most widely used methodology for web applications
   */
  methodology?: 'stride' | 'dread' | 'pasta' | 'attack_tree' | 'other'
  /**
   * What system, feature, or data flow is being analysed.
   * @example "user authentication", "payment processing", "admin API"
   */
  scope?: string
  /**
   * ISO date last reviewed. Models become stale as systems evolve.
   * @example "2026-03-01"
   */
  last_reviewed?: string
  /**
   * Participants in the exercise.
   * @example "Alice Chen (security lead), Bob Park (backend engineer), Carol Liu (architect)"
   */
  participants?: string
  /**
   * Threats identified. Key metric for scope and completeness.
   * @example 12
   */
  threat_count?: number
}

/** Threat.
 *
 * @example
 * const properties: ThreatProperties = {
 *   category: 'activation',
 *   likelihood: 4,
 *   impact: 4,
 * }
 */
export interface ThreatProperties {
  /**
   * Attack or threat scenario.
   * @example "injection", "misconfiguration", "social engineering", "supply chain"
   */
  category?: string
  /**
   * Likelihood (1 = theoretical, 5 = actively exploited).
   * @example value 5 for a known, exploitable, commonly targeted pattern
   */
  likelihood?: UPGAssessment
  /**
   * Impact (1 = minimal, 5 = catastrophic).
   * @example value 5 for threats that expose PII or cause complete service compromise
   */
  impact?: UPGAssessment
  /**
   * STRIDE classification. Which security property is violated.
   * `spoofing` = identity. `tampering` = integrity. `repudiation` = non-repudiability.
   * `info_disclosure` = confidentiality. `denial_of_service` = availability.
   * `elevation_of_privilege` = authorisation.
   */
  stride_type?: 'spoofing' | 'tampering' | 'repudiation' | 'info_disclosure' | 'denial_of_service' | 'elevation_of_privilege'
  /**
   * Threat actor or source.
   * @example "external attacker", "malicious insider", "compromised dependency", "misconfigured service"
   */
  threat_agent?: string
  /**
   * Mitigation status.
   * @example "accepted" = the risk has been formally acknowledged and no action will be taken
   */
  mitigation_status?: 'open' | 'mitigated' | 'accepted' | 'transferred' | 'eliminated'
  /**
   * Violated security property. Maps STRIDE to the CIA+ model.
   * @example "confidentiality" for information disclosure threats
   */
  violated_property?: 'authentication' | 'integrity' | 'non_repudiation' | 'confidentiality' | 'availability' | 'authorisation'
}

/** Vulnerability.
 *
 * @example
 * const properties: VulnerabilityProperties = {
 *   cve_id: 'CVE-2026-12345',
 *   cvss_score: 42,
 *   severity: 'critical',
 * }
 */
export interface VulnerabilityProperties {
  /**
   * CVE identifier from the National Vulnerability Database.
   * @example "CVE-2024-1234"
   */
  cve_id?: string
  /**
   * CVSS numeric score (0.0–10.0). Computed from the CVSS vector. Distinct from the categorical `severity`.
   * @example 9.8 (critical), 6.5 (medium), 3.7 (low)
   */
  cvss_score?: number
  /**
   * Categorical severity derived from CVSS.
   * Impact severity (UPGAssessment on the `severity_5` scale). Score alone is
   * insufficient for triage; severity drives filtering and prioritisation.
   * Migrated from the inline `critical|high|medium|low|informational` enum
   * ( Option C): map `critical` -> 5, `high` -> 4, `medium` -> 3,
   * `low` -> 2, `informational` -> 1; carry the old word in `label`.
   * @example value 5, label 'Critical', scale_id 'severity_5' (a remotely exploitable, no-auth vuln)
   */
  severity?: UPGAssessment
  /**
   * CVSS scoring version. v3.1 and v4.0 differ significantly for the same vulnerability.
   * @example "v4.0" for vulnerabilities scored after the v4.0 release in 2023
   */
  cvss_version?: 'v3.1' | 'v4.0'
  /**
   * Affected component, library, or system.
   * @example "lodash", "openssl", "login service"
   */
  affected_component?: string
  /**
   * Exploit maturity. Primary prioritisation factor after severity.
   * `no_known_exploit` = theoretical. `proof_of_concept` = exploit code exists, not weaponised.
   * `functional_exploit` = working exploit available. `active_exploitation` = active in the wild.
   * @example "active_exploitation" demands immediate response regardless of severity score
   */
  exploit_maturity?: 'no_known_exploit' | 'proof_of_concept' | 'functional_exploit' | 'active_exploitation'
  /**
   * Patch availability. Common triage question after severity.
   * @example false for a zero-day with no available patch
   */
  fix_available?: boolean
  /**
   * ISO date publicly disclosed. Time since disclosure matters for SLA.
   * @example "2024-03-15"
   */
  disclosed_at?: ISODateTime
  /**
   * ISO date discovered in this system.
   * @example "2026-04-01"
   */
  discovered_at?: ISODateTime
  /**
   * ISO date resolved or accepted. Closes the remediation timeline.
   * @example "2026-04-10"
   */
  remediated_at?: ISODateTime
}

/** Security control.
 *
 * @example
 * const properties: SecurityControlProperties = {
 *   control_type: 'preventive',
 *   effectiveness: 4,
 *   control_family: 'access-control',
 * }
 */
export interface SecurityControlProperties {
  /**
   * Functional role.
   * `preventive` = stops attacks (MFA, input validation).
   * `detective` = identifies attacks in progress (intrusion detection, audit logs).
   * `corrective` = reduces impact after an attack (incident response, backup restore).
   * `compensating` = alternative when primary isn't feasible.
   */
  control_type?: 'preventive' | 'detective' | 'corrective' | 'compensating'
  /** Mitigation effectiveness (1 = minimal, 5 = fully effective) */
  effectiveness?: UPGAssessment
  /** Control family (e.g. "access control", "network security") */
  control_family?: string
  /** Framework reference (e.g. "CC6.1", "A.9.2.3") */
  framework_ref?: string
  /** ISO date last tested */
  last_tested?: string
}

/** Security policy.
 *
 * @example
 * const properties: SecurityPolicyProperties = {
 *   scope: 'Covers in-product onboarding; excludes lifecycle email.',
 *   review_cadence: 'quarterly',
 *   version: '0.3.1',
 * }
 */
export interface SecurityPolicyProperties {
  /** Systems or processes covered */
  scope?: string
  /** Review cadence (e.g. `yearly`, `quarterly`). Uses the shared `Cadence` scale. */
  review_cadence?: Cadence
  /** Version */
  version?: string
  /** ISO effective date */
  effective_date?: ISODate
  /** Policy document URL */
  url?: string
  /** Lifecycle status */
  policy_status?: 'draft' | 'active' | 'under_review' | 'retired'
  /** Imperative force */
  rule_strength?: RuleStrength
}

/** Penetration test.
 *
 * @example
 * const properties: PenetrationTestProperties = {
 *   category: 'external',
 *   scope: 'Covers in-product onboarding; excludes lifecycle email.',
 *   findings_count: 42,
 * }
 */
export interface PenetrationTestProperties {
  /** Test type */
  category?: 'external' | 'internal' | 'web_app' | 'api' | 'mobile'
  /** Systems or features in scope */
  scope?: string
  /** Total findings */
  findings_count?: number
  /** Critical-severity findings */
  critical_count?: number
  /** ISO start date */
  start_date?: ISODate
  /** ISO end date */
  end_date?: ISODate
  /** Full report URL */
  report_url?: string
  /** Methodology (e.g. "OWASP", "PTES") */
  methodology?: string
}

/** Security review.
 *
 * @example
 * const properties: SecurityReviewProperties = {
 *   category: 'code',
 *   findings: 'Three out of five participants gave up before reaching the canvas.',
 *   review_date: '2026-04-01',
 * }
 */
export interface SecurityReviewProperties {
  /** Reviewed artifact */
  category?: 'code' | 'design' | 'architecture' | 'vendor'
  /** Findings summary */
  findings?: string
  /** ISO review date */
  review_date?: ISODate
  /** Final outcome */
  outcome?: 'approved' | 'approved_with_conditions' | 'rejected' | 'needs_rework'
}

/** Data classification.
 *
 * @example
 * const properties: DataClassificationProperties = {
 *   level: 'public',
 *   handling_requirements: 'Encrypt at rest; audit every read.',
 *   examples: ['Notion doc dump', 'Loom recording', 'Figma board'],
 * }
 */
export interface DataClassificationProperties {
  /** Sensitivity level */
  level?: DataSensitivity
  /** Handling rules */
  handling_requirements?: string
  /** Example data covered */
  examples?: string[]
  /** Retention period */
  retention_period?: string
  /** Whether encryption is mandatory */
  encryption_required?: boolean
}

/** Access policy.
 *
 * @example
 * const properties: AccessPolicyProperties = {
 *   resource: 'billing-database-primary',
 *   principal: 'service-account:billing',
 *   permission_level: 'read',
 * }
 */
export interface AccessPolicyProperties {
  /** Covered resource or system */
  resource?: string
  /** User, role, or group granted */
  principal?: string
  /** Access level */
  permission_level?: 'read' | 'write' | 'admin' | 'custom'
  /** Conditions (e.g. "VPN only", "business hours") */
  condition?: string
}
