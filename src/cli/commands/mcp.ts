import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import type { CatalogService } from "../utils/catalog.js";
import { checkRequirements } from "../utils/requirements.js";
import { createResult, type ExecutionResult } from "../utils/result.js";
import type { InstallTarget } from "../utils/paths.js";

const execFileAsync = promisify(execFile);
const START_MARKER = "# BEGIN agent-powerups github-local";
const END_MARKER = "# END agent-powerups github-local";
const JSON_START_MARKER = "__BEGIN_AGENT_POWERUPS_GITHUB_LOCAL__";
const JSON_END_MARKER = "__END_AGENT_POWERUPS_GITHUB_LOCAL__";

export interface McpCheckData {
  name: string;
  target: InstallTarget;
  source: string;
  requiredEnv: Array<{ name: string; set: boolean }>;
  requiredCommands: Array<{ name: string; ok: boolean }>;
  serverPackage?: string;
  warning?: string;
}

export interface McpSmokeData {
  name: string;
  checks: Array<{ name: string; exitCode: number; stdout: string; stderr: string }>;
}

export interface McpInstallData {
  name: string;
  target: InstallTarget;
  destination: string;
  dryRun: boolean;
  modifiedFiles: string[];
  backupFiles: string[];
  skippedFiles: string[];
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
    "safety: this prints config content and does not mutate local or global MCP configuration files",
  ];

  if (target === "codex") {
    notes.push("hint: use `apx mcp install github-local --target codex --dry-run` to preview a managed Codex install.");
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
  const hasGithubToken = Boolean(env.GITHUB_TOKEN || env.GITHUB_PAT);
  const requiredCommands = checkRequirements({ commands: asset.requires?.commands ?? [] })
    .filter((status) => status.label.startsWith("command:"))
    .map((status) => ({ name: status.label.replace("command:", ""), ok: status.ok }));
  const warnings: string[] = [];

  if (asset.name !== "github-local") {
    for (const item of requiredEnv) {
      if (!item.set) {
        warnings.push(`missing env:${item.name}`);
      }
      const value = env[item.name];
      if (value && content.includes(value)) {
        warnings.push(`snippet contains actual env value:${item.name}`);
      }
    }
  }

  if (asset.name === "github-local" && !hasGithubToken) {
    warnings.push("missing env:GITHUB_TOKEN or GITHUB_PAT");
  }

  for (const item of requiredCommands) {
    if (!item.ok) {
      warnings.push(`missing command:${item.name}`);
    }
  }

  if (asset.mcp?.warning) {
    warnings.push(asset.mcp.warning);
  }

  const hardFailures = warnings.filter((warning) => warning.startsWith("missing env:") || warning.startsWith("missing command:"));

  return createResult({
    exitCode: hardFailures.length > 0 ? 1 : 0,
    stdout: `mcp check: ${asset.name} (${target})`,
    warnings,
    actions: [],
    data: {
      name: asset.name,
      target,
      source: variantPath,
      requiredEnv: asset.name === "github-local"
        ? [
            { name: "GITHUB_TOKEN", set: Boolean(env.GITHUB_TOKEN) },
            { name: "GITHUB_PAT", set: Boolean(env.GITHUB_PAT) },
          ]
        : requiredEnv,
      requiredCommands,
      serverPackage: asset.mcp?.server_package,
      warning: asset.mcp?.warning,
    },
  });
}

