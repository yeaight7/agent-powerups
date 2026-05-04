# Plugins

Domain-specific plugin bundles for Agent Powerups. Each plugin extends the base powerups with deeper, specialized skills, agents, and commands for a particular engineering domain.

## Available Plugins

| Plugin | Domain | Status |
|---|---|---|
| [`data-engineering`](data-engineering/) | dbt, BigQuery, data quality, analytics engineering | active |
| [`dev-vitals`](dev-vitals/) | Core engineering: task intake, context minimization, handoffs | active |
| [`debugging-diagnostics`](debugging-diagnostics/) | Error investigation, log forensics, flaky tests, repros | active |
| [`codebase-maintenance`](codebase-maintenance/) | Safe refactoring, dead code, incremental migrations | active |
| [`documentation-systems`](documentation-systems/) | Doc architecture, README hardening, ADRs, context docs | active |
| [`machine-learning-ops`](machine-learning-ops/) | Experiment tracking, model evaluation, leakage checks | active |
| [`quality-gates`](quality-gates/) | Change impact, pre-release verification, risk-based review | active |
| [`software-engineering`](software-engineering/) | Parallel execution, requirements clarification, autonomous delivery | experimental |
| [`agentic-systems`](agentic-systems/) | Multi-model orchestration, canonical advisor routing | experimental |
| [`security-guardrails`](security-guardrails/) | Security vulnerability detection, secrets scanning, dependency audits | experimental |
| [`codebase-intelligence`](codebase-intelligence/) | Parallel codebase mapping: architecture, stack, conventions, concerns | experimental |
| [`spec-driven-development`](spec-driven-development/) | Spec-driven lifecycle: discuss → plan → execute → verify | experimental |
| [`spec-quality-gates`](spec-quality-gates/) | Adversarial plan verification and structured code review | experimental |
| [`context-efficiency`](context-efficiency/) | Context-efficient dispatch routers for workflow, review, and codebase commands | experimental |

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

## Root Skills vs Plugin Skills

Root skills in `../skills/` are general-purpose and standalone. Plugin skills are domain-specific and go deeper. A plugin skill may cover the same topic as a root skill — it must not replace or override it.
