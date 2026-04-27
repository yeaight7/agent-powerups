# Installation

Agent Powerups is a file collection, not a CLI. Installation currently means copying or referencing the assets you want.

## Minimal Use

1. Read the skill or script you want to use.
2. Check optional tool requirements:

```powershell
python scripts\check-requirements.py
```

3. Copy the skill folder into your agent's skill location, or load the `SKILL.md` text into your agent context.

## Recommended Workflow

- Start with one skill at a time.
- Prefer project-local or user-local installs for optional tools.
- Run validators after editing repo content:

```powershell
python scripts\validate-skills.py
python scripts\validate-catalog.py
```

## Optional Tools

Install optional tools only when a specific skill requires them.

Examples:

```powershell
python -m pip install markitdown
npm install -g defuddle
```

Do not auto-install tools in scripts or hooks without explicit user approval.
