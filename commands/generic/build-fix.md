# build-fix

Purpose: Fix a failing build, type check, or test suite with the smallest safe diff.

1. Run the exact failing command. Confirm it fails with the same error.
2. Read the full error output from the first line. Find the root cause, not a cascade.
3. Read the relevant source and surrounding context.
4. Form one hypothesis. Apply one targeted fix. Nothing else.
5. Rerun the exact failing command. Confirm it exits 0.
6. Run the full test suite. Confirm no regressions.
7. Report: what was broken, root cause, what was changed, verification result, deferred issues.

Do not fix adjacent issues. Do not change test expectations to hide broken logic.
