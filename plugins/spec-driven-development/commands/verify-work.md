---
name: verify-work
description: Validate built features through conversational UAT
argument-hint: "[phase number, e.g., '4']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Edit
  - Write
  - Task
---

<objective>
Validate built features through conversational testing with persistent state.

Purpose: Confirm what was built actually works from the user's perspective. One test at a time, plain text responses, no interrogation. When issues are found, automatically diagnose, plan fixes, and prepare for re-execution.

Output: `{phase_num}-UAT.md` tracking all test results. If issues found: diagnosed gaps and fix plans ready for `/execute-phase`.
</objective>

<context>
Phase: $ARGUMENTS (optional)
- If provided: test specific phase (e.g., "4")
- If not provided: check STATE.md for active phase, or ask user
</context>

<process>

**Step 1 — Load Phase Context**

Read:
- `.planning/phases/{phase}/SUMMARY.md` files (what was built)
- `.planning/REQUIREMENTS.md` (what was required)
- `.planning/ROADMAP.md` (phase goal)
- `.planning/phases/{phase}/{phase_num}-UAT.md` if a prior session exists (resume from last passing test)

**Step 2 — Derive Test Scenarios**

From the phase SUMMARY.md and requirements, derive a list of test scenarios:
- One scenario per user-facing behavior
- Ordered from most critical to least
- Include happy path and key error cases

**Step 3 — Present Tests One at a Time**

For each scenario:
1. Describe the test in plain language: "Try doing X. You should see Y."
2. Wait for user's response (pass / fail / skip / notes)
3. Record result in UAT tracking

Do NOT present multiple tests at once. Do NOT ask the user to run commands.

**Step 4 — Handle Failures**

For each failed test:
1. Diagnose the failure: read relevant code to understand root cause
2. Describe the issue clearly
3. Create a gap closure PLAN.md file in the phase directory:
   - Filename: `{phase_num}-gap-{N}-PLAN.md`
   - Frontmatter: `gap_closure: true`
   - Content: targeted fix for the specific failure

**Step 5 — Write UAT Report**

Create or update `.planning/phases/{phase}/{phase_num}-UAT.md`:

```markdown
# Phase [X]: UAT Report

**Date:** [date]

## Results

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 1 | [scenario] | PASS/FAIL | [notes] |

## Gap Plans Created

- `{phase_num}-gap-01-PLAN.md`: [what it fixes]

## Summary

X/Y tests passed.
```

**Step 6 — Guide Next Steps**

If all tests pass:
> "All tests passed. Phase [X] is complete. Run `/plan-phase {next}` to begin Phase [next]."

If tests failed:
> "Found [N] issue(s). Gap plans created. Run `/execute-phase {phase} --gaps-only` to apply fixes."

</process>

<success_criteria>
- [ ] Phase context loaded (SUMMARY.md, requirements, roadmap)
- [ ] Test scenarios derived from requirements and summaries
- [ ] Tests presented one at a time with clear instructions
- [ ] Failures diagnosed and gap PLAN.md files created
- [ ] UAT report written with all results
- [ ] User knows next step
</success_criteria>
