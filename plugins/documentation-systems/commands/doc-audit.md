---
description: "Audit the repository's documentation for broken paths, missing setup commands, and stale code blocks."
argument-hint: "<directory_to_audit>"
---

# Doc Audit Command

## CRITICAL BEHAVIORAL RULES

1. **Focus on Accuracy, Not Style**: Do not critique grammar. Critique technical accuracy and executability.

## Execution Steps

1. Find all `.md` files in the target directory.
2. Extract all shell commands. Check if they are standard and complete (e.g., not missing arguments).
3. Extract all file paths referenced in the text. Run a quick check to see if those files exist in the repo.
4. Generate an Audit Report detailing stale paths, non-executable commands, and missing architecture pointers.