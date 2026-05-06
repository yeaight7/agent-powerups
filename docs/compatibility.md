# Compatibility

Agent Powerups currently ships generic skills, Python helper scripts, one verified local GitHub MCP flow, starter AGENTS.md templates, review-first command prompts, hook recipes, workflow guides, setup examples, and seven local-first plugin bundles. It still does not ship executable hook installers or broad platform integrations.

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

Platform-specific labels (`claude-code`, `codex`) are additive signals. A skill that lists both `claude-code` and `generic` is signaling that it was considered for that surface, not that it is exclusive to it or has been formally tested on it. `generic` remains the baseline compatibility claim.

## Current Repo State

| Surface | Concrete shipped assets | Claim level |
|---------|-------------------------|-------------|
| Claude Code | native `apx install claude`, root skills, plugin bundles, marketplace metadata, `github-local` MCP check/smoke/install flow, `ship-check` command variant, setup example | limited |
| Codex | native `apx install codex`, root skills, plugin bundles, Codex marketplace metadata, repo scripts, local advisor flows, `github-local` MCP check/smoke/install flow, setup example | limited |
| Gemini CLI | native `apx install gemini`, root skills, plugin bundles as `.gemini/extensions/`, generic setup example; `ask-gemini` invokes Gemini CLI from another local agent | limited |
| Cursor | generic root skills only | limited |
| Generic | root skills, Python scripts, AGENTS.md templates, generic MCP explicit writes, command prompts, hook recipes, workflows, setup examples | primary |

## Tool Dependencies

Tool-dependent assets can still be `generic` if they use standard commands and document the dependency clearly.

Examples:

- `markitdown-file-intake` depends on Microsoft MarkItDown
- `defuddle` depends on Defuddle CLI
- `pr-triage` can optionally use `gh`

## Limited Areas

- Plugin bundles ship under `plugins/<name>` and are intended for local install flows driven by `apx plugins`.
- MCP support is intentionally limited to the Docker-backed official GitHub MCP server.
- `hooks/` content is review-before-use documentation, not active hook installation.
