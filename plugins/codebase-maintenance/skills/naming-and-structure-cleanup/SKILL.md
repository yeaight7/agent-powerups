---
name: naming-and-structure-cleanup
description: Use when naming conventions or file structure drift across a project and need to be made consistent without changing business logic.
---

## Purpose

Inconsistent naming (camelCase vs snake_case) and messy file structures make codebases hard to navigate. Enforce the dominant local convention with focused, logic-free diffs.

## When to Use

- Mixed naming conventions for the same kind of symbol or file
- Closely related files scattered instead of co-located
- Review feedback keeps flagging names/structure rather than logic

## Inputs

- The area to clean (directory or module)
- The repo's type-check and test commands

## Workflow

1. **Observe local conventions.** Before renaming, scan the project to determine the dominant convention. If 80% of files use camelCase, enforce camelCase:

   ```bash
   find src -type f | grep -cE "/[a-z]+[A-Z][a-zA-Z]*\."    # camelCase filenames
   find src -type f | grep -cE "/[a-z]+(_[a-z]+)+\."        # snake_case filenames
   grep -rnE "function [a-z]+_[a-z]+\(" src/                # snake_case functions in a camelCase repo
   ```

2. **Targeted renames.** Use the `safe-rename` command pattern to update variables, classes, or files. Ensure all imports are updated:

   ```bash
   git grep -ln "\bOldName\b" | xargs sed -i "s/\bOldName\b/NewName/g"   # then review the diff
   git mv src/old_location/Component.tsx src/feature/Component.tsx       # git mv preserves history
   git grep -n "old_location"                                            # no stale import paths remain
   ```

3. **File co-location.** Move files so that closely related logic is co-located (e.g., keeping `Button.tsx`, `Button.css`, and `Button.test.tsx` in the same directory).

4. **No logic changes.** Do not refactor the internal logic of functions while performing naming cleanups. Keep the diff focused purely on structure and names.

5. **Verify.** Run the project's type checker and test suite after every structural change.

## Output

- A rename/move-only diff with all imports updated
- The convention evidence (counts) that justified the chosen direction

## Verification

- [ ] Dominant convention measured before renaming, not assumed
- [ ] All imports/references updated — old names re-grepped with zero hits
- [ ] Diff contains zero logic changes
- [ ] Type checker and tests green after every structural change

## Failure Modes

- **Imposing taste over convention** — the repo's dominant style wins, not the cleaner's preference.
- **Rename + refactor in one diff** — mixing logic changes into a rename makes both unreviewable.
- **Substring renames** — search/replace without word boundaries renames symbols it shouldn't; re-grep the old name after.
