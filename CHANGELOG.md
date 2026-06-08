# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## Unreleased

### Changed — Setup and install workflow

- SX-06: Clarify the legacy `apx setup` compatibility path and support window.
- SX-07: Refresh stale Agent Powerups-owned install guidance and discovery indexes during native agent installs.

---

## [0.6.2] — 2026-06-08

### Added — Validation and discovery

- Added `apx validate drift` and `apx validate metadata` for skill and discovery metadata consistency checks.
- Added `apx validate plugins` for plugin bundle and marketplace metadata consistency.
- Added discovery-routing regression fixtures and `routing_priority` support for more deterministic task-based recommendations.

### Changed — Discovery and asset metadata

- Discovery scoring now uses per-asset metadata instead of hardcoded name boost rules.
- Backfilled catalog routing metadata across high-value assets so task matching has richer signals.
- `apx info` now enriches catalog output with frontmatter-derived details and next-action hints.

### Changed — Plugin metadata model

- Plugin version handling now derives from `package.json` instead of duplicated literals in generation paths.
- `plugin-bundles.json` is treated as the canonical source for plugin name, description, maturity, and composition metadata.
- Claude and Codex marketplace metadata now stays aligned with plugin bundle descriptions, versions, and maturity levels.

### Changed — Documentation

- Simplified README, compatibility, and installation docs around product vocabulary and primary CLI paths.
- Replaced more static catalog detail with CLI-driven pointers so documentation is less likely to drift.

---

## [0.6.1] — 2026-06-07

### Added — Task-based auto-discovery

- Added `apx inventory --target <codex|claude-code|gemini|generic> --json` to build a normalized asset inventory across catalog entries, plugin-contained assets, installed native skill directories, and staged `agent-powerups/` directories.
- Added `apx discover "<task>" --target <...> --json` with deterministic task routing into `primary`, `supporting`, and `approval_required` recommendations.
- Added `apx list --json --verbose` for machine-readable catalog browsing without changing the default human list output.
- Added frontmatter parsing helpers and discovery metadata support (`use_when`, `avoid_when`, `signals`, `capabilities`, `activation`, `check_policy`) so assets can describe when they should be selected.

### Changed — Plugin and install exposure

- `apx plugins info --json` now exposes contained skill, command, agent, and template metadata instead of only bundle-level information.
- Plugin installs and native agent installs now write `discovery-index.json` files so installed assets are queryable without scanning entire bundles.
- `using-powerups` guidance and command mirrors now route agents through discovery/inventory first and clarify that listing or checking an asset is not the same as using it.

### Fixed — Dependency-check semantics

- `apx check <asset>` now reports `SKIP` with "no dependency check needed; this does not validate usage" for assets without external requirements, reducing the chance that agents mistake a dependency check for successful skill use.
- Updated README and installation/tool-requirement docs to treat `apx check` as dependency-only.
- Corrected README plugin-bundle counts and npm badge URLs.

---

## [0.6.0] — 2026-06-06

This release closes the catalog-wide skill quality campaign (18 audit-driven fix batches) and adds a new CI gate that prevents the root-vs-plugin skill drift that the campaign spent much of its effort repairing.

### Added — Mirror-parity validation (new CI gate)

- New `scripts/validate-mirrors.py`: every plugin skill copy must stay byte-identical with its root skill (root is canonical). Content drift, files missing from a plugin copy, and plugin-only files are all errors.
- Intentional divergences are declared in an explicit in-script variant allowlist — currently the condensed dev-vitals `agent-harness-design` and the three `context-retrieval-loop` domain specializations — with hygiene warnings when an allowlisted copy becomes identical to root or an entry no longer matches anything.
- Enforced in CI as a dedicated "Validate Mirrors" step on the full Linux/Windows/macOS matrix, and added to `npm run release:check`. The check is gitignore-aware and deterministic across platforms (CRLF-normalized comparison; byte-safe `git check-ignore` batching; files whose counterpart path could never be committed are exempt).
- One-time restoration that the first scan demanded: 50 drifted or missing files synced root→plugin across 30 plugin copies — including plugin copies that were missing required support files (`requesting-code-review`'s bundled reviewer prompt, all five `systematic-debugging` reference/example files, `writing-plans`' reviewer prompt) and the memory-optimization `graphify` copy that had lost its upstream/license section.

