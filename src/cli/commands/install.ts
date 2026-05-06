import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import { copyAsset } from "../utils/copy.js";
import { getPluginBundles } from "../utils/plugins.js";
import { defaultInstallDestination, resolveAssetPath, type InstallTarget } from "../utils/paths.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

export interface InstallOptions {
  cwd: string;
  target: InstallTarget;
  dryRun: boolean;
  dest?: string;
}

export interface InstallResult {
  exitCode: number;
  output: string;
}

export type NativeInstallAgent = "codex" | "claude-code" | "gemini";

export interface NativeInstallOptions {
  agent: NativeInstallAgent;
  agentRoot?: string;
  instructionsFile?: string;
  dryRun: boolean;
  full: boolean;
  force: boolean;
}

export interface NativeInstallData {
  agent: NativeInstallAgent;
  agentRoot: string;
  dryRun: boolean;
  full: boolean;
  createdDirectories: string[];
  copiedFiles: string[];
  skippedFiles: string[];
  modifiedFiles: string[];
  backupFiles: string[];
  manualSteps: string[];
}

interface NativeProfile {
  agent: NativeInstallAgent;
  defaultRootEnv: string[];
  defaultRootDir: string;
  instructionFileName: string;
  commandTargetDir?: string;
  mcpTargetDir?: string;
}

const START_MARKER = "<!-- BEGIN agent-powerups -->";
const END_MARKER = "<!-- END agent-powerups -->";

const NATIVE_PROFILES: Record<NativeInstallAgent, NativeProfile> = {
  codex: {
    agent: "codex",
    defaultRootEnv: ["CODEX_HOME"],
    defaultRootDir: path.join(os.homedir(), ".codex"),
    instructionFileName: "AGENTS.md",
    commandTargetDir: "codex",
    mcpTargetDir: "codex",
  },
  "claude-code": {
    agent: "claude-code",
    defaultRootEnv: ["CLAUDE_CONFIG_DIR", "CLAUDE_HOME"],
    defaultRootDir: path.join(os.homedir(), ".claude"),
    instructionFileName: "CLAUDE.md",
    commandTargetDir: "claude-code",
    mcpTargetDir: "claude-code",
  },
  gemini: {
    agent: "gemini",
    defaultRootEnv: ["GEMINI_HOME"],
    defaultRootDir: path.join(os.homedir(), ".gemini"),
    instructionFileName: "GEMINI.md",
  },
};

export function parseNativeInstallAgent(value: string | undefined): NativeInstallAgent | null {
  if (value === "codex" || value === "gemini" || value === "claude-code") {
    return value;
  }
  if (value === "claude") {
    return "claude-code";
  }
  return null;
}

