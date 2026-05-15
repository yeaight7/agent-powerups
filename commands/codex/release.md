# release

Use when a change is ready to be tagged and published.

Steps:

1. Read the current version from the manifest (`package.json`, `pyproject.toml`, etc.).
2. Confirm the compare range: `git log <last-tag>..HEAD --oneline --no-merges`.
3. Verify changelog coverage. Every user-visible commit must appear in the notes.
4. Run validation: `apx validate catalog`, `apx validate skills`, then the repo test command.
5. Scan for breaking changes: commits with `!` suffix or `BREAKING CHANGE:` in the body.
6. Write the exact publish plan: commands in sequence.
7. Write the rollback plan: one reversal per publish step.
8. Present the go/no-go readout and wait for explicit approval before executing.

Do not tag, publish, or push until the user explicitly approves each step.
