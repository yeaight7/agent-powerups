---
name: sql-business-logic-review
description: Review SQL for business logic correctness, semantic drift, aggregation risk, and silent definition changes.
---

# SQL Business Logic Review

Use this skill when reviewing SQL that affects reporting, metrics, transformations, financial logic, product logic, or stakeholder-facing outputs.

## Goals

- Review SQL as business logic, not just syntax.
- Detect silent semantic changes.
- Flag places where technically valid SQL can still produce wrong business results.

## What to look for

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

## Review questions

Ask:

1. What is the intended grain before and after this query?
2. Could this query duplicate or drop rows?
3. Has the business definition changed even if the SQL still runs?
4. Are there edge cases around nulls, late-arriving data, or time windows?
5. What result could look plausible while still being wrong?

## Output format

Return:

1. summary of business-logic risks
2. likely semantic changes
3. highest-risk joins, filters, or aggregations
4. concrete validation checks to run
5. what needs human confirmation

## Rules

- Prioritize correctness over style.
- Do not get distracted by minor formatting issues.
- Do not edit code unless explicitly asked.
