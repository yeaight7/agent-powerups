import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

export type SetupAgent = "codex" | "claude-code" | "gemini";
export type SetupMode = "minimal" | "recommended" | "full";

export interface SetupData {
  agent: SetupAgent;
  agentRoot: string;
  dryRun: boolean;
  createdDirectories: string[];
  copiedFiles: string[];
  skippedFiles: string[];
  modifiedFiles: string[];
  backupFiles: string[];
  manualSteps: string[];
}

export interface SetupOptions {
  agent: SetupAgent;
  agentRoot?: string;
  instructionsFile?: string;
  dryRun: boolean;
  yes: boolean;
  mode?: SetupMode;
}

interface AgentProfile {
  agent: SetupAgent;
  displayName: string;
  defaultRootEnv: string[];
  defaultRootDir: string;
  instructionFileName: string;
  commandTargetDir?: string;
  mcpTargetDir?: string;
}

function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}

const START_MARKER = "<!-- BEGIN agent-powerups -->";
const END_MARKER = "<!-- END agent-powerups -->";

const PROFILES: Record<SetupAgent, AgentProfile> = {
  codex: {
    agent: "codex",
    displayName: "Codex",
    defaultRootEnv: ["CODEX_HOME"],
    defaultRootDir: path.join(os.homedir(), ".codex"),
    instructionFileName: "AGENTS.md",
    commandTargetDir: "codex",
    mcpTargetDir: "codex",
  },
  "claude-code": {
    agent: "claude-code",
    displayName: "Claude Code",
    defaultRootEnv: ["CLAUDE_CONFIG_DIR", "CLAUDE_HOME"],
    defaultRootDir: path.join(os.homedir(), ".claude"),
    instructionFileName: "CLAUDE.md",
    commandTargetDir: "claude-code",
    mcpTargetDir: "claude-code",
  },
  gemini: {
    agent: "gemini",
    displayName: "Gemini",
    defaultRootEnv: ["GEMINI_HOME"],
    defaultRootDir: path.join(os.homedir(), ".gemini"),
    instructionFileName: "GEMINI.md",
  },
};

const MINIMAL_SKILLS = [
  "using-powerups",
  "no-fluff",
  "repo-map",
  "writing-plans",
  "verification-before-completion",
  "search-before-building",
] as const;

const MINIMAL_COMMANDS_GENERIC = ["ship-check.md", "using-powerups.md"] as const;

const RECOMMENDED_PLUGIN_BUNDLES = ["dev-vitals", "debugging-diagnostics", "quality-gates"] as const;

export const SETUP_LEGACY_WARNING =
  "warning: apx setup is legacy compatibility; prefer apx install <agent> for manual native install. Use setup only for agent-curated minimal/recommended/full staging.";

function isSetupAgent(value: string | undefined): value is SetupAgent {
  return value === "codex" || value === "claude-code" || value === "gemini";
}

export function parseSetupAgent(value: string | undefined): SetupAgent {
  if (!isSetupAgent(value)) {
    throw new Error("Missing or invalid setup target. Expected one of: codex, claude-code, gemini");
  }
  return value;
}

export function parseSetupMode(value: string | undefined): SetupMode {
  if (value === "minimal" || value === "recommended" || value === "full") {
    return value;
  }
  if (value !== undefined) {
    throw new Error(`Invalid --mode value '${value}'. Expected one of: minimal, recommended, full`);
  }
  return "minimal";
}

