---
title: "Enterprise Pilot Results: Q2 2026"
upg_product: entopo
upg_version: "0.4.0"
entity_type: document
entity_id: doc_pilot_results_q2
author: Jordan Park
created_at: 2026-04-07
tags: [experiment, validation, pilot]
status: published
composition_pattern: experiment_report
graph_source: enterprise-pilot.upg
---

# Enterprise Pilot Results: Q2 2026

## Background

Our primary persona [[persona:alex-senior-pm]] faces a critical need:
[[need:no-single-source-of-truth|valence:pain|severity:Significant]].

This was identified through research that surfaced a key insight:
{{insight:tool-fragmentation → opportunity:unified-knowledge|informs}},
our strongest evidence chain from user research to strategic opportunity.

[[persona:alex-senior-pm|"Alex"]] leads a 12-person team and
{{persona:alex-senior-pm -> job:keep-team-aligned|pursues}} alignment as
a core job, but today that job is underserved.

## What We Tested

[[hypothesis:structured-knowledge-reduces-planning|"The planning time
hypothesis"]] predicted that adopting
[[solution:unified-product-graph]] would reduce quarterly planning time
by 30%.

The chain from need to hypothesis:
- [[need:no-single-source-of-truth]] grounds
  [[opportunity:unified-knowledge|score:0.42]]
- The opportunity drives [[solution:unified-product-graph|rice:0.5]]
- The solution proposes
  [[hypothesis:structured-knowledge-reduces-planning]]

We ran [[experiment:enterprise-pilot-q2]], a controlled pilot with 5
enterprise teams over 8 weeks.

## Results

{{experiment:enterprise-pilot-q2 → learning:planning-time-reduction|produces}}

[[learning:planning-time-reduction|"The key learning"]]: teams reduced
planning time by 22% (below the 30% target but statistically
significant). 3 of 5 teams exceeded the 20% threshold.

[[metric:planning-time|current:22%|target:30%]] is trending positive.

| Measure | Target | Actual | Status |
|---------|--------|--------|--------|
| Planning time reduction | 30% | 22% | Below target, significant |
| Teams above threshold | 5 of 5 | 3 of 5 | Partial |
| Statistical significance | Yes | Yes | Confirmed |

## New Discovery

During the pilot, we discovered a previously unknown pain point:
[[+need:context-loss-between-sprints|valence:pain|severity:3|"Teams lose
product context between sprint boundaries"]].

This was mentioned by 4 of 5 pilot teams and warrants dedicated research.
The discovery came from the experiment itself:
{{experiment:enterprise-pilot-q2 -> need:context-loss-between-sprints|surfaces}}.

## Implications

1. **Proceed with investment.** [[solution:unified-product-graph]] is
   validated. The 22% result, while below target, is directionally
   strong and statistically significant.

2. **Adjust the target.** [[metric:planning-time]] target should move
   from 30% to 25%, a more realistic target based on pilot data.

3. **Investigate the new need.**
   [[need:context-loss-between-sprints]] is a potential second
   opportunity worth sizing.

4. **North star remains.**
   [[objective:reduce-context-switching]] is the right objective;
   the pilot confirms the direction.

## Full Evidence Chain

For reference, the complete traversal from persona to learning:

```
[[persona:alex-senior-pm]]
  → pursues → [[job:keep-team-aligned]]
    → surfaces → [[need:no-single-source-of-truth]]
      → grounds → [[opportunity:unified-knowledge]]
        → drives → [[solution:unified-product-graph]]
          → proposes → [[hypothesis:structured-knowledge-reduces-planning]]
            → requires → [[experiment:enterprise-pilot-q2]]
              → produces → [[learning:planning-time-reduction]]
```

Every link in this chain is a typed edge in the product graph. Every
node is a first-class entity with properties, lifecycle status, and
provenance. This is what structured product knowledge looks like.
