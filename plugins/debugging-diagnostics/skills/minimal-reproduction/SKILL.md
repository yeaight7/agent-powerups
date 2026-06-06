---
name: minimal-reproduction
description: Use when a bug must be isolated from a large application into a standalone, runnable script or single test case.
---

## Purpose

You cannot reliably fix what you cannot reliably reproduce in isolation. Apply the subtraction method until a single file deterministically triggers the exact reported error.

## When to Use

- A bug is tangled in app/UI/network layers and hard to debug in place
- A failure must be handed to another engineer, team, or upstream project
- Before bisecting or stress-testing, to get a fast deterministic signal

## Inputs

- The failing code path and the error it produces
- Sample data that triggers the failure, if any

## Workflow — the Subtraction Method

1. **Start with the failure.** Take the code path that fails.

2. **Remove the UI/Network.** If the bug is reported via a web request, write a script that calls the internal controller directly.

3. **Mock dependencies.** If the bug doesn't require the database, mock it. If it doesn't require the third-party API, mock it. Template:

   ```js
   // repro.js — minimal harness, no framework
   const { failingFunction } = require("./src/module");

   const fakeDb = { query: async () => [{ id: 1, value: null }] }; // smallest stub that triggers it

   failingFunction(fakeDb, { payloadKey: "trigger-value" })
     .then(() => { console.log("NO REPRO"); process.exit(0); })
     .catch((err) => { console.error("REPRO:", err.message); process.exit(1); });
   ```

   (Exit `0` on no-repro / non-zero on repro also makes the script directly usable by `git bisect run`.)

4. **Prune data.** If the bug fails on a 10MB JSON payload, binary search the payload down to the exact 2 keys that trigger the failure.

5. **Final output.** The result must be a single file — a standalone script or one test case — that relies on ZERO external state, can be run with a single command, and deterministically outputs the exact error reported.

## Output

- One standalone file plus the single command that runs it (e.g., `node repro.js`)
- The exact error output, proving the reproduction matches the report

## Verification

- [ ] Repro runs with one command and no external state (no DB, network, or special env)
- [ ] Error produced matches the reported error exactly
- [ ] Repro is deterministic across at least 3 consecutive runs
- [ ] Every remaining line is necessary — removing any piece makes the bug disappear

## Failure Modes

- **Partial isolation** — the "repro" still needs a live database or API; it will rot immediately.
- **Wrong error** — the script fails, but with a different error than reported; that is a different bug.
- **Over-pruning** — cutting until the bug vanishes and shipping the last version untested; re-run after every cut.
