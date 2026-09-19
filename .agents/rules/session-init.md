# Session Initialization, Multi-Agent Router & Intent Dispatch Rule

This rule executes on Turn 1 of every new session or when an agent begins work in this workspace.

---

## 1. Zero-Turn Context Hygiene & Budget Watchdog

1. **Token Saturation Watchdog (`headroom`):**
   - Continuously monitor working memory against the ~150k token Smart Zone ceiling.
   - If approaching the threshold, automatically trigger context compaction or handoff.
2. **High-Density AST Context Slicing (`context7`):**
   - Ingest only targeted function signatures, type contracts, and line ranges (`view_file` with `StartLine`/`EndLine`) instead of polluting context with entire multi-thousand line files.
3. **Semantic & Vector Memory Recall (`claude-mem` + `agentmemory`):**
   - Silently recall domain models from `context.md` and ChromaDB vector store before querying the user for known facts.
4. **Prompt Scaffolding & Zero-Slop Standard (`system-prompts-ai` + `/humanizer`):**
   - Strip conversational filler, hedging, and sycophancy. Enforce strict output schema conformance.
5. **On-Demand (Lazy) MCP Server Policy (`awesome-mcp-servers`):**
   - NEVER pre-download or run all MCP servers simultaneously upfront.
   - Activate ONLY the single specific MCP server required by the active session mode on-demand via `npx -y`.

---

## 2. Dynamic Intent Classification (`claude-code-route`)

Upon receiving the user prompt, `claude-code-route` classifies intent across 6 operational archetypes:

```
                                  [Incoming User Prompt]
                                             │
                                             ▼
                                   [claude-code-route]
                                             │
      ┌───────────────┬──────────────────────┼──────────────────────┬────────────────┐
      ▼               ▼                      ▼                      ▼                ▼
 [Fast Fix]    [Feature / TDD]       [Architectural]          [UI / Motion]     [Security]
(Level 1 - 2)   (Level 2 - 3)         (Level 4 - 5)           (Level 2 - 3)    (Level 3 - 4)
```

---

## 3. Fast-Path Gating vs. Interactive Choice Modal

### A. Fast-Path Bypass (Direct Implementation & Bug Hunting)
If the user's prompt contains an explicit instruction with concrete file paths, specific function/variable names, or a direct bug fix:
- **Do NOT show the modal.**
- **Fast-Path Pipeline:**
  1. `serena` / `codegraph`: Index semantic references and caller blast radius.
  2. `context7`: Slice target function boundaries.
  3. `/diagnosing-bugs`: Construct a tight, failing feedback loop first.
  4. `/ponytail (full)`: Enforce shortest working diff with stdlib/native primitives.
  5. `/10x-dev` + `addyosmani-perf`: Optimize hot paths for $O(1)$ lookups and zero DOM layout thrashing.
  6. `playwright-mcp`: Run headless browser verification if UI or state was touched.

### B. Interactive Bootstrap Modal (Open / Complex / Planning Starts)
If the prompt is a greeting, broad initiative, new feature concept, or ambiguous request, immediately invoke the `ask_question` tool:

- **Question:** "What would you like to accomplish in this session?"
- **Options:**
  1. "(Recommended) Plan a new project / epic architecture (claude-code-route + beads + multica + Wayfinder + Council + Graphify)"
  2. "Fast feature development & test-driven implementation (wshobson-agents + Codegraph + Context7 + TDD + Ponytail + 10x-Dev)"
  3. "UI/UX design, component crafting & motion engineering (Taste + Awesome-Design + UI-UX-Pro-Max + Impeccable + Animate + AddyOsmani-Perf)"
  4. "Security audit, red-teaming & adversarial stress test (wshobson-agents [Security] + Adversarial Review + Awesome-MCP-Servers + Playwright)"
  5. "Deep codebase research & documentation synthesis (Repomix + Firecrawl + Serena + Research + Headroom)"

---

## 4. Master Multi-Agent Execution Workflows

