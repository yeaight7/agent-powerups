# pre-commit-quality-check

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Run a compact pre-commit sanity check before `git commit`. Acts as a lightweight aggregator that surfaces the most critical issues — staged diff anomalies, debug leftovers, obvious secret patterns, and test/lint gaps — without duplicating the specialized hooks it coordinates.

This is an **aggregator recipe**. It is designed to combine existing hooks in a defined order rather than re-implement their logic. Do not copy their pattern-matching code here; call or reference them.

## Trigger Suggestion

```
PreToolUse → tool == Bash
  AND command contains "git commit"
  AND command does not contain "--amend" (optional: handle separately)
```

## Matcher Patterns

Flag Bash commands matching:

| Pattern | Notes |
|---|---|
| `git commit` | All commit forms |
| `git commit -m` | Inline message commits |
| `git commit -am` | Stage-all + commit shorthand |

Exclude: `git commit --dry-run` (informational only).

## Behavior

When a `git commit` command is detected:

1. Print: `[pre-commit-quality-check] Running pre-commit checks...`
2. Run each check in sequence; stop on first block-level failure if strict mode is enabled.

**Check sequence:**

| Check | Hook to invoke | Fail behavior |
|---|---|---|
| Secret patterns in staged diff | `no-secrets-preflight` | Block |
| Oversized diff | `large-diff-warning` | Warn |
| Debug/log leftovers | `console-log-check` | Warn |
| TODO/FIXME bare markers | `todo-fixme-blocker` | Warn or block |
| Lint (if configured) | `lint-check` | Warn |
| Tests (if configured) | `test-gate` | Warn |

3. If all checks pass: print `[pre-commit-quality-check] PASS — proceeding with commit.` and exit 0.
4. If any blocking check fails: print a summary and exit 1.

## Safe Default

Warning mode for all non-secret checks. Blocking for secret pattern detection only.

## Blocking vs Warning Mode

- **Warning (recommended):** Print issues, allow commit to proceed with user acknowledgment.
- **Blocking:** Block on secrets unconditionally; optionally block on bare TODO markers.

Enable full blocking mode by setting the invoked hooks to strict mode individually.

## False-Positive Risks

- Test files that legitimately log to console.
- TODOs with issue references that are intentional (`TODO(#123): ...`).
- Binary diffs that trigger size warnings.
- Repos with no test runner configured — test-gate check should be disabled or no-op.

## Bypass / Approval Mechanism

User explicitly adds `--no-verify` (not recommended) or responds to the individual blocking hook's confirmation prompt. This aggregator does not add its own bypass mechanism; each child hook manages its own bypass.

## Relationship to Existing Hooks

This hook **coordinates** the following hooks. Do not duplicate their logic:

- `hooks/safety/no-secrets-preflight.md`
- `hooks/git/large-diff-warning.md`
- `hooks/quality/console-log-check.md`
- `hooks/quality/todo-fixme-blocker.md`
- `hooks/quality/lint-check.md`
- `hooks/quality/test-gate.md`

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called when 'git commit' is detected.

CHECKS_FAILED=0

run_check() {
  local name="$1"
  local script="$2"
  if [ -f "$script" ]; then
    bash "$script" || CHECKS_FAILED=$((CHECKS_FAILED + 1))
  else
    echo "[pre-commit-quality-check] Skipping $name (hook not installed)"
  fi
}

echo "[pre-commit-quality-check] Running pre-commit checks..."

run_check "no-secrets-preflight" "${HOOKS_DIR}/safety/no-secrets-preflight.sh"
run_check "large-diff-warning"   "${HOOKS_DIR}/git/large-diff-warning.sh"
run_check "console-log-check"    "${HOOKS_DIR}/quality/console-log-check.sh"
run_check "todo-fixme-blocker"   "${HOOKS_DIR}/quality/todo-fixme-blocker.sh"

if [ "$CHECKS_FAILED" -gt 0 ]; then
  echo "[pre-commit-quality-check] $CHECKS_FAILED check(s) failed. Review above before committing."
  exit 1
fi

echo "[pre-commit-quality-check] PASS — proceeding with commit."
exit 0
```

## Sources / Inspiration

Aggregator pattern from common pre-commit frameworks (pre-commit.com, husky). Coordinates existing hooks in this repository: no-secrets-preflight, large-diff-warning, console-log-check, todo-fixme-blocker, lint-check, test-gate.
