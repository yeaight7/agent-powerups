# debug

Use when a bug needs systematic diagnosis before a fix is attempted.

Steps:

1. Reproduce the failure. Run the smallest command or test that triggers it.
2. Read the error output in full. Identify the exact file and line.
3. Read the relevant source. Understand what the code was supposed to do.
4. Form one specific hypothesis: what is wrong and why.
5. Verify the hypothesis with a targeted test or log — do not fix yet.
6. Apply the minimal fix that addresses the root cause.
7. Re-run the original reproduction step. Confirm the failure is gone.
8. Run the full test suite to check for regressions.

Do not apply speculative fixes. One hypothesis, one verification, one fix.
