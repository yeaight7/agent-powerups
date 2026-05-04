---
name: discuss-phase
description: Gather phase context through adaptive questioning before planning.
argument-hint: "<phase> [--all] [--auto]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Task
---

<objective>
Extract implementation decisions that downstream agents need — the `phase-planner` and `phase-researcher` will consume CONTEXT.md to know what to investigate and what choices are locked.

**How it works:**
1. Load prior context (PROJECT.md, REQUIREMENTS.md, STATE.md, prior CONTEXT.md files)
2. Scout codebase for reusable assets and patterns
3. Analyze phase — skip gray areas already decided in prior phases
4. Present remaining gray areas — user selects which to discuss
5. Deep-dive each selected area until satisfied
6. Create CONTEXT.md with decisions that guide research and planning

**Output:** `{phase_num}-CONTEXT.md` — decisions clear enough that downstream agents can act without asking the user again
</objective>

<context>
Phase number: $ARGUMENTS (required)
</context>

<process>

**Step 1 — Load Context**

Read the following if they exist:
- `.planning/PROJECT.md` — project vision and constraints
- `.planning/REQUIREMENTS.md` — numbered requirements
- `.planning/ROADMAP.md` — phase structure and goals
- `.planning/STATE.md` — current project state
- `.planning/phases/XX-name/{phase_num}-CONTEXT.md` — prior discussion for this phase

**Step 2 — Scout Codebase**

Scan the codebase for patterns relevant to this phase:
- Existing utilities and helpers that could be reused
- Established patterns (naming, error handling, folder structure)
- Prior phase artifacts that this phase builds on

**Step 3 — Identify Gray Areas**

For the target phase, identify implementation decisions that are:
- Not yet locked in prior discussions
- Not obviously determined by the project tech stack
- Non-trivial enough to warrant explicit user decision

Skip areas already decided in prior CONTEXT.md files.

**Step 4 — Present and Discuss**

If `--all` flag: present all gray areas.
Otherwise: ask the user which areas they want to discuss. Present them as a numbered list.

For each selected area:
- Explain the decision and its implications
- Present 2-3 concrete options with trade-offs
- Ask for the user's preference
- Ask clarifying follow-ups until the decision is unambiguous

**Step 5 — Handle Scope Creep**

If the user introduces ideas beyond the current phase scope:
- Acknowledge the idea
- Note it as a deferred idea in the CONTEXT.md output
- Redirect to the current phase scope

**Step 6 — Write CONTEXT.md**

Create `.planning/phases/{padded_phase}-{slug}/{phase_num}-CONTEXT.md` (create directory if needed):

```markdown
# Phase [X]: [Name] — Context

**Discussed:** [date]

## Decisions

- **D-01: [Decision area]** — [What was decided]. Rationale: [why]
- **D-02: [Decision area]** — [What was decided]. Rationale: [why]

## Claude's Discretion

Areas where Claude has freedom to choose the best approach:
- [Area]: [Guidance or constraints]

## Deferred Ideas

Ideas mentioned but out of scope for this phase:
- [Idea]: [Why deferred, which phase it belongs to]
```

**Step 7 — Confirm Next Steps**

Tell the user:
> "Context captured. Run `/plan-phase {phase}` to create the implementation plan."

</process>

<success_criteria>
- [ ] Prior context loaded (no re-asking already-decided questions)
- [ ] Gray areas identified through codebase and requirement analysis
- [ ] User chose which areas to discuss
- [ ] Each selected area explored until decision is unambiguous
- [ ] Scope creep redirected to deferred ideas
- [ ] CONTEXT.md captures decisions, not vague vision
- [ ] User knows next step (`/plan-phase`)
</success_criteria>
