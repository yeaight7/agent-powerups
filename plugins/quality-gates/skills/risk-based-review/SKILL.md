---
name: risk-based-review
description: Use when reviewing a PR or your own change plan and you need to decide how much scrutiny it deserves -- the diff touches auth, payments, crypto, migrations, or core shared code, or you are unsure where to focus limited review attention.
---

## Purpose

Not all code changes deserve the same level of scrutiny. A typo fix in a README is low risk; a change to the authentication middleware is critical. Allocate review attention based on the danger of the change, and state that judgment before giving feedback.

## When to Use

- Reviewing a PR and deciding how deep to go
- The diff touches auth, payments, cryptography, or database migrations
- The change hits core business logic, shared utilities, or public APIs
- Sanity-checking your own plan before implementing a sensitive change

## Inputs

- The diff or PR under review (and its file list)
- Repository access to inspect history and ownership of touched paths

## Workflow

1. **Size the change first.** Pull the file list and line counts so the risk call rests on real scope, not a guess.

   ```bash
   gh pr view --json files,additions,deletions   # files touched + size
   gh pr diff --stat                              # per-file churn
   ```

2. **Check churn and ownership on touched paths.** Frequently-changed or single-owner files raise risk.

   ```bash
   git log --oneline -10 -- path/to/changed/file  # recent history
   git log --format='%an' -- path/to/changed/file | sort -u  # owners
   ```

3. **Classify the change into one risk category** based on what it touches:
   - **Critical Risk** (auth, payments, cryptography, database migrations): require 100% test coverage for the change; require explicit human sign-off; look for edge cases, null pointers, and race conditions.
   - **High Risk** (core business logic, shared utilities, public API changes): require unit and integration tests; check backwards compatibility and blast radius (see change-impact-check).
   - **Low Risk** (UI tweaks, isolated components, internal tools): focus on readability, naming conventions, and simple unit tests.

4. **State the Risk Category explicitly** at the top of your review, before any line-level feedback, so the reader knows the bar being applied.

5. **Review to the bar for that category.** Apply the category's requirements; do not under-review a critical change or over-burden a low-risk one.

## Output

- A stated Risk Category for the PR, justified by the files and scope it touches
- Category-appropriate findings: coverage and sign-off demands for critical, compatibility and blast-radius checks for high, readability and naming for low

## Verification

- [ ] Change scope (files, line counts) was inspected before classifying
- [ ] Exactly one risk category assigned, matching what the diff touches
- [ ] Critical changes flagged for 100% coverage and explicit human sign-off
- [ ] High-risk changes checked for backwards compatibility and blast radius
- [ ] Risk Category stated before any line-level feedback

## Failure Modes

- **Uniform scrutiny** — reviewing a README typo as hard as auth middleware, wasting attention where it does not matter and starving it where it does.
- **Misclassifying by size** — treating a small diff as low risk when it touches auth, payments, crypto, or a migration; category follows what is touched, not line count.
- **Skipping the verdict** — giving feedback without stating the Risk Category, so the reader cannot tell what bar was applied.
- **Waiving the gate** — letting a critical change through without the required coverage or human sign-off because it "looks fine."
