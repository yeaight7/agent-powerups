---
description: "Generate a dense state-restoration document before ending a session."
argument-hint: "<current_status_summary>"
---

# Write Handoff Command

## CRITICAL BEHAVIORAL RULES

1. **Be Exact**: Vague summaries destroy context. Use exact file paths, line numbers, and error messages.

## Execution Steps

1. Parse the provided `$ARGUMENTS` summarizing the current state.
2. Identify the last modified files and the current failing test or goal.
3. Format the data into a strict Markdown structure: Goal, Current State (Working/Broken), Next Steps.
4. Overwrite or create `handoff.md` in the project root with this exact information.
5. Provide the exact command the next user should run to resume.