---
name: strategic-context-compaction
description: Compact context at logical phase boundaries — after research, after planning, after debugging — rather than mid-task. Preserves useful state while clearing noise.
---

# Strategic Context Compaction

Compact at logical boundaries to preserve high-value context while clearing noise. Arbitrary or mid-task compaction loses critical state.

## When to Compact

| Transition | Compact? | Reason |
| --- | --- | --- |
| Research → Planning | **Yes** | Research context is bulky; the plan is the distilled output |
| Planning → Implementation | **Yes** | Plan is saved in tasks/files; context is free to reset |
| Implementation → Testing | **Maybe** | Keep if tests reference recent code; compact if switching focus area |
| Debugging → Next feature | **Yes** | Debug traces pollute unrelated work |
| Mid-implementation | **No** | Losing file paths, variable names, partial state is costly |
| After a failed approach | **Yes** | Clear dead-end reasoning before trying a new approach |

## Before Compacting

Save anything you cannot reconstruct cheaply:

- Write the plan to a task list or file before compacting after research
- Commit or stash work-in-progress code before compacting after debugging
- Note key file paths in the next prompt if they will be needed again

## What Survives Compaction

| Survives | Lost |
| --- | --- |
| CLAUDE.md / AGENTS.md instructions | Intermediate reasoning |
| Task list (TodoWrite) | File contents read in session |
| Files on disk | Tool call history |
| Git state | Verbally stated preferences |
| Memory files | Multi-step conversation context |

## Compaction Discipline

- Do not compact to "clean up" during active multi-file implementation
- Do compact when starting a conceptually distinct task in the same session
- Use a summary prompt with `/compact`: `/compact — now implementing auth middleware per plan`
- After compaction, re-read the task list or plan file to restore intent

## Token Awareness

- Each loaded skill adds 1–5K tokens to context
- Load skills on demand, not at session start
- CLAUDE.md / AGENTS.md are always loaded; keep them lean
- Duplicate instructions (root config + plugin skill) are the most common waste
