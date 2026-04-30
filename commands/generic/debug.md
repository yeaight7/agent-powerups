# debug

Purpose: Reproduce-isolate-fix loop that prevents speculative patching.

1. Reproduce the failure with the smallest possible case.
2. Read the full error. Locate the exact file and line involved.
3. Read the surrounding source code for context.
4. Form one specific hypothesis about the root cause.
5. Verify the hypothesis (add a log, write an assertion, check the value).
6. Apply the minimal fix that addresses only the verified cause.
7. Re-run the reproduction step. Confirm fixed.
8. Run the full test suite. Confirm no regressions.

One hypothesis. One fix. No guessing.
