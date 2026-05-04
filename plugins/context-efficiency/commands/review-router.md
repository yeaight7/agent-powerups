---
name: review-router
description: "quality gates | code review"
argument-hint: ""
allowed-tools:
  - Read
  - Skill
---

Route to the appropriate quality or review command based on the user's intent.

| User wants | Invoke |
|---|---|
| Review code for quality and correctness | `/code-review` |
| Review an implementation plan for gaps | `plan-checker` agent |
| Security review of code | `structured-code-reviewer` agent with security focus |

Invoke the matched command directly or ask the user which command they want if intent is ambiguous.