### Mode 1: Strategic Planning & Architecture (Epic Flow)
- **Engine:** `claude-code-route` $\to$ `beads` $\to$ `multica` $\to$ `/wayfinder` $\to$ `/council-review` $\to$ `graphify`
- **Execution:**
  1. `repomix` / `serena` indexes repo symbols and module seams.
  2. `firecrawl` / `awesome-mcp-servers` crawls live external docs or API specifications.
  3. `beads` decomposes requirements into contract-isolated agent beads.
  4. `multica` + `/council-review --jury` resolves high-stakes design trade-offs via 5-advisor debate.
  5. `graphify` renders visual Mermaid architecture DAGs into `implementation_plan.md`.
  6. `wayfinder` pins decision tickets to `vibe-kanban` and `tracker.md`.

### Mode 2: Test-Driven Feature Delivery (Builder Flow)
- **Engine:** `wshobson-agents [Architect/Dev/QA]` $\to$ `codegraph` $\to$ `context7` $\to$ `/tdd` $\to$ `/ponytail` $\to$ `/10x-dev`
- **Execution:**
  1. `wshobson-agents [Architect]` defines interface seams in `src/types/apiContracts.ts`.
  2. `context7` extracts targeted type slices to keep context lean.
  3. `wshobson-agents [QA]` writes failing red tests in `tests/` (`/tdd`).
  4. `wshobson-agents [Developer]` writes green minimal implementation using `/ponytail`.
  5. `wshobson-agents [Staff Optimizer]` applies `/10x-dev` ($O(1)$, async concurrency).
  6. `playwright-mcp` executes headless E2E verification.

### Mode 3: World-Class Frontend & Motion (Design Flow)
- **Engine:** `/taste` $\to$ `/awesome-design` $\to$ `ui-ux-pro-max` $\to$ `/impeccable` $\to$ `/animate` $\to$ `addyosmani-perf` $\to$ `playwright-mcp`
- **Execution:**
  1. `/taste` calibrates design dials (`VARIANCE`, `MOTION`, `DENSITY`).
  2. `/awesome-design` + `ui-ux-pro-max` injects brand tokens (`DESIGN.md`, zero-pill geometry).
  3. `/impeccable shape` structures semantic hierarchy and accessibility states.
  4. `/animate` implements 60fps GPU compositor motion (`transform`, `opacity`).
  5. `addyosmani-perf` audits INP/LCP and eliminates layout thrashing.
  6. `playwright-mcp` captures visual snapshots across desktop and mobile viewports.

### Mode 4: Security Hardening & Red-Teaming (Defender Flow)
- **Engine:** `wshobson-agents [Security Lead]` $\to$ `/adversarial-review` $\to$ `awesome-mcp-servers` $\to$ `playwright-mcp`
- **Execution:**
  1. Attacks proposed code across `--security`, `--logic`, `--user`, and `--scale`.
  2. Uses `awesome-mcp-servers` (e.g. Sentry/Postgres MCP) to check live telemetry and database constraints.
  3. Probes for race conditions, auth bypass, unhandled nulls, and memory leaks.
  4. Validates every finding with a reproducible sketch before remediation.

### Mode 5: Deep Research & Knowledge Packaging
- **Engine:** `repomix` $\to$ `firecrawl` $\to$ `serena` $\to$ `/research` $\to$ `headroom` $\to$ `/humanizer`
- **Execution:**
  1. `repomix` packs repository context with precise token counters.
  2. `serena` discovers non-obvious cross-module references.
  3. `firecrawl` pulls primary-source doc portals into clean LLM-ready markdown.
  4. `/humanizer` strips AI jargon, generating publication-ready briefing docs.

---

## 5. Mandatory Memory & Handoff Integrity
Before concluding any session:
1. Update `context.md` for architectural changes.
2. Update `features_implemented.md` for feature additions or status transitions.
3. Append a structured entry to `tracker.md` (Agent Handoff Log).
