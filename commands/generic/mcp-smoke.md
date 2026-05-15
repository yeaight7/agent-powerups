# mcp-smoke

Purpose: Test that an MCP server starts and responds before adding it to an agent configuration.

1. Identify the MCP server name (provided or ask).
2. Run prerequisites check first: `/mcp-check` or `apx mcp check <name>`.
3. If prerequisites pass, run: `apx mcp smoke <name>` — launches the server and verifies it responds.
4. If apx is unavailable: start the server manually and verify it responds to a list-tools or ping request.
5. Report: server started and responded OK / FAILED — with the first error line if it failed.

Do not add the server to an agent config until smoke passes.
