# destructive-bash-guard

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Block or flag Bash commands that are hard to reverse before they execute: mass deletes, forced git operations, database drops, and similar commands where the blast radius exceeds what undo or git can recover.

## Trigger Suggestion

```
PreToolUse → tool == Bash
```

## Matcher Patterns

Flag any command containing:

| Pattern | Risk |
|---|---|
| `rm -rf` | Recursive directory delete |
| `git reset --hard` | Discard all local changes |
| `git clean -f` or `git clean -fd` | Delete untracked files |
| `git push --force` or `git push -f` | Overwrite remote history |
| `git branch -D` | Force-delete branch |
| `DROP TABLE` / `DROP DATABASE` | Irreversible schema destruction |
| `TRUNCATE` | Irreversible row deletion |
| `chmod -R 777` | Broad permission escalation |
| `> /dev/null` combined with write flags | Potential data erasure |

## Behavior

When a flagged command is detected:

1. Print: `[destructive-bash-guard] Potentially destructive command detected:`
2. Show the full command.
3. State: "This command is hard to reverse. Confirm you want to proceed."
4. Wait for explicit user confirmation before executing.

## Safe Default

Block and require confirmation. Do not silently allow.

## Blocking vs Warning Mode

- **Blocking (recommended):** halt execution, require explicit approval.
- **Warning:** log a message and proceed. Use only when the agent is in a sandboxed or throwaway environment.

## False-Positive Risks

- `rm -rf` on a temp dir or build output (e.g., `rm -rf dist/`) is routine — consider allowing patterns under known safe paths like `dist/`, `.next/`, `node_modules/` if the repo has them.
- `git reset --hard` after a failed merge is a normal recovery step — context matters.

## Bypass / Approval Mechanism

User types an explicit confirmation phrase or the agent re-invokes with a user-approved flag. The hook should NOT auto-approve.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called by hook runner with $COMMAND set to the full bash command.

DANGEROUS_PATTERNS=(
  "rm -rf"
  "git reset --hard"
  "git clean -f"
  "git push --force"
  "git push -f"
  "git branch -D"
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE "
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "[destructive-bash-guard] Potentially destructive command detected:"
    echo "  $COMMAND"
    echo "Pattern matched: $pattern"
    echo "Confirm you want to proceed. This action may be irreversible."
    exit 1  # Block; agent must re-request with explicit user approval
  fi
done

exit 0  # Allow
```

## Sources / Inspiration

- Common pre-commit guard patterns in git hook ecosystems.
- Inspired by safety guardrails discussion in Claude Code and Codex documentation.
