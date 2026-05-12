---
name: subagent-team-orchestration
description: Coordinate multiple subagents through dependency-aware waves, stage handoffs, monitoring, and verification loops. Use when the work is too large or too mixed for a single agent.
---

# Subagent Team Orchestration

Use this skill to turn a multi-part task into a controlled subagent workflow.

## When to Use

- The task splits cleanly into planning, implementation, review, and verification stages
- Different specialties are needed across the same delivery flow
- Parallel work is possible, but dependencies still matter
- A single agent would create too much latency or too much context bloat

## Do Not Use

- The task is small enough for one focused agent
- Work is purely sequential with no parallelizable branches
- Requirements are still vague enough that clarification should happen first

## Core Rules

- Plan the task graph before spawning workers
- Separate stages: research, planning, implementation, verification, fix loop
- Launch only dependency-safe work in parallel
- Keep one owner responsible for cross-wave coordination
- Treat reviewer output as input to a fix loop, not as a final report
- No auto-commit, auto-push, auto-merge, or hidden global mutation
- If external side effects are involved, inspect state first, dry-run when available, summarize impact, then ask for approval

## Workflow

1. **Frame the objective**
   - Write the target outcome, constraints, and verification bar in one short block.
   - Identify which tasks must happen locally before delegation.

2. **Build the task graph**
   - Break work into concrete subtasks.
   - Mark dependencies explicitly.
   - Group tasks by stage and expected owner type.

3. **Create execution waves**
   - Wave 0: context gathering, planning, and setup
   - Wave 1..N: independent implementation batches
   - Final wave: review, testing, and cleanup

4. **Assign specialist roles**
   - `repo-explorer` for repo reconnaissance
   - `implementation-planner` for executable plans
   - `architecture-reviewer` for boundaries and design risks
   - `plan-critic` for adversarial challenge
   - `code-reviewer`, `security-reviewer`, `test-engineer`, `debugger`, `technical-writer`, `code-simplifier` as needed

5. **Run the wave**
   - Spawn all independent tasks in the same wave together.
   - Give each worker a bounded goal, owned files or scope, and a verification target.
   - Do not duplicate work across workers.

6. **Monitor and unblock**
   - Watch for blockers, scope collisions, and failed assumptions.
   - Redirect work only when the critical path changes.
   - If one worker fails, avoid restarting the entire wave by default.

7. **Run the verification and fix loop**
   - Consolidate changed areas.
   - Run targeted validation.
   - Route failures back to the right worker class.
   - Repeat until the acceptance bar is met or a real blocker remains.

8. **Close the run**
   - Summarize what completed, what remains, and what was verified.
   - Leave commit/push/merge decisions to the user.

## Output Format

Before execution, produce:

```text
Objective
Constraints
Wave Plan
Owners
Verification
```

After execution, produce:

```text
Completed
Blocked
Validation
Next user-controlled write actions
```
