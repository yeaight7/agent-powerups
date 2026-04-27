---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements.
---

# Requesting Code Review

## Purpose

Dispatch a focused reviewer with enough context to catch bugs, requirement gaps, and risky assumptions before merge.

## When to Use

- After a major feature
- Before merge
- After a complex bug fix
- During multi-task execution when review checkpoints matter

## Requirements

Preferred inputs:

- local git range
- written requirements or plan

Helpful check:

```powershell
git rev-parse --is-inside-work-tree
```

## Inputs

- What was implemented
- Requirements or plan
- Base and head revisions, if available

## Workflow

1. Get the git range when local git is available.

```powershell
git rev-parse origin/main
git rev-parse HEAD
```

2. Dispatch a reviewer using `references/code-reviewer.md`.
3. Include summary, requirements, and diff range.
4. Fix critical issues first, then important ones.

## Output

- strengths
- critical, important, and minor issues
- recommendations
- merge readiness assessment

## Verification

- [ ] Reviewer received requirements or plan
- [ ] Reviewer received a diff range or equivalent context
- [ ] Critical issues were not ignored
- [ ] Important issues were resolved or explicitly deferred

## Failure Modes

- skipping review
- incomplete diff context
- ignoring critical issues
- accepting feedback blindly

## Missing Dependency Behavior

If local git range is unavailable:

1. Say local git context is missing.
2. Ask for an explicit diff, patch, or file list.
3. Do not pretend a git-based review scope was provided.
