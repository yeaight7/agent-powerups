---
description: "Safely rename a variable, function, class, or file across the entire repository while ensuring tests continue to pass."
argument-hint: "<old_name> to <new_name>"
---

# Safe Rename Command

## CRITICAL BEHAVIORAL RULES

1. **Test Verification**: Before you change any code, you MUST run the test suite to ensure it is currently green. If tests are failing before you start, stop and report the failure.
2. **Search First**: Do not guess where the name is used. Use a broad grep search to find all occurrences of `<old_name>`.
3. **Atomic Commits**: If the rename spans multiple subsystems, plan to apply the rename incrementally rather than in one massive replace if possible.
4. **Verify**: After applying the rename, run the test suite again. If it fails, revert the change immediately and report the error.

## Execution Steps

1. Run the test suite to confirm a green state.
2. Search the codebase for exact matches of the old name.
3. Apply the rename. Check for casing variations (e.g., `OldName`, `oldName`, `old_name`) if appropriate for the language context.
4. If renaming a file, ensure all import paths referencing that file are also updated.
5. Run the test suite again.
6. Provide a summary of the files modified and the final test output.