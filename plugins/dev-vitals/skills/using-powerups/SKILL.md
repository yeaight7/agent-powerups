---
name: using-powerups
description: Use when starting work in a repository with Agent Powerups installed, when a task may match a reusable local skill, command, workflow, hook recipe, AGENTS.md template, or MCP feature.
---

# Using Powerups

## Purpose

Find and apply installed Agent Powerups before improvising. A powerup is useful only after you discover likely matches, inspect the actual asset, follow its instructions, and verify the user task with task-specific evidence.

## When to Use

Use at the start of non-trivial work, and again when the task changes shape.

Use when the user asks for debugging, planning, review, setup, file intake, cleanup, PR triage, second opinions, MCP config, hooks, commands, or AGENTS.md templates.

Do not force a powerup when none fits. Say no matching powerup applies and proceed normally.

## Inputs

- User task.
- Current repo or agent root.
- Installed `agent-powerups` location, usually `agent-powerups/` under the agent root or the package repo.
- Optional CLI access to `apx` for discovery and inventory.
- Optional installed discovery index file; treat it as a derived snapshot, not the source of truth.

## Workflow

1. Discover or match available assets.

Use target-specific routing:

- Claude Code: start with native skill discovery when skills are already exposed by the host. Use `apx discover` when the task is uncertain, when no native skill clearly fits, or when the task may need non-skill assets.
- Codex, Gemini, and generic agents: start with `apx discover`.
- All targets: use `apx inventory` for MCP configs, hooks, AGENTS.md templates, plugin-contained assets, staged assets, and installed-only assets.

```sh
apx discover "<user task>" --target <codex|claude-code|gemini|generic>
apx inventory --target <codex|claude-code|gemini|generic> --json
apx list --json --verbose
apx plugins list
```

If `apx` is unavailable, inspect local folders: `skills/`, `commands/`, `mcp/`, `agents-md/`, `hooks/`, `workflows/`.

2. Match the task to assets.

Prefer the narrowest high-ranked asset whose description matches the current task. Treat `apx discover` output as a shortlist, not as proof that a powerup has been used.

Examples:

| Task signal | Asset type to inspect |
| --- | --- |
| bug, failing test, regression | debugging skill |
| implementation spec | planning skill |
| file or URL intake | file-intake skill |
| pre-handoff validation | command |
| local MCP setup | MCP config |
| repo instruction baseline | AGENTS.md template |

3. Read before using.

For a candidate asset:

```sh
apx info <name>
```

Then read the asset file. Do not rely only on the catalog summary.

Most powerups do not require step 4. Only use `apx check` when the asset declares external requirements or its own instructions say a dependency check is needed. Do not run `apx check` for every asset by default.

4. Check requirements.

If `apx check` reports a missing command or package, stop and say exactly what is missing. Use `apx check <asset> --install-missing --dry-run` to preview supported installers. Ask before running `--install-missing --yes`. Do not pretend conversion, fetch, review, or CLI delegation happened when the tool was unavailable.

5. Apply conservatively.

Follow the asset instructions. Keep scope local to the user task. For GitHub MCP, use `apx mcp check github-local`, `apx mcp smoke github-local`, then `apx mcp install github-local --target <agent> --dry-run` before any `--yes` install. For hooks, treat recipes as review-before-use; do not enable them automatically.

6. Report use.

Final response should name:

- powerup used
- requirement check result, or `not needed`
- important fallback or skipped asset
- task-specific validation performed

## Output

When a powerup applies:

```text
Used: <asset-name>
Why: <task signal>
Requirements: <OK / missing / not needed>
Result: <how it changed the work>
Validation: <real task-specific checks, not apx check>
```

When none applies:

```text
No matching Agent Powerup found. Proceeded with normal repo inspection.
```

## Verification

Before claiming setup or use succeeded:

- Asset was read, not guessed from name.
- Requirements were checked only when the selected asset declared external dependencies.
- Missing tools were reported, not bypassed silently.
- `apx check` output was not presented as proof that the skill was used or the task succeeded.
- No secrets were written.
- No global config, shell profile, hook, MCP server, or dependency install was changed without explicit user approval.

## Failure Modes

- **Catalog missing**: inspect local asset folders directly, then report that `apx` catalog discovery failed.
- **Missing dependency**: stop that asset path; ask before install; use a lower-capability fallback if safe.
- **No matching asset**: say so and continue normally.
- **Unsafe asset request**: print manual review steps instead of mutating config.
- **Multiple possible assets**: choose the narrowest one; mention skipped alternatives only when relevant.
