---
name: model-routing
description: Use when selecting a model for a new task or subagent, deciding whether to escalate after a failed attempt, or designing a multi-agent pipeline with mixed task complexity.
---

# Model Routing

Choose the right model tier before starting a task. Overusing a capable model wastes cost and context. Underusing it produces lower quality on complex work.

## When to Use

- Selecting a model for a new task or subagent
- Deciding whether to escalate after a failed attempt
- Designing a multi-agent pipeline with mixed task complexity

## Tier Definitions (vendor-neutral)

| Tier | Typical examples | Task profile |
|------|-----------------|--------------|
| **Fast** | Haiku, GPT-4o-mini, Gemini Flash | Mechanical, deterministic, narrow |
| **Standard** | Sonnet, GPT-4o, Gemini Pro | General implementation and review |
| **Deep** | Opus, o1, Gemini Ultra | Architecture, security, root-cause, release |

Use your provider's current recommended model for each tier. Do not hard-code model IDs in documentation or scripts; reference tiers instead.

## Routing Table

### Fast tier

Use when ALL of:
- Single file or single operation
- Output is deterministic (rename, format, classify, generate boilerplate)
- No ambiguity in the task description
- Low blast radius on failure (easy to retry or revert)

Examples: rename a variable, convert a data format, generate a changelog entry, classify issue severity.

### Standard tier

Use when ANY of:
- Multi-file change with known scope
- Standard implementation task (add a feature, fix a bug, write tests)
- Code review of a bounded change
- Refactor with clear before/after contract

This is the **default**. When unsure, use Standard.

### Deep tier

Use when ANY of:
- Architecture or system design decision
- Security audit or threat model
- Root-cause analysis with no clear reproduction
- Pre-release verification across a large surface
- Task requires reasoning across many files simultaneously
- Two Standard attempts failed with no clear progress

Do not use Deep speculatively. It is expensive and slower.

## Escalation Rule

**Try Standard first.** Escalate to Deep only after Standard fails with a clear reasoning gap — not just a wrong answer. A wrong answer from Standard often means the task needs more context, not a more capable model.

Do not escalate because of anxiety about getting it right. Escalate because the attempt revealed a complexity that a smaller model cannot handle.

## Session Discipline

- Start a new session after a major phase transition (research → implement → test)
- Compact context after finishing research before starting implementation
- Do not carry debugging traces into an implementation session
- Short-lived subagents default to Fast or Standard depending on task type

## Cost Tracking

Record per task:
- Tier used
- Approximate token count
- Number of retries
- Success/escalated/failed

Use this to calibrate your routing decisions over time. If Standard succeeds > 90% of the time on a task type, that task does not need Deep.

## Anti-Patterns

- **Pre-escalation**: Using Deep on a task that hasn't been tried at Standard
- **Anxiety escalation**: Using Deep because the task feels important, not because it's complex
- **Under-routing**: Using Fast for a multi-file refactor and then retrying three times
- **Model pinning**: Hard-coding specific model IDs in configs instead of tier references

## Verification

- [ ] Tier was chosen from the routing table before the task started — Standard by default when unsure
- [ ] Deep was used only for a listed Deep criterion or after a Standard attempt exposed a reasoning gap
- [ ] No specific model IDs were hard-coded — tier references only
- [ ] Tier, retries, and outcome were recorded for future calibration
