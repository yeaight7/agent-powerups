---
name: pr-triage
description: Use when triaging pull requests, stale branches, or review bottlenecks and you need the most relevant actions and merge risks from the freshest repository state available.
---

## Purpose

Identify the pull requests that most deserve attention, highlight blockers and merge risk, and produce a prioritized action list. Translates repository activity into a short execution plan.

## When to Use

- Managing a backlog of open pull requests.
- Unblocking a team by surfacing review debt or stale branches.
- Getting a prioritized view of what to merge, review, rebase, or close.

Do not use for CI debugging — treat CI status as out of scope unless explicitly requested.

## Inputs

- Access to the repository (local git, `gh` CLI, or MCP connector).
- Optional: specific focus area (stale branches, review debt, large diffs).

## Workflow

1. **Establish freshest state available**
   - Priority order: local git → local files → MCP/plugins.
   - If local commands and connector data disagree, call out the mismatch and state which source is trusted.

2. **Gather minimum evidence**
   - Current local branch state.
   - Whether local refs or PR metadata are up to date.
   - The set of open or relevant PRs.
   - File/diff scope for any PR that appears risky or high-priority.

3. **Rank by:**
   1. Urgency
   2. Business impact
   3. Likelihood of merge friction
   4. Blast radius
   5. Whether the change blocks other work

4. **Handle failures** — If a command fails, report the exact command, exact failure mode, and whether results may be incomplete or stale.

## Output

1. **Top actions for today** — Short prioritized list.
2. **Blocked PRs** — What is blocked and why.
3. **PRs that need review now** — Ranked by urgency.
4. **Stale or low-value PRs** — Candidates to rebase, split, close, or deprioritize.
5. **Risks needing human judgment** — Anything requiring a decision beyond triage.

Be concrete. Short prioritized list over long inventory. Call out uncertainty explicitly.

## Verification

- [ ] Freshest available source used
- [ ] Mismatch between sources called out if present
- [ ] Ranking criteria applied (urgency, impact, friction, blast radius, blocking)
- [ ] No code edited

## Failure Modes

- **Stale metadata** — If MCP/plugins used as fallback, mark results as potentially stale.
- **Missing diff context** — Without diff scope, blast radius cannot be assessed accurately. Note this.
- **Scope creep** — Do not attempt CI debugging or code review during triage.
