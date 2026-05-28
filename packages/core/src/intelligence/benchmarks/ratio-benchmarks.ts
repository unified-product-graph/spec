/**
 * Expected ratios between entity-type counts at given stages.
 *
 * Encodes relationships like "learnings / hypotheses ≥ 1" (every hypothesis
 * should yield at least one learning) or "evidence per insight ≥ 1" (no
 * untested insights).
 *
 * Numerator and denominator can be a single type or a union (e.g. the
 * "evidence" ratio counts `learning | observation | research_finding` against
 * insights). Ratios are stage-scoped because early stages should not be
 * penalised for not yet having collected evidence.
 *
 * Consumers:
 * - Intelligence layer → ratio-based health checks, "untested assumption"
 *   warnings
 *
 * Benchmark shape: see `RatioBenchmark` in `./types.ts`.
 *
 * @see ./types.ts — `RatioBenchmark`
 * @see ../intelligence.ts — ratio audit consumer
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { RatioBenchmark } from './types.js'

export const UPG_RATIO_BENCHMARKS: RatioBenchmark[] = [
  {
    "name": "Hypothesis-to-Learning ratio",
    "numerator_type": "learning",
    "denominator_type": "hypothesis",
    "expected_min": 1,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Each hypothesis should produce at least one learning. If ratio <1, you have untested assumptions."
  },
  {
    "name": "Evidence density",
    "numerator_type": [
      "learning",
      "insight"
    ],
    "denominator_type": "hypothesis",
    "expected_min": 0.5,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"discovery"},
    "rationale": "Decisions should be backed by evidence, not intuition."
  },
  {
    "name": "Experiment rate",
    "numerator_type": "experiment_run",
    "denominator_type": "hypothesis",
    "expected_min": 0.8,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Lean Startup (Ries)"},
    "rationale": "Most hypotheses should have experiments. 80%+ means you test your bets."
  },
  {
    "name": "Solution breadth",
    "numerator_type": "solution",
    "denominator_type": "opportunity",
    "expected_min": 1.5,
    "stages": [
      "concept",
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Continuous Discovery Habits (Torres)"},
    "rationale": "Explore multiple solutions per opportunity. 1:1 means you jumped to the first idea."
  },
  {
    "name": "Story coverage",
    "numerator_type": "user_story",
    "denominator_type": "feature",
    "expected_min": 2,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"agile"},
    "rationale": "Features need decomposition. 2+ stories per feature means proper breakdown."
  },
  {
    "name": "Research throughput",
    "numerator_type": "insight",
    "denominator_type": "research_study",
    "expected_min": 3,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"ux_research"},
    "rationale": "Each study should yield 3+ insights. Less means shallow research or poor synthesis."
  },
  {
    "name": "Pain-to-opportunity conversion",
    "numerator_type": "opportunity",
    "denominator_type": "need",
    "expected_min": 0.3,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Continuous Discovery Habits (Torres)"},
    "rationale": "At least 30% of pain points should surface opportunities. Lower = pain is documented but not acted on."
  },
  {
    "name": "Feature-to-persona ratio",
    "numerator_type": "feature",
    "denominator_type": "persona",
    "expected_min": 2,
    "stages": [
      "build",
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"product_management"},
    "rationale": "Each persona should drive at least 2 features. Less = underserved personas."
  },
  {
    "name": "Decision documentation rate",
    "numerator_type": "decision",
    "denominator_type": "initiative",
    "expected_min": 1,
    "stages": [
      "growth",
      "mature"
    ],
    "source": {"kind":"book","citation":"Release It (Nygard)"},
    "rationale": "Each initiative should have at least one documented decision."
  },
  {
    "name": "Tech debt visibility",
    "numerator_type": "technical_debt_item",
    "denominator_type": "service",
    "expected_min": 0.5,
    "stages": [
      "growth",
      "mature"
    ],
    "source": {"kind":"industry_practice","category":"engineering"},
    "rationale": "If you have services but zero documented debt, debt is invisible — not absent."
  }
]
