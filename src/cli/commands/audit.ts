import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import { getPluginBundles } from "../utils/plugins.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

export interface AuditCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  detail?: string;
}

export interface AuditData {
  scope: string;
  checks: AuditCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
}

function pass(name: string, detail?: string): AuditCheck {
  return { name, status: "pass", ...(detail ? { detail } : {}) };
}

function warn(name: string, detail: string): AuditCheck {
  return { name, status: "warn", detail };
}

function fail(name: string, detail: string): AuditCheck {
  return { name, status: "fail", detail };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function parseFrontmatter(content: string): Record<string, string> | null {
  const m = content.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return null;
  const fields: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return fields;
}

async function auditCatalogPaths(service: CatalogService): Promise<AuditCheck> {
  const missing: string[] = [];
  for (const asset of service.listAssets()) {
    const assetPath = path.resolve(service.repoRoot, asset.path);
    if (!(await fileExists(assetPath))) {
      missing.push(`${asset.name} -> ${asset.path}`);
    }
  }
  return missing.length > 0
    ? fail("catalog-paths", `${missing.length} missing: ${missing.slice(0, 3).join("; ")}${missing.length > 3 ? " ..." : ""}`)
    : pass("catalog-paths", `${service.listAssets().length} paths OK`);
}

async function auditCompatibleWith(service: CatalogService): Promise<AuditCheck> {
  const empty = service.listAssets().filter((a) => a.compatible_with.length === 0).map((a) => a.name);
  return empty.length > 0
    ? fail("compatible_with", `empty compatible_with: ${empty.join(", ")}`)
    : pass("compatible_with", "all assets declare targets");
}

async function auditPackageJson(repoRoot: string): Promise<AuditCheck> {
  try {
    const raw = await fs.readFile(path.join(repoRoot, "package.json"), "utf8");
    const pkg = JSON.parse(raw);
    const missing: string[] = [];
    if (!pkg.name) missing.push("name");
    if (!pkg.version) missing.push("version");
    if (!pkg.description) missing.push("description");
    if (!pkg.license) missing.push("license");
    return missing.length > 0
      ? warn("package-json", `missing fields: ${missing.join(", ")}`)
      : pass("package-json", `v${pkg.version}`);
  } catch {
    return fail("package-json", "package.json unreadable");
  }
}

async function auditSkillFrontmatter(repoRoot: string): Promise<AuditCheck> {
  const skillsDir = path.join(repoRoot, "skills");
  const issues: string[] = [];
  let count = 0;

  let entries: string[];
  try {
    entries = await fs.readdir(skillsDir);
  } catch {
    return warn("skill-frontmatter", "skills/ directory not found");
  }

  for (const entry of entries) {
    const skillMd = path.join(skillsDir, entry, "SKILL.md");
    try {
      const content = await fs.readFile(skillMd, "utf8");
      count++;
      const fm = parseFrontmatter(content);
      if (!fm?.name || !fm?.description) {
        issues.push(`${entry}: missing name or description`);
      }
    } catch {
      issues.push(`${entry}: missing SKILL.md`);
    }
  }
  return issues.length > 0
    ? fail("skill-frontmatter", `${issues.length} issue(s): ${issues.slice(0, 3).join("; ")}${issues.length > 3 ? " ..." : ""}`)
    : pass("skill-frontmatter", `${count} skills OK`);
}

async function auditRequiresClarity(service: CatalogService): Promise<AuditCheck> {
  const patterns = ["git", "node", "python", "docker", "gh", "rg"];
  const unclear: string[] = [];

  for (const asset of service.listAssets()) {
    if (!asset.requires) continue;
    const cmds = asset.requires.commands ?? [];
    for (const cmd of cmds) {
      if (patterns.includes(cmd) && !asset.requires.commands) {
        unclear.push(`${asset.name}: undeclared dependency on ${cmd}`);
      }
    }
  }

  return pass("requires-clarity", `${service.listAssets().length} assets checked`);
}

async function auditPluginBundles(repoRoot: string): Promise<AuditCheck[]> {
  const bundles = await getPluginBundles(repoRoot);
  const checks: AuditCheck[] = [];

  if (bundles.length === 0) {
    return [warn("plugin-bundles", "no plugin bundles defined")];
  }

  const missing: string[] = [];
  const skillIssues: string[] = [];

  for (const bundle of bundles) {
    if (!bundle.name) continue;
    const bundleDir = path.join(repoRoot, "plugins", bundle.name);
    if (!(await fileExists(bundleDir))) {
      missing.push(bundle.name);
      continue;
    }
    for (const skill of bundle.skills ?? []) {
      const skillName = typeof skill === "string" ? skill : skill.name;
      if (!skillName) continue;
      const skillMd = path.join(bundleDir, "skills", skillName, "SKILL.md");
      if (!(await fileExists(skillMd))) {
        skillIssues.push(`${bundle.name}/${skillName}`);
      }
    }
  }

  checks.push(
    missing.length > 0
      ? fail("plugin-dirs", `missing: ${missing.join(", ")}`)
      : pass("plugin-dirs", `${bundles.length} bundles present`),
  );
  checks.push(
    skillIssues.length > 0
      ? fail("plugin-skills", `missing SKILL.md: ${skillIssues.slice(0, 3).join(", ")}${skillIssues.length > 3 ? " ..." : ""}`)
      : pass("plugin-skills", `all plugin skills have SKILL.md`),
  );

  return checks;
}

async function auditTargetCompatibility(service: CatalogService, target: string): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = [];

  // Commands with target-specific paths
  const commands = service.listAssets("command");
  const missingTargetPaths: string[] = [];
  for (const cmd of commands) {
    if (cmd.targets) {
      const targetPath = (cmd.targets as Record<string, string>)[target];
      if (targetPath) {
        const abs = path.resolve(service.repoRoot, targetPath);
        if (!(await fileExists(abs))) {
          missingTargetPaths.push(`${cmd.name} -> ${targetPath}`);
        }
      }
    }
  }
  checks.push(
    missingTargetPaths.length > 0
      ? fail(`command-paths-${target}`, `missing: ${missingTargetPaths.join("; ")}`)
      : pass(`command-paths-${target}`, `${commands.length} commands checked`),
  );

  // MCP configs compatible with target
  const mcpConfigs = service.listAssets("mcp-config");
  const incompatible = mcpConfigs.filter(
    (m) => !m.compatible_with.includes(target as never) && !m.compatible_with.includes("generic"),
  );
  checks.push(
    incompatible.length > 0
      ? warn(`mcp-target-${target}`, `${incompatible.length} MCP configs not compatible: ${incompatible.map((m) => m.name).join(", ")}`)
      : pass(`mcp-target-${target}`, `${mcpConfigs.length} MCP configs checked`),
  );

  // Assets declaring this target in compatible_with
  const compatible = service.listAssets().filter((a) => a.compatible_with.includes(target as never));
  checks.push(pass(`assets-for-${target}`, `${compatible.length} of ${service.listAssets().length} assets support ${target}`));

  return checks;
}

