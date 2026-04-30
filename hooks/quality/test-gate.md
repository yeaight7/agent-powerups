# test-gate

**Type:** PreToolUse / Stop hook recipe — review before use, not auto-applied.

## Purpose

Block completion claims and session-ending actions when the test suite is red. Prevents an agent from marking work done, committing, or handing off while tests are failing.

## Trigger Suggestion

Attach to two events:

1. **Stop** — runs before the agent yields control back to the user. If tests are not green, block the stop and surface the failure count.
2. **PreToolUse on Bash** — intercept `git commit` commands. If the working tree has failing tests, abort the commit.

```
Stop → always run
PreToolUse → tool == Bash AND command contains "git commit"
```

## Check Procedure

When triggered:

1. **Detect the test command** — check for `package.json` (`npm test`), `Cargo.toml` (`cargo test`), `pytest.ini`/`pyproject.toml` (`pytest`), `go.mod` (`go test ./...`). Fall back to `npm test` if uncertain.
2. **Run tests** — capture exit code and failure count.
3. **If exit code 0** — allow the action to proceed. Optionally print pass count.
4. **If exit code non-zero** — print the failure summary, block the action, and ask the agent to fix before proceeding.

## Suggested Shell Hook

```bash
#!/usr/bin/env bash
set -euo pipefail

if [ -f "package.json" ]; then
  CMD="npm test --silent"
elif [ -f "Cargo.toml" ]; then
  CMD="cargo test --quiet 2>&1"
elif [ -f "pyproject.toml" ] || [ -f "pytest.ini" ]; then
  CMD="pytest -q"
elif [ -f "go.mod" ]; then
  CMD="go test ./... -count=1"
else
  echo "[test-gate] No test runner detected. Skipping."
  exit 0
fi

if ! eval "$CMD"; then
  echo "[test-gate] Tests failing. Fix before completing."
  exit 1
fi
```

Exit code 1 from the hook script signals the runner to block the action.

## Safety Notes

- Keep the test command fast — hooks that take >30s will frustrate long sessions.
- This hook does not fix tests; it only prevents claiming they pass.
- Combine with `validation-required` hook for a stronger completion gate.

## Failure Mode

Without this hook, an agent can commit, push, or hand off work with a red test suite, especially after making a refactor that inadvertently breaks existing tests.
