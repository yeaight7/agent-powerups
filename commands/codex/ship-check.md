# ship-check

Use before final Codex handoff.

Steps:

1. Re-read the user request and any active plan.
2. Inspect changed files:
   - `git status --short`
   - `git diff --check`
3. Run the narrowest meaningful validation.
4. If Agent Powerups assets changed, run:
   - `apx validate skills`
   - `apx validate catalog`
5. If CLI behavior changed, run `npm test`.
6. Final response must include changed files, commands run, validation results, and remaining risks.

Do not commit, push, install tools, enable MCP servers, or mutate global config unless explicitly requested.
