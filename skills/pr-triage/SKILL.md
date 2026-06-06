---
name: pr-triage
description: Use when open pull requests, stale branches, or review bottlenecks need prioritization from current repository state.
---

## Purpose

Rank pull requests by urgency, impact, merge risk, and blocking effect so review time goes to the most important work first.

## When to Use

- Managing a backlog of open pull requests.
- Surfacing review debt or stale branches.
- Prioritizing review and merge work.
- Preparing a short daily or weekly PR action list.

Do not use for deep code review or CI debugging unless explicitly requested.

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
- Optional focus area such as stale branches, blocked reviews, or high-risk merges
- Optional base branch and repository remote

## Workflow

1. Use the freshest source available.

```bash
git status --short
git branch --show-current
git log --oneline --decorate -n 20
```

2. Gather PR metadata when GitHub CLI is available:

```bash
gh pr list --state open --json number,title,author,updatedAt,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup,labels
gh pr view <pr> --json files,additions,deletions,reviewDecision,mergeStateStatus,statusCheckRollup
```

3. Rank each PR.

| Signal | Higher priority when |
| --- | --- |
| Blocking effect | Other work depends on it |
| Review age | It is stale but still relevant |
| Merge state | It has conflicts or failing required checks |
| Blast radius | It touches public API, auth, data, migrations, or shared infra |
| Size | It is small enough to unblock quickly or too large to ignore |

4. Separate action types:

- review now
- ask author for changes
- wait for CI
- rebase or resolve conflicts
- close or defer

5. Report uncertainty when source data is partial or stale.

## Output

```text
PR TRIAGE:
Top actions:
1. <PR> - <action> - <reason>

Blocked:
- <PR> - <blocker>

Review now:
- <PR> - <why now>

Stale/defer:
- <PR> - <reason>

Risks:
- <risk needing human judgment>
```

## Verification

- [ ] Freshest available source was used.
- [ ] Source mismatches or missing metadata were called out.
- [ ] Ranking criteria were applied consistently.
- [ ] Each top PR has a concrete next action.
- [ ] No code was edited.

## Failure Modes

- Using stale PR metadata without saying so.
- Ranking by age only and ignoring merge risk.
- Turning triage into deep review or debugging.
- Pretending `gh` data exists when the CLI is missing or unauthenticated.

## Missing Dependency Behavior

If `gh` is missing or unauthenticated:

1. Use local git state or connector data instead.
2. Mark GitHub-hosted metadata as partial or stale.
3. Do not present PR status, checks, or review state as current unless verified.
