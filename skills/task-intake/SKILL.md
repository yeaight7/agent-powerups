---
name: task-intake
description: "Use at the beginning of a new task. Ensures you fully understand the requirements, boundaries, and acceptance criteria before writing code."
---

# Task Intake Protocol

Never start implementing blindly. When you receive a new task, you must force clarification of boundaries and expected outcomes.

## Intake Checklist

1. **What is the goal?** Summarize the user's request in your own words.
2. **What is out of scope?** Identify what you are *not* going to do. If the user asked to fix a button, do not refactor the routing layer.
3. **How will we test it?** Define the validation criteria. Will it be a unit test, a manual UI check, or a curl command?
4. **What context is missing?** Ask the user for specific files, logs, or environment details if the request is too vague.

## Anti-Pattern: The Blind Start

Do not say "I will now fix the bug." and immediately edit files. Instead, use a repo-map or grep to confirm the files exist, then state your understanding of the problem. If the user's instruction is ambiguous, explicitly pause and ask them a clarifying question.
