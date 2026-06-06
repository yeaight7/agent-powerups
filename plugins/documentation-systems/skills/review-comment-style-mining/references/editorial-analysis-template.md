# Editorial Analysis Template

## Inputs

- PR URL or owner/repo + PR number.
- Text file extensions in scope.
- Max chars per file version.
- Whether private content may be summarized.

## Analysis Output

```markdown
# Writing Lessons From PR

## Mechanical Fixes
| Pattern | Before | After | Lesson |
| --- | --- | --- | --- |

## Reviewer-Driven Changes
| Feedback | Change Made | Lesson |
| --- | --- | --- |

## Structural Changes
- Added:
- Removed:
- Reordered:
- Split/merged:

## Style Rules To Reuse
- Clarity:
- Precision:
- Tone:
- Structure:
- Grammar:
- Content:

## Evidence
- PR:
- Files:
- Review comments:
```

## Guardrails

- Do not quote long private text.
- Truncate first/final dumps.
- Preserve reviewer intent, not only final wording.
- Separate explicit suggestions from inferred lessons.
