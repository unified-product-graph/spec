export * from './types.js'
import type { TemplateSet, SeedNode, StarterKey } from './types.js'

// Import all template sets
import { saasTemplates } from './templates/saas.js'
import { marketplaceTemplates } from './templates/marketplace.js'
import { mobileTemplates } from './templates/mobile.js'
import { ossTemplates } from './templates/oss.js'
import { agencyTemplates } from './templates/agency.js'

export const ALL_TEMPLATES: TemplateSet[] = [
  ...saasTemplates,
  ...marketplaceTemplates,
  ...mobileTemplates,
  ...ossTemplates,
  ...agencyTemplates,
]

export function getTemplatesForIndustry(industry: string): TemplateSet[] {
  return ALL_TEMPLATES.filter(t => t.industries.includes(industry))
}

export function getTemplatesForStage(stage: string): TemplateSet[] {
  return ALL_TEMPLATES.filter(t => (t.stages as readonly string[]).includes(stage))
}

export { saasTemplates, marketplaceTemplates, mobileTemplates, ossTemplates, agencyTemplates }

/**
 * Starter seeds for `upg init --template <key>`. Minimal, placeholder-free
 * graphs that instantiate non-interactively. This is the single source of truth
 * for the CLI quickstart roster — `upg init` consumes these instead of defining
 * its own. The richer, prompt-driven sets above (ALL_TEMPLATES) are the library
 * surfaced on the site and applied interactively.
 *
 * Every `type` here is asserted valid by the conformance gate.
 */
export const STARTER_SEEDS: Record<StarterKey, SeedNode[]> = {
  blank: [],
  saas: [
    { type: 'persona', title: 'Primary User', description: 'The main user of your product' },
    { type: 'job', title: 'Core Job to Be Done' },
    { type: 'opportunity', title: 'Key Opportunity' },
  ],
  marketplace: [
    { type: 'persona', title: 'Supply Side (Provider)' },
    { type: 'persona', title: 'Demand Side (Consumer)' },
    { type: 'opportunity', title: 'Platform Value Creation' },
  ],
  mobile: [
    { type: 'persona', title: 'Mobile User' },
    { type: 'job', title: 'Primary Mobile Job' },
    { type: 'feature', title: 'Core Feature' },
  ],
  oss: [
    { type: 'persona', title: 'Contributor' },
    { type: 'persona', title: 'End User' },
    { type: 'feature', title: 'Core Feature' },
  ],
  agency: [
    { type: 'persona', title: 'Client' },
    { type: 'job', title: 'Core Client Engagement' },
    { type: 'revenue_stream', title: 'Project-Based Revenue' },
  ],
}
