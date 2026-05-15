# doctor

Use to diagnose environment, tooling, and Agent Powerups setup problems.

Steps:

1. Check required commands: `node --version`, `npx --version`, `python --version`, `git --version`, `apx --version`.
2. Run: `apx list` — confirm skills and commands are discoverable.
3. Run: `apx validate catalog` — should exit 0.
4. Run: `apx validate skills` — should exit 0.
5. Check MCP configs: `apx mcp check <name>` for each active config.
6. Check required env vars are set (names only — do not print values).
7. Run `git status --short` to check for stale generated assets.
8. Report blockers first, then non-blocking issues.

Do not install, modify, or configure anything unless explicitly asked.
