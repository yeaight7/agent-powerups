import fs from "node:fs/promises";
import path from "node:path";
import type { CatalogService } from "../utils/catalog.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

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

function extractFileRefs(content: string): string[] {
  const refs = new Set<string>();
  const refRe = /`([^`\s]+\.(?:md|ps1|sh|ts|js|py|json|toml|ya?ml))`/g;
  for (const m of content.matchAll(refRe)) {
    refs.add(m[1]);
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

    for (const ref of extractFileRefs(content)) {
      const candidates = [
        path.join(skillDir, ref),
        path.join(skillDir, path.basename(ref)),
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
