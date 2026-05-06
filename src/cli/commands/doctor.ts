import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { runPluginValidateCommand } from "./plugin.js";
import { runValidateCatalogCommand, runValidateSkillsCommand } from "./validate.js";
import type { CatalogService } from "../utils/catalog.js";
import { getPluginBundles } from "../utils/plugins.js";
import { checkRequirements } from "../utils/requirements.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

const execFileAsync = promisify(execFile);

export interface DoctorCheck {
  name: string;
  status: "OK" | "WARN" | "FAIL" | "SKIP";
  detail?: string;
  stdout?: string;
  stderr?: string;
  skipped?: boolean;
}

export interface DoctorData {
  checks: DoctorCheck[];
}

function ok(name: string, detail?: string): DoctorCheck {
  return { name, status: "OK", ...(detail ? { detail } : {}) };
}

function warn(name: string, detail: string): DoctorCheck {
  return { name, status: "WARN", detail };
}

function fail(name: string, detail: string): DoctorCheck {
  return { name, status: "FAIL", detail };
}

async function readJson(filePath: string): Promise<any> {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkLicenseConsistency(repoRoot: string): Promise<DoctorCheck> {
  const licenseText = await fs.readFile(path.join(repoRoot, "LICENSE"), "utf8");
  const rootLicense = licenseText.includes("Apache License") && licenseText.includes("Version 2.0") ? "Apache-2.0" : "UNKNOWN";
  const packageJson = await readJson(path.join(repoRoot, "package.json"));
  const mismatches: string[] = [];

  if (rootLicense !== "Apache-2.0") {
    mismatches.push(`LICENSE=${rootLicense}`);
  }
  if (packageJson.license !== rootLicense) {
    mismatches.push(`package.json=${packageJson.license ?? "missing"}`);
  }

  for (const bundle of await getPluginBundles(repoRoot)) {
    if (!bundle.name) {
      continue;
    }
    const pluginJsonPath = path.join(repoRoot, "plugins", bundle.name, ".claude-plugin", "plugin.json");
    if (!(await fileExists(pluginJsonPath))) {
      continue;
    }
    const pluginJson = await readJson(pluginJsonPath);
    if (pluginJson.license && pluginJson.license !== rootLicense) {
      mismatches.push(`${bundle.name}/plugin.json=${pluginJson.license}`);
    }
  }

  return mismatches.length > 0
    ? fail("package/license consistency", mismatches.join(", "))
    : ok("package/license consistency", rootLicense);
}

async function checkPluginMetadata(repoRoot: string): Promise<DoctorCheck> {
  const bundles = await getPluginBundles(repoRoot);
  if (bundles.length === 0) {
    return warn("plugin metadata", "no plugin bundles defined");
  }

  const issues: string[] = [];
  for (const bundle of bundles) {
    if (!bundle.name) {
      continue;
    }
    const pluginPath = path.join(repoRoot, "plugins", bundle.name);
    if (!(await fileExists(pluginPath))) {
      issues.push(`${bundle.name}: missing plugin directory`);
      continue;
    }
    try {
      const result = await runPluginValidateCommand(pluginPath);
      if (result.exitCode !== 0) {
        issues.push(`${bundle.name}: ${result.stderr || result.stdout}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      issues.push(`${bundle.name}: ${msg}`);
    }
  }

  return issues.length > 0
    ? fail("plugin metadata", issues.slice(0, 5).join("; "))
    : ok("plugin metadata", `${bundles.length} bundle(s) valid`);
}

async function checkPluginMirrorSync(repoRoot: string): Promise<DoctorCheck> {
  const bundles = await getPluginBundles(repoRoot);
  if (bundles.length === 0) {
    return warn("plugin mirror sync", "no plugin bundles defined");
  }

  const issues: string[] = [];
  for (const bundle of bundles) {
    if (!bundle.name) {
      continue;
    }
    const pluginPath = path.join(repoRoot, "plugins", bundle.name);
    const codexPath = path.join(pluginPath, ".codex-plugin", "plugin.json");
    const claudePath = path.join(pluginPath, ".claude-plugin", "plugin.json");
    const geminiPath = path.join(pluginPath, "gemini-extension.json");
    const geminiContextPath = path.join(pluginPath, "GEMINI.md");
    for (const requiredPath of [codexPath, claudePath, geminiPath, geminiContextPath]) {
      if (!(await fileExists(requiredPath))) {
        issues.push(`${bundle.name}: missing ${path.relative(pluginPath, requiredPath).replaceAll("\\", "/")}`);
      }
    }
    if (!(await fileExists(codexPath)) || !(await fileExists(claudePath)) || !(await fileExists(geminiPath))) {
      continue;
    }
    const [codex, claude, gemini] = await Promise.all([readJson(codexPath), readJson(claudePath), readJson(geminiPath)]);
    for (const manifest of [codex, claude, gemini]) {
      if (manifest.name !== bundle.name) {
        issues.push(`${bundle.name}: manifest name mismatch`);
      }
      if (manifest.description !== bundle.description) {
        issues.push(`${bundle.name}: manifest description mismatch`);
      }
      if (manifest.version !== "0.1.0") {
        issues.push(`${bundle.name}: manifest version mismatch`);
      }
    }
    if (gemini.contextFileName !== "GEMINI.md") {
      issues.push(`${bundle.name}: Gemini contextFileName mismatch`);
    }
  }

  return issues.length > 0
    ? fail("plugin mirror sync", issues.slice(0, 5).join("; "))
    : ok("plugin mirror sync", `${bundles.length} bundle(s) checked`);
}

async function checkPath(name: string, targetPath: string): Promise<DoctorCheck> {
  try {
    await fs.access(targetPath);
    return ok(name, targetPath);
  } catch {
    return fail(name, `missing: ${targetPath}`);
  }
}

function parseFrontmatter(content: string): Record<string, string> | undefined {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) {
    return undefined;
  }
  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index === -1) {
      continue;
    }
    fields[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return fields;
}

function referencedSupportFiles(content: string): string[] {
  const refs = new Set<string>();
  const pattern = /`([^`\s\r\n]+\.(?:md|ps1|sh|ts|js|py|json|toml|ya?ml))`/gi;
  for (const match of content.matchAll(pattern)) {
    const raw = match[1].replaceAll("\\", "/").replace(/^\.?\//, "");
    if (raw.startsWith("references/") || raw.startsWith("examples/") || !raw.includes("/")) {
      refs.add(raw);
    }
  }
  return [...refs];
}

async function supportRefExists(skillDir: string, ref: string): Promise<boolean> {
  const candidates = ref.includes("/")
    ? [path.join(skillDir, ref)]
    : [path.join(skillDir, ref), path.join(skillDir, "references", ref), path.join(skillDir, "examples", ref)];
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return true;
    } catch {
      // Try next conventional support-file location.
    }
  }
  return false;
}

async function checkSkills(repoRoot: string): Promise<DoctorCheck> {
  const skillsPath = path.join(repoRoot, "skills");
  const entries = await fs.readdir(skillsPath, { withFileTypes: true });
  const issues: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const skillDir = path.join(skillsPath, entry.name);
    const skillMd = path.join(skillDir, "SKILL.md");
    let content = "";
    try {
      content = await fs.readFile(skillMd, "utf8");
    } catch {
      issues.push(`${entry.name}: missing SKILL.md`);
      continue;
    }

    const frontmatter = parseFrontmatter(content);
    if (!frontmatter?.name || !frontmatter?.description) {
      issues.push(`${entry.name}: missing required frontmatter`);
    }

    for (const ref of referencedSupportFiles(content)) {
      if (!(await supportRefExists(skillDir, ref))) {
        issues.push(`${entry.name}: missing referenced support file ${ref}`);
      }
    }
  }

  return issues.length > 0 ? fail("skill files", issues.join("; ")) : ok("skill files", `${entries.length} checked`);
}

async function runExternalCheck(name: string, command: string, args: string[], cwd: string): Promise<DoctorCheck> {
  const launchCommand = process.platform === "win32" && command.endsWith(".cmd") ? "cmd.exe" : command;
  const launchArgs = process.platform === "win32" && command.endsWith(".cmd")
    ? ["/d", "/s", "/c", command, ...args]
    : args;
  try {
    const result = await execFileAsync(launchCommand, launchArgs, {
      cwd,
      shell: false,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 5,
      env: { ...process.env, APX_DOCTOR_NESTED: "1" },
    });
    return { name, status: "OK", stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const maybeError = error as { stdout?: string; stderr?: string; message?: string };
    return fail(name, maybeError.stderr ?? maybeError.stdout ?? maybeError.message ?? String(error));
  }
}

function summarizeChecks(checks: DoctorCheck[]): string {
  return checks
    .map((check) => {
      const suffix = check.detail ? ` (${check.detail})` : "";
      const skipped = check.skipped ? " (skipped nested)" : "";
      return `${check.name}: ${check.status}${suffix}${skipped}`;
    })
    .join("\n");
}

export async function runDoctorCommand(
  service: CatalogService,
  cwd: string,
  options: { full?: boolean } = {},
): Promise<ExecutionResult<DoctorData>> {
  const checks: DoctorCheck[] = [];

  checks.push(ok("node", process.version));
  checks.push(ok("catalog.json", service.getCatalogPath()));
  checks.push(await checkPath("skills path", path.resolve(service.repoRoot, "skills")));
  checks.push(ok("install root", path.resolve(cwd, ".agent-powerups", "installed")));
  checks.push(await checkLicenseConsistency(service.repoRoot));
  checks.push(await checkSkills(service.repoRoot));

  checks.push(await checkPluginMetadata(service.repoRoot));
  checks.push(await checkPluginMirrorSync(service.repoRoot));

  const missingRequirements = service
    .listAssets()
    .flatMap((asset) =>
      checkRequirements(asset.requires)
        .filter((status) => status.status === "MISSING")
        .map((status) => `${asset.name}:${status.label}`),
    );
  checks.push(
    missingRequirements.length > 0
      ? warn("external requirements", missingRequirements.join(", "))
      : ok("external requirements", "none missing"),
  );

  if (options.full) {
    checks.push(await runExternalCheck("npm run build", process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], service.repoRoot));
    if (process.env.APX_DOCTOR_NESTED === "1" || process.env.npm_lifecycle_event === "test") {
      checks.push({ name: "npm test", status: "SKIP", skipped: true, detail: "nested test run guard" });
    } else {
      checks.push(await runExternalCheck("npm test", process.platform === "win32" ? "npm.cmd" : "npm", ["test"], service.repoRoot));
    }
    const validateSkillsResult = await runValidateSkillsCommand(service);
    checks.push(validateSkillsResult.exitCode === 0 ? ok("apx validate skills", validateSkillsResult.stdout) : fail("apx validate skills", validateSkillsResult.stdout));
    const validateCatalogResult = await runValidateCatalogCommand(service);
    checks.push(validateCatalogResult.exitCode === 0 ? ok("apx validate catalog", validateCatalogResult.stdout) : fail("apx validate catalog", validateCatalogResult.stdout));
  }

  const failures = checks.filter((check) => check.status === "FAIL");
  const warnings = checks.filter((check) => check.status === "WARN").map((check) => `${check.name}: ${check.detail}`);

  return createResult({
    exitCode: failures.length > 0 ? 1 : 0,
    stdout: summarizeChecks(checks),
    stderr: failures.map((check) => `${check.name}: ${check.detail}`).join("\n"),
    warnings,
    actions: [],
    data: { checks },
  });
}
