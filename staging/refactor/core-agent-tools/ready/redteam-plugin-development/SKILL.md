---
name: redteam-plugin-development
description: Use when creating or reviewing red-team eval plugins, attack prompt generators, grader rubrics, or safety test templates.
---

# Redteam Plugin Development

## When To Use
- Adding a new red-team plugin or grader.
- Editing attack templates, rubric tags, or plugin metadata.
- Reviewing multimodal or tool-use safety evals for false positives/negatives.

## Requirements / Checks
- Confirm target eval framework and repo layout before editing.
- Prefer deterministic checks for template shape before model-graded rubrics.
- Ask before running networked evals, paid model graders, or large red-team suites.

## Workflow
1. Define target harm class, safe behavior, and explicit pass/fail boundary.
2. Standardize grader inputs before writing rubrics: user query, system purpose, model output, allowed entities.
3. Write attack prompt templates that emit one prompt per line or one machine-parseable record per case.
4. Keep rubric output structured: `{ reason, pass, score }`.
5. Add registration metadata wherever the host framework expects plugin listing, risk category, aliases, and grader binding.
6. Add focused tests for template variables, grader parsing, and one benign over-refusal case.

## Safety Constraints
- Do not paste real secrets, private prompts, or customer data into attack templates.
- Avoid storing base64 image payloads in text-only grader variables; use a text-only prompt field when available.
- Do not broaden a plugin from one risk class to another without updating docs, metadata, and tests.
- Do not run harmful prompt generation against production systems without explicit approval.

## Validation / Done Criteria
- Plugin metadata, generator, grader, and docs refer to the same risk category.
- Rubric tags are consistent and not deprecated.
- Benign and harmful fixtures both execute locally.
- Results show reasoned pass/fail output, not only raw scores.

## References
- `references/redteam-grader-checklist.md`
