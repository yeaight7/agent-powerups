---
name: regression-bisecting
description: Use when a bug was recently introduced but you don't know which commit caused it.
---

## Purpose

When a feature used to work but is now broken, do not guess what broke it. Use binary search through git history to find the exact commit, then read the root cause out of that commit's diff.

## When to Use

- A regression appeared and the offending commit is unknown
- A bug is reported "since some release" with a wide commit range
- A deterministic repro command exists or can be built

## Inputs

- A test command that returns exit code `0` if good and non-zero if bad (e.g., `npm run test:repro` or `node repro.js`)
- A known-good ref and a known-bad ref (typically `HEAD`)

## Workflow

1. **Define the test.** You must have a single command that returns exit code `0` if good, and non-zero if bad. If none exists, build one first (see `minimal-reproduction`).

2. **Find a known good state.** Ask the user or search git history for a commit where you are certain the feature worked (a release tag is a good candidate). Verify it by running the test on it.

3. **Find the known bad state.** Typically `HEAD`.

4. **Bisect automatically:**

   ```bash
   git bisect start <bad> <good>
   git bisect run npm run test:repro    # or: git bisect run node repro.js
   git bisect log                       # record of the search
   git bisect reset                     # always return to the original ref
   ```

   `git bisect run` checks out each midpoint and runs the command until it isolates the first bad commit. Use `git bisect skip` for midpoints that fail to build. For workflows where `bisect run` is not viable, manually check out the midpoint commit, run the test, and narrow the window with `git bisect good` / `git bisect bad`.

5. **Analyze the offending commit.** Once the exact commit is found, use `git show <commit>` to analyze the diff. The root cause is contained entirely within that diff.

## Output

- The first bad commit (hash + subject) and the bisect log
- A root-cause explanation grounded in that commit's diff

## Verification

- [ ] Test command verified deterministic (0/non-zero) before bisecting started
- [ ] Known-good ref actually tested as good, not assumed
- [ ] `git bisect reset` run afterward — repo back on the original ref
- [ ] Root cause explained from the offending diff, not just the commit named

## Failure Modes

- **Flaky test command** — a non-deterministic repro sends the bisect to a random commit; stabilize it first (see `flaky-test-investigation`).
- **Unverified "good" ref** — if the good commit was never tested, the entire search window may be wrong.
- **Forgetting `git bisect reset`** — leaves the repo detached on a bisect commit.
- **Build-broken midpoints** — guess instead of `git bisect skip` and the result is corrupted.
