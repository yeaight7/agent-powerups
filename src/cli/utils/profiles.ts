import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogEntry, CatalogService } from "./catalog.js";
import { getPluginBundles } from "./plugins.js";

export interface ProfileHook {
  name: string;
  mode: "review-only";
}

export interface Profile {
  name: string;
  description: string;
  maturity: string;
  skills: string[];
  commands: string[];
  hooks: ProfileHook[];
  plugin_bundles: string[];
  mcp: string[];
}

export interface ResolvedSkill {
  name: string;
  sourcePath: string;
  fromBundle?: string;
}

export interface ResolvedCommand {
  name: string;
  sourcePath: string;
  fromBundle?: string;
}

export interface ResolvedBundle {
  name: string;
  sourcePath: string;
}

export interface ResolvedProfile {
  profile: Profile;
  skills: ResolvedSkill[];
  commands: ResolvedCommand[];
  bundles: ResolvedBundle[];
  reviewOnlyHooks: string[];
  skippedMcp: string[];
  unresolvedSkills: string[];
  unresolvedCommands: string[];
}

const PROFILES_FILE = "profiles.json";

export async function loadProfiles(cwd: string): Promise<Profile[]> {
  try {
    const raw = await fs.readFile(path.join(cwd, PROFILES_FILE), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.profiles) ? parsed.profiles : [];
  } catch {
    return [];
  }
}

export async function getProfile(cwd: string, name: string): Promise<Profile | null> {
  const profiles = await loadProfiles(cwd);
  return profiles.find((p) => p.name === name) ?? null;
}

function resolveCommandPath(
  entry: CatalogEntry,
  target: string,
): string {
  if (entry.targets) {
    const variant = (entry.targets as Record<string, string>)[target];
    if (variant) return variant;
    const generic = (entry.targets as Record<string, string>)["generic"];
    if (generic) return generic;
  }
  return entry.path;
}

export async function resolveProfile(
  cwd: string,
  profile: Profile,
  service: CatalogService,
  target: string,
): Promise<ResolvedProfile> {
  const bundles = await getPluginBundles(cwd);

  const skills: ResolvedSkill[] = [];
  const commands: ResolvedCommand[] = [];
  const resolvedBundles: ResolvedBundle[] = [];
  const reviewOnlyHooks: string[] = profile.hooks.map((h) => h.name);
  const skippedMcp = [...profile.mcp];
  const unresolvedSkills: string[] = [];
  const unresolvedCommands: string[] = [];

  // Resolve direct skills
  for (const skillName of profile.skills) {
    try {
      const entry = service.getAsset(skillName);
      skills.push({
        name: skillName,
        sourcePath: path.resolve(service.repoRoot, entry.path),
      });
    } catch {
      unresolvedSkills.push(skillName);
    }
  }

  // Resolve direct commands
  for (const cmdName of profile.commands) {
    try {
      const entry = service.getAsset(cmdName);
      const cmdPath = resolveCommandPath(entry, target);
      commands.push({
        name: cmdName,
        sourcePath: path.resolve(service.repoRoot, cmdPath),
      });
    } catch {
      unresolvedCommands.push(cmdName);
    }
  }

  // Resolve plugin bundles
  for (const bundleName of profile.plugin_bundles) {
    const bundle = bundles.find((b: any) => b.name === bundleName);
    if (!bundle) {
      unresolvedSkills.push(`[bundle] ${bundleName}`);
      continue;
    }
    resolvedBundles.push({
      name: bundleName,
      sourcePath: path.resolve(cwd, "plugins", bundleName),
    });
  }

  return {
    profile,
    skills,
    commands,
    bundles: resolvedBundles,
    reviewOnlyHooks,
    skippedMcp,
    unresolvedSkills,
    unresolvedCommands,
  };
}

export interface InstallAction {
  type: "skill" | "command" | "bundle";
  name: string;
  sourcePath: string;
  destPath: string;
}

export function buildInstallActions(
  resolved: ResolvedProfile,
  dest: string,
): InstallAction[] {
  const actions: InstallAction[] = [];

  for (const skill of resolved.skills) {
    actions.push({
      type: "skill",
      name: skill.name,
      sourcePath: skill.sourcePath,
      destPath: path.join(dest, "skills", skill.name),
    });
  }

  for (const cmd of resolved.commands) {
    const fileName = path.basename(cmd.sourcePath);
    actions.push({
      type: "command",
      name: cmd.name,
      sourcePath: cmd.sourcePath,
      destPath: path.join(dest, "commands", fileName),
    });
  }

  for (const bundle of resolved.bundles) {
    actions.push({
      type: "bundle",
      name: bundle.name,
      sourcePath: bundle.sourcePath,
      destPath: path.join(dest, "plugins", bundle.name),
    });
  }

  return actions;
}