async function runProcessCheck(
  name: string,
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ name: string; exitCode: number; stdout: string; stderr: string }> {
  const executable = process.platform === "win32" && command === "docker" ? "docker.cmd" : command;
  const launchCommand = process.platform === "win32" && executable.endsWith(".cmd") ? process.env.ComSpec ?? "cmd.exe" : executable;
  const launchArgs = process.platform === "win32" && executable.endsWith(".cmd")
    ? ["/d", "/c", executable, ...args]
    : args;
  try {
    const result = await execFileAsync(launchCommand, launchArgs, {
      env,
      shell: false,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 5,
    });
    return { name, exitCode: 0, stdout: redactSecrets(result.stdout, env), stderr: redactSecrets(result.stderr, env) };
  } catch (error) {
    const maybeError = error as { code?: number; stdout?: string; stderr?: string; message?: string };
    return {
      name,
      exitCode: typeof maybeError.code === "number" ? maybeError.code : 1,
      stdout: redactSecrets(maybeError.stdout ?? "", env),
      stderr: redactSecrets(maybeError.stderr ?? maybeError.message ?? String(error), env),
    };
  }
}

function githubTokenEnv(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.GITHUB_PAT ?? env.GITHUB_TOKEN;
}

function redactSecrets(value: string, env: NodeJS.ProcessEnv = process.env): string {
  const token = githubTokenEnv(env);
  return token ? value.replaceAll(token, "[REDACTED]") : value;
}

export async function runMcpSmokeCommand(
  service: CatalogService,
  assetName: string,
): Promise<ExecutionResult<McpSmokeData>> {
  const asset = service.getAsset(assetName);
  if (asset.type !== "mcp-config") {
    throw new Error(`${assetName} is not an mcp-config asset`);
  }
  if (asset.name !== "github-local") {
    throw new Error("mcp smoke currently supports github-local only");
  }

  const token = githubTokenEnv();
  const checks = [
    await runProcessCheck("docker info", "docker", ["info"]),
    await runProcessCheck(
      "github mcp image launch",
      "docker",
      ["run", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", asset.mcp?.server_package ?? "ghcr.io/github/github-mcp-server", "--help"],
      {
        ...process.env,
        ...(token ? { GITHUB_PERSONAL_ACCESS_TOKEN: token } : {}),
      },
    ),
  ];
  const failures = checks.filter((check) => check.exitCode !== 0);

  return createResult({
    exitCode: failures.length > 0 ? 1 : 0,
    stdout: `mcp smoke: ${asset.name}`,
    stderr: failures.map((check) => `${check.name}: ${check.stderr}`).join("\n"),
    warnings: token ? [] : ["missing env:GITHUB_TOKEN or GITHUB_PAT; launch was tested without a token"],
    actions: [],
    data: {
      name: asset.name,
      checks,
    },
  });
}

function backupPathFor(filePath: string, date = new Date()): string {
  const stamp = date.toISOString().replace(/[-:]/g, "").replace(".", "");
  return `${filePath}.${stamp}.bak`;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function codexBlock(): string {
  return [
    START_MARKER,
    "[mcp_servers.github-local]",
    "command = \"docker\"",
    "args = [\"run\", \"-i\", \"--rm\", \"-e\", \"GITHUB_PERSONAL_ACCESS_TOKEN\", \"ghcr.io/github/github-mcp-server\"]",
    "",
    "[mcp_servers.github-local.env]",
    "GITHUB_PERSONAL_ACCESS_TOKEN = \"${GITHUB_TOKEN}\"",
    END_MARKER,
    "",
  ].join("\n");
}

function mergeMarkedBlock(content: string, block: string): { content: string; changed: boolean } {
  if (content.includes(block)) {
    return { content, changed: false };
  }
  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER);
  if (start !== -1 && end !== -1 && end > start) {
    const next = `${content.slice(0, start)}${block}${content.slice(end + END_MARKER.length + 1)}`;
    return { content: next, changed: next !== content };
  }
  const separator = content.endsWith("\n") ? "\n" : "\n\n";
  return { content: `${content}${separator}${block}`, changed: true };
}

function claudeServerConfig() {
  return {
    command: "docker",
    args: ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_TOKEN}",
      _agentPowerupsStart: JSON_START_MARKER,
      _agentPowerupsEnd: JSON_END_MARKER,
    },
  };
}

