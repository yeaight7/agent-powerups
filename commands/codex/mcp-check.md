# mcp-check

Use to check MCP server prerequisites before activating or using a server.

Steps:

1. Identify the MCP server name.
2. Run: `apx mcp check <name>`
   - Verifies required commands exist (docker, npx, etc.).
   - Verifies required env vars are set.
   - Parses the config file for syntax errors.
3. Report: which prerequisites pass, which fail, and the exact blocker.

Do not start or install the MCP server unless all prerequisites pass and the user approves.
