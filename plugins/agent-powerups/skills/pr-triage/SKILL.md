---
name: pr-triage
description: Use when triaging pull requests, stale branches, or review bottlenecks and you need the most relevant actions and merge risks from the freshest repository state available.
---

# PR Triage

## Purpose

Identify which pull requests deserve attention now, what is blocked, and where merge risk is highest.

## When to Use

- Managing a backlog of open pull requests
- Surfacing review debt or stale branches
- Prioritizing review and merge work

Do not use for CI debugging unless explicitly requested.

## Requirements

Preferred tools:

- local git
- optional `gh` CLI or repository connector

Optional `gh` check:

```powershell
Get-Command gh -ErrorAction SilentlyContinue
gh auth status
```

## Inputs

- Access to local git state, `gh`, connector data, or a combination
- Optional focus area such as stale branches or review debt

## Workflow

1. Use the freshest source available: local git first, then local files, then connectors.
2. Gather minimum evidence:
   current branch state, open PR set, stale markers, risky diff scope.
3. Rank by urgency, impact, merge friction, blast radius, and blocking effect.
4. Report uncertainty explicitly when source data is partial or stale.

## Output

1. Top actions for today
2. Blocked PRs
3. PRs needing review now
4. Stale or low-value PRs
5. Risks needing human judgment

## Verification

- [ ] Freshest available source was used
- [ ] Source mismatches were called out
- [ ] Ranking criteria were applied
- [ ] No code was edited

## Failure Modes

- stale metadata
- missing diff context
- scope creep into debugging or review

## Missing Dependency Behavior

If `gh` is missing or unauthenticated:

1. Use local git state or connector data instead.
2. Mark GitHub-hosted metadata as partial or stale.
3. Do not pretend PR metadata came from `gh`.
