---
name: graphify
description: "Visual knowledge and architecture graph generator. Renders interactive node diagrams, dependency DAGs, and subsystem topologies from codebase ASTs."
repository: "https://github.com/mermaid-js/mermaid"
---

# Graphify: Architecture & Knowledge Graph Visualizer

## Official Ecosystem References
- **Diagram Engines:** [`mermaid-js/mermaid`](https://github.com/mermaid-js/mermaid) & [`d3/d3`](https://github.com/d3/d3)
- **Codebase Mapping:** [`codegraph`](file:///c:/Users/LENOVO/Downloads/railwaysurakshai/.agents/skills/codegraph/SKILL.md)

## Mental Model
Complex software systems and multi-agent loops are difficult to comprehend in pure text. `graphify` transforms file dependencies, API contract flows, and multi-agent interaction pipelines into clear, structured Mermaid and ASCII node graphs.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Component A │ ──► │  Contract X  │ ──► │  Backend API │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Graphing Directives

1. **Deterministic Syntax:**
   - Always quote labels containing special characters or punctuation (e.g., `id["Label (Extra Info)"]`).
   - Use strict flowchart topologies: `TD` (Top-Down) for hierarchy, `LR` (Left-Right) for pipelines and time sequences.
2. **Subsystem Isolation:**
   - Use Mermaid `subgraph` blocks to visually demarcate client UI, backend FastAPI services, and pure-TS physics agents.
3. **Artifact Embedding:**
   - Embed architecture diagrams directly inside `implementation_plan.md`, `walkthrough.md`, and `docs/`.
