---
name: environment-doctor
description: Use when apx commands fail or assets are missing from listings, MCP servers fail to start, builds hit command-not-found or module-not-found errors, generated assets look stale, or setup works on one machine but not another.
---

# Environment Doctor

Systematically diagnose why the agent environment, project tooling, or Agent Powerups installation is not working as expected.

## When to Use

- `apx` commands fail with unexpected errors or "not found"
- MCP servers fail to start or respond
- Skills or commands are missing from `apx list`
- Build or test commands fail with "command not found" or "module not found"
- Generated assets appear stale (catalog, README, types)
- Setup works on one machine but not another
- After a fresh clone or environment reset

## Inputs

- Platform: Claude Code, Codex, Gemini CLI, or generic shell
- Agent root path (if `APX_REPO_ROOT` is set, note its value)
- The exact error or symptom observed
- Output of any failing command

## Workflow

### 1. Check required commands

Run each and note missing or wrong-version ones:

```bash
node --version        # 18+ for most Agent Powerups tooling
npx --version
python --version      # 3.9+ for validate scripts
git --version
apx --version         # Agent Powerups CLI
docker --version      # only if using Docker-based MCP configs
```

### 2. Verify Agent Powerups installation

```bash
apx list
apx validate skills
apx validate catalog
```

If `apx` is not found:
- Check global npm packages: `npm list -g agent-powerups`
- Check PATH: `echo $PATH` (bash/zsh) or `$env:PATH` (PowerShell)
- Reinstall or re-add to PATH per `docs/installation.md`

### 3. Check MCP configs

For each MCP config that should be active:

```bash
apx mcp check <name>   # prerequisites: required commands, env vars
apx mcp smoke <name>   # launch test: does the server actually start?
```

Common failures:

| Symptom | Likely cause | Fix |
|---|---|---|
| `docker: command not found` | Docker not installed | Install Docker |
| `docker: not running` | Docker daemon stopped | Start Docker Desktop |
| `GITHUB_TOKEN not set` | Missing env var | Set in shell profile |
| Server starts then crashes | Package not cached | Run `npx -y <package>` once |
| `${REPO_ROOT}` literal in args | Placeholder not replaced | Substitute actual path in config |

### 4. Validate catalog and skills

```bash
python scripts/validate-catalog.py
python scripts/validate-skills.py
```

Each error line names the asset and the exact failing field. Fix in order.

### 5. Check for stale generated assets

```bash
git status --short
git diff --stat
```

Stale generated files will show as modified. Re-run the generator script to bring them current.

### 6. Check environment variables

List what is expected versus what is set — show presence, not values:

```bash
# bash/zsh
printenv | grep -E "GITHUB|CONTEXT7|OPENAI|ANTHROPIC" | sed 's/=.*/=SET/'

# PowerShell
Get-ChildItem Env: | Where-Object { $_.Name -match "GITHUB|CONTEXT7" } | Select-Object Name
```

### 7. Check paths

```bash
ls <agent-root>/skills/
ls <agent-root>/commands/
ls <agent-root>/mcp/
```

If paths are empty or missing: verify `APX_REPO_ROOT` or the install path passed to `apx`.

## Output

```
ENVIRONMENT DOCTOR REPORT

Platform: <claude-code / codex / gemini-cli / generic>
Agent root: <path or "not set">

REQUIRED COMMANDS:
  node: 20.x ✓ / MISSING ✗
  npx: ✓ / MISSING
  python: 3.11 ✓ / MISSING
  git: ✓ / MISSING
  apx: 0.x ✓ / MISSING

MCP CONFIGS:
  <name>: check OK / FAIL — <reason>
  <name>: smoke OK / FAIL — <reason>

ASSET VALIDATION:
  catalog: PASS / FAIL — [N errors]
  skills:  PASS / FAIL — [N errors]

STALE GENERATED ASSETS: none / [list]

MISSING ENV VARS: none / [list of names only, no values]

BLOCKERS (must fix before proceeding):
  - [item]

NON-BLOCKING:
  - [item]
```

## Verification

- All required commands found at expected versions
- `apx validate catalog` and `apx validate skills` exit 0
- All active MCP configs pass check and smoke
- No required env vars missing

## Failure Modes

- `apx` not in PATH after install — reload shell profile (`source ~/.zshrc`) or restart terminal
- Docker daemon not running for Docker-based MCP — start Docker Desktop before smoke
- `${REPO_ROOT}` literal in filesystem MCP args — substitute the actual absolute path
- `APX_REPO_ROOT` pointing to a stale path after a repo move — update the env var

## Sources / Inspiration

Inspired by `Yeachan-Heo/oh-my-codex` `skills/doctor/SKILL.md`. Rewritten in Agent Powerups style with multi-platform coverage for Claude Code, Codex, Gemini CLI, and generic shell environments.
