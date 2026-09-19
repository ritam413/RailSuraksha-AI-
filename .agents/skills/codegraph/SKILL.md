---
name: codegraph
description: "AST-driven codebase dependency and call-graph analyzer. Use to trace function callers, blast radiuses, type hierarchies, and import graphs before making non-trivial refactors or fixing hard bugs."
---

# CodeGraph: Codebase AST & Dependency Analyzer

## Purpose
Before modifying any shared function, type, or module, determine its exact caller blast radius.

## Procedure
1. **Grep Call Sites:**
   Identify all files importing and invoking the target symbol.
2. **Trace Caller Hierarchy:**
   Build the upstream call graph to ensure a single shared fix covers all call sites (per `/ponytail` root-cause rule).
3. **Verify Type Seams:**
   Check interface and schema dependencies in `src/types/` before changing data models.