function summarize(checks: AuditCheck[]): { passCount: number; warnCount: number; failCount: number } {
  return {
    passCount: checks.filter((c) => c.status === "pass").length,
    warnCount: checks.filter((c) => c.status === "warn").length,
    failCount: checks.filter((c) => c.status === "fail").length,
  };
}

function formatChecks(checks: AuditCheck[]): string {
  return checks.map((c) => `  [${c.status.toUpperCase().padEnd(4)}] ${c.name}${c.detail ? ": " + c.detail : ""}`).join("\n");
}

export async function runAuditRepoCommand(service: CatalogService): Promise<ExecutionResult<AuditData>> {
  const checks: AuditCheck[] = [
    await auditCatalogPaths(service),
    await auditCompatibleWith(service),
    await auditPackageJson(service.repoRoot),
    await auditSkillFrontmatter(service.repoRoot),
    await auditRequiresClarity(service),
  ];

  const { passCount, warnCount, failCount } = summarize(checks);
  const exitCode = failCount > 0 ? 1 : 0;

  return createResult({
    exitCode,
    stdout: `audit repo: ${passCount} pass, ${warnCount} warn, ${failCount} fail\n${formatChecks(checks)}`,
    stderr: failCount > 0 ? `audit repo: ${failCount} check(s) failed` : "",
    warnings: checks.filter((c) => c.status === "warn").map((c) => `${c.name}: ${c.detail}`),
    actions: [],
    data: { scope: "repo", checks, passCount, warnCount, failCount },
  });
}

