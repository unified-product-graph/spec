/**
 * Canonical Framework Library: v1 public surface.
 *
 * The 34 famous, battle-tested product frameworks that anchor the public
 * Unified Product Graph framework catalog. Curated for editorial confidence
 * over breadth: every name here is universally recognised and actively
 * taught in product education.
 *
 * The fuller research catalog (~182 additional definitions) lives in the
 * `definitions/` directory and is promoted into this canonical set
 * incrementally as each framework is reviewed and validated.
 *
 * THIS FILE IS GENERATED. See scripts/regen-canonical-frameworks.ts.
 */

import type { UPGFramework } from './types.js'

export const UPG_FRAMEWORKS: UPGFramework[] = [
  {
    "id": "opportunity-solution-tree",
    "approach_ids": [
      "trace"
    ],
    "name": "Opportunity Solution Tree",
    "version": "1.0.0",
    "description": "Map desired outcomes to opportunities, then branch into solutions and experiments. Ensures every solution traces back to a real user need.",
    "category": "discovery",
    "origin": {
      "type": "practitioner",
      "attribution": "Teresa Torres",
      "description": "Introduced in Continuous Discovery Habits. Maps outcomes to opportunities, solutions, and experiments.",
      "url": "https://www.producttalk.org/opportunity-solution-tree/",
      "year": 2021,
      "license": "published_methodology"
    },
    "tags": [
      "discovery",
      "tree"
    ],
    "slots": [
      {
        "label": "Root Outcome",
        "entityTypeId": "outcome",
        "description": "The desired business or user outcome"
      },
      {
        "label": "Opportunities",
        "entityTypeId": "opportunity",
        "description": "User needs, pain points, or desires"
      },
      {
        "label": "Solutions",
        "entityTypeId": "solution",
        "description": "Ideas to address each opportunity"
      },
      {
        "label": "Experiments",
        "entityTypeId": "experiment_run",
        "description": "Tests to validate each solution"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "outcome",
          "role": "root"
        },
        {
          "type": "opportunity",
          "role": "item"
        },
        {
          "type": "solution",
          "role": "item"
        },
        {
          "type": "experiment_run",
          "role": "leaf"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "tree"
    },
    "presentation": {
      "layout": {
        "type": "tree",
        "direction": "TB",
        "engine": "dagre"
      },
      "colour_by": "type",
      "collapsible": true,
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Connect a desired outcome to the opportunities and solutions that could drive it, making the reasoning chain from goal to feature explicit and testable.",
      "core_question": "What opportunities exist under our target outcome, and which solutions best address them?",
      "when_to_use": [
        "You need to understand unmet user needs before committing to solutions",
        "The problem space is ambiguous and requires structured exploration",
        "You want to reduce the risk of building the wrong thing"
      ],
      "when_not_to_use": [
        "The solution is well-understood and validated",
        "You are in a delivery phase with clear requirements"
      ]
    }
  },
  {
    "id": "story-map",
    "approach_ids": [
      "plan"
    ],
    "name": "Story Map",
    "version": "1.0.0",
    "description": "Arrange user activities across the top, then prioritise user stories vertically under each activity. Horizontal = breadth, vertical = depth.",
    "category": "discovery",
    "origin": {
      "type": "practitioner",
      "attribution": "Jeff Patton",
      "description": "Published in User Story Mapping (O'Reilly). Organises stories by user activities to reveal the whole product.",
      "url": "https://www.jpattonassociates.com/user-story-mapping/",
      "year": 2014,
      "license": "published_methodology"
    },
    "tags": [
      "discovery",
      "matrix"
    ],
    "slots": [
      {
        "label": "User Activities",
        "entityTypeId": "job",
        "description": "High-level tasks users perform (horizontal axis)"
      },
      {
        "label": "Epics",
        "entityTypeId": "epic",
        "description": "Groups of stories under each activity"
      },
      {
        "label": "User Stories",
        "entityTypeId": "user_story",
        "description": "Detailed stories prioritised vertically"
      },
      {
        "label": "Release Slices",
        "entityTypeId": "release",
        "description": "Horizontal cuts defining MVP and iterations"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "job",
          "role": "bucket"
        },
        {
          "type": "epic",
          "role": "bucket"
        },
        {
          "type": "user_story",
          "role": "bucket"
        },
        {
          "type": "release",
          "role": "bucket"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 2,
        "cols": 2
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Arrange user stories along the narrative flow of the user journey, creating a two-dimensional backlog that shows both breadth and depth of functionality.",
      "core_question": "What is the complete user journey, and which stories form the minimum walking skeleton versus later enhancements?",
      "when_to_use": [
        "You need to understand unmet user needs before committing to solutions",
        "The problem space is ambiguous and requires structured exploration",
        "You want to reduce the risk of building the wrong thing"
      ],
      "when_not_to_use": [
        "The solution is well-understood and validated",
        "You are in a delivery phase with clear requirements"
      ]
    }
  },
  {
    "id": "value-proposition-canvas",
    "approach_ids": [
      "trace"
    ],
    "name": "Value Proposition Canvas",
    "version": "1.0.0",
    "description": "Map customer jobs, pains, and gains on one side, then align product features, pain relievers, and gain creators on the other to achieve product-market fit.",
    "category": "discovery",
    "origin": {
      "type": "practitioner",
      "attribution": "Osterwalder",
      "description": "Value Proposition Design",
      "url": "https://en.wikipedia.org/wiki/Value_proposition_canvas",
      "year": 2014,
      "license": "published_methodology"
    },
    "tags": [
      "discovery",
      "matrix"
    ],
    "slots": [
      {
        "label": "Customer Jobs",
        "entityTypeId": "job",
        "description": "Place job entities in the Customer Jobs position of the matrix"
      },
      {
        "label": "Pains",
        "entityTypeId": "need",
        "description": "Place need entities in the Pains position of the matrix"
      },
      {
        "label": "Gains",
        "entityTypeId": "desired_outcome",
        "description": "Place desired outcome entities in the Gains position of the matrix"
      },
      {
        "label": "Products & Services",
        "entityTypeId": "feature",
        "description": "Place feature entities in the Products & Services position of the matrix"
      },
      {
        "label": "Pain Relievers",
        "entityTypeId": "feature",
        "description": "Place feature entities in the Pain Relievers position of the matrix"
      },
      {
        "label": "Gain Creators",
        "entityTypeId": "feature",
        "description": "Place feature entities in the Gain Creators position of the matrix"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "job",
          "role": "bucket"
        },
        {
          "type": "need",
          "role": "bucket"
        },
        {
          "type": "desired_outcome",
          "role": "bucket"
        },
        {
          "type": "feature",
          "role": "bucket"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 2,
        "cols": 3
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Zoom into one customer segment. Map their jobs, pains, and gains against your value proposition's products, pain relievers, and gain creators. Product-market fit by design.",
      "core_question": "Does our value proposition address the jobs, pains, and gains that matter most to this customer segment?",
      "when_to_use": [
        "You need to understand unmet user needs before committing to solutions",
        "The problem space is ambiguous and requires structured exploration",
        "You want to reduce the risk of building the wrong thing"
      ],
      "when_not_to_use": [
        "The solution is well-understood and validated",
        "You are in a delivery phase with clear requirements"
      ]
    }
  },
  {
    "id": "persona-canvas",
    "approach_ids": [
      "trace"
    ],
    "name": "Persona Canvas",
    "version": "1.0.0",
    "description": "Demographics, goals, frustrations, JTBD: a structured template for creating research-backed personas.",
    "category": "user_understanding",
    "origin": {
      "type": "practitioner",
      "attribution": "Alan Cooper",
      "description": "Based on Alan Cooper's persona methodology from \"The Inmates Are Running the Asylum\" (1999). The canvas format structures persona creation around goals, behaviours, frustrations, and context.",
      "url": "https://www.cooper.com/journal/2001/08/perfecting_your_personas",
      "year": 1999,
      "license": "published_methodology"
    },
    "tags": [
      "user_understanding",
      "matrix"
    ],
    "slots": [
      {
        "label": "Demographics",
        "entityTypeId": "persona",
        "description": "Place persona entities in the Demographics position of the matrix"
      },
      {
        "label": "Goals",
        "entityTypeId": "desired_outcome",
        "description": "Place job entities in the Goals position of the matrix"
      },
      {
        "label": "Frustrations",
        "entityTypeId": "need",
        "description": "Place need entities in the Frustrations position of the matrix"
      },
      {
        "label": "Behaviours",
        "entityTypeId": "observation",
        "description": "Place desired outcome entities in the Behaviours position of the matrix"
      },
      {
        "label": "Jobs to Be Done",
        "entityTypeId": "job",
        "description": "Place quote entities in the Jobs to Be Done position of the matrix"
      },
      {
        "label": "Quotes",
        "entityTypeId": "quote",
        "description": "Place observation entities in the Quotes position of the matrix"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "persona",
          "role": "bucket"
        },
        {
          "type": "job",
          "role": "bucket"
        },
        {
          "type": "need",
          "role": "bucket"
        },
        {
          "type": "desired_outcome",
          "role": "bucket"
        },
        {
          "type": "quote",
          "role": "bucket"
        },
        {
          "type": "observation",
          "role": "bucket"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 2,
        "cols": 3
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Define a user archetype's goals, behaviours, frustrations, and context on a structured canvas so every team member designs for the same person instead of an abstract \"user\".",
      "core_question": "Who specifically are we building for? What are their goals, frustrations, and the context in which they use our product?",
      "when_to_use": [
        "You need to build empathy for your users across the team",
        "Product decisions require deeper understanding of user context",
        "You want to segment users in meaningful ways beyond demographics"
      ],
      "when_not_to_use": [
        "You have a single, well-understood user persona",
        "The product serves a narrow, homogeneous audience"
      ]
    }
  },
  {
    "id": "empathy-map",
    "approach_ids": [
      "trace"
    ],
    "name": "Empathy Map",
    "version": "1.0.0",
    "description": "Visualise what a user says, thinks, does, and feels to build deeper empathy and uncover hidden needs.",
    "category": "research",
    "origin": {
      "type": "practitioner",
      "attribution": "Dave Gray (XPLANE)",
      "description": "Created by Dave Gray at XPLANE. Originally a design thinking exercise, now standard in product discovery.",
      "url": "https://gamestorming.com/empathy-mapping/",
      "year": 2010,
      "license": "open_attribution"
    },
    "tags": [
      "research",
      "matrix"
    ],
    "slots": [
      {
        "label": "Says",
        "entityTypeId": "quote",
        "description": "Direct quotes from user interviews"
      },
      {
        "label": "Thinks",
        "entityTypeId": "insight",
        "description": "What the user is thinking but may not say"
      },
      {
        "label": "Does",
        "entityTypeId": "job",
        "description": "Observable actions and behaviours"
      },
      {
        "label": "Feels",
        "entityTypeId": "need",
        "description": "Emotions, frustrations, and anxieties"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "need",
          "role": "bucket"
        },
        {
          "type": "job",
          "role": "bucket"
        },
        {
          "type": "insight",
          "role": "bucket"
        },
        {
          "type": "quote",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 2,
        "cols": 2
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Synthesise research observations into what a user says, thinks, does, and feels. Build a shared mental model of the user that goes beyond demographics.",
      "core_question": "What does this user truly think and feel versus what they say and do? What do the gaps reveal?",
      "when_to_use": [
        "You need to synthesise findings from multiple research activities",
        "Research insights are scattered and not accessible to the team",
        "You want to build a shared understanding of what you have learned"
      ],
      "when_not_to_use": [
        "You have not yet conducted enough research to synthesise",
        "The team prefers to act on intuition rather than evidence"
      ]
    }
  },
  {
    "id": "wardley-map",
    "approach_ids": [
      "plan"
    ],
    "name": "Wardley Map",
    "version": "1.0.0",
    "description": "Map your value chain on axes of visibility (to user) and evolution (genesis → custom → product → commodity). Reveals strategic moves.",
    "category": "strategy",
    "origin": {
      "type": "practitioner",
      "attribution": "Simon Wardley",
      "description": "Developed by Simon Wardley. A situational awareness tool for strategy based on value chain evolution.",
      "url": "https://learnwardleymapping.com/",
      "year": 2005,
      "license": "published_methodology"
    },
    "tags": [
      "strategy",
      "quadrant"
    ],
    "slots": [
      {
        "label": "User Need",
        "entityTypeId": "need",
        "description": "The anchor: what the user actually needs"
      },
      {
        "label": "Value Chain",
        "entityTypeId": "capability",
        "description": "Components that fulfill the user need"
      },
      {
        "label": "Evolution Stage",
        "entityTypeId": "feature",
        "description": "Where each component sits on the evolution axis"
      },
      {
        "label": "Movement",
        "entityTypeId": "competitor",
        "description": "How components are evolving over time"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "capability",
          "role": "item"
        },
        {
          "type": "feature",
          "role": "item"
        },
        {
          "type": "competitor",
          "role": "item"
        },
        {
          "type": "need",
          "role": "item"
        }
      ],
      "required_properties": {
        "capability": [
          {
            "property": "evolution_stage",
            "type": "enum",
            "required": true,
            "scope": "framework",
            "label": "Evolution Stage",
            "description": "Where this component sits on the evolution axis",
            "enum_values": [
              "genesis",
              "custom",
              "product",
              "commodity"
            ]
          },
          {
            "property": "visibility",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Visibility",
            "description": "Y-axis position (0=infrastructure, 1=anchor/user)"
          }
        ],
        "feature": [
          {
            "property": "evolution_stage",
            "type": "enum",
            "required": true,
            "scope": "framework",
            "label": "Evolution Stage",
            "description": "Where this component sits on the evolution axis",
            "enum_values": [
              "genesis",
              "custom",
              "product",
              "commodity"
            ]
          },
          {
            "property": "visibility",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Visibility",
            "description": "Y-axis position (0=infrastructure, 1=anchor/user)"
          }
        ],
        "competitor": [
          {
            "property": "evolution_stage",
            "type": "enum",
            "required": true,
            "scope": "framework",
            "label": "Evolution Stage",
            "description": "Where this component sits on the evolution axis",
            "enum_values": [
              "genesis",
              "custom",
              "product",
              "commodity"
            ]
          },
          {
            "property": "visibility",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Visibility",
            "description": "Y-axis position (0=infrastructure, 1=anchor/user)"
          }
        ],
        "need": [
          {
            "property": "evolution_stage",
            "type": "enum",
            "required": true,
            "scope": "framework",
            "label": "Evolution Stage",
            "description": "Where this component sits on the evolution axis (need anchor is usually at \"product\" or \"commodity\")",
            "enum_values": [
              "genesis",
              "custom",
              "product",
              "commodity"
            ]
          },
          {
            "property": "visibility",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Visibility",
            "description": "Y-axis position (0=infrastructure, 1=anchor/user); needs sit at 1.0"
          }
        ]
      }
    },
    "structure": {
      "pattern": "quadrant"
    },
    "presentation": {
      "layout": {
        "type": "quadrant",
        "x_axis": "evolution_stage",
        "y_axis": "visibility",
        "x_label": "Evolution (Genesis → Commodity)",
        "y_label": "Visibility (Invisible → Anchor)"
      },
      "colour_by": "status",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Visualise the value chain from user need to underlying components, positioning each by evolution stage to reveal strategic moves competitors cannot see.",
      "core_question": "Where is each component in our value chain on the evolution axis, and what strategic moves does that positioning reveal?",
      "when_to_use": [
        "You need to align the team on long-term direction",
        "Market conditions are shifting and you need to reassess positioning",
        "Leadership needs a structured view of strategic options"
      ],
      "when_not_to_use": [
        "You are in pure execution mode with a clear strategy already set",
        "The team is too early-stage to commit to strategic constraints"
      ]
    }
  },
  {
    "id": "business-model-canvas",
    "approach_ids": [
      "plan"
    ],
    "name": "Business Model Canvas",
    "version": "1.0.0",
    "description": "Nine building blocks that describe how an organisation creates, delivers, and captures value.",
    "category": "business_model",
    "origin": {
      "type": "practitioner",
      "attribution": "Alexander Osterwalder & Yves Pigneur",
      "description": "Published in Business Model Generation (Wiley). The most widely used business model framework in the world.",
      "url": "https://www.strategyzer.com/business-model-canvas",
      "year": 2010,
      "license": "published_methodology"
    },
    "tags": [
      "business_model",
      "matrix"
    ],
    "slots": [
      {
        "label": "Key Partners",
        "entityTypeId": "partnership",
        "description": "Who are your key partners and suppliers?"
      },
      {
        "label": "Key Activities",
        "entityTypeId": "key_activity",
        "description": "What key activities does your value prop require?"
      },
      {
        "label": "Value Propositions",
        "entityTypeId": "value_proposition",
        "description": "What value do you deliver to the customer?"
      },
      {
        "label": "Customer Relationships",
        "entityTypeId": "customer_relationship",
        "description": "What type of relationship does each segment expect?"
      },
      {
        "label": "Customer Segments",
        "entityTypeId": "market_segment",
        "description": "For whom are you creating value?"
      },
      {
        "label": "Key Resources",
        "entityTypeId": "key_resource",
        "description": "What key resources does your value prop require?"
      },
      {
        "label": "Channels",
        "entityTypeId": "distribution_channel",
        "description": "How do you reach your customer segments?"
      },
      {
        "label": "Cost Structure",
        "entityTypeId": "cost_structure",
        "description": "What are the most important costs?"
      },
      {
        "label": "Revenue Streams",
        "entityTypeId": "revenue_stream",
        "description": "For what value are customers willing to pay?"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "partnership",
          "role": "bucket"
        },
        {
          "type": "key_activity",
          "role": "bucket"
        },
        {
          "type": "value_proposition",
          "role": "bucket"
        },
        {
          "type": "customer_relationship",
          "role": "bucket"
        },
        {
          "type": "key_resource",
          "role": "bucket"
        },
        {
          "type": "distribution_channel",
          "role": "bucket"
        },
        {
          "type": "cost_structure",
          "role": "bucket"
        },
        {
          "type": "revenue_stream",
          "role": "bucket"
        },
        {
          "type": "market_segment",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 3,
        "cols": 3
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Map all nine building blocks of a business model so teams see how value creation, delivery, and capture connect end-to-end.",
      "core_question": "How does our organisation create, deliver, and capture value, and where are the dependencies between those activities?",
      "when_to_use": [
        "You are designing or redesigning how the business creates and captures value",
        "You need to communicate the business model to stakeholders or investors",
        "You want to identify risks and assumptions in your business model"
      ],
      "when_not_to_use": [
        "The business model is mature and well-understood by all stakeholders",
        "You are focused on tactical execution rather than model design"
      ]
    }
  },
  {
    "id": "porter-five-forces",
    "approach_ids": [
      "inspect"
    ],
    "name": "Porter Five Forces",
    "version": "1.0.0",
    "description": "Analyse industry competitiveness through five forces: rivalry, new entrants, substitutes, buyer power, and supplier power.",
    "category": "strategy",
    "origin": {
      "type": "practitioner",
      "attribution": "Michael Porter",
      "description": "Published in Competitive Strategy (Free Press). The foundational framework for industry analysis.",
      "year": 1979,
      "license": "public_domain"
    },
    "tags": [
      "strategy",
      "collection"
    ],
    "slots": [
      {
        "label": "Competitive Rivalry",
        "entityTypeId": "competitor",
        "description": "Intensity of competition among existing players"
      },
      {
        "label": "Threat of New Entrants",
        "entityTypeId": "competitor",
        "description": "How easy is it for new competitors to enter?"
      },
      {
        "label": "Threat of Substitutes",
        "entityTypeId": "competitor",
        "description": "Can customers switch to alternatives?"
      },
      {
        "label": "Buyer Power",
        "entityTypeId": "persona",
        "description": "How much leverage do buyers have?"
      },
      {
        "label": "Supplier Power",
        "entityTypeId": "persona",
        "description": "How much leverage do suppliers have?"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "competitor",
          "role": "item"
        },
        {
          "type": "persona",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "collection"
    },
    "presentation": {
      "layout": {
        "type": "grid",
        "groupBy": "type"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Analyse the competitive dynamics of an industry through five structural forces that determine profitability, revealing where power lies and where threats emerge.",
      "core_question": "What structural forces shape competition in our industry, and how do they affect our ability to capture value?",
      "when_to_use": [
        "You need to align the team on long-term direction",
        "Market conditions are shifting and you need to reassess positioning",
        "Leadership needs a structured view of strategic options"
      ],
      "when_not_to_use": [
        "You are in pure execution mode with a clear strategy already set",
        "The team is too early-stage to commit to strategic constraints"
      ]
    }
  },
  {
    "id": "swot-analysis",
    "approach_ids": [
      "inspect"
    ],
    "name": "SWOT Analysis",
    "version": "1.0.0",
    "description": "Map Strengths, Weaknesses, Opportunities, and Threats in a 2x2 grid. Internal vs external, helpful vs harmful.",
    "category": "strategy",
    "origin": {
      "type": "practitioner",
      "description": "Widely attributed to Albert Humphrey at Stanford Research Institute. One of the most commonly used strategy frameworks.",
      "license": "public_domain"
    },
    "tags": [
      "strategy",
      "matrix"
    ],
    "slots": [
      {
        "label": "Strengths",
        "entityTypeId": "capability",
        "description": "Internal advantages and core competencies"
      },
      {
        "label": "Weaknesses",
        "entityTypeId": "need",
        "description": "Internal limitations and gaps"
      },
      {
        "label": "Opportunities",
        "entityTypeId": "opportunity",
        "description": "External trends and openings"
      },
      {
        "label": "Threats",
        "entityTypeId": "competitor",
        "description": "External risks and competitive pressures"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "capability",
          "role": "bucket"
        },
        {
          "type": "need",
          "role": "bucket"
        },
        {
          "type": "opportunity",
          "role": "bucket"
        },
        {
          "type": "competitor",
          "role": "bucket"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 2,
        "cols": 2
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Map internal strengths and weaknesses against external opportunities and threats so teams can align strategy with reality.",
      "core_question": "What are our strongest advantages, biggest vulnerabilities, untapped opportunities, and most serious threats?",
      "when_to_use": [
        "You need to align the team on long-term direction",
        "Market conditions are shifting and you need to reassess positioning",
        "Leadership needs a structured view of strategic options"
      ],
      "when_not_to_use": [
        "You are in pure execution mode with a clear strategy already set",
        "The team is too early-stage to commit to strategic constraints"
      ]
    }
  },
  {
    "id": "value-chain-analysis",
    "approach_ids": [
      "trace"
    ],
    "name": "Value Chain Analysis",
    "version": "1.0.0",
    "description": "Map primary and support activities to understand where value is created and where costs can be optimised across the organisation.",
    "category": "strategy",
    "origin": {
      "type": "practitioner",
      "attribution": "Michael Porter",
      "description": "Competitive Advantage",
      "url": "https://en.wikipedia.org/wiki/Value_chain",
      "year": 1985,
      "license": "public_domain"
    },
    "tags": [
      "strategy",
      "flow"
    ],
    "slots": [
      {
        "label": "Inbound Logistics",
        "entityTypeId": "key_activity",
        "description": "Inbound Logistics phase: key activity entities move through this stage"
      },
      {
        "label": "Operations",
        "entityTypeId": "key_activity",
        "description": "Operations phase: key activity entities move through this stage"
      },
      {
        "label": "Outbound Logistics",
        "entityTypeId": "key_activity",
        "description": "Outbound Logistics phase: key activity entities move through this stage"
      },
      {
        "label": "Marketing & Sales",
        "entityTypeId": "key_activity",
        "description": "Marketing & Sales phase: key activity entities move through this stage"
      },
      {
        "label": "Service",
        "entityTypeId": "key_activity",
        "description": "Service phase: key activity entities move through this stage"
      },
      {
        "label": "Support Activities",
        "entityTypeId": "capability",
        "description": "Support Activities phase: capability entities move through this stage"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "key_activity",
          "role": "item"
        },
        {
          "type": "capability",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "flow"
    },
    "presentation": {
      "layout": {
        "type": "flow",
        "direction": "LR"
      },
      "colour_by": "status",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Decompose the organisation into primary and support activities to identify where value is created, where costs accumulate, and where competitive advantage can be built.",
      "core_question": "Which activities in our value chain create the most value for customers, and which are candidates for cost reduction or outsourcing?",
      "when_to_use": [
        "You need to align the team on long-term direction",
        "Market conditions are shifting and you need to reassess positioning",
        "Leadership needs a structured view of strategic options"
      ],
      "when_not_to_use": [
        "You are in pure execution mode with a clear strategy already set",
        "The team is too early-stage to commit to strategic constraints"
      ]
    }
  },
  {
    "id": "three-horizons",
    "approach_ids": [
      "plan"
    ],
    "name": "Three Horizons of Growth",
    "version": "1.0.0",
    "description": "McKinsey's growth framework dividing the portfolio into three time horizons: H1 (core business), H2 (emerging opportunities), H3 (future bets). Ensures balanced investment across today, tomorrow, and the future.",
    "category": "portfolio",
    "origin": {
      "type": "practitioner",
      "attribution": "McKinsey",
      "description": "Introduced by Mehrdad Baghai, Stephen Coley, and David White in \"The Alchemy of Growth\" (1999, McKinsey). Adapted by many organisations and later by Bill Sharpe for futures thinking.",
      "url": "https://www.mckinsey.com/business-functions/strategy-and-corporate-finance/our-insights/enduring-ideas-the-three-horizons-of-growth",
      "year": 1999,
      "license": "open_attribution"
    },
    "tags": [
      "portfolio",
      "tree"
    ],
    "slots": [
      {
        "label": "Portfolio",
        "entityTypeId": "portfolio",
        "description": "Innovation portfolio balanced across three horizons: core performance, emerging growth, and future creation"
      },
      {
        "label": "Product",
        "entityTypeId": "product",
        "description": "Product or business unit assigned to a horizon: H1 (defend and extend), H2 (build), or H3 (seed and explore)"
      },
      {
        "label": "Initiative",
        "entityTypeId": "portfolio",
        "description": "Growth initiative positioned in a horizon, with appropriate funding model, governance, and success metrics"
      },
      {
        "label": "Product Area",
        "entityTypeId": "product_area",
        "description": "Product area representing a horizon: core products (H1), adjacent expansions (H2), or experimental ventures (H3)"
      },
      {
        "label": "Capability",
        "entityTypeId": "capability",
        "description": "Capability needed to execute across horizons: H1 needs efficiency, H2 needs scaling, H3 needs discovery"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "portfolio",
          "role": "item"
        },
        {
          "type": "product",
          "role": "item"
        },
        {
          "type": "product_area",
          "role": "item"
        },
        {
          "type": "capability",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "tree"
    },
    "presentation": {
      "layout": {
        "type": "tree",
        "direction": "TB",
        "engine": "dagre"
      },
      "colour_by": "type",
      "collapsible": true,
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Balance investment across three time horizons: Horizon 1 (core business), Horizon 2 (emerging), Horizon 3 (future bets). The organisation grows while protecting current revenue.",
      "core_question": "Are we investing enough in future horizons, or is the urgency of the core business starving our long-term growth options?",
      "when_to_use": [
        "You manage multiple products and need to allocate resources across them",
        "You need to assess the health and lifecycle stage of products",
        "Strategic decisions require a portfolio-level view"
      ],
      "when_not_to_use": [
        "You have a single product with no portfolio complexity",
        "Portfolio decisions are made ad-hoc without need for frameworks"
      ]
    }
  },
  {
    "id": "rice-scoring",
    "approach_ids": [
      "prioritise"
    ],
    "name": "RICE Scoring",
    "version": "1.0.0",
    "description": "Score features and opportunities by Reach, Impact, Confidence, and Effort to produce a ranked priority list.",
    "category": "prioritization",
    "origin": {
      "type": "practitioner",
      "attribution": "Intercom (Sean McBride)",
      "description": "Developed at Intercom as a way to quantify feature prioritisation. Published as a blog post that became an industry standard.",
      "url": "https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/",
      "year": 2014,
      "license": "open_attribution"
    },
    "tags": [
      "prioritization",
      "table"
    ],
    "slots": [
      {
        "label": "Items to score",
        "entityTypeId": "feature",
        "description": "Features, opportunities, or solutions being evaluated"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "feature",
          "role": "scored_item"
        }
      ],
      "required_properties": {
        "feature": [
          {
            "property": "reach",
            "type": "assessment",
            "scale_id": "reach_5",
            "required": true,
            "scope": "framework",
            "label": "Reach",
            "description": "How many users will this impact per quarter?"
          },
          {
            "property": "impact",
            "type": "assessment",
            "scale_id": "impact_5",
            "required": true,
            "scope": "framework",
            "label": "Impact",
            "description": "How much will this impact each user, on the impact scale?"
          },
          {
            "property": "confidence",
            "type": "assessment",
            "scale_id": "confidence_5",
            "required": true,
            "scope": "framework",
            "label": "Confidence",
            "description": "How confident are you in the reach, impact, and effort estimates?"
          },
          {
            "property": "effort",
            "type": "assessment",
            "scale_id": "effort_5",
            "required": true,
            "scope": "framework",
            "label": "Effort",
            "description": "How much work is required to build and ship this, on the effort scale?"
          }
        ]
      },
      "computed_properties": [
        {
          "property": "rice_score",
          "expression": "(reach * impact * confidence) / effort",
          "entity_type": "feature",
          "label": "RICE Score",
          "format": "number"
        }
      ]
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Items to score",
            "sortable": true
          },
          {
            "property": "reach",
            "label": "Reach",
            "sortable": true,
            "format": "number"
          },
          {
            "property": "impact",
            "label": "Impact",
            "sortable": true,
            "format": "number"
          },
          {
            "property": "confidence",
            "label": "Confidence",
            "sortable": true,
            "format": "number"
          },
          {
            "property": "effort",
            "label": "Effort",
            "sortable": true,
            "format": "number"
          },
          {
            "property": "rice_score",
            "label": "RICE Score",
            "sortable": true,
            "format": "score_pill"
          }
        ]
      },
      "sort_by": {
        "property": "rice_score",
        "direction": "desc"
      },
      "colour_by": "score",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Quantify feature priority by scoring Reach, Impact, Confidence, and Effort so teams compare opportunities on the same scale instead of debating gut feelings.",
      "core_question": "Given limited engineering capacity, which features will deliver the most user value relative to the effort required?",
      "when_to_use": [
        "You have more ideas or features than capacity to build them",
        "Stakeholders disagree on what to build next",
        "You need a transparent, defensible prioritisation process"
      ],
      "when_not_to_use": [
        "You have a single obvious next step with no contention",
        "The backlog is small enough to sequence intuitively"
      ]
    }
  },
  {
    "id": "build-measure-learn",
    "approach_ids": [
      "reflect"
    ],
    "name": "Build-Measure-Learn",
    "version": "1.0.0",
    "description": "The core Lean Startup feedback loop: build a minimum viable product, measure its impact with actionable metrics, and learn whether to pivot or persevere.",
    "category": "validation",
    "origin": {
      "type": "practitioner",
      "attribution": "Eric Ries",
      "description": "Introduced by Eric Ries in \"The Lean Startup\" (2011). The Build-Measure-Learn feedback loop is the core engine of the Lean Startup methodology, emphasising validated learning over detailed planning.",
      "url": "https://en.wikipedia.org/wiki/Lean_startup",
      "year": 2011,
      "license": "published_methodology"
    },
    "tags": [
      "validation",
      "flow"
    ],
    "slots": [
      {
        "label": "Build",
        "entityTypeId": "prototype",
        "description": "Build phase: prototype entities move through this stage"
      },
      {
        "label": "Measure",
        "entityTypeId": "metric",
        "description": "Measure phase: metric entities move through this stage"
      },
      {
        "label": "Learn",
        "entityTypeId": "learning",
        "description": "Learn phase: learning entities move through this stage"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "metric",
          "role": "item"
        },
        {
          "type": "learning",
          "role": "item"
        },
        {
          "type": "prototype",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "flow"
    },
    "presentation": {
      "layout": {
        "type": "flow",
        "direction": "LR"
      },
      "colour_by": "status",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Iterate through the Lean Startup loop (build the smallest thing, measure what matters, learn whether to persevere or pivot), minimising waste on unvalidated ideas.",
      "core_question": "What is the minimum we need to build to test our current hypothesis, and what metric tells us whether to continue or pivot?",
      "when_to_use": [
        "You have hypotheses about user needs or solutions that need testing",
        "You want to reduce risk before committing engineering resources",
        "The team is debating assumptions that can be tested empirically"
      ],
      "when_not_to_use": [
        "The solution is already validated through real usage data",
        "Speed of shipping matters more than certainty about assumptions"
      ]
    }
  },
  {
    "id": "kano-model",
    "approach_ids": [
      "prioritise"
    ],
    "name": "Kano Model",
    "version": "1.0.0",
    "description": "Classify features by how they affect user satisfaction: must-haves, performance features, and delighters.",
    "category": "prioritization",
    "origin": {
      "type": "practitioner",
      "attribution": "Noriaki Kano",
      "description": "Created by Professor Noriaki Kano at Tokyo University of Science. Based on his theory of attractive quality.",
      "url": "https://en.wikipedia.org/wiki/Kano_model",
      "year": 1984,
      "license": "public_domain"
    },
    "tags": [
      "prioritization",
      "quadrant"
    ],
    "slots": [
      {
        "label": "Must-haves",
        "entityTypeId": "feature",
        "description": "Expected features: absence causes dissatisfaction"
      },
      {
        "label": "Performance",
        "entityTypeId": "feature",
        "description": "More is better: linear satisfaction increase"
      },
      {
        "label": "Delighters",
        "entityTypeId": "feature",
        "description": "Unexpected features: presence creates delight"
      },
      {
        "label": "Indifferent",
        "entityTypeId": "feature",
        "description": "Features users don't care about either way"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "feature",
          "role": "item"
        }
      ],
      "required_properties": {
        "feature": [
          {
            "property": "functional_response",
            "type": "enum",
            "required": true,
            "scope": "framework",
            "label": "Functional Response",
            "description": "How users feel when the feature IS present",
            "enum_values": [
              "i_like_it",
              "i_expect_it",
              "i_am_neutral",
              "i_can_tolerate_it",
              "i_dislike_it"
            ]
          },
          {
            "property": "dysfunctional_response",
            "type": "enum",
            "required": true,
            "scope": "framework",
            "label": "Dysfunctional Response",
            "description": "How users feel when the feature IS NOT present",
            "enum_values": [
              "i_like_it",
              "i_expect_it",
              "i_am_neutral",
              "i_can_tolerate_it",
              "i_dislike_it"
            ]
          },
          {
            "property": "delighter_count",
            "type": "number",
            "required": false,
            "scope": "framework",
            "label": "Delighter classifications",
            "description": "Count of survey responses classifying this feature as a delighter (attractive)"
          },
          {
            "property": "performance_count",
            "type": "number",
            "required": false,
            "scope": "framework",
            "label": "Performance classifications",
            "description": "Count of survey responses classifying this feature as performance (one-dimensional)"
          },
          {
            "property": "must_be_count",
            "type": "number",
            "required": false,
            "scope": "framework",
            "label": "Must-be classifications",
            "description": "Count of survey responses classifying this feature as must-be (basic)"
          },
          {
            "property": "indifferent_count",
            "type": "number",
            "required": false,
            "scope": "framework",
            "label": "Indifferent classifications",
            "description": "Count of survey responses classifying this feature as indifferent"
          }
        ]
      },
      "computed_properties": [
        {
          "property": "satisfaction_coefficient",
          "expression": "(delighter_count + performance_count) / (delighter_count + performance_count + must_be_count + indifferent_count)",
          "entity_type": "feature",
          "label": "Satisfaction Coefficient",
          "format": "number"
        },
        {
          "property": "dissatisfaction_coefficient",
          "expression": "(must_be_count + performance_count) / (delighter_count + performance_count + must_be_count + indifferent_count) * -1",
          "entity_type": "feature",
          "label": "Dissatisfaction Coefficient",
          "format": "number"
        }
      ]
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 5,
        "cols": 5,
        "template": "kano-classification"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Classify features by how they affect user satisfaction (must-haves vs delighters). Teams invest in the right category at the right time.",
      "core_question": "Which features prevent dissatisfaction, which increase satisfaction linearly, and which create unexpected delight?",
      "when_to_use": [
        "You need to distinguish must-have features from delighters",
        "You want to identify features that drive satisfaction vs prevent dissatisfaction",
        "You are investing in differentiation and need to know which delighters move users"
      ],
      "when_not_to_use": [
        "You cannot survey users for functional/dysfunctional responses",
        "The backlog is too early-stage for paired survey questions to be meaningful"
      ]
    }
  },
  {
    "id": "now-next-later",
    "approach_ids": [
      "plan"
    ],
    "name": "Now-Next-Later",
    "version": "1.0.0",
    "description": "Prioritise work into three time horizons without committing to specific dates. Outcome-focused, not date-focused.",
    "category": "planning",
    "origin": {
      "type": "practitioner",
      "description": "Popularised by Janna Bastow (ProdPad). An outcome-focused roadmap that avoids false date commitments.",
      "url": "https://www.prodpad.com/blog/invented-now-next-later-roadmap/",
      "year": 2012,
      "license": "cc_by"
    },
    "tags": [
      "planning",
      "table"
    ],
    "slots": [
      {
        "label": "Now",
        "entityTypeId": "feature",
        "description": "Committed work in progress"
      },
      {
        "label": "Next",
        "entityTypeId": "feature",
        "description": "High-confidence upcoming work"
      },
      {
        "label": "Later",
        "entityTypeId": "initiative",
        "description": "Exploratory, needs more discovery"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "feature",
          "role": "item"
        },
        {
          "type": "initiative",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Now",
            "sortable": true
          },
          {
            "property": "title",
            "label": "Next",
            "sortable": true
          },
          {
            "property": "title",
            "label": "Later",
            "sortable": true
          }
        ]
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Organise work by time horizon without committing to dates. Now is in progress, Next is committed, Later is under consideration. Flexible direction.",
      "core_question": "What are we certain about (Now), what have we committed to (Next), and what are we still exploring (Later)?",
      "when_to_use": [
        "You need to coordinate work across multiple teams or time horizons",
        "Stakeholders need visibility into what is coming and when",
        "You want to balance commitments with flexibility"
      ],
      "when_not_to_use": [
        "The team is small enough that informal coordination works",
        "Plans would create false precision about uncertain outcomes"
      ]
    }
  },
  {
    "id": "moscow",
    "approach_ids": [
      "plan",
      "prioritise"
    ],
    "name": "MoSCoW",
    "version": "1.0.0",
    "description": "Categorise requirements into Must have, Should have, Could have, and Won't have to clarify scope and priorities.",
    "category": "prioritization",
    "origin": {
      "type": "practitioner",
      "attribution": "Dai Clegg (Oracle)",
      "description": "Created by Dai Clegg at Oracle as part of the DSDM Atern methodology for rapid application development.",
      "year": 1994,
      "license": "open_attribution"
    },
    "tags": [
      "prioritization",
      "table"
    ],
    "slots": [
      {
        "label": "Requirements to categorise",
        "entityTypeId": "feature",
        "description": "Features or requirements sorted into the four MoSCoW buckets"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "feature",
          "role": "scored_item"
        }
      ],
      "required_properties": {
        "feature": [
          {
            "property": "moscow",
            "type": "enum",
            "required": true,
            "scope": "framework",
            "label": "MoSCoW priority",
            "description": "Which scope bucket this requirement falls into for the current release",
            "enum_values": [
              "must",
              "should",
              "could",
              "wont"
            ]
          }
        ]
      }
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Requirement",
            "sortable": true
          },
          {
            "property": "moscow",
            "label": "Priority",
            "sortable": true,
            "format": "badge"
          }
        ]
      },
      "sort_by": {
        "property": "moscow",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Categorise requirements into Must, Should, Could, and Won't buckets so stakeholders agree on scope boundaries before development begins.",
      "core_question": "Which requirements are truly non-negotiable for this release, and which can be deferred without blocking the goal?",
      "when_to_use": [
        "You have more ideas or features than capacity to build them",
        "Stakeholders disagree on what to build next",
        "You need a transparent, defensible prioritisation process"
      ],
      "when_not_to_use": [
        "You have a single obvious next step with no contention",
        "The backlog is small enough to sequence intuitively"
      ]
    }
  },
  {
    "id": "hypothesis-board",
    "approach_ids": [
      "reflect"
    ],
    "name": "Hypothesis Board",
    "version": "1.0.0",
    "description": "Track hypotheses through their lifecycle: draft → designed → running → analysed. Each row is a hypothesis with its experiment and learning.",
    "category": "validation",
    "origin": {
      "type": "practitioner",
      "description": "Common in lean product teams. Tracks hypotheses through design, experimentation, and learning cycles.",
      "year": 2013,
      "license": "cc_by"
    },
    "tags": [
      "validation",
      "table"
    ],
    "slots": [
      {
        "label": "Hypothesis",
        "entityTypeId": "hypothesis",
        "description": "We believe [action] will result in [outcome]"
      },
      {
        "label": "Experiment",
        "entityTypeId": "experiment_run",
        "description": "The test designed to validate or invalidate"
      },
      {
        "label": "Success Metric",
        "entityTypeId": "metric",
        "description": "What number tells us if the hypothesis holds?"
      },
      {
        "label": "Learning",
        "entityTypeId": "learning",
        "description": "What we learned from the experiment"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "hypothesis",
          "role": "item"
        },
        {
          "type": "experiment_run",
          "role": "leaf"
        },
        {
          "type": "metric",
          "role": "item"
        },
        {
          "type": "learning",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Hypothesis",
            "sortable": true
          },
          {
            "property": "title",
            "label": "Experiment",
            "sortable": true
          },
          {
            "property": "title",
            "label": "Success Metric",
            "sortable": true
          },
          {
            "property": "description",
            "label": "Learning"
          }
        ]
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Track product hypotheses through their lifecycle: assumption to experiment to validated/invalidated. Team learning becomes visible and cumulative.",
      "core_question": "Which hypotheses have we validated, which have we invalidated, and what new hypotheses emerged from the evidence?",
      "when_to_use": [
        "You have hypotheses about user needs or solutions that need testing",
        "You want to reduce risk before committing engineering resources",
        "The team is debating assumptions that can be tested empirically"
      ],
      "when_not_to_use": [
        "The solution is already validated through real usage data",
        "Speed of shipping matters more than certainty about assumptions"
      ]
    }
  },
  {
    "id": "c4-model",
    "approach_ids": [
      "trace"
    ],
    "name": "C4 Model",
    "version": "1.0.0",
    "description": "Visualise software architecture at four levels of abstraction: System Context, Container, Component, and Code. Each level zooms in to reveal more detail.",
    "category": "engineering",
    "origin": {
      "type": "practitioner",
      "attribution": "Simon Brown",
      "description": "Created by Simon Brown. The C4 model addresses the chaos of ad-hoc architecture diagrams by defining four standard levels of abstraction, each with clear rules about what to include and exclude.",
      "url": "https://c4model.com",
      "year": 2011,
      "license": "published_methodology"
    },
    "tags": [
      "engineering",
      "tree"
    ],
    "slots": [
      {
        "label": "System Context",
        "entityTypeId": "bounded_context",
        "description": "The system and its external actors"
      },
      {
        "label": "Containers",
        "entityTypeId": "service",
        "description": "Applications, data stores, microservices"
      },
      {
        "label": "Components",
        "entityTypeId": "code_repository",
        "description": "Major structural building blocks inside a container"
      },
      {
        "label": "Code",
        "entityTypeId": "library_dependency",
        "description": "Classes, interfaces, implementation details"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "bounded_context",
          "role": "item"
        },
        {
          "type": "service",
          "role": "item"
        },
        {
          "type": "code_repository",
          "role": "item"
        },
        {
          "type": "library_dependency",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "tree"
    },
    "presentation": {
      "layout": {
        "type": "tree",
        "direction": "TB",
        "engine": "dagre"
      },
      "colour_by": "type",
      "collapsible": true,
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Document software architecture at four zoom levels (Context, Containers, Components, Code) so every stakeholder gets the diagram at the right level of detail.",
      "core_question": "Can every team member (from PM to engineer) understand our architecture at the level of detail they need?",
      "when_to_use": [
        "You need to structure complex technical decisions or architecture",
        "The engineering team needs alignment on technical approach",
        "You want to evaluate or improve engineering practices"
      ],
      "when_not_to_use": [
        "The technical solution is straightforward and well-understood",
        "You are building a throwaway prototype where architecture does not matter"
      ]
    }
  },
  {
    "id": "adr-log",
    "approach_ids": [
      "inspect"
    ],
    "name": "ADR Log",
    "version": "1.0.0",
    "description": "Architecture Decision Records: log decisions with context, options, and rationale.",
    "category": "engineering",
    "origin": {
      "type": "practitioner",
      "attribution": "Michael Nygard",
      "description": "Proposed by Michael Nygard in 2011 as \"Architecture Decision Records\". The lightweight template (Title, Status, Context, Decision, Consequences) has become a standard practice in software teams.",
      "url": "https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions",
      "year": 2011,
      "license": "published_methodology"
    },
    "tags": [
      "engineering",
      "table"
    ],
    "slots": [
      {
        "label": "Decision",
        "entityTypeId": "decision",
        "description": "Decision: decision entries to evaluate"
      },
      {
        "label": "Context",
        "entityTypeId": "bounded_context",
        "description": "Context: bounded context entries to evaluate"
      },
      {
        "label": "Options Considered",
        "entityTypeId": "solution",
        "description": "Options Considered: solution entries to evaluate"
      },
      {
        "label": "Consequences",
        "entityTypeId": "outcome",
        "description": "Consequences: outcome entries to evaluate"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "decision",
          "role": "item"
        },
        {
          "type": "bounded_context",
          "role": "item"
        },
        {
          "type": "solution",
          "role": "item"
        },
        {
          "type": "outcome",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Decision",
            "sortable": true
          },
          {
            "property": "title",
            "label": "Context",
            "sortable": true
          },
          {
            "property": "description",
            "label": "Options Considered"
          },
          {
            "property": "description",
            "label": "Consequences"
          }
        ]
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Record architectural decisions as lightweight, immutable documents (Context, Decision, Consequences). Future teams understand why the system is the way it is.",
      "core_question": "Why was this architectural decision made, what alternatives were considered, and what consequences did we accept?",
      "when_to_use": [
        "You need to structure complex technical decisions or architecture",
        "The engineering team needs alignment on technical approach",
        "You want to evaluate or improve engineering practices"
      ],
      "when_not_to_use": [
        "The technical solution is straightforward and well-understood",
        "You are building a throwaway prototype where architecture does not matter"
      ]
    }
  },
  {
    "id": "atomic-design",
    "approach_ids": [
      "trace"
    ],
    "name": "Atomic Design",
    "version": "1.0.0",
    "description": "Atoms, Molecules, Organisms, Templates, Pages: a methodology for creating design systems from the smallest elements up.",
    "category": "design",
    "origin": {
      "type": "practitioner",
      "attribution": "Brad Frost",
      "description": "Created by Brad Frost in 2013, inspired by chemistry. The five-level hierarchy (atoms → molecules → organisms → templates → pages) provides a mental model for building design systems from small, reusable parts.",
      "url": "https://bradfrost.com/blog/post/atomic-web-design/",
      "year": 2013,
      "license": "published_methodology"
    },
    "tags": [
      "design",
      "tree"
    ],
    "slots": [
      {
        "label": "Atoms",
        "entityTypeId": "design_component",
        "description": "Atoms: design component entities for this dimension of the framework"
      },
      {
        "label": "Molecules",
        "entityTypeId": "design_component",
        "description": "Molecules: design token entities for this dimension of the framework"
      },
      {
        "label": "Organisms",
        "entityTypeId": "design_pattern",
        "description": "Organisms: design pattern entities for this dimension of the framework"
      },
      {
        "label": "Templates",
        "entityTypeId": "wireframe",
        "description": "Templates: design system entities for this dimension of the framework"
      },
      {
        "label": "Pages",
        "entityTypeId": "screen",
        "description": "Pages: screen entities for this dimension of the framework"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "design_component",
          "role": "item"
        },
        {
          "type": "design_pattern",
          "role": "item"
        },
        {
          "type": "screen",
          "role": "item"
        },
        {
          "type": "wireframe",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "tree"
    },
    "presentation": {
      "layout": {
        "type": "tree",
        "direction": "TB",
        "engine": "dagre"
      },
      "colour_by": "type",
      "collapsible": true,
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Organise UI components into five levels (Atoms, Molecules, Organisms, Templates, Pages). Creates a shared vocabulary between design and engineering for building design systems.",
      "core_question": "Can our design system be decomposed into reusable atoms and molecules that compose predictably into every page?",
      "when_to_use": [
        "You need a structured approach to solve a complex design problem",
        "The team needs alignment on design process and principles",
        "You want to evaluate or improve existing design quality"
      ],
      "when_not_to_use": [
        "The design problem is straightforward and well-understood",
        "You are in a rapid prototyping phase where process would slow you down"
      ]
    }
  },
  {
    "id": "double-diamond",
    "approach_ids": [
      "plan"
    ],
    "name": "Double Diamond",
    "version": "1.0.0",
    "description": "Discover, Define, Develop, Deliver: a four-phase divergent/convergent design process.",
    "category": "design",
    "origin": {
      "type": "practitioner",
      "attribution": "British Design Council",
      "description": "Introduced by the British Design Council in 2005. Maps the design process as two connected diamonds: diverge to explore, converge to decide. Widely adopted across design, product, and innovation teams worldwide.",
      "url": "https://www.designcouncil.org.uk/our-resources/the-double-diamond/",
      "year": 2005,
      "license": "open_attribution"
    },
    "tags": [
      "design",
      "flow"
    ],
    "slots": [
      {
        "label": "Discover",
        "entityTypeId": "insight",
        "description": "Explore the problem space: research, observe, and interview users to understand unmet needs"
      },
      {
        "label": "Define",
        "entityTypeId": "design_question",
        "description": "Converge on the core problem: synthesise research into a clear problem statement"
      },
      {
        "label": "Develop",
        "entityTypeId": "design_concept",
        "description": "Diverge on solutions: ideate, prototype, and explore multiple approaches"
      },
      {
        "label": "Deliver",
        "entityTypeId": "prototype",
        "description": "Converge on the best solution: test, refine, and ship"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "design_question",
          "role": "item"
        },
        {
          "type": "design_concept",
          "role": "item"
        },
        {
          "type": "insight",
          "role": "item"
        },
        {
          "type": "prototype",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "flow"
    },
    "presentation": {
      "layout": {
        "type": "flow",
        "direction": "LR"
      },
      "colour_by": "status",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Guide teams through two cycles of divergent and convergent thinking: first to find the right problem, then to find the right solution.",
      "core_question": "How do we move from a fuzzy problem space to a tested solution through structured divergence and convergence?",
      "when_to_use": [
        "You need a structured approach to solve a complex design problem",
        "The team needs alignment on design process and principles",
        "You want to evaluate or improve existing design quality"
      ],
      "when_not_to_use": [
        "The design problem is straightforward and well-understood",
        "You are in a rapid prototyping phase where process would slow you down"
      ]
    }
  },
  {
    "id": "dora-metrics",
    "approach_ids": [
      "inspect"
    ],
    "name": "DORA Metrics",
    "version": "1.0.0",
    "description": "Four key metrics for software delivery performance: deployment frequency, lead time, change failure rate, and time to restore.",
    "category": "metrics",
    "origin": {
      "type": "practitioner",
      "attribution": "DORA Team (Google Cloud)",
      "description": "From Accelerate: The Science of Lean Software (IT Revolution Press). Based on 6 years of State of DevOps research.",
      "url": "https://dora.dev/",
      "year": 2018,
      "license": "open_attribution"
    },
    "tags": [
      "metrics",
      "collection"
    ],
    "slots": [
      {
        "label": "Delivery metric",
        "entityTypeId": "metric",
        "description": "One of the four DORA software-delivery performance metrics"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "metric",
          "role": "item"
        }
      ],
      "required_properties": {
        "metric": [
          {
            "property": "dora_metric",
            "type": "enum",
            "required": true,
            "label": "DORA metric",
            "description": "Which of the four DORA metrics this measures",
            "enum_values": [
              "deployment_frequency",
              "lead_time_for_changes",
              "change_failure_rate",
              "time_to_restore"
            ]
          },
          {
            "property": "performance_tier",
            "type": "enum",
            "required": false,
            "label": "Performance tier",
            "description": "Where this metric sits on the DORA elite-to-low benchmark",
            "enum_values": [
              "elite",
              "high",
              "medium",
              "low"
            ]
          }
        ]
      }
    },
    "structure": {
      "pattern": "collection"
    },
    "presentation": {
      "layout": {
        "type": "grid",
        "groupBy": "type"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Measure software delivery performance through four key metrics that predict both speed and stability, enabling data-driven engineering improvement.",
      "core_question": "How fast and how safely is our team shipping software, and where are the bottlenecks?",
      "when_to_use": [
        "You need to define what success looks like for your product or team",
        "Teams are optimising for different metrics that may conflict",
        "You want to move from vanity metrics to actionable measurements"
      ],
      "when_not_to_use": [
        "You lack the data infrastructure to track metrics reliably",
        "The product is too early for meaningful quantitative measurement"
      ]
    }
  },
  {
    "id": "shape-up",
    "approach_ids": [
      "plan"
    ],
    "name": "Shape Up",
    "version": "1.0.0",
    "description": "Basecamp's methodology: shape work into appetites, bet on 6-week cycles, and give teams full autonomy to deliver within fixed time, variable scope.",
    "category": "planning",
    "origin": {
      "type": "practitioner",
      "attribution": "Ryan Singer",
      "description": "Created at Basecamp (formerly 37signals) by Ryan Singer. Published as a free online book in 2019. Introduces the concepts of shaping, appetite, and six-week cycles as an alternative to Scrum sprints.",
      "url": "https://basecamp.com/shapeup",
      "year": 2019,
      "license": "published_methodology"
    },
    "tags": [
      "planning",
      "flow"
    ],
    "slots": [
      {
        "label": "Shaping",
        "entityTypeId": "feature",
        "description": "Define the problem and solution at the right level of abstraction: rough enough to leave room, specific enough to act on"
      },
      {
        "label": "Betting Table",
        "entityTypeId": "decision",
        "description": "Betting Table phase: decision entities move through this stage"
      },
      {
        "label": "Building (6-week cycle)",
        "entityTypeId": "epic",
        "description": "Building (6-week cycle) phase: epic entities move through this stage"
      },
      {
        "label": "Cooldown",
        "entityTypeId": "task",
        "description": "Two-week buffer for bug fixes, exploration, and preparing the next cycle's pitches"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "feature",
          "role": "item"
        },
        {
          "type": "epic",
          "role": "item"
        },
        {
          "type": "task",
          "role": "item"
        },
        {
          "type": "decision",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "flow"
    },
    "presentation": {
      "layout": {
        "type": "flow",
        "direction": "LR"
      },
      "colour_by": "status",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Frame work in fixed six-week cycles with shaped pitches, giving teams autonomy within appetite-bounded scope instead of open-ended backlogs.",
      "core_question": "What is the right appetite for this problem, and how do we shape a pitch that fits within that boundary?",
      "when_to_use": [
        "You need to coordinate work across multiple teams or time horizons",
        "Stakeholders need visibility into what is coming and when",
        "You want to balance commitments with flexibility"
      ],
      "when_not_to_use": [
        "The team is small enough that informal coordination works",
        "Plans would create false precision about uncertain outcomes"
      ]
    }
  },
  {
    "id": "pirate-metrics-aarrr",
    "approach_ids": [
      "trace"
    ],
    "name": "Pirate Metrics AARRR",
    "version": "1.0.0",
    "description": "Track user lifecycle across five stages: Acquisition, Activation, Retention, Revenue, and Referral.",
    "category": "growth",
    "origin": {
      "type": "practitioner",
      "attribution": "Dave McClure",
      "description": "Presented by Dave McClure at 500 Startups. Became the default growth metrics framework for startups.",
      "url": "https://www.slideshare.net/dmc500hats/startup-metrics-for-pirates-long-version",
      "year": 2007,
      "license": "open_attribution"
    },
    "tags": [
      "growth",
      "funnel"
    ],
    "slots": [
      {
        "label": "Lifecycle metric",
        "entityTypeId": "metric",
        "description": "A metric tracking one stage of the customer lifecycle funnel"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "metric",
          "role": "item"
        }
      ],
      "required_properties": {
        "metric": [
          {
            "property": "metric_category",
            "type": "enum",
            "required": true,
            "label": "Lifecycle stage",
            "description": "Which AARRR funnel stage this metric measures",
            "enum_values": [
              "acquisition",
              "activation",
              "retention",
              "revenue",
              "referral"
            ]
          }
        ]
      }
    },
    "structure": {
      "pattern": "funnel",
      "stages": [
        {
          "id": "acquisition",
          "label": "Acquisition",
          "order": 0,
          "entity_type": "metric"
        },
        {
          "id": "activation",
          "label": "Activation",
          "order": 1,
          "entity_type": "metric"
        },
        {
          "id": "retention",
          "label": "Retention",
          "order": 2,
          "entity_type": "metric"
        },
        {
          "id": "revenue",
          "label": "Revenue",
          "order": 3,
          "entity_type": "metric"
        },
        {
          "id": "referral",
          "label": "Referral",
          "order": 4,
          "entity_type": "metric"
        }
      ]
    },
    "presentation": {
      "layout": {
        "type": "funnel",
        "orientation": "vertical"
      },
      "colour_by": "status",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Track the five stages of the customer lifecycle (Acquisition, Activation, Retention, Revenue, Referral) to find and fix leaks in the growth funnel.",
      "core_question": "Where in the customer lifecycle are we losing users, and which stage offers the highest-leverage improvement?",
      "when_to_use": [
        "You need to systematically identify and optimise growth levers",
        "User acquisition, activation, or retention metrics need improvement",
        "You want to build a structured growth experimentation practice"
      ],
      "when_not_to_use": [
        "The product has not yet achieved product-market fit",
        "Growth would scale problems rather than value"
      ]
    }
  },
  {
    "id": "north-star-metric",
    "approach_ids": [
      "plan"
    ],
    "name": "North Star Metric",
    "version": "1.0.0",
    "description": "One metric that best captures the core value you deliver. Supported by 3-5 input metrics that drive it.",
    "category": "metrics",
    "origin": {
      "type": "practitioner",
      "attribution": "Sean Ellis / Amplitude",
      "description": "Popularised by Sean Ellis (Hacking Growth) and Amplitude. One metric that captures the core value you deliver.",
      "url": "https://amplitude.com/blog/north-star-metric",
      "year": 2017,
      "license": "open_attribution"
    },
    "tags": [
      "metrics",
      "collection"
    ],
    "slots": [
      {
        "label": "Metric",
        "entityTypeId": "metric",
        "description": "The North Star metric or one of its 3-5 input (driver) metrics"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "metric",
          "role": "item"
        }
      ],
      "required_properties": {
        "metric": [
          {
            "property": "designation",
            "type": "enum",
            "required": true,
            "label": "Metric role",
            "description": "Whether this is the single North Star or a driver that feeds it",
            "enum_values": [
              "north_star",
              "input"
            ]
          },
          {
            "property": "leverage",
            "type": "number",
            "required": false,
            "label": "Leverage",
            "description": "How strongly this input metric moves the North Star (input metrics only)"
          }
        ]
      }
    },
    "structure": {
      "pattern": "collection"
    },
    "presentation": {
      "layout": {
        "type": "grid",
        "groupBy": "type"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Identify the single metric that best captures the core value your product delivers to customers, aligning the entire organisation around sustainable growth.",
      "core_question": "What one metric, if it grows, proves we are delivering more value to more customers over time?",
      "when_to_use": [
        "You need to define what success looks like for your product or team",
        "Teams are optimising for different metrics that may conflict",
        "You want to move from vanity metrics to actionable measurements"
      ],
      "when_not_to_use": [
        "You lack the data infrastructure to track metrics reliably",
        "The product is too early for meaningful quantitative measurement"
      ]
    }
  },
  {
    "id": "marketing-mix-4ps",
    "approach_ids": [
      "plan"
    ],
    "name": "Marketing Mix 4Ps",
    "version": "1.0.0",
    "description": "The foundational marketing framework. Every marketing strategy must address four decisions: what to sell (Product), what to charge (Price), where to sell (Place), and how to promote (Promotion).",
    "category": "marketing",
    "origin": {
      "type": "practitioner",
      "attribution": "E. Jerome McCarthy",
      "description": "Basic Marketing: A Managerial Approach",
      "url": "https://en.wikipedia.org/wiki/Marketing_mix",
      "year": 1960,
      "license": "public_domain"
    },
    "tags": [
      "marketing",
      "collection"
    ],
    "slots": [
      {
        "label": "Product",
        "entityTypeId": "product",
        "description": "What you offer: features, quality, branding"
      },
      {
        "label": "Price",
        "entityTypeId": "proof_point",
        "description": "Pricing strategy and structure"
      },
      {
        "label": "Place",
        "entityTypeId": "marketing_channel",
        "description": "Distribution channels and availability"
      },
      {
        "label": "Promotion",
        "entityTypeId": "funnel_step",
        "description": "Advertising, PR, sales promotion, direct marketing"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "marketing_channel",
          "role": "item"
        },
        {
          "type": "product",
          "role": "item"
        },
        {
          "type": "proof_point",
          "role": "item"
        },
        {
          "type": "funnel_step",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "collection"
    },
    "presentation": {
      "layout": {
        "type": "grid",
        "groupBy": "type"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Evaluate the four foundational marketing levers (Product, Price, Place, Promotion). Ensure they are aligned and working together.",
      "core_question": "Are our product offering, pricing, distribution, and promotion working in harmony, or are they pulling in different directions?",
      "when_to_use": [
        "You need to structure your marketing strategy and messaging",
        "You want to align marketing activities with product positioning",
        "You are entering a new market or launching a new product"
      ],
      "when_not_to_use": [
        "The product is pre-launch with no audience to market to",
        "Marketing strategy is well-established and performing"
      ]
    }
  },
  {
    "id": "bullseye-framework",
    "approach_ids": [
      "plan"
    ],
    "name": "Bullseye Framework",
    "version": "1.0.0",
    "description": "Test 19 traction channels systematically. Start with the outer ring (what's possible), narrow to the middle ring (what's probable), then focus on the inner ring (what's working). Run cheap tests across all channels to find your bullseye.",
    "category": "growth",
    "origin": {
      "type": "practitioner",
      "attribution": "Weinberg & Mares",
      "description": "Traction: How Any Startup Can Achieve Explosive Customer Growth",
      "url": "https://www.amazon.com/Traction-Startup-Achieve-Explosive-Customer/dp/1591848369",
      "year": 2015,
      "license": "published_methodology"
    },
    "tags": [
      "growth",
      "funnel"
    ],
    "slots": [
      {
        "label": "Outer Ring",
        "entityTypeId": "acquisition_channel",
        "description": "All 19 traction channels brainstormed"
      },
      {
        "label": "Middle Ring",
        "entityTypeId": "acquisition_channel",
        "description": "Top 6 channels worth testing"
      },
      {
        "label": "Inner Ring",
        "entityTypeId": "acquisition_channel",
        "description": "Top 3 channels to focus on"
      },
      {
        "label": "Traction Test",
        "entityTypeId": "growth_campaign",
        "description": "Cheap test for each channel"
      },
      {
        "label": "Bullseye Channel",
        "entityTypeId": "acquisition_channel",
        "description": "The single best-performing channel"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "acquisition_channel",
          "role": "item"
        },
        {
          "type": "growth_campaign",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "funnel"
    },
    "presentation": {
      "layout": {
        "type": "funnel",
        "orientation": "vertical"
      },
      "colour_by": "status",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Systematically test all 19 traction channels to find the one or two that drive scalable growth, avoiding premature commitment to a favourite channel.",
      "core_question": "Which of the 19 traction channels is our bullseye, the one that works at our current stage and scale?",
      "when_to_use": [
        "You need to systematically identify and optimise growth levers",
        "User acquisition, activation, or retention metrics need improvement",
        "You want to build a structured growth experimentation practice"
      ],
      "when_not_to_use": [
        "The product has not yet achieved product-market fit",
        "Growth would scale problems rather than value"
      ]
    }
  },
  {
    "id": "product-led-growth-framework",
    "approach_ids": [
      "plan"
    ],
    "name": "PLG Framework",
    "version": "1.0.0",
    "description": "Product-led go-to-market motion. Free entry gives users access, the aha moment hooks them, they expand usage within their team, and monetisation captures value from power users.",
    "category": "go_to_market",
    "origin": {
      "type": "practitioner",
      "attribution": "Wes Bush",
      "description": "Coined and formalised by Wes Bush in \"Product-Led Growth\" (2019). The framework describes how the product itself drives acquisition, activation, and expansion, reducing dependence on sales-led motions.",
      "url": "https://www.productled.com/",
      "year": 2019,
      "license": "published_methodology"
    },
    "tags": [
      "go_to_market",
      "flow"
    ],
    "slots": [
      {
        "label": "Free Entry",
        "entityTypeId": "gtm_strategy",
        "description": "How users access the product for free"
      },
      {
        "label": "Aha Moment",
        "entityTypeId": "gtm_strategy",
        "description": "First experience of core value"
      },
      {
        "label": "Expansion Motion",
        "entityTypeId": "sales_motion",
        "description": "How usage spreads within accounts"
      },
      {
        "label": "Monetisation Trigger",
        "entityTypeId": "gtm_strategy",
        "description": "When and how to convert to paid"
      },
      {
        "label": "Metric",
        "entityTypeId": "metric",
        "description": "Key metric driving the PLG motion"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "gtm_strategy",
          "role": "item"
        },
        {
          "type": "sales_motion",
          "role": "item"
        },
        {
          "type": "metric",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "flow"
    },
    "presentation": {
      "layout": {
        "type": "flow",
        "direction": "LR"
      },
      "colour_by": "status",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Design the product itself as the primary growth driver (free tier, self-serve onboarding, in-product virality) to reduce dependence on sales-led acquisition.",
      "core_question": "Can our product acquire, activate, and expand users without human intervention, and where in the loop do we still need sales?",
      "when_to_use": [
        "You are launching a new product, feature, or entering a new market",
        "You need to coordinate cross-functional launch activities",
        "You want to define target customers, channels, and messaging"
      ],
      "when_not_to_use": [
        "The product is mature with established distribution channels",
        "You are iterating on an existing product for existing customers"
      ]
    }
  },
  {
    "id": "okr-framework",
    "approach_ids": [
      "plan"
    ],
    "name": "OKR Framework",
    "version": "1.0.0",
    "description": "Set ambitious Objectives and measure progress with Key Results. Cascades from company to team to individual.",
    "category": "strategy",
    "origin": {
      "type": "practitioner",
      "attribution": "Andy Grove / John Doerr",
      "description": "Invented by Andy Grove at Intel, popularised by John Doerr in Measure What Matters (Portfolio/Penguin).",
      "url": "https://www.whatmatters.com/",
      "year": 1999,
      "license": "open_attribution"
    },
    "tags": [
      "strategy",
      "tree"
    ],
    "slots": [
      {
        "label": "Objective",
        "entityTypeId": "objective",
        "description": "Qualitative, inspiring goal"
      },
      {
        "label": "Key Result 1",
        "entityTypeId": "key_result",
        "description": "Measurable outcome proving progress"
      },
      {
        "label": "Key Result 2",
        "entityTypeId": "key_result",
        "description": "Measurable outcome proving progress"
      },
      {
        "label": "Initiatives",
        "entityTypeId": "initiative",
        "description": "Work streams that drive key results"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "objective",
          "role": "item"
        },
        {
          "type": "key_result",
          "role": "item"
        },
        {
          "type": "initiative",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "tree"
    },
    "presentation": {
      "layout": {
        "type": "tree",
        "direction": "TB",
        "engine": "dagre"
      },
      "colour_by": "type",
      "collapsible": true,
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Align teams around measurable outcomes by pairing ambitious Objectives with concrete Key Results, creating focus and accountability at every level.",
      "core_question": "What must we achieve this quarter, and how will we know we succeeded?",
      "when_to_use": [
        "You need to align the team on long-term direction",
        "Market conditions are shifting and you need to reassess positioning",
        "Leadership needs a structured view of strategic options"
      ],
      "when_not_to_use": [
        "You are in pure execution mode with a clear strategy already set",
        "The team is too early-stage to commit to strategic constraints"
      ]
    }
  },
  {
    "id": "raci-matrix",
    "approach_ids": [
      "inspect"
    ],
    "name": "RACI Matrix",
    "version": "1.0.0",
    "description": "Assign roles: Responsible, Accountable, Consulted, Informed for each activity.",
    "category": "team_process",
    "origin": {
      "type": "practitioner",
      "description": "Standard project management tool for role clarity. Origins in 1950s management science.",
      "license": "cc_by"
    },
    "tags": [
      "team_process",
      "matrix"
    ],
    "slots": [
      {
        "label": "Activity",
        "entityTypeId": "key_activity",
        "description": "Place persona entities in the Activity position of the matrix"
      },
      {
        "label": "Responsible",
        "entityTypeId": "role",
        "description": "Does the work"
      },
      {
        "label": "Accountable",
        "entityTypeId": "role",
        "description": "Makes the final call"
      },
      {
        "label": "Consulted",
        "entityTypeId": "role",
        "description": "Gives input"
      },
      {
        "label": "Informed",
        "entityTypeId": "role",
        "description": "Kept in the loop"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "key_activity",
          "role": "item"
        },
        {
          "type": "role",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 2,
        "cols": 3
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Assign Responsible, Accountable, Consulted, and Informed roles for every deliverable so there are no ambiguity gaps and no duplicate ownership.",
      "core_question": "For every key deliverable, does exactly one person own the decision (A), and does everyone know their role (R, C, or I)?",
      "when_to_use": [
        "You need to improve team collaboration, clarity, or effectiveness",
        "Roles and responsibilities are unclear or causing friction",
        "You want to establish or improve team processes and ceremonies"
      ],
      "when_not_to_use": [
        "The team is small and informal coordination works well",
        "Process overhead would slow down a team that needs speed"
      ]
    }
  },
  {
    "id": "retrospective",
    "approach_ids": [
      "reflect"
    ],
    "name": "Retrospective",
    "version": "1.0.0",
    "description": "Reflect on what went well, what didn't, and what to change. Classic agile ceremony.",
    "category": "team_process",
    "origin": {
      "type": "practitioner",
      "attribution": "Esther Derby & Diana Larsen",
      "description": "Core agile ceremony. Formalised in Agile Retrospectives (Pragmatic Bookshelf) by Esther Derby & Diana Larsen.",
      "year": 2006,
      "license": "published_methodology"
    },
    "tags": [
      "team_process",
      "matrix"
    ],
    "slots": [
      {
        "label": "What Went Well",
        "entityTypeId": "outcome",
        "description": "Practices to continue"
      },
      {
        "label": "What Didn't Go Well",
        "entityTypeId": "need",
        "description": "Issues to address"
      },
      {
        "label": "Action Items",
        "entityTypeId": "learning",
        "description": "Changes for next iteration"
      },
      {
        "label": "Learnings",
        "entityTypeId": "learning",
        "description": "Insights to carry forward"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "learning",
          "role": "bucket"
        },
        {
          "type": "need",
          "role": "bucket"
        },
        {
          "type": "outcome",
          "role": "bucket"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "matrix"
    },
    "presentation": {
      "layout": {
        "type": "matrix",
        "rows": 2,
        "cols": 2
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Reflect on the last iteration as a team: what went well, what did not, what to try next. Creates a continuous improvement habit.",
      "core_question": "What should we start doing, stop doing, and continue doing to work better together?",
      "when_to_use": [
        "You need to improve team collaboration, clarity, or effectiveness",
        "Roles and responsibilities are unclear or causing friction",
        "You want to establish or improve team processes and ceremonies"
      ],
      "when_not_to_use": [
        "The team is small and informal coordination works well",
        "Process overhead would slow down a team that needs speed"
      ]
    }
  },
  {
    "id": "metrics-tree",
    "approach_ids": [
      "trace"
    ],
    "name": "Metrics Tree",
    "version": "1.0.0",
    "description": "A hierarchical decomposition of a north-star metric into driver metrics and input metrics, making it clear which levers teams can pull to move the top-level outcome.",
    "category": "data_analytics",
    "origin": {
      "type": "practitioner",
      "attribution": "Amplitude/Reforge",
      "description": "Popularised by Amplitude and Reforge around 2018 as growth teams needed to decompose north star metrics into actionable component metrics and identify the highest-leverage improvement opportunities.",
      "url": "https://amplitude.com/blog/north-star-metric",
      "year": 2018,
      "license": "open_attribution"
    },
    "tags": [
      "data_analytics",
      "tree"
    ],
    "slots": [
      {
        "label": "Metric",
        "entityTypeId": "metric",
        "description": "A measurable indicator at any level of the tree: north star at the root, driver and input metrics as children"
      },
      {
        "label": "Outcome",
        "entityTypeId": "outcome",
        "description": "The business or product outcome the north-star metric is designed to represent"
      },
      {
        "label": "Dashboard",
        "entityTypeId": "dashboard",
        "description": "Dashboard visualising the metrics tree and showing real-time progress across levels"
      },
      {
        "label": "Report",
        "entityTypeId": "report",
        "description": "Periodic report analysing movement across the tree and attributing changes to specific inputs"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "metric",
          "role": "item"
        },
        {
          "type": "outcome",
          "role": "root"
        },
        {
          "type": "dashboard",
          "role": "item"
        },
        {
          "type": "report",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "tree"
    },
    "presentation": {
      "layout": {
        "type": "tree",
        "direction": "TB",
        "engine": "dagre"
      },
      "colour_by": "type",
      "collapsible": true,
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Decompose a top-level business metric into its component parts and drivers, creating a tree that shows exactly which levers move the number.",
      "core_question": "What are the component metrics that drive our north star, and which lever has the most headroom for improvement?",
      "when_to_use": [
        "You need to structure your data architecture or analytics practice",
        "Data quality, governance, or accessibility is a problem",
        "You want to move from ad-hoc analysis to systematic data practices"
      ],
      "when_not_to_use": [
        "The product generates minimal data that does not warrant formal practices",
        "You are in very early stage where data infrastructure is premature"
      ]
    }
  },
  {
    "id": "team-health-check",
    "approach_ids": [
      "inspect"
    ],
    "name": "Team Health Check",
    "version": "1.0.0",
    "description": "A facilitated team self-assessment across dimensions like mission, fun, learning, speed, and support, using traffic-light voting to surface strengths and improvement areas in a safe format.",
    "category": "team_process",
    "origin": {
      "type": "practitioner",
      "attribution": "Spotify / Kniberg",
      "description": "Popularised by Spotify and Henrik Kniberg's Squad Health Check model (2014). Teams self-assess health across dimensions like mission clarity, psychological safety, speed, and learning.",
      "url": "https://engineering.atspotify.com/2014/09/squad-health-check-model/",
      "year": 2014,
      "license": "open_attribution"
    },
    "tags": [
      "team_process",
      "table"
    ],
    "slots": [
      {
        "label": "Team",
        "entityTypeId": "team",
        "description": "Team conducting the health check; all members vote anonymously on each dimension"
      },
      {
        "label": "Retrospective",
        "entityTypeId": "retrospective",
        "description": "Health check session results feeding into the retrospective discussion and action items"
      },
      {
        "label": "Metric",
        "entityTypeId": "metric",
        "description": "Health dimension scored, e.g. delivering value, teamwork, fun, learning, mission clarity, speed"
      },
      {
        "label": "Team OKR",
        "entityTypeId": "team_okr",
        "description": "Team OKR or improvement goal derived from consistently red health check dimensions"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "team",
          "role": "scored_item"
        },
        {
          "type": "retrospective",
          "role": "item"
        },
        {
          "type": "metric",
          "role": "item"
        },
        {
          "type": "team_okr",
          "role": "item"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Team",
            "sortable": true
          },
          {
            "property": "title",
            "label": "Retrospective",
            "sortable": true
          },
          {
            "property": "description",
            "label": "Metric"
          },
          {
            "property": "title",
            "label": "Team OKR",
            "sortable": true
          }
        ]
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Regularly assess team health across dimensions (psychological safety, autonomy, mission clarity, fun, speed, learning) to catch problems early and celebrate strengths.",
      "core_question": "How is the team really doing: where do they feel strong, where do they feel stuck, and what has changed since last check?",
      "when_to_use": [
        "You need to improve team collaboration, clarity, or effectiveness",
        "Roles and responsibilities are unclear or causing friction",
        "You want to establish or improve team processes and ceremonies"
      ],
      "when_not_to_use": [
        "The team is small and informal coordination works well",
        "Process overhead would slow down a team that needs speed"
      ]
    }
  },
  {
    "id": "raid-log",
    "approach_ids": [
      "inspect"
    ],
    "name": "RAID Log",
    "version": "1.0.0",
    "description": "A project management register tracking Risks, Assumptions, Issues, and Dependencies, the four categories most likely to derail a project if left unmanaged.",
    "category": "program_mgmt",
    "origin": {
      "type": "practitioner",
      "description": "Standard project management tool used across methodologies. The RAID log (Risks, Assumptions, Issues, Dependencies) provides a single living document for tracking all factors that could derail a programme.",
      "license": "cc_by"
    },
    "tags": [
      "program_mgmt",
      "table"
    ],
    "slots": [
      {
        "label": "Risk Register",
        "entityTypeId": "risk_register",
        "description": "Risk or assumption logged with likelihood, impact, owner, and mitigation strategy"
      },
      {
        "label": "Risk",
        "entityTypeId": "risk",
        "description": "Individual risk scored by probability and impact; severity = probability * impact"
      },
      {
        "label": "Dependency",
        "entityTypeId": "dependency",
        "description": "Dependency on another team, system, or deliverable that could block progress if not resolved"
      },
      {
        "label": "Status Report",
        "entityTypeId": "status_report",
        "description": "Status update summarising RAID log changes: new risks, resolved issues, and dependency updates"
      },
      {
        "label": "Deliverable",
        "entityTypeId": "deliverable",
        "description": "Deliverable affected by logged risks, issues, or dependencies, linking RAID items to project scope"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "risk_register",
          "role": "item"
        },
        {
          "type": "risk",
          "role": "scored_item"
        },
        {
          "type": "dependency",
          "role": "item"
        },
        {
          "type": "status_report",
          "role": "item"
        },
        {
          "type": "deliverable",
          "role": "item"
        }
      ],
      "required_properties": {
        "risk": [
          {
            "property": "probability",
            "type": "number",
            "required": true,
            "label": "Probability",
            "description": "Likelihood the risk materialises (risk.probability assessment)"
          },
          {
            "property": "impact",
            "type": "number",
            "required": true,
            "label": "Impact",
            "description": "Consequence severity if the risk materialises (risk.impact assessment)"
          }
        ]
      },
      "computed_properties": [
        {
          "property": "severity",
          "expression": "probability * impact",
          "entity_type": "risk",
          "label": "Severity",
          "format": "number"
        }
      ]
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Item",
            "sortable": true
          },
          {
            "property": "description",
            "label": "Category"
          },
          {
            "property": "status",
            "label": "Status"
          },
          {
            "property": "description",
            "label": "Owner / Action"
          }
        ]
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Track Risks, Assumptions, Issues, and Dependencies in a single living document so the project manager sees all potential blockers in one place.",
      "core_question": "What are the current risks, untested assumptions, open issues, and external dependencies that could derail this programme?",
      "when_to_use": [
        "You are managing complex, multi-team initiatives with dependencies",
        "You need to track risks, decisions, and milestones across workstreams",
        "Stakeholders need visibility into programme-level progress"
      ],
      "when_not_to_use": [
        "The project is small enough for a single team to manage",
        "Formal programme management would create overhead without value"
      ]
    }
  },
  {
    "id": "ice-scoring",
    "approach_ids": [
      "prioritise"
    ],
    "name": "ICE Scoring",
    "version": "1.0.0",
    "description": "Rate ideas by Impact, Confidence, and Ease on a 1-10 scale. Multiply for a composite score. Fast and lightweight.",
    "category": "prioritization",
    "origin": {
      "type": "practitioner",
      "attribution": "Sean Ellis",
      "description": "Created by Sean Ellis as a lightweight growth experiment scoring method. Widely adopted in growth teams.",
      "year": 2010,
      "license": "open_attribution"
    },
    "tags": [
      "prioritization",
      "table"
    ],
    "slots": [
      {
        "label": "Items to score",
        "entityTypeId": "feature",
        "description": "Features or experiments being evaluated"
      },
      {
        "label": "Impact",
        "entityTypeId": "outcome",
        "description": "How much will this move the needle?"
      },
      {
        "label": "Confidence",
        "entityTypeId": "assumption",
        "description": "How sure are we about the impact?"
      },
      {
        "label": "Ease",
        "entityTypeId": "feature",
        "description": "How easy is this to implement?"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "feature",
          "role": "scored_item"
        },
        {
          "type": "outcome",
          "role": "item"
        },
        {
          "type": "assumption",
          "role": "item"
        }
      ],
      "required_properties": {
        "feature": [
          {
            "property": "impact",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Impact",
            "description": "Expected impact on the target metric (1-10)"
          },
          {
            "property": "confidence",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Confidence",
            "description": "Confidence in the impact estimate (1-10)"
          },
          {
            "property": "ease",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Ease",
            "description": "Ease of implementation (1-10)"
          }
        ]
      },
      "computed_properties": [
        {
          "property": "ice_score",
          "expression": "impact * confidence * ease",
          "entity_type": "feature",
          "label": "ICE Score",
          "format": "number"
        }
      ]
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Items to score",
            "sortable": true
          },
          {
            "property": "impact",
            "label": "Impact",
            "sortable": true
          },
          {
            "property": "confidence",
            "label": "Confidence",
            "sortable": true
          },
          {
            "property": "ease",
            "label": "Ease",
            "sortable": true
          }
        ]
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Provide a lightweight scoring model for early-stage ideas when detailed effort estimates are unavailable. Faster than RICE and useful for brainstorm triage.",
      "core_question": "Which ideas should we investigate further based on their potential impact, confidence in our assumptions, and implementation ease?",
      "when_to_use": [
        "You have more ideas or features than capacity to build them",
        "Stakeholders disagree on what to build next",
        "You need a transparent, defensible prioritisation process"
      ],
      "when_not_to_use": [
        "You have a single obvious next step with no contention",
        "The backlog is small enough to sequence intuitively"
      ]
    }
  },
  {
    "id": "wsjf",
    "approach_ids": [
      "prioritise"
    ],
    "name": "WSJF (Weighted Shortest Job First)",
    "version": "1.0.0",
    "description": "Prioritise work by dividing Cost of Delay (user value + time criticality + risk reduction) by job duration to maximise economic throughput.",
    "category": "planning",
    "origin": {
      "type": "practitioner",
      "attribution": "Reinertsen / SAFe",
      "description": "Developed by Don Reinertsen and adopted as a core practice in the Scaled Agile Framework (SAFe). Combines urgency (Cost of Delay) with job size to produce an economic prioritisation sequence.",
      "url": "https://www.scaledagileframework.com/wsjf/",
      "year": 2011,
      "license": "open_attribution"
    },
    "tags": [
      "planning",
      "table"
    ],
    "slots": [
      {
        "label": "Backlog Items",
        "entityTypeId": "feature",
        "description": "Backlog Items: feature entries to evaluate"
      },
      {
        "label": "User/Business Value",
        "entityTypeId": "metric",
        "description": "User/Business Value: metric entries to evaluate"
      },
      {
        "label": "Time Criticality",
        "entityTypeId": "metric",
        "description": "How much value decays if delivery is delayed (deadlines, competition, seasonal windows)"
      },
      {
        "label": "Risk Reduction / Opportunity Enablement",
        "entityTypeId": "metric",
        "description": "Risk Reduction / Opportunity Enablement: metric entries to evaluate"
      },
      {
        "label": "Job Size",
        "entityTypeId": "metric",
        "description": "Estimated effort (story points, t-shirt size, or person-weeks)"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "feature",
          "role": "scored_item"
        },
        {
          "type": "metric",
          "role": "item"
        }
      ],
      "required_properties": {
        "feature": [
          {
            "property": "user_value",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "User/Business Value",
            "description": "Relative value to users and the business if delivered"
          },
          {
            "property": "time_criticality",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Time Criticality",
            "description": "How much value decays if delivery is delayed (deadlines, competition, seasonal windows)"
          },
          {
            "property": "risk_reduction",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Risk Reduction / Opportunity Enablement",
            "description": "Value from reducing risk or enabling future opportunities"
          },
          {
            "property": "job_size",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Job Size",
            "description": "Estimated effort (story points, t-shirt size, or person-weeks)"
          }
        ]
      },
      "computed_properties": [
        {
          "property": "wsjf_score",
          "expression": "(user_value + time_criticality + risk_reduction) / job_size",
          "entity_type": "feature",
          "label": "WSJF Score",
          "format": "number"
        }
      ]
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Backlog Items",
            "sortable": true
          },
          {
            "property": "user_value",
            "label": "User/Business Value",
            "sortable": true
          },
          {
            "property": "time_criticality",
            "label": "Time Criticality",
            "sortable": true
          },
          {
            "property": "risk_reduction",
            "label": "Risk Reduction / Opportunity Enablement",
            "sortable": true
          },
          {
            "property": "job_size",
            "label": "Job Size",
            "sortable": true
          },
          {
            "property": "wsjf_score",
            "label": "WSJF Score",
            "sortable": true
          }
        ]
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Prioritise work by dividing the Cost of Delay by job duration, ensuring the most time-sensitive, valuable items are done first.",
      "core_question": "Considering the cost of waiting, which items should we start now to maximise economic benefit?",
      "when_to_use": [
        "You need to coordinate work across multiple teams or time horizons",
        "Stakeholders need visibility into what is coming and when",
        "You want to balance commitments with flexibility"
      ],
      "when_not_to_use": [
        "The team is small enough that informal coordination works",
        "Plans would create false precision about uncertain outcomes"
      ]
    }
  },
  {
    "id": "cost-of-delay",
    "approach_ids": [
      "prioritise"
    ],
    "name": "Cost of Delay",
    "version": "1.0.0",
    "description": "Quantify the economic cost of not shipping a feature to drive priority decisions. Combines urgency with value.",
    "category": "prioritization",
    "origin": {
      "type": "practitioner",
      "attribution": "Don Reinertsen",
      "description": "Formalised in The Principles of Product Development Flow (Celeritas Publishing). Foundational to lean product economics.",
      "year": 2009,
      "license": "public_domain"
    },
    "tags": [
      "prioritization",
      "table"
    ],
    "slots": [
      {
        "label": "Items to evaluate",
        "entityTypeId": "feature",
        "description": "Features or initiatives being assessed"
      },
      {
        "label": "User-Business Value",
        "entityTypeId": "outcome",
        "description": "Revenue, retention, or strategic value"
      },
      {
        "label": "Time Criticality",
        "entityTypeId": "metric",
        "description": "How much value decays with delay"
      },
      {
        "label": "Risk Reduction",
        "entityTypeId": "risk",
        "description": "What risk does this mitigate?"
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "feature",
          "role": "scored_item"
        },
        {
          "type": "metric",
          "role": "item"
        },
        {
          "type": "outcome",
          "role": "item"
        },
        {
          "type": "risk",
          "role": "item"
        }
      ],
      "required_properties": {
        "feature": [
          {
            "property": "cost_of_delay",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Cost of Delay",
            "description": "Weekly revenue impact of not shipping"
          },
          {
            "property": "job_size",
            "type": "number",
            "required": true,
            "scope": "framework",
            "label": "Job Size",
            "description": "Weeks of development effort"
          }
        ]
      },
      "computed_properties": [
        {
          "property": "wsjf_score",
          "expression": "cost_of_delay / job_size",
          "entity_type": "feature",
          "label": "WSJF Score",
          "format": "number"
        }
      ]
    },
    "structure": {
      "pattern": "table"
    },
    "presentation": {
      "layout": {
        "type": "table",
        "columns": [
          {
            "property": "title",
            "label": "Items to evaluate",
            "sortable": true
          },
          {
            "property": "cost_of_delay",
            "label": "User-Business Value",
            "sortable": true
          },
          {
            "property": "job_size",
            "label": "Job Size",
            "sortable": true
          },
          {
            "property": "wsjf_score",
            "label": "CoD Score",
            "sortable": true
          }
        ]
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "type",
      "card_fields": [
        "title",
        "description",
        "status"
      ]
    },
    "education": {
      "purpose": "Quantify the economic impact of not delivering a feature by a given date, making urgency visible and enabling time-sensitive prioritisation.",
      "core_question": "How much value are we losing every week this feature is not in production, and does that urgency justify fast-tracking it?",
      "when_to_use": [
        "You have more ideas or features than capacity to build them",
        "Stakeholders disagree on what to build next",
        "You need a transparent, defensible prioritisation process"
      ],
      "when_not_to_use": [
        "You have a single obvious next step with no contention",
        "The backlog is small enough to sequence intuitively"
      ]
    }
  },
  {
    "id": "five-whys",
    "approach_ids": [
      "reflect",
      "inspect"
    ],
    "name": "Five Whys",
    "version": "1.0.0",
    "description": "Iteratively ask \"why?\", typically five times, starting from a symptom; each answer becomes the subject of the next question. The chain of answers reveals the underlying root cause behind the surface problem.",
    "category": "team_process",
    "origin": {
      "type": "practitioner",
      "attribution": "Sakichi Toyoda / Toyota Production System",
      "description": "Developed within the Toyota Production System as a root-cause analysis technique. Popularised through Lean and Six Sigma practice; now a widely used incident-review and design-debug staple.",
      "year": 1930,
      "license": "public_domain"
    },
    "tags": [
      "team_process",
      "reflection",
      "root_cause",
      "tree"
    ],
    "slots": [
      {
        "label": "Symptom",
        "entityTypeId": "need",
        "description": "The observed problem the analysis starts from."
      },
      {
        "label": "Why chain",
        "entityTypeId": "insight",
        "description": "Each \"why?\" answer along the chain, typically five iterations deep."
      },
      {
        "label": "Root cause",
        "entityTypeId": "insight",
        "description": "The terminal answer at the bottom of the chain: the underlying cause to address."
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "need",
          "role": "root"
        },
        {
          "type": "insight",
          "role": "branch"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "tree"
    },
    "presentation": {
      "layout": {
        "type": "tree",
        "direction": "TB"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Move past surface symptoms by chaining \"why?\" questions until the underlying root cause surfaces, so fixes target the real driver rather than a downstream effect.",
      "core_question": "Why is this happening, and why is THAT happening, until we reach a cause we can act on?",
      "when_to_use": [
        "A problem keeps recurring after surface fixes",
        "Post-incident review where the obvious cause feels too obvious",
        "Designing a fix and you want to confirm you understand the actual driver"
      ],
      "when_not_to_use": [
        "The problem has multiple independent root causes (use a fishbone or richer RCA tool)",
        "You need quantitative attribution rather than a single-thread narrative",
        "Five linear \"whys\" oversimplify a systems problem with feedback loops"
      ]
    }
  },
  {
    "id": "pre-mortem",
    "approach_ids": [
      "reflect"
    ],
    "name": "Pre-mortem",
    "version": "1.0.0",
    "description": "Imagine the project has already failed; work backward listing the plausible causes of the failure. Produce a risk register and matching mitigations before the work starts.",
    "category": "team_process",
    "origin": {
      "type": "practitioner",
      "attribution": "Gary Klein",
      "description": "Popularised by Gary Klein in Harvard Business Review (2007) as a prospective-hindsight technique. Inverts the post-mortem: imagine failure first, then list causes, while there is still time to act.",
      "url": "https://hbr.org/2007/09/performing-a-project-premortem",
      "year": 2007,
      "license": "published_methodology"
    },
    "tags": [
      "team_process",
      "reflection",
      "risk",
      "collection"
    ],
    "slots": [
      {
        "label": "Imagined failures",
        "entityTypeId": "risk",
        "description": "Plausible failure modes named as if they had already occurred."
      },
      {
        "label": "Causes",
        "entityTypeId": "insight",
        "description": "For each imagined failure, the contributing causes the team can foresee."
      },
      {
        "label": "Mitigations",
        "entityTypeId": "initiative",
        "description": "Mitigation actions the team will take before failure can occur."
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "risk",
          "role": "bucket"
        },
        {
          "type": "insight",
          "role": "bucket"
        },
        {
          "type": "initiative",
          "role": "bucket"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "collection"
    },
    "presentation": {
      "layout": {
        "type": "grid",
        "groupBy": "type"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Surface project risks early by inverting hindsight: imagine the project has already failed and ask why, while there is still time to mitigate.",
      "core_question": "It is six months from now and the project has failed catastrophically. What happened, and why?",
      "when_to_use": [
        "Kicking off a project with significant downside or irreversible commitment",
        "A plan looks too clean and the team senses unspoken concerns",
        "Stakeholders disagree on risk; the exercise externalises and ranks them"
      ],
      "when_not_to_use": [
        "The work is small, reversible, and cheap to course-correct",
        "The team is in execution mode and reflective ceremonies will derail momentum",
        "Risk surfacing has become performative: the team names risks but never mitigates them"
      ]
    }
  },
  {
    "id": "red-team",
    "approach_ids": [
      "reflect",
      "inspect"
    ],
    "name": "Red Team",
    "version": "1.0.0",
    "description": "Structured adversarial review. A designated group is assigned to attack a plan, design, or proposal from an outside-in stance, surfacing weaknesses the inside-out builders cannot see.",
    "category": "team_process",
    "origin": {
      "type": "practitioner",
      "attribution": "US Department of Defense (Cold War era); broadened by security and intelligence practice",
      "description": "Originated in Cold War-era military strategic exercises (\"red\" team takes the adversary role against the \"blue\" team's defence). Adopted by cybersecurity, intelligence analysis, and product teams as a structured contrarian-review practice.",
      "year": 1960,
      "license": "public_domain"
    },
    "tags": [
      "team_process",
      "reflection",
      "adversarial",
      "collection"
    ],
    "slots": [
      {
        "label": "Target",
        "entityTypeId": "initiative",
        "description": "The plan, design, or proposal under adversarial review."
      },
      {
        "label": "Attack vectors",
        "entityTypeId": "risk",
        "description": "The angles the red team uses to probe weaknesses."
      },
      {
        "label": "Findings",
        "entityTypeId": "insight",
        "description": "Weaknesses, blind spots, or unstated assumptions surfaced by the review."
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "initiative",
          "role": "root"
        },
        {
          "type": "risk",
          "role": "bucket"
        },
        {
          "type": "insight",
          "role": "bucket"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "collection"
    },
    "presentation": {
      "layout": {
        "type": "grid",
        "groupBy": "type"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Stress-test a plan against an explicit adversary by assigning reviewers to attack rather than agree, so weaknesses surface before reality finds them.",
      "core_question": "If a competent adversary wanted this to fail, where would they push first, and would we hold?",
      "when_to_use": [
        "A high-stakes decision, launch, or security posture needs hardening",
        "Inside-out thinking is dominant and dissent has gone quiet",
        "Risk register is suspiciously short for the size of the bet"
      ],
      "when_not_to_use": [
        "Early-stage exploration where adversarial framing would crush a fragile idea prematurely",
        "Team trust is too low: red-teaming will read as personal attack rather than role-play",
        "The work is small enough that a lightweight devil's-advocate pass is sufficient"
      ]
    }
  },
  {
    "id": "devils-advocate",
    "approach_ids": [
      "reflect"
    ],
    "name": "Devil's Advocate",
    "version": "1.0.0",
    "description": "Designate one reviewer to formally take the opposing position regardless of personal view. The assigned-role contrarian defangs groupthink by making dissent legitimate and structured.",
    "category": "team_process",
    "origin": {
      "type": "practitioner",
      "attribution": "Roman Catholic Church (advocatus diaboli); broadened by decision-quality practice",
      "description": "Originated in 16th-century canonisation proceedings as the advocatus diaboli, an official assigned to argue against canonising a candidate. Adopted by decision-science and product-team practice as a structured antidote to groupthink.",
      "year": 1587,
      "license": "public_domain"
    },
    "tags": [
      "team_process",
      "reflection",
      "decision_quality",
      "collection"
    ],
    "slots": [
      {
        "label": "Proposal",
        "entityTypeId": "initiative",
        "description": "The plan or recommendation under consideration."
      },
      {
        "label": "Opposing arguments",
        "entityTypeId": "insight",
        "description": "The case against the proposal, voiced by the assigned contrarian regardless of personal view."
      },
      {
        "label": "Counter-evidence",
        "entityTypeId": "evidence",
        "description": "Data points the contrarian raises that the proposal does not yet account for."
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "initiative",
          "role": "root"
        },
        {
          "type": "insight",
          "role": "bucket"
        },
        {
          "type": "evidence",
          "role": "bucket"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "collection"
    },
    "presentation": {
      "layout": {
        "type": "grid",
        "groupBy": "type"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "colour_by": "group",
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Make dissent a legitimate role rather than a personal stance. Assigning one reviewer to argue against the proposal forces the team to confront the strongest counter-case.",
      "core_question": "If we had to argue against this proposal (not because we believe it, but because the role demands it) what is the strongest case?",
      "when_to_use": [
        "A decision is heading toward consensus and you suspect groupthink",
        "Stakes are high and the team has not heard a serious counter-argument",
        "Cultural norms make raw dissent costly; assigning the role lowers the social cost"
      ],
      "when_not_to_use": [
        "Genuine disagreement already exists in the room (let it surface; do not theatricalise it)",
        "The decision is small enough that the ceremony costs more than the insight returned",
        "The assigned contrarian will be punished socially for the role; set the norms first or skip"
      ]
    }
  },
  {
    "id": "second-order-thinking",
    "approach_ids": [
      "reflect"
    ],
    "name": "Second-order Thinking",
    "version": "1.0.0",
    "description": "After deciding a move, ask \"and then what?\" repeatedly. Trace second-, third-, and higher-order consequences to surface downstream effects that first-order reasoning misses.",
    "category": "team_process",
    "origin": {
      "type": "practitioner",
      "attribution": "Howard Marks / Charlie Munger",
      "description": "Howard Marks distinguished first-order vs second-order thinking in The Most Important Thing (2011) as the essential discipline of consequential decision-making. Charlie Munger's \"and then what?\" framing is the practical heuristic.",
      "url": "https://www.oaktreecapital.com/insights/memo/dare-to-be-great-ii",
      "year": 2011,
      "license": "published_methodology"
    },
    "tags": [
      "team_process",
      "reflection",
      "consequences",
      "tree"
    ],
    "slots": [
      {
        "label": "First-order move",
        "entityTypeId": "decision",
        "description": "The decision or move under consideration."
      },
      {
        "label": "Second-order consequences",
        "entityTypeId": "insight",
        "description": "Downstream effects that follow from the first-order move."
      },
      {
        "label": "Higher-order consequences",
        "entityTypeId": "insight",
        "description": "Third-, fourth-, fifth-order ripples: second-order consequences of the second-order consequences."
      }
    ],
    "data": {
      "entity_types": [
        {
          "type": "decision",
          "role": "root"
        },
        {
          "type": "insight",
          "role": "branch"
        }
      ],
      "required_properties": {}
    },
    "structure": {
      "pattern": "tree"
    },
    "presentation": {
      "layout": {
        "type": "tree",
        "direction": "TB"
      },
      "sort_by": {
        "property": "title",
        "direction": "asc"
      },
      "card_fields": [
        "title",
        "description"
      ]
    },
    "education": {
      "purpose": "Resist first-order reasoning by chaining \"and then what?\" until non-obvious downstream consequences come into view.",
      "core_question": "If we make this move and it works, what does the world look like next, and is that the world we want?",
      "when_to_use": [
        "A decision has feedback loops, market reactions, or behavioural ripples",
        "The first-order case is compelling, which is exactly when downstream effects bite",
        "Considering an irreversible or large-scale commitment"
      ],
      "when_not_to_use": [
        "Routine, reversible, low-blast-radius decisions where deliberation costs more than mistakes",
        "Higher-order branches diverge into pure speculation with no anchor in evidence",
        "Time pressure makes a deeper trace expensive and the first-order call is good enough"
      ]
    }
  }
] as UPGFramework[]

/** Framework lookup by ID */
export const UPG_FRAMEWORKS_BY_ID: Record<string, UPGFramework> = Object.fromEntries(
  UPG_FRAMEWORKS.map((fw) => [fw.id, fw]),
)

/** Frameworks grouped by category */
export const UPG_FRAMEWORKS_BY_CATEGORY: Record<string, UPGFramework[]> = {}
for (const fw of UPG_FRAMEWORKS) {
  if (!UPG_FRAMEWORKS_BY_CATEGORY[fw.category]) UPG_FRAMEWORKS_BY_CATEGORY[fw.category] = []
  UPG_FRAMEWORKS_BY_CATEGORY[fw.category].push(fw)
}
