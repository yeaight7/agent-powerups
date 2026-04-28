import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import type { InstallTarget } from "../utils/paths.js";

export function runTypedAssetListCommand(service: CatalogService, type: string, emptyLabel: string): string {
  const assets = service.listAssets(type);
  if (assets.length === 0) {
    return `No ${emptyLabel} found.`;
  }
  return assets.map((asset) => asset.name).join("\n");
}

export async function runTypedAssetPrintCommand(
  service: CatalogService,
  assetName: string,
  type: string,
  label: string,
  safetyNote: string,
  target?: InstallTarget,
): Promise<string> {
  const asset = service.getAsset(assetName);
  if (asset.type !== type) {
    throw new Error(`${assetName} is not a ${type} asset`);
  }

  const variantPath = target ? (asset.targets?.[target] ?? asset.targets?.generic ?? asset.path) : asset.path;
  const fullPath = path.resolve(service.repoRoot, variantPath);
  const content = await fs.readFile(fullPath, "utf8");
  const lines = [`${label}: ${asset.name}`];

  if (target) {
    lines.push(`target: ${target}`);
  }

  lines.push(`source: ${variantPath}`, `safety: ${safetyNote}`);
  return `${lines.join("\n")}\n\n${content}`;
}
