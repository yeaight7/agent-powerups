---
name: map-codebase
description: Analyze codebase with parallel mapper agents to produce .planning/codebase/ documents
argument-hint: "[--fast [--focus tech|arch|quality|concerns]] [area]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

<objective>
Analyze existing codebase using parallel codebase-mapper agents to produce structured codebase documents.

Each mapper agent explores a focus area and **writes documents directly** to `.planning/codebase/`. The orchestrator only receives confirmations, keeping context usage minimal.

Output: `.planning/codebase/` folder with up to 7 structured documents about the codebase state.
</objective>

<flags>
- **--fast**: Lightweight scan mode — spawns one mapper agent instead of four. Accepts an optional `--focus` value: `tech`, `arch`, `quality`, `concerns`, or `tech+arch` (default). Faster and lower-context than the full map.
- **(no flag)**: Full parallel map — spawns 4 mapper agents to produce all 7 codebase documents.
</flags>

<context>
Arguments: $ARGUMENTS

Parse the first token of $ARGUMENTS:
- If it is `--fast`: strip the flag, run lightweight scan (passing remaining args including optional --focus).
- Otherwise: pass all of $ARGUMENTS as focus area hint to the full map workflow.

**Load project state if exists:**
Check for `.planning/STATE.md` — loads context if project is already initialized.

**This command can run:**
- Before `/new-project` (brownfield codebases) — create codebase map first
- After `/new-project` (greenfield codebases) — update codebase map as code evolves
- Anytime to refresh codebase understanding
</context>

<when_to_use>
**Use map-codebase for:**
- Brownfield projects before initialization (understand existing code first)
- Refreshing codebase map after significant changes
- Onboarding to an unfamiliar codebase
- Before major refactoring (understand current state)

**Skip map-codebase for:**
- Greenfield projects with no code yet (nothing to map)
- Trivial codebases (fewer than 5 files)
</when_to_use>

<process>

**Full map (no flags):**

1. Check if `.planning/codebase/` already exists — if yes, offer to refresh or skip.
2. Create `.planning/codebase/` directory if it doesn't exist.
3. Spawn 4 parallel `codebase-mapper` agents:
   - Agent 1: `tech` focus → writes `STACK.md`, `INTEGRATIONS.md`
   - Agent 2: `arch` focus → writes `ARCHITECTURE.md`, `STRUCTURE.md`
   - Agent 3: `quality` focus → writes `CONVENTIONS.md`, `TESTING.md`
   - Agent 4: `concerns` focus → writes `CONCERNS.md`
4. Wait for all agents to complete, collect confirmations (NOT document contents).
5. Verify all 7 documents exist with line counts.
6. Present summary and suggest next steps (typically: `/new-project` or `/plan-phase`).

**Fast scan (--fast flag):**

1. Determine focus from `--focus` value (default: `tech+arch`).
2. Spawn a single `codebase-mapper` agent with the specified focus.
3. Wait for agent completion and report.

</process>

<success_criteria>
- [ ] `.planning/codebase/` directory created
- [ ] All documents for chosen mode written by mapper agents
- [ ] Documents follow template structure (see `templates/` directory)
- [ ] Parallel agents completed without errors
- [ ] User knows next steps
</success_criteria>
