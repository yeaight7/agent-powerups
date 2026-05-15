---
name: filesystem-mcp-guardrails
description: Use when designing or reviewing filesystem MCP access, path boundaries, allowed roots, method allowlists, and safe local file operations.
---

# Filesystem MCP Guardrails

## When to use
Use when configuring, reviewing, or debugging a local filesystem MCP server — particularly when deciding which paths to expose, which methods to allow, and how to enforce workspace boundaries.

## Safety Model

The core constraint is **strict path bounding**: the MCP server must only operate within explicitly declared workspace roots. No exceptions.

| Principle | Rule |
|---|---|
| Scope | Bind to the project workspace directory only — never `/`, `~`, or OS dirs |
| Access | Start read-only; add write methods only when the use case requires them |
| Methods | Use an allowlist — block delete/move/rename by default |
| Secrets | Never expose `.env`, credential files, SSH keys, or token stores |
| Approval | Always require user approval before starting a new MCP server process |

## Configuration Checklist

Before starting a filesystem MCP server:

- [ ] Allowed roots list is explicit and scoped to the project directory.
- [ ] No root is set to `/`, `~`, or any system-level path.
- [ ] Method allowlist is defined (e.g., `read_file`, `list_directory`, `search_files`).
- [ ] Destructive methods (`delete_file`, `move_file`, `write_file`) are explicitly enabled only if required.
- [ ] Sensitive file patterns are excluded: `*.env`, `*.key`, `*.pem`, `*secrets*`, `.ssh/`.
- [ ] Server timeout is set (avoid hanging processes).
- [ ] Log output does not include file contents — only paths and operation results.

## Workflow

1. **Define scope** — identify which directories the agent legitimately needs to access for this task.
2. **Set roots** — configure the server with the narrowest possible root list (usually just the project root).
3. **Define allowlist** — start with read-only methods; add write methods only after explicit use-case review.
4. **Validate path boundaries** — test that requests for paths outside the declared roots are refused with a clear error.
5. **Verify cleanup** — confirm the server process exits cleanly when the session ends; no background processes left running.

## Out-of-Root Path Refusal

The server must return a clear error for any request targeting a path outside declared roots:

```
Error: path '/etc/passwd' is outside allowed workspace root '/home/user/project'
```

Silent failures or fallback to broader access are not acceptable.

## Safety Constraints
- Never configure MCP servers with root or wide-ranging access.
- Do not start a filesystem MCP server without explicit user approval for the scope.
- Prefer read-only operations until write need is explicit and scoped.
- Do not log configured roots in a way that exposes sensitive path contents.
- On Windows: validate boundary behavior with both forward-slash and backslash paths.

## Validation / Done Criteria
- Allowed roots are listed and scoped to the workspace.
- Out-of-root path requests are refused with a clear error.
- Method allowlist is explicit; destructive methods are not in the default list.
- Server process exits cleanly after session ends.

## References
- `references/path-boundary-checklist.md`
