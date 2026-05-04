# Eval Config Patterns

**DRAFT: requires review before catalog/plugin activation.**

## Minimal Shape
```yaml
description: "Short behavior check"

prompts:
  - file://prompts/main.txt

providers:
  - id: openai:chat:gpt-5-mini
    label: gpt-5-mini
    config:
      temperature: 0

defaultTest:
  assert:
    - type: cost
      threshold: 0.01
    - type: latency
      threshold: 5000

tests:
  - vars:
      input: "case text"
    assert:
      - type: contains
        value: "expected phrase"
```

## Assertion Order
Use deterministic assertions first:

| Need | Assertion |
| --- | --- |
| exact output | `equals` |
| required phrase | `contains`, `icontains`, `contains-all` |
| forbidden text | `not-contains`, `not-regex` |
| structured output | `is-json`, JSON schema |
| cheap guardrail | `cost`, `latency`, `word-count` |
| custom local logic | `javascript`, `python` |
| fuzzy quality | `similar`, `rouge-n`, `bleu` |
| subjective quality | `llm-rubric` with pinned grader |

## Env Rules
- Use `{{env.NAME}}`, not shell `$NAME`.
- Do not hardcode secrets.
- Do not ask user to paste keys into chat.
- State provider, model, expected cost, and network target before running.

## Analysis Template
```text
Eval:
Provider/model:
Cases run:
Pass/fail:
Deterministic failures:
Model-graded failures:
Likely causes:
Next smallest fix:
```
