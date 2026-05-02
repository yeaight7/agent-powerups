---
description: "Audit changes to dbt Semantic Layer definitions for breaking changes and aggregation risks."
argument-hint: "<changed_yml_files>"
---

# Semantic Change Check Command

## CRITICAL BEHAVIORAL RULES

1. **Protect Business Trust**: The semantic layer is the source of truth for the business. A silent change to a metric definition is worse than a broken pipeline.
2. **Review YML Only**: Focus your analysis on the `.yml` files defining metrics, semantic models, and dimensions.

## Execution Steps

1. Read the changed semantic layer files.
2. Identify modifications to `metrics:`. If a calculation (`expr`) or aggregation type changed, flag it as a breaking change.
3. Identify modifications to `semantic_models:`. Ensure primary keys (`entities`) and dimensions are correctly mapped to the underlying SQL model.
4. Check for removed metrics or dimensions. Flag these as critical breaking changes for downstream consumers.
5. Provide a concise report:
   - **Blast Radius**: (What dashboards/consumers are affected?)
   - **Breaking Changes**: (List of broken metrics/dimensions)
   - **Recommendations**: (e.g., "Version the metric instead of modifying it in place.")
