---
name: sql-business-logic-review
description: Use when reviewing SQL that affects reporting, metrics, transformations, financial logic, product logic, or stakeholder-facing outputs -- especially when a query still runs fine but its business meaning may have drifted.
---

## Purpose

Review SQL as business logic, not just syntax. Detect silent semantic changes and flag places where technically valid SQL can still produce wrong business results.

## When to Use

- Reviewing SQL changes that feed reports, metrics, or financial/product logic
- A query was modified and downstream numbers shifted, or might have
- Output looks plausible but the definition of what is being counted may have changed

## Inputs

- The SQL under review (diff preferred, full query otherwise)
- The intended grain and business definition, before and after the change

## Workflow

1. **Establish the intended grain** before and after the query or change.

2. **Scan for the standard risk patterns:**
   - grain mismatches
   - duplicate rows introduced by joins
   - incorrect join keys
   - left vs inner join behavior changes
   - filters that alter population definitions
   - null handling that changes meaning
   - default values that hide data quality issues
   - aggregation mistakes
   - window functions with unsafe partitions or ordering
   - date logic and timezone assumptions
   - incremental logic that can double count, miss rows, or drift
   - metric definitions that no longer match prior intent

3. **Ask the review questions:**
   1. What is the intended grain before and after this query?
   2. Could this query duplicate or drop rows?
   3. Has the business definition changed even if the SQL still runs?
   4. Are there edge cases around nulls, late-arriving data, or time windows?
   5. What result could look plausible while still being wrong?

4. **Propose concrete validation checks**, for example:

   ```sql
   -- grain check: the expected key must be unique
   SELECT <key_columns>, COUNT(*)
   FROM (<query under review>)
   GROUP BY <key_columns>
   HAVING COUNT(*) > 1;

   -- before/after comparison on a stable slice
   SELECT COUNT(*), SUM(<metric_column>) FROM (<old query>);
   SELECT COUNT(*), SUM(<metric_column>) FROM (<new query>);
   ```

## Output

1. summary of business-logic risks
2. likely semantic changes
3. highest-risk joins, filters, or aggregations
4. concrete validation checks to run
5. what needs human confirmation

## Verification

- [ ] Intended grain stated for before and after
- [ ] Every flagged risk tied to a specific join, filter, or aggregation
- [ ] At least one runnable validation check proposed per high-risk finding
- [ ] Human-confirmation items listed separately

## Failure Modes

- **Syntax-only review** — the query parses and runs, so it gets approved; business meaning was never checked.
- **Style distraction** — prioritize correctness over style; do not get distracted by minor formatting issues.
- **Plausible-results trap** — numbers in the right ballpark pass review while the population definition silently changed.
- **Editing instead of reporting** — do not edit code unless explicitly asked.
