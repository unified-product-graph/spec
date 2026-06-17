/**
 * UPG Property Schemas: Legal Domain.
 * LegalEntity, IpAsset, Contract, ContractClause, PrivacyPolicy.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// LEGAL
// ---------------------------------------------------------------------------

/** Legal entity.
 *
 * @example
 * const properties: LegalEntityProperties = {
 *   entity_type: 'corporation',
 *   jurisdiction: 'Germany (DE)',
 *   ip_ownership: 'Assigned to Arkheiev UG under standard IP assignment clause.',
 * }
 */
export interface LegalEntityProperties {
  /** Legal structure of the entity */
  entity_type?: 'corporation' | 'llc' | 'partnership' | 'sole_proprietor' | 'nonprofit'
  /** Jurisdiction where the entity is registered */
  jurisdiction?: string
  /** Description of intellectual property ownership */
  ip_ownership?: string
  /** Date the entity was incorporated (ISO format) */
  date_incorporated?: string
}

/** Intellectual property asset.
 *
 * @example
 * const properties: IpAssetProperties = {
 *   asset_type: 'patent',
 *   jurisdiction: 'Germany (DE)',
 *   filing_date: '2026-04-01',
 * }
 */
export interface IpAssetProperties {
  /** Category of intellectual property */
  asset_type?: 'patent' | 'trademark' | 'copyright' | 'trade_secret' | 'design' | 'domain_name'
  /** Jurisdiction where the IP is protected */
  jurisdiction?: string
  /** Date the application was filed (ISO format) */
  filing_date?: ISODate
  /** Official registration or patent number */
  registration_number?: string
  /** Date the protection expires (ISO format) */
  expiry_date?: ISODate
  /** Priority date for patent claims (ISO format) */
  priority_date?: ISODate
}

/** Contract.
 *
 * @example
 * const properties: ContractProperties = {
 *   contract_type: 'service',
 *   contract_status: 'draft',
 *   start_date: '2026-04-01',
 * }
 */
export interface ContractProperties {
  /** Classification of the contract */
  contract_type?: 'service' | 'employment' | 'nda' | 'license' | 'partnership' | 'other'
  /** Contract effective start date (ISO format) */
  start_date?: ISODate
  /** Contract end or expiration date (ISO format) */
  end_date?: ISODate
  /** Total monetary value of the contract */
  value?: number
  /** Currency code for the contract value */
  currency?: string
  /** How the contract renews at expiration */
  auto_renewal?: 'auto_renew' | 'optional_extension' | 'none'
  /** Duration of each renewal period */
  renewal_term?: string
  /** Notice period required for termination or non-renewal */
  notice_period?: string
  /** Jurisdiction whose laws govern the contract */
  governing_law?: string
}

/** Contract clause.
 *
 * @example
 * const properties: ContractClauseProperties = {
 *   clause_type: 'termination',
 *   clause_category: 'protective',
 *   clause_text: 'Either party may terminate with 30 days written notice if the other materially breaches this agreement.',
 * }
 */
export interface ContractClauseProperties {
  /**
   * Specific clause. Closed set covering canonical commercial clause families.
   * Pairs with `clause_category` (`'protective' | 'operational' | 'financial' |
   * 'boilerplate'`), the functional grouping. `clause_type` is the named clause.
   */
  clause_type?:
    | 'indemnity'
    | 'liability_cap'
    | 'termination'
    | 'confidentiality'
    | 'ip_assignment'
    | 'non_compete'
    | 'warranty'
    | 'governing_law'
    | 'other'
  /** Functional category of the clause */
  clause_category?: 'protective' | 'operational' | 'financial' | 'boilerplate'
  /** Full text of the clause */
  clause_text?: string
  /** Whether this clause is open to negotiation */
  is_negotiable?: boolean
  /** Risk level if the clause is accepted as-is (1 = negligible, 5 = severe exposure) */
  risk_level?: UPGAssessment
}

/** Privacy policy.
 *
 * @example
 * const properties: PrivacyPolicyProperties = {
 *   version: '0.3.1',
 *   last_updated: '2026-02-15',
 *   effective_date: '2026-04-01',
 * }
 */
export interface PrivacyPolicyProperties {
  /** Version identifier of the policy */
  version?: string
  /** Date the policy was last updated (ISO format) */
  last_updated?: string
  /** Date the policy takes effect (ISO format) */
  effective_date?: ISODate
  /** URL where the policy is published */
  url?: string
}
