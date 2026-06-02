# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # tsc + postbuild shebang wrapper → dist/
npm test        # build then run node test/*.test.ts
```

Run a single test file:

```bash
node --test test/cli.test.ts
```

No linter is configured. TypeScript strict mode is the primary safety net.

After build, install globally once with `npm link`. Then the CLI is available as:

```bash
apx <command>
```

## Architecture

This repo is an "Oh My Zsh"-style collection of reusable agent powerups (skills, commands, MCP configs, hooks, workflows, templates) for Claude Code, Codex, and Gemini. The APX CLI is the tool users and agents use to browse, validate, check, and install those assets.

### catalog.json — single source of truth

Every shipped asset is registered in `catalog.json`. The Zod schema in `src/cli/utils/catalog.ts` enforces structure: required fields (`name`, `type`, `summary`, `path`, `compatible_with`, `maturity`), optional fields (`requires`, `targets`, `mcp`, `run`). Duplicate names are rejected. All referenced paths must exist on disk. When adding a new skill or command, add its catalog entry and verify with `apx validate catalog`.

Allowed `compatible_with` values: `claude-code`, `codex`, `gemini-cli`, `cursor`, `generic`.
Allowed `maturity` values: `draft`, `beta`, `stable`.

The `targets` field holds agent-specific path variants (e.g., `.toml` for Codex, `.json` for Claude Code). The `requires` field declares external dependencies that `apx check` verifies.

### CLI command routing (src/cli/apx.ts)

`runCli(argv, io)` is the entry point. It finds catalog.json by walking up from cwd, constructs a `CatalogService`, then dispatches on `argv[0]` to command modules under `src/cli/commands/`. Each command exports a `run*Command` function and returns `ExecutionResult<T>`. The `--json` flag switches output to structured JSON for agent consumption.

### Asset directories

- `skills/` — each subdirectory has a `SKILL.md` with YAML frontmatter (`name`, `description`) and workflow prose
- `commands/` — agent-specific subdirs (`codex/`, `claude-code/`, `generic/`); each `.md` is a slash-command definition
- `hooks/` — recipe `.md` files under `safety/`, `quality/`, `productivity/`; review-before-use, not auto-applied
- `mcp/` — MCP server configs in agent-native format (`.json` for Claude Code, `.toml` for Codex)
- `agents-md/` — project-type starter templates (typescript-app, python-library, etc.) for AGENTS.md
- `workflows/` — multi-step scenario guides (agent-relay, feature-iteration)

### Setup and install

`apx setup <codex|claude-code|gemini>` copies templates and appends marked blocks to the agent's config file (AGENTS.md / CLAUDE.md / GEMINI.md). It uses `START_MARKER`/`END_MARKER` guards to prevent duplicate insertions and backs up files before modifying. Supports `--dry-run`.

`apx install <asset-name> --target <agent>` copies the asset to `.agent-powerups/installed/<name>` (or `--dest`). Agent-specific variants are resolved via the `targets` field in catalog.json.

### Relay system (src/cli/commands/relay.ts)

Persistent secondary-agent daemon over TCP (127.0.0.1:randomPort). Three providers:

- `gemini` — spawns `gemini --acp` once; uses ACP JSON-RPC; session context persists across turns
- `claude` — spawns `claude -p <prompt>` per `relay ask`; no cross-turn memory
- `codex` — spawns `codex --full-auto <prompt>` per `relay ask`; no cross-turn memory

`buildRelayBackend()` returns a `RelayBackend` interface (`prompt()` / `close()`). `GeminiAcpClient` is wrapped to satisfy it; `SubprocessClient` implements it for Claude/Codex. State is stored in `.apx/relay/<session>/relay.json`. Artifacts written per turn to the same directory.

### Validation scripts (Python)

`scripts/validate-catalog.py`, `validate-skills.py`, and `check-requirements.py` are standalone Python scripts for CI-style checks. They do not depend on the TypeScript build.

### Test pattern

Tests in `test/` use Node's built-in `node:test` + `node:assert/strict`. All tests call `runCli(argv, { cwd, stdout, stderr })` and assert on the returned exit code and captured output. Tests run against the built `dist/`; rebuild before running tests after source changes.
