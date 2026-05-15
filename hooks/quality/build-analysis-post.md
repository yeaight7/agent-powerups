# build-analysis-post

**Type:** PostToolUse hook recipe — review before use, not auto-applied.

## Purpose

After a build, test, lint, or typecheck command completes, summarize the output and extract actionable failures. Prevents agents from misreading long noisy output or silently claiming completion when a command failed.

## Trigger Suggestion

```
PostToolUse → tool == Bash
  AND command matches build/test/lint/typecheck pattern
  AND exit code OR output indicates failure
```

## Matcher Patterns

Trigger on Bash commands matching:

| Pattern | Type |
|---|---|
| `npm test`, `pnpm test`, `yarn test` | Test runner |
| `pytest`, `python -m pytest` | Test runner |
| `cargo test` | Test runner |
| `npm run build`, `tsc`, `tsc --noEmit` | Build/type check |
| `npm run lint`, `eslint`, `ruff check`, `golangci-lint` | Linter |
| `npm run typecheck`, `pyright`, `mypy` | Type checker |
| `make test`, `make build`, `make lint` | Make targets |

## Behavior

After a matched command exits:

1. Check exit code: non-zero = failure.
2. Extract the first failing assertion, error line, or error count.
3. Print a structured summary:

```
BUILD ANALYSIS: PASS / FAIL

Command: <command>
Exit code: <N>
Duration: <if available>

FAILURES (first 5):
  [file:line] <error message>

SUMMARY: N test(s) failed, M error(s), K warning(s)
ACTION REQUIRED: <specific next step — e.g., fix type error at src/auth.ts:42>
```

4. If the command succeeded (exit 0): print a one-line pass confirmation and stop.
5. If the agent subsequently claims the task is complete without addressing reported failures: block the completion claim.

## Safe Default

Non-blocking summary. Only block completion claims when failures are present and unaddressed.

## Blocking vs Warning Mode

- **Non-blocking summary (recommended):** Extract and display failures; let the agent continue.
- **Block completion (optional):** Intercept Stop or "task complete" signals when failures exist.

## False-Positive Risks

- Expected test failures in repos that use red-green TDD (failing tests are intentional).
- Warnings treated as failures in strict mode — distinguish warnings from errors.
- Watch commands (`npm run dev --watch`) that never exit — do not apply to long-running processes.

## Bypass / Approval Mechanism

If the agent wants to proceed despite failures, it must explicitly state that failures are known/intentional and get user confirmation.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $COMMAND and $EXIT_CODE by the hook runner.
# $OUTPUT contains the command's stdout+stderr.

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "[build-analysis-post] PASS: $COMMAND"
  exit 0
fi

echo "[build-analysis-post] FAIL: $COMMAND (exit $EXIT_CODE)"
echo ""
echo "FIRST FAILURES:"
echo "$OUTPUT" | grep -E "(Error|FAIL|✗|✕|FAILED)" | head -5
echo ""
echo "Full output available above. Address failures before claiming completion."
exit 0  # Non-blocking — summary only
```

## Sources / Inspiration

CI output parsing patterns from GitHub Actions, Jest, and pytest summary formats. Inspired by the `validation-required` hook in this repository.
