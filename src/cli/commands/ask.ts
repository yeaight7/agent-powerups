import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { parseOption } from "../utils/args.js";
import type { CatalogService } from "../utils/catalog.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

const execFileAsync = promisify(execFile);

const PROVIDERS = {
  claude: {
    assetName: "ask-claude",
    command: "claude",
    displayName: "Claude",
  },
  gemini: {
    assetName: "ask-gemini",
    command: "gemini",
    displayName: "Gemini",
  },
} as const;

type AskProvider = keyof typeof PROVIDERS;

export interface AskData {
  provider: AskProvider;
  artifactPath: string;
  promptLength: number;
  exitCode: number;
}

function isAskProvider(value: string): value is AskProvider {
  return value === "claude" || value === "gemini";
}

function parsePrompt(argv: string[]): string {
  const parts: string[] = [];
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--artifact-dir") {
      index += 1;
      continue;
    }
    if (arg === "--json") {
      continue;
    }
    parts.push(arg);
  }
  return parts.join(" ").trim();
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return slug || "prompt";
}

function artifactTimestamp(date = new Date()): string {
  return date.toISOString().replace(/[-:]/g, "").replace(".", "");
}

async function resolveCommand(command: string): Promise<string | undefined> {
  const lookup =
    process.platform === "win32"
      ? path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "where.exe")
      : "which";
  try {
    const result = await execFileAsync(lookup, [command], { windowsHide: true });
    const candidates = result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (process.platform !== "win32") {
      return candidates[0];
    }

    const first = candidates[0];
    if (!first) {
      return undefined;
    }
    if (path.extname(first)) {
      return first;
    }

    const firstBase = path.basename(first).toLowerCase();
    return candidates.find((candidate) => path.basename(candidate).toLowerCase() === `${firstBase}.cmd`) ?? first;
  } catch {
    return undefined;
  }
}

async function runLocalCli(commandPath: string, prompt: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const args = ["-p", prompt];
  const lowerPath = commandPath.toLowerCase();
  const isWindowsScript =
    process.platform === "win32" && (lowerPath.endsWith(".cmd") || lowerPath.endsWith(".bat"));

  const executable = isWindowsScript ? process.env.ComSpec ?? "cmd.exe" : commandPath;
  const executableArgs = isWindowsScript ? ["/d", "/c", commandPath, ...args] : args;

  try {
    const result = await execFileAsync(executable, executableArgs, {
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 10,
    });
    return {
      exitCode: 0,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (error) {
    const maybeError = error as { code?: number; stdout?: string; stderr?: string; message?: string };
    return {
      exitCode: typeof maybeError.code === "number" ? maybeError.code : 1,
      stdout: maybeError.stdout ?? "",
      stderr: maybeError.stderr ?? maybeError.message ?? String(error),
    };
  }
}

function artifactContent(input: {
  provider: (typeof PROVIDERS)[AskProvider];
  prompt: string;
  stdout: string;
  stderr: string;
  exitCode: number;
}): string {
  const rawOutput = [input.stdout.trim(), input.stderr.trim()].filter(Boolean).join("\n\n");
  return [
    `# Ask ${input.provider.displayName} Artifact`,
    "",
    "## Original user task",
    "",
    input.prompt,
    "",
    `## Final prompt sent to ${input.provider.displayName} CLI`,
    "",
    "```text",
    input.prompt,
    "```",
    "",
    `## ${input.provider.displayName} output (raw)`,
    "",
    "```text",
    rawOutput || "(no output)",
    "```",
    "",
    "## Concise summary",
    "",
    rawOutput ? "Local CLI output captured for review." : "Local CLI returned no output.",
    "",
    "## Action items / next steps",
    "",
    "- Review raw output before applying any recommendation.",
    `- CLI exit code: ${input.exitCode}`,
    "",
  ].join("\n");
}

export async function runAskCommand(service: CatalogService, argv: string[]): Promise<ExecutionResult<AskData>> {
  const providerName = argv[1];
  if (!providerName || !isAskProvider(providerName)) {
    throw new Error("Unknown ask provider. Expected one of: claude, gemini");
  }

  const prompt = parsePrompt(argv);
  if (!prompt) {
    throw new Error("Missing prompt for ask command");
  }

  const provider = PROVIDERS[providerName];
  service.getAsset(provider.assetName);

  const commandPath = await resolveCommand(provider.command);
  if (!commandPath) {
    throw new Error(
      [
        `Local ${provider.displayName} CLI is required for ${provider.assetName}.`,
        "MCP fallback is not used for this skill.",
        `Install and configure the local CLI, then verify with: ${provider.command} --version`,
      ].join("\n"),
    );
  }

  const cliResult = await runLocalCli(commandPath, prompt);
  const artifactDir = path.resolve(parseOption(argv, "--artifact-dir") ?? path.join(service.repoRoot, ".apx", "artifacts"));
  const artifactPath = path.join(artifactDir, `${providerName}-${slugify(prompt)}-${artifactTimestamp()}.md`);

  await fs.mkdir(artifactDir, { recursive: true });
  await fs.writeFile(
    artifactPath,
    artifactContent({
      provider,
      prompt,
      stdout: cliResult.stdout,
      stderr: cliResult.stderr,
      exitCode: cliResult.exitCode,
    }),
    "utf8",
  );

  return createResult({
    exitCode: cliResult.exitCode,
    stdout: [
      "ask complete",
      `provider: ${providerName}`,
      `artifact: ${artifactPath}`,
      "",
      cliResult.stdout.trim(),
    ]
      .filter((line, index) => index < 3 || line)
      .join("\n"),
    stderr: cliResult.stderr,
    warnings: cliResult.exitCode === 0 ? [] : [`${provider.command} exited with code ${cliResult.exitCode}`],
    actions: [`write ${artifactPath}`],
    data: {
      provider: providerName,
      artifactPath,
      promptLength: prompt.length,
      exitCode: cliResult.exitCode,
    },
  });
}
