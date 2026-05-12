---
name: mcp-server-builder
description: Design high-quality MCP servers around workflows, narrow schemas, context-aware outputs, and actionable errors. Use when building or reviewing MCP tools for real agent tasks.
---

# MCP Server Builder

Use this skill when designing or implementing an MCP server.

## When to Use

- Building a new MCP server
- Refactoring a weak MCP tool surface
- Reviewing whether a server exposes the right workflows
- Designing evaluation cases for MCP usability

## Core Principles

- Build workflow tools, not thin endpoint wrappers
- Keep inputs schema-first and narrow
- Return high-signal outputs sized for agent context limits
- Make error messages corrective, not merely diagnostic
- Prefer human-meaningful identifiers over opaque IDs when possible
- Design evaluation cases before the server feels "done"

## Workflow

1. **Map the workflow**
   - Identify the real tasks the agent must complete.
   - Merge low-level API steps into meaningful tool operations where appropriate.

2. **Design the tool surface**
   - Stable tool names
   - Narrow, typed input schemas
   - Consistent output shapes
   - Clear failure modes

3. **Design for context limits**
   - Default to concise responses
   - Add explicit detail flags when larger payloads are useful
   - Truncate or summarize large result sets deterministically

4. **Implement shared infrastructure first**
   - auth handling
   - retries and rate limits
   - pagination helpers
   - formatting helpers

5. **Evaluate**
   - Write representative task scenarios
   - Check whether the current tools let an agent finish the workflow cleanly
   - Redesign weak tools before adding more tools

## Local References

- `reference/mcp_best_practices.md`
- `reference/python_mcp_server.md`
- `reference/node_mcp_server.md`
- `reference/evaluation.md`

Use the Python and Node references only for the stack you are actually shipping.

## Bundled Scripts

- `scripts/evaluation.py` for evaluation scaffolding
- `scripts/connections.py` for connection-oriented examples

Use them as helpers, not as mandatory runtime requirements.
