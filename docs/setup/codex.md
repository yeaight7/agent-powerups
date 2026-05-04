# Codex Setup

Status: conservative local setup. This documents what `apx setup codex` does; it is not an official Codex integration claim.

## Setup Modes

`apx setup codex` supports three modes via `--mode`:

| Mode | Assets installed | Use when |
|------|-----------------|----------|
| `minimal` | 6 bootstrap skills + 2 commands | Bootstrap awareness only |
| `recommended` | Core skills + dev-loop plugins | Main agent setup (recommended) |
| `full` | All skills, commands, plugin bundles, hooks, MCP configs (staged) | Broad agent-assembled environment |

Default (`--yes` alone) is `minimal`. MCP configs are staged in `full` mode but never enabled automatically.

```powershell
# Dry-run (default — no files written)
apx setup codex

# Apply minimal
apx setup codex --yes

# Apply recommended (main agent setup)
apx setup codex --mode recommended --yes

# Apply full
apx setup codex --mode full --yes
```

**For agents:** Prefer `--mode recommended --yes`. Use `apx profiles list` to see available skill sets after setup.

## Expected Agent Root Directory

Default root:

```text
%USERPROFILE%\.codex
```

Override with:

```powershell
apx setup codex --agent-root <path> --dry-run
```

If `CODEX_HOME` is set, `apx setup codex` uses that value instead of the default.

## Directories Created

Under the selected agent root, setup creates:

```text
agent-powerups/
agent-powerups/skills/
agent-powerups/commands/
agent-powerups/mcp/
agent-powerups/agents-md/
agent-powerups/hooks/
agent-powerups/workflows/
agent-powerups/instructions/
```

If the target directory does not exist, `--yes` creates it. `--dry-run` only reports it.

## Files Copied Or Generated

Files copied depend on the selected mode. See [Setup Modes](#setup-modes) above.

In `full` mode (default for `--yes` in previous versions), setup copies:

- `skills/` to `agent-powerups/skills/`
- `commands/generic/` to `agent-powerups/commands/generic/`
- `commands/codex/` to `agent-powerups/commands/codex/` when files exist
- `mcp/generic/` to `agent-powerups/mcp/generic/`
- `mcp/codex/` to `agent-powerups/mcp/codex/`
- `agents-md/` to `agent-powerups/agents-md/`
- `hooks/` to `agent-powerups/hooks/`
- `workflows/` to `agent-powerups/workflows/`
- `docs/setup/` to `agent-powerups/docs/setup/`

Setup also generates:

```text
agent-powerups/instructions/agent-powerups.md
```

Existing copied files are not overwritten. Identical files are skipped. Different existing files are skipped and reported for manual review.

## Global Instruction Changes Needed

Default instruction candidate:

```text
<codex-root>/AGENTS.md
```

If the file exists, `--yes` appends or refreshes one marked block:

```text
<!-- BEGIN agent-powerups -->
...
<!-- END agent-powerups -->
```

If the file does not exist, setup does not guess-create global instructions. It writes the block to `agent-powerups/instructions/agent-powerups.md` and reports the manual step.

Use a specific file with:

```powershell
apx setup codex --instructions-file <path> --yes
```

## Dry-Run Behavior

Default behavior is dry-run:

```powershell
apx setup codex
apx setup codex --dry-run
```

Dry-run reports planned directories, copied files, skipped files, instruction changes, backups, and manual steps. It changes no files.

## Confirmation Behavior

Non-dry-run requires:

```powershell
apx setup codex --yes
```

`--dry-run` and `--yes` cannot be combined.

## Backup Behavior

Before editing an existing instruction file, setup creates:

```text
<instruction-file>.<UTC timestamp>.bak
```

No backup is created when the instruction block is already present and no edit is needed.

## Rollback Instructions

1. Remove the `agent-powerups/` directory under the Codex root.
2. If an instruction file was modified, restore the `.bak` file over the edited file.
3. Remove the marked `agent-powerups github-local` block from Codex `config.toml` if you enabled it.

## Limitations

- GitHub MCP is copied for review; enable it with `apx mcp check`, `apx mcp smoke`, and `apx mcp install github-local --target codex --yes` only after approval.
- Shell profiles are not changed.
- External tools are not installed.
- Compatibility is limited to local files and user-reviewed instructions.

## Security Notes

- Do not write secrets into copied MCP config.
- Set tokens such as `GITHUB_TOKEN` or `GITHUB_PAT` in the local shell/session only.
- Review all copied skills and hooks before trusting them in privileged workspaces.
