import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  runAuditPluginsCommand,
  runAuditRepoCommand,
  type AuditCheck,
} from "./audit.js";
import { runSecurityAuditCommand } from "./security-audit.js";
import { runValidateCatalogCommand, runValidateSkillsCommand } from "./validate.js";
import { runPluginsValidateCommand } from "./plugins.js";
import type { CatalogService } from "../utils/catalog.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

const execFileAsync = promisify(execFile);

export interface GateStep {
  name: string;
  status: "pass" | "warn" | "fail" | "skip";
  detail?: string;
}

export interface QualityGateData {
  scope: string;
  steps: GateStep[];
  passCount: number;
  warnCount: number;
  failCount: number;
  skipCount: number;
}

const NPM_CMD = process.platform === "win32" ? "npm.cmd" : "npm";

function isNestedRun(): boolean {
  return process.env["APX_DOCTOR_NESTED"] === "1" || process.env["npm_lifecycle_event"] === "test";
}

function npmLaunchArgs(npmArgs: string[]): { command: string; args: string[] } {
  if (process.platform === "win32") {
    return { command: "cmd.exe", args: ["/d", "/s", "/c", NPM_CMD, ...npmArgs] };
  }
  return { command: NPM_CMD, args: npmArgs };
}

async function runNpm(args: string[], cwd: string): Promise<GateStep> {
  const name = `npm ${args.join(" ")}`;
  const { command, args: launchArgs } = npmLaunchArgs(args);
  try {
    await execFileAsync(command, launchArgs, {
      cwd,
      shell: false,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 5,
      env: { ...process.env, APX_DOCTOR_NESTED: "1" },
    });
    return { name, status: "pass" };
  } catch (err) {
    const e = err as { stderr?: string; stdout?: string; message?: string };
    return { name, status: "fail", detail: (e.stderr ?? e.stdout ?? e.message ?? String(err)).slice(0, 200) };
  }
}

async function runNpmBestEffort(args: string[], cwd: string): Promise<GateStep> {
  const step = await runNpm(args, cwd);
  if (step.status === "fail" && step.detail?.includes("Missing script")) {
    return { name: step.name, status: "skip", detail: "script not defined in package.json" };
  }
  return step;
}

function auditToStep(name: string, result: ExecutionResult<{ failCount: number; warnCount: number; checks: AuditCheck[] }>): GateStep {
  if (!result.data) return { name, status: "fail", detail: "no data returned" };
  if (result.data.failCount > 0) return { name, status: "fail", detail: `${result.data.failCount} check(s) failed` };
  if (result.data.warnCount > 0) return { name, status: "warn", detail: `${result.data.warnCount} warning(s)` };
  return { name, status: "pass" };
}

function formatSteps(steps: GateStep[]): string {
  return steps
    .map((s) => `  [${s.status.toUpperCase().padEnd(4)}] ${s.name}${s.detail ? ": " + s.detail : ""}`)
    .join("\n");
}

export async function runQualityGateCommand(
  service: CatalogService,
  scope: string,
): Promise<ExecutionResult<QualityGateData>> {
  const VALID_SCOPES = ["repo", "plugins", "release"];
  if (!VALID_SCOPES.includes(scope)) {
    return createResult({
      exitCode: 1,
      stdout: `quality-gate: invalid scope '${scope}'. Expected: ${VALID_SCOPES.join(", ")}`,
      stderr: `invalid scope: ${scope}`,
      data: { scope, steps: [], passCount: 0, warnCount: 0, failCount: 1, skipCount: 0 },
    });
  }

  const steps: GateStep[] = [];
  const cwd = service.repoRoot;

  if (scope === "repo") {
    steps.push(await runNpm(["run", "build"], cwd));

    const skillsResult = await runValidateSkillsCommand(service);
    steps.push({
      name: "apx validate skills",
      status: skillsResult.exitCode === 0 ? "pass" : "fail",
      detail: skillsResult.exitCode !== 0 ? skillsResult.stdout.slice(0, 200) : undefined,
    });

    const catalogResult = await runValidateCatalogCommand(service);
    steps.push({
      name: "apx validate catalog",
      status: catalogResult.exitCode === 0 ? "pass" : "fail",
      detail: catalogResult.exitCode !== 0 ? catalogResult.stdout.slice(0, 200) : undefined,
    });

    steps.push(auditToStep("apx audit repo", await runAuditRepoCommand(service)));

    const secResult = await runSecurityAuditCommand(cwd, { paths: ["."], all: false });
    steps.push({
      name: "apx security-audit",
      status: secResult.exitCode === 0 ? "pass" : secResult.exitCode === 1 ? "warn" : "fail",
      detail: secResult.exitCode > 0 ? secResult.data?.p0Count !== undefined
        ? `P0=${secResult.data.p0Count} P1=${secResult.data.p1Count}`
        : undefined : undefined,
    });
  }

  if (scope === "plugins") {
    const argv = ["plugins", "validate", "--all", "--json"];
    const pluginsResult = await new Promise<ExecutionResult>((resolve) => {
      const lines: string[] = [];
      const errLines: string[] = [];
      runPluginsValidateCommand(argv, {
        cwd,
        stdout: (l) => lines.push(l),
        stderr: (l) => errLines.push(l),
      }).then((code) => {
        const out = lines.join("\n");
        resolve(createResult({ exitCode: code, stdout: out, stderr: errLines.join("\n") }));
      });
    });
    steps.push({
      name: "apx plugins validate --all",
      status: pluginsResult.exitCode === 0 ? "pass" : "fail",
      detail: pluginsResult.exitCode !== 0 ? pluginsResult.stdout.slice(0, 200) : undefined,
    });

    steps.push(auditToStep("apx audit plugins", await runAuditPluginsCommand(service)));
  }

  if (scope === "release") {
    steps.push(await runNpm(["run", "build"], cwd));

    if (isNestedRun()) {
      steps.push({ name: "npm test", status: "skip", detail: "nested test run guard" });
    } else {
      steps.push(await runNpm(["test"], cwd));
    }

    steps.push(await runNpmBestEffort(["run", "release:check"], cwd));

    steps.push(auditToStep("apx audit repo", await runAuditRepoCommand(service)));
    steps.push(auditToStep("apx audit plugins", await runAuditPluginsCommand(service)));

    const secResult = await runSecurityAuditCommand(cwd, { paths: ["."], all: false });
    steps.push({
      name: "apx security-audit",
      status: secResult.exitCode === 0 ? "pass" : secResult.exitCode === 1 ? "warn" : "fail",
      detail: secResult.exitCode > 0 && secResult.data
        ? `P0=${secResult.data.p0Count} P1=${secResult.data.p1Count}`
        : undefined,
    });
  }

  const passCount = steps.filter((s) => s.status === "pass").length;
  const warnCount = steps.filter((s) => s.status === "warn").length;
  const failCount = steps.filter((s) => s.status === "fail").length;
  const skipCount = steps.filter((s) => s.status === "skip").length;
  const exitCode = failCount > 0 ? 1 : 0;

  const summary = `quality-gate [${scope}]: ${passCount} pass, ${warnCount} warn, ${failCount} fail, ${skipCount} skip`;

  return createResult({
    exitCode,
    stdout: `${summary}\n${formatSteps(steps)}`,
    stderr: failCount > 0 ? summary : "",
    warnings: steps.filter((s) => s.status === "warn").map((s) => `${s.name}: ${s.detail ?? ""}`),
    actions: [],
    data: { scope, steps, passCount, warnCount, failCount, skipCount },
  });
}
