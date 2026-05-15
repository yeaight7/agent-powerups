# todo-fixme-blocker

**Type:** Stop / PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Catch newly introduced `TODO`, `FIXME`, `HACK`, `XXX`, or plaintext "temporary" markers before a session ends or a commit is made. Intentional TODOs with issue references are allowed; bare markers are flagged.

## Trigger Suggestion

```
Stop → end of session (check staged and unstaged changes)
  OR
PreToolUse → tool == Bash AND command contains "git commit"
```

## Matcher Patterns

Flag lines added (prefix `+`) in the diff that match:

| Pattern | Meaning |
|---|---|
| `TODO` | Incomplete work |
| `FIXME` | Known broken code |
| `HACK` | Workaround that needs cleanup |
| `XXX` | Danger / attention marker |
| `TEMP` or `temporary` | Explicitly provisional code |
| `NOCOMMIT` | Explicitly not ready to ship |

### Allowlist (do not flag)

Allow markers that include an issue/ticket reference:

```
# TODO(#123): implement retry logic
# FIXME(GH-456): investigate flaky test
# TODO(jsmith): revisit after upgrade
```

Pattern: marker followed by `(` — treat as intentional.

## Behavior

When bare (unlinked) markers are found in new lines:

1. Print: `[todo-fixme-blocker] Unresolved markers in new code:`
2. List each file, line number, and the matching line.
3. State: "These markers suggest incomplete work. Resolve or add a tracking reference."
4. Block completion or commit.

## Safe Default

Block on bare markers, allow linked markers. Check only newly added lines (diff `+` prefix) — do not re-flag pre-existing markers.

## Blocking vs Warning Mode

- **Blocking (recommended for commits):** Halt commit; require resolution or linking.
- **Warning (recommended for Stop):** Summarize at session end; do not block response.

## False-Positive Risks

- `TODO` in documentation explaining what an upcoming version will do — not a code-quality issue.
- `FIXME` in test fixtures that are intentionally broken to test error handling.
- Third-party code included in the repo with pre-existing markers.

Limit matching to files the agent modified in this session.

## Bypass / Approval Mechanism

Add a tracking reference: `TODO(#issue)` or `FIXME(ticket-id)`. Alternatively, the agent can state explicitly that the TODO is intentional and tracked — the user must confirm.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash

BARE_MARKER_PATTERN='^\+.*\b(TODO|FIXME|HACK|XXX|NOCOMMIT)\b[^(]'

MATCHES=$(git diff --cached 2>/dev/null | grep -nE "$BARE_MARKER_PATTERN" || true)
if [ -z "$MATCHES" ]; then
  # Also check unstaged for Stop hook
  MATCHES=$(git diff 2>/dev/null | grep -nE "$BARE_MARKER_PATTERN" || true)
fi

if [ -n "$MATCHES" ]; then
  echo "[todo-fixme-blocker] Unresolved markers in new code:"
  echo "$MATCHES"
  echo "Resolve or add a tracking reference (e.g., TODO(#123)) before completing."
  exit 1
fi

exit 0
```

## Sources / Inspiration

Pre-commit `no-commit-to-branch` and custom TODO-check hooks. ESLint `no-warning-comments` rule documentation.
