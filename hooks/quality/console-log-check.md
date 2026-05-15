# console-log-check

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Catch debug statements (`console.log`, `print()`, `debugger`, `pprint`) left in source code before a commit. Debug output in production causes log noise, potential data leakage, and signals incomplete cleanup.

## Trigger Suggestion

```
PreToolUse → tool == Bash AND command contains "git commit"
```

Or as a PostToolUse on file writes to check the written content immediately.

## Check Procedure

When triggered on a commit attempt:

1. Get the staged diff: `git diff --cached`.
2. Scan added lines (prefix `+`) for debug patterns.
3. If found: report file and line number, block the commit, ask agent to remove them.
4. If not found: allow the commit to proceed.

## Debug Patterns to Catch

| Pattern | Language |
|---|---|
| `console.log(` | JavaScript / TypeScript |
| `console.debug(` | JavaScript / TypeScript |
| `console.warn(` | JavaScript / TypeScript — flag only in non-logger usage |
| `debugger;` | JavaScript / TypeScript |
| `print(` | Python (flag in non-test, non-script files) |
| `pprint(` | Python |
| `pp(` | Python (using `pp` from `pprint`) |
| `binding.pry` | Ruby |
| `byebug` | Ruby |
| `fmt.Println(` | Go (flag in non-main, non-test files) |

## Safe Default

Block commits with debug statements. Require the agent to remove them or explicitly annotate them as intentional (e.g., with a `// TODO: remove` comment that is then caught by a separate TODO check).

## Blocking vs Warning Mode

- **Blocking (recommended for CI-facing hooks):** Halt commit, report the lines.
- **Warning:** Log and proceed. Use when the codebase intentionally includes `console.log` in some areas.

## False-Positive Risks

- Logging libraries that wrap `console.log` (the pattern still appears in source).
- Test files that use `console.log` intentionally for test output.
- Intentional debug builds or verbose modes.

Consider allowlisting `*.test.*`, `*.spec.*`, and `scripts/` paths.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash

DEBUG_PATTERNS=(
  "console\.log("
  "console\.debug("
  "debugger;"
  "binding\.pry"
  "byebug"
)

STAGED_DIFF=$(git diff --cached 2>/dev/null)
if [ -z "$STAGED_DIFF" ]; then
  exit 0
fi

FOUND=0
for pattern in "${DEBUG_PATTERNS[@]}"; do
  MATCHES=$(echo "$STAGED_DIFF" | grep -nE "^\+.*$pattern" || true)
  if [ -n "$MATCHES" ]; then
    echo "[console-log-check] Debug statement found in staged changes:"
    echo "$MATCHES"
    FOUND=1
  fi
done

if [ "$FOUND" -eq 1 ]; then
  echo "[console-log-check] Remove debug statements before committing."
  exit 1
fi

exit 0
```

## Sources / Inspiration

- Pre-commit hook patterns from the `pre-commit` ecosystem (`no-debug-statements` hook).
- ESLint `no-console` rule documentation.
