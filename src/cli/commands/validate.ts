import fs from "node:fs/promises";
import path from "node:path";
import type { CatalogService } from "../utils/catalog.js";
import { fieldAsString, parseFrontmatter as parseSharedFrontmatter } from "../utils/frontmatter.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

const disallowedTopLevelSectionTags = [
  "Purpose",
  "Workflow",
  "Use_When",
  "Do_Not_Use_When",
  "Why_This_Exists",
  "PRD_Mode",
  "Execution_Policy",
  "Steps",
  "Escalation_And_Stop_Conditions",
  "Final_Checklist",
] as const;

const disallowedTopLevelSectionRe = new RegExp(
  `^\\s*</?(?<tag>${disallowedTopLevelSectionTags.join("|")})(?:\\s[^>]*)?>\\s*$`,
  "gm",
);

function parseFrontmatter(content: string): Record<string, string> | null {
  if (!content.startsWith("---")) return null;
  const match = content.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) return null;
  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return fields;
}

function stripFencedCode(content: string): string {
  return content.replace(/```[\s\S]*?```/g, "");
}

function extractFileRefs(content: string): string[] {
  const refs = new Set<string>();
  const refRe = /`([^`\s]+\.(?:md|ps1|sh|ts|js|py|json|toml|ya?ml))`/g;
  for (const m of content.matchAll(refRe)) {
    const ref = m[1].replaceAll("\\", "/").replace(/^\.?\//, "");
    // Only check refs that are bare filenames or explicitly under references/ or examples/
    if (!ref.includes("/") || ref.startsWith("references/") || ref.startsWith("examples/")) {
      refs.add(ref);
    }
  }
  return [...refs];
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function validateSkills(
  skillsDir: string,
): Promise<{ errors: string[]; warnings: string[]; checkedCount: number }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let checkedCount = 0;

  let entries: string[];
  try {
    entries = await fs.readdir(skillsDir);
  } catch {
    return { errors, warnings, checkedCount };
  }

  for (const entry of entries) {
    const skillDir = path.join(skillsDir, entry);
    const stat = await fs.stat(skillDir).catch(() => null);
    if (!stat?.isDirectory()) continue;
    checkedCount++;

    const skillMdPath = path.join(skillDir, "SKILL.md");
    if (!(await fileExists(skillMdPath))) {
      errors.push(`[${entry}] missing SKILL.md`);
      continue;
    }

    const content = await fs.readFile(skillMdPath, "utf8");
    const fm = parseFrontmatter(content);

    if (!fm) {
      errors.push(`[${entry}] SKILL.md has no valid frontmatter`);
      continue;
    }
    if (!fm["name"]) errors.push(`[${entry}] frontmatter missing required field: name`);
    if (!fm["description"]) errors.push(`[${entry}] frontmatter missing required field: description`);
    if (fm["name"] && fm["name"] !== entry) {
      errors.push(`[${entry}] frontmatter name does not match directory name: ${fm["name"]}`);
    }

    const prose = stripFencedCode(content);
    const disallowedTags = new Set<string>();
    for (const match of prose.matchAll(disallowedTopLevelSectionRe)) {
      disallowedTags.add(match.groups?.["tag"] ?? match[1]);
    }
    for (const tag of [...disallowedTags].sort()) {
      errors.push(
        `[${entry}] SKILL.md uses XML-like top-level section tag <${tag}>; use Markdown headings instead`,
      );
    }

    for (const ref of extractFileRefs(content)) {
      const basename = path.basename(ref);
      const candidates = ref.includes("/")
        ? [path.join(skillDir, ref)]
        : [
            path.join(skillDir, ref),
            path.join(skillDir, "references", basename),
            path.join(skillDir, "examples", basename),
          ];
      const found = await Promise.all(candidates.map(fileExists));
      if (!found.some(Boolean)) {
        errors.push(`[${entry}] missing referenced support file: ${ref}`);
      }
    }
  }

  return { errors, warnings, checkedCount };
}

export async function runValidateSkillsCommand(
  service: CatalogService,
): Promise<ExecutionResult> {
  const skillsDir = path.join(service.repoRoot, "skills");
  const { errors, warnings, checkedCount } = await validateSkills(skillsDir);

  const lines: string[] = [];
  if (warnings.length) {
    lines.push(`Warnings (${warnings.length}):`);
    for (const w of warnings) lines.push(`  WARN  ${w}`);
  }
  if (errors.length) {
    lines.push(`Errors (${errors.length}):`);
    for (const e of errors) lines.push(`  ERROR ${e}`);
  }
  const ok = errors.length === 0;
  lines.push(
    `Checked ${checkedCount} skill(s). ${errors.length} error(s), ${warnings.length} warning(s). ${ok ? "OK." : "FAILED."}`,
  );

  return createResult({ exitCode: ok ? 0 : 1, stdout: lines.join("\n") });
}

async function detectRootLicense(repoRoot: string): Promise<string> {
  const licensePath = path.join(repoRoot, "LICENSE");
  try {
    const content = await fs.readFile(licensePath, "utf8");
    if (content.includes("Apache License") && content.includes("Version 2.0")) return "Apache-2.0";
    return "UNKNOWN";
  } catch {
    return "MISSING";
  }
}

async function readJsonLicense(filePath: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === "object" && parsed !== null && "license" in parsed) {
      return String((parsed as Record<string, unknown>)["license"]);
    }
    return null;
  } catch {
    return null;
  }
}

async function checkLicenseConsistency(repoRoot: string): Promise<string[]> {
  const errors: string[] = [];
  const rootLicense = await detectRootLicense(repoRoot);
  if (rootLicense === "MISSING") {
    errors.push("LICENSE file missing");
    return errors;
  }
  if (rootLicense === "UNKNOWN") {
    errors.push("LICENSE file contains unrecognized license text");
    return errors;
  }

  const pkgLicense = await readJsonLicense(path.join(repoRoot, "package.json"));
  if (pkgLicense && pkgLicense !== rootLicense) {
    errors.push(`package.json license "${pkgLicense}" does not match root LICENSE "${rootLicense}"`);
  }

  const pluginJsonPath = path.join(
    repoRoot,
    "plugins",
    "agent-powerups",
    ".codex-plugin",
    "plugin.json",
  );
  if (await fileExists(pluginJsonPath)) {
    const pluginLicense = await readJsonLicense(pluginJsonPath);
    if (pluginLicense && pluginLicense !== rootLicense) {
      errors.push(
        `plugins/agent-powerups/.codex-plugin/plugin.json license "${pluginLicense}" does not match root LICENSE "${rootLicense}"`,
      );
    }
  }

  return errors;
}

export async function runValidateCatalogCommand(
  service: CatalogService,
): Promise<ExecutionResult> {
  const errors = await checkLicenseConsistency(service.repoRoot);

  const lines: string[] = [];
  if (errors.length) {
    lines.push(`Errors (${errors.length}):`);
    for (const e of errors) lines.push(`  ERROR ${e}`);
  }
  const ok = errors.length === 0;
  lines.push(
    `Checked catalog. ${errors.length} error(s). ${ok ? "OK." : "FAILED."}`,
  );

  return createResult({ exitCode: ok ? 0 : 1, stdout: lines.join("\n") });
}

// D-04 drift validator (scoped to skills). catalog.name vs frontmatter `name` is a hard
// ERROR — that invariant is held and must stay held. catalog.summary vs frontmatter
// `description` is an informational WARNING: in practice these are complementary surfaces
// (short registry label vs the longer "Use when…" trigger), so a difference is reported
// but does not fail. use_when/signals drift is out of scope until those fields are
// migrated into frontmatter (D-12). (Severity choice recorded in the SX-09 tracker entry.)
export async function runValidateDriftCommand(
  service: CatalogService,
): Promise<ExecutionResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let checkedCount = 0;

  for (const entry of service.listAssets("skill")) {
    const skillMdPath = path.join(service.repoRoot, entry.path, "SKILL.md");
    let content: string;
    try {
      content = await fs.readFile(skillMdPath, "utf8");
    } catch {
      warnings.push(`[${entry.name}] drift check skipped — SKILL.md not found`);
      continue;
    }

    const { fields } = parseSharedFrontmatter(content);
    const fmName = fieldAsString(fields, "name");
    const fmDescription = fieldAsString(fields, "description");
    if (!fmName && !fmDescription) {
      errors.push(`[${entry.name}] SKILL.md has no parseable frontmatter`);
      continue;
    }

    checkedCount++;
    if (fmName && fmName !== entry.name) {
      errors.push(`[${entry.name}] catalog.name "${entry.name}" != frontmatter.name "${fmName}"`);
    }
    if (fmDescription && fmDescription.trim() !== entry.summary.trim()) {
      warnings.push(`[${entry.name}] catalog.summary differs from frontmatter.description (registry label vs trigger; informational)`);
    }
  }

  const lines: string[] = [];
  if (warnings.length) {
    lines.push(`Warnings (${warnings.length}):`);
    for (const w of warnings) lines.push(`  WARN  ${w}`);
  }
  if (errors.length) {
    lines.push(`Errors (${errors.length}):`);
    for (const e of errors) lines.push(`  ERROR ${e}`);
  }
  const ok = errors.length === 0;
  lines.push(
    `Checked ${checkedCount} skill(s). ${errors.length} error(s), ${warnings.length} warning(s). ${ok ? "OK." : "FAILED."}`,
  );

  return createResult({ exitCode: ok ? 0 : 1, stdout: lines.join("\n") });
}

const ROUTABLE_METADATA_TYPES = new Set(["skill", "command", "workflow"]);

function hasNonEmptyMetadata(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

// D-12 completeness validator: every routable asset (skill/command/workflow) should
// carry use_when + signals so the metadata-driven discover scorer can route it, OR opt
// out explicitly (check_policy: none / activation: approval-required). Gaps are warnings
// (exit 0) — a worklist for future backfill, not a CI blocker yet.
export async function runValidateMetadataCommand(
  service: CatalogService,
): Promise<ExecutionResult> {
  const warnings: string[] = [];
  let checkedCount = 0;

  for (const entry of service.listAssets()) {
    if (!ROUTABLE_METADATA_TYPES.has(entry.type)) continue;
    if (entry.check_policy === "none" || entry.activation === "approval-required") continue;

    checkedCount++;
    if (!hasNonEmptyMetadata(entry.use_when) && !hasNonEmptyMetadata(entry.signals)) {
      warnings.push(
        `[${entry.name}] (${entry.type}) missing use_when and signals — add routing metadata or set check_policy: none`,
      );
    }
  }

  const lines: string[] = [];
  if (warnings.length) {
    lines.push(`Warnings (${warnings.length}):`);
    for (const w of warnings) lines.push(`  WARN  ${w}`);
  }
  lines.push(
    `Checked ${checkedCount} routable asset(s). ${warnings.length} warning(s). ${warnings.length === 0 ? "OK." : "WARNED."}`,
  );

  return createResult({ exitCode: 0, stdout: lines.join("\n") });
}
