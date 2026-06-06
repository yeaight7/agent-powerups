---
name: handoff-discipline
description: Use when ending a session, handing a task back to the user, or approaching the context limit with work unfinished -- the next session or engineer must be able to resume the work instantly.
---

## Purpose

When ending a session, handing a task back to the user, or preparing to swap to a new context window, you must leave a clean paper trail — exactly what the next session or human engineer needs to resume work instantly.

## When to Use

- A task ends (complete or not) and someone else picks it up next
- The context window is nearly full mid-task
- Work is blocked and must pause on an external dependency

## Inputs

- The session's actual state: what ran, what passed, what is mid-flight
- The repo's working-tree status

## Workflow

1. **State the end condition.** Explain exactly why you are stopping (e.g., "Task complete", "Blocked on PR", "Context window too large").

2. **Leave a breadcrumb.** If the task is incomplete, summarize the last successful step, the current failing step, and the *exact next command* to run. Record discovered constraints and dead ends so the next session doesn't retry them.

3. **Commit or stash.** Ensure the working directory is clean. Either commit the work, tell the user to commit, or stash it. Do not leave unverified messy state:

   ```bash
   git status --short                     # what is uncommitted?
   git stash push -m "handoff: <task>"    # if not committing
   ```

4. **Link the work.** Provide file paths to the modified files or generated artifacts so the next agent/user doesn't have to search for them.

5. **Write the handoff summary** (a handoff markdown file, or the final message) using this exact structure:

   ```markdown
   ### 1. Goal
   [1-2 sentences on what we were trying to do]

   ### 2. State
   - ✅ Completed: [What works]
   - 🚧 In Progress: [What is broken or partial]
   - 🛑 Blockers: [What stopped us]
   - ⚠️ Dead ends: [Approaches tried that failed, and why]

   ### 3. Next Steps
   1. Run `npm test ...`
   2. Fix the error in `src/foo.ts` around line X.
   ```

## Output

- A handoff summary in the Goal / State / Next Steps format
- A clean, committed, or explicitly stashed working tree, with artifact paths linked

## Verification

- [ ] End condition stated explicitly
- [ ] Next command is runnable verbatim by the next session — no "continue where I left off"
- [ ] Working tree clean, committed, or stashed — confirmed with git status, not assumed
- [ ] Every modified or generated file linked by path
- [ ] State section separates completed, in-progress, and blocked honestly

## Failure Modes

- **Vague resumption** — "continue the refactor" instead of the exact failing step and next command.
- **Dirty-tree handoff** — uncommitted, unexplained changes the next session must reverse-engineer.
- **Completed-only reporting** — hiding the broken parts makes the handoff a trap.
- **Unlinked artifacts** — the next agent burns context searching for files you could have named.