function defaultNativeAgentRoot(profile: NativeProfile): string {
  for (const envName of profile.defaultRootEnv) {
    const value = process.env[envName];
    if (value) {
      return path.resolve(value);
    }
  }
  return profile.defaultRootDir;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(root: string): Promise<string[]> {
  if (!(await pathExists(root))) {
    return [];
  }
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function filesEqual(left: string, right: string): Promise<boolean> {
  try {
    const [leftContent, rightContent] = await Promise.all([fs.readFile(left), fs.readFile(right)]);
    return leftContent.equals(rightContent);
  } catch {
    return false;
  }
}

function addDirectory(createdDirectorySet: Set<string>, directory: string): void {
  createdDirectorySet.add(directory);
}

async function ensureDirectory(
  directory: string,
  dryRun: boolean,
  createdDirectorySet: Set<string>,
): Promise<void> {
  if (await pathExists(directory)) {
    return;
  }
  addDirectory(createdDirectorySet, directory);
  if (!dryRun) {
    await fs.mkdir(directory, { recursive: true });
  }
}

async function copyOneFile(
  source: string,
  dest: string,
  options: { dryRun: boolean; force: boolean; createdDirectorySet: Set<string> },
): Promise<{ copied?: string; skipped?: string }> {
  await ensureDirectory(path.dirname(dest), options.dryRun, options.createdDirectorySet);

  if (!(await pathExists(dest))) {
    if (!options.dryRun) {
      await fs.copyFile(source, dest);
    }
    return { copied: dest };
  }

  if (await filesEqual(source, dest)) {
    return { skipped: `${dest} (already current)` };
  }

  if (!options.force) {
    return { skipped: `${dest} (exists; not overwritten)` };
  }

  if (!options.dryRun) {
    await fs.copyFile(source, dest);
  }
  return { copied: dest };
}

async function copyDirectoryContents(
  sourceDir: string,
  destDir: string,
  options: { dryRun: boolean; force: boolean; createdDirectorySet: Set<string> },
): Promise<{ copiedFiles: string[]; skippedFiles: string[] }> {
  const copiedFiles: string[] = [];
  const skippedFiles: string[] = [];
  for (const sourceFile of await listFiles(sourceDir)) {
    if (path.basename(sourceFile) === ".gitkeep") {
      continue;
    }
    const relative = path.relative(sourceDir, sourceFile);
    const result = await copyOneFile(sourceFile, path.join(destDir, relative), options);
    if (result.copied) copiedFiles.push(result.copied);
    if (result.skipped) skippedFiles.push(result.skipped);
  }
  return { copiedFiles, skippedFiles };
}

async function writeTextFile(
  dest: string,
  content: string,
  options: { dryRun: boolean; force: boolean; createdDirectorySet: Set<string> },
): Promise<{ copied?: string; skipped?: string }> {
  await ensureDirectory(path.dirname(dest), options.dryRun, options.createdDirectorySet);
  if (!(await pathExists(dest))) {
    if (!options.dryRun) {
      await fs.writeFile(dest, content, "utf8");
    }
    return { copied: dest };
  }

  const current = await fs.readFile(dest, "utf8");
  if (current === content) {
    return { skipped: `${dest} (already current)` };
  }

  if (!options.force) {
    return { skipped: `${dest} (exists; not overwritten)` };
  }

  if (!options.dryRun) {
    await fs.writeFile(dest, content, "utf8");
  }
  return { copied: dest };
}

function instructionBlock(agentRoot: string): string {
  const normalizedRoot = agentRoot.replaceAll("\\", "/");
  return [
    START_MARKER,
    "",
    "## Agent Powerups",
    "",
    `Agent Powerups native assets are installed at \`${normalizedRoot}\`.`,
    "",
    "Use these local assets when relevant:",
    "- Skills are installed in `skills/`.",
    "- Plugins are installed in the native provider plugin or extension directory.",
    "- Read `agent-powerups/skills/using-powerups/SKILL.md` before first use when full support assets are staged.",
    "- MCP configs are staged for review only; do not enable MCP servers without explicit approval.",
    "- External tools require user approval before install.",
    "",
    END_MARKER,
  ].join("\n");
}

function replaceInstructionBlock(content: string, block: string): { content: string; changed: boolean } {
  if (content.includes(block)) {
    return { content, changed: false };
  }

  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER);
  if (start !== -1 && end !== -1 && end > start) {
    const nextContent = `${content.slice(0, start)}${block}${content.slice(end + END_MARKER.length)}`;
    return { content: nextContent, changed: nextContent !== content };
  }

  const separator = content.endsWith("\n") ? "\n" : "\n\n";
  return { content: `${content}${separator}${block}\n`, changed: true };
}

function backupPathFor(filePath: string, date = new Date()): string {
  const stamp = date.toISOString().replace(/[-:]/g, "").replace(".", "");
  return `${filePath}.${stamp}.bak`;
}

async function writeGeneratedInstructions(
  agentRoot: string,
  block: string,
  dryRun: boolean,
  force: boolean,
  createdDirectorySet: Set<string>,
): Promise<{ copiedFiles: string[]; skippedFiles: string[] }> {
  const instructionsPath = path.join(agentRoot, "agent-powerups", "instructions", "agent-powerups.md");
  const content = [
    "# Agent Powerups Instructions",
    "",
    "Add the marked block below to your global agent instruction file after review.",
    "",
    block,
    "",
  ].join("\n");
  const result = await writeTextFile(instructionsPath, content, { dryRun, force, createdDirectorySet });
  return {
    copiedFiles: result.copied ? [result.copied] : [],
    skippedFiles: result.skipped ? [result.skipped] : [],
  };
}

async function updateInstructionFile(
  instructionPath: string,
  block: string,
  dryRun: boolean,
): Promise<{ modifiedFiles: string[]; backupFiles: string[]; skippedFiles: string[] }> {
  if (!(await pathExists(instructionPath))) {
    return { modifiedFiles: [], backupFiles: [], skippedFiles: [`${instructionPath} (missing; manual edit required)`] };
  }

  const current = await fs.readFile(instructionPath, "utf8");
  const next = replaceInstructionBlock(current, block);
  if (!next.changed) {
    return { modifiedFiles: [], backupFiles: [], skippedFiles: [`${instructionPath} (agent-powerups block already present)`] };
  }

  const backupPath = backupPathFor(instructionPath);
  if (!dryRun) {
    await fs.copyFile(instructionPath, backupPath);
    await fs.writeFile(instructionPath, next.content, "utf8");
  }

  return { modifiedFiles: [instructionPath], backupFiles: [backupPath], skippedFiles: [] };
}

function geminiExtensionManifest(bundle: any): string {
  return `${JSON.stringify(
    {
      name: bundle.name,
      version: "0.1.0",
      description: bundle.description ?? `Agent Powerups plugin bundle: ${bundle.name}`,
      contextFileName: "GEMINI.md",
    },
    null,
    2,
  )}\n`;
}

async function collectNativePluginInstalls(
  service: CatalogService,
  agentRoot: string,
  profile: NativeProfile,
  options: { dryRun: boolean; force: boolean; createdDirectorySet: Set<string> },
): Promise<{ copiedFiles: string[]; skippedFiles: string[] }> {
  const copiedFiles: string[] = [];
  const skippedFiles: string[] = [];
  const bundles = await getPluginBundles(service.repoRoot);

  for (const bundle of bundles) {
    if (!bundle.name) {
      continue;
    }

    const sourceDir = path.join(service.repoRoot, "plugins", bundle.name);
    const destBase = profile.agent === "gemini" ? path.join(agentRoot, "extensions") : path.join(agentRoot, "plugins");
    const destDir = path.join(destBase, bundle.name);
    const copied = await copyDirectoryContents(sourceDir, destDir, options);
    copiedFiles.push(...copied.copiedFiles);
    skippedFiles.push(...copied.skippedFiles);

    if (profile.agent === "gemini" && !(await pathExists(path.join(sourceDir, "gemini-extension.json")))) {
      const result = await writeTextFile(
        path.join(destDir, "gemini-extension.json"),
        geminiExtensionManifest(bundle),
        options,
      );
      if (result.copied) copiedFiles.push(result.copied);
      if (result.skipped) skippedFiles.push(result.skipped);
    }
  }

  return { copiedFiles, skippedFiles };
}

async function copyFullSupportAssets(
  service: CatalogService,
  agentRoot: string,
  profile: NativeProfile,
  options: { dryRun: boolean; force: boolean; createdDirectorySet: Set<string> },
): Promise<{ copiedFiles: string[]; skippedFiles: string[] }> {
  const installRoot = path.join(agentRoot, "agent-powerups");
  const directories = [
    { source: path.join(service.repoRoot, "skills"), dest: path.join(installRoot, "skills") },
    { source: path.join(service.repoRoot, "plugins"), dest: path.join(installRoot, "plugins") },
    { source: path.join(service.repoRoot, "agents-md"), dest: path.join(installRoot, "agents-md") },
    { source: path.join(service.repoRoot, "hooks"), dest: path.join(installRoot, "hooks") },
    { source: path.join(service.repoRoot, "workflows"), dest: path.join(installRoot, "workflows") },
    { source: path.join(service.repoRoot, "commands", "generic"), dest: path.join(installRoot, "commands", "generic") },
    { source: path.join(service.repoRoot, "mcp", "generic"), dest: path.join(installRoot, "mcp", "generic") },
    { source: path.join(service.repoRoot, "docs", "setup"), dest: path.join(installRoot, "docs", "setup") },
  ];

  if (profile.commandTargetDir) {
    directories.push({
      source: path.join(service.repoRoot, "commands", profile.commandTargetDir),
      dest: path.join(installRoot, "commands", profile.commandTargetDir),
    });
  }
  if (profile.mcpTargetDir) {
    directories.push({
      source: path.join(service.repoRoot, "mcp", profile.mcpTargetDir),
      dest: path.join(installRoot, "mcp", profile.mcpTargetDir),
    });
  }

  const copiedFiles: string[] = [];
  const skippedFiles: string[] = [];
  for (const directory of directories) {
    const copied = await copyDirectoryContents(directory.source, directory.dest, options);
    copiedFiles.push(...copied.copiedFiles);
    skippedFiles.push(...copied.skippedFiles);
  }
  return { copiedFiles, skippedFiles };
}

function formatNativeInstallOutput(data: NativeInstallData): string {
  const lines = [
    data.dryRun
      ? `native install dry-run${data.full ? " [full]" : ""}: ${data.agent}`
      : `native install complete${data.full ? " [full]" : ""}: ${data.agent}`,
    `agent root: ${data.agentRoot}`,
  ];
  const sections: Array<[string, string[]]> = [
    ["created directories", data.createdDirectories],
    ["copied files", data.copiedFiles],
    ["skipped files", data.skippedFiles],
    ["modified files", data.modifiedFiles],
    ["backup files", data.backupFiles],
    ["manual steps still required", data.manualSteps],
  ];

  for (const [label, values] of sections) {
    lines.push(`${label}: ${values.length}`);
    for (const value of values) {
      lines.push(`  - ${value}`);
    }
  }

  if (data.dryRun) {
    lines.push("safety: dry-run only; no files were changed");
  } else {
    lines.push("safety: no external tools, shell profiles, secrets, or MCP servers were installed or enabled");
  }

  return lines.join("\n");
}

export async function runInstallCommand(
  service: CatalogService,
  assetName: string,
  options: InstallOptions,
): Promise<InstallResult> {
  const asset = service.getAsset(assetName);
  const sourcePath = resolveAssetPath(service.repoRoot, asset.path);
  const destinationPath = path.resolve(options.dest ?? defaultInstallDestination(options.cwd, assetName));

  if (options.dryRun || !options.dest) {
    return {
      exitCode: 0,
      output: [
        "dry-run: no files were changed",
        `asset: ${asset.name}`,
        `target: ${options.target}`,
        `source: ${sourcePath}`,
        `destination: ${destinationPath}`,
        `would copy: ${asset.path}`,
        "safety: global config, MCP files, shell profiles, and home-directory agent configs are not mutated",
      ].join("\n"),
    };
  }

  await copyAsset(sourcePath, destinationPath);
  return {
    exitCode: 0,
    output: [
      "copy complete",
      `asset: ${asset.name}`,
      `target: ${options.target}`,
      `destination: ${destinationPath}`,
      "safety: only explicit destination was written",
    ].join("\n"),
  };
}

export async function runNativeInstallCommand(
  service: CatalogService,
  options: NativeInstallOptions,
): Promise<ExecutionResult<NativeInstallData>> {
  const profile = NATIVE_PROFILES[options.agent];
  const agentRoot = path.resolve(options.agentRoot ?? defaultNativeAgentRoot(profile));
  const createdDirectorySet = new Set<string>();
  const copiedFiles: string[] = [];
  const skippedFiles: string[] = [];
  const modifiedFiles: string[] = [];
  const backupFiles: string[] = [];

  await ensureDirectory(agentRoot, options.dryRun, createdDirectorySet);
  await ensureDirectory(path.join(agentRoot, "skills"), options.dryRun, createdDirectorySet);
  await ensureDirectory(
    options.agent === "gemini" ? path.join(agentRoot, "extensions") : path.join(agentRoot, "plugins"),
    options.dryRun,
    createdDirectorySet,
  );

  const copyOptions = {
    dryRun: options.dryRun,
    force: options.force,
    createdDirectorySet,
  };

  const skills = await copyDirectoryContents(path.join(service.repoRoot, "skills"), path.join(agentRoot, "skills"), copyOptions);
  copiedFiles.push(...skills.copiedFiles);
  skippedFiles.push(...skills.skippedFiles);

  const plugins = await collectNativePluginInstalls(service, agentRoot, profile, copyOptions);
  copiedFiles.push(...plugins.copiedFiles);
  skippedFiles.push(...plugins.skippedFiles);

  if (options.full) {
    const block = instructionBlock(agentRoot);
    const generatedInstructions = await writeGeneratedInstructions(agentRoot, block, options.dryRun, options.force, createdDirectorySet);
    copiedFiles.push(...generatedInstructions.copiedFiles);
    skippedFiles.push(...generatedInstructions.skippedFiles);

    const support = await copyFullSupportAssets(service, agentRoot, profile, copyOptions);
    copiedFiles.push(...support.copiedFiles);
    skippedFiles.push(...support.skippedFiles);

    const candidateInstructionFile = path.join(agentRoot, profile.instructionFileName);
    const instructionFile = path.resolve(options.instructionsFile ?? candidateInstructionFile);
    const instructionUpdate = await updateInstructionFile(instructionFile, block, options.dryRun);
    modifiedFiles.push(...instructionUpdate.modifiedFiles);
    backupFiles.push(...instructionUpdate.backupFiles);
    skippedFiles.push(...instructionUpdate.skippedFiles);
  }

  const manualSteps = [];
  if (options.full) {
    manualSteps.push(`Review ${path.join(agentRoot, "agent-powerups", "instructions", "agent-powerups.md")}.`);
    manualSteps.push("Review staged MCP snippets before enabling any MCP server.");
  }
  manualSteps.push("Set required secrets such as GITHUB_TOKEN in your shell/session only; do not write secrets into copied snippets.");

  const data: NativeInstallData = {
    agent: options.agent,
    agentRoot,
    dryRun: options.dryRun,
    full: options.full,
    createdDirectories: [...createdDirectorySet],
    copiedFiles,
    skippedFiles,
    modifiedFiles,
    backupFiles,
    manualSteps,
  };

  return createResult({
    stdout: formatNativeInstallOutput(data),
    warnings: skippedFiles.filter((item) => item.includes("not overwritten") || item.includes("manual edit")),
    actions: [
      ...data.createdDirectories.map((item) => `mkdir ${item}`),
      ...data.copiedFiles.map((item) => `copy ${item}`),
      ...data.modifiedFiles.map((item) => `modify ${item}`),
      ...data.backupFiles.map((item) => `backup ${item}`),
    ],
    data,
  });
}
