---
name: context7
description: "High-density context window slicing, AST chunk retrieval, and semantic compression. Injects only the most relevant code slices to minimize prompt token consumption."
repository: "https://github.com/chroma-core/chroma"
---

# Context7: High-Density Context Window Slicer

## Official Ecosystem References
- **Vector & Chunking Foundation:** [`chroma-core/chroma`](https://github.com/chroma-core/chroma) & [`langchain-ai/langchain`](https://github.com/langchain-ai/langchain)
- **Token Budget Companion:** [`headroom`](file:///c:/Users/LENOVO/Downloads/railwaysurakshai/.agents/skills/headroom/SKILL.md)

## Mental Model
Dumping full 1,000-line source files into working memory dilutes attention and burns token budgets rapidly. `context7` extracts only the relevant function definitions, interface boundaries, and symbol signatures required for the immediate task.

```
[Target File (800 lines)] ──► [Context7 AST Slicer] ──► [Focused Chunk: Seams & Types (35 lines)]
```

## Slicing Directives

1. **Interface Seams First:**
   - When inspecting contracts, load only exported types and function signatures (`src/types/apiContracts.ts`) rather than full mock data generator implementations.
2. **Line Range Precision:**
   - Use targeted `view_file` with `StartLine` and `EndLine` slices rather than whole-file ingestion.
3. **Chunk Caching:**
   - Retain sliced context in session working memory across adjacent turns without re-reading the entire file.
