# dev-server-tmux-guard

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Prevent long-running dev server commands from blocking the agent's Bash tool indefinitely or losing output when the session ends. Suggests running the server in a background process, tmux pane, or log file instead of a foreground blocking call.

## Trigger Suggestion

```
PreToolUse → tool == Bash
  AND command matches a known dev server pattern
```

## Matcher Patterns

Flag these commands (or substrings):

| Pattern | Server |
|---|---|
| `npm run dev` | Node/Vite/Next/generic |
| `pnpm dev`, `yarn dev` | Node package managers |
| `vite`, `vite dev` | Vite |
| `next dev` | Next.js |
| `react-scripts start` | Create React App |
| `rails server`, `rails s` | Ruby on Rails |
| `python manage.py runserver` | Django |
| `flask run`, `uvicorn`, `gunicorn` | Python servers |
| `cargo run`, `cargo watch` | Rust |
| `go run .` | Go |

## Behavior

When a dev server command is detected:

1. Print: `[dev-server-tmux-guard] Long-running dev server command detected:`
2. Show the command.
3. Suggest the appropriate background invocation:

```
RECOMMENDED: Run this in background to avoid blocking the agent session.

Option A — Background with log:
  <command> > .dev-server.log 2>&1 &
  echo "PID: $!"

Option B — tmux new window:
  tmux new-window -n dev-server '<command>'

Option C — Separate terminal tab (manual).

The process ID should be recorded so it can be stopped later.
Do you want to proceed with the foreground command, or switch to one of the above?
```

4. In strict mode: block until the user selects an option.
5. In warning mode: warn and allow the foreground command.

## Safe Default

Warning mode — suggest background, allow foreground if the user explicitly proceeds. Most agents cannot use tmux directly; the suggestion is for the user to act on.

## Blocking vs Warning Mode

- **Warning (recommended):** Inform and suggest; allow foreground if user confirms.
- **Blocking:** Use in environments where a blocked Bash tool would break the agent loop.

## False-Positive Risks

- Short-lived variants: `vite build`, `next build` — not long-running. Match only `dev`/`start`/`run` subcommands.
- CI environments that legitimately run servers in the foreground with a timeout.

## Bypass / Approval Mechanism

User explicitly confirms: "run in foreground" or selects the background option. A general "go ahead" counts as foreground confirmation.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash

DEV_PATTERNS=(
  "npm run dev"
  "pnpm dev"
  "yarn dev"
  "next dev"
  "vite dev"
  "^vite$"
  "rails s"
  "rails server"
  "python manage.py runserver"
  "flask run"
  "uvicorn"
)

for pattern in "${DEV_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "[dev-server-tmux-guard] Long-running dev server detected: $COMMAND"
    echo ""
    echo "This command will block the agent session. Recommended alternatives:"
    echo "  Background: $COMMAND > .dev-server.log 2>&1 &"
    echo "  tmux:       tmux new-window -n dev '$COMMAND'"
    echo ""
    echo "Proceed with foreground command? (yes to allow, no to cancel)"
    exit 1  # Block in strict mode; set to exit 0 for warning-only
  fi
done

exit 0
```

## Sources / Inspiration

Common agent session management patterns. Inspired by tmux-based workflow guides and Claude Code session tooling documentation.
