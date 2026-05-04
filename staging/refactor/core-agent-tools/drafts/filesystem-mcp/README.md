# Filesystem MCP Conceptual Configuration

**DRAFT: requires review before catalog/plugin activation.**

## Status
This is a conceptual document for a Filesystem MCP server configuration. It is NOT a runnable configuration file. The upstream harvest (`filesystem-mcp-server`) provided a Go-based implementation that assumed execution within its own repository structure.

## Intent
When packaged as a true Agent Powerup, this will provide guidance on configuring and safely running local filesystem MCP servers.

## When to use
Use when the agent needs structured, protocol-driven access to the local filesystem beyond its native capabilities, or when integrating external tools that require filesystem access via MCP.

## Safety Constraints
- MCP servers providing filesystem access MUST be strictly bounded to the intended project directory.
- Avoid configuring MCP servers with root or wide-ranging access.
- Always require user approval before starting a new MCP server.
- Prefer read-only operations until write need is explicit.
- Keep allowlists for roots and methods; avoid broad recursive delete/move surfaces.
- Log configured roots without exposing sensitive path contents.

## Required Shipping Work
Before this becomes a shipped MCP config:
1. Define target-specific config files for Codex, Claude Code, and generic MCP clients.
2. Add `apx mcp check` metadata and dry-run install behavior.
3. Validate path boundary behavior on Windows and POSIX.
4. Add tests for refusal of out-of-root paths and dangerous methods.

## References
- `references/path-boundary-checklist.md`

## Attribution
*Derived from upstream harvest:*
- Slug: `filesystem-mcp-server` | Paths: `README.md`, `internal/server/server.go`, `internal/server/server_test.go`
