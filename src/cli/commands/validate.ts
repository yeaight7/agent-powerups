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
  const refs: string[] = [];
  for (const m of content.matchAll(/`([^`]+\.[a-zA-Z0-9]+)`/g)) {
    const ref = m[1];
    if (ref.includes("/") || ref.includes(".")) refs.push(ref);
  }
  return refs;
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
): Promise<{ errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  let entries: string[];
  try {
    entries = await fs.readdir(skillsDir);
  } catch {
    return { errors, warnings };
  }

  for (const entry of entries) {
    const skillDir = path.join(skillsDir, entry);
    const stat = await fs.stat(skillDir).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const skillMdPath = path.join(skillDir, "SKILL.md");
    if (!(await fileExists(skillMdPath))) {
      warnings.push(`[${entry}] missing SKILL.md`);
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

  return { errors, warnings };
}

export async function runValidateSkillsCommand(
  service: CatalogService,
): Promise<ExecutionResult> {
  const skillsDir = path.join(service.repoRoot, "skills");
  const { errors, warnings } = await validateSkills(skillsDir);

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
    `Checked skills. ${errors.length} error(s), ${warnings.length} warning(s). ${ok ? "OK." : "FAILED."}`,
  );

  return createResult({ exitCode: ok ? 0 : 1, stdout: lines.join("\n") });
}
