import type { CliIO } from "../apx.js";
import { hasFlag, parseOption } from "../utils/args.js";
import type { CatalogService } from "../utils/catalog.js";
import { buildInventory, discoverPowerups, type DiscoveryTarget } from "../utils/discovery.js";
import { createResult, formatResult } from "../utils/result.js";

const DISCOVERY_TARGETS = ["codex", "claude-code", "gemini", "generic"] as const;

function parseDiscoveryTarget(argv: string[]): DiscoveryTarget {
  const target = parseOption(argv, "--target") ?? "generic";
  if (!(DISCOVERY_TARGETS as readonly string[]).includes(target)) {
    throw new Error(`Missing or invalid --target. Expected one of: ${DISCOVERY_TARGETS.join(", ")}`);
  }
  return target as DiscoveryTarget;
}

export async function runInventoryCommand(argv: string[], service: CatalogService, io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const target = parseDiscoveryTarget(argv);
  const agentRoot = parseOption(argv, "--agent-root");
  const inventory = await buildInventory(service, { target, agentRoot }, io.cwd);

  if (json) {
    io.stdout(formatResult(createResult({ stdout: "success", data: inventory }), true));
    return 0;
  }

  io.stdout(`Inventory: ${target}`);
  if (inventory.agentRoot) {
    io.stdout(`agent root: ${inventory.agentRoot}`);
  }
  io.stdout(`assets: ${inventory.assets.length}`);
  for (const [type, count] of Object.entries(inventory.counts).sort(([left], [right]) => left.localeCompare(right))) {
    io.stdout(`  ${type}: ${count}`);
  }
  io.stdout("\nUse --json for full asset metadata and installed/staged paths.");
  return 0;
}

export async function runDiscoverCommand(argv: string[], service: CatalogService, io: CliIO): Promise<number> {
  const json = hasFlag(argv, "--json");
  const task = argv[1];
  if (!task || task.startsWith("--")) {
    throw new Error('Missing task. Usage: apx discover "<task>" --target <codex|claude-code|gemini|generic>');
  }

  const target = parseDiscoveryTarget(argv);
  const agentRoot = parseOption(argv, "--agent-root");
  const result = await discoverPowerups(service, { target, agentRoot, task }, io.cwd);

  if (json) {
    io.stdout(formatResult(createResult({ stdout: "success", data: result }), true));
    return 0;
  }

  io.stdout(`Discovery: ${target}`);
  io.stdout(`task: ${task}\n`);
  for (const [label, candidates] of [
    ["Primary", result.primary],
    ["Supporting", result.supporting],
    ["Approval required", result.approval_required],
  ] as const) {
    io.stdout(`${label}:`);
    if (candidates.length === 0) {
      io.stdout("  (none)");
      continue;
    }
    for (const candidate of candidates) {
      io.stdout(`  - ${candidate.asset.name} (${candidate.asset.type}) score=${candidate.score}`);
      io.stdout(`    ${candidate.rationale.join("; ") || "metadata match"}`);
      io.stdout(`    next: ${candidate.next_action}`);
    }
  }

  if (result.no_match) {
    io.stdout("\nNo matching powerup found. Proceed with normal repo inspection.");
  }
  return 0;
}
