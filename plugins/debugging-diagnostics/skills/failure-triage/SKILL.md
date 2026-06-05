---
name: failure-triage
description: Use when confronted with an unknown failure in CI or production, before committing to a deep debugging approach.
---

## Purpose

Before diving deep into a stack trace or spending hours reproducing a bug, triage it to determine the blast radius, subsystem, and debugging approach. Do not start writing fixes until you have explicitly stated your triage hypothesis and confirmed the category.

## When to Use

- A CI job or production system is failing and the cause is unknown
- A bug report arrives without a clear owner or subsystem
- Before choosing between deep debugging, bisecting, or reproduction work

## Inputs

- The failure signal: stack trace, CI log excerpt, or error report
- The repo, for recent-change inspection

## Workflow

1. **Categorize the failure:**
   - **Syntax/Build error** — fails before running
   - **Logic error** — runs, but produces wrong output
   - **Infrastructure/Environment error** — network timeout, missing DB table
   - **Flaky/Non-deterministic error** — fails sometimes

2. **Locate the origin.** Scan the stack trace. Ignore framework/library internals. Find the highest frame that belongs to the *first-party application code*:

   ```bash
   # surface first-party frames (adjust the path filter to the repo layout)
   grep -n "src/" stacktrace.txt | head -20
   ```

3. **Check recent changes.** Most bugs are in the newest code:

   ```bash
   git log -n 5 --oneline
   git diff HEAD~5 --stat
   git log -n 10 --oneline -- <suspect-file-or-dir>
   ```

4. **Formulate a hypothesis.** State clearly: "I suspect this is an environment error caused by missing configuration, originating in `src/config.ts`."

## Output

- A stated category (build / logic / environment / flaky)
- The suspected origin file or subsystem
- An explicit triage hypothesis, before any fix is attempted

## Verification

- [ ] Failure assigned to exactly one category
- [ ] Origin frame identified in first-party code, not framework internals
- [ ] Recent commits checked for related changes
- [ ] Hypothesis stated explicitly before any fix was written

## Failure Modes

- **Fixing before triaging** — patching the symptom at the crash site while the root cause lives elsewhere.
- **Blaming the framework** — the highest *first-party* frame is the lead; library internals rarely are.
- **Skipping recent history** — `git log` is the cheapest triage tool available; check it before anything expensive.
