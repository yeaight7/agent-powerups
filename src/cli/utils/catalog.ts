import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

export const ALLOWED_TYPES = [
  "skill",
  "command",
  "mcp-config",
  "agents-md-template",
  "hook",
  "workflow",
  "example",
  "script",
  "pack",
] as const;

const catalogEntrySchema = z.object({
  name: z.string().min(1),
  type: z.enum(ALLOWED_TYPES),
  summary: z.string().min(1),
  path: z.string().min(1),
  compatible_with: z.array(z.enum(["claude-code", "codex", "gemini-cli", "cursor", "generic"])).min(1),
  tags: z.array(z.string().min(1)),
  maturity: z.enum(["draft", "beta", "stable", "experimental"]),
  use_when: z.union([z.string().min(1), z.array(z.string().min(1))]).optional(),
  avoid_when: z.union([z.string().min(1), z.array(z.string().min(1))]).optional(),
  signals: z.array(z.string().min(1)).optional(),
  capabilities: z.array(z.string().min(1)).optional(),
  routing_priority: z.number().int().optional(),
  activation: z.string().min(1).optional(),
  check_policy: z.enum(["none", "requires-only", "mcp-only", "manual"]).optional(),
  requires: z
    .object({
      commands: z.array(z.string().min(1)).optional(),
      python_packages: z.array(z.string().min(1)).optional(),
      npm_packages: z.array(z.string().min(1)).optional(),
    })
    .optional(),
  targets: z
    .object({
      codex: z.string().min(1).optional(),
      "claude-code": z.string().min(1).optional(),
      generic: z.string().min(1).optional(),
    })
    .optional(),
  run: z
    .object({
      kind: z.enum(["ship-check"]),
    })
    .optional(),
  mcp: z
    .object({
      required_env: z.array(z.string().min(1)).optional(),
      server_package: z.string().min(1).optional(),
      warning: z.string().min(1).optional(),
      output_hints: z.record(z.string().min(1)).optional(),
    })
    .optional(),
});

const catalogSchema = z.array(catalogEntrySchema);

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;

export class CatalogError extends Error {}

export class CatalogService {
  constructor(
    public readonly repoRoot: string,
    private readonly assets: CatalogEntry[],
  ) {}

  listAssets(type?: string): CatalogEntry[] {
    if (!type) {
      return [...this.assets];
    }
    return this.assets.filter((asset) => asset.type === type);
  }

  getAsset(name: string): CatalogEntry {
    const asset = this.assets.find((entry) => entry.name === name);
    if (!asset) {
      throw new CatalogError(`Asset not found: ${name}`);
    }
    return asset;
  }

  getCatalogPath(): string {
    return path.resolve(this.repoRoot, "catalog.json");
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findRepoRoot(startPath: string): Promise<string> {
  let currentPath = path.resolve(startPath);

  while (true) {
    const catalogPath = path.resolve(currentPath, "catalog.json");
    if (await pathExists(catalogPath)) {
      return currentPath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      throw new CatalogError(`catalog.json is missing at ${catalogPath}`);
    }
    currentPath = parentPath;
  }
}

async function findBundledRoot(): Promise<string> {
  return findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));
}

export async function createCatalogService(startPath: string): Promise<CatalogService> {
  let repoRoot: string;
  try {
    repoRoot = await findRepoRoot(startPath);
  } catch {
    repoRoot = await findBundledRoot();
  }
  const catalogPath = path.resolve(repoRoot, "catalog.json");

  let raw: string;
  try {
    raw = await fs.readFile(catalogPath, "utf8");
  } catch (error) {
    throw new CatalogError(`catalog.json is missing at ${catalogPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new CatalogError("catalog.json is invalid JSON");
  }

  const result = catalogSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new CatalogError(`catalog.json failed validation: ${issue.path.join(".") || "root"} ${issue.message}`);
  }

  const seenNames = new Set<string>();
  for (const asset of result.data) {
    if (seenNames.has(asset.name)) {
      throw new CatalogError(`duplicate asset name in catalog.json: ${asset.name}`);
    }
    seenNames.add(asset.name);

    const fullPath = path.resolve(repoRoot, asset.path);
    try {
      await fs.access(fullPath);
    } catch {
      throw new CatalogError(`referenced asset path is missing: ${asset.path}`);
    }

    for (const variantPath of Object.values(asset.targets ?? {})) {
      const fullVariantPath = path.resolve(repoRoot, variantPath);
      try {
        await fs.access(fullVariantPath);
      } catch {
        throw new CatalogError(`referenced target asset path is missing: ${variantPath}`);
      }
    }
  }

  return new CatalogService(repoRoot, result.data);
}
