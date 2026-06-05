---
name: new-project
description: Initialize a new project with deep context gathering and PROJECT.md
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

## Context

**Flags:**
- `--auto` — Automatic mode. After config questions, runs research → requirements → roadmap without further interaction.

## Objective

Initialize a new project through a unified flow: questioning → research (optional) → requirements → roadmap.

**Creates:**
- `.planning/PROJECT.md` — project context and vision
- `.planning/config.json` — workflow preferences
- `.planning/research/` — domain research (optional)
- `.planning/REQUIREMENTS.md` — scoped requirements
- `.planning/ROADMAP.md` — phase structure
- `.planning/STATE.md` — project memory

**After this command:** Run `/discuss-phase 1` then `/plan-phase 1` to start execution.

## Process

**Step 1 — Project Intake**

Ask the user:
1. Project name and one-line description
2. Problem being solved / user goal
3. Technology constraints (required stack, existing systems to integrate with)
4. Target users and scale
5. MVP scope — what's in phase 1 vs deferred

Collect answers before proceeding. In `--auto` mode, extract these from any provided idea document.

**Step 2 — Research (optional)**

If the domain is unfamiliar or the user wants it: spawn a `phase-researcher` agent to investigate the tech domain and write `.planning/research/RESEARCH.md`.

Skip research if:
- Codebase already exists (brownfield — use `/map-codebase` instead)
- User confirms they know the stack

**Step 3 — Write Planning Documents**

Create `.planning/PROJECT.md`:
```markdown
# [Project Name]

## Vision
[One paragraph from the user's description]

## Problem Statement
[What the user is trying to solve]

## Technology Stack
[Required/chosen tech]

## Target Users
[Who uses this]

## Constraints
[Hard requirements, non-negotiables]
```

Create `.planning/config.json`:
```json
{
  "version": "1.0",
  "workflow": {
    "discuss_mode": "discuss",
    "research_enabled": true
  }
}
```

**Step 4 — Requirements**

Derive requirements from the project intake. Write `.planning/REQUIREMENTS.md` with:
- Functional requirements (what it does), numbered REQ-01, REQ-02, …
- Non-functional requirements (performance, security, scale)
- Out-of-scope items (explicit exclusions)

**Step 5 — Roadmap**

Break requirements into phases. Each phase: one cohesive deliverable a user can verify. Write `.planning/ROADMAP.md`:
```markdown
# Roadmap

## Phase 1: [Name]
**Goal:** [One sentence]
**Requirements:** REQ-01, REQ-02
**Deliverable:** [What the user sees when done]

## Phase 2: [Name]
...
```

**Step 6 — State**

Create `.planning/STATE.md`:
```markdown
# Project State

**Current Phase:** 1
**Status:** initialized
**Last Updated:** [date]
```

**Step 7 — Confirm and Guide**

Show the user a summary of what was created. Tell them the next step:
> "Run `/discuss-phase 1` to gather context for Phase 1, then `/plan-phase 1` to create the implementation plan."

## Success Criteria

- [ ] Project intake complete (name, goal, stack, scope)
- [ ] `.planning/PROJECT.md` written with project context
- [ ] `.planning/config.json` written
- [ ] `.planning/REQUIREMENTS.md` written with numbered requirements
- [ ] `.planning/ROADMAP.md` written with phase breakdown
- [ ] `.planning/STATE.md` written with initial state
- [ ] User knows next steps
