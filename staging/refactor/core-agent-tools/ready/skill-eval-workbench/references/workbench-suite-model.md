# Workbench Suite Model

**DRAFT: requires review before catalog/plugin activation.**

## Case Layout
```text
suite/
  suite.yml
  references/
  cases/
    case-name/
      prompt.md
      workspace/
      checks/
      bin/
      mcp/
```

## Suite Parts
| Part | Purpose |
| --- | --- |
| `references/` | skill/docs visible to agent |
| `workspace/` | files copied into agent work dir |
| `checks/` | read-only grader/setup scripts |
| `bin/` | helper commands visible in work dir |
| `mcp/` | hidden service fixtures when needed |
| `trace` | agent messages/tool calls for diagnosis |
| `result` | grader evidence and pass/fail |

## Case Set
Start with:
- Happy path.
- Important edge case.
- No-tool-needed control.
- Unsafe-instruction resistance.
- Missing dependency behavior.

## Failure Classification
Classify before editing:
- unclear skill guidance
- missing reference material
- brittle grader
- unrealistic fixture
- task ambiguity
- product/code bug
- model variance

## Secret Hygiene
Forward only named env vars. Treat traces, preserved workspaces, stdout, and result JSON as sensitive.
