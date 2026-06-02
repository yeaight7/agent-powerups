---
name: dead-code-removal
description: "Use to identify and safely delete unused functions, classes, exports, and files."
---

# Dead Code Removal

Dead code increases maintenance overhead and confuses developers.

## The Removal Protocol

1. **Verify Unused**: Before deleting anything, you must search the *entire repository* to ensure the symbol or file is truly unused. Do not assume it is dead just because the current file doesn't use it.
2. **Check for Dynamic Invocation**: Be wary of dynamically invoked code (e.g., reflection, dependency injection by string name, ORM mappers). If there is any doubt, leave it alone or ask the user.
3. **Delete Aggressively**: Once confirmed unused, delete the code. Do not comment it out.
4. **Prune Dependencies**: If you delete the only code that was using an imported module, remove the import statement as well.
5. **Run Tests**: Always run tests and/or type checkers (e.g., `tsc --noEmit`) after removal to ensure you didn't accidentally break a hidden dependency.