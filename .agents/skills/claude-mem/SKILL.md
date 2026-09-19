---
name: claude-mem
description: "Cross-session semantic memory and persistent entity store for preserving architectural decisions, domain models, and developer preferences across conversations."
---

# Claude-Mem: Cross-Session Semantic Memory

## Purpose
Preserve high-leverage architectural patterns and invariants across conversations without requiring re-explanation.

## Workflow
1. **On Session Start:** Load committed domain invariants from `context.md`.
2. **On Architectural Shift:** Record the underlying decision and rationale in `context.md` and `tracker.md`.
3. **On Session Close:** Synthesize current state into persistent handoff files.
