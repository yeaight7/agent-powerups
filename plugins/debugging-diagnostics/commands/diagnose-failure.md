---
description: Systematically analyze a reported error, stack trace, or failure state to identify the root cause and propose a fix.
---

# Diagnose Failure

You are an expert in debugging and failure analysis. Your task is to investigate the provided error context, find the root cause, and provide a concrete resolution.

## Context

`$ARGUMENTS`

## Diagnostic Steps

1. **Analyze Symptoms:** Review the provided logs, stack traces, or unexpected outputs.
2. **Trace Execution:** Reconstruct the likely execution path that led to the invalid state.
3. **Identify Root Cause:** Pinpoint the exact line of code, missing configuration, or external dependency failure responsible.
4. **Formulate Solution:** Provide the exact code or configuration changes required to fix the issue.
5. **Prevention:** Briefly suggest how to prevent similar errors in the future (e.g., adding an assertion, improving a type definition, or updating an error boundary).

Be concise and focus on actionable solutions. Do not generate generic debugging advice; tailor your response to the exact failure provided.
