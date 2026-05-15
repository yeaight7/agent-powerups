# doctor

Purpose: Diagnose environment, tooling, and agent setup problems.

1. Check required commands exist: node, npx, python, git, apx (if applicable).
2. Check agent asset paths are reachable and non-empty.
3. Run asset validation if available: `apx validate catalog`, `apx validate skills`.
4. Check active MCP configs: `apx mcp check <name>` for each.
5. Check required env vars are set — list names of missing ones, do not print values.
6. Check for stale generated assets: `git status --short`.
7. Produce a structured report: blockers listed first, then non-blocking issues.

Do not install tools, modify configs, or set env vars unless explicitly asked.
