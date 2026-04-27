# Compatibility

Agent Powerups currently ships generic skills and Python helper scripts. It does not yet ship public command packs, MCP recipes, hooks, AGENTS.md templates, workflows, or examples beyond placeholders.

## Compatibility Rules

Claim compatibility only when one of these is true:

1. The asset was tested on that surface.
2. The asset is plain text or standard CLI usage and needs no platform-specific integration.

If neither is true, do not claim compatibility.

## Supported Labels

- `claude-code`
- `codex`
- `gemini-cli`
- `cursor`
- `generic`

## Current Interpretation

### `generic`

Use for plain text instructions or Python scripts that rely only on standard shell access.

### Agent-specific labels

Use only when the asset mentions or depends on a specific surface and the repo intends to support that use directly.

## Current Repo State

| Surface | Concrete shipped assets | Claim level |
|---------|-------------------------|-------------|
| Claude Code | generic root skills | limited |
| Codex | generic root skills, repo scripts | limited |
| Gemini CLI | generic root skills only | limited |
| Cursor | generic root skills only | limited |
| Generic | root skills and Python scripts | primary |

## Tool Dependencies

Tool-dependent assets can still be `generic` if they use standard commands and document the dependency clearly.

Examples:

- `markitdown-file-intake` depends on Microsoft MarkItDown
- `defuddle` depends on Defuddle CLI
- `pr-triage` can optionally use `gh`
