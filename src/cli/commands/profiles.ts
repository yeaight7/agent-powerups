import fs from "node:fs/promises";
import path from "node:path";

import type { CliIO } from "../apx.js";
import { hasFlag, parseOption } from "../utils/args.js";
import type { CatalogService } from "../utils/catalog.js";
import { createResult, formatResult } from "../utils/result.js";
import {
  buildInstallActions,
  getProfile,
  loadProfiles,
  resolveProfile,
  type InstallAction,
} from "../utils/profiles.js";

const SAFE_TARGETS = ["codex", "claude-code", "generic"] as const;
type ProfileTarget = (typeof SAFE_TARGETS)[number];

function requireTarget(argv: string[]): ProfileTarget {
  const t = parseOption(argv, "--target");
  if (!t || !(SAFE_TARGETS as readonly string[]).includes(t)) {
    throw new Error(`Missing or invalid --target. Expected one of: ${SAFE_TARGETS.join(", ")}`);
  }
  return t as ProfileTarget;
}

export async function runProfilesListCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const profiles = await loadProfiles(io.cwd);

  if (json) {
    io.stdout(formatResult(createResult({ stdout: "success", data: profiles }), true));
    return 0;
  }

  if (profiles.length === 0) {
    io.stdout("No profiles found.");
    return 0;
  }

  io.stdout("Available Profiles:\n");
  for (const p of profiles) {
    const bundleNote = p.plugin_bundles.length > 0 ? ` + bundles: ${p.plugin_bundles.join(", ")}` : "";
    const skillNote =
      p.skills.length > 0 ? `${p.skills.length} skill${p.skills.length !== 1 ? "s" : ""}` : "0 skills";
    io.stdout(`  ${p.name}  [${p.maturity}]`);
    io.stdout(`    ${p.description}`);
    io.stdout(`    ${skillNote}${bundleNote}`);
    io.stdout("");
  }

  return 0;
}

export async function runProfilesInfoCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const nameIdx = argv.indexOf("info") + 1;
  const name = argv[nameIdx];

  if (!name || name.startsWith("--")) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: "Missing profile name" }), json));
    return 1;
  }

  const profile = await getProfile(io.cwd, name);
  if (!profile) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: `Profile '${name}' not found.` }), json));
    return 1;
  }

  if (json) {
    io.stdout(formatResult(createResult({ stdout: "success", data: profile }), true));
    return 0;
  }

  io.stdout(`Profile: ${profile.name}`);
  io.stdout(`Description: ${profile.description}`);
  io.stdout(`Status: ${profile.maturity}`);

  io.stdout(`\nSkills (${profile.skills.length}):`);
  for (const s of profile.skills) io.stdout(`  - ${s}`);

  io.stdout(`\nCommands (${profile.commands.length}):`);
  for (const c of profile.commands) io.stdout(`  - ${c}`);

  io.stdout(`\nPlugin Bundles (${profile.plugin_bundles.length}):`);
  for (const b of profile.plugin_bundles) io.stdout(`  - ${b}`);

  if (profile.hooks.length > 0) {
    io.stdout(`\nHooks (review-only — not auto-installed):`);
    for (const h of profile.hooks) io.stdout(`  - ${h.name}  [${h.mode}]`);
  }

  if (profile.mcp.length > 0) {
    io.stdout(`\nMCP configs (not installed by default):`);
    for (const m of profile.mcp) io.stdout(`  - ${m}`);
  }

  return 0;
}

export async function runProfilesPlanCommand(
  argv: string[],
  service: CatalogService,
  io: CliIO,
): Promise<number> {
  const json = hasFlag(argv, "--json");
  const nameIdx = argv.indexOf("plan") + 1;
  const name = argv[nameIdx];

  if (!name || name.startsWith("--")) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: "Missing profile name" }), json));
    return 1;
  }

  const target = requireTarget(argv);

  const profile = await getProfile(io.cwd, name);
  if (!profile) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: `Profile '${name}' not found.` }), json));
    return 1;
  }

  const resolved = await resolveProfile(io.cwd, profile, service, target);
  const placeholderDest = path.join(io.cwd, ".agent-powerups", "profiles", name);
  const actions = buildInstallActions(resolved, placeholderDest);

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: `plan: ${name} for ${target}`,
          data: {
            profile: name,
            target,
            actions: actions.map((a) => ({
              type: a.type,
              name: a.name,
              source: a.sourcePath,
              dest: a.destPath,
            })),
            reviewOnlyHooks: resolved.reviewOnlyHooks,
            skippedMcp: resolved.skippedMcp,
            unresolvedSkills: resolved.unresolvedSkills,
            unresolvedCommands: resolved.unresolvedCommands,
          },
        }),
        true,
      ),
    );
    return 0;
  }

  io.stdout(`Profile plan: ${name}  target: ${target}`);
  io.stdout(`(read-only — use 'apx profiles install' with --yes --dest to apply)\n`);

  if (actions.length === 0) {
    io.stdout("  (no assets resolved)");
  }

  const byType = (type: InstallAction["type"]) => actions.filter((a) => a.type === type);

  const skills = byType("skill");
  if (skills.length > 0) {
    io.stdout(`Skills (${skills.length}):`);
    for (const a of skills) io.stdout(`  ${a.name}\n    <- ${a.sourcePath}\n    -> ${a.destPath}`);
    io.stdout("");
  }

  const cmds = byType("command");
  if (cmds.length > 0) {
    io.stdout(`Commands (${cmds.length}):`);
    for (const a of cmds) io.stdout(`  ${a.name}\n    <- ${a.sourcePath}\n    -> ${a.destPath}`);
    io.stdout("");
  }

  const bundles = byType("bundle");
  if (bundles.length > 0) {
    io.stdout(`Plugin Bundles (${bundles.length}):`);
    for (const a of bundles) io.stdout(`  ${a.name}\n    <- ${a.sourcePath}\n    -> ${a.destPath}`);
    io.stdout("");
  }

  if (resolved.reviewOnlyHooks.length > 0) {
    io.stdout(`Hooks (review-only — NOT installed):`);
    for (const h of resolved.reviewOnlyHooks) io.stdout(`  ${h}`);
    io.stdout("");
  }

  if (resolved.skippedMcp.length > 0) {
    io.stdout(`MCP configs (skipped — not installed by default):`);
    for (const m of resolved.skippedMcp) io.stdout(`  ${m}`);
    io.stdout("");
  }

  if (resolved.unresolvedSkills.length > 0) {
    io.stdout(`Unresolved (not in catalog):`);
    for (const u of resolved.unresolvedSkills) io.stdout(`  ${u}`);
  }

  return 0;
}

