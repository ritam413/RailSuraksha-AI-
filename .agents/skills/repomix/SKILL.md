---
name: repomix
description: "Pack an entire repository or sub-directory into a single, AI-optimized, token-counted XML/Markdown file using Repomix. Use when preparing full repository context for LLMs, cross-service analysis, or external council reviews."
---

# Repomix Codebase Packager

Use this skill to pack the current codebase into a single compact context file.

## Usage

Run via CLI command in project root:
```bash
npx repomix --style xml --output repomix-output.xml
```

Or for markdown formatting:
```bash
npx repomix --style markdown --output repomix-output.md
```

## Key Directives:
1. **Exclude Bloat:** Always ensure `node_modules`, `.git`, `dist`, `build`, and `.next` are ignored.
2. **Token Efficiency:** Repomix outputs exact token counts per file to help monitor the ~150k token Smart Zone limit.
3. **Downstream Pipeline:** Pass the output file to `/council-review` or `/adversarial-review` for deep multi-file analysis.
