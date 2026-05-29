---
title: "Decision: Ship Smart Search before Q3 Planning"
upg_product: entopo
upg_version: "0.4.0"
entity_type: document
entity_id: doc_decision_smart_search_q2
author: Morgan Lee
created_at: 2026-04-28
status: published
composition_pattern: decision_record
tags: [decision, q2, search]
---

# Decision: Ship Smart Search before Q3 Planning

## Context

[[persona:alex-senior-pm|"Alex"]] surfaced repeatedly that search-by-id was slowing her team down during the v0.2 pilot. The pain pattern showed up in 4 of 5 pilot teams.

## Decision

We're shipping [[+feature:smart-search|"Smart Search"]] in the v0.2.10 release window. Status: scoped + scheduled.

The rationale chain:

- [[need:no-single-source-of-truth]] surfaces during planning (every quarter).
- {{feature:smart-search → metric:weekly-actives|drives}}: we expect a 12% lift in weekly actives based on pilot interviews.
- {{decision:ship-smart-search-q2 → feature:smart-search|approves}}: this decision authorises the work.

## Structural properties

The decision record has properties that don't fit cleanly inline (stakeholders, alternatives considered, blast radius). We use a fenced block:

```upg
{
  "declarations": [
    {
      "type": "decision",
      "id": "ship-smart-search-q2",
      "title": "Ship Smart Search before Q3 Planning",
      "properties": {
        "layer": "product",
        "status": "approved",
        "decided_on": "2026-04-28",
        "stakeholders": ["alex-senior-pm", "sarah-vp-product"],
        "alternatives_considered": [
          "defer-to-q3",
          "ship-search-without-ranking"
        ]
      }
    }
  ],
  "edges": [
    { "src": "decision:ship-smart-search-q2", "tgt": "feature:smart-search", "verb": "approves" }
  ]
}
```

## What this unblocks

Once Smart Search ships, the v0.3 backlog is cleared to absorb the [[+opportunity:unified-knowledge|score:0.42]] work that the pilot data also surfaced.
