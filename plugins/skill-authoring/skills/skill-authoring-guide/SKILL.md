---
name: skill-authoring-guide
description: Create or refactor high-quality skills with lean frontmatter, progressive disclosure, and optional bundled helpers. Use when authoring reusable agent workflows.
---

# Skill Authoring Guide

Use this skill when creating or improving a reusable skill.

## What Good Skills Do

- Trigger reliably from `name` and `description`
- Stay short in `SKILL.md` and move detail into support files when needed
- Teach a workflow or decision pattern, not just dump background info
- Include scripts or references only when they reduce ambiguity or repeated work

## Workflow

1. **Define the job**
   - What problem does the skill solve?
   - When should it trigger?
   - What should it explicitly not try to do?

2. **Write strong frontmatter**
   - `name` must match the directory name
   - `description` must say what the skill does and when to use it

3. **Keep the body lean**
   - Put the core workflow in `SKILL.md`
   - Move bulky references into `references/` or `reference/`
   - Move deterministic helpers into `scripts/`

4. **Design progressive disclosure**
   - Metadata should route correctly
   - `SKILL.md` should be readable in one pass
   - Support files should only load when needed

5. **Validate**
   - Remove dead references
   - Check that file names mentioned in the skill actually exist
   - Keep examples concrete but short

## Bundled Helpers

- `scripts/init_skill.py`
- `scripts/package_skill.py`
- `scripts/quick_validate.py`

Use them as optional helpers if they fit the repo workflow.

## Related Skill

Use `hard-won-skill-extractor` when the challenge is turning one hard-earned session into a reusable skill candidate.
