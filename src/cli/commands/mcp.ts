import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import { checkRequirements } from "../utils/requirements.js";
import { createResult, type ExecutionResult } from "../utils/result.js";
import type { InstallTarget } from "../utils/paths.js";

export interface McpCheckData {
  name: string;
  target: InstallTarget;
  source: string;
  requiredEnv: Array<{ name: string; set: boolean }>;
  requiredCommands: Array<{ name: string; ok: boolean }>;
  serverPackage?: string;
  warning?: string;
}

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

  if (asset.mcp?.warning) {
    notes.push(`warning: ${asset.mcp.warning}`);
  }

  notes.push("warning: replace placeholders such as ${GITHUB_TOKEN} or YOUR_TOKEN_HERE locally and do not commit real tokens.");

  return `${notes.join("\n")}\n\n${content}`;
}

function mcpTargetPath(service: CatalogService, assetName: string, target: InstallTarget): string {
  const asset = service.getAsset(assetName);
  if (asset.type !== "mcp-config") {
    throw new Error(`${assetName} is not an mcp-config asset`);
  }
  return asset.targets?.[target] ?? asset.path;
}

export async function runMcpCheckCommand(
  service: CatalogService,
  assetName: string,
  target: InstallTarget,
  env: NodeJS.ProcessEnv = process.env,
): Promise<ExecutionResult<McpCheckData>> {
  const asset = service.getAsset(assetName);
  if (asset.type !== "mcp-config") {
    throw new Error(`${assetName} is not an mcp-config asset`);
  }

  const variantPath = mcpTargetPath(service, assetName, target);
  const fullPath = path.resolve(service.repoRoot, variantPath);
  const content = await fs.readFile(fullPath, "utf8");
  const requiredEnv = (asset.mcp?.required_env ?? []).map((name) => ({ name, set: Boolean(env[name]) }));
  const requiredCommands = checkRequirements({ commands: asset.requires?.commands ?? [] })
    .filter((status) => status.label.startsWith("command:"))
    .map((status) => ({ name: status.label.replace("command:", ""), ok: status.ok }));
  const warnings: string[] = [];

  for (const item of requiredEnv) {
    if (!item.set) {
      warnings.push(`missing env:${item.name}`);
    }
    const value = env[item.name];
    if (value && content.includes(value)) {
      warnings.push(`snippet contains actual env value:${item.name}`);
    }
  }

  for (const item of requiredCommands) {
    if (!item.ok) {
      warnings.push(`missing command:${item.name}`);
    }
  }

  if (asset.mcp?.warning) {
    warnings.push(asset.mcp.warning);
  }

  return createResult({
    stdout: `mcp check: ${asset.name} (${target})`,
    warnings,
    actions: [],
    data: {
      name: asset.name,
      target,
      source: variantPath,
      requiredEnv,
      requiredCommands,
      serverPackage: asset.mcp?.server_package,
      warning: asset.mcp?.warning,
    },
  });
}

export async function runMcpWriteCommand(
  service: CatalogService,
  assetName: string,
  target: InstallTarget,
  options: { dest: string; force: boolean },
): Promise<ExecutionResult<{ destination: string; source: string }>> {
  const variantPath = mcpTargetPath(service, assetName, target);
  const fullPath = path.resolve(service.repoRoot, variantPath);
  const destination = path.resolve(options.dest);

  try {
    await fs.access(destination);
    if (!options.force) {
      throw new Error(`Destination already exists: ${destination}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Destination already exists:")) {
      throw error;
    }
  }

  const content = await fs.readFile(fullPath, "utf8");
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, content, "utf8");

  return createResult({
    stdout: `mcp write complete: ${destination}`,
    warnings: [],
    actions: [`write ${destination}`],
    data: {
      destination,
      source: variantPath,
    },
  });
}
