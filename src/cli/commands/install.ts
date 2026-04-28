import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import { copyAsset } from "../utils/copy.js";
import { defaultInstallDestination, resolveAssetPath, type InstallTarget } from "../utils/paths.js";

export interface InstallOptions {
  cwd: string;
  target: InstallTarget;
  dryRun: boolean;
  dest?: string;
}

export interface InstallResult {
  exitCode: number;
  output: string;
}

export async function runInstallCommand(
  service: CatalogService,
  assetName: string,
  options: InstallOptions,
): Promise<InstallResult> {
  const asset = service.getAsset(assetName);
  const sourcePath = resolveAssetPath(service.repoRoot, asset.path);
  const destinationPath = path.resolve(options.dest ?? defaultInstallDestination(options.cwd, assetName));

  if (options.dryRun || !options.dest) {
    return {
      exitCode: 0,
      output: [
        "dry-run: no files were changed",
        `asset: ${asset.name}`,
        `target: ${options.target}`,
        `source: ${sourcePath}`,
        `destination: ${destinationPath}`,
        `would copy: ${asset.path}`,
        "safety: global config, MCP files, shell profiles, and home-directory agent configs are not mutated",
      ].join("\n"),
    };
  }

  await copyAsset(sourcePath, destinationPath);
  return {
    exitCode: 0,
    output: [
      "copy complete",
      `asset: ${asset.name}`,
      `target: ${options.target}`,
      `destination: ${destinationPath}`,
      "safety: only explicit destination was written",
    ].join("\n"),
  };
}
