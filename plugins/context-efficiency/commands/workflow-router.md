---
name: workflow-router
description: "spec workflow | discuss plan execute verify"
argument-hint: ""
allowed-tools:
  - Read
  - Skill
---

Route to the appropriate spec-driven workflow command based on the user's intent.

| User wants | Invoke |
|---|---|
| Gather context before planning | `/discuss-phase` |
| Create a PLAN.md | `/plan-phase` |
| Execute plans in a phase | `/execute-phase` |
| Verify built features through UAT | `/verify-work` |
| Initialize a new project | `/new-project` |

Invoke the matched command directly or ask the user which command they want if intent is ambiguous.
