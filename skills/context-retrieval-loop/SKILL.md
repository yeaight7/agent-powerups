---
name: context-retrieval-loop
description: Use when starting work in an unfamiliar area of a codebase, spawning a subagent that needs targeted file context, a first search pass missed the relevant file, or the file scope of a task is unclear.
---

# Context Retrieval Loop

Gather the right codebase context before making changes or spawning subagents. Prevents acting on incomplete information.

## When to Use

- Starting work on an unfamiliar area of a codebase
- Spawning a subagent that needs targeted file context
- Failing to find a relevant file on the first search pass
- Unsure which files are in scope for a task

## The 3-Cycle Loop

Each cycle builds on the previous. Stop early when you have enough context. Do not exceed 3 cycles.

### Cycle 1 — Broad Search

```bash
# Find files by keyword
rg "<primary-keyword>" --type ts --type js -l
rg "<primary-keyword>" --glob "*.py" -l

# Find by filename pattern
find . -name "*<keyword>*" -not -path "*/node_modules/*" -not -path "*/.git/*"
```

Collect: file paths, key terms, naming conventions seen.

**Stop here if:** 3 or more directly relevant files found with no critical gaps.

### Cycle 2 — Exact Source and Tests

Read the most relevant files from Cycle 1 in full. Then:

```bash
# Find tests for those files
rg "<filename-stem>" --glob "*.test.*" --glob "*.spec.*" -l
rg "import.*<module-name>" -l

# Find call sites
rg "<function-name>|<class-name>" --type ts --type js -l
```

Collect: imports used, function signatures, test patterns, adjacent files referenced.

**Stop here if:** You can describe the change needed and its blast radius.

### Cycle 3 — Docs and Setup

```bash
# Check project-specific docs
ls docs/ README.md AGENTS.md CLAUDE.md .claude/ 2>/dev/null

# Check config for feature flags, env vars, or schema
rg "<keyword>" .env.example *.config.* *.toml *.yaml -l 2>/dev/null
```

Collect: configuration constraints, environment requirements, anything that would block a change.

## Stopping Conditions

Stop the loop (whichever comes first):
- You have 3+ high-relevance files and understand the change scope
- Cycle 3 complete
- Each new cycle returns only files already seen

## Output

After the loop, report:

```
Context gathered:
  <file-path> — <one-line reason for relevance>
  ...

Missing context (if any):
  <what is still unclear and why it matters>
```

If context is missing, state it explicitly. Do not proceed with guesses when a known gap exists.

## Integration with Subagents

When dispatching a subagent, pass only the gathered file list — not the full conversation context:

```
Relevant files for this task:
  src/auth/tokens.ts — contains TokenService used by the bug
  src/auth/session.ts — session state management
  src/auth/tokens.test.ts — existing test patterns
```

## Constraints

- Max 3 cycles. Diminishing returns beyond that.
- Do not read files speculatively. Read only files flagged as relevant.
- Do not inline entire file contents into the subagent prompt; pass paths.
- Report gaps rather than silently proceeding with incomplete context.

## Verification

- [ ] The loop stopped at a stopping condition — never past 3 cycles
- [ ] Every gathered file is listed with a one-line relevance reason
- [ ] Missing context is stated explicitly — no proceeding on guesses when a gap is known
- [ ] Subagents received the file-path list, not inlined file contents
- [ ] No speculative reads — only files flagged as relevant were opened
