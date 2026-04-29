#!/usr/bin/env node
import path from "node:path";

import { runAgentsMdListCommand, runAgentsMdPrintCommand } from "./commands/agents-md.js";
import { runAskCommand } from "./commands/ask.js";
import { runTypedAssetListCommand, runTypedAssetPrintCommand } from "./commands/assets.js";
import { runCheckCommand } from "./commands/check.js";
import { runDoctorCommand } from "./commands/doctor.js";
import { runNoSecretsPreflightCommand } from "./commands/hooks.js";
import { runInfoCommand } from "./commands/info.js";
import { runInstallCommand } from "./commands/install.js";
import { runListCommand } from "./commands/list.js";
import { runMcpCheckCommand, runMcpListCommand, runMcpPrintCommand, runMcpWriteCommand } from "./commands/mcp.js";
import { runPluginBuildCommand, runPluginDiffCommand, runPluginValidateCommand } from "./commands/plugin.js";
import { runShipCheckCommand } from "./commands/run-command.js";
import { runValidateCatalogCommand, runValidateSkillsCommand } from "./commands/validate.js";
import { hasFlag, parseOption, parseOptions } from "./utils/args.js";
import { ALLOWED_TYPES, CatalogError, createCatalogService } from "./utils/catalog.js";
import { INSTALL_TARGETS, type InstallTarget } from "./utils/paths.js";
import { createResult, formatResult, type ExecutionResult } from "./utils/result.js";

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
apx doctor [--full] [--json]
apx ask <claude|gemini> <prompt> [--artifact-dir <path>] [--json]
apx install <asset-name> --target <${INSTALL_TARGETS.join("|")}> [--dry-run] [--dest <path>]
apx mcp list
apx mcp print <config-name> --target <${INSTALL_TARGETS.join("|")}>
apx agents-md list
apx agents-md print <template-name>
apx commands list
apx commands print <command-name> --target <${INSTALL_TARGETS.join("|")}>
apx commands run ship-check [--full] [--json]
apx hooks list
apx hooks print <hook-name>
apx hooks run no-secrets-preflight [--path <path> | --all] [--json]
apx workflows list
apx workflows print <workflow-name>
apx mcp check <config-name> --target <${INSTALL_TARGETS.join("|")}> [--json]
apx mcp write <config-name> --target <${INSTALL_TARGETS.join("|")}> --dest <path> [--force] [--json]
apx plugin validate <plugin-path> [--json]
apx plugin diff <plugin-path> [--json]
apx plugin build --dest <path> (--dry-run|--write) [--json]
apx validate skills
apx validate catalog`;

function getPackageVersion(): string {
  return "0.1.0";
}

function parseTarget(argv: string[]): InstallTarget {
  const target = parseOption(argv, "--target");
  if (!target || !INSTALL_TARGETS.includes(target as InstallTarget)) {
    throw new Error(`Missing or invalid --target. Expected one of: ${INSTALL_TARGETS.join(", ")}`);
  }
  return target as InstallTarget;
}

function requireOption(argv: string[], name: string): string {
  const value = parseOption(argv, name);
  if (!value) {
    throw new Error(`Missing required option: ${name}`);
  }
  return value;
}

function writeExecutionResult(io: CliIO, result: ExecutionResult, json: boolean): number {
  io.stdout(formatResult(result, json));
  if (!json && result.stderr) {
    io.stderr(result.stderr);
  }
  return result.exitCode;
}

export async function runCli(argv: string[], io: CliIO): Promise<number> {
  try {
    const command = argv[0] ?? "help";
    const repoRoot = io.cwd;
    const json = hasFlag(argv, "--json");

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
      if (json) {
        io.stdout(
          formatResult(
            createResult({
              exitCode: result.exitCode,
              stdout: result.output,
              warnings: result.exitCode === 0 ? [] : ["missing requirements"],
              actions: [],
            }),
            true,
          ),
        );
      } else {
        io.stdout(result.output);
      }
      return result.exitCode;
    }

    if (command === "doctor") {
      return writeExecutionResult(io, await runDoctorCommand(service, io.cwd, { full: hasFlag(argv, "--full") }), json);
    }

    if (command === "ask") {
      return writeExecutionResult(io, await runAskCommand(service, argv), json);
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
      if (subcommand === "check") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing config name for mcp check");
        }
        return writeExecutionResult(io, await runMcpCheckCommand(service, assetName, parseTarget(argv)), json);
      }
      if (subcommand === "write") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing config name for mcp write");
        }
        return writeExecutionResult(
          io,
          await runMcpWriteCommand(service, assetName, parseTarget(argv), {
            dest: requireOption(argv, "--dest"),
            force: hasFlag(argv, "--force"),
          }),
          json,
        );
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
      if (subcommand === "run") {
        const assetName = argv[2];
        if (assetName !== "ship-check") {
          throw new Error("Unknown runnable command");
        }
        return writeExecutionResult(io, await runShipCheckCommand(service, { full: hasFlag(argv, "--full") }), json);
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
      if (subcommand === "run") {
        const assetName = argv[2];
        if (assetName !== "no-secrets-preflight") {
          throw new Error("Unknown runnable hook");
        }
        return writeExecutionResult(
          io,
          await runNoSecretsPreflightCommand(service, {
            all: hasFlag(argv, "--all"),
            paths: parseOptions(argv, "--path"),
          }),
          json,
        );
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

    if (command === "validate") {
      const subcommand = argv[1];
      if (subcommand === "skills") {
        return writeExecutionResult(io, await runValidateSkillsCommand(service), json);
      }
      if (subcommand === "catalog") {
        return writeExecutionResult(io, await runValidateCatalogCommand(service), json);
      }
      throw new Error("Unknown validate subcommand. Use: apx validate skills | apx validate catalog");
    }

    if (command === "plugin") {
      const subcommand = argv[1];
      if (subcommand === "validate") {
        const pluginPath = argv[2];
        if (!pluginPath) {
          throw new Error("Missing plugin path for plugin validate");
        }
        return writeExecutionResult(io, await runPluginValidateCommand(path.resolve(service.repoRoot, pluginPath)), json);
      }
      if (subcommand === "diff") {
        const pluginPath = argv[2];
        if (!pluginPath) {
          throw new Error("Missing plugin path for plugin diff");
        }
        return writeExecutionResult(io, await runPluginDiffCommand(service, path.resolve(service.repoRoot, pluginPath)), json);
      }
      if (subcommand === "build") {
        const write = hasFlag(argv, "--write");
        const dryRun = hasFlag(argv, "--dry-run");
        if (write === dryRun) {
          throw new Error("plugin build requires exactly one of --dry-run or --write");
        }
        return writeExecutionResult(
          io,
          await runPluginBuildCommand(service, {
            dest: requireOption(argv, "--dest"),
            write,
          }),
          json,
        );
      }
      throw new Error("Unknown plugin subcommand");
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
