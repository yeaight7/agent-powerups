import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseOption } from "../utils/args.js";
import { createResult, type ExecutionResult } from "../utils/result.js";

const CONTEXT_TEMPLATE = (name: string) => `\
# Relay: ${name}

Goal: <one sentence>

Scope: <files, decisions, or code in play>

Output format requested: <bullet list / patch / yes-no with explanation / etc.>

## Turn 0 context

<paste relevant code, diff, error, or plan here>
`;

type RelayProvider = "gemini";

interface RelayState {
  sessionName: string;
  provider: RelayProvider;
  status: "active" | "stopped";
  host: string;
  port: number;
  pid: number;
  acpSessionId: string;
  repoRoot: string;
  startedAt: string;
  updatedAt: string;
}

interface RelayStartData {
  sessionName: string;
  provider: RelayProvider;
  status: "active";
  pid: number;
  port: number;
  statePath: string;
}

interface RelayAskData {
  sessionName: string;
  provider: RelayProvider;
  artifactPath: string;
  promptLength: number;
  stopReason: string;
}

interface RelayStatusData {
  sessionName: string;
  provider?: RelayProvider;
  status: "active" | "stale" | "missing" | "stopped";
  pid?: number;
  port?: number;
  statePath: string;
}

interface RelayStopData {
  sessionName: string;
  status: "stopped";
  statePath: string;
}

interface AcpMessage {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: any;
  result?: any;
  error?: { code: number; message: string; data?: unknown };
}

function validateSessionName(sessionName: string): void {
  if (!sessionName || !/^[a-z0-9][a-z0-9-]*$/.test(sessionName)) {
    throw new Error(
      "Session name must start with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
    );
  }
}

function sessionDir(repoRoot: string, sessionName: string): string {
  return path.join(repoRoot, ".apx", "relay", sessionName);
}

function statePath(repoRoot: string, sessionName: string): string {
  return path.join(sessionDir(repoRoot, sessionName), "relay.json");
}

async function readState(repoRoot: string, sessionName: string): Promise<RelayState | undefined> {
  try {
    return JSON.parse(await fs.readFile(statePath(repoRoot, sessionName), "utf8")) as RelayState;
  } catch {
    return undefined;
  }
}

