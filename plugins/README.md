# Plugins

Domain-specific plugin bundles for Agent Powerups. Each plugin extends the base powerups with deeper, specialized skills, agents, and commands for a particular engineering domain.

## Available Plugins

| Plugin | Domain | Status |
|---|---|---|
| [`data-engineering`](data-engineering/) | dbt, BigQuery, data quality, analytics engineering | beta |
| [`dev-vitals`](dev-vitals/) | Core engineering: task intake, context minimization, handoffs | stable |
| [`debugging-diagnostics`](debugging-diagnostics/) | Error investigation, log forensics, flaky tests, repros | stable |
| [`codebase-maintenance`](codebase-maintenance/) | Safe refactoring, dead code, incremental migrations | beta |
| [`documentation-systems`](documentation-systems/) | Doc architecture, README hardening, ADRs, context docs | beta |
| [`machine-learning-ops`](machine-learning-ops/) | Experiment tracking, model evaluation, leakage checks | beta |
| [`quality-gates`](quality-gates/) | Change impact, pre-release verification, risk-based review | stable |
| [`agent-evaluation-lab`](agent-evaluation-lab/) | Prompt, skill, red-team, and agent behavior evaluation | experimental |
| [`tool-integrations`](tool-integrations/) | Browser, MCP, retrieval, and runtime tool integrations | beta |
| [`memory-optimization`](memory-optimization/) | Graph-backed memory workflows with graphify-first optimization and Markdown helper tools | beta |
| [`software-engineering`](software-engineering/) | Subagent orchestration, worktrees, persistent completion, migrations | experimental |
| [`agentic-systems`](agentic-systems/) | Multi-model orchestration, canonical advisor routing | experimental |
| [`security-guardrails`](security-guardrails/) | Security vulnerability detection, secrets scanning, dependency audits | experimental |
| [`codebase-intelligence`](codebase-intelligence/) | Search-first codebase understanding, mapping, patterns, project intel | beta |
| [`spec-driven-development`](spec-driven-development/) | Requirements clarification, phase planning, workstreams, execution | beta |
| [`mcp-development`](mcp-development/) | Workflow-first MCP server design and evaluation discipline | beta |
| [`skill-authoring`](skill-authoring/) | Reusable skill creation and hard-won workflow extraction | beta |
| [`github-ops`](github-ops/) | GitHub review feedback, CI triage, and PR iteration loops | beta |
| [`connected-apps`](connected-apps/) | Review-first connected-app runbooks and deployment sequencing | experimental |
| [`spec-quality-gates`](spec-quality-gates/) | Adversarial plan verification and structured code review | beta |
| [`context-efficiency`](context-efficiency/) | Context-efficient dispatch routers for workflow, review, and codebase commands | beta |

Full inventory (skills, agents, commands) is tracked in [`../plugin-bundles.json`](../plugin-bundles.json).

## Structure

Each plugin follows the standard coding agent plugin layout:

```
<plugin-name>/
├── .claude-plugin/
│   └── plugin.json      # Claude Code Manifest
├── .codex-plugin/
│   └── plugin.json      # Codex Manifest
├── skills/
│   └── <skill-name>/
│       └── SKILL.md
├── agents/
│   └── <agent-name>.md
└── commands/
    └── <command-name>.md
```

Plugin skills and instruction templates should use YAML frontmatter plus a pure Markdown body. Use Markdown headings for normal structure; reserve XML-like tags only for explicit nested delimiters or machine-readable prompt payloads.

## Root Skills vs Plugin Skills

Root skills in `../skills/` are general-purpose and standalone. Plugin skills are domain-specific and go deeper. A plugin skill may cover the same topic as a root skill — it must not replace or override it.
