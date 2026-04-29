# agent-relay

Status: **working local persistent relay**.

Purpose: keep a secondary agent process active so the primary agent or user can delegate repeated questions, reviews, research summaries, and second opinions without paying startup cost each turn.

## What This Is

`apx relay` starts a local daemon for one named session.

| Provider | Protocol | Cross-turn context |
|---|---|---|
| `gemini` | ACP persistent session | Yes |
| `claude` | `claude -p` per turn | No |
| `codex` | `codex --full-auto` per turn | No |

For Gemini, the daemon launches `gemini --acp`, opens one ACP session, keeps it idle between turns, and sends each `apx relay ask` prompt to that already-active session.

For Claude and Codex, the daemon stays alive to route requests, but each ask launches a fresh subprocess (`claude -p` or `codex --full-auto`). They do not preserve conversation state between relay asks.

The host gets:

- a persistent background daemon
- one command surface for user and agent: `apx relay ...`
- Markdown artifacts per turn under `.apx/relay/<session-name>/`
- `status` and `stop` controls for lifecycle management

## Current Providers

Persistent relay supports:

```bash
apx relay start <session-name> --provider <gemini|claude|codex>
```

## Prerequisites

Install and authenticate the relevant CLI:

```bash
gemini --version
claude --version
codex --version
```

On Windows, Gemini ACP expects bundled ripgrep at:

```text
%APPDATA%\npm\node_modules\@google\gemini-cli\bundle\vendor\ripgrep\rg-win-x64.exe
```

If Gemini says ripgrep is unavailable, install ripgrep and place `rg.exe` there, or ensure a working `rg.exe` is available before starting relay.

## Lifecycle

### Start

```bash
apx relay start second-opinion --provider gemini
```

This creates:

```text
.apx/relay/second-opinion/
  relay.json
  relay.log
```

Use `--model` only when you need a specific Gemini model (it applies only to Gemini):

```bash
apx relay start second-opinion --provider gemini --model gemini-2.5-flash
```

### Check Status

```bash
apx relay status second-opinion
```

Status checks the daemon TCP listener, not just the state file.

### Ask

```bash
apx relay ask second-opinion "Review this plan for missing failure modes."
```

Each turn writes an artifact:

```text
.apx/relay/second-opinion/
  gemini-turn-1-review-this-plan-for-missing-failure-modes-<timestamp>.md
```

### Stop

```bash
apx relay stop second-opinion
```

Stop closes the APX daemon and kills any persistent ACP child processes.

## Optional Context Template

`init` still exists for pre-writing shared context:

```bash
apx relay init second-opinion
```

It creates:

```text
.apx/relay/second-opinion/context.md
```

You can paste or summarize load-bearing context there, then ask:

```bash
apx relay ask second-opinion "$(cat .apx/relay/second-opinion/context.md)"
```

## Safety

- Do not include secrets, tokens, or credentials in relay prompts. No secrets should be written into relay config or artifacts.
- Relay artifacts are local and not committed unless you explicitly add `.apx/`.
- The ACP client exposes read-only file access inside the repo root. It refuses reads outside that root and does not expose write access.
- Review relay answers before applying recommendations.

## Limits

- One prompt at a time per relay session.
- Gemini model capacity errors are external; retry the same active session or restart with another `--model`.
- The daemon stores its control port in `.apx/relay/<session-name>/relay.json`; delete stale state only after confirming no matching daemon is running.
- Windows `.cmd` handling should work through existing `spawnWindowsScript`.