async function writeState(repoRoot: string, sessionName: string, state: RelayState): Promise<void> {
  await fs.mkdir(sessionDir(repoRoot, sessionName), { recursive: true });
  await fs.writeFile(statePath(repoRoot, sessionName), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return slug || "prompt";
}

function artifactTimestamp(date = new Date()): string {
  return date.toISOString().replace(/[-:]/g, "").replace(".", "");
}

async function resolveCommand(command: string): Promise<string | undefined> {
  const pathEntries = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
  const extensions = process.platform === "win32" ? [".cmd", ".exe", ".bat", ""] : [""];

  for (const entry of pathEntries) {
    for (const extension of extensions) {
      const candidate = path.join(entry, `${command}${extension}`);
      try {
        const stat = await fs.stat(candidate);
        if (stat.isFile()) {
          return candidate;
        }
      } catch {
        // keep searching PATH
      }
    }
  }

  return undefined;
}

function spawnWindowsScript(commandPath: string, args: string[]): ChildProcessWithoutNullStreams {
  return spawn(commandPath, args, {
    env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor" },
    shell: true,
    windowsHide: true,
  });
}

class GeminiAcpClient {
  private nextId = 1;
  private buffer = "";
  private readonly pending = new Map<number | string, { resolve: (message: AcpMessage) => void; reject: (error: Error) => void }>();
  private activePrompt?: { sessionId: string; chunks: string[] };

  constructor(
    private readonly child: ChildProcessWithoutNullStreams,
    private readonly repoRoot: string,
    private readonly log: (line: string) => void,
  ) {
    child.stdout.on("data", (chunk: Buffer) => this.handleStdout(chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => this.log(chunk.toString().trimEnd()));
    child.on("exit", (code, signal) => {
      const error = new Error(`Gemini ACP exited: ${signal ?? code ?? "unknown"}`);
      for (const pending of this.pending.values()) {
        pending.reject(error);
      }
      this.pending.clear();
    });
  }

  async initialize(): Promise<void> {
    await this.request("initialize", {
      protocolVersion: 1,
      clientCapabilities: {
        fs: { readTextFile: true, writeTextFile: false },
        terminal: false,
      },
      clientInfo: { name: "agent-powerups-relay", version: "0.1.0" },
    });
  }

  async newSession(model?: string): Promise<string> {
    const response = await this.request("session/new", {
      cwd: this.repoRoot,
      mcpServers: [],
    });
    const sessionId = response.result?.sessionId;
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("Gemini ACP did not return a sessionId");
    }
    if (model) {
      await this.request("session/set_model", { sessionId, modelId: model });
    }
    return sessionId;
  }

  async prompt(sessionId: string, prompt: string, timeoutMs: number): Promise<{ text: string; stopReason: string }> {
    if (this.activePrompt) {
      throw new Error("Relay is already handling a prompt");
    }
    this.activePrompt = { sessionId, chunks: [] };
    try {
      const response = await this.request(
        "session/prompt",
        {
          sessionId,
          prompt: [{ type: "text", text: prompt }],
        },
        timeoutMs,
      );
      return {
        text: this.activePrompt.chunks.join(""),
        stopReason: response.result?.stopReason ?? "unknown",
      };
    } finally {
      this.activePrompt = undefined;
    }
  }

  close(): void {
    this.child.kill();
  }

  private request(method: string, params: unknown, timeoutMs = 30000): Promise<AcpMessage> {
    const id = this.nextId;
    this.nextId += 1;
    const message = { jsonrpc: "2.0", id, method, params };
    this.child.stdin.write(`${JSON.stringify(message)}\n`);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for Gemini ACP method: ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (response) => {
          clearTimeout(timer);
          if (response.error) {
            reject(new Error(response.error.message));
            return;
          }
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
    });
  }

  private handleStdout(chunk: string): void {
    this.buffer += chunk;
    let newlineIndex = this.buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);
      if (line) {
        this.handleMessage(line);
      }
      newlineIndex = this.buffer.indexOf("\n");
    }
  }

  private handleMessage(line: string): void {
    let message: AcpMessage;
    try {
      message = JSON.parse(line) as AcpMessage;
    } catch (error) {
      this.log(`Invalid ACP JSON: ${String(error)}`);
      return;
    }

    if (message.method === "session/update") {
      const update = message.params?.update;
      if (
        this.activePrompt &&
        message.params?.sessionId === this.activePrompt.sessionId &&
        update?.sessionUpdate === "agent_message_chunk" &&
        update.content?.type === "text" &&
        typeof update.content.text === "string"
      ) {
        this.activePrompt.chunks.push(update.content.text);
      }
      return;
    }

    if (message.method === "fs/read_text_file" && message.id !== undefined) {
      void this.handleReadTextFile(message);
      return;
    }

    if (message.id !== undefined && message.id !== null) {
      const pending = this.pending.get(message.id);
      if (pending) {
        this.pending.delete(message.id);
        pending.resolve(message);
      }
    }
  }

  private async handleReadTextFile(message: AcpMessage): Promise<void> {
    try {
      const requestedPath = String(message.params?.path ?? "");
      const absolutePath = path.isAbsolute(requestedPath)
        ? path.resolve(requestedPath)
        : path.resolve(this.repoRoot, requestedPath);
      const relativePath = path.relative(this.repoRoot, absolutePath);
      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        throw new Error(`Refusing to read outside relay repo: ${requestedPath}`);
      }

      let content = await fs.readFile(absolutePath, "utf8");
      if (typeof message.params?.line === "number") {
        content = content.split(/\r?\n/).slice(message.params.line).join("\n");
      }
      if (typeof message.params?.limit === "number") {
        content = content.slice(0, message.params.limit);
      }
      this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: message.id, result: { content } })}\n`);
    } catch (error) {
      this.child.stdin.write(
        `${JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          error: { code: -32000, message: error instanceof Error ? error.message : String(error) },
        })}\n`,
      );
    }
  }
}

async function sendDaemonRequest<T>(
  state: RelayState,
  request: Record<string, unknown>,
  timeoutMs = 30000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: state.host, port: state.port });
    let buffer = "";
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("Timed out waiting for relay daemon"));
    }, timeoutMs);

    socket.on("connect", () => {
      socket.write(`${JSON.stringify(request)}\n`);
    });
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex < 0) {
        return;
      }
      clearTimeout(timer);
      socket.end();
      const line = buffer.slice(0, newlineIndex).trim();
      try {
        const response = JSON.parse(line) as { ok: boolean; error?: string; data?: T };
        if (!response.ok) {
          reject(new Error(response.error ?? "Relay daemon request failed"));
          return;
        }
        resolve(response.data as T);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
    socket.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function pingState(state: RelayState): Promise<boolean> {
  try {
    await sendDaemonRequest(state, { type: "ping" }, 1000);
    return true;
  } catch {
    return false;
  }
}

function cliPath(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "apx.js");
}

function parseProvider(argv: string[]): RelayProvider {
  const provider = parseOption(argv, "--provider") ?? "gemini";
  if (provider !== "gemini") {
    throw new Error("Persistent relay currently supports --provider gemini");
  }
  return provider;
}

function parseRelayPrompt(argv: string[]): string {
  const parts: string[] = [];
  for (let index = 3; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      continue;
    }
    if (arg === "--timeout-ms") {
      index += 1;
      continue;
    }
    parts.push(arg);
  }
  return parts.join(" ").trim();
}

async function nextTurnNumber(dir: string, provider: RelayProvider): Promise<number> {
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((entry) => entry.startsWith(`${provider}-turn-`) && entry.endsWith(".md")).length + 1;
  } catch {
    return 1;
  }
}

function relayArtifactContent(input: {
  sessionName: string;
  provider: RelayProvider;
  prompt: string;
  output: string;
  stopReason: string;
}): string {
  return [
    `# Relay ${input.provider} Artifact`,
    "",
    `session: ${input.sessionName}`,
    `provider: ${input.provider}`,
    `stopReason: ${input.stopReason}`,
    "",
    "## Prompt",
    "",
    "```text",
    input.prompt,
    "```",
    "",
    "## Response",
    "",
    "```text",
    input.output || "(no output)",
    "```",
    "",
  ].join("\n");
}

