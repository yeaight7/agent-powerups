---
name: subagent-team-orchestration
description: Use when a task is too large or too mixed for one agent -- it splits into research, planning, implementation, review, and verification stages, needs different specialties, or has parallelizable branches that still share dependencies.
---

## Purpose

Turn a multi-part task into a controlled subagent workflow. Plan the task graph before spawning workers, launch only dependency-safe work in parallel, keep one owner responsible for cross-wave coordination, and treat reviewer output as input to a fix loop -- not as a final report.

## When to Use

- The task splits cleanly into planning, implementation, review, and verification stages
- Different specialties are needed across the same delivery flow
- Parallel work is possible, but dependencies still matter
- A single agent would create too much latency or too much context bloat

Do NOT use when the task fits one focused agent, when work is purely sequential with no parallelizable branches, or when requirements are still vague enough that clarification should happen first.

## Inputs

- The objective, hard constraints, and the verification bar that defines "done"
- The list of subtasks and which ones depend on others
- The set of specialist roles available to delegate to

## Core Rules

- Plan the task graph before spawning workers.
- Separate stages: research, planning, implementation, verification, fix loop.
- Launch only dependency-safe work in parallel.
- Keep one owner responsible for cross-wave coordination.
- Treat reviewer output as input to a fix loop, not as a final report.
- No auto-commit, auto-push, auto-merge, or hidden global mutation.
- If external side effects are involved, inspect state first, dry-run when available, summarize impact, then ask for approval.

## Workflow

1. **Frame the objective.** Write the target outcome, constraints, and verification bar in one short block. Identify which tasks must happen locally before delegation.

2. **Build the task graph.** Break work into concrete subtasks, mark dependencies explicitly, and group tasks by stage and expected owner type. Decision rule: two subtasks belong in the same wave only if neither reads or writes the other's output and they touch disjoint files.

3. **Create execution waves.** Sequence the dependency graph into ordered batches:
   - Wave 0: context gathering, planning, and setup
   - Wave 1..N: independent implementation batches
   - Final wave: review, testing, and cleanup

4. **Assign specialist roles.** Match each subtask to the owner type best suited to it:
   - repo-explorer for repo reconnaissance
   - implementation-planner for executable plans
   - architecture-reviewer for boundaries and design risks
   - plan-critic for adversarial challenge
   - code-reviewer, security-reviewer, test-engineer, debugger, technical-writer, code-simplifier as needed

5. **Run the wave.** Spawn all independent tasks in the same wave together. Give each worker a bounded goal, owned files or scope, and a verification target. Do not duplicate work across workers. When workspace isolation matters (concurrent writes to the same tree), give each worker its own worktree:

   ```bash
   git worktree add ../wave1-auth -b wave1-auth   # isolate one worker's edits
   git worktree add ../wave1-api  -b wave1-api     # second worker, separate tree
   ```

6. **Monitor and unblock.** Watch for blockers, scope collisions, and failed assumptions. Redirect work only when the critical path changes. If one worker fails, avoid restarting the entire wave by default.

7. **Run the verification and fix loop.** Consolidate changed areas, run targeted validation, and route failures back to the right worker class. Repeat until the acceptance bar is met or a real blocker remains.

   ```bash
   git diff --stat main...HEAD   # consolidate the changed surface across waves
   ```

8. **Close the run.** Summarize what completed, what remains, and what was verified. Leave commit/push/merge decisions to the user.

## Output

- A pre-execution plan: Objective, Constraints, Wave Plan, Owners, Verification
- A post-execution report: Completed, Blocked, Validation, Next user-controlled write actions

## Verification

- [ ] The task graph and its dependencies were mapped before any worker was spawned
- [ ] Only dependency-safe, file-disjoint tasks ran in the same wave
- [ ] One owner held cross-wave coordination and reviewer output fed a fix loop until the acceptance bar was met
- [ ] No commit, push, merge, or external side effect happened without inspect-then-approve
- [ ] The close-out report states what completed, what is blocked, what was validated, and the next user-controlled write actions

## Failure Modes

- **Parallelizing dependents** — launching tasks in one wave that read or overwrite each other's output; sequence them into separate waves instead.
- **Reviewer-as-final-report** — treating review findings as the deliverable rather than routing them back into a fix loop until verified.
- **Unowned coordination** — no single owner on the critical path, so blockers and scope collisions go unnoticed across waves.
- **Silent side effects** — auto-committing, pushing, merging, or mutating shared state without inspecting first and asking for approval.
