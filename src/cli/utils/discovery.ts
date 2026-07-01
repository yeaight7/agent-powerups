import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { CatalogEntry, CatalogService } from "./catalog.js";
import { extractMarkdownSection, fieldAsArray, fieldAsString, parseFrontmatter } from "./frontmatter.js";
import { getPluginBundles } from "./plugins.js";

export type DiscoveryTarget = "codex" | "claude-code" | "gemini" | "generic";
export type PowerupSource = "catalog" | "plugin" | "installed" | "staged";

export interface PowerupAsset {
  name: string;
  type: string;
  summary: string;
  path: string;
  sourcePath: string;
  entrypoint?: string;
  source: PowerupSource;
  sources: PowerupSource[];
  compatible_with: string[];
  tags: string[];
  maturity?: string;
  tier?: string;
  requires?: CatalogEntry["requires"];
  plugin?: string;
  plugins: string[];
  origin?: string;
  installed: boolean;
  installedOnly: boolean;
  installedPaths: string[];
  stagedPaths: string[];
  use_when: string[];
  avoid_when: string[];
  signals: string[];
  capabilities: string[];
  routing_priority?: number;
  activation?: string;
  check_policy?: string;
}

export interface InventoryData {
  target: DiscoveryTarget;
  repoRoot: string;
  agentRoot?: string;
  assets: PowerupAsset[];
  counts: Record<string, number>;
}

export interface DiscoveryCandidate {
  asset: PowerupAsset;
  score: number;
  rationale: string[];
  next_action: string;
}

export interface DiscoverData {
  target: DiscoveryTarget;
  task: string;
  primary: DiscoveryCandidate[];
  supporting: DiscoveryCandidate[];
  approval_required: DiscoveryCandidate[];
  no_match: boolean;
}

interface BuildOptions {
  target: DiscoveryTarget;
  agentRoot?: string;
  includeInstalled?: boolean;
}

const TARGET_COMPAT: Record<DiscoveryTarget, string> = {
  codex: "codex",
  "claude-code": "claude-code",
  gemini: "gemini-cli",
  generic: "generic",
};

const TARGET_ROOTS: Record<Exclude<DiscoveryTarget, "generic">, { env: string[]; dir: string }> = {
  codex: { env: ["CODEX_HOME"], dir: path.join(os.homedir(), ".codex") },
  "claude-code": { env: ["CLAUDE_CONFIG_DIR", "CLAUDE_HOME"], dir: path.join(os.homedir(), ".claude") },
  gemini: { env: ["GEMINI_HOME"], dir: path.join(os.homedir(), ".gemini") },
};

