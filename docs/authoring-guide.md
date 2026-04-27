# Authoring Guide

Keep assets small, explicit, and honest.

## Skill Structure

```text
skills/<skill-name>/
  SKILL.md
  references/    # optional
  examples/      # optional
```

## Required Frontmatter

```yaml
---
name: skill-name
description: Use when ...
---
```

Required keys:

- `name`
- `description`

## Preferred Skill Body

```md
# Skill Name

## Purpose
## When to use
## Requirements
## Inputs expected
## Workflow
## Output format
## Verification checklist
## Failure modes
## Missing dependency behavior
```

Not every skill needs every section. Tool-dependent skills should include:

- `Requirements`
- install guidance inside `Requirements` or `Workflow`
- `Verification`
- `Missing dependency behavior`

## Tool Dependency Rules

If a skill depends on an external tool:

- name the required command or package explicitly
- show how to check for it
- show how to install it
- state that installation requires user approval
- state fallback behavior if installation is declined

## Catalog Entry

Every shipped asset needs a `catalog.json` entry.

Example:

```json
{
  "name": "markitdown-file-intake",
  "type": "skill",
  "summary": "Convert supported files into Markdown context using Microsoft MarkItDown.",
  "path": "skills/markitdown-file-intake",
  "compatible_with": ["generic"],
  "tags": ["file-intake", "markdown", "documents"],
  "maturity": "draft",
  "requires": {
    "commands": ["markitdown"],
    "python_packages": ["markitdown"]
  }
}
```

Schema reference: [`docs/catalog-schema.md`](./catalog-schema.md)

## Validation

Run:

```powershell
python scripts\validate-skills.py
python scripts\validate-catalog.py
python scripts\check-requirements.py
```

## What to Avoid

- vague motivational prose
- fake compatibility claims
- hidden installers
- placeholders such as `TODO` or `TBD`
- machine-specific paths, secrets, or personal data
