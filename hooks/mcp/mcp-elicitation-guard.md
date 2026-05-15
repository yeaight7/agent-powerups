# mcp-elicitation-guard

**Type:** Elicitation hook recipe (experimental) — review before use, not auto-applied.

## Purpose

Guard against MCP elicitation prompts that request secrets, credentials, broad permissions, or unexpected account and project access. MCP servers can request user input (secrets, tokens, confirmation of permissions) via elicitation; a compromised or malicious server could use this to extract credentials or escalate access.

## Trigger Suggestion

```
Elicitation → MCP server sends an elicitation request
  AND/OR
ElicitationResult → before a user response is forwarded to an MCP server
```

If `Elicitation` / `ElicitationResult` hooks are not supported by the host client, document this as a manual approval pattern for MCP servers that prompt for sensitive data.

## Matcher Patterns

Flag elicitation requests that contain:

| Pattern | Risk |
|---|---|
| `token`, `api_key`, `api key`, `secret`, `password`, `credential` | Credential extraction |
| `admin`, `superuser`, `root`, `full access`, `all permissions` | Over-broad scope |
| `production`, `prod`, `live`, `billing` | Production system access |
| `confirm`, `authorize`, `approve`, `grant` (broad) | Blanket permission escalation |
| Unexpected `scope`, `permission`, `role` fields | Hidden permission requests |

Allow if:
- Request is for a known safe read-only configuration value (project name, region, etc.).
- Request is from a pre-approved server listed in an allowlist.
- User has explicitly initiated an action that requires authentication.

## Behavior

When a suspicious elicitation is detected:

1. Print: `[mcp-elicitation-guard] MCP elicitation request requires review:`
2. Show the requesting server name and the elicitation prompt/fields.
3. Print the approval prompt:

```
ELICITATION REVIEW REQUIRED:

Server: <server_name>
Request: <elicitation prompt or field names>

Risk indicators: <matched patterns>

RECOMMENDED: Reject unless you initiated this action.

Options:
  A — Allow: forward the user's response to the server.
  B — Deny: reject the elicitation; do not send a response.
  C — Inspect: show full elicitation schema before deciding.

Blanket "yes" responses to MCP elicitation for credentials are a security risk.
```

4. Block in strict mode until user selects an option.
5. In warning mode: warn and allow if no high-risk indicators are detected.

## Safe Default

Blocking for credential/secret requests. Warning for ambiguous requests. Allow for clearly safe non-sensitive fields.

## Blocking vs Warning Mode

- **Blocking (recommended for credentials):** Block all elicitations matching credential or broad-scope patterns until user explicitly approves.
- **Warning:** Warn and allow for ambiguous or low-risk requests.

## False-Positive Risks

- Legitimate MCP servers that ask for project names or non-sensitive configuration.
- Servers that ask for `confirm` in a workflow-step context (not a permission grant).
- First-time setup flows where token input is expected and user-initiated.

Use an allowlist for trusted servers to reduce false positives.

## Bypass / Approval Mechanism

User selects Option A (Allow) after reviewing the request. Allowlisted servers bypass the prompt automatically. Allowlist should be maintained explicitly; do not add servers without review.

## Allowlist / Denylist Model

**Allowlist:** MCP servers pre-approved for elicitation (e.g., `memory`, `context7`).
**Denylist:** MCP servers never permitted to elicit credentials (e.g., unknown/community servers used in adversarial contexts).
**Default:** Warn on all unknown servers; block credential requests unconditionally.

## Suspicious Request Examples

```
# HIGH RISK — block
"Please enter your GITHUB_TOKEN to continue"
"Provide admin credentials to access project settings"
"Enter your Supabase service role key"

# MEDIUM RISK — warn
"Confirm you want to grant write access to repository X"
"Select permissions to enable: read, write, admin"

# LOW RISK — allow
"Enter your project name"
"Select target region: us-east-1 / eu-west-1"
```

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $SERVER_NAME and $ELICITATION_PROMPT by the hook runner.

HIGH_RISK_PATTERNS=(
  "token" "api_key" "api key" "secret" "password" "credential"
  "admin" "superuser" "root" "service.role" "service_role"
  "production" "prod" "billing"
)

for pattern in "${HIGH_RISK_PATTERNS[@]}"; do
  if echo "$ELICITATION_PROMPT" | grep -qi "$pattern"; then
    echo "[mcp-elicitation-guard] HIGH RISK elicitation from $SERVER_NAME"
    echo "Pattern matched: $pattern"
    echo "Request: $ELICITATION_PROMPT"
    echo "Deny unless you explicitly initiated this action."
    exit 1  # Block
  fi
done

echo "[mcp-elicitation-guard] Elicitation from $SERVER_NAME — low risk, allowing."
exit 0
```

## Sources / Inspiration

MCP security model documentation and prompt injection defense patterns. Inspired by OAuth scope restriction principles and credential-interception threat models.
