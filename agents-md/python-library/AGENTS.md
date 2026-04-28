# AGENTS.md

## Project Type

Python library.

## Working Rules

- Read package metadata and tests before editing.
- Prefer small API-compatible changes.
- Do not add dependencies or publishing config unless requested.

## Validation

1. Run targeted tests for changed modules.
2. Run type/lint checks if configured.
3. Run full test suite before release-facing changes.

## Safety

- Do not publish packages.
- Do not write tokens to config, docs, or examples.