async function copyRecursive(src: string, dest: string): Promise<string[]> {
  const stats = await fs.stat(src);
  const copied: string[] = [];

  if (stats.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      const sub = await copyRecursive(path.join(src, entry), path.join(dest, entry));
      copied.push(...sub);
    }
  } else {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
    copied.push(dest);
  }

  return copied;
}

export async function runProfilesInstallCommand(
  argv: string[],
  service: CatalogService,
  io: CliIO,
): Promise<number> {
  const json = hasFlag(argv, "--json");
  const yes = hasFlag(argv, "--yes");
  const force = hasFlag(argv, "--force");
  const dryRun = !yes || hasFlag(argv, "--dry-run");

  const nameIdx = argv.indexOf("install") + 1;
  const name = argv[nameIdx];

  if (!name || name.startsWith("--")) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: "Missing profile name" }), json));
    return 1;
  }

  const target = requireTarget(argv);
  const dest = parseOption(argv, "--dest");

  if (!dryRun && !dest) {
    io.stderr(
      formatResult(
        createResult({ exitCode: 1, stderr: "Missing --dest. Use --dest <path> with --yes to install." }),
        json,
      ),
    );
    return 1;
  }

  const profile = await getProfile(io.cwd, name);
  if (!profile) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: `Profile '${name}' not found.` }), json));
    return 1;
  }

  const resolved = await resolveProfile(io.cwd, profile, service, target);
  const effectiveDest = dest ?? path.join(io.cwd, ".agent-powerups", "profiles", name);
  const actions = buildInstallActions(resolved, effectiveDest);

  if (dryRun) {
    const actionLines = actions.map((a) => `would copy [${a.type}] ${a.name} -> ${a.destPath}`);

    if (json) {
      io.stdout(
        formatResult(
          createResult({
            stdout: `dry-run: profile '${name}' for ${target} — no files written`,
            actions: actionLines,
            data: {
              profile: name,
              target,
              dryRun: true,
              dest: effectiveDest,
              actions: actions.map((a) => ({ type: a.type, name: a.name, dest: a.destPath })),
              reviewOnlyHooks: resolved.reviewOnlyHooks,
              skippedMcp: resolved.skippedMcp,
            },
          }),
          true,
        ),
      );
    } else {
      io.stdout(`dry-run: profile '${name}' for ${target}`);
      io.stdout(`dest: ${effectiveDest}`);
      io.stdout("safety: no files were written\n");
      for (const line of actionLines) io.stdout(`  ${line}`);
      if (resolved.reviewOnlyHooks.length > 0) {
        io.stdout(`\n  hooks (review-only, not installed): ${resolved.reviewOnlyHooks.join(", ")}`);
      }
      if (resolved.skippedMcp.length > 0) {
        io.stdout(`  mcp (skipped by default): ${resolved.skippedMcp.join(", ")}`);
      }
      io.stdout("\n(Run with --yes --dest <path> to apply)");
    }
    return 0;
  }

  // Execute install
  const copiedFiles: string[] = [];
  const skippedFiles: string[] = [];

  for (const action of actions) {
    try {
      await fs.access(action.sourcePath);
    } catch {
      io.stderr(`source not found: ${action.sourcePath}`);
      return 1;
    }

    if (!force) {
      try {
        await fs.access(action.destPath);
        skippedFiles.push(action.destPath);
        continue;
      } catch {
        // does not exist — proceed
      }
    }

    const copied = await copyRecursive(action.sourcePath, action.destPath);
    copiedFiles.push(...copied);
  }

  const summary = `install complete: profile '${name}' for ${target}`;

  if (json) {
    io.stdout(
      formatResult(
        createResult({
          stdout: summary,
          data: {
            profile: name,
            target,
            dryRun: false,
            dest: effectiveDest,
            copiedFiles,
            skippedFiles,
            reviewOnlyHooks: resolved.reviewOnlyHooks,
            skippedMcp: resolved.skippedMcp,
          },
        }),
        true,
      ),
    );
  } else {
    io.stdout(summary);
    io.stdout(`dest: ${effectiveDest}`);
    io.stdout("safety: only explicit --dest was written; no global config was mutated\n");
    io.stdout(`copied: ${copiedFiles.length} file${copiedFiles.length !== 1 ? "s" : ""}`);
    if (skippedFiles.length > 0) {
      io.stdout(`skipped (already exists): ${skippedFiles.length}. Use --force to overwrite.`);
    }
    if (resolved.reviewOnlyHooks.length > 0) {
      io.stdout(`\nhooks (review-only, not installed): ${resolved.reviewOnlyHooks.join(", ")}`);
    }
  }

  return 0;
}
