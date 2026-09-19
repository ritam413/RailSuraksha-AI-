---
name: serena
description: "Semantic codebase search, natural language symbol indexing, and cross-module code discovery engine. Locates non-obvious functional dependencies and shared patterns."
repository: "https://github.com/sourcegraph/cody"
---

# Serena: Semantic Codebase Discovery & Search Engine

## Official Ecosystem References
- **Repository Architecture:** [`sourcegraph/cody`](https://github.com/sourcegraph/cody) & [`tree-sitter/tree-sitter`](https://github.com/tree-sitter/tree-sitter)
- **AST Static Companion:** [`codegraph`](file:///c:/Users/LENOVO/Downloads/railwaysurakshai/.agents/skills/codegraph/SKILL.md)

## Mental Model
Where exact grep searches fail on synonyms, refactored variables, or conceptual logic (e.g. *"where do we calculate the stopping distance?"* vs `calculateEmergencyBrakingDistance`), `serena` indexes semantic meaning across functions and comments.

```
[Natural Language Query] ──► [Semantic Embeddings Index] ──► [Ranked File & Seam Pointers]
```

## Core Workflows

1. **Conceptual Discovery:**
   - Find existing implementations before creating redundant helper modules (adheres to `/ponytail` rule #2: *"Already in this codebase?"*).
2. **Blast Radius Semantic Audit:**
   - Identify which consumer components rely on a particular data format or mathematical formulation before modifying schemas.
3. **Pattern Replication:**
   - Find existing canonical examples of Mintlify cards, modal dialogs, or API endpoints to clone styling and error handling.
