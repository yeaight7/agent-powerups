---
description: "Isolate a bug report into a minimal, standalone reproduction script or test case."
argument-hint: "<issue description or stacktrace>"
---

# Create Reproduction

## CRITICAL BEHAVIORAL RULES

1. **Stop at Reproduction**: Your goal is a failing test, not a passing test. Do not fix the application code.
2. **Verify the Failure**: You must run your reproduction script and verify that its output matches the reported bug before presenting it.

## Execution Steps

1. **Read the Report**: Analyze `$ARGUMENTS` to understand the expected behavior vs. the actual behavior.
2. **Draft a Minimal Script**: Create `repro.<ext>` (or a standalone test file) that isolates the failing component. Strip out unrelated setup, routing, or UI logic.
3. **Execute**: Run the script.
   - If it passes: You missed the bug context. Add back complexity until it fails.
   - If it fails with a different error: You missed a dependency or setup step. Fix the setup.
   - If it fails with the reported error: You succeeded.
4. **Finalize**: Output the exact command to run the script and the output it generates. Ask the user if they want to pass this repro to the `root-cause-debugger` or `debug` command.