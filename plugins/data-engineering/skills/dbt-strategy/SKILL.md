---
name: dbt-strategy
description: Use when creating or modifying dimensional dbt models in warehouse-backed analytics projects. Covers a four-layer warehouse architecture (sources/staging/core/marts), naming conventions, no-alias SQL rule, surrogate-key and missing-record patterns, incremental strategies, deduplication, and common project macros. Use when building fact tables, dimension tables, staging models, writing SQL, or designing tests.
---

# dbt Strategy

Patterns for building dbt models in warehouse-backed analytics projects using Kimball-style dimensional modeling.

## Layer Architecture

```
sources/     Source views — raw data from app DB, event stream, billing, CRM, LMS
    ↓
staging/     Intermediate transformations (keep minimal — new models go directly to core/)
    ↓
core/        Fact and dimension tables (main transformation layer)   → tables
    ↓
marts/       Business aggregations built on top of core             → tables
```

Put new models in `core/` directly. Use `staging/` only when complex intermediate joins are truly necessary.

### Naming Conventions

| Layer    | Prefix  | Example                                         |
|----------|---------|-------------------------------------------------|
| Sources  | `src_`  | `src_app_teams`, `src_events`                   |
| Staging  | `stg_`  | `stg_teams`, `stg_billing_customers`            |
| Core dim | `dim_`  | `dim_teams`, `dim_users`                        |
| Core fct | `fct_`  | `fct_team_members`, `fct_team_budgets`          |
| Marts    | `mart_` | `mart_team_overview`, `mart_creation_overview`  |

**Domain subdirectories** in `core/`: `academy/`, `analytics/`, `finance/`, `product/`, `sales/`, `scoring/`, `shared/`

## Critical SQL Rules

### No Aliases

Always reference the full CTE name — never use aliases:

```sql
-- ❌ WRONG
select u.id, t.name
from users u
join teams t on u.team_id = t.id

-- ✅ CORRECT
select users.id, teams.name
from users
join teams on users.team_id = teams.id
```

### Standard CTE Structure

Every model uses clear CTEs. The final SELECT is always `select * from final`:

```sql
with source_cte as (
    select * from {{ ref('src_app_teams') }}
),

transformed as (
    select
        -- Primary key
        source_cte.team_id,

        -- Attributes
        source_cte.name as team_name,
        source_cte.created_at
    from source_cte
),

final as (
    select * from transformed
)

select * from final
```

## Core Patterns

### Pattern 1: Dimension Table with Surrogate Key + Missing Record

Every dimension includes a `union all` missing record sentinel.

**Key naming rule** (per CLAUDE.md and Kimball):
- Surrogate key: `<object>_sk` — e.g., `team_sk`
- Natural key: `<object>_id` — e.g., `team_id`

> Note: Older models in the project use `id` / `natural_id` — this is legacy. New models must use `<object>_sk` / `<object>_id`.

```sql
{% set missing_team = "'Missing Team'" %}

with team_snapshots as (
    select * from {{ ref('src_snapshot_app_teams') }}
),

latest_state as (
    {{ dbt_utils.deduplicate(
        relation='team_snapshots',
        partition_by='team_id',
        order_by='state_valid_from desc'
    ) }}
),

final as (
    select
        -- Surrogate key
        {{ dbt_utils.generate_surrogate_key(['team_id']) }} as team_sk,
        -- Natural key
        team_id,

        -- Attributes
        latest_state.name,
        latest_state.plan_code,
        latest_state.created_at,
        latest_state.deleted_at

    from latest_state

    union all

    select
        {{ missing_record_id() }} as team_sk,
        '-1' as team_id,
        {{ missing_team }} as name,
        {{ missing_team }} as plan_code,
        cast(null as timestamp) as created_at,
        cast(null as timestamp) as deleted_at
)

select * from final
```

**BigQuery null casts**: `cast(null as int64)`, `cast(null as bool)`, `cast(null as timestamp)`, `cast(null as string)`

### Pattern 2: Fact Table with Foreign Keys

Fact table surrogate key follows the same `<object>_sk` rule. Foreign keys to dimensions reference the dimension's surrogate key (`<dim>_sk`):

```sql
with enrollments as (
    select * from {{ ref('stg_academy_student_enrollments') }}
),

dim_courses as (
    select * from {{ ref('dim_academy_courses') }}
),

dim_users as (
    select * from {{ ref('dim_users') }}
),

final as (
    select
        -- Surrogate key
        {{ dbt_utils.generate_surrogate_key(['enrollments.enrollment_id']) }} as enrollment_sk,
        -- Natural key
        enrollments.enrollment_id,

        -- Foreign keys (reference dimension surrogate keys)
        {{ get_id_null('dim_courses.course_sk') }} as course_sk,
        {{ get_id_null('dim_users.user_sk') }} as user_sk,
        {{ get_date_id('enrollments.enrolled_at') }} as enrolled_date_sk,

        -- Measures
        enrollments.enrolled_at

    from enrollments
    left join dim_courses
        on enrollments.course_id = dim_courses.course_id
    left join dim_users
        on enrollments.user_id = dim_users.user_id
)

select * from final
```

