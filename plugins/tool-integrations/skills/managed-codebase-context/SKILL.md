---
name: managed-codebase-context
description: Use when connecting to a managed codebase-context MCP/session service, checking stale maps, or safely using MCP-provided repository context.
---

# Managed Codebase Context

## When to use
Use when managing persistent sessions, dynamic codebase mappings, or managed context states using a dedicated codebase-context MCP server.

## Requirements / Checks
- Check whether MCP is configured through stdio or HTTP.
- Do not run `npx -y` or start servers without user approval.
- Verify server cwd, env, timeout, and workspace path scope.
- Confirm cleanup behavior for spawned stdio processes before long-running tasks.

## Workflow
1. **Select transport**: Use stdio for local one-off sessions; use HTTP only when an existing local server is already running.
2. **Connect with timeout**: Avoid hanging the agent if the server never initializes.
3. **Read map**: Retrieve current codebase map, symbols, or architectural summary.
4. **Validate freshness**: Compare map timestamp/source paths against current git status when available.
5. **Update state**: Trigger context refresh only when source changes make existing map stale.
6. **Close session**: Ensure client and transport close; kill spawned process tree if it does not exit.

## Safety Constraints
- Only interact with paths scoped to the current workspace.
- Do not overwrite existing architectural documents without user confirmation.
- Do not import user/global MCP configs implicitly.
- Do not leave background server processes running after a failed connection.

## Validation / Done Criteria
- The agent retrieves scoped context and reports freshness.
- Any spawned MCP process is closed or explicitly left running by user choice.

## References
- `references/managed-session-checklist.md`
