---
name: bigquery-cost-audit
description: Use when reviewing BigQuery spend, query failure patterns, or scan inefficiencies -- identifying which jobs, users, or projects drive cost, or preparing optimization recommendations for a cost review.
---

# BigQuery Cost Audit

## When to Use
- Reviewing BigQuery query costs, failure patterns, or performance inefficiencies.
- Identifying which jobs, users, or projects are driving the highest spend.
- Preparing optimization recommendations for an engineering or cost-review meeting.
- Auditing governance: scheduled jobs, duplicated logic, or low-value recurring queries.

## Goals
- Identify the main cost drivers by job, project, and user.
- Detect repeated waste patterns (full scans, failed retries, duplicated logic).
- Suggest realistic optimizations with estimated impact.
- Translate technical waste into business-language findings.

## What to Inspect

### Cost hotspots
```sql
-- Top 20 most expensive jobs in the past 7 days
SELECT
  job_id, user_email, query,
  total_bytes_processed / POW(1024, 4) AS tb_processed,
  ROUND(total_bytes_processed / POW(1024, 4) * 6.25, 2) AS estimated_cost_usd,
  creation_time
FROM `region-us`.INFORMATION_SCHEMA.JOBS
WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND job_type = 'QUERY'
  AND state = 'DONE'
ORDER BY total_bytes_processed DESC
LIMIT 20;
```

### Repeated failures
```sql
SELECT
  error_result.reason, COUNT(*) AS failure_count, user_email,
  ANY_VALUE(query) AS sample_query
FROM `region-us`.INFORMATION_SCHEMA.JOBS
WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND error_result IS NOT NULL
GROUP BY error_result.reason, user_email
ORDER BY failure_count DESC;
```

### Missing partition pruning
Look for queries that scan full tables despite available partition columns:
- No `WHERE` filter on the partition column.
- `_PARTITIONTIME` or `_PARTITIONDATE` not in the filter.
- `LIMIT` used without a partition filter (does not reduce scan cost).

### Missing clustering
Check high-scan queries that filter on non-clustered columns after partitioning is already in place.

### Scheduled jobs with low value
```sql
-- Find scheduled queries with high scan volume (via Data Transfer Service run history)
-- Note: scheduled query metadata lives in region-specific transfer_run tables.
-- Substitute your project and region:
SELECT
  config.display_name,
  run.state,
  run.end_time,
  run.error_status
FROM `<project>.<region>.INFORMATION_SCHEMA.SCHEDULED_QUERY_RUNS` AS run
JOIN `<project>.<region>.INFORMATION_SCHEMA.SCHEDULED_QUERIES` AS config
  ON run.scheduled_query_id = config.scheduled_query_id
WHERE run.end_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
ORDER BY config.display_name, run.end_time DESC;
-- Then cross-reference with JOBS to find per-run bytes_processed.
```

## Output Format

1. **Top cost hotspots** — job ID, user, bytes scanned, estimated USD, query snippet.
2. **Recurring failure patterns** — error reason, count, user, sample query.
3. **Optimization opportunities**:
   - Partition pruning gaps.
   - Clustering candidates.
   - Queries eligible for materialization or caching.
   - Scheduled jobs that should be retired or narrowed.
4. **Quick wins vs larger refactors** — flag which optimizations are a one-line WHERE clause fix vs a schema change.
5. **Engineering summary** — technical root causes and remediation steps.
6. **Business summary** — cost impact in plain language; approximate monthly savings per opportunity.

## Rules
- Focus on practical opportunities, not theoretical micro-optimizations.
- Prefer changes that reduce cost without increasing operational fragility.
- Do not run destructive operations.
- Do not edit code or queries unless explicitly asked.
- Acknowledge uncertainty when cost estimates depend on assumptions about query frequency.

## Verification

- [ ] Hotspots listed with job, user, bytes scanned, and estimated USD
- [ ] Failure patterns grouped by error reason with counts and a sample query
- [ ] Each optimization classified as a quick win or a larger refactor
- [ ] Savings estimates state the assumptions behind them
- [ ] Findings include both an engineering summary and a business summary
