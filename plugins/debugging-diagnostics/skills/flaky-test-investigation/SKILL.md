---
name: flaky-test-investigation
description: "Use to diagnose tests that pass and fail intermittently without code changes."
---

# Flaky Test Investigation

Flaky tests erode trust in CI. Do not just re-run them and hope for the best.

## Investigation Protocol

1. **Isolate the Test**: Run the specific failing test by itself. If it passes, the flake is likely an **order dependency** or **state leakage** from a previous test.
2. **Stress Test**: Run the test in a tight loop (e.g., `for i in {1..100}; do npm test -- -t "My Test"; done`).
3. **Check for Common Vectors**:
   - **Time**: Does the test rely on `Date.now()` or `setTimeout`? Mock the clock.
   - **Async/Promises**: Are we asserting before a background task finishes? Ensure proper `await` or `waitFor` usage.
   - **Shared State**: Are we reusing database records, global singletons, or mutated variables between runs? Ensure clean teardowns in `afterEach`.
   - **Randomness**: Does the test rely on random IDs or sorts? Force deterministic seeds or sort orders.
4. **Prove the Fix**: Do not just guess. The fix must be verified by running the stress test loop again and achieving a 100% pass rate.