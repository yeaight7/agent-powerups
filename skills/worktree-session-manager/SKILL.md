---
name: worktree-session-manager
description: Create isolated git worktrees and optional local sessions for issues, PRs, and feature branches. Use when parallel task isolation matters and you want safe setup and cleanup defaults.
---

# Worktree Session Manager

Use this skill to isolate work without mutating the main checkout.

## When to Use

- One repo needs multiple concurrent task branches
- You are reviewing a PR while keeping feature work separate
- You want a clean workspace per issue, bug, or experiment

## Do Not Use

- The current checkout is already the correct isolated branch
- The task is a tiny edit with no branch or workspace risk

## Core Rules

- Prefer `git worktree` over duplicate clones
- Keep one task per worktree
- Use explicit branch names and explicit base branches
- Optional terminal/session tooling is fine, but not required
- Do not recommend permission bypass flags as a normal workflow
- Do not delete worktrees or branches unless the user asked for cleanup

## Workflow

1. **Resolve the task**
   - Identify the repo, base branch, and task label.
   - Confirm whether this is review, fix, or feature work.

2. **Create the worktree**
   - Use a predictable path under a repo-local or user-chosen worktree root.
   - Create or attach the task branch explicitly.

3. **Initialize the session**
   - Inspect `git status`
   - Open the repo in the new worktree
   - Optionally start a terminal/session manager if the user already uses one

4. **Work inside the isolated tree**
   - Keep edits, tests, and temporary state local to that worktree
   - Avoid cross-worktree mutations unless intentional

5. **Close or keep alive**
   - If the task remains active, leave the worktree in place
   - If the user wants cleanup, confirm merge state first, then remove the worktree explicitly

## Suggested Commands

```bash
git worktree list
git worktree add ../repo-feature branch-name
git -C ../repo-feature status --short
```
