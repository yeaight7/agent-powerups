---
name: semantic-layer-change-review
description: Use when a change touches dbt semantic models, metrics, saved queries, or other semantic-layer YAML -- especially when an existing metric's expression, aggregation, filters, or dimensions are modified.
---

## Purpose

Changes to the semantic layer directly impact dashboards and business reporting. A silent drift in a metric definition destroys trust. Review every semantic-layer change for mathematical soundness and backwards compatibility before approval.

## When to Use

- A PR modifies metric or semantic model YAML
- A metric's `expr`, aggregation, or filters are changing
- New dimensions or entities are being added to an existing semantic model

## Inputs

- The semantic-layer diff (semantic models, metrics, saved queries)
- The underlying model's grain and entity keys

## Workflow

1. **Enumerate what changed:**

   ```bash
   git diff origin/main...HEAD -- '*.yml' '*.yaml'
   dbt ls --resource-type metric
   dbt ls --resource-type semantic_model
   ```

2. **Identify the change type:**
   - **Addition** — safe (adding a new metric or dimension).
   - **Deprecation** — requires communication (removing a metric).
   - **Modification** — high risk (changing the SQL expression, aggregation, or filters of an existing metric).

3. **Evaluate mathematical soundness:**
   - Are we averaging an average?
   - Are we summing a distinct count?
   - Does adding this dimension cause a fan-out that inflates the metric?

4. **Check backwards compatibility.** If an existing metric's logic is changed, you MUST flag it. The recommended path is dbt's metric versioning or a new metric (e.g., `revenue_v2`) rather than silently altering historical numbers. Find consumers of the metric before judging impact:

   ```bash
   grep -rn "<metric_name>" --include="*.yml" --include="*.yaml" .
   ```

5. **Verify entity mapping.** Ensure `entities` (primary/foreign keys) match the granularity of the underlying semantic model.

6. **Confirm definitions still parse:**

   ```bash
   dbt parse
   ```

## Output

- Change classification (addition / deprecation / modification) per touched metric or semantic model
- Mathematical soundness findings
- Backwards-compatibility verdict, with consumers that need communication
- Entity/grain mismatches, if any

## Verification

- [ ] Every touched metric and semantic model classified by change type
- [ ] Modifications to existing metrics explicitly flagged, never silently approved
- [ ] Consumers of modified metrics identified
- [ ] `dbt parse` passes on the changed project
- [ ] Entity keys checked against the underlying model's grain

## Failure Modes

- **Silent restatement** — approving a change to a core metric's `expr` without explicitly confirming the business requested the restatement of historical data.
- **Treating modification like addition** — additions are safe; modifications are high risk and need versioning or a new metric.
- **Fan-out blindness** — a new dimension join can inflate a metric while every individual definition still looks correct.
