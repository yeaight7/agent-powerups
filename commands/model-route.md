---
description: Recommend the best model tier for the current task based on complexity, risk, and budget.
---

# /model-route — Model Tier Recommendation

Evaluate the current task and recommend the appropriate model tier.

## Usage

`/model-route [task-description] [--budget low|med|high]`

## Tier Routing

| Tier | Use when |
|------|---------|
| **Fast** | Deterministic, single-file, low blast radius (rename, format, classify) |
| **Standard** | Multi-file implementation, refactor, bounded code review — **default** |
| **Deep** | Architecture, security audit, root-cause analysis, pre-release verification |

## Required Output

1. **Recommended tier** and why
2. **Confidence**: high / medium / low
3. **Escalation condition**: what would cause you to move up one tier
4. **Budget note** (if `--budget` was specified): whether the recommendation changes

## Escalation Rule

Escalate only after the lower tier fails with a clear reasoning gap — not because the task feels important.

## Arguments

$ARGUMENTS:
- `[task-description]` — optional free-text description of the task
- `--budget low|med|high` — optional cost constraint
