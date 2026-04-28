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
