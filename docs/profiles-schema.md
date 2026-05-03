# profiles.json Schema

`profiles.json` at the repository root defines user-intent install profiles. Profiles are curated sets of skills, commands, hooks, and plugin bundles for a specific workflow context. They complement plugin bundles (implementation groupings) by expressing user goals.

## Top-Level Structure

```json
{
  "version": "0.1.0",
  "profiles": [ <Profile> ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | yes | Schema version. Current: `"0.1.0"` |
| `profiles` | array | yes | List of profile objects |

## Profile Object

```json
{
  "name": "safe-core",
  "description": "...",
  "maturity": "stable",
  "skills": ["using-powerups", "no-fluff"],
  "commands": ["ship-check"],
  "hooks": [{ "name": "no-secrets-preflight", "mode": "review-only" }],
  "plugin_bundles": [],
  "mcp": []
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Unique identifier. Lowercase, hyphen-separated. |
| `description` | string | yes | One sentence describing the workflow context. |
| `maturity` | `"draft"` \| `"beta"` \| `"stable"` | yes | Readiness level. |
| `skills` | string[] | yes | Root skill names from `catalog.json`. |
| `commands` | string[] | yes | Command asset names from `catalog.json`. |
| `hooks` | HookRef[] | yes | Hooks included as review-only references. |
| `plugin_bundles` | string[] | yes | Plugin bundle names from `plugin-bundles.json`. |
| `mcp` | string[] | yes | MCP config names. Not installed by default. |

## HookRef Object

```json
{ "name": "no-secrets-preflight", "mode": "review-only" }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Hook asset name from `catalog.json`. |
| `mode` | `"review-only"` | yes | Hooks are never auto-installed. Always `"review-only"`. |

## Safety Constraints

- `apx profiles plan` is always read-only. No files are written.
- `apx profiles install` is dry-run by default. Requires `--yes --dest <path>` to write.
- Hooks are never installed automatically. They are shown as review-only references.
- MCP configs in `mcp` are not installed by default. They are shown in plan output as skipped.
- No global config files (CLAUDE.md, AGENTS.md, settings.json) are mutated.
- Install writes only to the explicit `--dest` path.

## CLI Reference

```
apx profiles list [--json]
apx profiles info <profile-name> [--json]
apx profiles plan <profile-name> --target <codex|claude-code|generic> [--json]
apx profiles install <profile-name> --target <codex|claude-code|generic> [--dry-run|--yes] [--dest <path>] [--force] [--json]
```

## Profiles vs Plugin Bundles

| Concept | Purpose | Defined in |
|---------|---------|-----------|
| Plugin bundle | Implementation grouping: skills + agents + commands for a domain | `plugin-bundles.json` |
| Profile | User-intent grouping: curated set for a workflow role or context | `profiles.json` |

A profile can reference plugin bundles. A plugin bundle does not reference profiles.
