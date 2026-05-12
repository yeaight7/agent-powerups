---
name: hard-won-skill-extractor
description: Extract a learned skill from the current conversation manually
---

# Hard-Won Skill Extractor

This skill serves to document how to manually extract a useful learned skill into a reusable markdown file.

## Core Principle

Reusable skills are not code snippets to copy-paste, but **principles and decision-making heuristics** that teach an agent HOW TO THINK about a class of problems.

**The difference:**
- BAD (mimicking): "When you see ConnectionResetError, add this try/except block"
- GOOD (reusable skill): "In async network code, any I/O operation can fail independently due to client/server lifecycle mismatches. The principle: wrap each I/O operation separately, because failure between operations is the common case, not the exception."

## Quality Gate

Before extracting a skill manually, ALL three must be true:
- "Could someone Google this in 5 minutes?" → NO
- "Is this specific to THIS codebase?" → YES
- "Did this take real debugging effort to discover?" → YES

## Recognition Signals

Extract ONLY after:
- Solving a tricky bug that required deep investigation
- Discovering a non-obvious workaround specific to this codebase
- Finding a hidden gotcha that wastes time when forgotten
- Uncovering undocumented behavior that affects this project

## What Makes a USEFUL Skill

1. **Non-Googleable**: Something you couldn't easily find via search
2. **Context-Specific**: References actual files, error messages, or patterns from THIS codebase
3. **Actionable with Precision**: Tells you exactly WHAT to do and WHERE
4. **Hard-Won**: Took significant debugging effort to discover

## Anti-Patterns (DO NOT EXTRACT)

- Generic programming patterns (use documentation instead)
- Refactoring techniques (these are universal)
- Library usage examples (use library docs)
- Type definitions or boilerplate
- Anything a junior dev could Google in 5 minutes

## Manual Extraction Workflow

### Step 1: Gather Required Information

- **Problem Statement**: The SPECIFIC error, symptom, or confusion that occurred
- **Solution**: The EXACT fix, not general advice
- **Triggers**: Keywords that would appear when hitting this problem again
- **Scope**: Almost always Project-level unless it's a truly universal insight

### Step 2: Quality Validation

Reject skills that are:
- Too generic
- Easily Googleable
- Vague solutions
- Poor triggers

### Step 3: Save Location

- **Project-level**: `.skills/<skill-name>.md` - Default. Intended to be committed with the repo.

### Step 4: Promote if reusable

If the extracted idea should become a maintained, shareable skill instead of a project-local note, switch to `skill-authoring-guide` and turn it into a proper skill folder with frontmatter, support files, and validation.

### Required File Format

Every learned skill file MUST start with YAML frontmatter. Do **not** write plain markdown without frontmatter.

Minimum required frontmatter:

```yaml
---
name: <skill-name>
description: <one-line description>
triggers:
  - <trigger-1>
  - <trigger-2>
---
```

### Skill Body Template

```markdown
---
name: <skill-name>
description: <one-line description>
triggers:
  - <trigger-1>
  - <trigger-2>
---

# [Skill Name]

## The Insight
What is the underlying PRINCIPLE you discovered? Not the code, but the mental model.

## Why This Matters
What goes wrong if you don't know this? What symptom led you here?

## Recognition Pattern
How do you know when this skill applies? What are the signs?

## The Approach
The decision-making heuristic, not just code. How should an agent THINK about this?

## Example (Optional)
If code helps, show it - but as illustration of the principle, not copy-paste material.
```
