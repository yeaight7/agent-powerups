# visual-review

Purpose: Inspect a web UI with browser evidence and produce structured findings.

1. Confirm the dev server is running and browser capability is available.
2. Navigate to the target URL. Take a baseline screenshot and accessibility snapshot.
3. Check console errors on load. Flag any uncaught errors immediately.
4. Exercise the target interaction using semantic selectors (role → text → label → testId → CSS).
5. Capture a screenshot after each significant state change.
6. Check accessibility: are new interactive elements keyboard-reachable and labelled?
7. Check network signals: did the expected API call fire and succeed?
8. Report per-scenario: expected, observed, evidence reference, PASS/FAIL/NEEDS_REVIEW.

Do not automate against production environments without explicit approval.
