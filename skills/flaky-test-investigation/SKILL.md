---
name: flaky-test-investigation
description: Use when tests pass and fail intermittently without code changes, or a test passes alone but fails in the full suite.
---

## Purpose

Flaky tests erode trust in CI. Do not just re-run them and hope for the best — isolate the flake vector, fix it, and prove the fix with a stress loop.

## When to Use

- A test fails intermittently in CI but passes locally (or vice versa)
- A test passes alone but fails in the full suite
- A re-run "fixed" a failure and nobody knows why

## Inputs

- The flaky test's name/path and the runner command for it
- Recent failing runs, if available, to estimate the failure rate

## Workflow

1. **Isolate the test.** Run the specific failing test by itself. If it passes alone, the flake is likely an **order dependency** or **state leakage** from a previous test — run the suite up to and including it to confirm.

2. **Stress test.** Run the test in a tight loop to establish the failure rate before changing anything:

   ```bash
   for i in {1..100}; do npm test -- -t "My Test" || echo "FAIL on run $i"; done
   ```

   (Adapt the inner command to the project's runner; some runners have repeat flags built in.)

3. **Check the common vectors:**
   - **Time** — does the test rely on `Date.now()` or `setTimeout`? Mock the clock.
   - **Async/Promises** — asserting before a background task finishes? Ensure proper `await` or `waitFor` usage.
   - **Shared state** — reusing database records, global singletons, or mutated variables between runs? Ensure clean teardowns in `afterEach`.
   - **Randomness** — random IDs or sort orders? Force deterministic seeds or sort orders.

4. **Prove the fix.** Do not just guess. The fix must be verified by running the stress test loop again and achieving a 100% pass rate.

## Output

- The identified flake vector (order/state, time, async, randomness)
- The fix, plus stress-loop evidence (pre-fix failure rate vs post-fix 100% pass)

## Verification

- [ ] Test run in isolation to separate order-dependency from intrinsic flake
- [ ] Stress loop run before the fix to establish a baseline failure rate
- [ ] Flake vector named explicitly
- [ ] Stress loop re-run after the fix with a 100% pass rate

## Failure Modes

- **Re-run and hope** — a green re-run proves nothing; the flake is still there.
- **Fixing without a baseline** — without a pre-fix failure rate, a "fix" cannot be distinguished from luck.
- **Quarantining forever** — skipping the test removes the signal but keeps the bug.
