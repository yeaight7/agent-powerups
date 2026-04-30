# Agent Powerups

**Oh My Zsh for coding agents.**

Agent Powerups is an Oh My Zsh-style collection of reusable skills, slash commands, MCP configs, hooks, AGENTS.md templates, and workflows for coding agents.

Today, this repo ships:

- reusable skills
- safe local CLI (`apx`) with runnable local checks
- persistent Gemini relay for always-active secondary-agent delegation
- validation and requirement-check scripts
- verified local GitHub MCP check, smoke, and install flow
- command, hook, workflow, examples, and AGENTS.md templates
- experimental local plugin layout

Everything else stays conservative. No global mutation. No hidden install hooks. No fake marketplace claims.

## What Is Here

| Path | Status | Notes |
|------|--------|-------|
| `skills/` | shipped | Reusable agent workflows such as `systematic-debugging` and `writing-plans` |
| `mcp/` | shipped | Local-first GitHub MCP config with check, smoke, and explicit install commands |
| `agents-md/` | shipped | Starter AGENTS.md templates |
| `commands/` | shipped | Review-first command prompts plus safe runnable checks |
| `hooks/` | shipped | Review-before-use hook recipes plus safe runnable checks |
| `workflows/` | shipped | Scenario guides |
| `plugins/` | experimental | Local-only plugin layout with deterministic build/validate commands |
| `scripts/` | shipped | Validation and tool-check helpers for this repo |
| `examples/` | shipped | Minimal safe setup examples |

## Quickstart

### Using Source Checkout (Development)

1. Clone and install deps:

```sh
git clone https://github.com/yeaight7/agent-powerups.git
cd agent-powerups
npm install
```

2. Build CLI and install globally:

```sh
npm run build
npm link
```

3. Check repo health:

```sh
apx doctor
apx doctor --full
```

4. Browse catalog:

```sh
apx list
apx info markitdown-file-intake
apx commands run ship-check
apx hooks run no-secrets-preflight --all
apx mcp check github-local --target generic
apx mcp smoke github-local --json
apx mcp install github-local --target codex --dry-run
```

5. Try a local advisor CLI and save an artifact:

```sh
apx ask-codex "Return OK only" --json
apx ask-claude "Return OK only" --json
apx ask-gemini "Return OK only" --json
```

6. Check deps without installing:

```sh
apx check markitdown-file-intake
apx check ask-codex
apx check ask-claude
apx check ask-gemini
```

Preview supported dependency installers before asking for approval:

```sh
apx check defuddle --install-missing --dry-run
apx check markitdown-file-intake --install-missing --dry-run
```

7. Dry-run safe install:

```sh
apx install markitdown-file-intake --target codex --dry-run
apx install ask-claude --target codex --dry-run
```

8. Dry-run agent setup:

```sh
apx setup codex --dry-run
apx setup claude-code --dry-run
apx setup gemini --dry-run
```

Apply only after review:

```sh
apx setup codex --yes
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
- `ask-codex`
- `using-powerups`

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
- `using-powerups-command`

Current shipped hook examples:

- `no-secrets-preflight`
- `handoff-summary`
- `validation-required`

Current shipped examples:

- `minimal-setup-example`
- `codex-setup-example`
- `claude-code-setup-example`

Current shipped workflows:

- `feature-iteration`
- `agent-relay`

Schema details: [`docs/catalog-schema.md`](./docs/catalog-schema.md)

## Compatibility Matrix

Compatibility claims in this repo are intentionally narrow:

| Asset class | Shipped today | Compatibility claim |
|-------------|---------------|---------------------|
| Root `skills/` | yes | Generic text-based skills; some also mention known agent surfaces |
| `mcp/` | yes | Verified local GitHub MCP check/smoke/install flow for the official Docker-backed server |
| `agents-md/` | yes | Plain text templates |
| `commands/` | yes | Review-first markdown command prompts; Claude Code and Codex targets where provided |
| `hooks/` | yes | Documentation recipes only; not installed automatically |
| `workflows/` | yes | Plain text scenario guides |
| `plugins/` | experimental | Local layout only; no official marketplace claim |
| `scripts/` | yes | Generic Python scripts |
| `examples/` | yes | Plain text setup examples only |

More detail: [`docs/compatibility.md`](./docs/compatibility.md)

## Tool Requirements

Most shipped skills are pure text and need no extra installation.

Current optional external tools used by shipped skills:

| Skill | Tool | Required | Install |
|-------|------|----------|---------|
| `ask-codex` | Codex CLI (`codex`) | yes for local advisor workflow | install/configure Codex CLI |
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
npm link
apx doctor
apx doctor --full --json
apx list
apx info markitdown-file-intake
apx check markitdown-file-intake
apx ask-codex "Explain this code" --json
apx ask-claude "Review this patch" --json
apx ask-gemini "Brainstorm test cases" --json
apx relay start second-opinion --provider gemini --json
apx relay ask second-opinion "Review this plan" --json
apx relay stop second-opinion --json
apx ship-check --json
apx no-secrets-preflight --all --json
apx using-powerups
apx install markitdown-file-intake --target codex --dry-run
apx setup codex --dry-run
apx setup claude-code --dry-run
apx setup gemini --dry-run
```

Extra surfaces:

```sh
apx mcp list
apx mcp print github-local --target claude-code
apx mcp check github-local --target claude-code --json
apx mcp smoke github-local --json
apx mcp install github-local --target codex --dry-run
apx mcp install github-local --target claude-code --dry-run
apx mcp write github-local --target generic --dest .agent-powerups/github-local.json
apx agents-md list
apx agents-md print typescript-app
apx commands list
apx commands print ship-check --target generic
apx commands run ship-check --full
apx hooks list
apx hooks print no-secrets-preflight
apx hooks run no-secrets-preflight --path README.md
apx workflows list
apx workflows print feature-iteration
apx plugin validate plugins/agent-powerups
apx plugin diff plugins/agent-powerups
apx plugin build --dest plugins/agent-powerups --dry-run
```

To explicitly copy a skill into a local Codex-visible folder, choose the destination yourself:

```sh
apx install ask-claude --target codex --dest .agent-powerups/installed/ask-claude
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
