# AGENTS.md

## Project Type

dbt project.

## Working Rules

- Inspect model lineage before changing SQL.
- Keep metric and semantic changes explicit.
- Do not change warehouse credentials or profiles.

## Validation

1. Run targeted model tests for changed assets.
2. Run selector-based downstream checks for shared models.
3. Document any expected metric changes.

## Safety

- Never expose warehouse credentials.
- Avoid broad rebuilds unless requested.
