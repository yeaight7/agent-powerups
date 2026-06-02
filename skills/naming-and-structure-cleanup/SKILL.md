---
name: naming-and-structure-cleanup
description: "Use to enforce consistent naming conventions and file structures across a project without changing business logic."
---

# Naming and Structure Cleanup

Inconsistent naming (camelCase vs snake_case) and messy file structures make codebases hard to navigate.

## Cleanup Rules

1. **Observe Local Conventions**: Before renaming, scan the project to determine the dominant convention. If 80% of files use `camelCase`, enforce `camelCase`.
2. **Targeted Renames**: Use the `safe-rename` command pattern to update variables, classes, or files. Ensure all imports are updated.
3. **File Co-location**: Move files so that closely related logic is co-located (e.g., keeping `Button.tsx`, `Button.css`, and `Button.test.tsx` in the same directory).
4. **No Logic Changes**: Do not refactor the internal logic of functions while performing naming cleanups. Keep the diff focused purely on structure and names.
5. **Verify**: Run the project's type checker and test suite after every structural change.