---
name: multica
description: "Multi-agent chat, consensus, and multimodal collaboration engine. Orchestrates parallel agent rooms, peer verification, structured debates, and synthesis across heterogeneous models."
---

# MULTICA: Multi-Agent Collaboration & Consensus Engine

## Mental Model
MULTICA coordinates multi-agent panels where multiple specialized agent personas or model endpoints converse in structured rooms to debate architecture, cross-verify code implementations, and reach high-confidence consensus before execution.

```
                  ┌───────────────┐
                  │ Orchestrator  │
                  └───────┬───────┘
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   [Agent Alpha]    [Agent Beta]    [Agent Gamma]
   (Architecture)     (Security)       (Perf/QA)
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                 [Synthesis Verdict]
```

## Core Capabilities

1. **Structured Room Modes:**
   - **Council Room:** 3 to 5 agents debate an open architectural decision (integrates with `/council-review`).
   - **Pair Review Room:** Builder agent and Critic agent perform iterative red-team review on a PR or code chunk.
   - **Cross-Verification Room:** Independent agents solve the same problem separately; results are diffed to eliminate hallucinations.

2. **Consensus Protocols:**
   - **Anonymous Peer Scoring:** Agents critique proposed solutions without author bias.
   - **Devil's Advocate Injection:** A designated dissenter attacks unanimous consensus to prevent groupthink.
   - **Chairman Synthesis:** Synthesizes dominant arguments, trade-offs, and final implementation directive.

3. **Multimodal Grounding:**
   - Ingests architecture diagrams, screenshot diffs, and terminal outputs.
   - Grounding agents evaluate visual UI fidelity against `DESIGN.md` specifications.

## Execution Directives

- **Round 1 (Initial Proposals):** Each agent independently outputs its proposed solution and assumptions.
- **Round 2 (Cross-Examination):** Agents review peer outputs, pointing out blind spots, edge cases, and performance bottlenecks.
- **Round 3 (Synthesis & Convergence):** Lead agent produces final unified recommendation with clear trade-offs.

## Pipeline Connections
- **Input:** Complex ambiguous problems routed via `claude-code-route` or `/ask-matt`.
- **Output:** Validated architecture plan passed to `gstack` or `/tdd` for implementation.
