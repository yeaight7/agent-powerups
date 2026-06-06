---
name: context-docs
description: Use when a subsystem needs persistent context for future agents or engineers -- its boundaries keep being rediscovered the hard way, invariants keep getting violated, or sessions repeatedly ask the same questions about it.
---

## Purpose

Large centralized documentation files consume too much context window. Decentralized, module-specific context docs provide targeted information exactly when an agent needs it.

## When to Use

- A module's boundaries or invariants keep being rediscovered the hard way
- Onboarding or agent sessions repeatedly ask the same questions about a subsystem
- After a refactor changed how a module communicates with the rest of the app

## Inputs

- The subsystem directory and its public interface
- Existing docs, to avoid duplicating the central README or architecture docs

## Workflow

1. **Decide where the context belongs.** Module-specific knowledge goes in a context file *inside* the subsystem directory (e.g., `src/auth/CONTEXT.md`); repo-wide knowledge belongs in the central README or architecture docs — one home per fact, never both:

   ```bash
   find src -iname "CONTEXT.md" -o -iname "README.md"   # existing context docs
   rg -ln "<module name>" docs/                         # already documented centrally?
   ```

2. **Document only the boundaries.** How does this module communicate with the rest of the app? What are its critical invariants? Not implementation detail the code already states.

3. **Keep it terse.** Bullet points and exact file paths. No transient notes — session state, TODO lists, and progress logs belong in handoff documents, not context docs.

4. **Validate every path the doc references:**

   ```bash
   rg -no "src/[A-Za-z0-9_./-]+" src/auth/CONTEXT.md | sort -u   # referenced paths
   test -f src/auth/session.ts && echo OK                        # confirm each exists
   ```

5. **Update these files inline when refactoring the module.** A context doc that lags the refactor is worse than none.

## Output

- A short, boundary-focused context file inside the subsystem directory
- Stale or central-doc-duplicating content removed or relocated

## Verification

- [ ] Doc lives inside the subsystem it describes
- [ ] Content is boundaries and invariants, not implementation detail or transient notes
- [ ] Every referenced file path verified to exist
- [ ] No duplication of central docs — one home per fact
- [ ] Doc updated in the same change set as the refactor that affected it

## Failure Modes

- **Context dumping** — pasting session notes or progress logs into a context doc; that is a handoff, not context.
- **Central duplication** — the same fact in the central README and the module doc, guaranteed to diverge.
- **Path rot** — referenced files moved since the doc was written; validate paths on every touch.
- **Novel-length context** — if it doesn't fit on a screen, agents won't load it when they need it.
