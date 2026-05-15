---
name: pr-review-ci-loop
description: Run a review and CI loop around a pull request with explicit approval gates for code changes, remote writes, and follow-up actions.
---

# PR Review CI Loop

Experimental skill for trust-sensitive PR iteration. Review and CI are inputs to a human-controlled loop — not permission for autonomous remote actions.

## When to Use
- A PR needs both technical review and CI failure triage in one workflow.
- The user wants a single inspect → summarize → patch → recheck cycle.
- Local fixes depend on accurate PR diff and CI log context.

## Core Rules
- Remote writes (push, comment, request re-review) are always opt-in.
- Local changes must be grounded in specific review findings or failing CI checks.
- Prefer GitHub-first flows; treat other CI providers as optional adaptations.
- Do not apply speculative fixes — only fix what the review or CI explicitly identified.

## Loop

### Step 1 — Read the PR
- Fetch diff and PR metadata (title, description, labels, reviewers, target branch).
- Note: file count, line count, and whether any auto-generated files are included.

### Step 2 — Identify review risks

Classify findings by severity:

| Category | What to check |
|---|---|
| Correctness | Logic errors, off-by-one, wrong assumptions |
| Tests | Missing coverage for changed behavior, broken assertions |
| Public API | Breaking changes to exports, signatures, or contracts |
| Security | Injection risks, exposed secrets, auth bypass |
| Migration / release risk | Schema changes, feature flags, rollback difficulty |

### Step 3 — Inspect CI failures (if present)
- Identify which checks failed: lint, type-check, unit tests, integration tests, build.
- Distinguish: flaky failure vs code error vs environment issue vs config problem.
- Extract the first failing assertion or error line — not the full log.

### Step 4 — Produce one combined readout

```
REVIEW FINDINGS:
  [blocking] <description> — <file:line or section>
  [non-blocking] <description>

CI FAILURES:
  <check name>: <first error line>
  Likely cause: <code error / flaky / env / config>

LIKELY FIXES:
  1. <specific change>
  2. <specific change>

VALIDATION PLAN:
  - Run: <command>
  - Expected: <outcome>
```

### Step 5 — Apply approved local fixes
- Apply only what the user approves from the readout.
- Run local validation after each fix.

### Step 6 — Remote follow-up (opt-in only)
If the user wants remote action, state the exact operation first:

```
NEXT REMOTE ACTION: git push origin <branch>
EFFECT: updates the remote branch, triggering CI re-run
Approve?
```

## Validation / Done Criteria
- PR diff was fully read and all changed files were considered.
- Every review finding is classified as blocking or non-blocking with a specific location.
- Every CI failure is attributed to a cause category (code error / flaky / env / config).
- Any local fix applied was validated locally before a remote action was proposed.
- Remote follow-up action (if any) was explicitly stated and approved before execution.

## Stop Conditions
- Ambiguous review feedback that cannot be resolved without the PR author.
- No access to the PR or its CI logs.
- CI failure requires infrastructure changes outside this codebase.
- Fix would require unattended remote writes.
