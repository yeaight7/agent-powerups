# Tool Requirements

Most assets in this repo are plain text and require no extra tooling. A small number of skills depend on external commands.

## Rules

- Do not assume a tool is installed.
- Check first when the selected asset declares external tooling or the workflow fails because a tool is missing.
- Show the install command before running it.
- Ask for approval before installing anything.
- Use `apx check <asset>` only for assets with declared requirements.
- Use `apx check <asset> --install-missing --dry-run` to preview supported installers for those assets.
- Use `apx check <asset> --install-missing --yes` only after approval.
- Do not treat a successful `apx check` as proof that a skill, command, or workflow was actually used.
- If installation is declined, say so and use the documented fallback.
- Do not claim a conversion or fetch happened if the tool was missing.

## Current Tool-Dependent Skills

### `ask-claude`

Required tool:
- Claude Code CLI (`claude`)

Check:

```powershell
Get-Command claude -ErrorAction SilentlyContinue
claude --version
```

Fallback:
- Tell the user Claude CLI is missing or unauthenticated.
- Do not route through MCP.

### `ask-gemini`

Required tool:
- Gemini CLI (`gemini`)

Check:

```powershell
Get-Command gemini -ErrorAction SilentlyContinue
gemini --version
```

Fallback:
- Tell the user Gemini CLI is missing or unauthenticated.
- Do not route through MCP.

### `markitdown-file-intake`

Required tool:
- Microsoft MarkItDown

Check:

```powershell
Get-Command markitdown -ErrorAction SilentlyContinue
python -m markitdown --help
```

Install:

```powershell
python -m pip install markitdown
apx check markitdown-file-intake --install-missing --dry-run
```

Fallback:
- Tell the user MarkItDown is missing.
- Ask before installing.
- Fall back to manual inspection when practical.

### `defuddle`

Required tool:
- Defuddle CLI

Check:

```powershell
Get-Command defuddle -ErrorAction SilentlyContinue
defuddle --version
```

Install:

```powershell
npm install -g defuddle
apx check defuddle --install-missing --dry-run
```

Fallback:
- Tell the user Defuddle is missing.
- Ask before installing.
- Fall back to another web-reading method.

### `graphify`

Required tools:
- Upstream Graphify CLI (`graphify`)
- Official Python package (`graphifyy`)

Check:

```powershell
Get-Command graphify -ErrorAction SilentlyContinue
python -c "import graphify" 2>$null
```

Install:

```powershell
uv tool install graphifyy
pipx install graphifyy
python -m pip install graphifyy
apx check graphify --install-missing --dry-run
```

Fallback:
- Tell the user Graphify is missing or not importable from `python`.
- Ask before installing.
- Do not claim graph extraction happened.
- Fall back to normal repo inspection when practical.

### `pr-triage`

Optional tool:
- GitHub CLI (`gh`)

Check:

```powershell
Get-Command gh -ErrorAction SilentlyContinue
gh auth status
```

Fallback:
- Use local git state or connector data.
- Mark PR metadata as partial or stale when `gh` is unavailable.
