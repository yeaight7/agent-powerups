import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { CatalogService } from "../utils/catalog.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

const execFileAsync = promisify(execFile);
const MAX_SCAN_BYTES = 1024 * 1024;

interface SecretPattern {
  name: string;
  pattern: RegExp;
}

export interface SecretFinding {
  file: string;
  line: number;
  pattern: string;
}

export interface SecretScanData {
  mode: "staged" | "all" | "paths";
  scannedFiles: number;
  findings: SecretFinding[];
}

const SECRET_PATTERNS: SecretPattern[] = [
  { name: "OPENAI_API_KEY", pattern: /\bOPENAI_API_KEY\s*=\s*['"]?[^'"\s]+/i },
  { name: "ANTHROPIC_API_KEY", pattern: /\bANTHROPIC_API_KEY\s*=\s*['"]?[^'"\s]+/i },
  { name: "GITHUB_TOKEN", pattern: /\bGITHUB_TOKEN\s*=\s*['"]?[^'"\s]+/i },
  { name: "PRIVATE_KEY", pattern: /BEGIN [A-Z ]*PRIVATE KEY/ },
  { name: "password assignment", pattern: /\bpassword\s*=\s*['"]?[^'"\s]+/i },
];

async function gitFiles(cwd: string, args: string[]): Promise<string[]> {
  const result = await execFileAsync("git", args, { cwd, shell: false, windowsHide: true });
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function gitOutput(cwd: string, args: string[]): Promise<string> {
  const result = await execFileAsync("git", args, {
    cwd,
    shell: false,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 5,
  });
  return result.stdout;
}

function resolveScanPath(cwd: string, filePath: string): string {
  return path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath);
}

async function isScannableFile(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() && stat.size <= MAX_SCAN_BYTES;
  } catch {
    return false;
  }
}

async function scanFile(cwd: string, filePath: string): Promise<SecretFinding[]> {
  const absolutePath = resolveScanPath(cwd, filePath);
  if (!(await isScannableFile(absolutePath))) {
    return [];
  }

  let content: string;
  try {
    content = await fs.readFile(absolutePath, "utf8");
  } catch {
    return [];
  }

  const findings: SecretFinding[] = [];
  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const secretPattern of SECRET_PATTERNS) {
      if (secretPattern.pattern.test(line)) {
        findings.push({
          file: path.relative(cwd, absolutePath) || absolutePath,
          line: index + 1,
          pattern: secretPattern.name,
        });
      }
    }
  }
  return findings;
}

function scanLine(file: string, line: number, content: string): SecretFinding[] {
  return SECRET_PATTERNS.filter((secretPattern) => secretPattern.pattern.test(content)).map((secretPattern) => ({
    file,
    line,
    pattern: secretPattern.name,
  }));
}

function scanStagedDiff(diff: string): { files: Set<string>; findings: SecretFinding[] } {
  const files = new Set<string>();
  const findings: SecretFinding[] = [];
  let currentFile = "";
  let currentLine = 0;

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.slice("+++ b/".length);
      files.add(currentFile);
      continue;
    }

    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentLine = Number(hunkMatch[1]);
      continue;
    }

    if (!currentFile || line.startsWith("+++") || line.startsWith("---")) {
      continue;
    }

    if (line.startsWith("+")) {
      findings.push(...scanLine(currentFile, currentLine, line.slice(1)));
      currentLine += 1;
      continue;
    }

    if (!line.startsWith("-")) {
      currentLine += 1;
    }
  }

  return { files, findings };
}

export async function runNoSecretsPreflightCommand(
  service: CatalogService,
  options: { all: boolean; paths: string[] },
): Promise<ExecutionResult<SecretScanData>> {
  const asset = service.getAsset("no-secrets-preflight");
  if (asset.type !== "hook") {
    throw new Error("no-secrets-preflight is not configured as a hook");
  }

  let mode: SecretScanData["mode"] = "staged";
  let files: string[] = [];
  let findings: SecretFinding[] = [];

  if (options.paths.length > 0) {
    mode = "paths";
    files = options.paths;
    findings = (await Promise.all(files.map((filePath) => scanFile(service.repoRoot, filePath)))).flat();
  } else if (options.all) {
    mode = "all";
    files = await gitFiles(service.repoRoot, ["ls-files"]);
    findings = (await Promise.all(files.map((filePath) => scanFile(service.repoRoot, filePath)))).flat();
  } else {
    const staged = scanStagedDiff(
      await gitOutput(service.repoRoot, ["diff", "--cached", "--unified=0", "--no-ext-diff", "--diff-filter=ACM"]),
    );
    files = [...staged.files];
    findings = staged.findings;
  }

  const stdout = findings.length === 0 ? "no-secrets-preflight: no findings" : `no-secrets-preflight: findings=${findings.length}`;

  return createResult({
    exitCode: findings.length > 0 ? 2 : 0,
    stdout,
    stderr: "",
    warnings: [],
    actions: [],
    data: {
      mode,
      scannedFiles: files.length,
      findings,
    },
  });
}
