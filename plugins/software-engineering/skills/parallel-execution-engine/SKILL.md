---
name: parallel-execution-engine
description: Run independent work in parallel with explicit wave boundaries, lightweight coordination, and bounded verification. Use when latency matters and the work does not need a persistent completion loop.
---

# Parallel Execution Engine

Use this skill when the task benefits from concurrency, but does not need the full orchestration stack.

## When to Use

- Multiple independent tasks can run at the same time
- You want faster turnaround on a bounded implementation or investigation
- The task graph is shallow and easy to reason about
- You need waves, not long-lived persistence

## Do Not Use

- Dependencies are complex enough to need stage-based orchestration
- The user expects guaranteed completion across retries
- The task still needs clarification or planning before execution

## Core Rules

- Launch independent work together, not sequentially
- Keep each worker bounded to a narrow objective
- Separate wave boundaries explicitly
- Use the smallest suitable worker capability for each task
- Run lightweight validation after each wave
- Escalate to a persistent completion loop if repeated failures appear

## Workflow

1. **Classify the work**
   - Independent tasks
   - Dependency-gated tasks
   - Verification tasks

2. **Build waves**
   - Wave 0 for setup or discovery if needed
   - Parallel waves for independent execution
   - Final wave for integration and checks

3. **Route intelligently**
   - Fast workers for mechanical lookups or edits
   - Standard workers for typical implementation
   - Deep workers only for architecture, security, or stubborn failures

4. **Launch by wave**
   - Fire every parallel-safe task in the same wave at once
   - Keep prompts short, scoped, and file-aware
   - Avoid overlapping ownership

5. **Collect and verify**
   - Summarize outputs by task
   - Run only the checks that match the changed surface first
   - Broaden validation only when needed

## Output Format

```text
Wave 0:
- ...

Wave 1:
- ...

Validation:
- ...
```
