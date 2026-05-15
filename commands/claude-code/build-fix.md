# build-fix

Use when a build, type check, or test suite is failing and needs to be unblocked with a minimal change.

Steps:

1. Run the exact failing command. Confirm the same error reproduces.
2. Read the full error from the first line — identify the root cause, not a cascade error.
3. Read the relevant source file and surrounding context.
4. Apply one targeted fix. No adjacent cleanup, no unrelated changes.
5. Rerun the exact failing command. It must exit 0.
6. Run `npm test`. Confirm no regressions.
7. Report: what was broken, root cause, change made, verification result, deferred issues.

Do not fix adjacent issues. Do not modify test expectations to hide broken logic.
