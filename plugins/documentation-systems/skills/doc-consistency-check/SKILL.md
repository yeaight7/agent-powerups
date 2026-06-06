---
name: doc-consistency-check
description: Use when documentation may have rotted against the code -- files were renamed or moved, scripts or env vars changed, or readers report commands and paths from the docs that no longer work.
---

## Purpose

Documentation rots when code changes. This check finds stale references in Markdown files — paths, commands, package scripts, env names, links — and flags them for immediate correction.

## When to Use

- After a refactor that renamed or moved files, scripts, or env vars
- A reader followed the docs and a command or path failed
- Periodic doc hygiene before a release

## Inputs

- The documentation set (Markdown files across the repo, not just the README)
- The current repo state to validate against

## Workflow

1. **Inventory the docs and extract referenced paths:**

   ```bash
   git ls-files "*.md"                                                      # full doc inventory
   rg -no "[A-Za-z0-9_-]+/[A-Za-z0-9_./-]+\.[a-z]{2,4}" README.md docs/    # path-like references
   ```

2. **Verify referenced files still exist** in the repository. If not, the documentation is stale:

   ```bash
   test -f src/components/Button.tsx || echo "STALE: src/components/Button.tsx"
   ```

3. **Verify documented commands against reality.** Package scripts, CLI invocations, and env names must match the current source:

   ```bash
   rg -no "npm run [a-z:-]+" README.md docs/ | sort -u    # documented scripts...
   rg -n "\"scripts\"" -A 20 package.json                 # ...vs actual scripts
   rg -no "[A-Z][A-Z0-9_]{3,}=" docs/ | sort -u           # documented env names vs config source
   ```

4. **Check code blocks in documentation.** Do the function names and variable names still match the actual source code?

   ```bash
   rg -n "functionNameFromDocs" src/ || echo "identifier not found in source"
   ```

5. **Check links.** Relative links must resolve to existing files; flag external links that obviously moved.

6. **Flag everything for immediate correction.** Fix in place when the right value is unambiguous; report the rest with file and line.

## Output

- A stale-reference report grouped by type (paths, commands, scripts, env names, links), each with doc file:line
- Fixes applied where the correct replacement is unambiguous

## Verification

- [ ] All Markdown files inventoried, not just the README
- [ ] Every doc-referenced path tested for existence
- [ ] Documented scripts and commands compared against the actual manifest/CLI
- [ ] Code-block identifiers spot-checked against source
- [ ] Each finding fixed or reported with file and line

## Failure Modes

- **README-only pass** — the rot usually lives in docs/ and subsystem files, not the front page.
- **Existence-only checking** — a path can exist while the command or identifier on the same line is stale.
- **Guessed fixes** — when the correct replacement is ambiguous, report it; do not invent one.
