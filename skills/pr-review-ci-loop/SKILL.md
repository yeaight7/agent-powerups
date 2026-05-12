---
name: pr-review-ci-loop
description: Run a review and CI loop around a pull request with explicit approval gates for code changes, remote writes, and follow-up actions.
---

# PR Review CI Loop

This is an experimental skill for trust-sensitive PR iteration.

## When to Use

- A PR needs both technical review and CI triage
- The user wants one workflow for inspect -> summarize -> patch -> recheck
- Local fixes depend on accurate PR and CI context

## Core Rules

- Review and CI are inputs to a human-controlled loop, not permission for autonomous remote actions
- Remote writes are always opt-in
- Local changes should be grounded in specific review findings or failing checks
- Prefer GitHub-first flows; treat other providers as optional adaptations

## Loop

1. Read the PR diff and metadata.
2. Identify review risks:
   - correctness
   - tests
   - public API
   - security
   - migration or release risk
3. Inspect CI failures if present.
4. Produce one combined readout:
   - blocking findings
   - likely fixes
   - validation plan
5. Apply approved local fixes.
6. Re-run local validation.
7. If the user wants remote follow-up, prepare the next action explicitly:
   - push
   - comment
   - request re-review

## Stop Conditions

- Ambiguous review feedback
- Missing PR access
- External CI provider with no actionable local logs
- Changes that would require unattended remote writes
