# Plugins

Domain-specific plugin bundles for Agent Powerups. Each plugin extends the base powerups with deeper, specialized skills, agents, and commands for a particular engineering domain.

## Available Plugins

| Plugin | Domain | Status |
|---|---|---|
| [`data-engineering`](data-engineering/) | dbt, BigQuery, Airflow, analytics engineering | seed content |
| [`dev-vitals`](dev-vitals/) | Core engineering: code review, Git, auth, SQL, monorepo | planned |
| [`debugging-diagnostics`](debugging-diagnostics/) | Error investigation, log forensics, fault isolation | planned |
| [`codebase-maintenance`](codebase-maintenance/) | Refactoring, legacy modernization, dependency hygiene | planned |
| [`documentation-systems`](documentation-systems/) | Doc architecture, API reference, ADR writing | planned |
| [`machine-learning-ops`](machine-learning-ops/) | ML pipelines, experiment tracking, model serving | planned |
| [`quality-gates`](quality-gates/) | TDD, PR review, evaluation methodology | planned |

Full planned inventory (skills, agents, commands) is in [`../plugin-bundles.json`](../plugin-bundles.json).

Architecture rules and the root-skill vs plugin-skill duplication policy are in [`../docs/plugin-expansion-contract.md`](../docs/plugin-expansion-contract.md).

## Structure

Each plugin follows the standard Claude Code plugin layout:

```
<plugin-name>/
├── .claude-plugin/
│   └── plugin.json      # Manifest (name, version, description)
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

See [`../docs/plugin-expansion-contract.md`](../docs/plugin-expansion-contract.md) for the full duplication rule.
