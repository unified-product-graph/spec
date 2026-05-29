/**
 * Expected parent → child relationship benchmarks (minimum connections that a
 * parent type should have to a given child type at the listed stages).
 *
 * Encodes wisdom like "each persona should have at least 2 jobs" (JTBD) or
 * "each hypothesis should produce at least one learning" (Lean Startup).
 * Relationship benchmarks are stage-scoped: a persona doesn't need 2 jobs
 * at `concept`, but does by `build`.
 *
 * Consumers:
 * - Intelligence layer → "thin parent" gap detection (e.g. personas missing
 *   jobs); flags shallow modelling during audits
 *
 * Benchmark shape: see `RelationshipBenchmark` in `./types.ts`.
 *
 * @see ./types.ts `RelationshipBenchmark`
 * @see ../intelligence.ts audit consumer
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { RelationshipBenchmark } from './types.js'

export const UPG_RELATIONSHIP_BENCHMARKS: RelationshipBenchmark[] = [
  {
    "parent_type": "persona",
    "child_type": "job",
    "min_per_parent": 2,
    "stages": [
      "concept",
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"JTBD (Christensen)"},
    "rationale": "Each persona should have at least 2 jobs. One job = shallow understanding."
  },
  {
    "parent_type": "persona",
    "child_type": "need",
    "min_per_parent": 1,
    "stages": [
      "concept",
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"design_thinking"},
    "rationale": "No pain = no urgency to switch. Every persona needs at least one pain point."
  },
  {
    "parent_type": "persona",
    "child_type": "desired_outcome",
    "min_per_parent": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"ODI (Ulwick)"},
    "rationale": "What does success look like for this persona?"
  },
  {
    "parent_type": "job",
    "child_type": "need",
    "min_per_parent": 1,
    "stages": [
      "concept",
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"jtbd"},
    "rationale": "Every job has friction. Surface it."
  },
  {
    "parent_type": "opportunity",
    "child_type": "solution",
    "min_per_parent": 1,
    "stages": [
      "concept",
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Continuous Discovery Habits (Torres)"},
    "rationale": "Every opportunity needs at least one solution explored."
  },
  {
    "parent_type": "need",
    "child_type": "opportunity",
    "min_per_parent": 0,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Continuous Discovery Habits (Torres)"},
    "rationale": "Pain should surface opportunities. 0 is the minimum, but flag if many pains have no opportunities."
  },
  {
    "parent_type": "solution",
    "child_type": "hypothesis",
    "min_per_parent": 1,
    "stages": [
      "concept",
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Every solution is a bet. Make the bet explicit."
  },
  {
    "parent_type": "hypothesis",
    "child_type": "experiment_run",
    "min_per_parent": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Test your bets. No experiment = no learning."
  },
  {
    "parent_type": "feature",
    "child_type": "story_task",
    "min_per_parent": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"agile"},
    "rationale": "Features should be broken into stories for delivery."
  },
  {
    "parent_type": "feature",
    "child_type": "epic",
    "min_per_parent": 0,
    "stages": [
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"agile"},
    "rationale": "Large features become epics at scale."
  },
  {
    "parent_type": "bounded_context",
    "child_type": "service",
    "min_per_parent": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Domain-Driven Design (Evans)"},
    "rationale": "Each bounded context should have at least one service."
  },
  {
    "parent_type": "funnel",
    "child_type": "funnel_step",
    "min_per_parent": 3,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"practitioner","attribution":"Dave McClure (AARRR)"},
    "rationale": "A funnel needs at least 3 steps to be meaningful."
  },
  {
    "parent_type": "business_model",
    "child_type": "value_proposition",
    "min_per_parent": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Business Model Generation (Osterwalder)"},
    "rationale": "No value prop = no business model."
  },
  {
    "parent_type": "business_model",
    "child_type": "revenue_stream",
    "min_per_parent": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Business Model Generation (Osterwalder)"},
    "rationale": "How does money come in? Must be explicit."
  },
  {
    "parent_type": "feature",
    "child_type": "persona",
    "min_per_parent": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Inspired (Cagan)"},
    "rationale": "Every feature should serve at least one persona. Otherwise: who is this for?"
  },
  {
    "parent_type": "persona",
    "child_type": "research_study",
    "min_per_parent": 0,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"The Mom Test (Fitzpatrick)"},
    "rationale": "Personas without research are fiction. Flag but do not block."
  },
  {
    "parent_type": "outcome",
    "child_type": "metric",
    "min_per_parent": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Measure What Matters (Doerr)"},
    "rationale": "Every outcome needs a measurable indicator."
  }
]
