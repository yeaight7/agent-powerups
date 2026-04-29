# using-powerups

Purpose: Find and apply installed Agent Powerups without guessing.

Use this prompt when starting non-trivial work in a repo where Agent Powerups may be installed.

Steps:

1. List available assets:
   - `apx list`
   - `apx list --type skill`
   - `apx list --type command`
2. Pick the narrowest asset that matches the user task.
3. Inspect it before using:
   - `apx info <asset-name>`
   - `apx check <asset-name>`
   - read the asset file when needed
4. If a dependency is missing, stop that path and report the exact missing tool. Ask before installing anything.
5. Apply the asset only within the user-requested scope.
6. Report which powerup was used, requirement status, validation run, and any fallback.

Do not enable MCP servers, install packages, mutate shell profiles, activate hooks, or write secrets unless the user explicitly asks.
