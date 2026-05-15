---
name: managed-codebase-context
description: Use when connecting to a managed codebase-context MCP/session service, checking stale maps, or safely using MCP-provided repository context.
---

# Managed Codebase Context

## When to use
Use when a persistent codebase-context MCP server is available and the task requires broad architectural context, symbol inventory, or cross-file navigation that would be expensive to reconstruct from scratch on each turn.

## Requirements / Checks
- Check MCP transport type: stdio (local, one-off) vs HTTP (requires a running server).
- Do not run `npx -y` or start server processes without user approval.
- Verify server `cwd`, env variables, timeout, and workspace path scope.
- Confirm cleanup behavior for spawned stdio processes before starting long-running tasks.

## Workflow

1. **Select transport**:
   - **stdio**: suitable for local, ephemeral sessions started per task.
   - **HTTP**: use only when a local server is already confirmed to be running.

2. **Connect with timeout** — set a connection timeout; do not let the agent hang indefinitely if the server never initializes.

3. **Retrieve context** — fetch the current codebase map, symbol index, or architectural summary as available.

4. **Validate freshness** — a map is stale if any of the following are true:
   - Map timestamp predates the last `git commit` that touched relevant files.
   - Map references files that no longer exist.
   - Map is missing files present in the current workspace.
   - The user reports recent significant refactoring.

5. **Refresh when stale** — trigger a context refresh only when the map is demonstrably stale. Do not refresh on every request — refreshes are expensive.

6. **Use context, then close** — read what you need, then close the session. Ensure the client and transport close cleanly. If the server was spawned as a stdio process, kill the process tree if it does not exit within a few seconds.

## Staleness Signals

| Signal | Check |
|---|---|
| Map timestamp | Compare to `git log --format="%ci" -1` for recently changed files |
| Missing files | Cross-reference map file list with `git ls-files` |
| Stale symbols | Check if key function/class names in the map exist in current source |
| User-reported | Accept the user's word; trigger refresh without verification |

## Safety Constraints
- Only interact with paths scoped to the current workspace.
- Do not overwrite existing architectural documents without user confirmation.
- Do not import user-level or global MCP configs implicitly.
- Do not leave background server processes running after a failed connection.

## Validation / Done Criteria
- Context retrieved is confirmed to be within the current workspace scope.
- Freshness was validated or a refresh was triggered with reason.
- Any spawned MCP process is closed or explicitly left running by user choice.

## References
- `references/managed-session-checklist.md`
