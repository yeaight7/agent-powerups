import { spawnSync } from "node:child_process";
import readline from "node:readline/promises";

export interface RequirementStatus {
  label: string;
  status: "OK" | "MISSING" | "DECLARED";
  ok: boolean;
  installHint?: string;
}

export interface InstallMissingOptions {
  installMissing: boolean;
  dryRun: boolean;
  yes: boolean;
}

export interface RequirementInstallResult {
  output: string;
  warnings: string[];
  actions: string[];
}

const INSTALL_HINTS: Record<string, string> = {
  claude: "Install and configure Claude Code CLI, then run: claude --version",
  markitdown: "python -m pip install markitdown",
  gemini: "Install and configure Gemini CLI, then run: gemini --version",
  defuddle: "npm install -g defuddle",
  gh: "Install GitHub CLI with your platform package manager.",
};

interface RequirementInstaller {
  label: string;
  command: string;
  args: string[];
}

export function commandAvailable(command: string): boolean {
  const checker = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(checker, [command], { stdio: "ignore", shell: false });
  return result.status === 0;
}

export function pythonPackageAvailable(packageName: string): boolean {
  const result = spawnSync("python", ["-c", `import importlib.util; raise SystemExit(0 if importlib.util.find_spec("${packageName}") else 1)`], {
    stdio: "ignore",
    shell: false,
  });
  return result.status === 0;
}

export function checkRequirements(requires?: {
  commands?: string[];
  python_packages?: string[];
  npm_packages?: string[];
}): RequirementStatus[] {
  if (!requires) {
    return [];
  }

  const statuses: RequirementStatus[] = [];

  for (const command of requires.commands ?? []) {
    const ok = commandAvailable(command);
    statuses.push({
      label: `command:${command}`,
      status: ok ? "OK" : "MISSING",
      ok,
      installHint: INSTALL_HINTS[command],
    });
  }

  for (const packageName of requires.python_packages ?? []) {
    const ok = pythonPackageAvailable(packageName);
    statuses.push({
      label: `python:${packageName}`,
      status: ok ? "OK" : "MISSING",
      ok,
      installHint: INSTALL_HINTS[packageName],
    });
  }

  for (const packageName of requires.npm_packages ?? []) {
    statuses.push({
      label: `npm:${packageName}`,
      status: "DECLARED",
      ok: true,
      installHint: INSTALL_HINTS[packageName],
    });
  }

  return statuses;
}

function installersForRequirements(requires?: {
  commands?: string[];
  python_packages?: string[];
  npm_packages?: string[];
}): RequirementInstaller[] {
  const installers: RequirementInstaller[] = [];
  for (const packageName of requires?.python_packages ?? []) {
    if (packageName === "markitdown") {
      installers.push({
        label: "python:markitdown",
        command: "python",
        args: ["-m", "pip", "install", "markitdown"],
      });
    }
  }
  for (const packageName of requires?.npm_packages ?? []) {
    if (packageName === "defuddle") {
      installers.push({
        label: "npm:defuddle",
        command: process.platform === "win32" ? "npm.cmd" : "npm",
        args: ["install", "-g", "defuddle"],
      });
    }
  }
  return installers;
}

async function confirmInstall(assetName: string, installers: RequirementInstaller[]): Promise<boolean> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return false;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const commands = installers.map((installer) => `${installer.command} ${installer.args.join(" ")}`).join("; ");
    const answer = await rl.question(`Install missing requirements for ${assetName}? ${commands} [y/N] `);
    return answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes";
  } finally {
    rl.close();
  }
}

export async function installMissingRequirements(
  assetName: string,
  requires: Parameters<typeof checkRequirements>[0],
  options: InstallMissingOptions,
): Promise<RequirementInstallResult> {
  const installers = installersForRequirements(requires);
  if (installers.length === 0) {
    return {
      output: "install-missing: no supported automatic installers for missing requirements",
      warnings: [`${assetName}: missing requirements require manual install`],
      actions: [],
    };
  }

  const actions = installers.map((installer) => {
    const commandText = `${installer.command} ${installer.args.join(" ")}`;
    return options.dryRun ? `would install ${installer.label}: ${commandText}` : `install ${installer.label}: ${commandText}`;
  });

  if (options.dryRun) {
    return {
      output: ["install-missing dry-run: no commands were run", ...actions].join("\n"),
      warnings: [],
      actions,
    };
  }

  const approved = options.yes || (await confirmInstall(assetName, installers));
  if (!approved) {
    return {
      output: "install-missing: declined or non-interactive without --yes",
      warnings: [`${assetName}: install-missing not approved`],
      actions: [],
    };
  }

  const warnings: string[] = [];
  const completedActions: string[] = [];
  for (const installer of installers) {
    const result = spawnSync(installer.command, installer.args, { stdio: "inherit", shell: false });
    const action = `install ${installer.label}: ${installer.command} ${installer.args.join(" ")}`;
    completedActions.push(action);
    if (result.status !== 0) {
      warnings.push(`${installer.label} installer exited with code ${result.status ?? 1}`);
    }
  }

  return {
    output: warnings.length === 0 ? "install-missing: installers completed" : "install-missing: installer failures reported",
    warnings,
    actions: completedActions,
  };
}
