# Agent Powerups

**Oh My Zsh for coding agents.**

Agent Powerups is an Oh My Zsh-style collection of reusable skills, slash commands, MCP configs, hooks, AGENTS.md templates, and workflows for coding agents.

Today, this repo ships:

- reusable skills
- safe local CLI (`apx`) with runnable local checks
- validation and requirement-check scripts
- first local MCP config snippets
- first command, hook, workflow, and AGENTS.md templates
- experimental local plugin layout

Everything else stays conservative. No global mutation. No hidden install hooks. No fake marketplace claims.

## What Is Here

| Path | Status | Notes |
|------|--------|-------|
| `skills/` | shipped | Reusable agent workflows such as `systematic-debugging` and `writing-plans` |
| `mcp/` | shipped | Local-first MCP config snippets for checking and explicit writes |
| `agents-md/` | shipped | Starter AGENTS.md templates |
| `commands/` | shipped | Runnable local command packs |
| `hooks/` | shipped | Runnable local hook checks |
| `workflows/` | shipped | Scenario guides |
| `plugins/` | experimental | Local-only plugin layout with deterministic build/validate commands |
| `scripts/` | shipped | Validation and tool-check helpers for this repo |
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
node dist/cli/apx.js doctor --full
```

4. Browse catalog:

```sh
node dist/cli/apx.js list
node dist/cli/apx.js info markitdown-file-intake
node dist/cli/apx.js commands run ship-check
node dist/cli/apx.js hooks run no-secrets-preflight --all
node dist/cli/apx.js mcp check github-local --target generic
```

5. Try a local advisor CLI and save an artifact:

```sh
node dist/cli/apx.js ask claude "Return OK only" --json
node dist/cli/apx.js ask gemini "Return OK only" --json
```

6. Check deps without installing:

```sh
node dist/cli/apx.js check markitdown-file-intake
node dist/cli/apx.js check ask-claude
node dist/cli/apx.js check ask-gemini
```

7. Dry-run safe install:

```sh
node dist/cli/apx.js install markitdown-file-intake --target codex --dry-run
node dist/cli/apx.js install ask-claude --target codex --dry-run
```

8. Dry-run agent setup:

```sh
node dist/cli/apx.js setup codex --dry-run
node dist/cli/apx.js setup claude-code --dry-run
node dist/cli/apx.js setup gemini --dry-run
```

Apply only after review:

```sh
node dist/cli/apx.js setup codex --yes
```

Agent setup docs:

- [`docs/setup/codex.md`](./docs/setup/codex.md)
- [`docs/setup/claude-code.md`](./docs/setup/claude-code.md)
- [`docs/setup/gemini.md`](./docs/setup/gemini.md)

9. Keep repo validation in loop:

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
- `ask-claude`
- `ask-gemini`

Current shipped scripts:

- `scripts/validate-skills.py`
- `scripts/validate-catalog.py`
- `scripts/check-requirements.py`

Current shipped MCP configs:

- `github-local`

Current shipped AGENTS.md templates:

- `typescript-app`
- `python-library`
- `dbt-project`
- `ml-project`
- `open-source-maintainer`

Current shipped command packs:

- `ship-check`

Current shipped hook examples:

- `no-secrets-preflight`

Current shipped workflows:

- `feature-iteration`

Schema details: [`docs/catalog-schema.md`](./docs/catalog-schema.md)

## Compatibility Matrix

Compatibility claims in this repo are intentionally narrow:

| Asset class | Shipped today | Compatibility claim |
|-------------|---------------|---------------------|
| Root `skills/` | yes | Generic text-based skills; some also mention known agent surfaces |
| `mcp/` | yes | Manual-review config snippets only; Codex output experimental/local |
| `agents-md/` | yes | Plain text templates |
| `commands/` | yes | Review-first markdown command prompts; Claude Code target where provided |
| `hooks/` | yes | Documentation recipes only; not installed automatically |
| `workflows/` | yes | Plain text scenario guides |
| `plugins/` | experimental | Local layout only; no official marketplace claim |
| `scripts/` | yes | Generic Python scripts |
| `examples/` | no | No support claim yet |

More detail: [`docs/compatibility.md`](./docs/compatibility.md)

## Tool Requirements

Most shipped skills are pure text and need no extra installation.

Current optional external tools used by shipped skills:

| Skill | Tool | Required | Install |
|-------|------|----------|---------|
| `ask-claude` | Claude Code CLI (`claude`) | yes for local advisor workflow | install/configure Claude Code CLI |
| `ask-gemini` | Gemini CLI (`gemini`) | yes for local advisor workflow | install/configure Gemini CLI |
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
node dist/cli/apx.js doctor --full --json
node dist/cli/apx.js list
node dist/cli/apx.js info markitdown-file-intake
node dist/cli/apx.js check markitdown-file-intake
node dist/cli/apx.js ask claude "Review this patch" --json
node dist/cli/apx.js ask gemini "Brainstorm test cases" --json
node dist/cli/apx.js install markitdown-file-intake --target codex --dry-run
node dist/cli/apx.js setup codex --dry-run
node dist/cli/apx.js setup claude-code --dry-run
node dist/cli/apx.js setup gemini --dry-run
```

Extra surfaces:

```sh
node dist/cli/apx.js mcp list
node dist/cli/apx.js mcp print github-local --target claude-code
node dist/cli/apx.js mcp check github-local --target claude-code --json
node dist/cli/apx.js mcp write github-local --target generic --dest .agent-powerups/github-local.json
node dist/cli/apx.js agents-md list
node dist/cli/apx.js agents-md print typescript-app
node dist/cli/apx.js commands list
node dist/cli/apx.js commands print ship-check --target generic
node dist/cli/apx.js commands run ship-check --full
node dist/cli/apx.js hooks list
node dist/cli/apx.js hooks print no-secrets-preflight
node dist/cli/apx.js hooks run no-secrets-preflight --path README.md
node dist/cli/apx.js workflows list
node dist/cli/apx.js workflows print feature-iteration
node dist/cli/apx.js plugin validate plugins/agent-powerups
node dist/cli/apx.js plugin diff plugins/agent-powerups
node dist/cli/apx.js plugin build --dest plugins/agent-powerups --dry-run
```

To explicitly copy a skill into a local Codex-visible folder, choose the destination yourself:

```sh
node dist/cli/apx.js install ask-claude --target codex --dest .agent-powerups/installed/ask-claude
```

## Experimental Plugin Layout

Local-only. Experimental-only. Not verified marketplace support.

- plugin files live under [`plugins/agent-powerups`](./plugins/agent-powerups)
- local marketplace example lives under [`.agents/plugins/marketplace.json`](./.agents/plugins/marketplace.json)
- use `apx plugin validate plugins/agent-powerups` before use
- use `apx plugin diff plugins/agent-powerups` to detect drift from catalog-backed root assets
- use `apx plugin build --dest plugins/agent-powerups --write` to refresh the local mirror from catalog assets
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
