# AGENTS.md

## Project Type

TypeScript application.

## Working Rules

- Read the smallest relevant set of files before editing.
- Prefer minimal diffs.
- Preserve the existing package manager, lint, test, and build flows.
- Run the narrowest meaningful validation before claiming completion.
- Do not add dependencies, secrets, or global config changes unless explicitly requested.

## Typical Validation Order

1. Run targeted tests for the changed area.
2. Run project lint or typecheck if the change affects shared code.
3. Run the full build only when needed.

## Safety

- Do not write tokens into source-controlled files.
- Ask before installing new tools.
- Treat generated config and integration snippets as review-before-use artifacts.
