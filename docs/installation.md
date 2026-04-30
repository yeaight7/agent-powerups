# Installation

Agent Powerups ships both repo assets and a minimal local CLI. Installation stays local-first and review-first.

## Minimal Use

1. Install Node deps:

```powershell
npm install
```

2. Build CLI and install globally:

```powershell
npm run build
npm link
```

3. Inspect catalog and repo health:

```powershell
apx doctor
apx list
```

4. Try local advisor skills when their CLIs are configured:

```powershell
apx ask-claude "Return OK only" --json
apx ask-gemini "Return OK only" --json
```

5. Copy or print only what you need. Default `apx install` mode is dry-run.

## Agent Setup

Setup is explicit, review-first, and dry-run by default.

```powershell
apx setup codex --dry-run
apx setup claude-code --dry-run
apx setup gemini --dry-run
```

Apply only with confirmation:

```powershell
apx setup codex --yes
apx setup claude-code --yes
apx setup gemini --yes
```

Use `--agent-root <path>` to avoid writing to a default agent root during first review.
Use `--instructions-file <path>` when you want setup to append the marked `agent-powerups` block to a specific instruction file.

Per-agent details:

- [`docs/setup/codex.md`](./setup/codex.md)
- [`docs/setup/claude-code.md`](./setup/claude-code.md)
- [`docs/setup/gemini.md`](./setup/gemini.md)

## Recommended Workflow

- Start with one asset at a time.
- Prefer project-local or user-local installs for optional tools.
- Prefer dry-run first:

```powershell
apx install markitdown-file-intake --target codex --dry-run
apx install ask-claude --target codex --dry-run
apx install ask-gemini --target codex --dry-run
apx mcp print github-local --target claude-code
apx mcp check github-local --target claude-code --json
apx mcp smoke github-local --json
apx mcp install github-local --target codex --dry-run
apx mcp install github-local --target claude-code --dry-run
apx mcp write github-local --target generic --dest .agent-powerups\github-local.json
apx commands print ship-check --target generic
apx commands run ship-check
apx hooks print no-secrets-preflight
apx hooks run no-secrets-preflight --all
apx workflows print feature-iteration
apx ask-claude "Review this change" --artifact-dir .apx\artifacts --json
apx ask-gemini "List edge cases" --artifact-dir .apx\artifacts --json
apx plugin validate plugins\agent-powerups
```

- Run validators after editing repo content:

```powershell
python scripts\validate-skills.py
python scripts\validate-catalog.py
```

## Optional Tools

Install optional tools only when a specific skill requires them.

Examples:

```powershell
claude --version
gemini --version
python -m pip install markitdown
npm install -g defuddle
```

Agents can preview supported installs without running them:

```powershell
apx check markitdown-file-intake --install-missing --dry-run
apx check defuddle --install-missing --dry-run
```

Do not auto-install tools in scripts or hooks without explicit user approval. Use `--install-missing --yes` only after approval.

## Explicit Writes

Write-capable commands require an explicit destination or `--write` flag:

```powershell
apx mcp write github-local --target generic --dest .agent-powerups\github-local.json
apx mcp install github-local --target codex --yes
apx install ask-claude --target codex --dest .agent-powerups\installed\ask-claude
apx plugin build --dest plugins\agent-powerups --write
```

Existing MCP destination files are backed up by target installers or not overwritten by explicit generic writes unless `--force` is provided.
