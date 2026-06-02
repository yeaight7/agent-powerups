---
name: semantic-layer-change-review
description: "Use when modifying dbt metrics or semantic models to ensure mathematical correctness and backwards compatibility."
---

# Semantic Layer Change Review

Changes to the semantic layer directly impact dashboards and business reporting. A silent drift in a metric definition destroys trust.

## Review Protocol

1. **Identify the Change Type**:
   - **Addition**: Safe. (Adding a new metric or dimension).
   - **Deprecation**: Requires communication. (Removing a metric).
   - **Modification**: High Risk. (Changing the SQL expression, aggregation, or filters of an existing metric).

2. **Evaluate Mathematical Soundness**:
   - Are we averaging an average?
   - Are we summing a distinct count?
   - Does adding this dimension cause a fan-out that inflates the metric?

3. **Check Backwards Compatibility**:
   - If an existing metric's logic is changed, you MUST flag it. The recommended path is to use dbt's metric versioning or create a new metric (e.g., `revenue_v2`) rather than silently altering historical numbers.

4. **Verify Entity Mapping**:
   - Ensure `entities` (primary/foreign keys) match the granularity of the underlying semantic model.

## Anti-Pattern

Do not approve a pull request that changes the `expr` of a core metric without explicitly confirming the business requested the restatement of historical data.
