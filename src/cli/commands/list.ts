import { formatList } from "../utils/formatting.js";
import type { CatalogService } from "../utils/catalog.js";

export function runListCommand(service: CatalogService, type?: string): string {
  const assets = service.listAssets(type);
  if (assets.length === 0) {
    return type ? `No assets found for type '${type}'.` : "No assets found.";
  }

  return formatList(assets.map((asset) => `${asset.name} (${asset.type})`));
}
