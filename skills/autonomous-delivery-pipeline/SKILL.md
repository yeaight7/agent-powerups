---
name: autonomous-delivery-pipeline
description: Use when the user wants end-to-end autonomous execution from a brief idea to working, verified code -- multi-phase work spanning requirements, planning, implementation, QA, and validation. Not for brainstorming, single focused changes, or quick fixes.
argument-hint: "<product idea or task description>"
---

## Purpose

Autonomous Delivery Pipeline takes a brief product idea and autonomously handles the full lifecycle: requirements analysis, technical design, planning, parallel implementation, QA cycling, and multi-perspective validation. It produces working, verified code from a 2-3 line description.

This skill creates an execution plan and verification loop for a coding agent. It does not grant permission to write globally, install dependencies, commit, push, deploy, or modify secrets.

## When to Use

- User wants end-to-end autonomous execution from an idea to working code
- Task requires multiple phases: planning, coding, testing, and validation

## Do Not Use When

- User wants to explore options or brainstorm -- respond conversationally
- User wants a single focused code change -- use a persistent completion loop or delegate directly
- Task is a quick fix or small bug -- use direct executor delegation

## Why This Exists

Most non-trivial software tasks require coordinated phases: understanding requirements, designing a solution, implementing in parallel, testing, and validating quality. Autonomous delivery orchestrates all of these phases automatically so the user can describe what they want and receive working code without managing each step.

## Inputs

- A brief product idea or task description (2-3 lines is enough)
- Optional: a pre-validated requirements-clarifier spec (`.specs/requirements-clarifier-*.md`); if present, Phase 0 expansion is skipped

## Execution Policy

- Each phase must complete before the next begins
- Parallel execution is used within phases where possible (Phase 2 and Phase 4)
- QA cycles repeat up to 5 times; if the same error persists 3 times, stop and report the fundamental issue
- Validation requires approval from all reviewers; rejected items get fixed and re-validated
- Dry-run and default-safe behaviors apply. Review before use.

## Workflow

1. **Phase 0 - Expansion**: Turn the user's idea into a detailed spec
   - **If requirements clarifier spec exists**: Skip expansion, use the pre-validated spec directly. Continue to Phase 1 (Planning).
   - **If input is vague** (no file paths, function names, or concrete anchors): Offer redirect to requirements clarifier for Socratic clarification
   - **Otherwise**: Extract requirements and create technical specification
   - Output: a written specification document

2. **Phase 1 - Planning**: Create an implementation plan from the spec
   - Create plan
   - Validate plan
   - Output: a written implementation plan

3. **Phase 2 - Execution**: Implement the plan
   - Run independent tasks in parallel

4. **Phase 3 - QA**: Cycle until all tests pass
   - Build, lint, test, fix failures
   - Repeat up to 5 cycles
   - Stop early if the same error repeats 3 times (indicates a fundamental issue)

5. **Phase 4 - Validation**: Multi-perspective review in parallel
   - Architecture: Functional completeness
   - Security: Vulnerability check
   - Code quality: Review
   - All must approve; fix and re-validate on rejection

6. **Phase 5 - Cleanup**: Remove intermediate plan artifacts on successful completion

## Output

- A written specification document (Phase 0)
- A written implementation plan (Phase 1)
- Working code with passing tests and build, approved by architecture, security, and code-quality review
- Intermediate plan artifacts removed on successful completion

## Failure Modes

- Stop and report when the same QA error persists across 3 cycles (fundamental issue requiring human input)
- Stop and report when validation keeps failing after 3 re-validation rounds
- Stop when the user says "stop", "cancel", or "abort"
- If requirements were too vague and expansion produces an unclear spec, offer redirect to requirements clarifier

## Verification

- [ ] All 5 phases completed (Expansion, Planning, Execution, QA, Validation)
- [ ] All validators approved in Phase 4
- [ ] Tests pass (verified with fresh test run output)
- [ ] Build succeeds (verified with fresh build output)
- [ ] State files cleaned up
- [ ] User informed of completion with summary of what was built
