---
name: structured-code-search-mcp
description: Use when designing or using MCP-backed structured code search with search, AST query, symbol inventory, and bounded extraction workflows.
---

# Structured Code Search MCP

## When to use
Use when developing a new MCP server, debugging an MCP connection, or integrating an agent with standard MCP protocols.

## Requirements / Checks
- This is primarily an informational/reference skill.
- Prefer installed/pinned structured code search binaries over remote `npx -y ...@latest` execution.
- Confirm MCP client supports required transport and method filtering.
- Bound any search path to the current workspace unless user approves otherwise.

## Workflow
1. **Choose mode**: Decide whether the client needs raw tools, an agent layer, or direct CLI.
2. **Bound scope**: Set base path/default paths and token/result limits before broad search.
3. **Expose tools**: Keep tool schemas strict for search, AST query, extraction, and symbol listing.
4. **Filter methods**: Use allowlists for read/search methods and block destructive methods by default.
5. **Handle transport**: Support stdio or HTTP intentionally; set connect/tool timeouts.
6. **Debug minimally**: Enable debug logs only long enough to capture connection, tool discovery, and failed calls.

## Tool Model To Preserve
- `search_code`: text/boolean search with session dedup and result limits.
- `query_code`: AST/structural search for code shapes.
- `extract_code`: file/line/symbol extraction after search narrows scope.
- `symbols_code`: symbol inventory for target files.

## Safety Constraints
- Always validate input arguments to MCP tools against the defined JSON schema before execution.
- MCP servers must enforce strict path boundaries.
- Do not expose write/edit modes unless the user explicitly requested code modification.
- Do not include test files or broad dirs by default when the task asks for production behavior only.

## Validation / Done Criteria
- MCP setup has bounded paths, strict schemas, filtered methods, and timeouts.
- Search/extract workflow returns enough source context without flooding the model.

## References
- `references/structured code search-tool-selection.md`
