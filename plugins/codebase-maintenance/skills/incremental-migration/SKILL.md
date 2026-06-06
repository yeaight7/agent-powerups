---
name: incremental-migration
description: Use when migrating APIs, libraries, or patterns across a large codebase and a single mega-commit would be too risky to review or merge.
---

## Purpose

Never attempt to migrate an entire codebase in a single step. Mega-commits are impossible to review and dangerous to merge. Migrate in verified, committed slices, tracking the remaining inventory to zero.

## When to Use

- Replacing an API, library, or pattern with many call sites
- A framework or major-version upgrade touches a wide surface area
- A previous big-bang migration attempt stalled or was reverted

## Inputs

- The "Old Way" and "New Way" definitions
- The repo's test command

## Workflow

1. **Define the target pattern.** Clearly establish the "Old Way" and the "New Way".

2. **Build the inventory.** Make the migration measurable:

   ```bash
   git grep -ln "oldApiCall(" -- "src/"                # files still on the Old Way
   git grep -c "oldApiCall(" -- "src/" | sort -t: -k2 -nr   # hotspots first
   ```

3. **Implement side-by-side.** Create the "New Way" implementation alongside the old one. Do not delete the old one yet.

4. **Migrate one vertical slice.** Pick exactly one feature, route, or component; update it to use the new pattern. Mechanical rewrites can be scripted per slice:

   ```bash
   # codemod sketch — scoped to one slice; review the diff before committing
   git grep -l "oldApiCall(" -- "src/feature-x/" | xargs sed -i "s/oldApiCall(/newApiCall(/g"
   git diff --stat    # confirm the change stayed inside the slice
   ```

   (For syntax-aware rewrites, AST codemod tools such as jscodeshift or comby are safer than sed, when available.)

5. **Test and commit.** Verify the slice works. Commit this step.

6. **Repeat.** Move to the next slice, re-running the inventory to watch the count fall.

7. **Deprecate and remove.** Only once all usages of the "Old Way" are gone (inventory at zero) can you safely delete the old implementation.

If a migration is too large for a single session, leave a clear handoff document summarizing progress and the next files to migrate.

## Output

- A series of slice-sized commits, each tested
- The shrinking inventory count per slice
- A handoff document if the migration spans sessions

## Verification

- [ ] Old Way and New Way explicitly defined before any edit
- [ ] Inventory command run before and after each slice
- [ ] Each slice committed separately with tests green
- [ ] Old implementation deleted only at inventory zero
- [ ] Handoff document written if work remains

## Failure Modes

- **Mega-commit relapse** — batching "just a few more files" until the diff is unreviewable.
- **Deleting the Old Way early** — half-migrated code with the old path gone cannot merge safely.
- **Unscoped codemods** — repo-wide sed instead of per-slice; always diff-check the blast radius.
- **No inventory** — without a count, "almost done" is a feeling, not a fact.
