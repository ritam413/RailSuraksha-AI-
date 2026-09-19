---
name: agentmemory
description: "Multi-agent shared episodic & semantic vector memory engine. Stores persistent cross-agent memories, past bug resolution traces, and domain invariants."
repository: "https://github.com/agentops-ai/agentmemory"
---

# AgentMemory: Multi-Agent Episodic & Semantic Vector Store

## Official Ecosystem References
- **Official Repository:** [`agentops-ai/agentmemory`](https://github.com/agentops-ai/agentmemory) (Python Package: `pip install agentmemory`)
- **Memory Invariant Companion:** [`claude-mem`](file:///c:/Users/LENOVO/Downloads/railwaysurakshai/.agents/skills/claude-mem/SKILL.md) & [`context.md`](file:///c:/Users/LENOVO/Downloads/railwaysurakshai/context.md)

## Mental Model
`agentmemory` provides persistent vector and key-value memory across agent executions. It enables agents to remember past debugging breakthroughs, recurring anti-patterns, and domain invariants across independent subagent instances.

```
┌──────────────────┐               ┌────────────────────────┐
│   Agent Subtask  │ ──(store/query)►│  Persistent Chroma DB  │ ──► [Long-Term Semantic Recall]
└──────────────────┘               └────────────────────────┘
```

## Python Client Usage

```python
from agentmemory import (
    create_memory,
    get_memories,
    search_memories,
    wipe_category
)

# Store an architectural invariant
create_memory(
    category="domain_invariants",
    text="RDSO Section 14B requires SHA-256 sealed 4-step explainable audit logs for all emergency brake interventions.",
    metadata={"source": "context.md", "domain": "safety"}
)

# Search relevant past memory
results = search_memories(category="domain_invariants", search_term="stopping distance formula")
```

## Directives
1. **Episodic Logging:** Record non-obvious bug root-causes and fixes to prevent future regression.
2. **Deterministic Retrieval:** Cross-check semantic memories against active source code before applying modifications.
