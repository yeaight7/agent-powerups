---
name: plan-phase
description: Create detailed phase plan (PLAN.md files) with verification loop
argument-hint: "[phase] [--research] [--skip-research] [--view] [--gaps] [--skip-verify] [--prd <file>] [--tdd] [--mvp]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
  - WebFetch
---

## Objective

Create executable phase plans (PLAN.md files) for a roadmap phase with integrated research and verification.

**Default flow:** Research (if needed) → Plan → Verify → Done

**Orchestrator role:** Parse arguments, validate phase, run research unless skipped, spawn `phase-planner`, verify plans with `plan-checker`, iterate until pass or 3 iterations, present results.

## Context

Phase number: $ARGUMENTS (optional — auto-detects next unplanned phase if omitted)

**Flags:**
- `--research` — Force re-run of research even if RESEARCH.md already exists
- `--skip-research` — Skip research entirely, go straight to planning
- `--view` — Print existing RESEARCH.md to stdout without re-running research
- `--gaps` — Gap closure mode (reads VERIFICATION.md, skips research, creates fix plans)
- `--skip-verify` — Skip the plan-checker verification loop
- `--prd <file>` — Use a PRD/acceptance criteria file instead of CONTEXT.md from discuss-phase
- `--tdd` — Signal planner to emit Wave 0 test-scaffold tasks before implementation tasks
- `--mvp` — Vertical MVP mode: planner organizes tasks as feature slices (UI→API→DB)

Normalize phase input before any directory lookups: accept `1`, `01`, or `1-name`.

## Process

**Step 1 — Resolve Phase**

Determine the target phase:
- If phase provided: resolve to `{padded_phase}-{slug}` directory under `.planning/phases/`
- If omitted: read ROADMAP.md to find the next unplanned phase

**Step 2 — Research**

Unless `--skip-research` or `--gaps`:
- Check for `.planning/phases/{phase}/RESEARCH.md`
- If exists and no `--research` flag: ask user to choose `update / view / skip`
- If `--view`: print existing RESEARCH.md, then exit
- Otherwise: spawn `phase-researcher` agent to produce RESEARCH.md

**Step 3 — Plan**

Spawn `phase-planner` agent with:
- Phase directory path
- Paths to: STATE.md, PROJECT.md, ROADMAP.md, CONTEXT.md (if exists), RESEARCH.md (if exists)
- Active flags (`--tdd`, `--mvp`, `--gaps`)

Phase-planner writes PLAN.md files directly.

**Step 4 — Verify**

Unless `--skip-verify`:

Spawn `plan-checker` agent to review all PLAN.md files in the phase directory.

If checker returns ISSUES FOUND:
- Pass feedback back to `phase-planner` for revision
- Re-run checker on revised plans
- Repeat up to 3 iterations; report remaining blockers to user if unresolved after 3

**Step 5 — Present Results**

Show the user:
- Number of plans created
- Wave structure (which plans run in parallel)
- Any unresolved warnings from plan-checker

Tell the user:
> "Plans ready. Run `/execute-phase {phase}` to begin execution."

## Success Criteria

- [ ] Phase identified and validated
- [ ] RESEARCH.md produced or skipped per flags
- [ ] PLAN.md files created by phase-planner
- [ ] Plans verified by plan-checker (or skipped per flag)
- [ ] No BLOCKER issues remain in final plans
- [ ] User knows next step (`/execute-phase`)
