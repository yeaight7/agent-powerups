import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogEntry, CatalogService } from "../utils/catalog.js";
import { copyAsset } from "../utils/copy.js";
import { getPluginPackageVersion } from "../utils/plugins.js";
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

export interface PluginDiffData {
  pluginPath: string;
  diffs: string[];
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

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function pluginJsonPath(pluginPath: string): string {
  return path.join(pluginPath, ".codex-plugin", "plugin.json");
}

function defaultPluginJson(version: string) {
  return {
    name: "agent-powerups",
    version,
    description: "Local-first Agent Powerups bundle.",
    author: {
      name: "Agent Powerups",
      email: "maintainers@example.invalid",
      url: "https://github.com/yeaight7/agent-powerups",
    },
    homepage: "https://github.com/yeaight7/agent-powerups",
    repository: "https://github.com/yeaight7/agent-powerups",
    license: "Apache-2.0",
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

async function compareFiles(source: string, destination: string, label: string, diffs: string[]): Promise<void> {
  if (!(await fileExists(destination))) {
    diffs.push(`missing ${label}`);
    return;
  }
  const [sourceContent, destinationContent] = await Promise.all([fs.readFile(source), fs.readFile(destination)]);
  if (!sourceContent.equals(destinationContent)) {
    diffs.push(`changed ${label}`);
  }
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
  const version = await getPluginPackageVersion(service.repoRoot);
  const actions: string[] = [];
  const pluginJsonDestination = pluginJsonPath(dest);
  actions.push(`write ${path.relative(dest, pluginJsonDestination).replaceAll("\\", "/")}`);

  for (const copy of pluginAssetCopies(service, dest)) {
    actions.push(`copy ${path.relative(service.repoRoot, copy.source).replaceAll("\\", "/")}`);
  }

  if (options.write) {
    await fs.mkdir(path.dirname(pluginJsonDestination), { recursive: true });
    await fs.writeFile(pluginJsonDestination, `${JSON.stringify(defaultPluginJson(version), null, 2)}\n`, "utf8");
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

export async function runPluginDiffCommand(
  service: CatalogService,
  pluginPathInput: string,
): Promise<ExecutionResult<PluginDiffData>> {
  const pluginPath = path.resolve(pluginPathInput);
  const version = await getPluginPackageVersion(service.repoRoot);
  const diffs: string[] = [];
  const expectedPluginJson = `${JSON.stringify(defaultPluginJson(version), null, 2)}\n`;
  const actualPluginJsonPath = pluginJsonPath(pluginPath);

  if (!(await fileExists(actualPluginJsonPath))) {
    diffs.push("missing .codex-plugin/plugin.json");
  } else {
    const actualPluginJson = await fs.readFile(actualPluginJsonPath, "utf8");
    if (actualPluginJson !== expectedPluginJson) {
      diffs.push("changed .codex-plugin/plugin.json");
    }
  }

  for (const copy of pluginAssetCopies(service, pluginPath)) {
    const sourceStats = await fs.stat(copy.source);
    if (sourceStats.isDirectory()) {
      const sourceFiles = await walkFiles(copy.source);
      for (const sourceFile of sourceFiles) {
        const relativeFile = path.relative(copy.source, sourceFile);
        const destinationFile = path.join(copy.destination, relativeFile);
        const label = path.relative(pluginPath, destinationFile).replaceAll("\\", "/");
        await compareFiles(sourceFile, destinationFile, label, diffs);
      }
      continue;
    }

    const label = path.relative(pluginPath, copy.destination).replaceAll("\\", "/");
    await compareFiles(copy.source, copy.destination, label, diffs);
  }

  return createResult({
    exitCode: diffs.length > 0 ? 1 : 0,
    stdout: diffs.length > 0 ? `plugin diff failed: ${diffs.length} difference(s)` : "plugin diff clean",
    warnings: [],
    actions: [],
    data: {
      pluginPath,
      diffs,
    },
  });
}