function defaultAgentRoot(profile: AgentProfile): string {
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

function setupInstructionBlock(profile: AgentProfile, installRoot: string, mode: SetupMode): string {
  const normalizedRoot = installRoot.replaceAll("\\", "/");

  if (mode === "minimal") {
    return [
      START_MARKER,
      "",
      "## Agent Powerups",
      "",
      `Agent Powerups assets are installed at \`${normalizedRoot}\`.`,
      "",
      "Use these local assets when relevant:",
      "- Read `agent-powerups/skills/using-powerups/SKILL.md` before first use.",
      "- Use `apx` commands to discover, inspect, validate, and extend setup. Do not manually edit config files without running `apx` first.",
      "- MCP servers require explicit user approval. Run `apx mcp check` and `apx mcp smoke` before enabling any MCP server.",
      "- External tools require user approval before install.",
      "",
      `This is a minimal (bootstrap) setup. To get a recommended agent environment:`,
      `  apx setup ${profile.agent} --mode recommended --yes`,
      "",
      END_MARKER,
    ].join("\n");
  }

  if (mode === "recommended") {
    return [
      START_MARKER,
      "",
      "## Agent Powerups",
      "",
      `Agent Powerups assets are installed at \`${normalizedRoot}\`.`,
      "",
      "Use these local assets when relevant:",
      "- Read `agent-powerups/skills/using-powerups/SKILL.md` before first use.",
      "- Use `apx` commands to discover, inspect, validate, and extend setup. Do not manually edit config files without running `apx` first.",
      "- Skills are at `agent-powerups/skills/`. Plugin bundles are at `agent-powerups/plugins/`.",
      "- Run `apx profiles list` to see curated skill sets for specific workflows.",
      "- Treat hooks in `agent-powerups/hooks/` as review-before-use recipes, not active hooks.",
      "- MCP servers require explicit user approval. Run `apx mcp check` and `apx mcp smoke` before enabling any MCP server.",
      "- External tools require user approval before install.",
      "",
      END_MARKER,
    ].join("\n");
  }

  if (mode === "full") {
    return [
      START_MARKER,
      "",
      "## Agent Powerups",
      "",
      `Agent Powerups assets are installed at \`${normalizedRoot}\`.`,
      "",
      "Use these local assets when relevant:",
      "- Read `agent-powerups/skills/using-powerups/SKILL.md` before first use.",
      "- Use `apx` commands to discover, inspect, validate, and extend setup. Do not manually edit config files without running `apx` first.",
      "- Skills are at `agent-powerups/skills/`. Plugin bundles are at `agent-powerups/plugins/`.",
      "- Run `apx profiles list` to see curated skill sets for specific workflows.",
      "- Treat hooks in `agent-powerups/hooks/` as review-before-use recipes, not active hooks.",
      "- MCP configs are staged at `agent-powerups/mcp/` but NOT enabled. Run `apx mcp check` and `apx mcp smoke` before enabling any MCP server.",
      "- External tools require user approval before install.",
      "",
      END_MARKER,
    ].join("\n");
  }

  return assertNever(mode);
}

function backupPathFor(filePath: string, date = new Date()): string {
  const stamp = date.toISOString().replace(/[-:]/g, "").replace(".", "");
  return `${filePath}.${stamp}.bak`;
}

function replaceInstructionBlock(content: string, block: string): { content: string; changed: boolean; alreadyPresent: boolean } {
  if (content.includes(block)) {
    return { content, changed: false, alreadyPresent: true };
  }

  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER);
  if (start !== -1 && end !== -1 && end > start) {
    const nextContent = `${content.slice(0, start)}${block}${content.slice(end + END_MARKER.length)}`;
    return { content: nextContent, changed: nextContent !== content, alreadyPresent: false };
  }

  const separator = content.endsWith("\n") ? "\n" : "\n\n";
  return { content: `${content}${separator}${block}\n`, changed: true, alreadyPresent: false };
}