function uniq<T>(items: T[]): T[] {
  return [...new Set(items.filter((item) => item !== undefined && item !== null))];
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listDirectories(root: string): Promise<string[]> {
  if (!(await pathExists(root))) {
    return [];
  }
  const entries = await fs.readdir(root, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

function targetDefaultRoot(target: DiscoveryTarget): string | undefined {
  if (target === "generic") {
    return undefined;
  }
  const config = TARGET_ROOTS[target];
  for (const envName of config.env) {
    const value = process.env[envName];
    if (value) {
      return path.resolve(value);
    }
  }
  return config.dir;
}

function isCompatible(entry: CatalogEntry, target: DiscoveryTarget): boolean {
  if (target === "generic") {
    return true;
  }
  const targetCompat = TARGET_COMPAT[target];
  return entry.compatible_with.includes(targetCompat as any) || entry.compatible_with.includes("generic");
}

function arrayFromUnknown(value: unknown): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function catalogAsset(entry: CatalogEntry, service: CatalogService): PowerupAsset {
  const metadata = entry as CatalogEntry & {
    use_when?: string[] | string;
    avoid_when?: string[] | string;
    signals?: string[] | string;
    capabilities?: string[] | string;
    routing_priority?: number;
    activation?: string;
    check_policy?: string;
  };
  const fullPath = path.resolve(service.repoRoot, entry.path);
  return {
    name: entry.name,
    type: entry.type,
    summary: entry.summary,
    path: entry.path,
    sourcePath: fullPath,
    entrypoint: entry.type === "skill" ? path.join(fullPath, "SKILL.md") : fullPath,
    source: "catalog",
    sources: ["catalog"],
    compatible_with: entry.compatible_with,
    tags: entry.tags,
    maturity: entry.maturity,
    tier: entry.tier,
    requires: entry.requires,
    plugins: [],
    installed: false,
    installedOnly: false,
    installedPaths: [],
    stagedPaths: [],
    use_when: arrayFromUnknown(metadata.use_when),
    avoid_when: arrayFromUnknown(metadata.avoid_when),
    signals: arrayFromUnknown(metadata.signals),
    capabilities: arrayFromUnknown(metadata.capabilities),
    routing_priority: metadata.routing_priority,
    activation: metadata.activation,
    check_policy: metadata.check_policy,
  };
}

function frontmatterAsset(options: {
  name: string;
  type: string;
  source: PowerupSource;
  sourcePath: string;
  entrypoint: string;
  target: DiscoveryTarget;
  plugin?: string;
  origin?: string;
  fallbackSummary: string;
  content: string;
}): PowerupAsset {
  const parsed = parseFrontmatter(options.content);
  const name = fieldAsString(parsed.fields, "name") ?? options.name;
  const description = fieldAsString(parsed.fields, "description") ?? options.fallbackSummary;
  const whenToUse = extractMarkdownSection(parsed.body, "When to Use");
  return {
    name,
    type: options.type,
    summary: description,
    path: options.sourcePath,
    sourcePath: options.sourcePath,
    entrypoint: options.entrypoint,
    source: options.source,
    sources: [options.source],
    compatible_with: [TARGET_COMPAT[options.target] ?? "generic", "generic"],
    tags: fieldAsArray(parsed.fields, "tags"),
    plugin: options.plugin,
    plugins: options.plugin ? [options.plugin] : [],
    origin: options.origin,
    installed: options.source === "installed",
    installedOnly: options.source === "installed",
    installedPaths: options.source === "installed" ? [options.sourcePath] : [],
    stagedPaths: options.source === "staged" ? [options.sourcePath] : [],
    use_when: fieldAsArray(parsed.fields, "use_when").concat(whenToUse ? [whenToUse] : []),
    avoid_when: fieldAsArray(parsed.fields, "avoid_when"),
    signals: fieldAsArray(parsed.fields, "signals"),
    capabilities: fieldAsArray(parsed.fields, "capabilities"),
    activation: fieldAsString(parsed.fields, "activation"),
    check_policy: fieldAsString(parsed.fields, "check_policy"),
  };
}

function mergeAssets(existing: PowerupAsset, incoming: PowerupAsset): PowerupAsset {
  const installedPaths = uniq(existing.installedPaths.concat(incoming.installedPaths));
  const stagedPaths = uniq(existing.stagedPaths.concat(incoming.stagedPaths));
  const sources = uniq(existing.sources.concat(incoming.sources));
  const plugins = uniq(existing.plugins.concat(incoming.plugins));
  const preferIncomingEntrypoint = incoming.source === "installed" || (incoming.source === "staged" && !existing.installed);

  return {
    ...existing,
    summary: existing.summary || incoming.summary,
    sourcePath: preferIncomingEntrypoint ? incoming.sourcePath : existing.sourcePath,
    entrypoint: preferIncomingEntrypoint ? incoming.entrypoint : existing.entrypoint,
    source: sources[0],
    sources,
    compatible_with: uniq(existing.compatible_with.concat(incoming.compatible_with)),
    tags: uniq(existing.tags.concat(incoming.tags)),
    tier: existing.tier ?? incoming.tier,
    requires: existing.requires ?? incoming.requires,
    plugin: existing.plugin ?? incoming.plugin,
    plugins,
    installed: existing.installed || incoming.installed,
    installedOnly: !sources.includes("catalog") && !sources.includes("plugin") && (existing.installedOnly || incoming.installedOnly),
    installedPaths,
    stagedPaths,
    use_when: uniq(existing.use_when.concat(incoming.use_when)),
    avoid_when: uniq(existing.avoid_when.concat(incoming.avoid_when)),
    signals: uniq(existing.signals.concat(incoming.signals)),
    capabilities: uniq(existing.capabilities.concat(incoming.capabilities)),
    routing_priority: existing.routing_priority ?? incoming.routing_priority,
    activation: existing.activation ?? incoming.activation,
    check_policy: existing.check_policy ?? incoming.check_policy,
  };
}

function upsertAsset(assets: Map<string, PowerupAsset>, asset: PowerupAsset): void {
  const key = `${asset.type}:${asset.name}`;
  const existing = assets.get(key);
  assets.set(key, existing ? mergeAssets(existing, asset) : asset);
}

async function scanSkillDirectory(root: string, source: PowerupSource, target: DiscoveryTarget): Promise<PowerupAsset[]> {
  const assets: PowerupAsset[] = [];
  for (const name of await listDirectories(root)) {
    const entrypoint = path.join(root, name, "SKILL.md");
    if (!(await pathExists(entrypoint))) {
      continue;
    }
    const content = await fs.readFile(entrypoint, "utf8");
    assets.push(
      frontmatterAsset({
        name,
        type: "skill",
        source,
        sourcePath: path.join(root, name),
        entrypoint,
        target,
        fallbackSummary: `Installed skill: ${name}`,
        content,
      }),
    );
  }
  return assets;
}

async function readPluginContent(pluginPath: string, type: string, name: string): Promise<{ entrypoint: string; content: string } | null> {
  const candidates =
    type === "skill"
      ? [path.join(pluginPath, "skills", name, "SKILL.md")]
      : type === "agent"
        ? [path.join(pluginPath, "agents", `${name}.md`)]
        : [path.join(pluginPath, "commands", `${name}.md`)];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return { entrypoint: candidate, content: await fs.readFile(candidate, "utf8") };
    }
  }
  return null;
}

async function pluginAssets(service: CatalogService, target: DiscoveryTarget): Promise<PowerupAsset[]> {
  const assets: PowerupAsset[] = [];
  const bundles = await getPluginBundles(service.repoRoot);
  for (const bundle of bundles) {
    if (!bundle.name) {
      continue;
    }
    const pluginPath = path.join(service.repoRoot, "plugins", bundle.name);
    for (const [type, refs] of [
      ["skill", bundle.skills ?? []],
      ["agent", bundle.agents ?? []],
      ["command", bundle.commands ?? []],
    ] as const) {
      for (const ref of refs as Array<{ name?: string; origin?: string }>) {
        if (!ref.name) {
          continue;
        }
        const loaded = await readPluginContent(pluginPath, type, ref.name);
        if (!loaded) {
          continue;
        }
        const sourcePath = type === "skill" ? path.dirname(loaded.entrypoint) : loaded.entrypoint;
        assets.push(
          frontmatterAsset({
            name: ref.name,
            type,
            source: "plugin",
            sourcePath,
            entrypoint: loaded.entrypoint,
            target,
            plugin: bundle.name,
            origin: ref.origin,
            fallbackSummary: `${bundle.name} ${type}: ${ref.name}`,
            content: loaded.content,
          }),
        );
      }
    }
  }
  return assets;
}

function installedRoots(cwd: string, options: BuildOptions): string[] {
  const roots: string[] = [];
  const agentRoot = options.agentRoot ? path.resolve(options.agentRoot) : targetDefaultRoot(options.target);
  if (agentRoot) {
    roots.push(path.join(agentRoot, "skills"));
    roots.push(path.join(agentRoot, "agent-powerups", "skills"));
  }
  roots.push(path.join(cwd, "agent-powerups", "skills"));
  roots.push(path.join(cwd, ".agent-powerups", "skills"));
  return uniq(roots);
}

export async function buildInventory(
  service: CatalogService,
  options: BuildOptions,
  cwd = service.repoRoot,
): Promise<InventoryData> {
  const assets = new Map<string, PowerupAsset>();

  for (const entry of service.listAssets()) {
    if (isCompatible(entry, options.target)) {
      upsertAsset(assets, catalogAsset(entry, service));
    }
  }

  for (const asset of await pluginAssets(service, options.target)) {
    upsertAsset(assets, asset);
  }

  if (options.includeInstalled !== false) {
    for (const root of installedRoots(cwd, options)) {
      const source: PowerupSource = root.includes(`agent-powerups${path.sep}skills`) ? "staged" : "installed";
      for (const asset of await scanSkillDirectory(root, source, options.target)) {
        upsertAsset(assets, asset);
      }
    }
  }

  const sortedAssets = [...assets.values()]
    .map((asset) => ({
      ...asset,
      installedOnly: !asset.sources.includes("catalog") && !asset.sources.includes("plugin") && asset.installed,
    }))
    .sort((left, right) => left.type.localeCompare(right.type) || left.name.localeCompare(right.name));
  const counts: Record<string, number> = {};
  for (const asset of sortedAssets) {
    counts[asset.type] = (counts[asset.type] ?? 0) + 1;
  }

  return {
    target: options.target,
    repoRoot: service.repoRoot,
    agentRoot: options.agentRoot ? path.resolve(options.agentRoot) : targetDefaultRoot(options.target),
    assets: sortedAssets,
    counts,
  };
}

// Common filler words. Removed only from the "lean" task token set used for weak
// name/summary/tag/capability/use_when overlap — NOT from signal-phrase matching —
// so a stray "and"/"new" can no longer pull an asset into primary (e.g.
// "naming-and-structure-cleanup" matching the token "and").
const STOPWORDS = new Set([
  "the", "and", "for", "new", "this", "that", "into", "with", "from", "your", "our",
  "are", "was", "has", "have", "had", "can", "will", "you", "use", "using", "old",
  "all", "any", "but", "not", "out", "via", "per", "its", "their", "them", "they",
  "then", "than", "when", "what", "which", "who", "how", "why", "where", "some",
  "more", "most", "such", "only", "also", "onto", "over", "under", "about", "before",
  "after", "while", "between", "across", "let", "lets", "make", "made", "get", "got",
  "want", "need", "needs", "like", "just", "now", "here", "there", "please", "give",
  "tell", "show", "help", "should", "would", "could", "able", "add", "set", "run",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

interface TaskIndex {
  full: Set<string>;
  lean: Set<string>;
}

function buildTaskIndex(task: string): TaskIndex {
  const full = tokenize(task);
  return {
    full: new Set(full),
    lean: new Set(full.filter((token) => !STOPWORDS.has(token))),
  };
}

// A metadata phrase matches when every word of the phrase is present as a whole
// task token (word-aware, order-independent). Word-aware matching is what fixes the
// "auth" inside "authentication" false-trigger: "auth" is not a token of the task.
function phraseMatches(phrase: string, tokens: Set<string>): boolean {
  const words = tokenize(phrase);
  return words.length > 0 && words.every((word) => tokens.has(word));
}

const WEIGHTS = {
  signal: 18,
  useWhenPerToken: 2,
  useWhenCap: 8,
  name: 3,
  capabilities: 4,
  tagPerHit: 3,
  tagCap: 6,
  summaryPerToken: 1,
  mcpTool: 14,
} as const;

function hasRequires(asset: PowerupAsset): boolean {
  const req = asset.requires;
  return Boolean((req?.commands?.length ?? 0) + (req?.python_packages?.length ?? 0) + (req?.npm_packages?.length ?? 0));
}

function needsApproval(asset: PowerupAsset): boolean {
  return asset.type === "mcp-config" || asset.type === "hook" || hasRequires(asset) || asset.activation === "approval-required";
}

function scoreAsset(asset: PowerupAsset, index: TaskIndex): { value: number; rationale: string[] } {
  const score = { value: 0, rationale: [] as string[] };

  // STRONG: each declared signal the task names is a high-weight, asset-owned hit.
  // Routing strength lives in per-asset metadata (catalog/frontmatter `signals`),
  // never in this file — adding or retuning discovery is a catalog edit, not a code
  // edit (decision D-12). Two co-signaled assets are ordered by routing_priority.
  let signalHits = 0;
  for (const signal of asset.signals) {
    if (phraseMatches(signal, index.full)) {
      score.value += WEIGHTS.signal;
      signalHits += 1;
    }
  }
  if (signalHits > 0) {
    score.rationale.push(signalHits === 1 ? "task names a declared signal" : `task names ${signalHits} declared signals`);
  }

  // MEDIUM: use_when prose overlap (capped), via the stopword-filtered token set.
  let useWhenPts = 0;
  for (const token of index.lean) {
    if (asset.use_when.some((entry) => entry.toLowerCase().includes(token))) {
      useWhenPts += WEIGHTS.useWhenPerToken;
    }
  }
  if (useWhenPts > 0) {
    score.value += Math.min(useWhenPts, WEIGHTS.useWhenCap);
    score.rationale.push("use_when overlaps task");
  }

  // MEDIUM: literally-named intents self-route (e.g. "brainstorm" -> brainstorming).
  const nameWords = tokenize(asset.name).filter((word) => !STOPWORDS.has(word));
  if (nameWords.some((word) => index.lean.has(word))) {
    score.value += WEIGHTS.name;
    score.rationale.push("name matches task term");
  }

  // WEAK: capabilities + tags + summary overlap (word-aware, capped) — keeps the
  // legacy "incidental term overlap" surfacing without letting it dominate signals.
  if (asset.capabilities.some((capability) => tokenize(capability).some((word) => index.lean.has(word)))) {
    score.value += WEIGHTS.capabilities;
  }
  let tagPts = 0;
  for (const tag of asset.tags) {
    if (index.lean.has(tag.toLowerCase())) {
      tagPts += WEIGHTS.tagPerHit;
    }
  }
  score.value += Math.min(tagPts, WEIGHTS.tagCap);
  const summaryTokens = new Set(tokenize(asset.summary));
  for (const token of index.lean) {
    if (summaryTokens.has(token)) {
      score.value += WEIGHTS.summaryPerToken;
    }
  }
  if (score.value > 0 && score.rationale.length === 0) {
    score.rationale.push("metadata overlaps with task terms");
  }

  // PRESERVED: MCP configs that match their own declared tool/server vocabulary
  // (the boost now keys off the asset's own tags/signals, not a hardcoded regex).
  if (
    asset.type === "mcp-config" &&
    [...index.lean].some(
      (token) => asset.tags.includes(token) || asset.signals.some((signal) => tokenize(signal).includes(token)),
    )
  ) {
    score.value += WEIGHTS.mcpTool;
    score.rationale.push("MCP config matches tool/server task");
  }

  // PRESERVED: de-rank non-routable types.
  if (asset.type === "pack") {
    score.value -= 4;
  }
  if (asset.type === "example" || asset.type === "script") {
    score.value -= 3;
  }

  return {
    value: Math.max(0, score.value),
    rationale: uniq(score.rationale),
  };
}

function nextAction(asset: PowerupAsset): string {
  if (asset.type === "mcp-config") {
    return `Run apx mcp check ${asset.name} --target <agent>, then smoke/install only with approval.`;
  }
  if (asset.type === "hook") {
    return `Print/read hook ${asset.name}; treat it as review-before-use and do not enable automatically.`;
  }
  if (hasRequires(asset)) {
    return `Read ${asset.entrypoint ?? asset.sourcePath}; run apx check ${asset.name} only if this workflow needs its external tool.`;
  }
  if (asset.type === "skill") {
    return `Read ${asset.entrypoint ?? path.join(asset.sourcePath, "SKILL.md")} before applying it.`;
  }
  if (asset.type === "command") {
    return `Print/read command ${asset.name} before invoking its workflow.`;
  }
  if (asset.type === "agent") {
    return `Use agent prompt ${asset.name} only if delegation is available and useful.`;
  }
  return `Inspect ${asset.entrypoint ?? asset.sourcePath} before use.`;
}

export async function discoverPowerups(
  service: CatalogService,
  options: BuildOptions & { task: string },
  cwd = service.repoRoot,
): Promise<DiscoverData> {
  const inventory = await buildInventory(service, options, cwd);
  const index = buildTaskIndex(options.task);
  const ranked = inventory.assets
    .map((asset) => {
      const scored = scoreAsset(asset, index);
      return {
        asset,
        score: scored.value,
        rationale: scored.rationale,
        next_action: nextAction(asset),
      };
    })
    .filter((candidate) => candidate.score >= 4)
    .sort(
      (left, right) =>
        right.score - left.score ||
        (right.asset.routing_priority ?? 0) - (left.asset.routing_priority ?? 0) ||
        left.asset.type.localeCompare(right.asset.type) ||
        left.asset.name.localeCompare(right.asset.name),
    );

  const approvalRequired = ranked.filter((candidate) => needsApproval(candidate.asset)).slice(0, 8);
  const normal = ranked.filter((candidate) => !needsApproval(candidate.asset));
  const primary = normal.slice(0, 5);
  const supporting = normal.slice(5, 13);

  return {
    target: options.target,
    task: options.task,
    primary,
    supporting,
    approval_required: approvalRequired,
    no_match: primary.length === 0 && supporting.length === 0 && approvalRequired.length === 0,
  };
}

export async function buildDiscoveryIndexJson(
  service: CatalogService,
  target: DiscoveryTarget,
): Promise<string> {
  const inventory = await buildInventory(service, { target, includeInstalled: false });
  return `${JSON.stringify(
    {
      generated_by: "agent-powerups",
      target,
      assets: inventory.assets,
      counts: inventory.counts,
    },
    null,
    2,
  )}\n`;
}
