# mcp-check

Purpose: Check MCP server prerequisites and configuration before activating or using a server.

1. Identify the MCP server name (provided or ask).
2. Run: `apx mcp check <name>` — verifies required commands exist and env vars are set.
3. If apx is unavailable, manually verify:
   - Required command exists (docker, npx, etc.)
   - Required env vars are set (check presence, do not print values)
   - Config file exists and parses without error
4. Report: which prerequisites pass, which fail, and the exact blocker for each failure.

Do not start, install, or activate the MCP server unless all prerequisites pass and the user approves.
