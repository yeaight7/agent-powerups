# Installation

Agent Powerups ships both repo assets and a minimal local CLI. Installation stays local-first and review-first.

## Minimal Use

1. Install Node deps:

```powershell
npm install
```

2. Build CLI:

```powershell
npm run build
```

3. Inspect catalog and repo health:

```powershell
node dist\cli\apx.js doctor
node dist\cli\apx.js list
```

4. Copy or print only what you need. Default `apx install` mode is dry-run.

## Recommended Workflow

- Start with one asset at a time.
- Prefer project-local or user-local installs for optional tools.
- Prefer dry-run first:

```powershell
node dist\cli\apx.js install markitdown-file-intake --target codex --dry-run
node dist\cli\apx.js mcp print github-local --target claude-code
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
python -m pip install markitdown
npm install -g defuddle
```

Do not auto-install tools in scripts or hooks without explicit user approval.
