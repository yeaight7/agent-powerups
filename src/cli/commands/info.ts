import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogEntry, CatalogService } from "../utils/catalog.js";
import { formatKeyValue, formatList } from "../utils/formatting.js";
import { extractMarkdownSection, fieldAsArray, parseFrontmatter } from "../utils/frontmatter.js";

type DiscoveryMetadata = CatalogEntry & {
  use_when?: string[] | string;
  avoid_when?: string[] | string;
  signals?: string[] | string;
  capabilities?: string[] | string;
};

function arrayFromUnknown(value: unknown): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function uniq(items: string[]): string[] {
  return [...new Set(items.filter((item) => item.length > 0))];
}

function nextActionHint(asset: CatalogEntry, entrypoint: string): string {
  const hasRequires = Boolean(
    (asset.requires?.commands?.length ?? 0) +
      (asset.requires?.python_packages?.length ?? 0) +
      (asset.requires?.npm_packages?.length ?? 0),
  );
  if (asset.type === "mcp-config") {
    return `Run apx mcp check ${asset.name} --target <agent>, then smoke/install only with approval.`;
  }
  if (asset.type === "hook") {
    // return `Print/read this hook; treat it as review-before-use and do not enable automatically.`;
    return `Print/read hook ${asset.name}; treat it as review-before-use and do not enable automatically.`;
  }
  if (hasRequires) {
    return `Read ${entrypoint}; run apx check ${asset.name} only if this workflow needs its external tool.`;
  }
  if (asset.type === "skill") {
    return `Read ${entrypoint} before applying it.`;
  }
  if (asset.type === "command") {
    return `Print/read command ${asset.name} before invoking its workflow.`;
  }
  if (asset.type === "agents-md-template") {
    return `Use agent prompt ${asset.name} only if delegation is available and useful.`;
  }
  return `Inspect ${entrypoint} before use.`;
}

export async function runInfoCommand(service: CatalogService, assetName: string): Promise<string> {
  const asset = service.getAsset(assetName) as DiscoveryMetadata;
  const sourcePath = path.resolve(service.repoRoot, asset.path);

  const lines: string[] = [
    formatKeyValue([
      ["name", asset.name],
      ["type", asset.type],
      ["maturity", asset.maturity],
      ["tier", asset.tier ?? "unclassified"],
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

  // Canonical detail view (SX-03 / D-02): enrich catalog data with the asset's own
  // frontmatter using the same parser discover/inventory rely on, so `info` answers
  // "when should I use it" and "what is the next action" — not just catalog fields.
  const useWhen = arrayFromUnknown(asset.use_when);
  const avoidWhen = arrayFromUnknown(asset.avoid_when);
  const signals = arrayFromUnknown(asset.signals);
  const capabilities = arrayFromUnknown(asset.capabilities);

  const entrypoint = asset.type === "skill" ? path.join(sourcePath, "SKILL.md") : sourcePath;
  try {
    const content = await fs.readFile(entrypoint, "utf8");
    const parsed = parseFrontmatter(content);
    useWhen.push(...fieldAsArray(parsed.fields, "use_when"));
    const whenSection = extractMarkdownSection(parsed.body, "When to Use");
    if (whenSection) {
      useWhen.push(whenSection);
    }
    avoidWhen.push(...fieldAsArray(parsed.fields, "avoid_when"));
    signals.push(...fieldAsArray(parsed.fields, "signals"));
    capabilities.push(...fieldAsArray(parsed.fields, "capabilities"));
  } catch {
    // No readable entrypoint frontmatter (e.g. config files or directories); use catalog metadata only.
  }

  if (useWhen.length > 0) {
    lines.push(`when_to_use:\n${formatList(uniq(useWhen))}`);
  }
  if (avoidWhen.length > 0) {
    lines.push(`avoid_when:\n${formatList(uniq(avoidWhen))}`);
  }
  if (signals.length > 0) {
    lines.push(`signals:\n${formatList(uniq(signals))}`);
  }
  if (capabilities.length > 0) {
    lines.push(`capabilities:\n${formatList(uniq(capabilities))}`);
  }

  lines.push(`source: ${sourcePath}`);
  lines.push(`next_action: ${nextActionHint(asset, entrypoint)}`);
  return lines.join("\n\n");
}
