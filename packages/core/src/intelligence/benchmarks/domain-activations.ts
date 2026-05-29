/**
 * When each UPG domain is expected to "turn on" across the product journey.
 *
 * Each row binds a domain (see `registry/domains.ts`) to the earliest stage
 * at which domain activity is expected (`expected_from`) and the stage by
 * which it should be fully active (`expected_mature`). E.g. `strategy` should
 * be active from `concept`; `sales` typically activates at `launch`.
 *
 * Consumers:
 * - Intelligence layer → "domain asleep at this stage" warnings, stage
 *   readiness checks
 *
 * Benchmark shape: see `DomainActivation` in `./types.ts`.
 *
 * @see ./types.ts `DomainActivation`
 * @see ../../registry/domains.ts canonical domain registry
 * @see ../intelligence.ts domain-activation audit consumer
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { DomainActivation } from './types.js'

export const UPG_DOMAIN_ACTIVATION: DomainActivation[] = [
  {
    "domain_id": "strategy",
    "expected_from": "concept",
    "expected_mature": "growth",
    "source": {"kind":"fundamental"},
    "rationale": "Product identity is step zero."
  },
  {
    "domain_id": "user",
    "expected_from": "concept",
    "expected_mature": "build",
    "source": {"kind":"book","citation":"JTBD (Christensen)"},
    "rationale": "Understanding users is foundational. Cannot be deferred."
  },
  {
    "domain_id": "discovery",
    "expected_from": "concept",
    "expected_mature": "build",
    "source": {"kind":"book","citation":"Continuous Discovery Habits (Torres)"},
    "rationale": "Opportunities should be identified before building."
  },
  {
    "domain_id": "validation",
    "expected_from": "concept",
    "expected_mature": "build",
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Test assumptions before investing in features."
  },
  {
    "domain_id": "product_spec",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"industry_practice","category":"agile"},
    "rationale": "Feature specs emerge when building starts."
  },
  {
    "domain_id": "market_intelligence",
    "expected_from": "concept",
    "expected_mature": "growth",
    "source": {"kind":"industry_practice","category":"competitive_strategy"},
    "rationale": "Know your landscape early. Deepen as you grow."
  },
  {
    "domain_id": "business_model",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"book","citation":"Business Model Generation (Osterwalder)"},
    "rationale": "Revenue model must be clear before scaling."
  },
  {
    "domain_id": "growth",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"book","citation":"Lean Analytics (Croll)"},
    "rationale": "Growth metrics and funnels enable scaling decisions."
  },
  {
    "domain_id": "go_to_market",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"industry_practice","category":"gtm"},
    "rationale": "How you reach customers. Must be systematic by growth."
  },
  {
    "domain_id": "user_research",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"book","citation":"The Mom Test (Fitzpatrick)"},
    "rationale": "Continuous research keeps you honest."
  },
  {
    "domain_id": "ux_design",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"book","citation":"Atomic Design (Frost)"},
    "rationale": "Design system and IA emerge as product matures."
  },
  {
    "domain_id": "engineering",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"book","citation":"Domain-Driven Design (Evans)"},
    "rationale": "Architecture becomes explicit as complexity grows."
  },
  {
    "domain_id": "pricing",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"industry_practice","category":"pricing"},
    "rationale": "Deliberate pricing by growth stage."
  },
  {
    "domain_id": "content",
    "expected_from": "growth",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"content_marketing"},
    "rationale": "Systematic content after product-market fit."
  },
  {
    "domain_id": "feedback",
    "expected_from": "build",
    "expected_mature": "growth",
    "source": {"kind":"industry_practice","category":"voice_of_customer"},
    "rationale": "Listen to users once you have them."
  },
  {
    "domain_id": "team_org",
    "expected_from": "growth",
    "expected_mature": "mature",
    "source": {"kind":"book","citation":"Team Topologies (Skelton & Pais)"},
    "rationale": "Org structure matters when the team grows."
  },
  {
    "domain_id": "data_analytics",
    "expected_from": "growth",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"data_driven"},
    "rationale": "Data infrastructure for decision-making at scale."
  },
  {
    "domain_id": "compliance",
    "expected_from": "growth",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"regulatory"},
    "rationale": "Compliance becomes critical as you scale and attract scrutiny."
  },
  {
    "domain_id": "devops",
    "expected_from": "growth",
    "expected_mature": "mature",
    "source": {"kind":"book","citation":"Site Reliability Engineering (Google)"},
    "rationale": "Reliability engineering for production systems."
  },
  {
    "domain_id": "security",
    "expected_from": "growth",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"security"},
    "rationale": "Security posture must formalize as the product handles real user data."
  },
  {
    "domain_id": "testing",
    "expected_from": "build",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"quality_assurance"},
    "rationale": "Testing discipline scales with the codebase."
  },
  {
    "domain_id": "accessibility",
    "expected_from": "growth",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"accessibility"},
    "rationale": "Accessibility should be considered early but formalized at growth."
  },
  {
    "domain_id": "ai",
    "expected_from": "build",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"ai_ops"},
    "rationale": "Only if the product uses AI. Track models, costs, and quality."
  },
  {
    "domain_id": "automation",
    "expected_from": "growth",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"automation"},
    "rationale": "Workflow automation at scale."
  },
  {
    "domain_id": "portfolio",
    "expected_from": "mature",
    "expected_mature": "mature",
    "source": {"kind":"industry_practice","category":"portfolio_management"},
    "rationale": "Multi-product management. Only relevant at scale."
  }
]
