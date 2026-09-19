---
name: headroom
description: "Token budget watchdog that calculates token saturation and triggers automated compaction before the model degrades past the 150k Smart Zone."
---

# Headroom: Context Budget Watchdog

## Purpose
Prevent context degradation and memory hallucinations by tracking active token consumption.

## Rules
1. **Smart Zone Ceiling:** Keep working memory under ~150k tokens.
2. **Compaction Trigger:** When approaching the ceiling, trigger `/handoff` or `/compact` at the nearest phase boundary.
3. **Selective Ingestion:** Prefer targeted file viewing over bulk whole-codebase reads.
