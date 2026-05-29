---
title: "Metric Tracking: Planning Time Reduction (Q2)"
upg_product: entopo
upg_version: "0.4.0"
entity_type: document
entity_id: doc_metric_planning_time_q2
author: Sam Patel
created_at: 2026-04-28
updated_at: 2026-04-28
status: published
tags: [metric, q2, validation]
graph_source: ../enterprise-pilot.upg
---

# Planning Time Reduction: Q2 Tracking

## Headline

[[metric:planning-time|current:22%|target:30%|designation:north_star]] is the metric we set in Q1 and are tracking against the Q2 pilot.

We're below target but trending positive. Statistical significance is confirmed (p < 0.05).

## Inputs

The metric decomposes into two input metrics:

- [[metric:meeting-count-per-sprint|current:4.2|target:3.0|designation:input]]: how many planning meetings each team holds per sprint.
- [[metric:context-handoff-time|current:18m|target:10m|designation:input]]: time spent re-establishing context at sprint boundaries.

Both are moving in the right direction. Meeting count is at 4.2 (down from 6.1 baseline); context handoff is at 18 minutes (down from 27 minutes).

## Cross-product comparison

The {{metric:planning-time → benchmark:industry-avg-planning-reduction@analytics|compared_with}} edge surfaces the cross-product reference: our analytics graph carries an industry benchmark we're tracking against.

## Discovery

During pilot week 6, the team surfaced a previously unknown input we should add to the model:

[[+metric:re-planning-incidents|current:1.4|target:0.5|designation:input|"Times per sprint a team has to redo planning because of context loss"]].

This is a creation reference. The first occurrence in this document declares the metric; it enters the graph at next sync.

## Quality assessment

| Quality dimension | Score | Notes |
|---|---|---|
| Correlated with outcome | 4 | Strongly tracks team velocity. |
| Actionable | 5 | Direct levers in our control. |
| Sensitive to change | 3 | Moves on monthly cadence. |
| Comparative | 4 | Has baseline + benchmark. |

The structured assessment lives on the paired entity:

```upg
{
  "declarations": [
    {
      "type": "metric_quality_assessment",
      "id": "planning-time-quality-q2",
      "properties": {
        "quality_correlated": 4,
        "quality_actionable": 5,
        "quality_sensitive": 3,
        "quality_comparative": 4,
        "quality_score": 4.0,
        "assessed_on": "2026-04-28"
      }
    }
  ],
  "edges": [
    { "src": "metric:planning-time", "tgt": "metric_quality_assessment:planning-time-quality-q2", "verb": "assessed_by" }
  ]
}
```
