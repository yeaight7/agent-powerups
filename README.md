# Agent Powerups

**Oh My Zsh for coding agents.**

Agent Powerups is an Oh My Zsh-style collection of reusable skills, slash commands, MCP configs, hooks, AGENTS.md templates, and workflows for coding agents.

Today, this repo ships:

- reusable skills
- safe local CLI (`apx`)
- validation and requirement-check scripts
- first local MCP config snippets
- first AGENTS.md template
- experimental local plugin layout

Everything else stays conservative. No global mutation. No hidden install hooks. No fake marketplace claims.

## What Is Here

| Path | Status | Notes |
|------|--------|-------|
| `skills/` | shipped | Reusable agent workflows such as `systematic-debugging` and `writing-plans` |
| `mcp/` | shipped | Local-first MCP config snippets for manual review and copy |
| `agents-md/` | shipped | Starter AGENTS.md templates |
| `plugins/` | experimental | Local-only plugin layout, not verified marketplace support |
| `scripts/` | shipped | Validation and tool-check helpers for this repo |
| `commands/` | planned | Placeholder for future command packs |
| `hooks/` | planned | Placeholder for future hook examples |
| `workflows/` | planned | Placeholder for future scenario guides |
| `examples/` | planned | Placeholder for future platform examples |

## Quickstart

1. Install deps:

```sh
npm install
```

2. Build CLI:

```sh
npm run build
```

3. Check repo health:

```sh
node dist/cli/apx.js doctor
```

4. Browse catalog:

```sh
node dist/cli/apx.js list
node dist/cli/apx.js info markitdown-file-intake
```

5. Check deps without installing:

```sh
node dist/cli/apx.js check markitdown-file-intake
```

6. Dry-run safe install:

```sh
node dist/cli/apx.js install markitdown-file-intake --target codex --dry-run
```

7. Keep repo validation in loop:

```sh
python scripts/validate-skills.py
python scripts/validate-catalog.py
python scripts/check-requirements.py
```

## Catalog Overview

Current shipped skills:

- `systematic-debugging`
- `no-fluff`
- `writing-plans`
- `ai-slop-cleaner`
- `requesting-code-review`
- `receiving-code-review`
- `pr-triage`
- `repo-map`
- `bug-hunt`
- `safe-refactor`
- `defuddle`
- `markitdown-file-intake`

Current shipped scripts:

- `scripts/validate-skills.py`
- `scripts/validate-catalog.py`
- `scripts/check-requirements.py`

Current shipped MCP configs:

- `github-local`

Current shipped AGENTS.md templates:

- `typescript-app`

Schema details: [`docs/catalog-schema.md`](./docs/catalog-schema.md)

## Compatibility Matrix

Compatibility claims in this repo are intentionally narrow:

| Asset class | Shipped today | Compatibility claim |
|-------------|---------------|---------------------|
| Root `skills/` | yes | Generic text-based skills; some also mention known agent surfaces |
| `mcp/` | yes | Manual-review config snippets only; Codex output experimental/local |
| `agents-md/` | yes | Plain text templates |
| `plugins/` | experimental | Local layout only; no official marketplace claim |
| `scripts/` | yes | Generic Python scripts |
| `commands/` | no | No support claim yet |
| `hooks/` | no | No support claim yet |
| `workflows/` | no | No support claim yet |
| `examples/` | no | No support claim yet |

More detail: [`docs/compatibility.md`](./docs/compatibility.md)

## Tool Requirements

Most shipped skills are pure text and need no extra installation.

Current optional external tools used by shipped skills:

| Skill | Tool | Required | Install |
|-------|------|----------|---------|
| `markitdown-file-intake` | Microsoft MarkItDown (`markitdown`) | yes for conversion workflow | `python -m pip install markitdown` |
| `defuddle` | Defuddle CLI (`defuddle`) | yes for Defuddle workflow | `npm install -g defuddle` |
| `pr-triage` | GitHub CLI (`gh`) | optional | platform package manager |

Tool policy:

- Do not assume tools are installed.
- Do not auto-install without user approval.
- Show install command before running it.
- Prefer user-local or project-local installation where practical.

More detail: [`docs/tool-requirements.md`](./docs/tool-requirements.md) and [`docs/installation.md`](./docs/installation.md)

## CLI Usage

```sh
npm install
npm run build
node dist/cli/apx.js doctor
node dist/cli/apx.js list
node dist/cli/apx.js info markitdown-file-intake
node dist/cli/apx.js check markitdown-file-intake
node dist/cli/apx.js install markitdown-file-intake --target codex --dry-run
```

Extra surfaces:

```sh
node dist/cli/apx.js mcp list
node dist/cli/apx.js mcp print github-local --target claude-code
node dist/cli/apx.js agents-md list
node dist/cli/apx.js agents-md print typescript-app
```

## Experimental Plugin Layout

Local-only. Experimental-only. Not verified marketplace support.

- plugin files live under [`plugins/agent-powerups`](./plugins/agent-powerups)
- local marketplace example lives under [`.agents/plugins/marketplace.json`](./.agents/plugins/marketplace.json)
- review all files before use
- never commit real tokens

## Safety Warning

Review assets before loading them into a trusted agent environment.

- Skills can instruct an agent to read local files or run commands.
- Hooks can execute code when supported by the host agent.
- MCP configs can expand tool access.
- Install commands can modify the local environment.
- Secrets should never be pasted into agent context unless strictly necessary.

See [`SECURITY.md`](./SECURITY.md) and [`docs/security-model.md`](./docs/security-model.md).

## Contributing

Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md)

Acknowledgements: [`ACKNOWLEDGEMENTS.md`](./ACKNOWLEDGEMENTS.md)

MCP configs: [`docs/mcp-configs.md`](./docs/mcp-configs.md)

Roadmap: [`docs/roadmap.md`](./docs/roadmap.md)
