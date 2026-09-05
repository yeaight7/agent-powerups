# Agent QA MCP configuration

This optional generic stdio configuration connects a coding agent to [Agent QA](https://github.com/vostride/agent-qa), a natural-language web and mobile application-testing tool. It exposes local schema/discovery tools and dashboard-backed authoring, run, artifact, and triage tools.

## Prepare the test workspace

This template uses Node.js 24 or newer and npm. Check `node --version` and `npm --version` first. The upstream quickstart also documents Bun, but this configuration uses npm.

Ask for user approval before installing Agent QA. In the chosen test workspace, install the version used by this template:

```sh
npm install -D agent-qa@0.1.21
npx --no-install agent-qa@0.1.21 --version
```

If installation is declined, use the [documentation](https://vostride.com/docs/agent-qa/quickstart) to explain the setup and leave the client configuration unapplied. Do not install a package implicitly or alter global agent settings.

## Configure a generic MCP client

Review `mcp/generic/agent-qa.json`, then merge its server entry into the intended client's project configuration. Launch the MCP subprocess with the test workspace as its working directory. The `--no-install` flag prevents this template from installing the package on startup.

```json
{
  "mcpServers": {
    "agent-qa": {
      "command": "npx",
      "args": [
        "--no-install",
        "agent-qa@0.1.21",
        "mcp"
      ]
    }
  }
}
```

This file uses the common `mcpServers` JSON shape. Check the chosen client's documentation for its exact format. No client-specific configuration or compatibility certification is implied.

## Verify the connection

Call `agent_qa_discover`, then `agent_qa_schema_reference` or `agent_qa_validate_definition` for local schema checks. The published 0.1.21 server exposes 33 tools.

Authoring, runs, artifacts, and triage require a dashboard API. Follow the [quickstart](https://vostride.com/docs/agent-qa/quickstart) to prepare the workspace and browser or mobile runtime. Start the dashboard from that workspace:

```sh
npx --no-install agent-qa@0.1.21 dashboard --port 3470
```

Pass `dashboardUrl: "http://localhost:3470"` to dashboard-backed stdio tool calls. Approve test execution and filesystem changes before using tools that create files or run workflows; configuring the server alone does not run a test. Configure any model credentials in the test workspace, not in this template.

Agent QA is source-available under [FSL-1.1-ALv2](https://github.com/vostride/agent-qa/blob/main/LICENSE.md). There is no software fee for permitted use; configured model, browser, and device providers may charge separately. The template does not include provider credentials or promise provider-backed test execution.

Source: [official MCP documentation](https://vostride.com/docs/agent-qa/mcp).
