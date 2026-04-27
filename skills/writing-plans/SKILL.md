---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code.
---

## Purpose

Turn a spec into a detailed, executable multi-step implementation plan. Prevents implementation drift and gives any engineer — or agent — enough detail to build without guessing.

## When to Use

- Before implementing any multi-subsystem or non-trivial feature.
- When a spec or requirements document exists and needs to become actionable tasks.
- When the implementation requires coordinating multiple files or components.

If the spec covers multiple independent subsystems, break it into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## Inputs

- Spec or requirements document.
- Access to the codebase (for file paths and existing patterns).

## Workflow

1. **Scope check** — Identify all affected subsystems. If multiple independent subsystems, suggest separate plans.

2. **Design file structure** — Before defining tasks, map which files will be created or modified and what each is responsible for. Units should have clear boundaries, focused responsibility, and well-defined interfaces.

3. **Write the plan header:**
   ```markdown
   # [Feature Name] Implementation Plan

   **Goal:** [One sentence describing what this builds]

   **Architecture:** [2-3 sentences about approach]

   **Tech Stack:** [Key technologies/libraries]

   ---
   ```

4. **Break work into bite-sized tasks** — Each step should take 2–5 minutes:
   - "Write the failing test" — step
   - "Run it to verify it fails" — step
   - "Implement the minimal code to pass the test" — step
   - "Run tests and confirm pass" — step
   - "Commit" — step

5. **Write each task** using this structure:
   ````markdown
   ### Task N: [Component Name]

   **Files:**
   - Create: `exact/path/to/file.py`
   - Modify: `exact/path/to/existing.py`
   - Test: `tests/exact/path/to/test.py`

   - [ ] **Step 1:** [Action]
   ```code
   # Actual code here
   ```
   - [ ] **Step 2:** Run: `<exact command>`  
     Expected: `<exact output>`
   ````

6. **No placeholders** — These are plan failures; never write them:
   ```
   TBD / TODO / implement later / fill in details
   "Add appropriate error handling" / "handle edge cases"
   "Write tests for the above" (without actual test code)
   "Similar to Task N" (repeat the code — engineer may read tasks out of order)
   Steps that describe without showing how (code blocks required for code steps)
   ```

7. **Self-review before saving:**
   - Spec coverage: Can you point to a task for every requirement?
   - Placeholder scan: No undefined, deferred, or vague steps?
   - Type consistency: Do types and method names in later tasks match earlier definitions?

8. **Save to** `docs/plans/YYYY-MM-DD-<feature-name>.md`.

## Output

A Markdown plan file with:
- Header (goal, architecture, tech stack)
- Tasks with checkbox steps, exact file paths, actual code blocks, exact commands with expected output
- No placeholders of any kind

## Verification

- [ ] All spec requirements covered (point to a task for each)
- [ ] No undefined, deferred, or vague steps present
- [ ] File paths are exact (not `path/to/file`)
- [ ] Tasks are 2–5 minutes each
- [ ] Code blocks contain actual code, not descriptions
- [ ] Commands include expected output
- [ ] Plan saved to `docs/plans/`

## Failure Modes

- **Vague tasks** — A reader who cannot execute a step without guessing means the task is incomplete.
- **Missing spec coverage** — Implementation diverges from requirements.
- **Placeholder content** — Implementation stalls when an engineer hits an undefined or deferred step.
- **Stale type references** — Function named `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug in the plan.
