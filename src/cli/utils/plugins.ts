import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { InstallTarget } from "./paths.js";

export interface PluginInfo {
  name: string;
  description?: string;
  maturity?: string;
  skills: string[];
  agents: string[];
  commands: string[];
  templates: string[];
  path: string;
}

const PLUGINS_DIR = "plugins";
const BUNDLES_FILE = "plugin-bundles.json";
const DISALLOWED_TOP_LEVEL_SECTION_TAGS = [
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
const DISALLOWED_TOP_LEVEL_SECTION_RE = new RegExp(
  `^\\s*</?(?<tag>${DISALLOWED_TOP_LEVEL_SECTION_TAGS.join("|")})(?:\\s[^>]*)?>\\s*$`,
  "gm",
);

function stripFencedCode(content: string): string {
  return content.replace(/```[\s\S]*?```/g, "");
}

function findDisallowedTopLevelSectionTags(content: string): string[] {
  const prose = stripFencedCode(content);
  const tags = new Set<string>();
  for (const match of prose.matchAll(DISALLOWED_TOP_LEVEL_SECTION_RE)) {
    tags.add(match.groups?.["tag"] ?? match[1]);
  }
  return [...tags].sort();
}

async function findPluginRoot(startDir: string): Promise<string | null> {
  let current = path.resolve(startDir);
  while (true) {
    try {
      await fs.stat(path.join(current, BUNDLES_FILE));
      return current;
    } catch {
      const parent = path.dirname(current);
      if (parent === current) return null;
      current = parent;
    }
  }
}

async function resolvePluginRoot(cwd: string): Promise<string> {
  // Walk up from cwd first, then from the installed package location.
  const fromCwd = await findPluginRoot(cwd);
  if (fromCwd) return fromCwd;
  const fromPkg = await findPluginRoot(path.dirname(fileURLToPath(import.meta.url)));
  return fromPkg ?? cwd;
}

export async function getPluginBundles(cwd: string): Promise<any[]> {
  const root = await resolvePluginRoot(cwd);
  try {
    const data = await fs.readFile(path.join(root, BUNDLES_FILE), "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed.plugins) ? parsed.plugins : [];
  } catch {
    return [];
  }
}

export async function listPlugins(cwd: string): Promise<PluginInfo[]> {
  const root = await resolvePluginRoot(cwd);
  const bundles = await getPluginBundles(cwd);
  const result: PluginInfo[] = [];

  for (const bundle of bundles) {
    if (!bundle.name) continue;

    const pluginPath = path.join(root, PLUGINS_DIR, bundle.name);

    try {
      await fs.stat(pluginPath);
    } catch {
      continue; // Skip if directory doesn't exist
    }

    result.push({
      name: bundle.name,
      description: bundle.description,
      maturity: bundle.maturity,
      skills: bundle.skills?.map((s: any) => s.name) || [],
      agents: bundle.agents?.map((a: any) => a.name) || [],
      commands: bundle.commands?.map((c: any) => c.name) || [],
      templates: bundle.templates?.map((t: any) => t.name) || [],
      path: pluginPath
    });
  }

  return result;
}

export async function getPluginInfo(cwd: string, name: string): Promise<PluginInfo | null> {
  const plugins = await listPlugins(cwd);
  return plugins.find(p => p.name === name) || null;
}

export async function validatePlugin(cwd: string, name: string): Promise<{ valid: boolean, errors: string[] }> {
  const errors: string[] = [];
  const root = await resolvePluginRoot(cwd);
  const bundles = await getPluginBundles(cwd);
  const bundle = bundles.find(b => b.name === name);

  if (!bundle) {
    return { valid: false, errors: [`Plugin '${name}' not found in ${BUNDLES_FILE}`] };
  }

  const pluginPath = path.join(root, PLUGINS_DIR, name);

  try {
    await fs.stat(pluginPath);
  } catch {
    errors.push(`Plugin directory '${pluginPath}' does not exist.`);
    return { valid: false, errors };
  }

  // Validate manifest files
  const requiredFiles = [
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json"
  ];
  for (const file of requiredFiles) {
    try {
      await fs.stat(path.join(pluginPath, file));
    } catch {
      errors.push(`Missing required file: ${file}`);
    }
  }

  // Validate skills (only if declared)
  const skills: any[] = bundle.skills && Array.isArray(bundle.skills) ? bundle.skills : [];
  if (skills.length > 0) {
    try {
      await fs.stat(path.join(pluginPath, "skills"));
    } catch {
      errors.push(`Missing required directory: skills/`);
    }
    for (const skill of skills) {
      const skillMd = path.join(pluginPath, "skills", skill.name, "SKILL.md");
      try {
        await fs.stat(skillMd);
        const content = await fs.readFile(skillMd, "utf8");
        for (const tag of findDisallowedTopLevelSectionTags(content)) {
          errors.push(
            `Plugin skill ${skill.name} uses XML-like top-level section tag <${tag}>; use Markdown headings instead`,
          );
        }
      } catch {
        errors.push(`Missing SKILL.md for skill: ${skill.name}`);
      }
    }
  }

  // Validate agent files (skip placeholder agents)
  const agents: any[] = bundle.agents && Array.isArray(bundle.agents) ? bundle.agents : [];
  const checkableAgents = agents.filter((a: any) => a.origin !== "placeholder");
  if (checkableAgents.length > 0) {
    try {
      await fs.stat(path.join(pluginPath, "agents"));
    } catch {
      errors.push(`Missing required directory: agents/`);
    }
    for (const agent of checkableAgents) {
      try {
        await fs.stat(path.join(pluginPath, "agents", `${agent.name}.md`));
      } catch {
        errors.push(`Missing agent file: agents/${agent.name}.md`);
      }
    }
  }

  // Validate command files (skip placeholder and root-copy commands)
  const commands: any[] = bundle.commands && Array.isArray(bundle.commands) ? bundle.commands : [];
  const checkableCommands = commands.filter((c: any) =>
    c.origin !== "placeholder" && c.origin !== "root-copy"
  );
  if (checkableCommands.length > 0) {
    try {
      await fs.stat(path.join(pluginPath, "commands"));
    } catch {
      errors.push(`Missing required directory: commands/`);
    }
    for (const cmd of checkableCommands) {
      try {
        await fs.stat(path.join(pluginPath, "commands", `${cmd.name}.md`));
      } catch {
        errors.push(`Missing command file: commands/${cmd.name}.md`);
      }
    }
  }

  // Validate templates if declared
  const templates: any[] = bundle.templates && Array.isArray(bundle.templates) ? bundle.templates : [];
  if (templates.length > 0) {
    try {
      await fs.stat(path.join(pluginPath, "templates"));
    } catch {
      errors.push(`Missing required directory: templates/`);
    }
    for (const tmpl of templates) {
      try {
        await fs.stat(path.join(pluginPath, "templates", `${tmpl.name}.md`));
      } catch {
        errors.push(`Missing template file: templates/${tmpl.name}.md`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function copyRecursive(src: string, dest: string): Promise<string[]> {
  const stats = await fs.stat(src);
  const copiedFiles: string[] = [];

  if (stats.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      const copied = await copyRecursive(srcPath, destPath);
      copiedFiles.push(...copied);
    }
  } else {
    const destDir = path.dirname(dest);
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(src, dest);
    copiedFiles.push(dest);
  }

  return copiedFiles;
}

export async function installPlugin(
  cwd: string,
  name: string,
  target: InstallTarget | "generic",
  destPath: string,
  dryRun: boolean,
  force: boolean = false
): Promise<{ success: boolean, message: string, copiedFiles?: string[] }> {
  const pluginInfo = await getPluginInfo(cwd, name);
  if (!pluginInfo) {
    return { success: false, message: `Plugin '${name}' not found.` };
  }

  try {
    if (!dryRun) {
      if (!force) {
        try {
          const stats = await fs.stat(destPath);
          if (stats.isDirectory()) {
            const files = await fs.readdir(destPath);
            if (files.length > 0) {
              return { success: false, message: `Destination directory '${destPath}' is not empty. Use --force to overwrite.` };
            }
          }
        } catch {
          // Dest does not exist, which is fine
        }
      }
    }

    const copiedFiles: string[] = [];

    if (!dryRun) {
      await fs.mkdir(destPath, { recursive: true });
      copiedFiles.push(...await copyRecursive(pluginInfo.path, destPath));
    }

    return {
      success: true,
      message: dryRun ? `Would install plugin '${name}' to ${destPath}` : `Successfully installed plugin '${name}' to ${destPath}`,
      copiedFiles: dryRun ? [] : copiedFiles
    };

  } catch (error: any) {
    return { success: false, message: `Failed to install plugin: ${error.message}` };
  }
}
