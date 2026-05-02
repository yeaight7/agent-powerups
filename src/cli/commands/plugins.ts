import os from "node:os";
import path from "node:path";
import { type CliIO } from "../apx.js";
import { hasFlag, parseOption } from "../utils/args.js";
import { createResult, formatResult, type ExecutionResult } from "../utils/result.js";
import { listPlugins, getPluginInfo, validatePlugin, installPlugin } from "../utils/plugins.js";

function getAgentPluginDir(target: string): string {
  const homeDir = os.homedir();
  if (target === "codex") {
    return path.join(homeDir, ".codex", "plugins");
  } else if (target === "claude-code") {
    return path.join(homeDir, ".claude", "plugins");
  }
  return process.cwd();
}

export async function runPluginsListCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const plugins = await listPlugins(io.cwd);

  if (json) {
    io.stdout(formatResult(createResult({ stdout: "success", data: plugins }), true));
    return 0;
  }

  if (plugins.length === 0) {
    io.stdout("No plugins found.");
    return 0;
  }

  io.stdout("Available Plugins:\n");
  for (const p of plugins) {
    io.stdout(`  ${p.name}`);
    if (p.description) io.stdout(`    ${p.description}`);
    io.stdout(`    Status: ${p.maturity || "unknown"}`);
    io.stdout("");
  }
  
  return 0;
}

export async function runPluginsInfoCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const nameIdx = argv.indexOf("info") + 1;
  const name = argv[nameIdx];

  if (!name || name.startsWith("--")) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: "Missing plugin name" }), json));
    return 1;
  }

  const info = await getPluginInfo(io.cwd, name);

  if (!info) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: `Plugin '${name}' not found.` }), json));
    return 1;
  }

  if (json) {
    io.stdout(formatResult(createResult({ stdout: "success", data: info }), true));
    return 0;
  }

  io.stdout(`Plugin: ${info.name}`);
  if (info.description) io.stdout(`Description: ${info.description}`);
  if (info.maturity) io.stdout(`Status: ${info.maturity}`);
  io.stdout(`Path: ${info.path}`);
  
  io.stdout(`\nSkills (${info.skills.length}):`);
  for (const s of info.skills) io.stdout(`  - ${s}`);

  io.stdout(`\nAgents (${info.agents.length}):`);
  for (const a of info.agents) io.stdout(`  - ${a}`);

  io.stdout(`\nCommands (${info.commands.length}):`);
  for (const c of info.commands) io.stdout(`  - ${c}`);

  return 0;
}

export async function runPluginsValidateCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const isAll = hasFlag(argv, "--all");

  if (isAll) {
    const plugins = await listPlugins(io.cwd);
    let allValid = true;
    const results: any = {};

    for (const plugin of plugins) {
      const result = await validatePlugin(io.cwd, plugin.name);
      results[plugin.name] = result;
      if (!result.valid) allValid = false;
    }

    if (json) {
      io.stdout(formatResult(createResult({ exitCode: allValid ? 0 : 1, stdout: allValid ? "All plugins valid" : "Validation failed", data: results }), true));
      return allValid ? 0 : 1;
    }

    for (const [name, result] of Object.entries(results)) {
      const res = result as { valid: boolean, errors: string[] };
      if (res.valid) {
        io.stdout(`[PASS] ${name}`);
      } else {
        io.stderr(`[FAIL] ${name}`);
        for (const err of res.errors) io.stderr(`       - ${err}`);
      }
    }
    return allValid ? 0 : 1;
  }

  const nameIdx = argv.indexOf("validate") + 1;
  const name = argv[nameIdx];

  if (!name || name.startsWith("--")) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: "Missing plugin name or --all flag" }), json));
    return 1;
  }

  const result = await validatePlugin(io.cwd, name);

  if (json) {
    io.stdout(formatResult(createResult({ exitCode: result.valid ? 0 : 1, stdout: result.valid ? "Valid" : "Invalid", data: result.errors }), true));
    return result.valid ? 0 : 1;
  }

  if (result.valid) {
    io.stdout(`Plugin '${name}' is valid.`);
    return 0;
  } else {
    io.stderr(`Plugin '${name}' validation failed:`);
    for (const err of result.errors) {
      io.stderr(`  - ${err}`);
    }
    return 1;
  }
}

export async function runPluginsInstallCommand(argv: string[], io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const yes = hasFlag(argv, "--yes");
  const force = hasFlag(argv, "--force");
  const dryRun = !yes || hasFlag(argv, "--dry-run");

  const nameIdx = argv.indexOf("install") + 1;
  const name = argv[nameIdx];

  if (!name || name.startsWith("--")) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: "Missing plugin name" }), json));
    return 1;
  }

  const target = parseOption(argv, "--target");
  if (!target || !["codex", "claude-code", "generic"].includes(target)) {
    io.stderr(formatResult(createResult({ exitCode: 1, stderr: "Missing or invalid --target. Must be one of: codex, claude-code, generic" }), json));
    return 1;
  }

  let destPath = parseOption(argv, "--dest");
  if (!destPath) {
    if (target === "generic") {
      destPath = path.join(process.cwd(), name);
    } else {
      const baseDir = getAgentPluginDir(target);
      destPath = path.join(baseDir, name);
    }
  }

  const result = await installPlugin(io.cwd, name, target as any, destPath, dryRun, force);

  if (json) {
    io.stdout(formatResult(createResult({ exitCode: result.success ? 0 : 1, stdout: result.message, data: result.copiedFiles }), true));
    return result.success ? 0 : 1;
  }

  if (result.success) {
    io.stdout(result.message);
    if (dryRun) {
      io.stdout(`(Run with --yes to actually install)`);
    }
    return 0;
  } else {
    io.stderr(result.message);
    return 1;
  }
}
