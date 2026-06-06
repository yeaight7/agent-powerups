---
name: strategic-context-compaction
description: Use when deciding whether to compact agent context -- the window is filling up, you are about to switch from one phase to another (research, planning, implementation, debugging), a failed approach left dead-end reasoning, or a previous mid-task compaction lost critical state.
---

## Purpose

Compact at logical boundaries to preserve high-value context while clearing noise. Arbitrary or mid-task compaction loses critical state -- file paths, variable names, partial reasoning -- that is expensive to reconstruct.

## When to Use

- The context window is filling and you are at a phase boundary (research, planning, implementation, debugging)
- A failed approach left dead-end reasoning that pollutes the next attempt
- You are starting a conceptually distinct task in the same session
- A prior mid-task compaction dropped state you then had to rebuild

## Inputs

- The current session state and which phase transition is approaching
- Knowledge of what is already saved durably (task list, files, git, memory) versus only in conversation

## Workflow

1. **Decide whether to compact by transition.** Use the boundary table; default to NOT compacting mid-work.

   | Transition | Compact? | Reason |
   | --- | --- | --- |
   | Research -- Planning | Yes | Research context is bulky; the plan is the distilled output |
   | Planning -- Implementation | Yes | Plan is saved in tasks/files; context is free to reset |
   | Implementation -- Testing | Maybe | Keep if tests reference recent code; compact if switching focus area |
   | Debugging -- Next feature | Yes | Debug traces pollute unrelated work |
   | Mid-implementation | No | Losing file paths, variable names, partial state is costly |
   | After a failed approach | Yes | Clear dead-end reasoning before trying a new approach |

2. **Save anything you cannot reconstruct cheaply before compacting.**
   - Write the plan to a task list or file before compacting after research
   - Commit or stash work-in-progress code before compacting after debugging
   - Note key file paths in the next prompt if they will be needed again

3. **Know what survives versus what is lost.** Anything in the Lost column must be persisted in step 2 first.

   | Survives | Lost |
   | --- | --- |
   | CLAUDE.md / AGENTS.md instructions | Intermediate reasoning |
   | Task list (TodoWrite) | File contents read in session |
   | Files on disk | Tool call history |
   | Git state | Verbally stated preferences |
   | Memory files | Multi-step conversation context |

4. **Compact with an intent-carrying summary prompt, then restore.**
   - Do not compact to "clean up" during active multi-file implementation
   - Pass forward intent, e.g. `/compact -- now implementing auth middleware per plan`
   - After compaction, re-read the task list or plan file to restore intent

## Output

- A compaction decision (do it now / wait until the next boundary) with the reason
- A pre-compaction save of any non-reconstructible state (plan file, commit/stash, noted paths)
- A summary prompt that carries intent into the cleared context

## Token Awareness

- Each loaded skill adds 1-5K tokens to context; load skills on demand, not at session start
- CLAUDE.md / AGENTS.md are always loaded -- keep them lean
- Duplicate instructions (root config plus plugin skill) are the most common waste

## Verification

- [ ] The chosen action matches the transition table -- no compaction during active multi-file implementation
- [ ] Everything in the Lost column that is still needed was persisted (file, commit/stash, or next prompt) before compacting
- [ ] The compact prompt carries forward intent rather than clearing blindly
- [ ] After compaction, the task list or plan file was re-read to restore intent

## Failure Modes

- **Mid-task compaction** — compacting during active multi-file work and losing paths, variable names, and partial state that must then be rebuilt.
- **Compacting before saving** — clearing context while the plan, WIP code, or key paths live only in conversation and not on disk or in tasks.
- **Blind compaction** — using `/compact` with no intent summary, so the cleared session has no direction and re-derives the goal.
- **Skipping the restore step** — not re-reading the task list or plan after compaction, then drifting from the original intent.
