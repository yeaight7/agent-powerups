---
name: pr-writing-review
description: Use when analyzing pull request review comments for writing, documentation, wording, tone, or editorial improvement patterns.
---

# PR Writing Review

## When To Use
- User asks what writing feedback a PR received.
- Need to compare draft vs final docs, blog posts, prompts, or README text.
- Need recurring style lessons from reviewer comments.

## Requirements / Checks
- Confirm `gh` availability and auth before fetching private PR data.
- Ask before contacting GitHub or reading private repo content.
- Prefer bounded text formats: `.md`, `.mdx`, `.txt`, `.rst`.
- Cap large file diffs before sending to any model.

## Workflow
1. Identify PR URL or `owner/repo` plus PR number.
2. Extract inline suggestions, plain feedback, and changed text file evolution.
3. Separate mechanical edits from reviewer rationale.
4. Compare first draft and final text by section.
5. Group lessons by clarity, precision, tone, structure, grammar, and content.
6. Return a concise style guide the author can reuse.

## Safety Constraints
- Do not expose private PR content outside the local session without approval.
- Do not quote long proprietary text; summarize changes and cite file paths/permalinks when safe.
- Do not run broad GitHub fetches; scope to one PR unless user asks wider.

## Validation / Done Criteria
- Output distinguishes explicit suggestions from inferred style lessons.
- Each lesson is tied to at least one review comment or text change.
- Large file content is truncated or summarized.

## References
- `references/editorial-analysis-template.md`
