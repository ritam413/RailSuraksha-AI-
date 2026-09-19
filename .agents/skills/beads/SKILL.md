---
name: beads
description: "Behavior-Driven Agent Design System (BEADS). Scaffolds modular, testable, and contract-driven sub-agent pipelines with strict state machine boundaries and typed contracts."
---

# BEADS: Behavior-Driven Agent Design System

## Mental Model
BEADS treats complex agentic behaviors as composable, deterministic "beads on a string." Each agent or subagent is defined by an invariant input contract, an isolated state machine, explicit error recovery bounds, and a strictly typed output schema.

```
[Agent Trigger] ──► [Pre-Condition Contract] ──► [Deterministic Action Loop] ──► [Post-Condition Invariant] ──► [Downstream Bead]
```

## Core Principles

1. **Explicit Boundary Contracts:**
   - Every sub-agent must declare its exact input dependencies and output artifacts.
   - No implicit global state sharing; all handoffs occur through structured schemas.

2. **State Machine Isolation:**
   - Agents operate in bounded execution phases (e.g., `PLAN` → `EXECUTE` → `VERIFY` → `HANDOFF`).
   - Transitions between phases require passing validation gates.

3. **Behavior-Driven Specification (Given / When / Then):**
   - **Given:** System state, active files, and user intent.
   - **When:** Sub-agent executes its designated capability.
   - **Then:** Output artifact matches schema and passes automated verification.

4. **Fail-Fast & Rollback:**
   - When a bead violates an invariant, execution halts immediately with actionable diagnostic output instead of cascading silent failures.

## Agent Bead Specification Template

When designing sub-agents or multi-agent workflows, format each agent bead as:

```markdown
### Bead: [Agent Name / Role]
- **Role:** Specific operational responsibility
- **Input Contract:** Expected parameters, files, or schema
- **Permitted Tools:** Whitelist of allowed tool calls
- **State Invariants:** Pre-conditions and post-conditions
- **Output Artifact:** JSON, Markdown, or code diff produced
- **Error Handler:** Fallback escalation or retry policy
```

## Workflow Integration
- **Upstream:** Triggered by `/ask-matt` or `claude-code-route` during multi-agent task decomposition.
- **Parallel Execution:** Chains seamlessly with `multica` for collaborative deliberation.
- **Verification:** Paired with `/tdd` and `/adversarial-review` to test individual agent behaviors.
