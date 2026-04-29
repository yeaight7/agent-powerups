# Gemini Setup

Status: conservative local setup. This documents what `apx setup gemini` does; it is not an official Gemini CLI integration claim.

## Expected Agent Root Directory

Default root:

```text
%USERPROFILE%\.gemini
```

Override with:

```powershell
apx setup gemini --agent-root <path> --dry-run
```

If `GEMINI_HOME` is set, setup uses that value instead of the default.

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

Setup copies:

- `skills/` to `agent-powerups/skills/`
- `commands/generic/` to `agent-powerups/commands/generic/`
- `mcp/generic/` to `agent-powerups/mcp/generic/`
- `agents-md/` to `agent-powerups/agents-md/`
- `hooks/` to `agent-powerups/hooks/`
- `workflows/` to `agent-powerups/workflows/`
- `docs/setup/` to `agent-powerups/docs/setup/`

No Gemini-specific MCP snippet is shipped yet. Setup therefore copies only the generic MCP review snippets.

Setup also generates:

```text
agent-powerups/instructions/agent-powerups.md
```

Existing copied files are not overwritten. Identical files are skipped. Different existing files are skipped and reported for manual review.

## Global Instruction Changes Needed

Default instruction candidate:

```text
<gemini-root>/GEMINI.md
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
apx setup gemini --instructions-file <path> --yes
```

## Dry-Run Behavior

Default behavior is dry-run:

```powershell
apx setup gemini
apx setup gemini --dry-run
```

Dry-run reports planned directories, copied files, skipped files, instruction changes, backups, and manual steps. It changes no files.

## Confirmation Behavior

Non-dry-run requires:

```powershell
apx setup gemini --yes
```

`--dry-run` and `--yes` cannot be combined.

## Backup Behavior

Before editing an existing instruction file, setup creates:

```text
<instruction-file>.<UTC timestamp>.bak
```

No backup is created when the instruction block is already present and no edit is needed.

## Rollback Instructions

1. Remove the `agent-powerups/` directory under the Gemini root.
2. If an instruction file was modified, restore the `.bak` file over the edited file.
3. Remove any manually enabled MCP config that was copied from `agent-powerups/mcp/`.

## Limitations

- No Gemini-specific command or MCP layout is claimed.
- MCP snippets are copied for review only; setup does not enable MCP servers.
- Shell profiles are not changed.
- External tools are not installed.
- Compatibility is limited to local files and user-reviewed instructions.

## Security Notes

- Do not write secrets into copied MCP snippets.
- Set tokens such as `GITHUB_TOKEN` in the local shell/session only.
- Review all copied skills and hooks before trusting them in privileged workspaces.
