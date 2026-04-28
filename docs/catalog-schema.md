# Catalog Schema

`catalog.json` is the source of truth for shipped assets.

## Required Fields

Each entry must include:

```json
{
  "name": "asset-name",
  "type": "skill",
  "summary": "One sentence summary.",
  "path": "skills/asset-name",
  "compatible_with": ["generic"],
  "tags": ["tag"],
  "maturity": "draft"
}
```

## Allowed `type`

- `skill`
- `command`
- `mcp-config`
- `agents-md-template`
- `hook`
- `workflow`
- `example`
- `script`
- `pack`

## Allowed `maturity`

- `draft`
- `beta`
- `stable`

## `compatible_with`

Use only concrete compatibility claims:

- `claude-code`
- `codex`
- `gemini-cli`
- `cursor`
- `generic`

`generic` means the asset is plain text or standard CLI usage with no platform-specific integration requirement.

## Optional `requires`

Use `requires` only when an asset depends on external tools:

```json
{
  "requires": {
    "commands": ["markitdown"],
    "python_packages": ["markitdown"],
    "npm_packages": []
  }
}
```

Rules:

- Omit `requires` when no external tool is needed.
- Keep requirement names literal and machine-checkable.
- Document matching check/install/fallback behavior in the asset itself when the dependency is workflow-critical.

## Optional `targets`

Use `targets` when one logical asset has target-specific files, such as MCP snippets or command prompts:

```json
{
  "targets": {
    "codex": "mcp/codex/github-local.toml",
    "claude-code": "mcp/claude-code/github-local.json",
    "generic": "mcp/generic/github-local.json"
  }
}
```

Rules:

- Keys limited to `codex`, `claude-code`, and `generic`.
- Values must point to existing files in repo.
- `targets` does not imply automatic install or config mutation.

## Optional `run`

Use `run` when a command asset has an executable CLI implementation:

```json
{
  "run": {
    "kind": "ship-check"
  }
}
```

Rules:

- `run.kind` must match a runner implemented by `apx commands run`.
- Runnable commands must be safe by default and must not commit, push, install tools, or mutate global config.

## Optional `mcp`

Use `mcp` to document machine-checkable MCP requirements:

```json
{
    "mcp": {
      "required_env": ["GITHUB_TOKEN"],
      "server_package": "@modelcontextprotocol/server-github",
      "warning": "Verify upstream package status before public use.",
      "output_hints": {
        "generic": ".mcp.json"
      }
  }
}
```
