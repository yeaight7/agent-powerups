# env-file-mutation-approval

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Require explicit approval before any write, edit, or delete operation touches `.env` files or similar credential-bearing configuration files. Prevents accidental overwrite of production credentials or silent injection of malicious values.

## Trigger Suggestion

```
PreToolUse → tool in [Write, Edit, Bash]
  AND (target path matches *.env OR .env.* OR .env)
```

## Matcher Patterns

Intercept operations on:

| Pattern | Examples |
|---|---|
| `.env` | Project root env file |
| `.env.*` | `.env.local`, `.env.production`, `.env.staging` |
| `*.env` | `database.env`, `secrets.env` |
| `credentials.*` | `credentials.json`, `credentials.yaml` |
| `.netrc` | SSH/FTP credentials |

Bash commands to watch: `cp .env`, `cat > .env`, `sed -i ... .env`, `echo ... >> .env`.

## Behavior

When a flagged operation is detected:

1. Print: `[env-file-mutation-approval] Write to credential file detected:`
2. Show the target path and proposed content (or command).
3. State: "This will modify a credential or environment file. Approve?"
4. Halt until explicit user approval.

## Safe Default

Block all writes to `.env` files without explicit approval. Never silently overwrite.

## Blocking vs Warning Mode

- **Blocking (recommended):** Halt and request explicit approval.
- **Warning:** Log and proceed — only acceptable in throwaway sandbox environments with no real credentials.

## False-Positive Risks

- CI pipelines that legitimately generate `.env` files from templates.
- `dotenv-vault` or similar tools that manage encrypted env files.
- Consider allowing writes to `.env.example` or `.env.template` (no real secrets).

## Bypass / Approval Mechanism

User provides explicit confirmation per-operation. The hook should not accept vague approval like "looks good" — require a specific "yes" or a re-invocation flag.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TARGET_PATH set by the hook runner.

ENV_PATTERNS=("\.env$" "\.env\." "\.env$" "credentials\.")

for pattern in "${ENV_PATTERNS[@]}"; do
  if echo "$TARGET_PATH" | grep -qE "$pattern"; then
    echo "[env-file-mutation-approval] Write to credential file detected:"
    echo "  Target: $TARGET_PATH"
    echo "Approve this write? (explicit yes required)"
    exit 1  # Block; re-invoke with approval flag
  fi
done

exit 0
```

## Sources / Inspiration

- Secret-management best practices from Twelve-Factor App methodology.
- Similar guards in pre-commit hook ecosystems (detect-private-key, check-dotenv).
