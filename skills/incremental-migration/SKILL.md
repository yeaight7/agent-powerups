---
name: incremental-migration
description: "Use when migrating APIs, libraries, or patterns across a large codebase. Ensures safe, step-by-step progress rather than risky mega-commits."
---

# Incremental Migration

Never attempt to migrate an entire codebase in a single step. Mega-commits are impossible to review and dangerous to merge.

## The Incremental Strategy

1. **Define the Target Pattern**: Clearly establish the "Old Way" and the "New Way".
2. **Implement Side-by-Side**: Create the "New Way" implementation alongside the old one. Do not delete the old one yet.
3. **Migrate One Vertical Slice**: Pick exactly one feature, route, or component. Update it to use the new pattern.
4. **Test and Commit**: Verify the slice works. Commit this step.
5. **Repeat**: Move to the next slice.
6. **Deprecate and Remove**: Only once all usages of the "Old Way" are gone can you safely delete the old implementation.

If a migration is too large for a single session, leave a clear handoff document summarizing progress and the next files to migrate.
