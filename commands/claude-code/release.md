# release

Use when a change is ready to be tagged and published.

Steps:

1. Read the current version from `package.json` or the relevant manifest.
2. Confirm the compare range: `git log <last-tag>..HEAD --oneline --no-merges`.
3. Verify changelog coverage. Every user-visible commit must appear in the release notes.
4. Run `npm test`. All tests must pass before proceeding.
5. Run `tsc --noEmit` if the project has a TypeScript build step.
6. Scan for breaking changes: commits with `!` suffix or `BREAKING CHANGE:` in the body.
7. Write the exact publish plan: commands in sequence.
8. Write the rollback plan: one reversal per publish step.
9. Present the go/no-go readout and wait for explicit approval before executing.

Do not tag, publish, or push until the user explicitly approves the plan.
