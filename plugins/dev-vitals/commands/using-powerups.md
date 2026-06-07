# using-powerups

Purpose: Find and apply installed Agent Powerups without guessing.

Use this prompt when starting non-trivial work in a repo where Agent Powerups may be installed.

Steps:

1. List available assets:
   - `apx discover "<user task>" --target <codex|claude-code|gemini|generic>`
   - `apx inventory --target <codex|claude-code|gemini|generic> --json`
   - `apx list --json --verbose`
2. Pick the narrowest asset that matches the user task.
3. Inspect it before using:
   - `apx info <asset-name>`
   - read the asset file when needed
4. Run `apx check <asset-name>` only when the asset declares external requirements or its instructions require a dependency check.
5. If a dependency is missing, stop that path and report the exact missing tool. Ask before installing anything.
6. Apply the asset only within the user-requested scope.
7. Report which powerup was used, whether a dependency check was needed, validation run, and any fallback.

Do not enable MCP servers, install packages, mutate shell profiles, activate hooks, or write secrets unless the user explicitly asks.
