---
name: awesome-mcp-servers
description: "Master directory and configuration guide for production Model Context Protocol (MCP) servers (PostgreSQL, GitHub, Brave Search, Memory, Filesystem, Sentry, Redis, Docker)."
repository: "https://github.com/punkpeye/awesome-mcp-servers"
---

# Awesome-MCP-Servers: Production MCP Catalog

## Official Ecosystem References
- **Primary Catalog:** [`punkpeye/awesome-mcp-servers`](https://github.com/punkpeye/awesome-mcp-servers)
- **Official Specification:** [`modelcontextprotocol/servers`](https://github.com/modelcontextprotocol/servers)

## Mental Model
Model Context Protocol (MCP) servers act as standardized sidecars connecting AI agents to real-world infrastructure, databases, browser automation, and developer tools without writing custom proprietary API wrappers.

```
┌──────────────────┐               ┌──────────────────┐
│   Agent Client   │ ──(MCP stdio)──►│   MCP Server     │ ──► [Database / Docker / API]
└──────────────────┘               └──────────────────┘
```

## Top Recommended MCP Servers by Use-Case

| Category | Server Name | Repository / Package | Primary Capability |
| :--- | :--- | :--- | :--- |
| **Browser & E2E** | `playwright-mcp` | `@executeautomation/playwright-mcp-server` | Headless browser navigation, snapshotting & form filling |
| **Code & Repo** | `github-mcp` | `@modelcontextprotocol/server-github` | PR review, branch management, issue tracking |
| **Databases** | `postgres-mcp` | `@modelcontextprotocol/server-postgres` | Read-only & parameterized SQL query execution |
| **Web Search** | `brave-search` | `@modelcontextprotocol/server-brave-search` | Primary-source web research & real-time docs lookup |
| **Memory** | `memory-mcp` | `@modelcontextprotocol/server-memory` | Knowledge graph entity & relation extraction |
| **Monitoring** | `sentry-mcp` | `@modelcontextprotocol/server-sentry` | Real-time crash telemetry & error stack trace triage |

## Agent Directives
- **Zero Hallucinated APIs:** When interacting with external databases or services, consult the appropriate MCP server schema rather than hardcoding speculative API calls.
- **Least-Privilege Security:** Keep production MCP servers scoped to read-only or staged dry-run environments.
