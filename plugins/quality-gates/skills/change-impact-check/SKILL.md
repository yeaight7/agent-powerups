---
name: change-impact-check
description: "Use before submitting a PR or considering a task done to evaluate the 'blast radius' of your changes."
---

# Change Impact Check

Code changes rarely exist in isolation. Before declaring success, you must evaluate the downstream consequences of your work.

## Impact Assessment Protocol

1. **API Surface**: Did you change a public method signature, REST endpoint, or database schema? If so, immediately `grep` the entire repository for usages of the old signature.
2. **Dependency Graph**: If you updated a core utility function (e.g., `formatDate`), find all modules that import it. Do their tests still pass?
3. **Configuration**: Did you add a new environment variable? Ensure it is documented in `.env.example` or the `README.md`.
4. **Action**: If you detect a high blast radius, run the full test suite (not just the local unit tests) and explicitly document the affected areas in your handoff or PR description.