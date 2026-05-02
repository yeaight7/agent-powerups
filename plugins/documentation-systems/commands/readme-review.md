---
description: "Review the README.md to ensure it functions as an executable contract for new developers."
argument-hint: "<path/to/readme>"
---

# README Review Command

## CRITICAL BEHAVIORAL RULES

1. **Assume Zero Context**: Review the file assuming the reader knows nothing about the stack or the project history.

## Execution Steps

1. Read the target README file.
2. Check for a clear statement of purpose.
3. Check for a `.env` or configuration setup section.
4. Check for an exact, copy-pasteable build/install command.
5. Check for an exact, copy-pasteable test command.
6. If any are missing or ambiguous, output a diff to fix the README immediately.