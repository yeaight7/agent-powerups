---
name: context-minimization
description: "Use continuously during long tasks. Teaches how to read less, output less, and keep the LLM context window lean and fast."
---

# Context Minimization

Your context window is the most precious resource. Large contexts make you slow, expensive, and prone to hallucinations.

## The Rules of Lean Context

1. **Surgical Reads**: Never use `cat` or `read_file` on a 2,000-line file without `start_line` and `end_line`. Always use `grep` first to find the relevant line numbers.
2. **Silent Commands**: Always append `--silent`, `-q`, or redirect stderr/stdout to `/dev/null` for commands that produce massive logs (like `npm install` or verbose builds) unless you specifically need to debug them.
3. **Pagination**: Disable pagers for all terminal tools. E.g., `git --no-pager log`.
4. **Terse Responses**: Do not explain what a tool does before calling it, unless safety requires it. Do not repeat the user's instructions back to them verbatim.
5. **Close Files**: Once you are done looking at a file, stop referring to it.
6. **Parallel Ops**: If you need to search 3 files, run 3 parallel grep/read calls in a single turn instead of sequentially. This saves turns, which saves context repetition.