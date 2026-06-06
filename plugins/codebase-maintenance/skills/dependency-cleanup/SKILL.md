---
name: dependency-cleanup
description: Use when package manifests carry unused or redundant third-party dependencies that slow builds, widen the security surface, or complicate updates.
---

## Purpose

Bloated dependencies slow down builds, increase security surface area, and complicate updates. Audit manifests against actual imports, remove unused packages via the package manager (so lockfiles stay correct), and validate with the build.

## When to Use

- The dependency list has grown without review
- Installs/builds are slow, or audits report vulnerabilities in packages nobody remembers using
- Multiple libraries in the manifest serve the same purpose

## Inputs

- The package manifest(s) — package.json, requirements.txt, Cargo.toml, or equivalent
- The repo's build and test commands

## Workflow

1. **Audit the manifest.** List declared dependencies:

   ```bash
   npm ls --depth=0           # JavaScript/TypeScript
   pip list --not-required    # Python: packages nothing else depends on
   ```

2. **Verify usage — manifest vs imports.** For any suspect dependency, perform a global search across the codebase:

   ```bash
   grep -rn "from ['\"]lodash\|require(['\"]lodash" .
   grep -rn "^import requests\|^from requests" .     # Python import forms
   npx depcheck                                      # JS/TS: automated manifest-vs-import report, if available
   ```

   Search build scripts, configs, and CI files too — not just src/.

3. **Remove with the package manager.** If there are zero usages, use the native command (e.g., `npm uninstall lodash` or `pip uninstall ...`). Do not just manually edit the manifest unless absolutely necessary, to ensure lockfiles are updated correctly.

4. **Consolidate duplicates.** If multiple libraries serve the exact same purpose (e.g., `moment` and `date-fns`), flag it to the user for future consolidation. Do not attempt a massive library migration autonomously.

5. **Validate.** Run the build and test suite to ensure the removed dependency wasn't implicitly required by a build script or runtime environment.

## Output

- Removed dependencies, each with its zero-usage search evidence
- Duplicate-purpose libraries flagged for user decision
- Build/test result after removal

## Verification

- [ ] Every removal backed by a zero-usage search, not the manifest alone
- [ ] Build scripts, configs, and CI files included in the search
- [ ] Removal done via the package manager — lockfile updated
- [ ] Build and test suite green after removal
- [ ] Duplicate-purpose libraries flagged, not auto-migrated

## Failure Modes

- **Manifest-only edits** — hand-editing the manifest desyncs the lockfile.
- **src-only searches** — build scripts, configs, and CI files also import packages.
- **Autonomous mega-migration** — consolidating duplicate libraries is a flagged decision, not a cleanup side effect.
