# Agent Powerups

**Oh My Zsh for coding agents.**

Agent Powerups is an Oh My Zsh-style collection of reusable skills, slash commands, MCP configs, hooks, AGENTS.md templates, and workflows for coding agents.

Today, this repo ships a curated set of reusable skills plus validation and requirement-check scripts. The other top-level folders are reserved for future public assets, not full product surfaces yet.

## What Is Here

| Path | Status | Notes |
|------|--------|-------|
| `skills/` | shipped | Reusable agent workflows such as `systematic-debugging` and `writing-plans` |
| `scripts/` | shipped | Validation and tool-check helpers for this repo |
| `commands/` | planned | Placeholder for future command packs |
| `mcp/` | planned | Placeholder for future MCP config recipes |
| `hooks/` | planned | Placeholder for future hook examples |
| `agents-md/` | planned | Placeholder for future AGENTS.md templates |
| `workflows/` | planned | Placeholder for future scenario guides |
| `examples/` | planned | Placeholder for future platform examples |

## Quickstart

1. Inspect optional tool requirements:

```powershell
python scripts\check-requirements.py
```

2. Read or copy a shipped skill:

```powershell
Get-Content -Raw skills\systematic-debugging\SKILL.md
```

3. Validate repo metadata:

```powershell
python scripts\validate-skills.py
python scripts\validate-catalog.py
```

4. Check the asset catalog:
   [`catalog.json`](./catalog.json) indexes shipped skills and helper scripts, including maturity and any declared tool requirements.

## Catalog Overview

Current shipped skills:

- `systematic-debugging`
- `no-fluff`
- `writing-plans`
- `ai-slop-cleaner`
- `requesting-code-review`
- `receiving-code-review`
- `pr-triage`
- `repo-map`
- `bug-hunt`
- `safe-refactor`
- `defuddle`
- `markitdown-file-intake`

Current shipped scripts:

- `scripts/validate-skills.py`
- `scripts/validate-catalog.py`
- `scripts/check-requirements.py`

Schema details: [`docs/catalog-schema.md`](./docs/catalog-schema.md)

## Compatibility Matrix

Compatibility claims in this repo are intentionally narrow:

| Asset class | Shipped today | Compatibility claim |
|-------------|---------------|---------------------|
| Root `skills/` | yes | Generic text-based skills; some also mention known agent surfaces |
| `scripts/` | yes | Generic Python scripts |
| `commands/` | no | No support claim yet |
| `mcp/` | no | No support claim yet |
| `hooks/` | no | No support claim yet |
| `agents-md/` | no | No support claim yet |
| `workflows/` | no | No support claim yet |
| `examples/` | no | No support claim yet |

More detail: [`docs/compatibility.md`](./docs/compatibility.md)

## Tool Requirements

Most shipped skills are pure text and need no extra installation.

Current optional external tools used by shipped skills:

| Skill | Tool | Required | Install |
|-------|------|----------|---------|
| `markitdown-file-intake` | Microsoft MarkItDown (`markitdown`) | yes for conversion workflow | `python -m pip install markitdown` |
| `defuddle` | Defuddle CLI (`defuddle`) | yes for Defuddle workflow | `npm install -g defuddle` |
| `pr-triage` | GitHub CLI (`gh`) | optional | platform package manager |

Tool policy:

- Do not assume tools are installed.
- Do not auto-install without user approval.
- Show install command before running it.
- Prefer user-local or project-local installation where practical.

More detail: [`docs/tool-requirements.md`](./docs/tool-requirements.md) and [`docs/installation.md`](./docs/installation.md)

## Safety Warning

Review assets before loading them into a trusted agent environment.

- Skills can instruct an agent to read local files or run commands.
- Hooks can execute code when supported by the host agent.
- MCP configs can expand tool access.
- Install commands can modify the local environment.
- Secrets should never be pasted into agent context unless strictly necessary.

See [`SECURITY.md`](./SECURITY.md) and [`docs/security-model.md`](./docs/security-model.md).

## Contributing

Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md)

Acknowledgements: [`ACKNOWLEDGEMENTS.md`](./ACKNOWLEDGEMENTS.md)

Roadmap: [`docs/roadmap.md`](./docs/roadmap.md)
