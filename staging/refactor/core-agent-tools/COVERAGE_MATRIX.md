# Refactor Coverage Matrix: Core Agent Tools

**DRAFT: requires review before catalog/plugin activation.**

This matrix maps the raw harvest entries from `staging/harvest/manifest.json` to the proposed Agent Powerups drafts.

| Harvest Slug | Source Paths Consulted | Proposed Draft Asset | Coverage Status | Reason / Notes | Shipping Blockers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `probe` | `README.md`, `npm/README.md`, `docs/probe-agent/protocols/mcp*.md`, `npm/src/agent/mcp/*` | `drafts/probe-mcp-protocol/SKILL.md` | Complete | Captures raw tools (`search_code`, `query_code`, `extract_code`, `symbols_code`), method filtering, config priority, transports, and safe boundaries. | Needs review against current MCP spec and Agent Powerups MCP config format. |
| `filesystem-mcp-server` | `README.md`, `internal/server/server.go`, `internal/server/server_test.go` | `drafts/filesystem-mcp/README.md` | Partial | Raw Go server not shipped; conceptual guidance only. | Needs first-party runnable MCP config, path allowlist model, and tests before shipping. |
| `mcp-local-rag` | `skills/mcp-local-rag/**`, `README.md`, `server.json`, `src/server/tool-definitions.ts` | `drafts/mcp-local-rag/SKILL.md` | Complete | Covers query, file/string ingestion, deletion, list/status, and neighbor expansion. | Need decide local embedding/vector backend and privacy disclosure. |
| `codebase-context` | `README.md`, `templates/mcp/**`, `managed-mcp-session.mjs`, `src/server/config.ts` | `drafts/codebase-context-mcp/SKILL.md` | Complete | Covers stdio/http templates, managed session cleanup, timeouts, and process teardown. | Needs no-`npx -y` packaged config before shipping. |
| `agent-browser` | `skills/agent-browser/**`, `skill-data/core/**`, `agent-browser.schema.json`, templates | `drafts/browser-integration/SKILL.md` | Complete | Covers trust boundaries, auth/session files, snapshot refs, semantic locators, network interception, screenshots/video, proxy, and template workflows. | Requires testing against Browser Use / Playwright availability. |
| `playwright-skill` | `skills/playwright-skill/**`, `API_REFERENCE.md`, `lib/helpers.js`, `run.js`, `README.md` | `drafts/browser-integration/SKILL.md` | Complete | Adds dev-server detection, multi-viewport checks, login/forms/links/screenshots, and cleanup guidance. | Need avoid vendoring helper runtime unless rewritten and tested. |
| `promptfoo` | `.claude/skills/promptfoo-evals/**`, `.claude/skills/redteam-plugin-development/**`, `README.md` | `drafts/eval-runner/SKILL.md`, `drafts/redteam-plugin-development/SKILL.md` | Complete | Split general eval config/assertions from red-team plugin/grader standards. | Need decide whether `agent-evaluation-lab` bundle exists or folds into `quality-gates`. |
| `skill-optimizer` | `skills/skill-optimizer/**`, plugin manifests, `gemini-extension.json`, `README.md` | `drafts/skill-eval-workbench/SKILL.md` | Complete | Generic authoring draft removed; source is eval workbench, suite layout, graders, traces, hidden MCP fixtures, and plugin packaging hints. | Needs local runner decision; likely experimental only. |
| `context-compression` | `skills/context-compression/**`, `references/evaluation-framework.md`, scripts/tests, root `README.md` | `drafts/context-compression/SKILL.md` | Complete | Adds recall/artifact/continuation/decision probes and handoff acceptance criteria. | Overlaps existing `strategic-context-compaction`; merge decision needed. |
| `fast-agent` | `README.md`, `examples/card-packs/smart/README.md`, `examples/hf-toad-cards/skills/**`, `examples/experimental/mcp_sessions/README.md` | `drafts/fast-agent-runtime-patterns/SKILL.md`, `drafts/session-investigator/SKILL.md`, `drafts/pr-writing-review/SKILL.md` | Complete | Split runtime/card/MCP-session ideas from session-history investigation and PR writing-review extraction. | Runtime patterns experimental; PR/session skills need tool-specific validation. |

## Metadata Outcome
`metadata.json` preserves the deleted raw harvest manifest information and proposes:
- root candidates: `browser-integration`, `context-compression`, `eval-runner`
- new bundle candidates: `tool-integrations`, `agent-evaluation-lab`
- existing bundle duplications for `dev-vitals`, `quality-gates`, `codebase-intelligence`, `documentation-systems`, and `security-guardrails`

## Support File Outcome
Focused reference files were added for shipping review:

| Draft | Support File |
| --- | --- |
| `browser-integration` | `references/browser-safety-and-evidence.md` |
| `codebase-context-mcp` | `references/managed-session-checklist.md` |
| `context-compression` | `references/compression-quality-probes.md` |
| `eval-runner` | `references/eval-config-patterns.md` |
| `fast-agent-runtime-patterns` | `references/runtime-patterns.md` |
| `filesystem-mcp` | `references/path-boundary-checklist.md` |
| `mcp-local-rag` | `references/rag-tool-model.md` |
| `pr-writing-review` | `references/editorial-analysis-template.md` |
| `probe-mcp-protocol` | `references/probe-tool-selection.md` |
| `redteam-plugin-development` | `references/redteam-grader-checklist.md` |
| `session-investigator` | `references/history-diagnostics.md` |
| `skill-eval-workbench` | `references/workbench-suite-model.md` |