Join dimensions using the **natural key** (`<object>_id`). Store the dimension's **surrogate key** (`<object>_sk`) as the FK column in the fact.
Use `{{ get_id_null(...) }}` for nullable FK references to dimension surrogate keys.
Use `{{ get_date_id(...) }}` for foreign keys to `dim_date`.

### Pattern 3: Deduplication

Use `dbt_utils.deduplicate` — never use `QUALIFY`:

```sql
deduplicated as (
    {{ dbt_utils.deduplicate(
        relation='source_cte',
        partition_by='team_id',
        order_by='updated_at desc'
    ) }}
),
```

### Pattern 4: BigQuery Incremental Model

For large or event tables, use `insert_overwrite` with `partition_by`:

```sql
{{
    config(
        materialized='incremental',
        incremental_strategy='insert_overwrite',
        partition_by={
            "field": "event_date",
            "data_type": "date",
            "granularity": "day"
        }
    )
}}

with events as (
    select * from {{ source('snowplow', 'events') }}

    {% if is_incremental() %}
    where date(collector_tstamp) >= date_sub(current_date, interval 3 day)
    {% endif %}
),

final as (
    select
        events.event_id,
        date(events.collector_tstamp) as event_date,
        events.collector_tstamp
    from events
)

select * from final
```

### Pattern 5: Source Definition (BigQuery)

```yaml
# models/sources/app/_app__sources.yml
version: 2

sources:
  - name: app
    description: Core application database
    database: <warehouse_project>
    schema: app
    tables:
      - name: teams
        description: Raw team records
        columns:
          - name: id
            data_tests:
              - unique
              - not_null
```

Note: use `data_tests:` (not `tests:`) in YAML files in this project.

### Pattern 6: Project Variables

```sql
-- Sentinel values defined in dbt_project.yml
coalesce(teams.plan_code, '{{ var("unknown") }}') as plan_code
coalesce(users.deleted_at, cast('{{ var("the_distant_future") }}' as timestamp)) as deleted_at
```

### Pattern 7: Documentation with Docblocks

Shared descriptions live in `.md` files as Jinja docblocks:

```markdown
<!-- models/core/shared/docs_shared.md -->
{% docs team_id %}
The unique identifier for a team entity in the application.
{% enddocs %}
```

Reference in YAML:
```yaml
columns:
  - name: team_id
    description: "{{ doc('team_id') }}"
    data_tests:
      - unique
      - not_null
```

## Available Macros

| Macro | Purpose |
|-------|---------|
| `missing_record_id()` | Returns the ID used for missing record sentinels |
| `get_id_null(expr)` | Safe FK — returns `missing_record_id()` if null |
| `get_date_id(expr)` | Converts timestamp to `dim_date` FK |
| `deletion_status_field()` | Adds `deletion_status` derived from `deleted_at` |
| `dbt_utils.generate_surrogate_key([...])` | Generates MD5 surrogate key |
| `dbt_utils.deduplicate(relation, partition_by, order_by)` | Deduplicates a CTE |

Accepted values macros live in `macros/accepted_values/` — use these in YAML tests instead of hardcoding enum values.

## Datasets

| Environment | Dataset |
|-------------|---------|
| Production  | `<project>.dbt_production` |
| Development | `dbt_<username>` e.g., `dbt_johndoe` |

Use production for reading, development dataset for writing during development.

## MCP dbt Tools

Before modifying any model, check its context:

```
get_model_details(unique_id)    # Compiled SQL and metadata
get_model_parents(unique_id)    # Upstream dependencies
get_model_children(unique_id)   # Downstream impact
get_all_models()                # Browse all models with metadata
```

## High-Impact Models (Most Connected)

These god nodes have the most downstream dependencies — changes cascade widely:

| Model | Edges | Action before change |
|-------|-------|----------------------|
| `dim_teams` | 46 | `get_model_children()` |
| `dim_users` | 36 | `get_model_children()` |
| `util_user_dimensions` | 32 | `get_model_children()` |
| `fct_team_members` | 22 | `get_model_children()` |

## dbt Commands

```bash
dbt run -s <model>          # Run specific model
dbt test -s <model>         # Test specific model
dbt build -s <model>        # Run + test
dbt run -s +<model>         # Model and all upstream
dbt run -s <model>+         # Model and all downstream
dbt compile -s <model>      # Compile without running
```
