# Compatibility

## How Compatibility Is Assessed

An asset is compatible with a platform if it can be used there without modification. Compatibility is claimed only when:

1. The asset has been tested on that platform, **or**
2. The asset uses only text instructions with no platform-specific syntax, tool names, or invocation patterns (in which case it is marked `generic`).

"Compatible" means the skill's instructions are usable. It does not mean the agent will follow them perfectly — that depends on the agent.

## Platform Notes

### Claude Code

Skills in `skills/` can be used as Claude Code custom skills. Copy the skill folder to `~/.claude/skills/<name>/` and invoke with `/<name>`.

Some skills reference Claude Code-specific tools (TaskCreate, Agent tool). These are noted in the skill's frontmatter or body.

### Codex (OpenAI)

Skills work as system prompt additions or context injections. Some skills have an `agents/openai.yaml` interface definition in their `references/` directory.

### Gemini CLI

Text-based skills work without modification. Load `SKILL.md` content as a tool description or system instruction.

### Cursor

Text-based skills can be added to `.cursorrules` or Cursor's system prompt. Platform-specific tool names (e.g., Claude Code's `Agent` tool) do not apply.

### Generic

Assets marked `generic` make no assumptions about the agent platform. They use only plain text instructions and standard CLI commands (`git`, `gh`, `npm`, `python`). Any instruction-following agent can use them.

## Per-Skill Compatibility

See `catalog.json` for the `compatible_with` field on each asset.

## Tool Dependencies

Some skills require specific CLI tools:

| Skill | Required Tool | Install |
|-------|--------------|---------|
| `defuddle` | Defuddle CLI | `npm install -g defuddle` |
| `markitdown-file-intake` | MarkItDown | `pip install markitdown` |
| `pr-triage` | `gh` CLI (optional) | `brew install gh` |
| `requesting-code-review` | `git` | standard |

Tool-dependent skills work on any agent platform that can run shell commands. The agent is responsible for having the tool available.

## Claiming Compatibility

When contributing a new asset, only mark platforms as compatible if you have tested it there. If you have not tested a platform, leave it out of `compatible_with` rather than guessing.
