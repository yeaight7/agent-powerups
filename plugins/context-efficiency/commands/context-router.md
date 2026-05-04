---
name: context-router
description: "codebase intelligence | map codebase"
argument-hint: ""
allowed-tools:
  - Read
  - Skill
---

Route to the appropriate codebase-intelligence command based on the user's intent.

| User wants | Invoke |
|---|---|
| Map the full codebase structure | `/map-codebase` |
| Quick lightweight codebase scan | `/map-codebase --fast` |
| Map only one focus area | `/map-codebase --fast --focus tech\|arch\|quality\|concerns` |

Invoke the matched command directly or ask the user which command they want if intent is ambiguous.
