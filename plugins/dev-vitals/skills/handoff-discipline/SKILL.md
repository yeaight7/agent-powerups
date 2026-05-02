---
name: handoff-discipline
description: "Use when completing a task or running out of context limit. Ensures the next session or human engineer has exactly what they need to resume work instantly."
---

# Handoff Discipline

When ending a session, handing a task back to the user, or preparing to swap to a new context window, you must leave a clean paper trail.

## The Handoff Rules

1. **State the End Condition**: Explain exactly why you are stopping (e.g., "Task complete", "Blocked on PR", "Context window too large").
2. **Leave a Breadcrumb**: If the task is incomplete, summarize the last successful step, the current failing step, and the *exact next command* to run.
3. **Commit or Stash**: Ensure the working directory is clean. Either commit the work, tell the user to commit, or stash it. Do not leave unverified messy state.
4. **Link the Work**: Provide file paths to the modified files or generated artifacts so the next agent/user doesn't have to search for them.

## The Handoff Summary Format
When creating a handoff summary file (e.g., `handoff.md`), use this exact structure:

```markdown
### 1. Goal
[1-2 sentences on what we were trying to do]

### 2. State
- ✅ Completed: [What works]
- 🚧 In Progress: [What is broken or partial]
- 🛑 Blockers: [What stopped us]

### 3. Next Steps
1. Run `npm test ...`
2. Fix the error in `src/foo.ts` around line X.
```