# cloud-cli-guard

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Block or require confirmation for cloud CLI commands that mutate infrastructure state. Read-only and plan commands pass through; apply, delete, and destroy commands require explicit approval.

## Trigger Suggestion

```
PreToolUse → tool == Bash
  AND command starts with: aws, gcloud, az, kubectl, terraform, pulumi
```

## Matcher Patterns

### Allow without confirmation (read-only)

| CLI | Safe subcommands |
|---|---|
| `aws` | `describe-*`, `list-*`, `get-*`, `ls`, `s3 ls` |
| `gcloud` | `describe`, `list`, `get-iam-policy`, `config get` |
| `az` | `show`, `list`, `get`, `account show` |
| `kubectl` | `get`, `describe`, `logs`, `top`, `explain` |
| `terraform` | `plan`, `show`, `state list`, `validate`, `fmt` |
| `pulumi` | `preview`, `stack ls`, `config get` |

### Block and require approval (mutating)

| CLI | Dangerous subcommands |
|---|---|
| `aws` | `delete-*`, `terminate-*`, `stop-*`, `put-*`, `create-*`, `update-*` |
| `gcloud` | `delete`, `create`, `update`, `set-iam-policy`, `deploy` |
| `az` | `delete`, `create`, `update`, `set` |
| `kubectl` | `apply`, `delete`, `patch`, `scale`, `rollout`, `exec` |
| `terraform` | `apply`, `destroy`, `import` |
| `pulumi` | `up`, `destroy`, `refresh` |

## Behavior

When a mutating command is detected:

1. Print: `[cloud-cli-guard] Cloud mutation command intercepted:`
2. Show the full command.
3. State the target system and likely effect.
4. State: "This will modify cloud infrastructure. Approve?"
5. Halt until explicit user confirmation.

Read-only and plan commands pass through without interruption.

## Safe Default

Block mutating commands; allow read-only. "Plan" and "preview" commands are safe to allow as they make no changes.

## Blocking vs Warning Mode

- **Blocking (recommended):** Halt mutating commands; require per-command approval.
- **Warning:** Log and proceed — only for sandboxed dev environments with no production access.

## False-Positive Risks

- `aws s3 cp` is a mutation; `aws s3 ls` is not — match subcommand, not just CLI name.
- `kubectl exec` opens a shell — treat as mutating even though no resource is deleted.
- `terraform apply -target=<specific-resource>` still mutates; `-target` does not make it safe.

## Bypass / Approval Mechanism

Explicit "yes" per command. No blanket session approval. Agents should not accept "go ahead with all cloud changes" as approval for an entire session.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash

MUTATING_PATTERNS=(
  "^aws .*(delete|terminate|stop|create|update|put|remove)"
  "^gcloud .*(delete|create|update|deploy|set-iam)"
  "^az .*(delete|create|update|set)"
  "^kubectl .*(apply|delete|patch|scale|rollout|exec)"
  "^terraform (apply|destroy|import)"
  "^pulumi (up|destroy|refresh)"
)

for pattern in "${MUTATING_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "[cloud-cli-guard] Cloud mutation command intercepted:"
    echo "  $COMMAND"
    echo "This will modify cloud infrastructure. Approve? (explicit yes required)"
    exit 1
  fi
done

exit 0
```

## Sources / Inspiration

Common cloud safety patterns from AWS/GCP/Azure CLI documentation and infrastructure-as-code runbook best practices.
