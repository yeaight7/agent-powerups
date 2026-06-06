---
name: change-impact-check
description: Use before submitting a PR or considering a task done to evaluate the blast radius of your changes -- you touched a public signature, a shared utility, a schema, or added config and need to know what else is affected.
---

## Purpose

Code changes rarely exist in isolation. Before declaring success, evaluate the downstream consequences of your work: what depends on what you changed, and whether those dependents still hold.

## When to Use

- Before submitting a PR or marking a task complete
- You changed a public method signature, REST endpoint, or database schema
- You modified a shared utility, core helper, or widely-imported module
- You added or renamed an environment variable or config key

## Inputs

- The diff of your changes (staged or committed)
- Access to the repository to search for callers and run tests

## Workflow

1. **Scope the diff.** List what actually changed and which files are touched, so you know where to look for fallout.

   ```bash
   git diff --stat            # files changed + churn size
   git diff --name-only       # bare list to feed into searches
   ```

2. **API surface.** If you changed a public method signature, REST endpoint, or database schema, search the entire repository for usages of the old signature. Every caller is a potential break.

   ```bash
   git grep -n "oldFunctionName"   # all references, with line numbers
   git grep -nw "endpointPath"     # whole-word match for a route/symbol
   ```

3. **Dependency graph.** If you updated a core utility (e.g., a date formatter), find every module that imports it and confirm their tests still pass. Inspect the dependency tree if a third-party package version moved.

   ```bash
   git grep -n "from '.*utils/date'"   # or the ecosystem equivalent import pattern
   npm ls some-package                 # or the ecosystem equivalent dependency tree
   ```

4. **Configuration.** If you added or renamed an environment variable, ensure it is documented in the example env file (e.g. .env.example) or the README, and that defaults exist where code reads it.

5. **Act on the blast radius.** If the impact is wide, run the full test suite (not just local unit tests) rather than the narrow subset, and explicitly document the affected areas in your handoff or PR description.

   ```bash
   npm test                            # or the ecosystem equivalent full suite
   ```

## Output

- A blast-radius assessment per dimension (API surface, dependency graph, configuration)
- The list of affected callers/modules and whether their tests pass
- A note in the PR description or handoff documenting wide-impact areas

## Verification

- [ ] Old signatures/endpoints/schemas searched repo-wide for remaining usages
- [ ] Importers of any changed shared utility identified and their tests confirmed passing
- [ ] New or renamed config documented in the example env file or README
- [ ] Full test suite run (not just local units) when blast radius is high
- [ ] Affected areas documented in the PR description or handoff

## Failure Modes

- **Narrow test run** — running only the local unit tests on a wide change; high blast radius demands the full suite.
- **Missed callers** — searching one directory or one spelling; grep the whole repo, including whole-word and import-path variants.
- **Silent config break** — adding an env var without documenting it or providing a default, so other environments fail at runtime.
- **Declaring done too early** — calling the task complete before checking downstream consequences at all.
