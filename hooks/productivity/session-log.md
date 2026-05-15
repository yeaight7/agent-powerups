# session-log

**Type:** PostToolUse / Stop hook recipe — review before use, not auto-applied.

## Purpose

Append a timestamped entry to a local session log each time a tool executes or the session ends. Builds a lightweight audit trail of what the agent did without relying on the agent's own memory or conversation history. Useful for reviewing what changed after a long autonomous session.

## Trigger Suggestion

```
PostToolUse → any tool  (log each tool call)
  OR
Stop → session end  (log final summary)
```

A lighter variant: trigger only on high-signal tools — Bash, Write, Edit, and MCP write tools.

## Log Format

Each entry appended to `.agent-session.log` (or a configurable path):

```
[2025-05-16T14:32:01Z] TOOL=Bash CMD="git commit -m 'feat: add login page'"
[2025-05-16T14:32:05Z] TOOL=Write FILE="src/auth/login.tsx" LINES=87
[2025-05-16T14:32:10Z] TOOL=Edit FILE="src/auth/index.ts" CHANGE="export LoginPage"
[2025-05-16T14:33:00Z] SESSION_END summary="Implemented login page: 3 files changed, 92 insertions"
```

## Behavior

On each PostToolUse event:

1. Construct a log line: `[ISO_TIMESTAMP] TOOL=<name> <key args>`.
2. Append the line to the log file.
3. Do not block tool execution — this is a non-blocking observer.

On Stop (session end):

1. Append a `SESSION_END` line with a one-sentence summary of what was accomplished.

## Safe Default

Append-only; never modify existing log entries. Never log secret values, API keys, or file contents.

## Blocking vs Warning Mode

- **Non-blocking (required):** This hook must never block tool execution. Its purpose is observation only.

## False-Positive Risks

- Log growth over many sessions — rotate or truncate `.agent-session.log` periodically.
- Sensitive arguments (e.g., env var values passed to Bash) may appear in the log. The hook implementation should redact known secret patterns before writing.

## Privacy / Security Note

The log file is local only. Do not commit `.agent-session.log` to version control. Add it to `.gitignore`.

## Bypass / Approval Mechanism

No bypass needed — non-blocking. To disable, remove the hook registration.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TOOL_NAME and relevant $TOOL_ARGS by the hook runner.
# PostToolUse variant.

LOG_FILE="${REPO_ROOT:-.}/.agent-session.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Redact common secret patterns
SAFE_ARGS=$(echo "${TOOL_ARGS:-}" | sed -E 's/(key|token|secret|password)=[^ ]*/\1=REDACTED/gi')

echo "[$TIMESTAMP] TOOL=${TOOL_NAME} ${SAFE_ARGS}" >> "$LOG_FILE"
exit 0
```

Add `.agent-session.log` to `.gitignore`:

```gitignore
.agent-session.log
```

## Sources / Inspiration

- Audit log patterns from system administration and compliance tooling.
- Claude Code PostToolUse and Stop hook event documentation.
