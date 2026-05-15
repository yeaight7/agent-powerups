---
name: metric-impact-analyzer
description: Evaluate metric and semantic model changes for BI/reporting breakage and business meaning drift.
---

# Metric Impact Analyzer

Use this skill when a change may affect metrics, semantic models, dashboards, reporting, or stakeholder-facing KPIs.

## Goals
- Detect whether a technical change also changes business meaning.
- Identify likely downstream breakage in BI tooling and dashboards.
- Separate harmless refactors from definition-level changes.

## What to Inspect
- Metric definitions and calculation logic.
- Semantic model changes (dimensions, measures, relationships).
- Renamed or removed fields referenced by saved queries or dashboards.
- Changed filters, time windows, or default values.
- Changed joins, granularity, or fanout.
- Contract-breaking field type changes (e.g., INT → FLOAT, nullable → NOT NULL).

## Change Classification

| Change type | Risk level | Action required |
|---|---|---|
| Column rename with alias preserved | Low | Validate alias propagation |
| Description or label change | Low | Confirm no tooling parses descriptions |
| New optional field added | Low | No action unless it changes defaults |
| Filter condition tightened | Medium | Validate that the new filter matches intent |
| Metric formula changed | High | Stakeholder review required |
| Grain changed (e.g., day → week) | High | All downstream rollups must be revalidated |
| Dimension removed | Breaking | Cannot ship without migration plan |
| Join path changed | Breaking | All dependent metrics may be affected |

## Analysis Steps

1. Summarize what changed technically (field names, types, logic, joins).
2. Classify each change using the table above.
3. Infer what may have changed semantically — ask: "will this metric return a different number for the same time period?"
4. Identify who or what downstream may break: dashboards, saved queries, alerts, exports, downstream dbt models, BI tool semantic layers.
5. Flag whether stakeholder sign-off is required before the change is promoted.

## Output Format

1. **Technical change summary** — what exactly changed, at the field/model level.
2. **Business meaning impact** — does this change what the number means to a business user?
3. **Likely reporting or dashboard breakage** — specific assets at risk.
4. **Required validation** — what must be confirmed before shipping.
5. **Stakeholder confirmation needed?** yes / no / depends — with reason.

## Validation / Done Criteria
- Technical change summary covers all modified fields, models, and logic.
- Every change is classified by risk level using the table above.
- Downstream breakage is identified or explicitly noted as "unknown — downstream consumers not traced."
- Stakeholder confirmation requirement is stated as yes / no / depends, with a reason.

## Rules
- Be explicit about uncertainty when you cannot trace all downstream consumers.
- Use plain business language in the final summary — avoid dbt/SQL jargon in the stakeholder section.
- Do not edit code or models unless explicitly asked.
