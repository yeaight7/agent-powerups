import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";

import { createResult, type ExecutionResult } from "../utils/result.js";

export interface SecurityFinding {
  severity: "P0" | "P1";
  check: string;
  file: string;
  line: number;
  detail: string;
}

export interface SecurityAuditData {
  scannedFiles: number;
  p0Count: number;
  p1Count: number;
  findings: SecurityFinding[];
}

interface Check {
  name: string;
  severity: "P0" | "P1";
  pattern: RegExp;
  detail: (match: string) => string;
  onlyExts?: Set<string>;
}

const SCRIPT_EXTS = new Set([".sh", ".ps1", ".yaml", ".yml", ".toml", ".json"]);
const CONFIG_EXTS = new Set([".json", ".toml"]);

const CHECKS: Check[] = [
  // P0
  {
    name: "secrets-in-config",
    severity: "P0",
    pattern: /(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN|GITHUB_PAT|AWS_SECRET_ACCESS_KEY)\s*[=:]\s*['"]?(?!\$\{)[A-Za-z0-9+/]{16,}/i,
    detail: (m) => `secret value detected (redacted): key=${m.split(/[=:]/)[0]?.trim() ?? "unknown"}`,
    onlyExts: CONFIG_EXTS,
  },
  {
    name: "wildcard-permission",
    severity: "P0",
    pattern: /"[^"]*(?:permission|allowed?|tool)[^"]*"\s*:\s*(?:"\*"|\[(?:[^\]]*,\s*)?"\*")/i,
    detail: () => `wildcard (*) in permissions grants unrestricted access`,
    onlyExts: CONFIG_EXTS,
  },
  {
    name: "unpinned-mcp-auto-install",
    severity: "P0",
    pattern: /"autoInstall"\s*:\s*true|"args"\s*:\s*\[[^\]]*"(?:@[^@"]+@latest|(?:-y|--yes)\s+@)/,
    detail: () => `auto-install of unpinned MCP package — pin to an exact version`,
    onlyExts: CONFIG_EXTS,
  },
  {
    name: "hook-unsanitized-interpolation",
    severity: "P0",
    // Match ${var} but NOT GH Actions ${{ }} double-brace syntax
    pattern: /\$\{(?!\{)[^}]+\}[^"']|(?<!['"\\])\$(?:INPUT|ARG|PARAM)\b/,
    detail: (m) => `unquoted shell interpolation: ${m.slice(0, 50)}`,
    onlyExts: new Set([".sh", ".ps1"]),
  },
  {
    name: "tcp-relay-no-auth",
    severity: "P0",
    pattern: /"transport"\s*:\s*"tcp"/,
    detail: () => `TCP relay without auth — verify auth field is present`,
    onlyExts: CONFIG_EXTS,
  },
  // P1
  {
    name: "npx-y",
    severity: "P1",
    pattern: /npx\s+(?:-y|--yes)\b/,
    detail: () => `npx -y auto-installs packages without confirmation`,
    onlyExts: SCRIPT_EXTS,
  },
  {
    name: "unpinned-docker-image",
    severity: "P1",
    // Only flag in CI yaml files; dockerfile scanning needs dedicated tooling
    pattern: /(?:^|\s)image:\s+[a-z0-9_/.-]+:latest\b/im,
    detail: (m) => `unpinned :latest image in CI config: ${m.trim()}`,
    onlyExts: new Set([".yaml", ".yml"]),
  },
  {
    name: "broad-filesystem-write",
    severity: "P1",
    pattern: /(?:rm\s+-rf\s+\/|"path"\s*:\s*"\*\*|write_file\s+\/\*\*)/i,
    detail: () => `broad filesystem write or recursive delete pattern`,
    onlyExts: SCRIPT_EXTS,
  },
  {
    name: "missing-dry-run",
    severity: "P1",
    // Only flag in actual scripts/CI, not documentation markdown
    pattern: /(?:npm\s+install|pip\s+install|cargo\s+install|gem\s+install)\b(?!.*(?:--dry-run|-n\b))/i,
    detail: (m) => `install command without --dry-run guard: ${m.trim().slice(0, 60)}`,
    onlyExts: SCRIPT_EXTS,
  },
];

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".worktrees", ".plugins"]);
const SCAN_EXTS = new Set([".json", ".toml", ".md", ".sh", ".ps1", ".yaml", ".yml"]);
const MAX_FILE_BYTES = 512 * 1024;

async function collectFiles(root: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(path.join(dir, entry.name));
      } else if (entry.isFile() && SCAN_EXTS.has(path.extname(entry.name).toLowerCase())) {
        results.push(path.join(dir, entry.name));
      }
    }
  }

  try {
    const stat = await fs.stat(root);
    if (stat.isFile()) {
      results.push(root);
    } else {
      await walk(root);
    }
  } catch {
    // Path not accessible
  }
  return results;
}

async function scanFile(filePath: string, repoRoot: string): Promise<SecurityFinding[]> {
  let content: string;
  try {
    const stat = await fs.stat(filePath);
    if (stat.size > MAX_FILE_BYTES) return [];
    content = await fs.readFile(filePath, "utf8");
  } catch {
    return [];
  }

  const relPath = path.relative(repoRoot, filePath) || filePath;
  const ext = path.extname(filePath).toLowerCase();
  const lines = content.split(/\r?\n/);
  const findings: SecurityFinding[] = [];
  const seen = new Set<string>();

  for (const check of CHECKS) {
    if (check.onlyExts && !check.onlyExts.has(ext)) continue;
    for (const [i, line] of lines.entries()) {
      if (check.pattern.test(line)) {
        const key = `${check.name}:${relPath}`;
        if (!seen.has(key)) {
          seen.add(key);
          const match = line.match(check.pattern)?.[0] ?? line;
          findings.push({
            severity: check.severity,
            check: check.name,
            file: relPath,
            line: i + 1,
            detail: check.detail(match),
          });
        }
        break;
      }
    }
  }
  return findings;
}

export async function runSecurityAuditCommand(
  cwd: string,
  options: { paths: string[]; all: boolean },
): Promise<ExecutionResult<SecurityAuditData>> {
  const roots =
    options.all || options.paths.length === 0
      ? [cwd]
      : options.paths.map((p) => (path.isAbsolute(p) ? p : path.resolve(cwd, p)));

  const allFiles = (await Promise.all(roots.map(collectFiles))).flat();
  const uniqueFiles = [...new Set(allFiles)];

  const allFindings = (await Promise.all(uniqueFiles.map((f) => scanFile(f, cwd)))).flat();

  const p0 = allFindings.filter((f) => f.severity === "P0");
  const p1 = allFindings.filter((f) => f.severity === "P1");
  const exitCode = p0.length > 0 ? 2 : p1.length > 0 ? 1 : 0;

  const summaryLine =
    exitCode === 0
      ? `security-audit: no findings in ${uniqueFiles.length} files`
      : `security-audit: ${p0.length} P0, ${p1.length} P1 in ${uniqueFiles.length} files`;

  const lines = [summaryLine];
  for (const f of allFindings) {
    lines.push(`  [${f.severity}] ${f.check}  ${f.file}:${f.line}  ${f.detail}`);
  }

  return createResult({
    exitCode,
    stdout: lines.join("\n"),
    stderr: exitCode > 0 ? summaryLine : "",
    warnings: p1.map((f) => `${f.check} at ${f.file}:${f.line}`),
    actions: [],
    data: {
      scannedFiles: uniqueFiles.length,
      p0Count: p0.length,
      p1Count: p1.length,
      findings: allFindings,
    },
  });
}
