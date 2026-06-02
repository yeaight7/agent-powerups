# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

[0.5.1]: https://github.com/yeaight7/agent-powerups/releases/tag/v0.5.1
[0.4.0]: https://github.com/yeaight7/agent-powerups/releases/tag/v0.4.0
[0.3.0]: https://github.com/yeaight7/agent-powerups/releases/tag/v0.3.0
