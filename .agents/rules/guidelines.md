---
trigger: always_on
---

Agent Project Memory & Handoff Rules

This repository uses three persistent Markdown files to preserve project knowledge across coding-agent sessions:

context.md — project architecture, conventions, constraints, and stable knowledge.
features_implemented.md — current functionality and implementation status.
tracker.md — agent handoff log containing recent work, current state, remaining work, and instructions for the next agent.

These files are the project's persistent memory.

Mandatory Rule

Every meaningful repository change MUST be reflected in the appropriate tracking files before the task is considered complete.

Do not rely on conversation history as persistent project memory.

A new agent should be able to read these files and understand:

What the project does.
How it is structured.
What functionality exists.
What was recently changed.
Why changes were made.
What is currently in progress.
What remains unfinished.
Known issues or blockers.
What the next agent should do.

The purpose is to prevent unnecessary full-codebase rereading.

Required Files

The following files must exist at the project root:

context.md
features_implemented.md
tracker.md


If they do not exist, create them before substantial project work.

context.md

context.md contains the stable, high-level understanding of the project.

Document:

Project purpose.
Architecture.
Important directories/modules.
Technology stack.
Data flow.
API structure.
Database structure.
Authentication/authorization.
Important dependencies.
Coding conventions.
Configuration requirements.
Deployment conventions.
Important constraints.
Major architectural decisions.
Do not use it as a changelog

Do not record every bug fix, variable rename, small UI change, or minor refactor.

Update it when the project's long-term understanding changes.

Examples:

Major architecture changes.
New architectural patterns.
Authentication redesign.
Database architecture changes.
New important external services.
Significant API decisions.
New conventions or constraints.
features_implemented.md

features_implemented.md describes the current functionality of the application.

It should answer:

What can the application currently do?

For each meaningful feature, document:

Feature name.
Status.
What it does.
Important implementation details.
Relevant files/modules.
Verification/tests.
Known limitations.

Recommended statuses:

Planned
In Progress
Implemented
Partially Implemented
Deprecated
Removed


This is not a chronological changelog. Keep it focused on the current state.

When a feature changes, update its existing description/status rather than creating unnecessary historical entries.

tracker.md — Agent Handoff Log
IMPORTANT

tracker.md is NOT a generic changelog.

It is the Agent Handoff Log.

Its purpose is to allow another coding agent, starting in a completely new chat, to understand the current state of the work and continue immediately.

Think of it as a message from the current agent to the next agent.

It should communicate:

What was being worked on.
Why it was being worked on.
What was changed.
Which files changed.
Important implementation decisions.
What was tested.
What works now.
What does not work.
What remains.
What the next agent should do.
Required Handoff Information

Every meaningful task must leave a useful entry in tracker.md.

Use this structure where applicable:

## YYYY-MM-DD — Task Name

### Objective

What was the task supposed to accomplish?

### Changes Made

What was actually implemented?

### Files Changed

Important files created, modified, or deleted.

### Implementation Details

Important logic, architecture, API, database, dependency, or design decisions.

### Verification

Tests/checks actually performed and their results.

### Current State

Describe the actual state of the project now.

### Remaining Work

Anything unfinished, partially implemented, broken, blocked, or requiring more testing.

### Known Issues

Known bugs, limitations, edge cases, or concerns.

### Next Agent Instructions

Specific instructions for the next agent, including files to inspect
and recommended next steps.


Not every section is required when irrelevant, but the entry must contain enough information for another agent to continue without rediscovering the work.

Example Handoff
## 2026-08-21 — Authentication Refactor

### Objective

Centralize access-token refresh handling.

### Changes Made

- Added centralized token refresh.
- Updated API requests to retry after successful refresh.
- Added refresh failure handling.

### Files Changed

- `src/auth/refresh.ts`
- `src/api/client.ts`
- `src/auth/auth-state.ts`

### Implementation Details

Token refresh is handled by the API client.

A 401 triggers one refresh attempt and retries the request after success.

Do not add separate refresh logic to individual API modules.

### Verification

- `npm test` — passed.
- Authentication integration tests — passed.

### Current State

Login and single-request token refresh work correctly.

### Remaining Work

Concurrent 401 responses can trigger multiple refresh requests.

