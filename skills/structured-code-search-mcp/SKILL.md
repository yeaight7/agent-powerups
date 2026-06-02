---
name: structured-code-search-mcp
description: Use when designing or using MCP-backed structured code search with search, AST query, symbol inventory, and bounded extraction workflows.
---

# Structured Code Search MCP

## When to use

Use when an agent needs to search, navigate, or extract code using structural queries — AST patterns, symbol lookups, or cross-file reference tracing — beyond what simple grep or glob can provide, via an MCP-backed code search server.

## Requirements / Checks

- Prefer installed/pinned structured code search binaries over remote `npx -y ...@latest` execution.
- Confirm the MCP client supports the required transport and method filtering.
- Bound any search path to the current workspace unless the user explicitly approves otherwise.

## Workflow

1. **Choose the right tool for the query**:

   | Need | Tool |
   |---|---|
   | Text/boolean search across files | `search_code` |
   | Structural pattern (function shape, class with field) | `query_code` |
   | Extract a specific file, range, or symbol | `extract_code` |
   | List all symbols in target files | `symbols_code` |

2. **Bound scope before searching** — set base path and default paths to the workspace. Set a result limit before running broad queries (e.g., max 20 results).

3. **Iterate from broad to narrow**:
   - Start with `search_code` or `symbols_code` to identify candidate files.
   - Use `query_code` to narrow to the specific structural pattern.
   - Use `extract_code` to retrieve the exact code range needed.

4. **Filter methods at the server** — use allowlists for read/search methods. Block write and edit methods by default; only enable if code modification is explicitly part of the task.

5. **Handle transport** — support stdio or HTTP intentionally; set connect and tool call timeouts.

6. **Debug minimally** — enable debug logs only long enough to capture connection, tool discovery, and failed calls. Disable after diagnosis.

## Tool Interface (illustrative — actual names depend on your server)

- `search_code` — text/boolean search with session dedup and result limits.
- `query_code` — AST/structural search for code shapes.
- `extract_code` — file/line/symbol extraction after search narrows scope.
- `symbols_code` — symbol inventory for target files.

Exact tool names and schemas vary by implementation. Read the server's tool list before assuming names.

## Safety Constraints

- Validate all input arguments against the defined JSON schema before execution.
- Enforce strict path boundaries — refuse requests for paths outside the workspace.
- Do not expose write or edit modes unless code modification is explicitly requested.
- Do not include test files or broad directories by default when the task asks for production behavior only.

## Validation / Done Criteria

- MCP setup has bounded paths, strict schemas, filtered methods, and timeouts configured.
- Search and extract workflow returns enough source context without flooding the model context window.

## References

- `references/code-search-tool-selection.md`
