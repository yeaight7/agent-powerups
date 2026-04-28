import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import type { InstallTarget } from "../utils/paths.js";

export function runMcpListCommand(service: CatalogService): string {
  const assets = service.listAssets("mcp-config");
  if (assets.length === 0) {
    return "No MCP configs found.";
  }
  return assets.map((asset) => asset.name).join("\n");
}

export async function runMcpPrintCommand(
  service: CatalogService,
  assetName: string,
  target: InstallTarget,
): Promise<string> {
  const asset = service.getAsset(assetName);
  if (asset.type !== "mcp-config") {
    throw new Error(`${assetName} is not an mcp-config asset`);
  }

  const variantPath = asset.targets?.[target] ?? asset.path;
  const fullPath = path.resolve(service.repoRoot, variantPath);
  const content = await fs.readFile(fullPath, "utf8");
  const notes = [
    `config: ${asset.name}`,
    `target: ${target}`,
    `source: ${variantPath}`,
    "safety: this prints a snippet and does not mutate local or global MCP configuration files",
  ];

  if (target === "codex") {
    notes.push("warning: Codex target output is experimental/local and should be reviewed before use.");
  }

  notes.push("warning: replace placeholders such as ${GITHUB_TOKEN} or YOUR_TOKEN_HERE locally and do not commit real tokens.");

  return `${notes.join("\n")}\n\n${content}`;
}
