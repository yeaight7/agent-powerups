# Release Package Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the v0.1.0 npm/GitHub release path professional, repeatable, and safe.

**Architecture:** Keep release logic small and local. Use a Node script for local preflight checks, GitHub Actions for CI and tag-triggered publish, and docs for human release steps.

**Tech Stack:** Node.js, npm, GitHub Actions, TypeScript test suite.

---

### Task 1: Release Contract Tests

**Files:**
- Create: `test/release.test.ts`
- Modify later: `package.json`
- Create later: `scripts/release-check.mjs`
- Modify later: `.github/workflows/ci.yml`
- Create later: `.github/workflows/release.yml`
- Modify later: `docs/release-checklist-v0.1.0.md`

- [x] **Step 1: Write failing tests**

Add tests that assert:
- `package.json` exposes `release:check`.
- `scripts/release-check.mjs` exists and includes the required validation commands.
- CI runs on Ubuntu, Windows, and macOS.
- Release workflow publishes on `v*` tags with OIDC permissions, Node 24, npm latest, and `npm publish --access public`.
- Release checklist documents trusted publishing and post-publish verification.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/release.test.js`
Expected: FAIL because release assets do not exist yet.

- [ ] **Step 3: Add release assets**

Add the minimal files and metadata required by the tests.

- [ ] **Step 4: Run focused test to verify it passes**

Run: `npm run build && node --test dist/test/release.test.js`
Expected: PASS.

### Task 2: Full Validation

**Files:**
- No additional source files expected.

- [ ] **Step 1: Run release checks**

Run: `npm run release:check`
Expected: PASS, including dry-run pack/publish.

- [ ] **Step 2: Run full tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Inspect package contents**

Run: `npm pack --dry-run --json`
Expected: distributed files only; no secrets or local worktree artifacts.
