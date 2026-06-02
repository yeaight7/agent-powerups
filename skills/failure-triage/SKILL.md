---
name: failure-triage
description: "Use when confronted with an unknown failure in CI or production to rapidly categorize the issue before deep debugging."
---

# Failure Triage

Before diving deep into a stack trace or spending hours reproducing a bug, you must triage it to determine the blast radius, subsystem, and debugging approach.

## The Triage Process

1. **Categorize the Failure**:
   - Is it a **Syntax/Build Error**? (Fails before running)
   - Is it a **Logic Error**? (Runs, but produces wrong output)
   - Is it an **Infrastructure/Environment Error**? (Network timeout, missing DB table)
   - Is it a **Flaky/Non-deterministic Error**? (Fails sometimes)
2. **Locate the Origin**:
   - Scan the stack trace. Ignore framework/library internals. Find the highest frame that belongs to the *first-party application code*.
3. **Check Recent Changes**:
   - Run `git log -n 5 --oneline` and `git diff` to see what changed recently. Most bugs are in the newest code.
4. **Formulate a Hypothesis**:
   - State clearly: "I suspect this is an environment error caused by missing configuration, originating in `src/config.ts`."

Do not start writing fixes until you have explicitly stated your triage hypothesis and confirmed the category.