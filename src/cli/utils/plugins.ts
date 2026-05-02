import fs from "node:fs/promises";
import path from "node:path";

import { InstallTarget } from "./paths.js";

export interface PluginInfo {
  name: string;
  description?: string;
  maturity?: string;
  skills: string[];
  agents: string[];
  commands: string[];
  path: string;
}

const PLUGINS_DIR = "plugins";
const BUNDLES_FILE = "plugin-bundles.json";

export async function getPluginBundles(cwd: string): Promise<any[]> {
  try {
    const data = await fs.readFile(path.join(cwd, BUNDLES_FILE), "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed.plugins) ? parsed.plugins : [];
  } catch (error) {
    return [];
  }
}

export async function listPlugins(cwd: string): Promise<PluginInfo[]> {
  const bundles = await getPluginBundles(cwd);
  const result: PluginInfo[] = [];

  for (const bundle of bundles) {
    if (!bundle.name) continue;
    
    const pluginPath = path.join(cwd, PLUGINS_DIR, bundle.name);
    
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
  const bundles = await getPluginBundles(cwd);
  const bundle = bundles.find(b => b.name === name);
  
  if (!bundle) {
    return { valid: false, errors: [`Plugin '${name}' not found in ${BUNDLES_FILE}`] };
  }

  const pluginPath = path.join(cwd, PLUGINS_DIR, name);
  
  try {
    await fs.stat(pluginPath);
  } catch {
    errors.push(`Plugin directory '${pluginPath}' does not exist.`);
    return { valid: false, errors };
  }

  const requiredDirs = ["skills", "commands", "agents"];
  for (const dir of requiredDirs) {
    try {
      await fs.stat(path.join(pluginPath, dir));
    } catch {
      errors.push(`Missing required directory: ${dir}/`);
    }
  }

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

  if (bundle.skills && Array.isArray(bundle.skills)) {
    for (const skill of bundle.skills) {
      try {
        await fs.stat(path.join(pluginPath, "skills", skill.name, "SKILL.md"));
      } catch {
        errors.push(`Missing SKILL.md for skill: ${skill.name}`);
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
