# plan

Use before starting any non-trivial task.

Steps:

1. Re-read the user request in full. Identify the goal, constraints, and what "done" means.
2. Map affected areas: run `git status --short` to see current state; list relevant directories.
3. List the files most likely to change. Read each one before proposing edits.
4. Write a numbered step list — small enough that each step is one logical change.
5. Identify risks: external dependencies, breaking changes, missing context.
6. Present the plan to the user and wait for approval before implementing.

Do not write code or modify files during planning.
