# agent-relay

Status: **experimental, local-only**.

Purpose: stateless multi-turn delegation between a host agent and a secondary agent CLI. Context is threaded through artifact files — there is no persistent process, no background session, and no live connection.

## What This Is

A protocol for structured hand-offs when a task benefits from a second agent's perspective across more than one exchange. Each turn is a fresh CLI invocation. The "session" is the artifact directory and the context documents inside it.

## What This Is Not

- Not a background daemon.
- Not a persistent subprocess.
- Not real-time interleaving.
- Not multi-agent orchestration.
- Not a replacement for MCP or a routing layer.

## When to Use

- Need more than one round-trip to a secondary agent (review → refine → re-review).
- Want an auditable trace of each exchange in the `.apx/artifacts/` directory.
- Host agent is Claude Code; secondary is Codex, Gemini, or another Claude instance.

Do not use when a single `apx ask <provider>` call is sufficient. This adds overhead; reserve it for genuinely iterative exchanges.

## Prerequisites

- At least one `ask-*` skill available (`ask-codex`, `ask-claude`, or `ask-gemini`).
- Verify the secondary agent CLI is present:

```bash
codex --version   # or: claude --version / gemini --version
```

## Protocol

### Turn 0 — Open the relay

Name the relay session. Create a context file.

```bash
mkdir -p .apx/relay/<session-name>
```

Write a `context.md` file describing:
- The goal of the session.
- What the secondary agent should know (scope, constraints, current state).
- What output format you expect from each turn.

```markdown
# Relay: <session-name>

Goal: <one sentence>

Scope: <what files/decisions are in play>

Output format requested: <bullet list / patch / yes-no / etc.>

## Turn 0 context

<paste relevant code, diff, or plan here>
```

### Turn N — Delegate a task

Compose a prompt that includes the context file and the specific question for this turn.

```bash
cat .apx/relay/<session-name>/context.md > /tmp/relay-prompt.txt
echo "" >> /tmp/relay-prompt.txt
echo "---" >> /tmp/relay-prompt.txt
echo "Turn N question: <your specific question>" >> /tmp/relay-prompt.txt

apx ask codex "$(cat /tmp/relay-prompt.txt)" \
  --artifact-dir .apx/relay/<session-name>
```

Or with `claude`:

```bash
apx ask claude "$(cat /tmp/relay-prompt.txt)" \
  --artifact-dir .apx/relay/<session-name>
```

### Between turns — Update context

Read the artifact from the previous turn. Extract what matters. Append it to `context.md` before the next delegation.

```markdown
## Turn N result (summary)

<paste the relevant findings or decisions from the artifact>

## Turn N+1 question

<what to ask next>
```

Do not paste the entire previous artifact inline — summarize what is load-bearing for the next turn.

### Close the relay

When the task is done, note the outcome in `context.md`:

```markdown
## Relay closed

Outcome: <decision reached / task complete / abandoned>

Artifacts: .apx/relay/<session-name>/
```

No process to kill. No session to terminate. The relay is closed when you stop delegating.

## Artifact Layout

```text
.apx/relay/<session-name>/
  context.md                          ← shared context document (you maintain)
  codex-turn-1-<timestamp>.md         ← artifact from turn 1
  codex-turn-2-<timestamp>.md         ← artifact from turn 2
  ...
```

Artifacts are written by `apx ask`. Context is written by the host agent. Both are plain Markdown.

## Safety

- Do not include secrets, tokens, or credentials in relay prompts.
- Review each artifact before threading its content into the next turn.
- The `.apx/relay/` directory is local — it is not committed unless you explicitly add it.
- If an artifact contains dangerous advice, note it and stop.

## Limitations

- **No real-time back-and-forth.** Each turn completes before the next begins.
- **No shared state between CLIs.** The secondary agent has no memory of prior turns unless you include prior context explicitly.
- **Token budget.** Accumulated context grows with each turn. Keep summaries tight.
- **`apx ask codex` passes the prompt as a positional argument.** Some Codex CLI versions open a TUI rather than writing to stdout. If stdout is empty, check `codex --help` for a quiet/non-interactive flag and invoke `codex` directly with output redirection.
- **Not tested across all providers.** Treat each new provider combination as a new integration until verified.