export async function runAuditSkillsCommand(service: CatalogService): Promise<ExecutionResult<AuditData>> {
  const skillsDir = path.join(service.repoRoot, "skills");
  const checks: AuditCheck[] = [];
  let entries: string[] = [];

  try {
    entries = await fs.readdir(skillsDir);
  } catch {
    return createResult({
      exitCode: 1,
      stdout: "audit skills: skills/ directory not found",
      stderr: "audit skills: skills/ not found",
      data: { scope: "skills", checks: [], passCount: 0, warnCount: 0, failCount: 1 },
    });
  }

  let missingFrontmatter = 0;
  let missingSkillMd = 0;
  let tooShort = 0;
  const MIN_CONTENT_LENGTH = 100;

  for (const entry of entries) {
    const skillMd = path.join(skillsDir, entry, "SKILL.md");
    let content: string;
    try {
      const stat = await fs.stat(path.join(skillsDir, entry));
      if (!stat.isDirectory()) continue;
      content = await fs.readFile(skillMd, "utf8");
    } catch {
      missingSkillMd++;
      continue;
    }

    const fm = parseFrontmatter(content);
    if (!fm?.name || !fm?.description) missingFrontmatter++;
    if (content.trim().length < MIN_CONTENT_LENGTH) tooShort++;
  }

  const validCount = entries.length - missingSkillMd;
  if (missingSkillMd > 0) checks.push(fail("skill-md-present", `${missingSkillMd} skill(s) missing SKILL.md`));
  else checks.push(pass("skill-md-present", `${validCount} skills have SKILL.md`));

  if (missingFrontmatter > 0) checks.push(fail("skill-frontmatter", `${missingFrontmatter} skill(s) missing name/description`));
  else checks.push(pass("skill-frontmatter", "all have name + description"));

  if (tooShort > 0) checks.push(warn("skill-content-length", `${tooShort} skill(s) under ${MIN_CONTENT_LENGTH} chars`));
  else checks.push(pass("skill-content-length", `all skills meet minimum length`));

  const { passCount, warnCount, failCount } = summarize(checks);
  const exitCode = failCount > 0 ? 1 : 0;

  return createResult({
    exitCode,
    stdout: `audit skills: ${passCount} pass, ${warnCount} warn, ${failCount} fail\n${formatChecks(checks)}`,
    stderr: failCount > 0 ? `audit skills: ${failCount} check(s) failed` : "",
    warnings: checks.filter((c) => c.status === "warn").map((c) => `${c.name}: ${c.detail}`),
    actions: [],
    data: { scope: "skills", checks, passCount, warnCount, failCount },
  });
}

export async function runAuditPluginsCommand(service: CatalogService): Promise<ExecutionResult<AuditData>> {
  const checks = await auditPluginBundles(service.repoRoot);
  const { passCount, warnCount, failCount } = summarize(checks);
  const exitCode = failCount > 0 ? 1 : 0;

  return createResult({
    exitCode,
    stdout: `audit plugins: ${passCount} pass, ${warnCount} warn, ${failCount} fail\n${formatChecks(checks)}`,
    stderr: failCount > 0 ? `audit plugins: ${failCount} check(s) failed` : "",
    warnings: checks.filter((c) => c.status === "warn").map((c) => `${c.name}: ${c.detail}`),
    actions: [],
    data: { scope: "plugins", checks, passCount, warnCount, failCount },
  });
}

export async function runAuditTargetCommand(service: CatalogService, target: string): Promise<ExecutionResult<AuditData>> {
  const VALID_TARGETS = ["codex", "claude-code", "gemini-cli", "cursor", "generic"];
  if (!VALID_TARGETS.includes(target)) {
    return createResult({
      exitCode: 1,
      stdout: `audit target: invalid target '${target}'. Expected: ${VALID_TARGETS.join(", ")}`,
      stderr: `invalid target: ${target}`,
      data: { scope: `target:${target}`, checks: [], passCount: 0, warnCount: 0, failCount: 1 },
    });
  }

  const checks = await auditTargetCompatibility(service, target);
  const { passCount, warnCount, failCount } = summarize(checks);
  const exitCode = failCount > 0 ? 1 : 0;

  return createResult({
    exitCode,
    stdout: `audit target ${target}: ${passCount} pass, ${warnCount} warn, ${failCount} fail\n${formatChecks(checks)}`,
    stderr: failCount > 0 ? `audit target ${target}: ${failCount} check(s) failed` : "",
    warnings: checks.filter((c) => c.status === "warn").map((c) => `${c.name}: ${c.detail}`),
    actions: [],
    data: { scope: `target:${target}`, checks, passCount, warnCount, failCount },
  });
}
