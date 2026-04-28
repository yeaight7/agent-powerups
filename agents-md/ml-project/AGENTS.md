# AGENTS.md

## Project Type

Machine learning project.

## Working Rules

- Preserve seeds, splits, metrics, and experiment tracking unless requested.
- Treat data changes as high-risk.
- Keep model comparisons reproducible.

## Validation

1. Run targeted unit tests first.
2. Run small smoke training/eval when model code changes.
3. Report metric changes with exact command and dataset/split.

## Safety

- Do not upload datasets, models, or tokens without explicit approval.
