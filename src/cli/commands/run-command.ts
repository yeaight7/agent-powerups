import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { runValidateCatalogCommand, runValidateSkillsCommand } from "./validate.js";
import type { CatalogService } from "../utils/catalog.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

const execFileAsync = promisify(execFile);

interface CheckRun {
  name: string;
  command: string;
  args: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  skipped?: boolean;
}

export interface ShipCheckData {
  checks: CheckRun[];
}

export function resolveCheckExecutable(
  command: string,
  args: string[],
  platform: NodeJS.Platform = process.platform,
): { command: string; args: string[] } {
  if (platform === "win32" && command === "npm") {
    return { command: "npm.cmd", args };
  }
  return { command, args };
}

async function runCheck(cwd: string, name: string, command: string, args: string[], env = process.env): Promise<CheckRun> {
  const { command: executable, args: executableArgs } = resolveCheckExecutable(command, args);
  const launchCommand = process.platform === "win32" && executable.endsWith(".cmd") ? "cmd.exe" : executable;
  const launchArgs = process.platform === "win32" && executable.endsWith(".cmd")
    ? ["/d", "/s", "/c", executable, ...executableArgs]
    : executableArgs;
  try {
    const result = await execFileAsync(launchCommand, launchArgs, {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 5,
    });
    return {
      name,
      command: executable,
      args: executableArgs,
      exitCode: 0,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (error) {
    const maybeError = error as { code?: number; stdout?: string; stderr?: string; message?: string };
    return {
      name,
      command: executable,
      args: executableArgs,
      exitCode: typeof maybeError.code === "number" ? maybeError.code : 1,
      stdout: maybeError.stdout ?? "",
      stderr: maybeError.stderr ?? maybeError.message ?? String(error),
    };
  }
}

function summarizeChecks(checks: CheckRun[]): string {
  const lines = ["ship-check"];
  for (const check of checks) {
    const status = check.exitCode === 0 ? "OK" : "FAIL";
    const suffix = check.skipped ? " (skipped nested)" : "";
    lines.push(`${status} ${check.name}${suffix}`);
  }
  return lines.join("\n");
}

export async function runShipCheckCommand(
  service: CatalogService,
  options: { full: boolean; env?: NodeJS.ProcessEnv },
): Promise<ExecutionResult<ShipCheckData>> {
  const asset = service.getAsset("ship-check");
  if (asset.type !== "command" || asset.run?.kind !== "ship-check") {
    throw new Error("ship-check is not configured as an executable command");
  }

  const checks: CheckRun[] = [];
  checks.push(await runCheck(service.repoRoot, "git status --short", "git", ["status", "--short"], options.env));
  checks.push(await runCheck(service.repoRoot, "git diff --check", "git", ["diff", "--check"], options.env));

  const catalogResult = await runValidateCatalogCommand(service);
  checks.push({ name: "apx validate catalog", command: "apx", args: ["validate", "catalog"], exitCode: catalogResult.exitCode, stdout: catalogResult.stdout, stderr: catalogResult.stderr ?? "" });
  const skillsResult = await runValidateSkillsCommand(service);
  checks.push({ name: "apx validate skills", command: "apx", args: ["validate", "skills"], exitCode: skillsResult.exitCode, stdout: skillsResult.stdout, stderr: skillsResult.stderr ?? "" });

  if (options.full) {
    if (process.env.APX_SHIP_CHECK_NESTED === "1") {
      checks.push({
        name: "npm test",
        command: "npm",
        args: ["test"],
        exitCode: 0,
        stdout: "",
        stderr: "",
        skipped: true,
      });
    } else {
      checks.push(
        await runCheck(service.repoRoot, "npm test", "npm", ["test"], {
          ...options.env,
          APX_SHIP_CHECK_NESTED: "1",
        }),
      );
    }
  }

  const failingChecks = checks.filter((check) => check.exitCode !== 0);
  const dirtyStatus = checks.find((check) => check.name === "git status --short")?.stdout.trim();
  const warnings = dirtyStatus ? ["working tree has changes"] : [];
  const stderr = failingChecks.flatMap((check) => [check.name, check.stderr].filter(Boolean)).join("\n");

  return createResult({
    exitCode: failingChecks.length > 0 ? 1 : 0,
    stdout: summarizeChecks(checks),
    stderr,
    warnings,
    actions: [],
    data: { checks },
  });
}
