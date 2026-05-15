# migration-review-required

**Type:** PreToolUse / PostToolUse hook recipe — review before use, not auto-applied.

## Purpose

Surface a review checklist whenever a database migration file is created or modified. Migrations are hard to reverse in production; catching issues before they land is cheap. This hook does not hard-block by default — it inserts a required review step.

## Trigger Suggestion

```
PreToolUse → tool in [Write, Edit] AND target path matches migration directory
  OR
PostToolUse → tool in [Write, Edit] AND target path matches migration directory
```

## Matcher Patterns

Flag writes or edits to files under any of these paths:

| Path | Framework |
|---|---|
| `migrations/` | Generic / Django |
| `db/migrate/` | Rails |
| `prisma/migrations/` | Prisma |
| `alembic/versions/` | SQLAlchemy Alembic |
| `supabase/migrations/` | Supabase |
| `liquibase/` | Liquibase |
| `flyway/` | Flyway |

Also flag files matching `*_migration.*`, `*.sql` under the paths above.

## Behavior

When a migration file write is detected:

1. Print: `[migration-review-required] Database migration file modified:`
2. Show the target file path.
3. Print the review checklist (see below).
4. Request confirmation that the checklist has been reviewed.

### Review Checklist

```
MIGRATION REVIEW CHECKLIST

[ ] Migration is reversible — a `down` / rollback method exists or is documented
[ ] No data loss without explicit acknowledgment (DROP COLUMN, TRUNCATE, etc.)
[ ] Column/table renames use a multi-step strategy (add → backfill → drop old)
[ ] New NOT NULL columns have a default or backfill step before the constraint
[ ] Indexes created CONCURRENTLY (Postgres) or equivalent low-impact strategy
[ ] Foreign key constraints added in a non-locking order
[ ] Migration tested on a copy of production data size (not just empty schema)
[ ] Estimated run time documented for large tables
```

## Safe Default

Warn and show the checklist. Do not hard-block — some projects run migrations automatically in CI where a blocking hook would break the pipeline.

## Blocking vs Warning Mode

- **Warning (recommended default):** Show checklist, request acknowledgment.
- **Blocking:** Use when the team wants to enforce explicit sign-off before any migration lands.

## False-Positive Risks

- Auto-generated migration files (Prisma, Alembic auto-generate) — these still need review; false positives here are acceptable.
- Read-model or seed files placed in `migrations/` that aren't schema migrations.

## Bypass / Approval Mechanism

Agent or user acknowledges each checklist item before proceeding. A blanket "continue" without addressing the checklist should be treated as insufficient.

## Example Implementation Sketch

```bash
#!/usr/bin/env bash
# Called with $TARGET_PATH set by the hook runner.

MIGRATION_PATTERNS=(
  "migrations/"
  "db/migrate/"
  "prisma/migrations/"
  "alembic/versions/"
  "supabase/migrations/"
  "liquibase/"
  "flyway/"
)

for pattern in "${MIGRATION_PATTERNS[@]}"; do
  if echo "$TARGET_PATH" | grep -q "$pattern"; then
    echo "[migration-review-required] Database migration file modified: $TARGET_PATH"
    echo ""
    echo "MIGRATION REVIEW CHECKLIST:"
    echo "  [ ] Migration is reversible"
    echo "  [ ] No unacknowledged data loss"
    echo "  [ ] NOT NULL columns have defaults or backfill steps"
    echo "  [ ] Indexes created with low-impact strategy"
    echo "  [ ] Estimated run time documented for large tables"
    echo ""
    echo "Confirm checklist reviewed before proceeding."
    exit 1  # Set to exit 0 for warning-only mode
  fi
done

exit 0
```

## Sources / Inspiration

Database migration safety patterns from Rails, Django, and Postgres documentation. Inspired by zero-downtime migration checklists common in high-traffic production systems.
