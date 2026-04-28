import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogEntry, CatalogService } from "../utils/catalog.js";
import { copyAsset } from "../utils/copy.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

const PLACEHOLDER_PATTERN = /\b(YOUR_[A-Z0-9_]+|TODO|TBD)\b/i;

export interface PluginValidateData {
  name: string;
  placeholderCount: number;
  checkedPaths: string[];
}

export interface PluginBuildData {
  dest: string;
  dryRun: boolean;
}

async function readJson(filePath: string): Promise<any> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function collectPlaceholders(value: unknown): string[] {
  if (typeof value === "string") {
    return PLACEHOLDER_PATTERN.test(value) ? [value] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectPlaceholders(item));
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => collectPlaceholders(item));
  }
  return [];
}

async function hasFiles(dirPath: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.some((entry) => entry.isFile() || entry.isDirectory());
  } catch {
    return false;
  }
}

function pluginJsonPath(pluginPath: string): string {
  return path.join(pluginPath, ".codex-plugin", "plugin.json");
}

function defaultPluginJson() {
  return {
    name: "agent-powerups",
    version: "0.1.0",
    description: "Local-first Agent Powerups bundle.",
    author: {
      name: "Agent Powerups",
      email: "maintainers@example.invalid",
      url: "https://github.com/yeaight7/agent-powerups",
    },
    homepage: "https://github.com/yeaight7/agent-powerups",
    repository: "https://github.com/yeaight7/agent-powerups",
    license: "MIT",
    keywords: ["codex", "skills", "mcp", "agents-md", "commands"],
    skills: "./skills/",
    commands: "./commands/",
    agentsMd: "./agents-md/",
    hooks: "./hooks/",
    workflows: "./workflows/",
    mcpServers: "./mcp/",
    interface: {
      displayName: "Agent Powerups",
      shortDescription: "Local-first powerups bundle",
      longDescription: "Local Agent Powerups assets for explicit review, validation, and manual installation.",
      developerName: "Agent Powerups",
      category: "Developer Tools",
      capabilities: ["Read"],
      websiteURL: "https://github.com/yeaight7/agent-powerups",
      privacyPolicyURL: "https://github.com/yeaight7/agent-powerups",
      termsOfServiceURL: "https://github.com/yeaight7/agent-powerups",
      defaultPrompt: [
        "List bundled skills.",
        "Run ship-check.",
        "Check the GitHub MCP config.",
      ],
      brandColor: "#2563EB",
    },
  };
}

function copyTargetsForAsset(asset: CatalogEntry): Array<{ source: string; destination: string }> {
  if (asset.targets) {
    return Object.values(asset.targets).map((targetPath) => ({
      source: targetPath,
      destination: targetPath,
    }));
  }
  return [{ source: asset.path, destination: asset.path }];
}

function pluginAssetCopies(service: CatalogService, dest: string): Array<{ source: string; destination: string }> {
  const copyableTypes = new Set(["skill", "command", "mcp-config", "agents-md-template", "hook", "workflow"]);
  return service
    .listAssets()
    .filter((asset) => copyableTypes.has(asset.type))
    .flatMap(copyTargetsForAsset)
    .map((item) => ({
      source: path.resolve(service.repoRoot, item.source),
      destination: path.resolve(dest, item.destination),
    }));
}

export async function runPluginValidateCommand(pluginPathInput: string): Promise<ExecutionResult<PluginValidateData>> {
  const pluginPath = path.resolve(pluginPathInput);
  const pluginJson = await readJson(pluginJsonPath(pluginPath));
  const placeholders = collectPlaceholders(pluginJson);
  if (placeholders.length > 0) {
    throw new Error(`plugin metadata contains placeholder values: ${placeholders.length}`);
  }

  const refs = [
    pluginJson.skills,
    pluginJson.commands,
    pluginJson.agentsMd,
    pluginJson.hooks,
    pluginJson.workflows,
    pluginJson.mcpServers,
  ].filter((value): value is string => typeof value === "string");

  const checkedPaths: string[] = [];
  for (const ref of refs) {
    const fullPath = path.resolve(pluginPath, ref);
    if (!(await hasFiles(fullPath))) {
      throw new Error(`plugin referenced directory is missing or empty: ${ref}`);
    }
    checkedPaths.push(fullPath);
  }

  return createResult({
    stdout: `plugin valid: ${pluginJson.name}`,
    data: {
      name: pluginJson.name,
      placeholderCount: 0,
      checkedPaths,
    },
    warnings: [],
    actions: [],
  });
}

export async function runPluginBuildCommand(
  service: CatalogService,
  options: { dest: string; write: boolean },
): Promise<ExecutionResult<PluginBuildData>> {
  const dest = path.resolve(options.dest);
  const actions: string[] = [];
  const pluginJsonDestination = pluginJsonPath(dest);
  actions.push(`write ${path.relative(dest, pluginJsonDestination).replaceAll("\\", "/")}`);

  for (const copy of pluginAssetCopies(service, dest)) {
    actions.push(`copy ${path.relative(service.repoRoot, copy.source).replaceAll("\\", "/")}`);
  }

  if (options.write) {
    await fs.mkdir(path.dirname(pluginJsonDestination), { recursive: true });
    await fs.writeFile(pluginJsonDestination, `${JSON.stringify(defaultPluginJson(), null, 2)}\n`, "utf8");
    for (const copy of pluginAssetCopies(service, dest)) {
      await fs.rm(copy.destination, { recursive: true, force: true });
      await copyAsset(copy.source, copy.destination);
    }
  }

  return createResult({
    stdout: options.write ? `plugin build complete: ${dest}` : `plugin build dry-run: ${dest}`,
    actions,
    warnings: [],
    data: {
      dest,
      dryRun: !options.write,
    },
  });
}
