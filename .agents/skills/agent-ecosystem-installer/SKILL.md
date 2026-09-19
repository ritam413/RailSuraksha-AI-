---
name: agent-ecosystem-installer
description: "Distributable NPX bootstrapper CLI (setup-agentic-workflow). Installs all 65+ multi-agent skills, 5-mode intent router, and persistent memory handoff files into any workspace or global environment."
repository: "https://github.com/ritam413/RailSuraksha-AI-"
---

# Agent-Ecosystem-Installer (`setup-agentic-workflow`)

## Mental Model
`agent-ecosystem-installer` is a standalone, distributable CLI that bootstraps any new project or machine with the complete 65+ skill multi-agent ecosystem, the 5-mode intent router, and persistent memory handoff tracking in under **1 second** with zero external network dependencies.

```
┌────────────────────────────────────────────────────────┐
│             npx setup-agentic-workflow                 │
├────────────────────────────────────────────────────────┤
│ 1. Scaffolds .agents/skills/ with 65+ curated skills   │
│ 2. Generates .agents/rules/session-init.md (5 modes)   │
│ 3. Generates context.md, tracker.md, features.md       │
│ 4. Deploys to ~/.gemini/config/ for global persistence │
└────────────────────────────────────────────────────────┘
```

## CLI Usage

### 1. Interactive Mode (UI Wizard)
```bash
npx setup-agentic-workflow
```

### 2. Fast Non-Interactive Modes
```bash
# Install to current workspace only
npx setup-agentic-workflow --workspace --yes

# Install globally to ~/.gemini/config/
npx setup-agentic-workflow --global --yes

# Install full suite (workspace + global)
npx setup-agentic-workflow --all --yes
```

## Local Development & Testing
```bash
# Build standalone bundle
cd packages/setup-agentic-workflow && npm run build

# Test locally
node packages/setup-agentic-workflow/dist/index.js --help
```
