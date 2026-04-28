#!/usr/bin/env node
import path from "node:path";

import { runAgentsMdListCommand, runAgentsMdPrintCommand } from "./commands/agents-md.js";
import { runTypedAssetListCommand, runTypedAssetPrintCommand } from "./commands/assets.js";
import { runCheckCommand } from "./commands/check.js";
import { runDoctorCommand } from "./commands/doctor.js";
import { runInfoCommand } from "./commands/info.js";
import { runInstallCommand } from "./commands/install.js";
import { runListCommand } from "./commands/list.js";
import { runMcpListCommand, runMcpPrintCommand } from "./commands/mcp.js";
import { ALLOWED_TYPES, CatalogError, createCatalogService } from "./utils/catalog.js";
import { INSTALL_TARGETS, type InstallTarget } from "./utils/paths.js";

export interface CliIO {
  cwd: string;
  stdout: (line: string) => void;
  stderr: (line: string) => void;
}

const HELP_TEXT = `apx help
apx version
apx list
apx list --type <${ALLOWED_TYPES.join("|")}>
apx info <asset-name>
apx check [asset-name]
apx doctor
apx install <asset-name> --target <${INSTALL_TARGETS.join("|")}> [--dry-run] [--dest <path>]
apx mcp list
apx mcp print <config-name> --target <${INSTALL_TARGETS.join("|")}>
apx agents-md list
apx agents-md print <template-name>
apx commands list
apx commands print <command-name> --target <${INSTALL_TARGETS.join("|")}>
apx hooks list
apx hooks print <hook-name>
apx workflows list
apx workflows print <workflow-name>`;

function getPackageVersion(): string {
  return "0.1.0";
}

function parseOption(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return argv[index + 1];
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(name);
}

function parseTarget(argv: string[]): InstallTarget {
  const target = parseOption(argv, "--target");
  if (!target || !INSTALL_TARGETS.includes(target as InstallTarget)) {
    throw new Error(`Missing or invalid --target. Expected one of: ${INSTALL_TARGETS.join(", ")}`);
  }
  return target as InstallTarget;
}

export async function runCli(argv: string[], io: CliIO): Promise<number> {
  try {
    const command = argv[0] ?? "help";
    const repoRoot = io.cwd;

    if (command === "help" || hasFlag(argv, "--help")) {
      io.stdout(HELP_TEXT);
      return 0;
    }

    if (command === "version" || hasFlag(argv, "--version")) {
      io.stdout(getPackageVersion());
      return 0;
    }

    const service = await createCatalogService(repoRoot);

    if (command === "list") {
      const type = parseOption(argv, "--type");
      io.stdout(runListCommand(service, type));
      return 0;
    }

    if (command === "info") {
      const assetName = argv[1];
      if (!assetName) {
        throw new Error("Missing asset name for info");
      }
      io.stdout(await runInfoCommand(service, assetName));
      return 0;
    }

    if (command === "check") {
      const assetName = argv[1];
      const result = await runCheckCommand(service, assetName);
      io.stdout(result.output);
      return result.exitCode;
    }

    if (command === "doctor") {
      io.stdout(await runDoctorCommand(service, io.cwd));
      return 0;
    }

    if (command === "install") {
      const assetName = argv[1];
      if (!assetName) {
        throw new Error("Missing asset name for install");
      }
      const result = await runInstallCommand(service, assetName, {
        cwd: io.cwd,
        target: parseTarget(argv),
        dryRun: hasFlag(argv, "--dry-run") || !hasFlag(argv, "--dest"),
        dest: parseOption(argv, "--dest"),
      });
      io.stdout(result.output);
      return result.exitCode;
    }

    if (command === "mcp") {
      const subcommand = argv[1];
      if (subcommand === "list") {
        io.stdout(runMcpListCommand(service));
        return 0;
      }
      if (subcommand === "print") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing config name for mcp print");
        }
        io.stdout(await runMcpPrintCommand(service, assetName, parseTarget(argv)));
        return 0;
      }
      throw new Error("Unknown mcp subcommand");
    }

    if (command === "agents-md") {
      const subcommand = argv[1];
      if (subcommand === "list") {
        io.stdout(runAgentsMdListCommand(service));
        return 0;
      }
      if (subcommand === "print") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing template name for agents-md print");
        }
        io.stdout(await runAgentsMdPrintCommand(service, assetName));
        return 0;
      }
      throw new Error("Unknown agents-md subcommand");
    }

    if (command === "commands") {
      const subcommand = argv[1];
      if (subcommand === "list") {
        io.stdout(runTypedAssetListCommand(service, "command", "command packs"));
        return 0;
      }
      if (subcommand === "print") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing command name for commands print");
        }
        io.stdout(
          await runTypedAssetPrintCommand(
            service,
            assetName,
            "command",
            "command",
            "this prints a command prompt and does not run commands or mutate files",
            parseTarget(argv),
          ),
        );
        return 0;
      }
      throw new Error("Unknown commands subcommand");
    }

    if (command === "hooks") {
      const subcommand = argv[1];
      if (subcommand === "list") {
        io.stdout(runTypedAssetListCommand(service, "hook", "hook examples"));
        return 0;
      }
      if (subcommand === "print") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing hook name for hooks print");
        }
        io.stdout(
          await runTypedAssetPrintCommand(
            service,
            assetName,
            "hook",
            "hook",
            "review-before-use only; this does not install hooks or edit agent config",
          ),
        );
        return 0;
      }
      throw new Error("Unknown hooks subcommand");
    }

    if (command === "workflows") {
      const subcommand = argv[1];
      if (subcommand === "list") {
        io.stdout(runTypedAssetListCommand(service, "workflow", "workflows"));
        return 0;
      }
      if (subcommand === "print") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing workflow name for workflows print");
        }
        io.stdout(
          await runTypedAssetPrintCommand(
            service,
            assetName,
            "workflow",
            "workflow",
            "reference workflow only; this does not execute steps",
          ),
        );
        return 0;
      }
      throw new Error("Unknown workflows subcommand");
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    const message = error instanceof CatalogError || error instanceof Error ? error.message : String(error);
    io.stderr(message);
    return 1;
  }
}

if (process.argv[1] && path.basename(process.argv[1]) === "apx.js") {
  const exitCode = await runCli(process.argv.slice(2), {
    cwd: process.cwd(),
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
  });
  process.exitCode = exitCode;
}
