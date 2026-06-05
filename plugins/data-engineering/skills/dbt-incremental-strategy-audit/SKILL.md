---
name: dbt-incremental-strategy-audit
description: Use when reviewing a new or changed dbt incremental model -- the strategy looks over-engineered, rebuild or delete behavior is unclear, or the model deviates from how the rest of the repo handles incrementals.
---

## Purpose

Determine whether a dbt incremental model's chosen strategy is justified, understandable, maintainable, and consistent with repository conventions. The goal is not to praise clever implementations. Default stance: skeptical, low-risk, root-cause oriented, convention-preserving — prefer the simplest correct strategy.

## When to Use

- Reviewing a new or modified `materialized='incremental'` model
- An incremental model shows confusing runtime behavior: unexpected rebuilds, deletes, or reprocessing
- A model deviates from the repo's established incremental conventions without explanation

## Inputs

- The model SQL and its config: `incremental_strategy`, `unique_key`, `partition_by`/`cluster_by`/`partitions`, `pre_hook`/`post_hook`
- Comparable incremental models in the same repo

## Workflow

1. **Understand the repo pattern first.** Inspect similar incremental models and how they configure their strategies:

   ```bash
   grep -rn "incremental_strategy" models/
   grep -rln "is_incremental()" models/
   ```

2. **Explain the actual runtime behavior.** Compile the model and read the SQL that really runs — `is_incremental()` branches make the Jinja source misleading:

   ```bash
   dbt compile --select <model>
   # then read target/compiled/<project>/models/.../<model>.sql
   ```

   `is_incremental()` is false when the target table does not yet exist or on `--full-refresh`, so reason through both branches.

3. **Review the full incremental surface:** `materialized='incremental'`, `incremental_strategy`, `is_incremental()` logic, `unique_key`, `partition_by`/`cluster_by`/`partitions`, `pre_hook`/`post_hook`, delete/overwrite/merge semantics, rolling window logic, deduplication choices.

4. **Identify hidden risks:**
   - hybrid full-refresh behavior hidden inside an incremental model
   - deletes outside expected scope
   - reprocessing more data than intended
   - partition/window drift and maintenance burden
   - strategy mismatch with the repo's established conventions
   - operational complexity without clear business benefit
   - confusing runtime behavior that future maintainers may misread

5. **Check downstream stability before recommending a change:**

   ```bash
   dbt ls --select <model>+
   ```

   Strategy changes can shift BI/reporting outputs; list affected downstream assets.

## Output

- A. Current model runtime behavior
- B. Repo convention comparison
- C. Strategy risks
- D. Whether the complexity is justified
- E. Safer alternative
- F. Minimal-diff recommendation
- G. Validation plan

## Verification

- [ ] Compiled SQL inspected, not just the Jinja source
- [ ] At least one comparable incremental model in the repo compared
- [ ] Delete/overwrite/merge scope stated explicitly
- [ ] Downstream assets listed before any strategy change is recommended
- [ ] Recommendation is a minimal diff and includes a validation plan

## Failure Modes

- **Praising cleverness** — operational complexity without clear business benefit is a finding, not a feature.
- **Reading Jinja instead of compiled SQL** — `is_incremental()` branches hide the real runtime behavior.
- **Auditing in isolation** — a strategy that is fine on its own may still be an unjustified deviation from repo conventions.
