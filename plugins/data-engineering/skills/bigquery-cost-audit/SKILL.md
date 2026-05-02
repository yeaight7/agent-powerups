---
name: bigquery-cost-audit
description: Analyze BigQuery usage, identify cost hotspots, repeated failures, and practical optimization opportunities.
---

# BigQuery Cost Audit

Use this skill when reviewing BigQuery usage, query cost, failures, performance inefficiencies, or governance opportunities.

## Goals

- Identify the main cost drivers.
- Detect repeated waste patterns.
- Suggest realistic optimization opportunities.
- Translate technical waste into business impact.

## What to inspect

- high-cost jobs
- repeated scans
- queries with poor partition pruning
- missing clustering opportunities
- repeated failures
- low-value scheduled jobs
- duplicated logic
- joins or transformations likely causing excessive scan volume
- jobs that should be cached, narrowed, or rewritten

## Output format

Return:

1. top cost hotspots
2. recurring failure patterns
3. practical optimization opportunities
4. quick wins vs larger refactors
5. engineering summary
6. business summary

## Rules

- Focus on practical opportunities, not theoretical micro-optimizations.
- Prefer changes that reduce cost without increasing operational fragility.
- Do not run destructive operations.
- Do not edit code unless explicitly asked.
