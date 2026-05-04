# Session History Diagnostics

**DRAFT: requires review before catalog/plugin activation.**

## Read-Only First
Never edit history before:
- locating session dir
- backing up target JSON
- finding last valid tool-call boundary
- getting user approval for mutation

## Inspection Queries
```bash
jq '.messages | length' history.json
jq '.messages[-5:] | .[] | {role, stop_reason, has_tool_calls: (.tool_calls != null), has_tool_results: (.tool_results != null)}' history.json
jq '.messages | to_entries | .[] | {index: .key, role: .value.role, tool_calls: (.value.tool_calls | keys? // []), tool_results: (.value.tool_results | keys? // [])}' history.json
```

## Failure Patterns
| Pattern | Symptom | Fix |
| --- | --- | --- |
| unanswered tool call | assistant has `tool_calls`, no following result | truncate to last valid result after backup |
| duplicate user turn | two user messages before assistant | inspect interruption/resume boundary |
| malformed tool result | result id missing or mismatched | repair only exact id if approved |
| slow loop | repeated tool timing spikes | summarize tool count/durations |
| stale session | history references missing files | restart with compact handoff |

## Report Shape
```text
Session:
Files inspected:
Message count:
Last valid boundary:
Tool-call mismatches:
Slowest calls:
Likely cause:
Recommended repair:
Mutation required: yes/no
```
