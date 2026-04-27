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
