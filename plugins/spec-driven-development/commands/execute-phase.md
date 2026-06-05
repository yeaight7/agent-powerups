---
name: execute-phase
description: Execute all plans in a phase with wave-based parallelization
argument-hint: "<phase-number> [--wave N] [--gaps-only] [--interactive] [--tdd]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - TodoWrite
  - AskUserQuestion
---

## Objective

Execute all plans in a phase using wave-based parallel execution.

Orchestrator stays lean: discover plans, analyze dependencies, group into waves, spawn subagents, collect results. Each subagent (`phase-executor`) handles its own plan independently.

Context budget: ~15% orchestrator, 100% fresh per subagent.

## Context

Phase: $ARGUMENTS

**Available flags (active only when present in $ARGUMENTS):**
- `--wave N` — Execute only Wave `N`. Use to pace execution or stay within usage limits.
- `--gaps-only` — Execute only gap closure plans (plans with `gap_closure: true` in frontmatter).
- `--interactive` — Execute plans sequentially inline (no subagents) with user checkpoints between tasks. Lower token usage, pair-programming style.

## Process

**Step 1 — Resolve Phase**

Read `.planning/STATE.md` and `.planning/ROADMAP.md` to find the phase directory under `.planning/phases/`.

**Step 2 — Discover Plans**

Glob all `*-PLAN.md` files in the phase directory. Parse each plan's frontmatter to extract:
- `wave` number
- `depends_on` list
- `autonomous` flag
- `files_modified` list

**Step 3 — Filter**

Apply active flags:
- `--wave N`: keep only plans with `wave: N`
- `--gaps-only`: keep only plans with `gap_closure: true`
- Otherwise: include all incomplete plans

**Step 4 — Execute by Wave**

Group plans into waves. For each wave (lowest number first):

- Verify all plans in prior waves are complete before starting this wave
- If `--interactive`: execute plans one at a time inline, pause between each for user review
- Otherwise: spawn one `phase-executor` subagent per plan in the wave, in parallel

Collect completion results from each subagent (PLAN COMPLETE format or CHECKPOINT REACHED format).

**Step 5 — Handle Checkpoints**

If any executor returns `CHECKPOINT REACHED`:
- Surface the checkpoint message to the user immediately
- Wait for user response before spawning the next wave

**Step 6 — Phase Completion Check**

After all waves finish (or after the selected wave if `--wave` was active):

If no incomplete plans remain:
- Report phase complete
- Suggest: `/verify-work {phase}` to run UAT

If incomplete plans remain after the last wave:
- List incomplete plans and reasons
- Suggest next step to the user

## Success Criteria

- [ ] Phase and plan files resolved
- [ ] Plans grouped by wave with dependency order enforced
- [ ] Each plan executed by a phase-executor subagent (or inline if --interactive)
- [ ] Checkpoint messages surfaced to user
- [ ] Phase completion status reported
- [ ] User knows next step
