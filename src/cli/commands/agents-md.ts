import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";

export function runAgentsMdListCommand(service: CatalogService): string {
  const assets = service.listAssets("agents-md-template");
  if (assets.length === 0) {
    return "No AGENTS.md templates found.";
  }
  return assets.map((asset) => asset.name).join("\n");
}

export async function runAgentsMdPrintCommand(service: CatalogService, assetName: string): Promise<string> {
  const asset = service.getAsset(assetName);
  if (asset.type !== "agents-md-template") {
    throw new Error(`${assetName} is not an agents-md-template asset`);
  }

  const fullPath = path.resolve(service.repoRoot, asset.path);
  const content = await fs.readFile(fullPath, "utf8");
  return `template: ${asset.name}\nsource: ${asset.path}\n\n${content}`;
}