async function collectCopyPairs(service: CatalogService, agentRoot: string, profile: AgentProfile): Promise<Array<{ source: string; dest: string }>> {
  const installRoot = path.join(agentRoot, "agent-powerups");
  const directories = [
    { source: path.join(service.repoRoot, "skills"), dest: path.join(installRoot, "skills") },
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

  const pairs: Array<{ source: string; dest: string }> = [];
  for (const directory of directories) {
    for (const sourceFile of await listFiles(directory.source)) {
      if (path.basename(sourceFile) === ".gitkeep") {
        continue;
      }
      const relative = path.relative(directory.source, sourceFile);
      pairs.push({ source: sourceFile, dest: path.join(directory.dest, relative) });
    }
  }

  return pairs;
}

async function collectMinimalCopyPairs(
  service: CatalogService,
  agentRoot: string,
  profile: AgentProfile,
): Promise<{ pairs: Array<{ source: string; dest: string }>; warnings: string[] }> {
  const installRoot = path.join(agentRoot, "agent-powerups");
  const pairs: Array<{ source: string; dest: string }> = [];
  const warnings: string[] = [];

  // Minimal skills
  for (const skillName of MINIMAL_SKILLS) {
    const skillDir = path.join(service.repoRoot, "skills", skillName);
    const destDir = path.join(installRoot, "skills", skillName);
    const files = await listFiles(skillDir);
    const validFiles = files.filter((f) => path.basename(f) !== ".gitkeep");
    if (validFiles.length === 0) {
      warnings.push(`skills/${skillName} (directory not found in repo; skipped)`);
    }
    for (const sourceFile of validFiles) {
      const relative = path.relative(skillDir, sourceFile);
      pairs.push({ source: sourceFile, dest: path.join(destDir, relative) });
    }
  }

  // Generic commands
  for (const commandFile of MINIMAL_COMMANDS_GENERIC) {
    const sourceFile = path.join(service.repoRoot, "commands", "generic", commandFile);
    if (await pathExists(sourceFile)) {
      pairs.push({ source: sourceFile, dest: path.join(installRoot, "commands", "generic", commandFile) });
    }
  }

  // Agent-specific commands (same filenames, different target dir)
  if (profile.commandTargetDir) {
    for (const commandFile of MINIMAL_COMMANDS_GENERIC) {
      const sourceFile = path.join(service.repoRoot, "commands", profile.commandTargetDir, commandFile);
      if (await pathExists(sourceFile)) {
        pairs.push({ source: sourceFile, dest: path.join(installRoot, "commands", profile.commandTargetDir, commandFile) });
      }
    }
  }

  return { pairs, warnings };
}

async function collectRecommendedCopyPairs(
  service: CatalogService,
  agentRoot: string,
  profile: AgentProfile,
): Promise<{ pairs: Array<{ source: string; dest: string }>; warnings: string[] }> {
  const installRoot = path.join(agentRoot, "agent-powerups");
  const minimal = await collectMinimalCopyPairs(service, agentRoot, profile);
  const pairs = minimal.pairs;
  const warnings = minimal.warnings;

  // Plugin bundles
  for (const bundle of RECOMMENDED_PLUGIN_BUNDLES) {
    const bundleDir = path.join(service.repoRoot, "plugins", bundle);
    const destDir = path.join(installRoot, "plugins", bundle);
    const files = await listFiles(bundleDir);
    const validFiles = files.filter((f) => path.basename(f) !== ".gitkeep");
    if (validFiles.length === 0) {
      warnings.push(`plugins/${bundle} (directory not found in repo; skipped)`);
    }
    for (const sourceFile of validFiles) {
      const relative = path.relative(bundleDir, sourceFile);
      pairs.push({ source: sourceFile, dest: path.join(destDir, relative) });
    }
  }

  return { pairs, warnings };
}

async function copyPlannedFiles(
  pairs: Array<{ source: string; dest: string }>,
  dryRun: boolean,
): Promise<{ copiedFiles: string[]; skippedFiles: string[]; createdDirectories: string[] }> {
  const copiedFiles: string[] = [];
  const skippedFiles: string[] = [];
  const createdDirectorySet = new Set<string>();

  for (const pair of pairs) {
    const destDir = path.dirname(pair.dest);
    if (!(await pathExists(destDir))) {
      createdDirectorySet.add(destDir);
      if (!dryRun) {
        await fs.mkdir(destDir, { recursive: true });
      }
    }

    if (!(await pathExists(pair.dest))) {
      copiedFiles.push(pair.dest);
      if (!dryRun) {
        await fs.copyFile(pair.source, pair.dest);
      }
      continue;
    }

    if (await filesEqual(pair.source, pair.dest)) {
      skippedFiles.push(`${pair.dest} (already current)`);
      continue;
    }

    skippedFiles.push(`${pair.dest} (exists; not overwritten)`);
  }

  return {
    copiedFiles,
    skippedFiles,
    createdDirectories: [...createdDirectorySet],
  };
}

async function writeGeneratedInstructions(
  profile: AgentProfile,
  agentRoot: string,
  block: string,
  dryRun: boolean,
): Promise<{ copiedFiles: string[]; skippedFiles: string[]; createdDirectories: string[] }> {
  const instructionsDir = path.join(agentRoot, "agent-powerups", "instructions");
  const instructionsPath = path.join(instructionsDir, "agent-powerups.md");
  const content = [
    `# Agent Powerups Instructions for ${profile.displayName}`,
    "",
    "Add the marked block below to your global agent instruction file after review.",
    "",
    block,
    "",
  ].join("\n");

  const createdDirectories: string[] = [];
  if (!(await pathExists(instructionsDir))) {
    createdDirectories.push(instructionsDir);
    if (!dryRun) {
      await fs.mkdir(instructionsDir, { recursive: true });
    }
  }

  if (!(await pathExists(instructionsPath))) {
    if (!dryRun) {
      await fs.writeFile(instructionsPath, content, "utf8");
    }
    return { copiedFiles: [instructionsPath], skippedFiles: [], createdDirectories };
  }

  const existing = await fs.readFile(instructionsPath, "utf8");
  if (existing === content) {
    return { copiedFiles: [], skippedFiles: [`${instructionsPath} (already current)`], createdDirectories };
  }

  return { copiedFiles: [], skippedFiles: [`${instructionsPath} (exists; not overwritten)`], createdDirectories };
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

function formatSetupOutput(data: SetupData, mode: SetupMode): string {
  const lines = [
    SETUP_LEGACY_WARNING,
    data.dryRun ? `setup dry-run [mode: ${mode}]: ${data.agent}` : `setup complete [mode: ${mode}]: ${data.agent}`,
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
    lines.push("");
    lines.push("Available modes:");
    lines.push(`  apx setup ${data.agent} --mode minimal --yes     # bootstrap awareness only (6 skills + 2 commands)`);
    lines.push(`  apx setup ${data.agent} --mode recommended --yes # main agent setup (minimal + dev-loop plugins)`);
    lines.push(`  apx setup ${data.agent} --mode full --yes        # broad staging (all assets)`);
  } else {
    lines.push("safety: setup only wrote under the selected agent root and backed up existing instruction files before editing");
    if (mode === "minimal") {
      lines.push(`Note: Minimal (bootstrap) setup only. For recommended agent environment: \`apx setup ${data.agent} --mode recommended --yes\``);
    } else if (mode === "recommended") {
      lines.push(`Recommended setup applied. To extend: \`apx setup ${data.agent} --mode full --yes\``);
    } else if (mode === "full") {
      lines.push("Full setup staged. MCP configs require explicit approval before enabling.");
    } else {
      assertNever(mode);
    }
  }

  return lines.join("\n");
}

export async function runSetupCommand(
  service: CatalogService,
  options: SetupOptions,
): Promise<ExecutionResult<SetupData>> {
  if (options.dryRun && options.yes) {
    throw new Error("cannot combine --dry-run and --yes");
  }

  const mode: SetupMode = options.mode ?? "minimal";
  const profile = PROFILES[options.agent];
  const dryRun = options.dryRun || !options.yes;
  const agentRoot = path.resolve(options.agentRoot ?? defaultAgentRoot(profile));
  const installRoot = path.join(agentRoot, "agent-powerups");
  const block = setupInstructionBlock(profile, installRoot, mode);
  const candidateInstructionFile = path.join(agentRoot, profile.instructionFileName);
  const instructionFile = path.resolve(options.instructionsFile ?? candidateInstructionFile);

  // Only create directories relevant to the selected mode
  const rootDirectories: string[] = [agentRoot, installRoot, path.join(installRoot, "skills"), path.join(installRoot, "commands"), path.join(installRoot, "instructions")];

  if (mode === "full") {
    rootDirectories.push(
      path.join(installRoot, "mcp"),
      path.join(installRoot, "agents-md"),
      path.join(installRoot, "hooks"),
      path.join(installRoot, "workflows"),
    );
  } else if (mode === "recommended") {
    rootDirectories.push(path.join(installRoot, "plugins"));
  }

  const createdDirectorySet = new Set<string>();
  for (const directory of rootDirectories) {
    if (!(await pathExists(directory))) {
      createdDirectorySet.add(directory);
      if (!dryRun) {
        await fs.mkdir(directory, { recursive: true });
      }
    }
  }

  const copiedFiles: string[] = [];
  const skippedFiles: string[] = [];
  const modifiedFiles: string[] = [];
  const backupFiles: string[] = [];

  let copyPairs: Array<{ source: string; dest: string }>;
  if (mode === "minimal") {
    const result = await collectMinimalCopyPairs(service, agentRoot, profile);
    copyPairs = result.pairs;
    skippedFiles.push(...result.warnings);
  } else if (mode === "recommended") {
    const result = await collectRecommendedCopyPairs(service, agentRoot, profile);
    copyPairs = result.pairs;
    skippedFiles.push(...result.warnings);
  } else if (mode === "full") {
    copyPairs = await collectCopyPairs(service, agentRoot, profile);
  } else {
    return assertNever(mode);
  }

  const copies = await copyPlannedFiles(copyPairs, dryRun);
  for (const directory of copies.createdDirectories) {
    createdDirectorySet.add(directory);
  }
  copiedFiles.push(...copies.copiedFiles);
  skippedFiles.push(...copies.skippedFiles);

  const generatedInstructions = await writeGeneratedInstructions(profile, agentRoot, block, dryRun);
  for (const directory of generatedInstructions.createdDirectories) {
    createdDirectorySet.add(directory);
  }
  copiedFiles.push(...generatedInstructions.copiedFiles);
  skippedFiles.push(...generatedInstructions.skippedFiles);

  const instructionUpdate = await updateInstructionFile(instructionFile, block, dryRun);
  modifiedFiles.push(...instructionUpdate.modifiedFiles);
  backupFiles.push(...instructionUpdate.backupFiles);
  skippedFiles.push(...instructionUpdate.skippedFiles);

  const manualSteps = [
    `Review ${path.join(installRoot, "instructions", "agent-powerups.md")}.`,
    `Ensure the marked agent-powerups block is present in ${instructionFile}.`,
  ];

  if (mode === "full") {
    manualSteps.push(
      `Review MCP snippets under ${path.join(installRoot, "mcp")} before enabling any MCP server.`,
    );
  }

  manualSteps.push("Set required secrets such as GITHUB_TOKEN in your shell/session only; do not write secrets into copied snippets.");

  const data: SetupData = {
    agent: options.agent,
    agentRoot,
    dryRun,
    createdDirectories: [...createdDirectorySet],
    copiedFiles,
    skippedFiles,
    modifiedFiles,
    backupFiles,
    manualSteps,
  };

  return createResult({
    stdout: formatSetupOutput(data, mode),
    warnings: [
      SETUP_LEGACY_WARNING,
      ...skippedFiles.filter((item) => item.includes("not overwritten") || item.includes("manual edit")),
    ],
    actions: [
      ...data.createdDirectories.map((item) => `mkdir ${item}`),
      ...data.copiedFiles.map((item) => `copy ${item}`),
      ...data.modifiedFiles.map((item) => `modify ${item}`),
      ...data.backupFiles.map((item) => `backup ${item}`),
    ],
    data,
  });
}
