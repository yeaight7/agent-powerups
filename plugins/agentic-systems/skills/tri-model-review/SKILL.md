---
name: tri-model-review
description: Multi-model orchestration — route to two external advisors, then synthesize
level: 5
---

# Tri-Model Review

Tri-model review routes through two external advisor CLIs, then synthesizes both outputs into one answer.

Use this when you want parallel external perspectives.

## When to Use

- Backend/analysis + frontend/UI work in one request
- Code review from multiple perspectives (architecture + design/UX)
- Cross-validation where different models may disagree
- Fast advisor-style parallel input without full team runtime orchestration

## Requirements

- Ensure you have configured the appropriate `apx ask-*` wrappers.
- If either wrapper is unavailable, continue with whichever provider is available and note the limitation.

## How It Works

```text
1. Decompose the request into two advisor prompts:
   - Analysis/architecture/backend prompt
   - UX/design/docs/alternatives prompt

2. Run both advisors via the canonical wrappers:
   - apx ask-codex "<prompt>"
   - apx ask-gemini "<prompt>"

3. Synthesize both outputs into one final response
```

## Execution Protocol

When invoked, follow this workflow:

### 1. Decompose Request
Split the user request into:

- **Architecture prompt:** correctness, backend, risks, test strategy
- **UX prompt:** content clarity, alternatives, edge-case usability, docs polish
- **Synthesis plan:** how to reconcile conflicts

### 2. Invoke advisors via Bash

Run both advisors via the Bash tool:

```bash
apx ask-codex "<architecture prompt>"
apx ask-gemini "<UX prompt>"
```

### 3. Synthesize

Return one unified answer with:

- Agreed recommendations
- Conflicting recommendations (explicitly called out)
- Chosen final direction + rationale
- Action checklist

## Fallbacks

If one provider is unavailable:

- Continue with available provider + synthesis
- Clearly note missing perspective and risk

If both unavailable:

- Fall back to a single-model answer and state external advisors were unavailable.
