import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import { formatKeyValue, formatList } from "../utils/formatting.js";

export async function runInfoCommand(service: CatalogService, assetName: string): Promise<string> {
  const asset = service.getAsset(assetName);
  const sourcePath = path.resolve(service.repoRoot, asset.path);

  const lines: string[] = [
    formatKeyValue([
      ["name", asset.name],
      ["type", asset.type],
      ["maturity", asset.maturity],
      ["path", asset.path],
      ["summary", asset.summary],
      ["compatible_with", asset.compatible_with.join(", ")],
      ["tags", asset.tags.join(", ")],
    ]),
  ];

  if (asset.requires) {
    const requires = [
      ...(asset.requires.commands ?? []).map((value) => `command:${value}`),
      ...(asset.requires.python_packages ?? []).map((value) => `python:${value}`),
      ...(asset.requires.npm_packages ?? []).map((value) => `npm:${value}`),
    ];
    lines.push(`requirements:\n${formatList(requires)}`);
  }

  if (asset.targets) {
    const targets = Object.entries(asset.targets).map(([target, targetPath]) => `${target}:${targetPath}`);
    lines.push(`targets:\n${formatList(targets)}`);
  }

  if (asset.name === "markitdown-file-intake") {
    lines.push("note: uses Microsoft MarkItDown.");
  }

  lines.push(`source: ${sourcePath}`);
  return lines.join("\n\n");
}
