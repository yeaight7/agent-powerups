---
name: dead-code-removal
description: Use when unused functions, classes, exports, or files need to be identified and safely deleted.
---

## Purpose

Dead code increases maintenance overhead and confuses developers. Verify a symbol is truly unused across the entire repository, then delete it outright — never comment it out.

## When to Use

- A symbol, file, or export looks unused
- A feature removal or migration left orphaned helpers behind
- A coverage or lint report flags unreachable code

## Inputs

- The candidate symbols/files to remove
- The repo's test and type-check commands

## Workflow

1. **Verify unused — search the entire repository.** Do not assume code is dead just because the current file doesn't use it:

   ```bash
   grep -rn "symbolName" . --include="*.ts" --include="*.tsx"    # all references
   grep -rn "from ['\"].*module-name" src/                       # import sites
   git log -3 --oneline -- path/to/suspect-file                  # recent touches
   ```

   Ecosystem tools can shortcut the inventory when available (e.g., knip or ts-prune for TypeScript exports, vulture for Python).

2. **Check for dynamic invocation.** Be wary of dynamically invoked code — reflection, dependency injection by string name, ORM mappers, route tables, config-driven dispatch:

   ```bash
   grep -rn "\"symbolName\"\|'symbolName'" .    # string-keyed references
   ```

   If there is any doubt, leave it alone or ask the user.

3. **Delete aggressively.** Once confirmed unused, delete the code. Do not comment it out.

4. **Prune dependencies.** If you delete the only code that was using an imported module, remove the import statement as well.

5. **Run tests.** Always run tests and/or type checkers (e.g., `tsc --noEmit`) after removal to ensure you didn't accidentally break a hidden dependency.

## Output

- The deletion diff plus, per removed symbol, the search evidence that it was unused

## Verification

- [ ] Whole-repo search performed per symbol — including string-keyed/dynamic references
- [ ] No commented-out code left behind
- [ ] Orphaned imports pruned along with the dead code
- [ ] Tests and type checker green after removal

## Failure Modes

- **Current-file blindness** — "this file doesn't use it" is not "the repo doesn't use it".
- **Dynamic-invocation casualties** — reflection/DI/ORM references don't appear as imports; search string keys too.
- **Commenting instead of deleting** — commented-out code is still dead code; git history already preserves it.
