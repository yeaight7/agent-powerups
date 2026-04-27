---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements.
---

## Purpose

Dispatch a focused code-reviewer subagent to catch issues before they cascade. The reviewer receives precisely crafted context — not session history — keeping it focused on the work product.

## When to Use

**Required:**
- After completing a major feature.
- Before merging to main.
- After each task in multi-task subagent workflows.

**Optional but valuable:**
- When stuck (fresh perspective).
- Before refactoring (baseline check).
- After fixing a complex bug.

## Inputs

- What was implemented.
- Requirements or plan the implementation should satisfy.
- Git range: base SHA and head SHA.

## Workflow

1. **Get the git range:**
   ```bash
   BASE_SHA=$(git rev-parse origin/main)   # or the commit before your work
   HEAD_SHA=$(git rev-parse HEAD)
   ```

2. **Dispatch a code-reviewer subagent** using the template in `references/code-reviewer.md`. Fill in:
   - `{WHAT_WAS_IMPLEMENTED}` — What was built.
   - `{PLAN_OR_REQUIREMENTS}` — What it should do.
   - `{BASE_SHA}` and `{HEAD_SHA}` — The git range.
   - `{DESCRIPTION}` — Brief summary.

3. **Act on feedback:**
   - Fix **Critical** issues immediately.
   - Fix **Important** issues before proceeding.
   - Note **Minor** issues for later.
   - Push back with reasoning if reviewer is wrong.

## Output

The reviewer returns:
- **Strengths** — What is well done.
- **Issues** — Categorized as Critical / Important / Minor, each with file:line reference, what is wrong, why it matters, and how to fix.
- **Recommendations** — Improvements for quality, architecture, or process.
- **Assessment** — Ready to merge / With fixes / Not ready.

## Verification

- [ ] Git range provided to reviewer
- [ ] Requirements or plan included
- [ ] Critical issues fixed before proceeding
- [ ] Important issues resolved before merge

## Failure Modes

- **Skipping review** — Issues compound across tasks. Review early and often.
- **Ignoring Critical issues** — Never proceed with unfixed Critical issues.
- **Incomplete context** — A reviewer without requirements or git range gives vague feedback.
- **Not pushing back** — If reviewer feedback is technically wrong, push back with evidence.
