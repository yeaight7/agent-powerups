---
name: parallel-execution-engine
description: Use when latency matters and several independent tasks can run at once -- a bounded implementation or investigation that needs waves of concurrent workers, not a persistent completion loop or stage-based orchestration.
---

## Purpose

Run independent work in parallel with explicit wave boundaries, lightweight coordination, and bounded verification. Use when the task benefits from concurrency but does not need the full orchestration stack: launch independent work together, keep each worker narrow, and validate after each wave.

## When to Use

- Multiple independent tasks can run at the same time
- You want faster turnaround on a bounded implementation or investigation
- The task graph is shallow and easy to reason about
- You need waves, not long-lived persistence

Do NOT use when dependencies are complex enough to need stage-based orchestration, the user expects guaranteed completion across retries (use a persistent completion loop instead), or the task still needs clarification or planning before execution.

## Inputs

- The set of tasks to perform and their dependency relationships
- The changed surface or files each task will touch (to detect overlapping ownership)
- Available worker tiers (fast / standard / deep)

## Core Rules

- Launch independent work together, not sequentially
- Keep each worker bounded to a narrow objective
- Separate wave boundaries explicitly
- Use the smallest suitable worker capability for each task
- Run lightweight validation after each wave
- Escalate to a persistent completion loop if repeated failures appear

## Workflow

1. **Classify the work.** Bucket every task as independent, dependency-gated, or verification. Independent tasks share no state and can run concurrently; dependency-gated tasks wait on an earlier wave's output; verification tasks run last.

2. **Build waves.** Use Wave 0 only for setup or discovery when later waves need its output; run independent execution in parallel waves; reserve a final wave for integration and checks.
   - Wave 0: setup/discovery (optional)
   - Wave 1..N: parallel independent execution
   - Final wave: integration and verification

3. **Route by tier.** Match each task to the smallest worker that can do it:
   - Fast workers for mechanical lookups or edits (rename, find usages, single-file edits)
   - Standard workers for typical implementation
   - Deep workers only for architecture, security, or stubborn failures

4. **Launch by wave.** Fire every parallel-safe task in the same wave at once. Keep prompts short, scoped, and file-aware, and ensure no two workers own the same file in one wave. Use a fixed dispatch template per task:
   - Objective: one sentence, single deliverable
   - Files: the exact paths this worker owns (no overlap with siblings)
   - Constraints: do not touch anything outside the listed files; do not edit unless the objective requires it
   - Return: a short summary of what changed and any checks run

5. **Collect and verify.** Summarize outputs by task, then run only the checks that match the changed surface first; broaden validation only when needed. Run the narrowest relevant command before any wide gate, for example:
   ```bash
   npm test -- path/to/changed.test.ts   # only the touched suite first
   git diff --stat                        # confirm the changed surface
   ```
   If a wave produces repeated failures, stop parallelizing and escalate to a persistent completion loop.

## Output

- A wave plan listing each task, its tier, and the files it owns
- Per-task result summaries collected after each wave
- The validation run after each wave, in this shape:
  ```text
  Wave 0:
  - ...

  Wave 1:
  - ...

  Validation:
  - ...
  ```

## Verification

- [ ] Every task classified as independent, dependency-gated, or verification before launch
- [ ] Wave boundaries are explicit and no two workers in a wave own the same file
- [ ] Each task routed to the smallest suitable worker tier
- [ ] Lightweight validation run after each wave, narrowest checks first
- [ ] Repeated failures triggered escalation to a persistent completion loop rather than more parallelism

## Failure Modes

- **Overlapping ownership** — two workers edit the same file in one wave and clobber each other; assign disjoint file sets per wave.
- **Over-routing** — sending mechanical edits to deep workers wastes capability and latency; use the smallest tier that fits.
- **Skipping wave validation** — broadening to a full test suite immediately, or deferring all checks to the end, hides which wave broke; validate the changed surface after each wave.
- **Parallelizing through failure** — re-firing waves when the same task keeps failing; escalate to a persistent completion loop instead.
