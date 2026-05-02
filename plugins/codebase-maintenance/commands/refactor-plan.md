---
description: Draft a step-by-step refactoring strategy for complex code changes to ensure behavior is preserved.
---

# Refactoring Plan

You are a senior software architect. Draft a comprehensive, step-by-step plan for refactoring the requested code or architecture. 

## Target

`$ARGUMENTS`

## Planning Requirements

1. **Goal Definition:** Clarify the end state of the refactoring (e.g., decoupling a monolith, upgrading a core framework, extracting a service).
2. **Safety Net:** Define the testing strategy required before any code is modified.
3. **Execution Phases:** Break the refactoring into isolated, verifiable phases. Each phase must leave the system in a deployable state.
4. **Rollback Strategy:** Provide a clear rollback or fallback mechanism for each phase in case of unexpected failures.

Do not write the final refactored code yet. Focus exclusively on delivering a structured, low-risk execution plan that a developer can follow systematically.
