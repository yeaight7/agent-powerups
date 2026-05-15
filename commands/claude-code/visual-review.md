# visual-review

Use to inspect a web UI with browser evidence before marking work complete.

Steps:

1. Confirm the dev server is running and Playwright MCP or equivalent is available.
2. Navigate to the target URL. Take a baseline screenshot and accessibility snapshot.
3. Check console errors on load. Flag any uncaught errors before continuing.
4. Exercise the target interaction with semantic selectors (role → text → label → testId → CSS).
5. Capture a screenshot after each significant state change.
6. Check network: did the expected API call fire and return a success status?
7. Check accessibility: are new elements keyboard-reachable and correctly labelled?
8. Report per scenario: expected, observed, evidence, PASS/FAIL/NEEDS_REVIEW.

Do not automate against production environments without explicit user approval.
