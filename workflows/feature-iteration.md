# feature-iteration

Purpose: small, testable loop for adding one agent-powerups asset or CLI feature.

## Plan

1. Identify one promised asset class or CLI behavior.
2. Read current catalog, docs, and tests.
3. Write the smallest failing test for the promised behavior.
4. Add the minimal asset or CLI code to pass.
5. Update catalog and docs only for shipped behavior.
6. Run narrow validation, then full repo validation if shared surfaces changed.

## Guardrails

- No hidden installers.
- No broad compatibility claims.
- No secrets, personal paths, or global config mutation.
- Keep new assets review-before-use unless tested on a real host surface.

## Handoff

Report changed files, commands run, validation result, and remaining risks.
