---
name: metric-impact-analyzer
description: Evaluate metric and semantic model changes for BI/reporting breakage and business meaning drift.
---

# Metric Impact Analyzer

Use this skill when a change may affect metrics, semantic models, dashboards, reporting, or stakeholder-facing KPIs.

## Goals

- Detect whether a technical change also changes business meaning.
- Identify likely downstream breakage in BI.
- Separate harmless refactors from definition-level changes.

## What to inspect

- metric definitions
- semantic model changes
- saved query changes
- renamed dimensions or measures
- changed filters, windows, or defaults
- changed joins or grain
- contract-breaking field changes
- dashboard-facing fields and compatibility risks

## Analysis steps

1. Summarize what changed technically.
2. Infer what may have changed semantically.
3. Identify who or what downstream may break.
4. Classify the change as:
   - low-risk refactor
   - validation-required
   - likely breaking
   - stakeholder-signoff required

## Output format

Return:

1. technical change summary
2. business meaning impact
3. likely reporting or dashboard breakage
4. required validation
5. whether stakeholder confirmation is needed

## Rules

- Be explicit about uncertainty.
- Prefer plain business language in the final summary.
- Do not edit code unless explicitly asked.
