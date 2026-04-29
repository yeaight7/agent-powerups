import type { CatalogService } from "../utils/catalog.js";
import { checkRequirements, installMissingRequirements, type InstallMissingOptions } from "../utils/requirements.js";

export interface CheckResult {
  exitCode: number;
  output: string;
  warnings: string[];
  actions: string[];
}

function formatRequirementLines(assetName: string, hasFailures: boolean, details: string[]): string {
  const status = hasFailures ? "FAIL" : "OK";
  return [`${assetName}: ${status}`, ...details.map((line) => `  ${line}`)].join("\n");
}

export async function runCheckCommand(
  service: CatalogService,
  assetName?: string,
  installOptions?: InstallMissingOptions,
): Promise<CheckResult> {
  const assets = assetName ? [service.getAsset(assetName)] : service.listAssets();
  const blocks: string[] = [];
  let failures = 0;
  const warnings: string[] = [];
  const actions: string[] = [];

  for (const asset of assets) {
    const statuses = checkRequirements(asset.requires);
    if (statuses.length === 0) {
      blocks.push(`${asset.name}: OK\n  no external requirements declared`);
      continue;
    }

    const details = statuses.map((status) => {
      const suffix = status.status;
      const hint = status.ok || !status.installHint ? "" : ` | install: ${status.installHint}`;
      return `${status.label}=${suffix}${hint}`;
    });
    const hasFailures = statuses.some((status) => status.status === "MISSING");
    if (hasFailures) {
      failures += 1;
      if (installOptions?.installMissing) {
        const installResult = await installMissingRequirements(asset.name, asset.requires, installOptions);
        if (installResult.output) {
          blocks.push(installResult.output);
        }
        warnings.push(...installResult.warnings);
        actions.push(...installResult.actions);
      }
    }
    blocks.push(formatRequirementLines(asset.name, hasFailures, details));
  }

  return {
    exitCode: failures > 0 ? 1 : 0,
    output: blocks.join("\n\n"),
    warnings,
    actions,
  };
}
