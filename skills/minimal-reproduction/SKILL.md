---
name: minimal-reproduction
description: "Use to isolate a bug from a large application into a standalone, runnable script or single test case."
---

# Minimal Reproduction

You cannot reliably fix what you cannot reliably reproduce in isolation. 

## The Subtraction Method

1. **Start with the Failure**: Take the code path that fails.
2. **Remove the UI/Network**: If the bug is reported via a web request, write a script that calls the internal controller directly.
3. **Mock Dependencies**: If the bug doesn't require the database, mock it. If it doesn't require the third-party API, mock it.
4. **Prune Data**: If the bug fails on a 10MB JSON payload, binary search the payload down to the exact 2 keys that trigger the failure.
5. **Final Output**: The result must be a single file that relies on ZERO external state, can be run with a single command, and deterministically outputs the exact error reported.
