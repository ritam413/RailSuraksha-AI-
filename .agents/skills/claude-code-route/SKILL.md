---
name: claude-code-route
description: "Dynamic intent-based model and skill chain router. Classifies incoming requests, calculates token budgets, and maps tasks to the most cost-effective model tier and execution pipeline."
---

# Claude-Code-Route: Dynamic Intent & Model Router

## Mental Model
Not every prompt requires the highest-latency reasoning model or an exhaustive 5-agent deliberation. `claude-code-route` acts as an intelligent traffic controller that analyzes incoming requests, maps them to the optimal execution archetype, and routes them through the appropriate skill chain.

```
[User Request]
       │
       ▼
┌─────────────────────────┐
│ Intent Classification   │
│ & Complexity Assessment │
└────────────┬────────────┘
             │
 ┌───────────┼───────────────────────────┐
 ▼           ▼                           ▼
[Fast Path] [Standard Implementation]   [Deep Architectural Review]
(1-file fix) (TDD + YAGNI + Review)     (Council + Red-Team + Multi-Agent)
```

## Routing Archetypes & Skill Chains

| Intent / Archetype | Typical Request | Optimal Model / Tier | Chained Skill Sequence |
| :--- | :--- | :--- | :--- |
| **Fast Fix / Trivial** | "Fix typo", "format table", "export type" | Fast / Low Latency | `/ponytail lite` → Direct edit |
| **Feature Implementation** | "Add block hold metric", "build modal" | Frontier Standard | `/tdd` → `/ponytail` → `/10x-dev` |
| **Diagnostic & Bug Hunt** | "Why is SSE dropping?", "Race condition" | Reasoning / Diagnostic | `/diagnosing-bugs` → `codegraph` → `/tdd` |
| **Architectural / Epic** | "Design multi-corridor sync", "Refactor auth" | Reasoning / Council | `/ask-matt` → `/wayfinder` → `/council-review` → `beads` |
| **UI Polish & Motion** | "Improve landing screen", "animate cards" | Multimodal / Frontend | `/awesome-design` → `/taste` → `/impeccable` → `/animate` |
| **Security & Hardening** | "Audit API endpoint", "Pre-deployment check" | Adversarial Specialist | `/adversarial-review` → `wshobson-agents (Security)` |

## Routing Directives

1. **Complexity Scoring (1–5):**
   - **Level 1 (Direct Action):** ≤ 1 file modified, zero architectural ambiguity $\to$ Fast path execution.
   - **Level 2 (Standard Task):** 2–3 files, clear requirements $\to$ TDD + Ponytail.
   - **Level 3 (Cross-Module):** Multiple modules, state flow affected $\to$ Plan + Codegraph + TDD.
   - **Level 4 (Architectural):** Core abstractions or contracts changing $\to$ Council review + beads decomposition.
   - **Level 5 (System Refactor):** Monorepo-wide migration $\to$ Wayfinder cartography + Multi-session handoffs.

2. **Budget Watchdog Hook:**
   - Feeds context size and step metrics directly to `headroom`.
   - Triggers session compaction or handoff when token saturation reaches critical thresholds.
