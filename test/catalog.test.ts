import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { createCatalogService } from "../src/cli/utils/catalog.js";

const repoRoot = path.resolve(import.meta.dirname, "..");

test("loads catalog and exposes shipped skills", async () => {
  const service = await createCatalogService(repoRoot);
  const assets = service.listAssets();

  assert.ok(assets.length > 0);
  assert.ok(assets.some((asset: { name: string }) => asset.name === "systematic-debugging"));
});

test("finds asset by name", async () => {
  const service = await createCatalogService(repoRoot);
  const asset = service.getAsset("markitdown-file-intake");

  assert.equal(asset.name, "markitdown-file-intake");
  assert.equal(asset.type, "skill");
});

test("catalog includes first promised asset coverage", async () => {
  const service = await createCatalogService(repoRoot);

  assert.equal(service.getAsset("ship-check").type, "command");
  assert.equal(service.getAsset("no-secrets-preflight").type, "hook");
  assert.equal(service.getAsset("feature-iteration").type, "workflow");
  assert.equal(service.getAsset("python-library").type, "agents-md-template");
});

test("catalog includes executable command and structured mcp metadata", async () => {
  const service = await createCatalogService(repoRoot);
  const command = service.getAsset("ship-check");
  const mcp = service.getAsset("github-local");

  assert.equal(command.run?.kind, "ship-check");
  assert.deepEqual(mcp.mcp?.required_env, ["GITHUB_TOKEN"]);
  assert.equal(mcp.mcp?.server_package, "@modelcontextprotocol/server-github");
});

test("catalog includes local ask skills with command requirements", async () => {
  const service = await createCatalogService(repoRoot);
  const claude = service.getAsset("ask-claude");
  const gemini = service.getAsset("ask-gemini");

  assert.equal(claude.type, "skill");
  assert.deepEqual(claude.requires?.commands, ["claude"]);
  assert.ok(claude.compatible_with.includes("codex"));

  assert.equal(gemini.type, "skill");
  assert.deepEqual(gemini.requires?.commands, ["gemini"]);
  assert.ok(gemini.compatible_with.includes("codex"));
});
