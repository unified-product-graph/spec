/**
 * Per-entity-type expected counts across the canonical 9-stage product journey.
 *
 * Each row binds an entity type (+ its domain) to a `StageRange` for every
 * stage from `concept` → `sunset`. A `null` range marks "not expected at this
 * stage". Ranges are sourced from product-management literature (JTBD, OST,
 * Lean Startup, BMC, etc.); the `source` column on the interface attributes
 * each row.
 *
 * Consumers:
 * - Intelligence layer (`intelligence.ts`) → health scoring, gap detection
 * - Graph audits → flag entities missing at a given stage
 *
 * Benchmark shape: see `CountBenchmark` in `./types.ts`.
 *
 * @see ./types.ts `CountBenchmark`, `StageRange`, `UPG_PRODUCT_STAGES`
 * @see ../intelligence.ts health scoring consumer
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { CountBenchmark } from './types.js'

export const UPG_COUNT_BENCHMARKS: CountBenchmark[] = [
  {
    "type": "product",
    "domain": "strategy",
    "concept": {
      "min": 1,
      "max": 1
    },
    "validation": {
      "min": 1,
      "max": 1
    },
    "build": {
      "min": 1,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 1
    },
    "launch": {
      "min": 1,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 1
    },
    "mature": {
      "min": 1,
      "max": 3
    },
    "maintenance": {
      "min": 1,
      "max": 3
    },
    "sunset": {
      "min": 1,
      "max": 1
    },
    "source": {"kind":"fundamental"},
    "rationale": "Every graph needs exactly one product (or one per product area at scale)."
  },
  {
    "type": "outcome",
    "domain": "strategy",
    "concept": {
      "min": 1,
      "max": 3
    },
    "validation": {
      "min": 2,
      "max": 4
    },
    "build": {
      "min": 2,
      "max": 5
    },
    "beta": {
      "min": 3,
      "max": 7
    },
    "launch": {
      "min": 2,
      "max": 5
    },
    "growth": {
      "min": 3,
      "max": 8
    },
    "mature": {
      "min": 5,
      "max": 15
    },
    "maintenance": {
      "min": 5,
      "max": 15
    },
    "sunset": {
      "min": 1,
      "max": 1
    },
    "source": {"kind":"book","citation":"Measure What Matters (Doerr)"},
    "rationale": "Outcomes are the \"why\" behind everything. Too few = unclear direction. Too many = diluted focus."
  },
  {
    "type": "objective",
    "domain": "strategy",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 2
    },
    "build": {
      "min": 1,
      "max": 3
    },
    "beta": {
      "min": 2,
      "max": 4
    },
    "launch": {
      "min": 1,
      "max": 3
    },
    "growth": {
      "min": 2,
      "max": 5
    },
    "mature": {
      "min": 3,
      "max": 10
    },
    "maintenance": {
      "min": 3,
      "max": 10
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Measure What Matters (Doerr)"},
    "rationale": "Objectives give teams direction. Not needed at idea stage; outcomes suffice."
  },
  {
    "type": "key_result",
    "domain": "strategy",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 4
    },
    "build": {
      "min": 2,
      "max": 6
    },
    "beta": {
      "min": 3,
      "max": 11
    },
    "launch": {
      "min": 2,
      "max": 6
    },
    "growth": {
      "min": 4,
      "max": 15
    },
    "mature": {
      "min": 8,
      "max": 30
    },
    "maintenance": {
      "min": 8,
      "max": 30
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Measure What Matters (Doerr)"},
    "rationale": "2-4 key results per objective is the sweet spot."
  },
  {
    "type": "metric",
    "domain": "strategy",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 3
    },
    "build": {
      "min": 2,
      "max": 5
    },
    "beta": {
      "min": 4,
      "max": 10
    },
    "launch": {
      "min": 2,
      "max": 5
    },
    "growth": {
      "min": 5,
      "max": 15
    },
    "mature": {
      "min": 10,
      "max": 30
    },
    "maintenance": {
      "min": 10,
      "max": 30
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Lean Analytics (Croll)"},
    "rationale": "Track what matters. At MVP, focus on 1 metric that matters (OMTM)."
  },
  {
    "type": "vision",
    "domain": "strategy",
    "concept": {
      "min": 1,
      "max": 1
    },
    "validation": {
      "min": 1,
      "max": 1
    },
    "build": {
      "min": 1,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 1
    },
    "launch": {
      "min": 1,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 1
    },
    "mature": {
      "min": 1,
      "max": 1
    },
    "maintenance": {
      "min": 1,
      "max": 1
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Inspired (Cagan)"},
    "rationale": "One vision. Clear and unchanging (the mission may evolve, the vision stays)."
  },
  {
    "type": "mission",
    "domain": "strategy",
    "concept": {
      "min": 0,
      "max": 1
    },
    "validation": {
      "min": 1,
      "max": 1
    },
    "build": {
      "min": 1,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 1
    },
    "launch": {
      "min": 1,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 1
    },
    "mature": {
      "min": 1,
      "max": 1
    },
    "maintenance": {
      "min": 1,
      "max": 1
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Inspired (Cagan)"},
    "rationale": "Mission articulates how you pursue the vision."
  },
  {
    "type": "strategic_theme",
    "domain": "strategy",
    "concept": null,
    "validation": null,
    "build": null,
    "beta": {
      "min": 1,
      "max": 3
    },
    "launch": null,
    "growth": {
      "min": 2,
      "max": 5
    },
    "mature": {
      "min": 3,
      "max": 8
    },
    "maintenance": {
      "min": 3,
      "max": 8
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"cascading_strategy"},
    "rationale": "Themes organize initiatives. Premature before growth stage."
  },
  {
    "type": "initiative",
    "domain": "strategy",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 2
    },
    "build": {
      "min": 1,
      "max": 3
    },
    "beta": {
      "min": 2,
      "max": 7
    },
    "launch": {
      "min": 1,
      "max": 3
    },
    "growth": {
      "min": 3,
      "max": 10
    },
    "mature": {
      "min": 5,
      "max": 20
    },
    "maintenance": {
      "min": 5,
      "max": 20
    },
    "sunset": null,
    "source": {"kind":"practitioner","attribution":"Teresa Torres"},
    "rationale": "Initiatives are the big bets. 1-3 at MVP keeps focus."
  },
  {
    "type": "assumption",
    "domain": "strategy",
    "concept": {
      "min": 3,
      "max": 10
    },
    "validation": {
      "min": 4,
      "max": 13
    },
    "build": {
      "min": 5,
      "max": 15
    },
    "beta": {
      "min": 4,
      "max": 13
    },
    "launch": {
      "min": 5,
      "max": 15
    },
    "growth": {
      "min": 3,
      "max": 10
    },
    "mature": {
      "min": 2,
      "max": 5
    },
    "maintenance": {
      "min": 2,
      "max": 5
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Early stage should have MORE assumptions; they decrease as you validate."
  },
  {
    "type": "decision",
    "domain": "strategy",
    "concept": {
      "min": 0,
      "max": 3
    },
    "validation": {
      "min": 1,
      "max": 7
    },
    "build": {
      "min": 2,
      "max": 10
    },
    "beta": {
      "min": 4,
      "max": 15
    },
    "launch": {
      "min": 2,
      "max": 10
    },
    "growth": {
      "min": 5,
      "max": 20
    },
    "mature": {
      "min": 10,
      "max": 50
    },
    "maintenance": {
      "min": 10,
      "max": 50
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"architecture_decisions"},
    "rationale": "Decisions accumulate. Recording them creates institutional memory."
  },
  {
    "type": "persona",
    "domain": "user",
    "concept": {
      "min": 1,
      "max": 3
    },
    "validation": {
      "min": 2,
      "max": 4
    },
    "build": {
      "min": 2,
      "max": 4
    },
    "beta": {
      "min": 3,
      "max": 5
    },
    "launch": {
      "min": 2,
      "max": 4
    },
    "growth": {
      "min": 3,
      "max": 6
    },
    "mature": {
      "min": 4,
      "max": 10
    },
    "maintenance": {
      "min": 4,
      "max": 10
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Crossing the Chasm (Moore)"},
    "rationale": "Start narrow (1 beachhead persona). Expand as you find fit."
  },
  {
    "type": "job",
    "domain": "user",
    "concept": {
      "min": 2,
      "max": 6
    },
    "validation": {
      "min": 3,
      "max": 9
    },
    "build": {
      "min": 4,
      "max": 12
    },
    "beta": {
      "min": 6,
      "max": 19
    },
    "launch": {
      "min": 4,
      "max": 12
    },
    "growth": {
      "min": 8,
      "max": 25
    },
    "mature": {
      "min": 15,
      "max": 50
    },
    "maintenance": {
      "min": 15,
      "max": 50
    },
    "sunset": null,
    "source": {"kind":"book","citation":"JTBD (Christensen)"},
    "rationale": "2-4 JTBDs per persona. Jobs are the demand side; they drive everything."
  },
  {
    "type": "need",
    "domain": "user",
    "concept": {
      "min": 2,
      "max": 8
    },
    "validation": {
      "min": 3,
      "max": 12
    },
    "build": {
      "min": 4,
      "max": 15
    },
    "beta": {
      "min": 6,
      "max": 20
    },
    "launch": {
      "min": 4,
      "max": 15
    },
    "growth": {
      "min": 8,
      "max": 25
    },
    "mature": {
      "min": 10,
      "max": 40
    },
    "maintenance": {
      "min": 10,
      "max": 40
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"design_thinking"},
    "rationale": "Needs have valence (pain, gap, desire, constraint). Surfaces opportunities: more needs = more signal."
  },
  {
    "type": "desired_outcome",
    "domain": "user",
    "concept": {
      "min": 1,
      "max": 4
    },
    "validation": {
      "min": 2,
      "max": 6
    },
    "build": {
      "min": 2,
      "max": 8
    },
    "beta": {
      "min": 3,
      "max": 12
    },
    "launch": {
      "min": 2,
      "max": 8
    },
    "growth": {
      "min": 4,
      "max": 15
    },
    "mature": {
      "min": 6,
      "max": 25
    },
    "maintenance": {
      "min": 6,
      "max": 25
    },
    "sunset": null,
    "source": {"kind":"book","citation":"ODI (Ulwick)"},
    "rationale": "Desired outcomes are what users measure success by."
  },
  {
    "type": "opportunity",
    "domain": "discovery",
    "concept": {
      "min": 1,
      "max": 5
    },
    "validation": {
      "min": 2,
      "max": 8
    },
    "build": {
      "min": 3,
      "max": 10
    },
    "beta": {
      "min": 4,
      "max": 15
    },
    "launch": {
      "min": 3,
      "max": 10
    },
    "growth": {
      "min": 5,
      "max": 20
    },
    "mature": {
      "min": 8,
      "max": 30
    },
    "maintenance": {
      "min": 8,
      "max": 30
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Continuous Discovery Habits (Torres)"},
    "rationale": "Opportunities are the bridge between user needs and solutions. Core of continuous discovery."
  },
  {
    "type": "solution",
    "domain": "discovery",
    "concept": {
      "min": 1,
      "max": 3
    },
    "validation": {
      "min": 2,
      "max": 6
    },
    "build": {
      "min": 2,
      "max": 8
    },
    "beta": {
      "min": 4,
      "max": 12
    },
    "launch": {
      "min": 2,
      "max": 8
    },
    "growth": {
      "min": 5,
      "max": 15
    },
    "mature": {
      "min": 8,
      "max": 25
    },
    "maintenance": {
      "min": 8,
      "max": 25
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Continuous Discovery Habits (Torres)"},
    "rationale": "Multiple solutions per opportunity. Explore before committing."
  },
  {
    "type": "hypothesis",
    "domain": "validation",
    "concept": {
      "min": 2,
      "max": 8
    },
    "validation": {
      "min": 3,
      "max": 12
    },
    "build": {
      "min": 4,
      "max": 15
    },
    "beta": {
      "min": 6,
      "max": 20
    },
    "launch": {
      "min": 4,
      "max": 15
    },
    "growth": {
      "min": 8,
      "max": 25
    },
    "mature": {
      "min": 5,
      "max": 15
    },
    "maintenance": {
      "min": 5,
      "max": 15
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Everything is a hypothesis until tested. More at early stages, fewer (but bigger) at scale."
  },
  {
    "type": "experiment_run",
    "domain": "validation",
    "concept": {
      "min": 1,
      "max": 5
    },
    "validation": {
      "min": 2,
      "max": 8
    },
    "build": {
      "min": 3,
      "max": 10
    },
    "beta": {
      "min": 4,
      "max": 13
    },
    "launch": {
      "min": 3,
      "max": 10
    },
    "growth": {
      "min": 5,
      "max": 15
    },
    "mature": {
      "min": 3,
      "max": 10
    },
    "maintenance": {
      "min": 3,
      "max": 10
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Each hypothesis needs an experiment. Speed of learning = speed of progress."
  },
  {
    "type": "learning",
    "domain": "validation",
    "concept": {
      "min": 1,
      "max": 5
    },
    "validation": {
      "min": 2,
      "max": 8
    },
    "build": {
      "min": 3,
      "max": 10
    },
    "beta": {
      "min": 6,
      "max": 15
    },
    "launch": {
      "min": 3,
      "max": 10
    },
    "growth": {
      "min": 8,
      "max": 20
    },
    "mature": {
      "min": 10,
      "max": 30
    },
    "maintenance": {
      "min": 10,
      "max": 30
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Learnings are the output of experiments. They should accumulate over time."
  },
  {
    "type": "competitor",
    "domain": "market_intelligence",
    "concept": {
      "min": 2,
      "max": 5
    },
    "validation": {
      "min": 3,
      "max": 7
    },
    "build": {
      "min": 3,
      "max": 8
    },
    "beta": {
      "min": 4,
      "max": 10
    },
    "launch": {
      "min": 3,
      "max": 8
    },
    "growth": {
      "min": 5,
      "max": 12
    },
    "mature": {
      "min": 5,
      "max": 15
    },
    "maintenance": {
      "min": 5,
      "max": 15
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"competitive_analysis"},
    "rationale": "Know your landscape. 2-5 direct competitors minimum."
  },
  {
    "type": "research_study",
    "domain": "user_research",
    "concept": {
      "min": 0,
      "max": 2
    },
    "validation": {
      "min": 1,
      "max": 4
    },
    "build": {
      "min": 1,
      "max": 5
    },
    "beta": {
      "min": 2,
      "max": 8
    },
    "launch": {
      "min": 1,
      "max": 5
    },
    "growth": {
      "min": 3,
      "max": 10
    },
    "mature": {
      "min": 5,
      "max": 20
    },
    "maintenance": {
      "min": 5,
      "max": 20
    },
    "sunset": null,
    "source": {"kind":"book","citation":"The Mom Test (Fitzpatrick)"},
    "rationale": "Talk to users. Even 5 interviews surface 80% of issues."
  },
  {
    "type": "insight",
    "domain": "user_research",
    "concept": {
      "min": 0,
      "max": 5
    },
    "validation": {
      "min": 2,
      "max": 10
    },
    "build": {
      "min": 3,
      "max": 15
    },
    "beta": {
      "min": 7,
      "max": 23
    },
    "launch": {
      "min": 3,
      "max": 15
    },
    "growth": {
      "min": 10,
      "max": 30
    },
    "mature": {
      "min": 15,
      "max": 50
    },
    "maintenance": {
      "min": 15,
      "max": 50
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"ux_research"},
    "rationale": "Insights are the refined output of research. They inform everything."
  },
  {
    "type": "user_journey",
    "domain": "ux_design",
    "concept": {
      "min": 0,
      "max": 1
    },
    "validation": {
      "min": 1,
      "max": 2
    },
    "build": {
      "min": 1,
      "max": 3
    },
    "beta": {
      "min": 2,
      "max": 4
    },
    "launch": {
      "min": 1,
      "max": 3
    },
    "growth": {
      "min": 2,
      "max": 5
    },
    "mature": {
      "min": 3,
      "max": 10
    },
    "maintenance": {
      "min": 3,
      "max": 10
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"service_design"},
    "rationale": "Map the emotional experience. One per persona is ideal."
  },
  {
    "type": "user_flow",
    "domain": "ux_design",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 3
    },
    "build": {
      "min": 1,
      "max": 5
    },
    "beta": {
      "min": 2,
      "max": 10
    },
    "launch": {
      "min": 1,
      "max": 5
    },
    "growth": {
      "min": 3,
      "max": 15
    },
    "mature": {
      "min": 10,
      "max": 40
    },
    "maintenance": {
      "min": 10,
      "max": 40
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"information_architecture"},
    "rationale": "Task-level paths through the product. Critical for UX quality."
  },
  {
    "type": "screen",
    "domain": "ux_design",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 10
    },
    "build": {
      "min": 3,
      "max": 15
    },
    "beta": {
      "min": 7,
      "max": 33
    },
    "launch": {
      "min": 3,
      "max": 15
    },
    "growth": {
      "min": 10,
      "max": 50
    },
    "mature": {
      "min": 30,
      "max": 200
    },
    "maintenance": {
      "min": 30,
      "max": 200
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"information_architecture"},
    "rationale": "Every distinct UI surface. Grows with product complexity."
  },
  {
    "type": "design_component",
    "domain": "ux_design",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 7
    },
    "build": {
      "min": 0,
      "max": 10
    },
    "beta": {
      "min": 5,
      "max": 30
    },
    "launch": {
      "min": 0,
      "max": 10
    },
    "growth": {
      "min": 10,
      "max": 50
    },
    "mature": {
      "min": 30,
      "max": 200
    },
    "maintenance": {
      "min": 30,
      "max": 200
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Atomic Design (Frost)"},
    "rationale": "Design system components. Build a system, not one-offs."
  },
  {
    "type": "feature",
    "domain": "product_spec",
    "concept": {
      "min": 1,
      "max": 5
    },
    "validation": {
      "min": 2,
      "max": 8
    },
    "build": {
      "min": 3,
      "max": 10
    },
    "beta": {
      "min": 6,
      "max": 20
    },
    "launch": {
      "min": 3,
      "max": 10
    },
    "growth": {
      "min": 8,
      "max": 30
    },
    "mature": {
      "min": 20,
      "max": 100
    },
    "maintenance": {
      "min": 20,
      "max": 100
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"product_management"},
    "rationale": "Features are the user-facing capabilities. MVP = minimum set."
  },
  {
    "type": "epic",
    "domain": "product_spec",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 3
    },
    "build": {
      "min": 1,
      "max": 5
    },
    "beta": {
      "min": 2,
      "max": 10
    },
    "launch": {
      "min": 1,
      "max": 5
    },
    "growth": {
      "min": 3,
      "max": 15
    },
    "mature": {
      "min": 10,
      "max": 40
    },
    "maintenance": {
      "min": 10,
      "max": 40
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"agile"},
    "rationale": "Epics group related stories. Not needed at idea stage."
  },
  {
    "type": "user_story",
    "domain": "product_spec",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 10
    },
    "build": {
      "min": 3,
      "max": 15
    },
    "beta": {
      "min": 7,
      "max": 33
    },
    "launch": {
      "min": 3,
      "max": 15
    },
    "growth": {
      "min": 10,
      "max": 50
    },
    "mature": {
      "min": 30,
      "max": 200
    },
    "maintenance": {
      "min": 30,
      "max": 200
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"agile"},
    "rationale": "Stories are the unit of delivery. 3-5 per feature is typical."
  },
  {
    "type": "release",
    "domain": "product_spec",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 1
    },
    "build": {
      "min": 1,
      "max": 2
    },
    "beta": {
      "min": 2,
      "max": 6
    },
    "launch": {
      "min": 1,
      "max": 2
    },
    "growth": {
      "min": 2,
      "max": 10
    },
    "mature": {
      "min": 5,
      "max": 25
    },
    "maintenance": {
      "min": 5,
      "max": 25
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"release_management"},
    "rationale": "Ship frequently. Releases track what went out and when."
  },
  {
    "type": "bounded_context",
    "domain": "engineering",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 2
    },
    "build": {
      "min": 1,
      "max": 3
    },
    "beta": {
      "min": 2,
      "max": 5
    },
    "launch": {
      "min": 1,
      "max": 3
    },
    "growth": {
      "min": 2,
      "max": 6
    },
    "mature": {
      "min": 4,
      "max": 15
    },
    "maintenance": {
      "min": 4,
      "max": 15
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Domain-Driven Design (Evans)"},
    "rationale": "Bounded contexts define system boundaries. Start simple."
  },
  {
    "type": "service",
    "domain": "engineering",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 2
    },
    "build": {
      "min": 1,
      "max": 3
    },
    "beta": {
      "min": 2,
      "max": 6
    },
    "launch": {
      "min": 1,
      "max": 3
    },
    "growth": {
      "min": 2,
      "max": 8
    },
    "mature": {
      "min": 5,
      "max": 25
    },
    "maintenance": {
      "min": 5,
      "max": 25
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"microservices"},
    "rationale": "Services are runtime components. Monolith first, split later."
  },
  {
    "type": "decision",
    "domain": "engineering",
    "concept": {
      "min": 0,
      "max": 2
    },
    "validation": {
      "min": 1,
      "max": 5
    },
    "build": {
      "min": 2,
      "max": 8
    },
    "beta": {
      "min": 4,
      "max": 14
    },
    "launch": {
      "min": 2,
      "max": 8
    },
    "growth": {
      "min": 5,
      "max": 20
    },
    "mature": {
      "min": 10,
      "max": 50
    },
    "maintenance": {
      "min": 10,
      "max": 50
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Release It (Nygard)"},
    "rationale": "Document why you chose X over Y. Prevents relitigating decisions."
  },
  {
    "type": "technical_debt_item",
    "domain": "engineering",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 3
    },
    "build": {
      "min": 0,
      "max": 5
    },
    "beta": {
      "min": 2,
      "max": 10
    },
    "launch": {
      "min": 0,
      "max": 5
    },
    "growth": {
      "min": 3,
      "max": 15
    },
    "mature": {
      "min": 5,
      "max": 30
    },
    "maintenance": {
      "min": 5,
      "max": 30
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"engineering"},
    "rationale": "Track debt explicitly. It compounds if invisible."
  },
  {
    "type": "metric",
    "domain": "growth",
    "concept": null,
    "validation": null,
    "build": {
      "min": 1,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 1
    },
    "launch": {
      "min": 1,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 1
    },
    "mature": {
      "min": 1,
      "max": 2
    },
    "maintenance": {
      "min": 1,
      "max": 2
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Lean Analytics (Croll)"},
    "rationale": "One metric that matters. Maybe two at scale (leading + lagging)."
  },
  {
    "type": "funnel",
    "domain": "growth",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 1
    },
    "build": {
      "min": 1,
      "max": 2
    },
    "beta": {
      "min": 1,
      "max": 3
    },
    "launch": {
      "min": 1,
      "max": 2
    },
    "growth": {
      "min": 1,
      "max": 3
    },
    "mature": {
      "min": 2,
      "max": 5
    },
    "maintenance": {
      "min": 2,
      "max": 5
    },
    "sunset": null,
    "source": {"kind":"practitioner","attribution":"Dave McClure (AARRR)"},
    "rationale": "At least one acquisition funnel. Add retention/referral funnels at growth."
  },
  {
    "type": "acquisition_channel",
    "domain": "growth",
    "concept": {
      "min": 1,
      "max": 3
    },
    "validation": {
      "min": 1,
      "max": 4
    },
    "build": {
      "min": 1,
      "max": 5
    },
    "beta": {
      "min": 2,
      "max": 7
    },
    "launch": {
      "min": 1,
      "max": 5
    },
    "growth": {
      "min": 3,
      "max": 8
    },
    "mature": {
      "min": 5,
      "max": 15
    },
    "maintenance": {
      "min": 5,
      "max": 15
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Traction (Weinberg)"},
    "rationale": "Start with 1-2 channels, expand as you find what works."
  },
  {
    "type": "business_model",
    "domain": "business_model",
    "concept": {
      "min": 0,
      "max": 1
    },
    "validation": {
      "min": 1,
      "max": 1
    },
    "build": {
      "min": 1,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 2
    },
    "launch": {
      "min": 1,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 2
    },
    "mature": {
      "min": 1,
      "max": 3
    },
    "maintenance": {
      "min": 1,
      "max": 3
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Business Model Generation (Osterwalder)"},
    "rationale": "One business model per product. Maybe 2 at scale (freemium + enterprise)."
  },
  {
    "type": "value_proposition",
    "domain": "business_model",
    "concept": {
      "min": 1,
      "max": 2
    },
    "validation": {
      "min": 1,
      "max": 3
    },
    "build": {
      "min": 1,
      "max": 3
    },
    "beta": {
      "min": 2,
      "max": 4
    },
    "launch": {
      "min": 1,
      "max": 3
    },
    "growth": {
      "min": 2,
      "max": 5
    },
    "mature": {
      "min": 3,
      "max": 8
    },
    "maintenance": {
      "min": 3,
      "max": 8
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Business Model Generation (Osterwalder)"},
    "rationale": "What unique value do you deliver? One per segment."
  },
  {
    "type": "revenue_stream",
    "domain": "business_model",
    "concept": {
      "min": 0,
      "max": 1
    },
    "validation": {
      "min": 1,
      "max": 2
    },
    "build": {
      "min": 1,
      "max": 2
    },
    "beta": {
      "min": 1,
      "max": 3
    },
    "launch": {
      "min": 1,
      "max": 2
    },
    "growth": {
      "min": 1,
      "max": 3
    },
    "mature": {
      "min": 2,
      "max": 5
    },
    "maintenance": {
      "min": 2,
      "max": 5
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Business Model Generation (Osterwalder)"},
    "rationale": "How money comes in. At least one by MVP."
  },
  {
    "type": "pricing_strategy",
    "domain": "pricing",
    "concept": null,
    "validation": null,
    "build": {
      "min": 0,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 1
    },
    "launch": {
      "min": 0,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 1
    },
    "mature": {
      "min": 1,
      "max": 2
    },
    "maintenance": {
      "min": 1,
      "max": 2
    },
    "sunset": null,
    "source": {"kind":"book","citation":"The Strategy and Tactics of Pricing (Nagle)"},
    "rationale": "Deliberate pricing. By growth stage this must be explicit."
  },
  {
    "type": "positioning",
    "domain": "go_to_market",
    "concept": {
      "min": 0,
      "max": 1
    },
    "validation": {
      "min": 1,
      "max": 1
    },
    "build": {
      "min": 1,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 2
    },
    "launch": {
      "min": 1,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 2
    },
    "mature": {
      "min": 1,
      "max": 3
    },
    "maintenance": {
      "min": 1,
      "max": 3
    },
    "sunset": null,
    "source": {"kind":"book","citation":"Obviously Awesome (Dunford)"},
    "rationale": "How are you different? One positioning statement minimum."
  },
  {
    "type": "ideal_customer_profile",
    "domain": "go_to_market",
    "concept": null,
    "validation": null,
    "build": {
      "min": 0,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 2
    },
    "launch": {
      "min": 0,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 2
    },
    "mature": {
      "min": 1,
      "max": 3
    },
    "maintenance": {
      "min": 1,
      "max": 3
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"gtm"},
    "rationale": "Who are you selling to? Tighter ICP = better conversion."
  },
  {
    "type": "messaging",
    "domain": "go_to_market",
    "concept": null,
    "validation": null,
    "build": {
      "min": 0,
      "max": 1
    },
    "beta": {
      "min": 1,
      "max": 2
    },
    "launch": {
      "min": 0,
      "max": 1
    },
    "growth": {
      "min": 1,
      "max": 3
    },
    "mature": {
      "min": 2,
      "max": 5
    },
    "maintenance": {
      "min": 2,
      "max": 5
    },
    "sunset": null,
    "source": {"kind":"book","citation":"StoryBrand (Miller)"},
    "rationale": "How you talk about your product. Persona-specific messaging at scale."
  },
  {
    "type": "content_strategy",
    "domain": "content",
    "concept": null,
    "validation": null,
    "build": null,
    "beta": null,
    "launch": null,
    "growth": {
      "min": 1,
      "max": 1
    },
    "mature": {
      "min": 1,
      "max": 2
    },
    "maintenance": {
      "min": 1,
      "max": 2
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"content_marketing"},
    "rationale": "Systematic content by growth stage. Premature before product-market fit."
  },
  {
    "type": "feature_request",
    "domain": "feedback",
    "concept": null,
    "validation": {
      "min": 1,
      "max": 7
    },
    "build": {
      "min": 0,
      "max": 10
    },
    "beta": {
      "min": 3,
      "max": 20
    },
    "launch": {
      "min": 0,
      "max": 10
    },
    "growth": {
      "min": 5,
      "max": 30
    },
    "mature": {
      "min": 10,
      "max": 100
    },
    "maintenance": {
      "min": 10,
      "max": 100
    },
    "sunset": null,
    "source": {"kind":"industry_practice","category":"voice_of_customer"},
    "rationale": "Feature requests signal demand. Track them to spot patterns."
  }
]
