---
name: persistent-completion-loop
description: Self-referential loop until task completion with configurable verification reviewer
argument-hint: "<task description>"
---

<Purpose>
Persistent Completion Loop is a PRD-driven persistence loop that keeps working on a task until ALL user stories have passes: true and are reviewer-verified. It wraps parallel execution with session persistence, automatic retry on failure, structured story tracking, and mandatory verification before completion.
</Purpose>

<Use_When>
- Task requires guaranteed completion with verification (not just "do your best")
- User says "don't stop", "must complete", "finish this", or "keep going until done"
- Work may span multiple iterations and needs persistence across retries
- Task benefits from structured PRD-driven execution with reviewer sign-off
</Use_When>

<Do_Not_Use_When>
- User wants a full autonomous pipeline from idea to code -- use autonomous delivery instead
- User wants to explore or plan before committing -- use the plan skill instead
- User wants a quick one-shot fix -- delegate directly to an executor agent
- User wants manual control over completion -- use parallel execution directly
</Do_Not_Use_When>

<Why_This_Exists>
Complex tasks often fail silently: partial implementations get declared "done", tests get skipped, edge cases get forgotten. This skill prevents this by:
1. Structuring work into discrete user stories with testable acceptance criteria
2. Iterating story-by-story until each one passes
3. Tracking progress and learnings across iterations
4. Requiring fresh reviewer verification against specific acceptance criteria before completion
</Why_This_Exists>

<PRD_Mode>
A scaffold PRD file is auto-generated when the loop starts if none exists.

**Startup gate:** Always initialize and validate the PRD at startup.

**Reviewer selection:** The completion reviewer validates the stories, and **the reviewer cannot be the same writer lane/agent that implemented the code**.
</PRD_Mode>

<Execution_Policy>
- Fire independent agent calls simultaneously -- never wait sequentially for independent work
- Use background execution for long operations (installs, builds, test suites)
- Always pass the `model` or `tier` parameter explicitly when delegating to agents
- Deliver the full implementation: no scope reduction, no partial completion, no deleting tests to make them pass
- Default-safe behaviors apply. Review before committing/pushing.
</Execution_Policy>

<Steps>
1. **PRD Setup** (first iteration only):
   a. Check for an existing PRD file.
   b. If none exists, auto-generate a scaffold.
   c. **CRITICAL: Refine the scaffold.** Replace generic criteria with task-specific criteria:
      - Break the original task into right-sized user stories
      - Write concrete, verifiable acceptance criteria for each story
      - Order stories by priority (foundational work first, dependent work later)
      - Write the refined PRD back

2. **Pick next story**: Select the highest-priority story with `passes: false`. This is your current focus.

3. **Implement the current story**:
   - Delegate to specialist agents at appropriate tiers.
   - Run long operations in background.

4. **Verify the current story's acceptance criteria**:
   a. For EACH acceptance criterion in the story, verify it is met with fresh evidence
   b. Run relevant checks (test, build, lint, typecheck) and read the output
   c. If any criterion is NOT met, continue working -- do NOT mark the story as complete

5. **Mark story complete**:
   a. When ALL acceptance criteria are verified, set `passes: true` for this story
   b. Record progress (what was implemented, files changed, learnings)

6. **Check PRD completion**:
   a. Are ALL stories marked `passes: true`?
   b. If NOT all complete, loop back to Step 2
   c. If ALL complete, proceed to Step 7 (reviewer verification)

7. **Reviewer verification** (tiered, against acceptance criteria):
   - The reviewer MUST be a different agent than the implementer.
   - The reviewer verifies against the SPECIFIC acceptance criteria from prd.json
   - **On APPROVAL: immediately proceed to Step 7.5.**

7.5 **Mandatory Cleanup Pass** (runs after Step 7 approval, unless configured otherwise):
   - Run the code cleanup skill on files changed during the current session only.
   - Keep the scope bounded to the changed-file set.

7.6 **Regression Re-verification**:
   - After the cleanup pass, re-run all relevant tests, build, and lint checks.
   - If regression fails, fix it, then rerun until it passes.

8. **On approval**: Report completion and clean up all intermediate state files.

9. **On rejection**: Fix the issues raised, re-verify, then loop back.
</Steps>

<Escalation_And_Stop_Conditions>
- Stop and report when a fundamental blocker requires user input (missing credentials, unclear requirements, external service down)
- Stop when the user says "stop", "cancel", or "abort"
- If the reviewer rejects verification, fix the issues and re-verify (do not stop)
- If the same issue recurs across 3+ iterations, report it as a potential fundamental problem
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] All PRD stories have `passes: true`
- [ ] PRD acceptance criteria are task-specific
- [ ] All requirements from the original task are met (no scope reduction)
- [ ] Zero pending TODO items
- [ ] Fresh test run output shows all tests pass
- [ ] Fresh build output shows success
- [ ] Reviewer (different from implementer) verification passed against specific acceptance criteria
- [ ] Cleanup pass completed on changed files
- [ ] Post-cleanup regression tests pass
</Final_Checklist>
