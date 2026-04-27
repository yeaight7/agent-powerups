# Contributing to Agent Powerups

Keep contributions small, explicit, and portable.

## Rules

- Do not add fake compatibility claims.
- Do not add hidden installers.
- Do not add secrets, machine-specific paths, or personal data.
- Prefer one strong asset over several thin ones.

## Skill Requirements

Each skill folder under `skills/` must include `SKILL.md` with YAML frontmatter:

```yaml
---
name: skill-name
description: Use when ...
---
```

Tool-dependent skills must also document:

- required command or package
- how to check if it exists
- how to install it
- that install requires user approval
- fallback behavior if install is declined

## Catalog Requirements

Every shipped asset needs a `catalog.json` entry.

Allowed `type` values:

- `skill`
- `command`
- `mcp-config`
- `agents-md-template`
- `hook`
- `workflow`
- `example`
- `script`
- `pack`

Allowed `maturity` values:

- `draft`
- `beta`
- `stable`

## Validation

Run before opening a pull request:

```powershell
python scripts\validate-skills.py
python scripts\validate-catalog.py
python scripts\check-requirements.py
```

## Pull Request Checklist

- [ ] Skill files are non-empty and have `name` + `description`
- [ ] Tool-dependent skills document install/check/fallback behavior
- [ ] `catalog.json` was updated if shipped assets changed
- [ ] Validation scripts pass
- [ ] Compatibility claims are narrow and defensible
