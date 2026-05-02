---
name: dbt-preflight
description: Inspect changed dbt assets, estimate blast radius, identify missing tests, and recommend the narrowest safe validation plan.
---

# dbt Preflight

Use this skill before opening a PR, reviewing a dbt change, or assessing risk in an analytics repository.

## Goals

- Understand which dbt assets changed.
- Estimate downstream impact.
- Detect likely gaps in testing, contracts, documentation, and YAML alignment.
- Recommend the narrowest safe validation path.

## What to inspect

- changed models
- changed snapshots
- changed seeds
- changed macros
- changed tests
- changed schema YAML files
- changed semantic models
- changed metrics
- changed saved queries
- changed exposures or BI-facing assets

## Review checklist

Check for:

- model grain changes
- renamed columns or breaking contract changes
- missing or weakened tests
- YAML not updated after model changes
- metrics or semantic definitions drifting from prior meaning
- high blast radius due to downstream dependencies
- incremental logic changes
- snapshot logic changes
- joins or filters that may alter business meaning

## Validation planning

Recommend the narrowest meaningful validation path first:

1. targeted model or test checks
2. narrow downstream or dependency checks
3. broader PR-level validation only if needed

If exact commands are available in the repo, use them.
If not, say what should be validated conceptually.

## Output format

Return:

1. changed assets summary
2. likely blast radius
3. likely missing checks or weak spots
4. recommended validation plan
5. items that need stakeholder or domain-owner confirmation

## Rules

- Focus on correctness and semantic impact, not style.
- Be conservative with claims.
- Do not edit code unless explicitly asked.