export async function runRelayInitCommand(repoRoot: string, sessionName: string): Promise<ExecutionResult> {
  validateSessionName(sessionName);

  const dir = sessionDir(repoRoot, sessionName);
  const contextPath = path.join(dir, "context.md");

  let alreadyExists = false;
  try {
    await fs.access(contextPath);
    alreadyExists = true;
  } catch {
    // expected: new session
  }

  if (alreadyExists) {
    throw new Error(`Relay session already exists: ${contextPath}`);
  }

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(contextPath, CONTEXT_TEMPLATE(sessionName), "utf8");

  return createResult({
    stdout: [
      `relay session: ${sessionName}`,
      `context: ${contextPath}`,
      "",
      "Edit context.md to describe your goal and paste Turn 0 context.",
      `Then start the persistent secondary agent: apx relay start ${sessionName} --provider gemini`,
      `Delegate with: apx relay ask ${sessionName} "<task for secondary agent>"`,
    ].join("\n"),
    actions: [`write ${contextPath}`],
  });
}

export async function runRelayStartCommand(repoRoot: string, argv: string[]): Promise<ExecutionResult<RelayStartData>> {
  const sessionName = argv[2];
  if (!sessionName) {
    throw new Error("Missing session name for relay start");
  }
  validateSessionName(sessionName);

  const provider = parseProvider(argv);
  const existingState = await readState(repoRoot, sessionName);
  if (existingState && existingState.status === "active" && await pingState(existingState)) {
    return createResult({
      stdout: [`relay active`, `session: ${sessionName}`, `provider: ${existingState.provider}`].join("\n"),
      data: {
        sessionName,
        provider: existingState.provider,
        status: "active",
        pid: existingState.pid,
        port: existingState.port,
        statePath: statePath(repoRoot, sessionName),
      },
    });
  }

  await fs.mkdir(sessionDir(repoRoot, sessionName), { recursive: true });
  const args = [cliPath(), "relay", "daemon", sessionName, "--provider", provider];
  const model = parseOption(argv, "--model");
  if (model) {
    args.push("--model", model);
  }

  const child = spawn(process.execPath, args, {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore",
    env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor", APX_RELAY_DAEMON: "1" },
    windowsHide: true,
  });
  child.unref();

  for (let attempt = 0; attempt < 100; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const state = await readState(repoRoot, sessionName);
    if (state?.status === "active" && await pingState(state)) {
      return createResult({
        stdout: [`relay started`, `session: ${sessionName}`, `provider: ${provider}`, `pid: ${state.pid}`].join("\n"),
        actions: [`write ${statePath(repoRoot, sessionName)}`],
        data: {
          sessionName,
          provider,
          status: "active",
          pid: state.pid,
          port: state.port,
          statePath: statePath(repoRoot, sessionName),
        },
      });
    }
  }

  throw new Error(`Relay daemon did not become ready: ${statePath(repoRoot, sessionName)}`);
}