function mergeClaudeConfig(content: string): { content: string; changed: boolean } {
  const parsed = content.trim() ? JSON.parse(content) : {};
  const current = parsed.mcpServers?.["github-local"];
  const nextServer = claudeServerConfig();
  if (JSON.stringify(current) === JSON.stringify(nextServer)) {
    return { content, changed: false };
  }
  const next = {
    ...parsed,
    mcpServers: {
      ...(parsed.mcpServers ?? {}),
      "github-local": nextServer,
    },
  };
  return { content: `${JSON.stringify(next, null, 2)}\n`, changed: true };
}

async function writeMergedConfig(
  destination: string,
  dryRun: boolean,
  merge: (content: string) => { content: string; changed: boolean },
): Promise<{ modifiedFiles: string[]; backupFiles: string[]; skippedFiles: string[] }> {
  const exists = await pathExists(destination);
  const current = exists ? await fs.readFile(destination, "utf8") : "";
  const next = merge(current);
  if (!next.changed) {
    return { modifiedFiles: [], backupFiles: [], skippedFiles: [`${destination} (already current)`] };
  }
  const backup = exists ? backupPathFor(destination) : undefined;
  if (!dryRun) {
    await fs.mkdir(path.dirname(destination), { recursive: true });
    if (exists && backup) {
      await fs.copyFile(destination, backup);
    }
    await fs.writeFile(destination, next.content, "utf8");
  }
  return {
    modifiedFiles: [destination],
    backupFiles: backup ? [backup] : [],
    skippedFiles: [],
  };
}

export async function runMcpInstallCommand(
  service: CatalogService,
  assetName: string,
  target: InstallTarget,
  options: { agentRoot?: string; dest?: string; dryRun: boolean; yes: boolean; force: boolean },
): Promise<ExecutionResult<McpInstallData>> {
  const asset = service.getAsset(assetName);
  if (asset.type !== "mcp-config") {
    throw new Error(`${assetName} is not an mcp-config asset`);
  }
  if (asset.name !== "github-local") {
    throw new Error("mcp install currently supports github-local only");
  }

  const dryRun = options.dryRun || !options.yes;
  let destination: string;
  let result: { modifiedFiles: string[]; backupFiles: string[]; skippedFiles: string[] };

  if (target === "codex") {
    const agentRoot = path.resolve(options.agentRoot ?? process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"));
    destination = path.join(agentRoot, "config.toml");
    result = await writeMergedConfig(destination, dryRun, (content) => mergeMarkedBlock(content, codexBlock()));
  } else if (target === "claude-code") {
    const agentRoot = path.resolve(options.agentRoot ?? process.env.CLAUDE_CONFIG_DIR ?? process.env.CLAUDE_HOME ?? process.cwd());
    destination = options.dest ? path.resolve(options.dest) : path.join(agentRoot, ".mcp.json");
    result = await writeMergedConfig(destination, dryRun, mergeClaudeConfig);
  } else {
    if (!options.dest) {
      throw new Error("mcp install --target generic requires --dest");
    }
    destination = path.resolve(options.dest);
    if (!dryRun) {
      await runMcpWriteCommand(service, assetName, target, { dest: options.dest, force: options.force });
    }
    result = {
      modifiedFiles: [destination],
      backupFiles: [],
      skippedFiles: [],
    };
  }

  const data: McpInstallData = {
    name: asset.name,
    target,
    destination,
    dryRun,
    modifiedFiles: result.modifiedFiles,
    backupFiles: result.backupFiles,
    skippedFiles: result.skippedFiles,
  };

  return createResult({
    stdout: dryRun ? `mcp install dry-run: ${asset.name} (${target})` : `mcp install complete: ${asset.name} (${target})`,
    warnings: result.skippedFiles,
    actions: [
      ...result.modifiedFiles.map((file) => `${dryRun ? "would modify" : "modify"} ${file}`),
      ...result.backupFiles.map((file) => `${dryRun ? "would backup" : "backup"} ${file}`),
    ],
    data,
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
