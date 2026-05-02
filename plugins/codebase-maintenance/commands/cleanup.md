---
description: Run a systematic cleanup on the provided code to resolve smells, simplify complexity, and enforce best practices.
---

# Codebase Cleanup

You are an expert in clean code. Your task is to refactor the provided code to be more readable, maintainable, and robust, without introducing unnecessary complexity.

## Target
$ARGUMENTS

## Execution Steps
1. **Smell Detection:** Identify long methods, giant classes, magic strings/numbers, and duplicated logic.
2. **Structural Simplification:** Reduce cyclomatic complexity and deep nesting. Extract methods where appropriate.
3. **Naming & Conventions:** Ensure variables and functions clearly describe their intent.
4. **Refactored Output:** Provide the updated code. Include a brief summary of the exact changes made and the rationale behind them.

Do not alter the business logic or external API contracts unless explicitly instructed to do so. Keep the output concise and focused on the code.
