---
name: pr-review-ci-loop
description: Use when a pull request needs one bounded review and CI triage cycle with explicit approval before edits or remote writes.
---

## Purpose

Combine PR review and CI failure triage into one human-controlled loop. Review findings and CI logs are inputs; they are not permission for autonomous remote actions.

## When to Use

- A PR needs both technical review and CI failure triage.
- The user wants a single inspect -> summarize -> patch -> recheck cycle.
- Local fixes depend on accurate PR diff and CI log context.

Do not use when the user only asked for a review, only asked for CI diagnosis, or has not approved edits.

## Core Rules

- Remote writes such as push, comment, and request re-review are always opt-in.
- Local changes must be grounded in specific review findings or failing CI checks.
- Prefer GitHub-first flows; treat other CI providers as adaptations.
- Do not apply speculative fixes.

## Inputs

- PR number, branch, or URL
- Repository remote and base branch
- CI provider access, preferably `gh` for GitHub-hosted PRs
- User approval boundary for local edits and remote writes

## Workflow

### 1. Read PR metadata and diff

```bash
gh pr view <pr> --json number,title,author,baseRefName,headRefName,mergeStateStatus,reviewDecision,statusCheckRollup
gh pr diff <pr> --stat
gh pr diff <pr>
```

Record file count, risky areas, generated files, and public API changes.

### 2. Identify review risks

Classify findings by severity:

| Category | What to check |
| --- | --- |
| Correctness | Logic errors, off-by-one, wrong assumptions |
| Tests | Missing coverage for changed behavior, broken assertions |
| Public API | Breaking changes to exports, signatures, or contracts |
| Security | Injection risks, exposed secrets, auth bypass |
| Migration / release risk | Schema changes, feature flags, rollback difficulty |

### 3. Inspect CI failures

```bash
gh pr checks <pr>
gh run view <run-id> --log-failed
```

Extract the first failing assertion or error line. Categorize each failure as code error, flaky, environment, or config.

### 4. Produce one readout

```text
REVIEW FINDINGS:
  [blocking] <description> - <file:line or section>
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

### 5. Apply approved local fixes

- Apply only what the user approves from the readout.
- Run local validation after each fix.
- Keep commits and pushes separate from local edits unless approved.

### 6. Remote follow-up

State the exact operation before running it:

```text
NEXT REMOTE ACTION: git push origin <branch>
EFFECT: updates the remote branch, triggering CI re-run
Approve?
```

## Output

- Combined PR review and CI readout
- Approved local diff, if any
- Validation commands and results
- Proposed remote action, if requested

## Verification

- [ ] PR metadata and full diff were read.
- [ ] Every changed file was considered or explicitly excluded with reason.
- [ ] Review findings have severity and location.
- [ ] CI failures have a cause category and first useful error line.
- [ ] Any local fix was validated before proposing remote follow-up.
- [ ] Remote follow-up was explicitly approved before execution.

## Failure Modes

- Ambiguous review feedback that needs the PR author.
- No access to the PR or CI logs.
- CI failure requires infrastructure changes outside this codebase.
- Fix would require unattended remote writes.
