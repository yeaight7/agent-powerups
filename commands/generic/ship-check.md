# ship-check

Purpose: prepare a change for handoff without mutating git or remote services.

Run this as a manual checklist before saying work is complete.

1. Inspect current changes.
   - Run `git status --short`.
   - Run `git diff --check`.
2. Run targeted tests for changed code.
   - Prefer the narrowest command that exercises the touched behavior.
   - If shared CLI/catalog behavior changed, run `npm test`.
3. Run repo validation when assets changed.
   - `node dist/cli/apx.js validate skills`
   - `node dist/cli/apx.js validate catalog`
4. Report:
   - changed files
   - commands run
   - validation results
   - remaining risks

Do not commit, push, open PRs, install tools, or edit config unless user explicitly asks.
