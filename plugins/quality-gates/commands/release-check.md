---
description: "Run the complete release readiness pipeline (version checks, changelog, final quality gates) and assign a release confidence score."
argument-hint: "<intended-version>"
---

# Release Readiness Certification

Run the complete Agent Powerups release pipeline to ensure the repository is ready for a new version tag.

## Process Overview

This command orchestrates a full readiness review.

### 1. Artifact Verification
- Check that the `package.json`, `Cargo.toml`, or relevant manifests contain the target version `$ARGUMENTS`.
- Ensure `CHANGELOG.md` has an entry for the target version, with categorized changes (Features, Fixes, Breaking).

### 2. Deep Quality Gate
- Trigger a full test suite run including integration and end-to-end tests if available.
- Ensure zero linting errors and clean type checks.
- Verify that there are no remaining FIXME, TODO(release), or unresolved merge conflict markers.

### 3. Dependency Audit
- Run a quick security audit on dependencies.
- Flag any critical vulnerabilities that must be resolved before cutting the release.

### 4. Certification Badge

Assign a confidence badge based on the results:

| Badge | Criteria |
|-------|----------|
| 🟢 Ready | All versions match, changelog is perfect, tests pass, no vulnerabilities. |
| 🟡 Warn | Tests pass, but changelog lacks detail or minor dependency warnings exist. |
| 🔴 Blocked | Tests fail, versions mismatch, or critical security vulnerabilities found. |

## Output

Generate a comprehensive Release Certification markdown report detailing the findings in each phase and explicitly stating the final Go/No-Go decision.