### Added — Security skills (security-guardrails)

- `hook-safety-review` — enablement gate for one hook at a time: trigger-surface inventory, command-injection / outbound-network / silent-failure scans, and P0/P1/Note verdicts before anything is switched on.
- `mcp-risk-review` — pre-enable triage of an MCP server: launch-vector pinning, transport exposure, credential handling, tool-surface enumeration, and scope boundaries, followed by `apx mcp check` / `apx mcp smoke` behind an explicit user-approval gate.
- `secret-leak-preflight` — commit/publish-time secret gate over the staged diff, untracked files, and generated artifacts, with unstage-and-rotate guidance on any hit.
- All three ship at root and in the security-guardrails plugin, with catalog entries and bundle declarations.

### Added — Plugin commands materialized

- `model-route` (agentic-systems) and `security-audit` (security-guardrails) now exist as command files in their plugin directories, as byte copies of the root commands. Both bundles had advertised these commands without shipping them — plugin installs now deliver what `apx plugins list` declares.

### Added — Gemini extension maturity

- Every plugin `gemini-extension.json` carries a `maturity` field sourced from `plugin-bundles.json` (the single source of truth). The install-time manifest generator emits it for bundles without a manifest, and the plugin test contract now asserts it for all bundles.

### Changed — Skill quality campaign completed

