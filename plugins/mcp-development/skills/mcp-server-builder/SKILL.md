---
name: mcp-server-builder
description: Design high-quality MCP servers around workflows, narrow schemas, context-aware outputs, and actionable errors. Use when building or reviewing MCP tools for real agent tasks.
---

# MCP Server Builder

Use this skill when designing or implementing an MCP server.

## When to Use

- Building a new MCP server from scratch.
- Refactoring a weak or over-thin MCP tool surface.
- Reviewing whether a server exposes the right workflows.
- Designing evaluation cases for MCP usability.

## Core Principles

- Build **workflow tools**, not thin endpoint wrappers — one tool should complete a meaningful agent task, not expose a single API method.
- Keep input schemas **narrow and typed** — reject unknown fields; use enums over free strings where possible.
- Return **high-signal, size-bounded outputs** — default to concise; add `detail` or `verbose` flags when larger payloads are occasionally useful.
- Make error messages **corrective** — tell the agent what to do next, not just what went wrong.
- Prefer **human-meaningful identifiers** over opaque IDs when both are available.
- Design **evaluation cases** before declaring the server "done".

## Workflow

### 1. Map the workflow

- Identify the real tasks an agent must complete, not the underlying API surface.
- Merge low-level steps into meaningful operations (e.g., one `create_and_publish` tool instead of separate `create`, `validate`, `publish`).

### 2. Design the tool surface

```
tool name:    stable, verb-noun, describes the workflow step
input schema: typed, narrow, required fields only + optional detail flags
output shape: consistent structure across all tools in the server
failure modes: named error codes + correction hint
```

### 3. Design for context limits

- Default response fits in ~500 tokens for list operations, ~1500 for detail operations.
- Add `limit`, `page`, or `summary` parameters for large result sets.
- Truncate deterministically (e.g., top N by recency) — never truncate randomly.

### 4. Design corrective errors

Bad error: `"Error: 404 Not Found"`

Good error: `"Resource 'project-123' not found. Use list_projects to see available project IDs."`

Every error should tell the agent its next valid action.

### 5. Implement shared infrastructure first

- Auth handling and token refresh.
- Retry logic with exponential backoff and rate-limit awareness.
- Pagination helpers.
- Output formatting helpers (consistent truncation, redaction of secrets).

### 6. Evaluate before shipping

- Write representative task scenarios (not unit tests for individual tools).
- Check whether an agent can complete the full workflow using only the exposed tools.
- Redesign weak tools before adding more tools — more tools is not always better.

## Server Readiness Checklist

- [ ] Every tool completes a meaningful workflow step.
- [ ] All inputs are typed and schema-validated.
- [ ] Output size is bounded by default.
- [ ] All error messages include a correction hint.
- [ ] Auth and retry are handled in shared infrastructure.
- [ ] At least one end-to-end task scenario has been tested.
- [ ] No secrets appear in tool outputs or error messages.

## Local References

- `reference/mcp_best_practices.md`
- `reference/python_mcp_server.md`
- `reference/node_mcp_server.md`
- `reference/evaluation.md`

Use the Python and Node references only for the stack you are actually shipping.

## Bundled Scripts

- `scripts/evaluation.py` — evaluation scaffolding
- `scripts/connections.py` — connection-oriented examples

Use them as optional helpers, not mandatory runtime requirements.
