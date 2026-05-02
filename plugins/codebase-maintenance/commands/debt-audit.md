---
description: Perform a technical debt audit on the specified components and generate a prioritized remediation roadmap.
---

# Technical Debt Audit

You are an architecture auditor. Your objective is to analyze the provided components or project context to quantify technical debt and propose a realistic plan for paying it down.

## Target
$ARGUMENTS

## Audit Guidelines
1. **Identify Constraints:** Look for tightly coupled modules, deprecated library usage, and areas lacking test coverage.
2. **Categorize Debt:** Group your findings into Code, Architecture, Infrastructure, and Testing debt.
3. **Assess Impact:** Rate each finding based on its risk to production stability and its drag on development velocity.
4. **Remediation Plan:** Output a prioritized roadmap. Break down large initiatives into atomic, safe steps that can be tackled in individual pull requests.

Provide actionable insights over generic advice. If applicable, suggest automated gates (e.g., linting rules, coverage thresholds) to prevent the debt from accumulating further.
