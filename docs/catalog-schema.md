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
  "maturity": "draft",
  "tier": "common"
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
- `experimental`
- `beta`
- `stable`

## Optional `tier`

`tier` is user-facing scope metadata. It helps humans browse a broad catalog without changing routing or install behavior.

- `core`: foundational assets that are useful in most coding-agent sessions, such as task routing, debugging, planning, review, verification, and baseline safety.
- `common`: broadly reusable software-development workflows that are not foundational enough to be core.
- `specialized`: domain-, tool-, platform-, or review-before-use assets, including most MCP configs, hooks, plugin packs, scripts, examples, and domain-specific skills.
- `experimental`: early or explicitly experimental assets. Use only when the task clearly needs them and the risk is acceptable.

Rules:

- Keep `tier` independent from `maturity`: maturity is readiness; tier is audience/scope.
- Do not use `tier` as a routing score. Discovery should still rely on `signals`, `use_when`, and `capabilities`.
- Installed-only assets may be unclassified; catalog entries should carry a tier when known.

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

## Optional Discovery Metadata

Use these fields to help deterministic task-based discovery rank assets without loading every file:

```json
{
  "use_when": ["The user asks to fix a failing test, bug, regression, or unexpected behavior."],
  "avoid_when": ["The task is only a prose rewrite with no diagnostic work."],
  "signals": ["bug", "failing test", "regression", "stack trace"],
  "capabilities": ["debugging", "root-cause-analysis", "verification"],
  "activation": "read-skill-and-apply-workflow",
  "check_policy": "requires-only"
}
```

Rules:

- `use_when`, `avoid_when`, `signals`, and `capabilities` must be arrays of strings.
- `activation` is a short instruction for the next action, not a full prompt.
- `check_policy` is one of `none`, `requires-only`, `mcp-only`, or `manual`.
- Use `requires-only` for assets that should run `apx check` only when external requirements are declared.
- Omit discovery fields rather than adding vague synonyms.

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
