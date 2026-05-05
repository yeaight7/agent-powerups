# Code Search Tool Selection

## Tool Choice
| Need | Tool |
| --- | --- |
| Find likely files by terms | `search_code` |
| Find structural code shape | `query_code` |
| Read exact file/line/symbol | `extract_code` |
| Inventory symbols in target file | `symbols_code` |

## Search Loop
1. Start with `search_code` using user terms and file filters.
2. Use `symbols_code` on promising files.
3. Use `query_code` for language-specific shapes.
4. Use `extract_code` only after narrowing scope.
5. Reuse session IDs for related searches to reduce duplicate context.

## Query Hints
- Preserve exact names from error messages and stack traces.
- Add language or extension filters when known.
- Keep token/result limits low first.
- Include tests only when task asks behavior verification or regression context.

## MCP Safety
- Bound paths to workspace.
- Allow read/search/extract methods first.
- Block write/delete/edit methods unless user explicitly asked for modification.
- Set connect and tool-call timeouts.
- Enable debug logs only for connection/tool discovery failures.