export async function runRelayStatusCommand(repoRoot: string, sessionName: string): Promise<ExecutionResult<RelayStatusData>> {
  validateSessionName(sessionName);
  const stateFile = statePath(repoRoot, sessionName);
  const state = await readState(repoRoot, sessionName);
  if (!state) {
    return createResult({
      exitCode: 1,
      stdout: `relay missing\nsession: ${sessionName}`,
      warnings: ["relay session state not found"],
      data: { sessionName, status: "missing", statePath: stateFile },
    });
  }

  if (state.status === "stopped") {
    return createResult({
      stdout: `relay stopped\nsession: ${sessionName}`,
      data: { sessionName, provider: state.provider, status: "stopped", pid: state.pid, port: state.port, statePath: stateFile },
    });
  }

  const active = await pingState(state);
  return createResult({
    exitCode: active ? 0 : 1,
    stdout: [`relay ${active ? "active" : "stale"}`, `session: ${sessionName}`, `provider: ${state.provider}`].join("\n"),
    warnings: active ? [] : ["relay daemon is not reachable"],
    data: { sessionName, provider: state.provider, status: active ? "active" : "stale", pid: state.pid, port: state.port, statePath: stateFile },
  });
}

export async function runRelayAskCommand(repoRoot: string, argv: string[]): Promise<ExecutionResult<RelayAskData>> {
  const sessionName = argv[2];
  if (!sessionName) {
    throw new Error("Missing session name for relay ask");
  }
  validateSessionName(sessionName);

  const prompt = parseRelayPrompt(argv);
  if (!prompt) {
    throw new Error("Missing prompt for relay ask");
  }

  const state = await readState(repoRoot, sessionName);
  if (!state || state.status !== "active") {
    throw new Error(`Relay is not active. Start it with: apx relay start ${sessionName} --provider gemini`);
  }

  const timeoutMs = Number(parseOption(argv, "--timeout-ms") ?? 120000);
  const response = await sendDaemonRequest<{ text: string; stopReason: string }>(
    state,
    { type: "ask", prompt, timeoutMs },
    timeoutMs + 1000,
  );

  const dir = sessionDir(repoRoot, sessionName);
  await fs.mkdir(dir, { recursive: true });
  const turn = await nextTurnNumber(dir, state.provider);
  const artifactPath = path.join(dir, `${state.provider}-turn-${turn}-${slugify(prompt)}-${artifactTimestamp()}.md`);
  await fs.writeFile(
    artifactPath,
    relayArtifactContent({
      sessionName,
      provider: state.provider,
      prompt,
      output: response.text,
      stopReason: response.stopReason,
    }),
    "utf8",
  );

  return createResult({
    stdout: ["relay response", `session: ${sessionName}`, `artifact: ${artifactPath}`, "", response.text].join("\n"),
    actions: [`write ${artifactPath}`],
    data: {
      sessionName,
      provider: state.provider,
      artifactPath,
      promptLength: prompt.length,
      stopReason: response.stopReason,
    },
  });
}

