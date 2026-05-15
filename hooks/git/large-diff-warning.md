# large-diff-warning

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Warn when a pending commit contains a very large diff. Large commits are harder to review, more likely to hide bugs, and increase the chance of merge conflicts. This hook surfaces the size before the commit is made and prompts the agent to confirm or split the change.

## Trigger Suggestion

```
PreToolUse → tool == Bash AND command contains "git commit"
```

## Check Procedure

When triggered:

1. Run `git diff --cached --stat` to get the staged summary.
2. Run `git diff --cached --shortstat` to count added + deleted lines.
3. If total lines changed exceeds the threshold, print a warning.
4. Ask the agent (or user) to confirm or split the commit.

## Thresholds (configurable)

| Changed lines | Action |
|---|---|
| < 300 | Allow without comment |
| 300–500 | Warn; note the size |
| > 500 | Block; require explicit confirmation or split |

## Behavior

When the threshold is exceeded:

1. Print: `[large-diff-warning] Large staged diff detected:`
2. Show: the `--stat` summary (file count + line counts).
3. State: "This commit changes N lines across M files. Consider splitting or confirm to proceed."
4. Halt until explicit confirmation.

## Safe Default

Warn and block at >500 lines. Adjust the threshold in the hook script for the project's norms.

## Blocking vs Warning Mode

- **Blocking (recommended above threshold):** Halt; prompt to split or confirm.
- **Warning:** Log the size and proceed — useful for projects that regularly batch large automated changes (e.g., mass renames, code generation).

## False-Positive Risks

- Legitimate bulk changes: initial commit, mass rename, generated file commit, lock-file update.
- Consider allowing large diffs on commits containing only known auto-generated patterns (e.g., `package-lock.json`, `*.pb.go`).

## Bypass / Approval Mechanism

User or agent responds with an explicit confirmation. Optionally, a `--large-ok` flag can be added to the commit command to bypass the check for that commit only.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash

WARN_THRESHOLD=300
BLOCK_THRESHOLD=500

SHORTSTAT=$(git diff --cached --shortstat 2>/dev/null)
if [ -z "$SHORTSTAT" ]; then
  exit 0
fi

LINES=$(echo "$SHORTSTAT" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo 0)
DELETIONS=$(echo "$SHORTSTAT" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo 0)
TOTAL=$((LINES + DELETIONS))

if [ "$TOTAL" -gt "$BLOCK_THRESHOLD" ]; then
  echo "[large-diff-warning] Large staged diff detected ($TOTAL lines changed):"
  git diff --cached --stat
  echo "Consider splitting into smaller commits. Confirm to proceed anyway."
  exit 1
elif [ "$TOTAL" -gt "$WARN_THRESHOLD" ]; then
  echo "[large-diff-warning] Large staged diff ($TOTAL lines). Review before committing."
  git diff --cached --stat
fi

exit 0
```

## Sources / Inspiration

- Best practices from trunk-based development guides (Google Engineering Practices).
- Pre-commit hook patterns from various open-source CI pipelines.
