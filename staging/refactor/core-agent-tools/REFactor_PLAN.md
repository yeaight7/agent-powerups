# Refactor Plan: Core Agent Tools

**DRAFT: requires review before catalog/plugin activation.**

## 1. Target Asset List
Based on the Core 10 harvest, draft assets are:

1. **`browser-integration`** - browser automation workflow from `agent-browser` and `playwright-skill`.
2. **`context-compression`** - context compaction and handoff workflow from `context-compression`.
3. **`eval-runner`** - prompt/model eval workflow from `promptfoo-evals`.
4. **`redteam-plugin-development`** - red-team plugin and grader authoring workflow from promptfoo sub-skill material.
5. **`skill-eval-workbench`** - deterministic skill eval workbench workflow from `skill-optimizer`.
6. **`mcp-local-rag`** - local RAG MCP retrieval and ingestion workflow.
7. **`codebase-context-mcp`** - managed MCP context session workflow.
8. **`probe-mcp-protocol`** - MCP code search/tool protocol reference from Probe.
9. **`fast-agent-runtime-patterns`** - runtime/card/session design reference from fast-agent.
10. **`session-investigator`** - session history and tool-call trace diagnosis from fast-agent examples.
11. **`pr-writing-review`** - PR review comment writing analysis from fast-agent examples.
12. **`filesystem-mcp`** - conceptual filesystem MCP guidance; not runnable yet.

## 2. Keep / Merge / Defer / Drop Decisions
- **Merge:** `agent-browser` and `playwright-skill` become `browser-integration`.
- **Split:** `promptfoo` becomes `eval-runner` and `redteam-plugin-development`.
- **Split:** `fast-agent` becomes `fast-agent-runtime-patterns`, `session-investigator`, and `pr-writing-review`.
- **Rename:** `skill-optimizer` maps to `skill-eval-workbench`; generic skill-authoring content overlapped existing `writing-skills` and was removed.
- **Drop raw executables:** `.go`, `.mjs`, `.js`, shell templates, and Python helper scripts are not shipped from harvest. Their behavior is rewritten as docs/workflows.
- **Defer runnable MCP configs:** `filesystem-mcp`, `mcp-local-rag`, and `codebase-context-mcp` need first-party config design before moving under `mcp/`.

## 3. License / Attribution Handling
- Every draft includes an explicit `Attribution` section citing source slug and paths.
- `metadata.json` preserves source repo URLs, commits, license paths, and copied paths after raw harvest removal.
- Shipping pass must aggregate accepted upstream attributions into `ACKNOWLEDGEMENTS.md` before catalog activation.

## 4. Dependency & Requirement Checks
- `browser-integration`: check local Playwright/browser tool availability; no auto-install; no prod browsing without approval.
- `eval-runner`: check local eval tool; no `npx @latest`; ask before paid/network-heavy runs.
- `redteam-plugin-development`: require scoped fixtures; ask before harmful prompt generation or external target tests.
- `skill-eval-workbench`: require local runner/sandbox; do not forward broad env vars or secrets.
- `mcp-local-rag`: verify configured MCP server; no auto-provisioning vector DBs; exclude secrets before ingestion.
- `codebase-context-mcp`: verify stdio/http config; no `npx -y` execution without approval; ensure process cleanup.
- `probe-mcp-protocol`: use pinned/local Probe where possible; no unbounded method allowlists.
- `filesystem-mcp`: require explicit allowed roots and operation allowlists before runnable config.

## 5. Validation Checklist
- [x] Drafts have YAML frontmatter where they are skills.
- [x] Drafts include explicit `DRAFT` marker.
- [x] Coverage includes hidden/subfolder source material, including promptfoo red-team, fast-agent example skills, agent-browser references/templates, and skill-optimizer plugin manifests.
- [x] Metadata maps proposed root skills, new plugin bundles, and existing bundle duplications.
- [x] Raw upstream harvest removed after metadata preservation.
- [ ] Each candidate needs pressure-scenario testing before shipping as a real skill.

## 6. Next Steps for Shipping
To move these drafts into active circulation:
1. Pick accepted assets from `metadata.json`.
2. Review each accepted asset's `references/*.md`; keep only support files needed for agent behavior or heavy reference.
3. For each accepted skill, run `writing-skills` test workflow or explicitly accept draft-only risk.
4. Move approved root skills into `skills/<name>/`.
5. If bundle shipping is approved, create `plugins/tool-integrations` and/or `plugins/agent-evaluation-lab`, then duplicate selected skills into existing bundles listed in `metadata.json`.
6. Add/update `catalog.json`, `plugin-bundles.json`, `profiles.json` only in shipping pass.
7. Update `ACKNOWLEDGEMENTS.md` with source URLs, commits, and license paths.
8. Remove `DRAFT` markers from shipped copies only.
9. Run validators, build, tests, and package dry run.
