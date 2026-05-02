---
description: "Record a brief Architecture Decision Record (ADR) about a recent technical choice."
argument-hint: "<decision_summary>"
---

# Architecture Note Command

## CRITICAL BEHAVIORAL RULES

1. **Keep it Terse**: An ADR is a factual record, not a blog post. Focus on the constraints and the decision.
2. **Don't Overcomplicate**: Do not generate massive templates. Stick to Context, Decision, and Consequences.

## Execution Steps

1. Parse the `$ARGUMENTS` to understand the decision made.
2. Determine if a `docs/adr/` directory exists. If not, create it.
3. Draft a short Markdown document named `YYYY-MM-DD-<slug>.md`.
4. Include the problem context, the chosen solution, and the accepted trade-offs.
5. Save the file and confirm its creation.