### Next Agent Instructions

1. Inspect `src/auth/refresh.ts`.
2. Implement refresh-request deduplication.
3. Add concurrent-refresh tests.
4. Run the authentication test suite.
5. Update the tracking files.

Agent Handoff Principle

Before finishing a task, ask:

If another agent starts a completely new chat tomorrow and only reads context.md, features_implemented.md, and tracker.md, will they understand what I did and know how to continue?

If not, improve the tracking files.

The next agent should not have to rediscover:

Why something was implemented.
Which approach was chosen.
Which files changed.
What was already attempted.
What failed.
What remains.
Known problems.
Recommended next steps.
Required Workflow
Before Starting Work

The agent MUST:

Read context.md.
Read features_implemented.md.
Read the latest/relevant tracker.md entries.
Check Git status/diff when appropriate.
Inspect only the relevant code needed for the task.
Use the tracking files to avoid unnecessary full-codebase exploration.

Do not blindly trust the tracking files.

The actual codebase is the source of truth.

If documentation conflicts with the code, verify the code and correct the tracking files.

While Working

Track information that will be useful to future agents:

Important decisions.
Approaches attempted.
Problems encountered.
Files changed.
Tests performed.
Important discoveries.
Remaining work.
Known limitations.

Update the tracking files during the task when important information becomes known. Do not rely on memory until the end.

After Making Changes

After every meaningful implementation:

Update tracker.md.
Update features_implemented.md if functionality changed.
Update context.md if architecture, conventions, behavior, or important project knowledge changed.
Run relevant tests/checks.
Record verification results in tracker.md.
Task Completion Requirement

A task is NOT complete until:

The requested work is implemented, or limitations are documented.
Relevant tests/checks are performed.
tracker.md is updated.
features_implemented.md is updated when functionality changes.
context.md is updated when project-level knowledge changes.
The tracking files accurately reflect the actual repository.
The next-agent handoff is clear.
Interrupted or Incomplete Work

If work cannot be completed, still update tracker.md before stopping.

Document:

What was completed.
What was attempted.
What remains.
Why it remains.
Errors encountered.
Known issues.
Exact recommended next steps.
Files the next agent should inspect.

Never leave unfinished work undocumented.

Never Fabricate History

Only document what actually happened.

Never claim:

A feature was implemented when it was not.
A test passed when it was not run.
A file changed when it did not.
A bug was fixed without verification.
An architectural decision was made when it was only assumed.
Work is complete when it is unfinished.

When uncertain, explicitly state the uncertainty.

Source of Truth

When information conflicts, use this priority:

Actual Codebase
      ↓
Git History / Git Diff
      ↓
Tracking Files
      ↓
Conversation History


The actual repository is authoritative.

If tracking files are stale, update them to match the repository.

Do not change working code simply to match stale documentation.

Avoid Unnecessary Codebase Exploration

The purpose of the tracking files is to reduce repeated repository exploration.

When starting a task:

Read the tracking files.
Identify the relevant subsystem.
Inspect the relevant files.
Verify assumptions.
Make the changes.
Update the tracking files.

Do not reread the entire codebase when the tracking files already provide sufficient context.

However, always inspect actual code when necessary to safely understand or modify functionality.

Keep Responsibilities Separate
File	Purpose
context.md	How does this project work?
features_implemented.md	What functionality currently exists?
tracker.md	What happened, where are we now, and how should the next agent continue?

Avoid duplicating large amounts of information between files.

Final Handoff Check

Before ending every task:

[ ] tracker.md updated
[ ] tracker.md describes the current state
[ ] Remaining work documented
[ ] Next-agent instructions documented
[ ] features_implemented.md updated if functionality changed
[ ] context.md updated if architecture/project knowledge changed
[ ] Tests/checks recorded
[ ] Tracking files match the actual code


If an applicable item is missing, fix it before considering the task complete.

Core Principle

Leave the repository in a state where another agent can continue efficiently without relying on the previous conversation.

context.md preserves project knowledge.
features_implemented.md preserves feature knowledge.
tracker.md preserves agent-to-agent handoff knowledge.

tracker.md must always be treated as an Agent Handoff Log, never merely as a changelog.