export async function runRelayStopCommand(repoRoot: string, sessionName: string): Promise<ExecutionResult<RelayStopData>> {
  validateSessionName(sessionName);
  const stateFile = statePath(repoRoot, sessionName);
  const state = await readState(repoRoot, sessionName);
  if (state) {
    try {
      await sendDaemonRequest(state, { type: "stop" }, 3000);
    } catch {
      try {
        process.kill(state.pid);
      } catch {
        // already stopped
      }
    }
    await writeState(repoRoot, sessionName, {
      ...state,
      status: "stopped",
      updatedAt: new Date().toISOString(),
    });
  }

  return createResult({
    stdout: [`relay stopped`, `session: ${sessionName}`].join("\n"),
    actions: state ? [`write ${stateFile}`] : [],
    data: { sessionName, status: "stopped", statePath: stateFile },
  });
}

export async function runRelayDaemonCommand(repoRoot: string, argv: string[]): Promise<ExecutionResult> {
  const sessionName = argv[2];
  if (!sessionName) {
    throw new Error("Missing session name for relay daemon");
  }
  validateSessionName(sessionName);
  const provider = parseProvider(argv);
  const model = parseOption(argv, "--model");
  const logPath = path.join(sessionDir(repoRoot, sessionName), "relay.log");
  await fs.mkdir(sessionDir(repoRoot, sessionName), { recursive: true });
  const log = (line: string) => {
    if (line) {
      void fs.appendFile(logPath, `${new Date().toISOString()} ${line}\n`, "utf8");
    }
  };

  const commandPath = await resolveCommand(provider);
  if (!commandPath) {
    throw new Error("Local Gemini CLI is required for relay. Install and verify with: gemini --version");
  }

  const acpChild = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(commandPath)
    ? spawnWindowsScript(commandPath, ["--acp"])
    : spawn(commandPath, ["--acp"], {
        env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor" },
        windowsHide: true,
      });
  const acp = new GeminiAcpClient(acpChild, repoRoot, log);
  await acp.initialize();
  const acpSessionId = await acp.newSession(model);

  const server = net.createServer((socket) => {
    let buffer = "";
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      let newlineIndex = buffer.indexOf("\n");
      while (newlineIndex >= 0) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (line) {
          void handleDaemonLine(line, socket, acp, acpSessionId, server);
        }
        newlineIndex = buffer.indexOf("\n");
      }
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Relay daemon did not bind a TCP port");
  }

  const now = new Date().toISOString();
  await writeState(repoRoot, sessionName, {
    sessionName,
    provider,
    status: "active",
    host: "127.0.0.1",
    port: address.port,
    pid: process.pid,
    acpSessionId,
    repoRoot,
    startedAt: now,
    updatedAt: now,
  });

  await new Promise<void>((resolve) => {
    server.on("close", resolve);
  });
  acp.close();
  return createResult({ stdout: "relay daemon stopped" });
}

async function handleDaemonLine(
  line: string,
  socket: net.Socket,
  acp: GeminiAcpClient,
  acpSessionId: string,
  server: net.Server,
): Promise<void> {
  const respond = (response: Record<string, unknown>) => {
    socket.write(`${JSON.stringify(response)}\n`);
  };

  try {
    const request = JSON.parse(line) as { type?: string; prompt?: string; timeoutMs?: number };
    if (request.type === "ping") {
      respond({ ok: true, data: { status: "active" } });
      return;
    }
    if (request.type === "ask") {
      if (!request.prompt) {
        throw new Error("Missing relay prompt");
      }
      const result = await acp.prompt(acpSessionId, request.prompt, request.timeoutMs ?? 120000);
      respond({ ok: true, data: result });
      return;
    }
    if (request.type === "stop") {
      respond({ ok: true, data: { status: "stopped" } });
      socket.end();
      server.close();
      return;
    }
    throw new Error(`Unknown relay daemon request: ${request.type ?? "(missing)"}`);
  } catch (error) {
    respond({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}
