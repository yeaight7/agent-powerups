---
name: dependency-cleanup
description: "Use to audit and remove unused or redundant third-party dependencies from package manifests."
---

# Dependency Cleanup

Bloated dependencies slow down builds, increase security surface area, and complicate updates.

## Cleanup Protocol

1. **Audit**: Review package manifests such as package JSON, requirements text, or Cargo manifests.
2. **Verify Usage**: For any suspect dependency, perform a global search across the codebase (e.g., `import .* from 'lodash'`).
3. **Remove**: If there are zero usages, use the native package manager command to remove it (e.g., `npm uninstall lodash` or `pip uninstall ...`). Do not just manually edit the manifest unless absolutely necessary, to ensure lockfiles are updated correctly.
4. **Consolidate**: If multiple libraries serve the exact same purpose (e.g., `moment` and `date-fns`), flag it to the user for future consolidation. Do not attempt a massive library migration autonomously.
5. **Validate**: Run the build and test suite to ensure the removed dependency wasn't implicitly required by a build script or runtime environment.