- Finished the audit-driven quality pass across the shipped skill catalog: frontmatter descriptions are trigger-only ("Use when…"), reworked skills carry Verification checklists that restate their own rules as completion assertions, and thin skills gained concrete command workflows. This release lands the final waves: documentation skills, orchestration/relay/release/PR skills, the two mechanical frontmatter sets, and the Verification-only polish wave (memory workflows, graphify, git-worktree and branch-finishing flows, skill authoring, GitHub PR comment handling).
- `handoff-discipline` absorbed the one unique concept from `handoff-documentation` (recording dead ends so the next session doesn't retry them) and now also ships in documentation-systems; all copies are byte-identical.
- The three codebase-context MCP skills (`local-rag-mcp`, `managed-codebase-context`, `structured-code-search-mcp`) are now declared by the codebase-intelligence bundle that already shipped them on disk, matching the established multi-bundle convention.

### Removed

- `handoff-documentation` skill — a near-duplicate subset of `handoff-discipline`; its content was merged there and catalog, bundle, and README references were updated.

---

## [0.5.2] — 2026-06-02

### Changed — Instruction formatting

- Standardized Agent Powerups authoring guidance on YAML frontmatter plus pure Markdown bodies for durable agent instruction files.
- Converted shipped skill examples that used XML-like top-level section tags to Markdown headings.
- Added validation coverage to reject XML-like top-level section tags in `SKILL.md` files while preserving explicit delimiter and prompt-payload use cases.

---

## [0.5.1] — 2026-06-02

### Added — Root skills

- Mirrored 41 plugin-bundled skills into the root `skills/` directory so default installs and catalog discovery expose the same reusable guidance as plugin bundles.
- Added catalog entries for the mirrored skills across agentic systems, codebase maintenance, data engineering, debugging diagnostics, dev vitals, documentation systems, machine learning ops, memory optimization, and quality gates.

### Changed — Catalog hygiene

- Kept ignored `worktree-session-manager` WIP assets out of the public catalog and shipped skills list until their executable workflow is release-ready.

---

## [0.4.0] — 2026-05-16

### Added — MCP configs (18 total, up from 1)

Local servers:
- `context7` — up-to-date library and framework documentation retrieval
- `sequential-thinking` — structured step-by-step reasoning
- `playwright` — browser automation and web testing
- `filesystem-repo-scoped` — filesystem access scoped to repo root
- `memory` — persistent key-value memory store
- `fetch` — generic HTTP fetch and web content intake
- `time` — timezone and time conversion
- `git-local` — local repo status/diff/log via `mcp-server-git` (uvx)
- `postgres-readonly` — SELECT-only PostgreSQL access for dev analytics
- `github-remote` — remote HTTP GitHub MCP (alternative to Docker-based `github-local`)

Cloud/vendor servers (all experimental or beta; DRAFT configs require upstream verification):
- `supabase` — Supabase management API (`@supabase/mcp-server-supabase`)
- `vercel` — Vercel project and deployment access (HTTP endpoint)
- `cloudflare-docs` — Cloudflare documentation retrieval (read-only HTTP endpoint)
- `exa-search` — Exa semantic search (`exa-mcp-server`)
- `atlassian` — Jira and Confluence access (`@atlassian/mcp-server`)
- `browserbase` — cloud browser automation (`@browserbasehq/mcp`)
- `e2b-sandbox` — remote sandboxed code execution (`@e2b/mcp-server`)

Each config ships in three target formats: `mcp/generic/`, `mcp/claude-code/`, `mcp/codex/`.

### Added — Hook recipes (30 total, up from 3)

Safety:
- `destructive-bash-guard` — block dangerous shell commands before execution
- `env-file-mutation-approval` — require approval before writing `.env` files
- `dependency-review` — flag new or changed dependencies for review

Quality:
- `console-log-check` — catch debug `console.log` / `print` left in source
- `generated-file-warning` — warn on writes to auto-generated files
- `large-diff-warning` — warn when a single diff is unusually large
- `test-gate` — remind agent to run tests before claiming completion
- `lint-check` — remind agent to run linter before claiming completion
- `build-analysis-post` — summarize build/test/lint output and extract failures
- `design-quality-check` — prompt visual review after frontend file edits
- `migration-review-required` — checklist gate for DB migration files
- `todo-fixme-blocker` — catch bare TODO/FIXME markers before commit
- `pre-commit-quality-check` — aggregator: coordinates safety + quality hooks on `git commit`
- `quality-gate-after-edit` — suggest narrowest validation command per language after edits
- `typescript-post-edit-check` — detect and suggest typecheck command after `.ts`/`.tsx` edits
- `doc-file-warning` — warn when docs are written outside approved locations

Productivity:
- `auto-commit-message` — generate conventional commit messages
- `session-log` — structured per-tool-call event log
- `session-compaction-helper` — save/restore state around context compaction
- `dev-server-tmux-guard` — prevent long-running dev servers from blocking the agent session
- `handoff-completeness-check` — verify handoff covers changes, validation, risks, and next steps
- `session-lifecycle-state` — save state at session end; restore at session start

Cloud:
- `cloud-cli-guard` — block/confirm destructive commands for aws/gcloud/az/kubectl/terraform/pulumi

MCP:
- `mcp-write-guard` — intercept unexpected MCP write operations
- `mcp-config-change-approval` — require approval before MCP config changes
- `mcp-elicitation-guard` — block MCP elicitation requests that ask for credentials or broad permissions

### Added — Skills

- `release-readiness-protocol` — version bump, changelog, metadata, and publish checklist
- `changelog-generator` — turn commits/PRs/diffs into user-facing release notes
- `build-fix-minimal-diff` — fix broken builds with the smallest safe diff
- `environment-doctor` — diagnose local agent and project setup problems
- `webapp-visual-testing` — inspect and test web UIs via screenshots and browser automation

### Added — Commands

New commands across generic, Claude Code, and Codex targets:
- `build-fix` — targeted build/test failure fix workflow
- `changelog` — generate or update a changelog from commits
- `doctor` — run environment health checks
- `release` — full release readiness and publish workflow
- `visual-review` — browser-based UI review and screenshot workflow
- `mcp-check` — check prerequisites for an MCP config
- `mcp-smoke` — smoke-test an MCP server connection

### Updated — Documentation

- `README.md` — updated all "Current shipped" lists (skills: 24→71, MCP configs: 1→18, commands: 2→14, hooks: 3→30 organized by category); updated compatibility matrix
- `docs/mcp-configs.md` — full rewrite; now documents all 18 MCP configs with runtime, required env, risk level, and maturity

---

## [0.3.0] — prior release

See git log for changes prior to this changelog.

---

[0.5.2]: https://github.com/yeaight7/agent-powerups/releases/tag/v0.5.2
[0.5.1]: https://github.com/yeaight7/agent-powerups/releases/tag/v0.5.1
[0.4.0]: https://github.com/yeaight7/agent-powerups/releases/tag/v0.4.0
[0.3.0]: https://github.com/yeaight7/agent-powerups/releases/tag/v0.3.0
