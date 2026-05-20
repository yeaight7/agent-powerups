# Installation

Agent Powerups ships reusable skills, plugin bundles, and support assets for local coding agents. Manual install is intentionally direct: choose an agent and copy the native assets into that agent's root.

## Install The CLI

From a source checkout:

```powershell
npm install
npm run build
npm link
```

Verify the CLI:

```powershell
apx doctor
apx list
```

## Manual Native Install

Use this path when a human wants the full basic setup without asking an agent to curate it.

```powershell
apx install codex
apx install claude
apx install gemini
```

Default native install writes immediately and installs:

| Agent | Skills | Plugins |
|------|--------|---------|
| Codex | `%USERPROFILE%\.codex\skills\` | `%USERPROFILE%\.codex\plugins\` |
| Claude Code | `%USERPROFILE%\.claude\skills\` | `%USERPROFILE%\.claude\plugins\cache\agent-powerups\` |
| Gemini CLI | `%USERPROFILE%\.gemini\skills\` | `%USERPROFILE%\.gemini\extensions\` |

`claude` and `claude-code` are aliases for the same target.

Existing identical files are skipped. Existing changed files are not overwritten unless `--force` is passed.

Preview first:

```powershell
apx install codex --dry-run
apx install claude --dry-run
apx install gemini --dry-run
```

Show per-file paths:

```powershell
apx install codex --verbose
```

Use a non-default agent root:

```powershell
apx install codex --agent-root C:\tmp\codex-root
```

## Full Native Install

Full mode includes the default native install, stages support assets under `<agent-root>\agent-powerups\`, and updates the global instruction file when it already exists.

```powershell
apx install codex --full
apx install claude --full
apx install gemini --full
```

Instruction files:

| Agent | Instruction file |
|------|------------------|
| Codex | `<codex-root>\AGENTS.md` |
| Claude Code | `<claude-root>\CLAUDE.md` |
| Gemini CLI | `<gemini-root>\GEMINI.md` |

When the instruction file exists, `apx install <agent> --full` appends or refreshes one marked `agent-powerups` block and writes a timestamped backup first. When it does not exist, the block is written for review at:

```text
<agent-root>\agent-powerups\instructions\agent-powerups.md
```

Use a specific instruction file:

```powershell
apx install codex --full --instructions-file C:\path\AGENTS.md
```

MCP snippets are staged for review only. No MCP server is enabled automatically.

## Agent-Curated Setup

`apx setup <agent>` remains for compatibility and for agent-delegated curated setups. It is dry-run by default and still supports minimal, recommended, and full modes:

```powershell
apx setup codex --dry-run
apx setup codex --mode recommended --yes
apx setup codex --mode full --yes
```

Use it when an agent is deciding which subset/profile to install. Use `apx install <agent>` for manual default install.

Per-agent references:

- [`docs/setup/codex.md`](./setup/codex.md)
- [`docs/setup/claude-code.md`](./setup/claude-code.md)
- [`docs/setup/gemini.md`](./setup/gemini.md)

## Single Asset And Plugin Commands

Single asset install remains available and is still dry-run unless an explicit destination is provided:

```powershell
apx install ask-claude --target codex --dry-run
apx install ask-claude --target codex --dest .agent-powerups\installed\ask-claude
```

Plugin bundle commands remain useful for inspection and targeted install:

```powershell
apx plugins list
apx plugins info dev-vitals
apx plugins validate --all
apx plugins install dev-vitals --target codex --dry-run
```

Plugin bundles are registered for Claude and Codex marketplace-style discovery. Gemini uses local extensions under `.gemini/extensions/`; each bundle includes `gemini-extension.json` and `GEMINI.md`.

## Optional Tools

Install optional tools only when a specific skill requires them.

```powershell
claude --version
codex --version
gemini --version
python -m pip install markitdown
python -m pip install graphifyy
npm install -g defuddle
```

After review and approval, install optional tools in a controlled environment such as a virtual environment or pinned global toolchain.

Agents can preview supported installs without running them:

```powershell
apx check markitdown-file-intake --install-missing --dry-run
apx check defuddle --install-missing --dry-run
apx check graphify --install-missing --dry-run
```

Do not auto-install tools in scripts or hooks without explicit user approval. Use `--install-missing --yes` only after approval.

## Validation

After editing repository content, run:

```powershell
npm run build
npm run test
python scripts\validate-skills.py
python scripts\validate-catalog.py
apx plugins validate --all
```

Native install never installs external tools, mutates shell profiles, writes secrets, or enables MCP servers.
