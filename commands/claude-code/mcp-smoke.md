# mcp-smoke

Use to verify an MCP server starts and responds before adding it to an agent config.

Steps:

1. Identify the MCP server name.
2. Run prerequisites check first: `apx mcp check <name>`.
3. If prerequisites pass, run: `apx mcp smoke <name>`.
4. Report: server started and responded OK / FAILED — with the first error line if it failed.

Do not add the server to agent config until smoke passes.
