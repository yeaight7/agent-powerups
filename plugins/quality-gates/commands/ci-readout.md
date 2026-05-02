---
description: "Generate a comprehensive summary of recent CI runs and failing jobs"
argument-hint: "<optional run ID or branch name>"
---

# CI Readout Generation

## CRITICAL BEHAVIORAL RULES

You MUST follow these rules exactly. Violating any of them is a failure.

1. **Read-only analysis.** Do NOT modify production code during this phase.
2. **Identify true failures.** Focus on actual job failures, ignoring cancelled or skipped jobs unless relevant.
3. **Halt on error.** If unable to fetch CI data, STOP and inform the user.
4. **Use local context.** Utilize available logs and workspace context to diagnose issues.
5. **Never enter plan mode autonomously.** Execute the analysis directly.

## Analysis Process

Use the Task tool to generate the readout:

```yaml
Task:
  subagent_type: "general-purpose"
  description: "Generate CI readout for $ARGUMENTS"
  prompt: |
    You are a CI pipeline expert. Generate a comprehensive readout of the recent CI runs.

    Analyze the CI status for: $ARGUMENTS

    ## Core Requirements

    1. **Run Status Summary**
       - Overall pipeline status (Pass, Fail, Running)
       - Duration and critical path bottlenecks
       - Job breakdown (e.g., Lint, Test, Build)

    2. **Failure Diagnosis**
       - Identify exactly which jobs failed
       - Extract the relevant error messages or stack traces
       - Differentiate between flaky tests, infrastructure errors, and true code regressions

    3. **Metrics**
       - Test pass/fail counts
       - Coverage changes (if available)
       - Build size changes

    ## Quality Checklist

    - Clear, executive-level summary at the top
    - Actionable insights for each failure
    - No generic guesses; base analysis strictly on logs
    - Links or references to specific log lines

    ## Output Requirements

    - A markdown formatted report
    - Next steps for the developer to fix the build
```

## Validation

After generating the readout:
1. Ensure the summary accurately reflects the latest pipeline state.
2. Verify that error traces are concise and relevant.
3. Confirm actionable next steps are provided.
