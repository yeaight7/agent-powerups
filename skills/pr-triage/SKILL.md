---
name: pr-triage
description: Use when triaging pull requests, stale branches, or review bottlenecks and you need the most relevant actions and merge risks from the freshest repository state available.
---
# PR Triage

Use this skill when the task is to inspect open pull requests, stale branches, or review bottlenecks and produce a prioritized action list.

## Goals

- Identify the PRs that most deserve attention now.
- Highlight blockers, review debt, and merge risk.
- Translate repository activity into a short execution plan for today.

## What to inspect

- Open pull requests
- Draft pull requests
- Stale branches or PRs with merge conflicts
- Review requests waiting too long
- Large or risky diffs
- Changes likely to affect business logic, metrics, or production behavior

Do not spend time on CI status checks in this workflow. Treat them as out of scope unless the user explicitly asks for CI debugging.

## Source of truth

Start by ensuring you have the freshest repository state you can obtain in the current environment.

Priority order:
1. local repository state refreshed with whatever local commands work
2. repository files and local branch metadata
3. MCP/plugins when local commands are unavailable, incomplete, or unreliable

Do not hard-code a requirement to use a specific tool or command. Prefer the narrowest combination of `git`, `gh`, and connector reads that actually works in the current environment.

If local command output and connector metadata disagree, call out the mismatch explicitly and explain which source you are trusting.

## Minimum evidence

At minimum, gather evidence for:
- current local branch state
- whether local refs or PR metadata are up to date
- the set of open or relevant PRs
- the file/diff scope for any PR that appears risky or high-priority

Use concrete commands or connector calls that satisfy those needs, but adapt to the environment instead of forcing a fixed command list.

## Fallback rule

If an important local command fails because of sandboxing, permissions, or environment restrictions, retry with elevated permissions where supported.

Use MCP/plugins when local commands fail completely, return incomplete data, or are known to be unreliable in the current environment.

If fallback is used, explicitly mark the result as potentially stale or less authoritative.

## Failure handling

If a command fails, report:
- exact command
- exact failure mode
- whether the rest of the summary may be incomplete or stale
- whether you retried with elevated permissions, and if not, why not

## Ranking criteria

Rank items using:

1. urgency
2. business impact
3. likelihood of merge friction
4. blast radius
5. whether the change blocks other work

## Output format

Return:

1. top actions for today
2. blocked PRs and why
3. PRs that need review now
4. stale or low-value PRs that should be rebased, split, closed, or deprioritized
5. risks that need human judgment

Do not include CI status checks or check-run summaries in this output unless the user explicitly asked for them.

## Rules

- Be concrete.
- Prefer a short prioritized list over a long inventory.
- Call out uncertainty explicitly.
- Do not edit code unless explicitly asked.
