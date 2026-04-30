# MCP Configs

This repository ships one supported local MCP feature: `github-local`.

`github-local` connects an MCP client to the official Docker image `ghcr.io/github/github-mcp-server`. It is agent-oriented: check prerequisites, smoke-test Docker launch, dry-run the target install, then apply only after explicit approval.

## Commands

```sh
apx mcp check github-local --target codex --json
apx mcp smoke github-local --json
apx mcp install github-local --target codex --dry-run
apx mcp install github-local --target claude-code --dry-run
```

Apply after review:

```sh
apx mcp install github-local --target codex --yes
apx mcp install github-local --target claude-code --yes
```

Generic explicit writes remain available:

```sh
apx mcp write github-local --target generic --dest .agent-powerups/github-local.json
```

## Requirements

- Docker installed and running.
- `GITHUB_TOKEN` or `GITHUB_PAT` set in the environment.
- Token value is passed to the container as `GITHUB_PERSONAL_ACCESS_TOKEN`.

`apx mcp check github-local` exits nonzero when Docker or token prerequisites are missing. `apx mcp smoke github-local` launches Docker checks and redacts token values from output.

## Install Behavior

- Codex target writes a marked `github-local` block to `config.toml` under `--agent-root` or the default Codex root.
- Claude Code target writes or merges `.mcp.json` under `--agent-root`, or `--dest` when supplied.
- Existing files are backed up before modification.
- Re-running install is idempotent when the managed block/config is already current.
- Dry-run is default unless `--yes` is supplied.

## Security

- Do not commit real tokens.
- Prefer narrow GitHub token scopes.
- Review dry-run output before applying.
- Remove the marked block or merged `github-local` server entry to disable the MCP server.
