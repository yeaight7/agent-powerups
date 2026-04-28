import path from "node:path";

export type InstallTarget = "codex" | "claude-code" | "generic";

export const INSTALL_TARGETS: InstallTarget[] = ["codex", "claude-code", "generic"];

export function defaultInstallDestination(cwd: string, assetName: string): string {
  return path.resolve(cwd, ".agent-powerups", "installed", assetName);
}

export function resolveAssetPath(repoRoot: string, relativePath: string): string {
  return path.resolve(repoRoot, relativePath);
}
