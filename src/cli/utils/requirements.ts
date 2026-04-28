import { spawnSync } from "node:child_process";

export interface RequirementStatus {
  label: string;
  status: "OK" | "MISSING" | "DECLARED";
  ok: boolean;
  installHint?: string;
}

const INSTALL_HINTS: Record<string, string> = {
  claude: "Install and configure Claude Code CLI, then run: claude --version",
  markitdown: "python -m pip install markitdown",
  gemini: "Install and configure Gemini CLI, then run: gemini --version",
  defuddle: "npm install -g defuddle",
  gh: "Install GitHub CLI with your platform package manager.",
};

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
