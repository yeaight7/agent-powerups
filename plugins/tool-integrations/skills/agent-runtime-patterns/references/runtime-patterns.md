# Runtime Patterns

## Pattern Selection
| Problem | Pattern |
| --- | --- |
| repeated broad search | bounded search subagent/card |
| long system prompt | compact card pack |
| specialist subtasks | agents-as-tools |
| sequential multi-step workflow | chain |
| ambiguous routing | router |
| independent subtasks | orchestrator-worker |
| server state needed | explicit MCP session lifecycle |

## Measurement
Track before/after:
- tool calls
- LLM calls
- elapsed time
- prompt/context size
- failure rate
- number of user clarifications

## Card Rules
- Card is high-signal operating guidance, not full docs.
- One card owns one behavior.
- Include trigger, constraints, and done criteria.
- Avoid putting secrets or local machine paths in cards.

## MCP Session Lifecycle
1. Create session.
2. Attach session id via request metadata.
3. Verify stateful tool behavior.
4. Handle "session not found" by recreating or stopping.
5. Delete session or document intentional persistence.

## Anti-Patterns
- Adding orchestration to avoid clarifying requirements.
- Hiding slow tools behind more agents.
- Persisting state with no cleanup rule.
- Measuring token reduction only, ignoring task quality.
