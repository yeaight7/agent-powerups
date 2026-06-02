---
name: skill-authoring-guide
description: Create or refactor high-quality skills with lean frontmatter, progressive disclosure, and optional bundled helpers. Use when authoring reusable agent workflows.
---

# Skill Authoring Guide

Use this skill when creating or improving a reusable skill.

## What Good Skills Do

- Trigger reliably from `name` and `description` — the description must be specific enough to avoid false triggers.
- Stay short in `SKILL.md` and move bulk detail into `references/` or `scripts/`.
- Teach a **workflow or decision pattern**, not just dump background information.
- Include scripts or references only when they eliminate repeated work or prevent ambiguity.

## Frontmatter Template

```yaml
---
name: kebab-case-matching-directory-name
description: Use when [trigger condition]. Does [what it does]. [Optional: NOT for X.]
---
```

**Good description** (specific, trigger-clear):

```
Use when designing or reviewing filesystem MCP access, path boundaries, allowed roots, and method allowlists.
```

**Weak description** (too broad, won't trigger reliably):

```
Helps with MCP things and file access.
```

## Workflow

### 1. Define the job
- What specific problem does this skill solve?
- When should it trigger? (Be concrete — "when the user mentions X" or "when you're about to do Y".)
- What should it explicitly NOT handle? State the boundary.

### 2. Write strong frontmatter
- `name` must match the directory name exactly.
- `description` must say what the skill does AND when to use it in one sentence.

### 3. Keep the body lean
- `SKILL.md` should be readable in one focused pass — target 50–120 lines.
- Move bulky reference material into `references/`.
- Move deterministic scripts (validators, init scripts) into `scripts/`.
- If `SKILL.md` exceeds 150 lines, split off the excess into a reference file.

### 4. Design progressive disclosure
- `SKILL.md`: core workflow, when to use, safety constraints.
- `references/`: detailed patterns, full checklists, long examples.
- `scripts/`: automation helpers.

### 5. Validate before publishing
- Check that every file path mentioned in the skill actually exists.
- Remove any `references/` links that point to non-existent files.
- Verify the skill can be read in under 2 minutes.
- Test the trigger: does the description reliably route to this skill for the intended use case?

## Skill Length Guide

| Section | Target |
|---|---|
| Frontmatter description | 1 sentence, 15–30 words |
| `SKILL.md` body | 50–120 lines |
| Individual workflow steps | 1–3 lines each |
| References total | as needed, not in `SKILL.md` |

## Bundled Helpers

- `scripts/init_skill.py` — scaffold a new skill directory
- `scripts/package_skill.py` — package for distribution
- `scripts/quick_validate.py` — check frontmatter and dead references

Use them as optional helpers if they fit your workflow.

## Related Skill

Use `hard-won-skill-extractor` when the challenge is turning a hard-earned session into a reusable skill candidate.
