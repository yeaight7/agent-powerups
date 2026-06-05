---
name: dbt-preflight
description: Use when a dbt change needs preflight before a PR, review, or merge -- changed models, snapshots, seeds, macros, or semantic YAML whose blast radius and test coverage are not yet known.
---

## Purpose

Inspect a dbt change set before it ships: identify which assets changed, estimate downstream impact, detect likely gaps in testing, contracts, documentation, and YAML alignment, and recommend the narrowest safe validation path. Preflight is read-only — do not edit code unless explicitly asked.

## When to Use

- Before opening a PR in an analytics repository
- Reviewing someone else's dbt change
- Assessing the risk of a change whose downstream impact is unclear

## Inputs

- The change set (branch diff or working tree)
- The dbt project, for lineage and selector queries

## Workflow

1. **Enumerate changed assets:**

   ```bash
   git diff --name-status origin/main...HEAD
   ```

   Classify each change: models, snapshots, seeds, macros, tests, schema YAML, semantic models, metrics, saved queries, exposures or BI-facing assets.

2. **Estimate blast radius.** For each changed model, list downstream dependents:

   ```bash
   dbt ls --select <model>+
   ```

   If a production manifest is available, cover the whole change set at once:

   ```bash
   dbt ls --select state:modified+ --state <path-to-prod-artifacts>
   ```

3. **Run the review checklist.** Check for:
   - model grain changes
   - renamed columns or breaking contract changes
   - missing or weakened tests
   - YAML not updated after model changes
   - metrics or semantic definitions drifting from prior meaning
   - high blast radius due to downstream dependencies
   - incremental logic changes
   - snapshot logic changes
   - joins or filters that may alter business meaning

4. **Recommend the narrowest meaningful validation path first:**
   1. targeted checks: `dbt build --select <changed_model>`
   2. narrow downstream checks: `dbt build --select <changed_model>+1`
   3. broader PR-level validation only if needed: `dbt build --select state:modified+ --state <path>`

   If exact commands are available in the repo (Makefile, CI config, docs), prefer them. If not, say what should be validated conceptually.

## Output

1. changed assets summary
2. likely blast radius
3. likely missing checks or weak spots
4. recommended validation plan
5. items that need stakeholder or domain-owner confirmation

## Verification

- [ ] Every changed file classified by asset type
- [ ] Blast radius backed by lineage (`dbt ls`), not guessed
- [ ] Each checklist hit mapped to a recommended validation step
- [ ] Validation plan starts with the narrowest step that covers the risk
- [ ] Stakeholder-confirmation items listed separately

## Failure Modes

- **Style distraction** — preflight is about correctness and semantic impact, not formatting.
- **Overclaiming impact** — be conservative with claims; verify lineage before asserting blast radius.
- **Validating everything** — defaulting to a full rebuild obscures which check actually covers the risk; the goal is the narrowest safe path.
- **Editing instead of reporting** — do not edit code unless explicitly asked.
