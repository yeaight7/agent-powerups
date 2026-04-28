import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogService } from "../utils/catalog.js";
import { checkRequirements } from "../utils/requirements.js";

export async function runDoctorCommand(service: CatalogService, cwd: string): Promise<string> {
  const lines: string[] = [];

  lines.push(`node: OK (${process.version})`);
  lines.push(`catalog.json: OK (${service.getCatalogPath()})`);

  const skillsPath = path.resolve(service.repoRoot, "skills");
  await fs.access(skillsPath);
  lines.push(`skills: OK (${skillsPath})`);

  const installRoot = path.resolve(cwd, ".agent-powerups", "installed");
  lines.push(`install-root: OK (${installRoot})`);

  const missingRequirements = service
    .listAssets()
    .flatMap((asset) =>
      checkRequirements(asset.requires)
        .filter((status) => !status.ok)
        .map((status) => `${asset.name}:${status.label}`),
    );

  if (missingRequirements.length > 0) {
    lines.push(`warnings: ${missingRequirements.join(", ")}`);
  } else {
    lines.push("warnings: none");
  }

  return lines.join("\n");
}
