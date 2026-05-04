#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runAgentsMdListCommand, runAgentsMdPrintCommand } from "./commands/agents-md.js";
import { runAskCommand } from "./commands/ask.js";
import { runTypedAssetListCommand, runTypedAssetPrintCommand } from "./commands/assets.js";
import { runCheckCommand } from "./commands/check.js";
import { runDoctorCommand } from "./commands/doctor.js";
import { runNoSecretsPreflightCommand } from "./commands/hooks.js";
import { runInfoCommand } from "./commands/info.js";
import { runInstallCommand } from "./commands/install.js";
import { runListCommand } from "./commands/list.js";
import { runMcpCheckCommand, runMcpInstallCommand, runMcpListCommand, runMcpPrintCommand, runMcpSmokeCommand, runMcpWriteCommand } from "./commands/mcp.js";
import { runPluginBuildCommand, runPluginDiffCommand, runPluginValidateCommand } from "./commands/plugin.js";
import { runPluginsListCommand, runPluginsInfoCommand, runPluginsValidateCommand, runPluginsInstallCommand } from "./commands/plugins.js";
import { runProfilesListCommand, runProfilesInfoCommand, runProfilesPlanCommand, runProfilesInstallCommand } from "./commands/profiles.js";
import { runSecurityAuditCommand } from "./commands/security-audit.js";
import { runAuditRepoCommand, runAuditSkillsCommand, runAuditPluginsCommand, runAuditTargetCommand } from "./commands/audit.js";
import { runQualityGateCommand } from "./commands/quality-gate.js";
import { runRelayAskCommand, runRelayDaemonCommand, runRelayInitCommand, runRelayStartCommand, runRelayStatusCommand, runRelayStopCommand } from "./commands/relay.js";
import { runShipCheckCommand } from "./commands/run-command.js";
import { parseSetupAgent, parseSetupMode, runSetupCommand } from "./commands/setup.js";
import {
  runTriReviewCommand,
  runClarifyRequirementsCommand,
  runParallelWorkCommand,
  runFinishLoopCommand,
} from "./commands/advisor-workflows.js";
import {
  runProjectInitCommand,
  runPhaseDiscussCommand,
  runPhasePlanCommand,
  runPhaseExecuteCommand,
  runPhaseVerifyCommand,
  runCodebaseMapCommand,
  runReviewCodeCommand,
  runWorkflowRouteCommand,
  runReviewRouteCommand,
  runContextRouteCommand,
} from "./commands/phase-workflows.js";
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
apx check [asset-name] [--install-missing] [--dry-run|--yes]
apx doctor [--full] [--json]
apx ask <claude|gemini|codex> <prompt> [--artifact-dir <path>] [--json]
apx ask-claude <prompt> [--artifact-dir <path>] [--json]
apx ask-gemini <prompt> [--artifact-dir <path>] [--json]
apx ask-codex <prompt> [--artifact-dir <path>] [--json]
apx ship-check [--full] [--json]
apx no-secrets-preflight [--path <path> | --all] [--json]
apx using-powerups
apx install <asset-name> --target <${INSTALL_TARGETS.join("|")}> [--dry-run] [--dest <path>]
apx setup <codex|claude-code|gemini> [--mode minimal|recommended|full] [--dry-run|--yes] [--agent-root <path>] [--instructions-file <path>] [--json]
apx mcp list
apx mcp print <config-name> --target <${INSTALL_TARGETS.join("|")}>
apx mcp smoke <config-name> [--json]
apx mcp install <config-name> --target <codex|claude-code|generic> [--dry-run|--yes] [--agent-root <path>] [--dest <path>] [--force] [--json]
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
apx plugins list [--json]
apx plugins info <plugin-name> [--json]
apx plugins validate <plugin-name> [--json]
apx plugins validate --all [--json]
apx plugins install <plugin-name> --target <codex|claude-code|generic> [--dest <path>] [--dry-run|--yes] [--force] [--json]
apx profiles list [--json]
apx profiles info <profile-name> [--json]
apx profiles plan <profile-name> --target <codex|claude-code|generic> [--json]
apx profiles install <profile-name> --target <codex|claude-code|generic> [--dry-run|--yes] [--dest <path>] [--force] [--json]
apx security-audit --path <path> [--json]
apx security-audit --all [--json]
apx audit repo [--json]
apx audit skills [--json]
apx audit plugins [--json]
apx audit target <codex|claude-code|gemini-cli|cursor|generic> [--json]
apx quality-gate --scope <repo|plugins|release> [--json]
apx validate skills
apx validate catalog
apx relay init <session-name>
apx relay start <session-name> [--provider <gemini|claude|codex>] [--model <model>] [--json]
apx relay status <session-name> [--json]
apx relay ask <session-name> <prompt> [--timeout-ms <ms>] [--json]
apx relay stop <session-name> [--json]
apx tri-review "<task>" [--run-advisors] [--json]
apx clarify-requirements "<request>" [--json]
apx parallel-work plan "<task>" [--json]
apx finish-loop plan "<task>" [--json]
apx project init [--dest <path>] [--yes] [--json]
apx phase discuss <phase> [--planning-root <path>] [--json]
apx phase plan <phase> [--planning-root <path>] [--research] [--prd <path>] [--mvp] [--json]
apx phase execute <phase> [--planning-root <path>] [--wave <n>] [--interactive] [--json]
apx phase verify <phase> [--planning-root <path>] [--json]
apx codebase map [--dest <path>] [--yes] [--json]
apx review code [--depth quick|standard|deep] [--files <csv>] [--fix] [--json]
apx review route "<request>" [--json]
apx workflow route "<request>" [--json]
apx context route "<request>" [--json]`;

function getPackageVersion(): string {
  let current = path.dirname(fileURLToPath(import.meta.url));
  while (true) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(current, "package.json"), "utf8"));
      if (pkg.name === "agent-powerups" && typeof pkg.version === "string") {
        return pkg.version;
      }
    } catch {
      // Keep walking toward the repository/package root.
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return "unknown";
    }
    current = parent;
  }
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
      const result = await runCheckCommand(service, assetName, {
        installMissing: hasFlag(argv, "--install-missing"),
        dryRun: hasFlag(argv, "--dry-run"),
        yes: hasFlag(argv, "--yes"),
      });
      if (json) {
        io.stdout(
          formatResult(
            createResult({
              exitCode: result.exitCode,
              stdout: result.output,
              warnings: [...(result.exitCode === 0 ? [] : ["missing requirements"]), ...result.warnings],
              actions: result.actions,
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

    if (command === "ask-claude" || command === "ask-gemini" || command === "ask-codex") {
      const provider = command.replace("ask-", "");
      return writeExecutionResult(io, await runAskCommand(service, ["ask", provider, ...argv.slice(1)]), json);
    }

    if (command === "ship-check") {
      return writeExecutionResult(io, await runShipCheckCommand(service, { full: hasFlag(argv, "--full") }), json);
    }

    if (command === "no-secrets-preflight") {
      return writeExecutionResult(
        io,
        await runNoSecretsPreflightCommand(service, {
          all: hasFlag(argv, "--all"),
          paths: parseOptions(argv, "--path"),
        }),
        json,
      );
    }

    if (command === "using-powerups") {
      io.stdout(
        await runTypedAssetPrintCommand(
          service,
          "using-powerups-command",
          "command",
          "command",
          "this prints a command prompt and does not run commands or mutate files",
          "generic",
        ),
      );
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

    if (command === "setup") {
      return writeExecutionResult(
        io,
        await runSetupCommand(service, {
          agent: parseSetupAgent(argv[1]),
          agentRoot: parseOption(argv, "--agent-root"),
          instructionsFile: parseOption(argv, "--instructions-file"),
          dryRun: hasFlag(argv, "--dry-run"),
          yes: hasFlag(argv, "--yes"),
          mode: parseSetupMode(parseOption(argv, "--mode")),
        }),
        json,
      );
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
      if (subcommand === "smoke") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing config name for mcp smoke");
        }
        return writeExecutionResult(io, await runMcpSmokeCommand(service, assetName), json);
      }
      if (subcommand === "install") {
        const assetName = argv[2];
        if (!assetName) {
          throw new Error("Missing config name for mcp install");
        }
        return writeExecutionResult(
          io,
          await runMcpInstallCommand(service, assetName, parseTarget(argv), {
            agentRoot: parseOption(argv, "--agent-root"),
            dest: parseOption(argv, "--dest"),
            dryRun: hasFlag(argv, "--dry-run") || !hasFlag(argv, "--yes"),
            yes: hasFlag(argv, "--yes"),
            force: hasFlag(argv, "--force"),
          }),
          json,
        );
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

    if (command === "security-audit") {
      return writeExecutionResult(
        io,
        await runSecurityAuditCommand(service.repoRoot, {
          paths: parseOptions(argv, "--path"),
          all: hasFlag(argv, "--all"),
        }),
        json,
      );
    }

    if (command === "audit") {
      const subcommand = argv[1];
      if (!subcommand) throw new Error("Missing audit subcommand. Use: apx audit repo|skills|plugins|target <target>");
      if (subcommand === "repo") return writeExecutionResult(io, await runAuditRepoCommand(service), json);
      if (subcommand === "skills") return writeExecutionResult(io, await runAuditSkillsCommand(service), json);
      if (subcommand === "plugins") return writeExecutionResult(io, await runAuditPluginsCommand(service), json);
      if (subcommand === "target") {
        const target = argv[2];
        if (!target) throw new Error("Missing target. Use: apx audit target <codex|claude-code|gemini-cli|cursor|generic>");
        return writeExecutionResult(io, await runAuditTargetCommand(service, target), json);
      }
      throw new Error("Unknown audit subcommand. Use: apx audit repo|skills|plugins|target");
    }

    if (command === "quality-gate") {
      const scope = parseOption(argv, "--scope");
      if (!scope) throw new Error("Missing --scope. Use: apx quality-gate --scope <repo|plugins|release>");
      return writeExecutionResult(io, await runQualityGateCommand(service, scope), json);
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

    if (command === "relay") {
      const subcommand = argv[1];
      if (subcommand === "init") {
        const sessionName = argv[2];
        if (!sessionName) {
          throw new Error("Missing session name for relay init");
        }
        return writeExecutionResult(io, await runRelayInitCommand(repoRoot, sessionName), json);
      }
      if (subcommand === "start") {
        return writeExecutionResult(io, await runRelayStartCommand(repoRoot, argv), json);
      }
      if (subcommand === "status") {
        const sessionName = argv[2];
        if (!sessionName) {
          throw new Error("Missing session name for relay status");
        }
        return writeExecutionResult(io, await runRelayStatusCommand(repoRoot, sessionName), json);
      }
      if (subcommand === "ask") {
        return writeExecutionResult(io, await runRelayAskCommand(repoRoot, argv), json);
      }
      if (subcommand === "stop") {
        const sessionName = argv[2];
        if (!sessionName) {
          throw new Error("Missing session name for relay stop");
        }
        return writeExecutionResult(io, await runRelayStopCommand(repoRoot, sessionName), json);
      }
      if (subcommand === "daemon") {
        return writeExecutionResult(io, await runRelayDaemonCommand(repoRoot, argv), json);
      }
      throw new Error("Unknown relay subcommand. Use: apx relay init|start|status|ask|stop <session-name>");
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

    if (command === "plugins") {
      const subcommand = argv[1];
      if (!subcommand || subcommand === "list") {
        return await runPluginsListCommand(argv, io);
      }
      if (subcommand === "info") {
        return await runPluginsInfoCommand(argv, io);
      }
      if (subcommand === "validate") {
        return await runPluginsValidateCommand(argv, io);
      }
      if (subcommand === "install") {
        return await runPluginsInstallCommand(argv, io);
      }
      throw new Error("Unknown plugins subcommand");
    }

    if (command === "profiles") {
      const subcommand = argv[1];
      if (!subcommand || subcommand === "list") {
        return await runProfilesListCommand(argv, io);
      }
      if (subcommand === "info") {
        return await runProfilesInfoCommand(argv, io);
      }
      if (subcommand === "plan") {
        return await runProfilesPlanCommand(argv, service, io);
      }
      if (subcommand === "install") {
        return await runProfilesInstallCommand(argv, service, io);
      }
      throw new Error("Unknown profiles subcommand. Use: apx profiles list|info|plan|install");
    }

    // Advisory workflow commands
    if (command === "tri-review") {
      return await runTriReviewCommand(argv, io);
    }

    if (command === "clarify-requirements") {
      return await runClarifyRequirementsCommand(argv, io);
    }

    if (command === "parallel-work") {
      return await runParallelWorkCommand(argv, io);
    }

    if (command === "finish-loop") {
      return await runFinishLoopCommand(argv, io);
    }

    // Phase lifecycle commands
    if (command === "project") {
      const subcommand = argv[1];
      if (subcommand === "init") {
        return await runProjectInitCommand(argv, io);
      }
      throw new Error("Unknown project subcommand. Use: apx project init");
    }

    if (command === "phase") {
      const subcommand = argv[1];
      if (subcommand === "discuss") return await runPhaseDiscussCommand(argv, io);
      if (subcommand === "plan") return await runPhasePlanCommand(argv, io);
      if (subcommand === "execute") return await runPhaseExecuteCommand(argv, io);
      if (subcommand === "verify") return await runPhaseVerifyCommand(argv, io);
      throw new Error("Unknown phase subcommand. Use: apx phase discuss|plan|execute|verify <phase>");
    }

    if (command === "codebase") {
      const subcommand = argv[1];
      if (subcommand === "map") return await runCodebaseMapCommand(argv, io);
      throw new Error("Unknown codebase subcommand. Use: apx codebase map");
    }

    if (command === "review") {
      const subcommand = argv[1];
      if (subcommand === "code") return await runReviewCodeCommand(argv, io);
      if (subcommand === "route") return await runReviewRouteCommand(argv, io);
      throw new Error("Unknown review subcommand. Use: apx review code|route");
    }

    if (command === "workflow") {
      const subcommand = argv[1];
      if (subcommand === "route") return await runWorkflowRouteCommand(argv, io);
      throw new Error("Unknown workflow subcommand. Use: apx workflow route");
    }

    if (command === "context") {
      const subcommand = argv[1];
      if (subcommand === "route") return await runContextRouteCommand(argv, io);
      throw new Error("Unknown context subcommand. Use: apx context route");
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
