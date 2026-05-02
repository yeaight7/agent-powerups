---
name: data-quality
description: This skill should be used when adding data quality tests to dbt models in the analytics-genially project. Covers dbt generic tests, singular tests (assert_*.sql), accepted values macros, dbt_utils test patterns, cross-system consistency tests, and BigQuery-specific testing considerations. Use when writing data tests, creating assert_*.sql files, testing business logic, or validating referential integrity in this project.
---

# Data Quality — analytics-genially

Testing patterns for the `analytics_genially` dbt project on BigQuery. This project uses **dbt tests exclusively** — no external frameworks like Great Expectations.

## Test Types

### 1. Generic Tests (in YAML files)

Defined in `.yml` files alongside models. Use `data_tests:` (not `tests:`):

```yaml
# models/core/shared/dim_teams.yml
models:
  - name: dim_teams
    columns:
      - name: id
        description: Surrogate key
        data_tests:
          - unique
          - not_null

      - name: natural_id
        description: Natural key from source
        data_tests:
          - unique
          - not_null

      - name: plan_code
        description: Subscription plan code
        data_tests:
          - accepted_values:
              values: "{{ get_plan_code_values() }}"  # Use macros, not hardcoded lists
```

### 2. Singular Tests (assert_*.sql files)

Business logic tests live in `tests/` as `assert_*.sql` files. They pass when they return **zero rows**:

```sql
-- tests/teams/assert_teams_created_before_deleted.sql
with teams as (
    select * from {{ ref('dim_teams') }}
)

select
    teams.natural_id,
    teams.created_at,
    teams.deleted_at
from teams
where teams.deleted_at < teams.created_at
```

```sql
-- tests/academy/assert_students_with_completed_modules_are_enrolled.sql
with completed as (
    select distinct student_id from {{ ref('fct_academy_course_modules_completed') }}
),

enrolled as (
    select distinct student_id from {{ ref('fct_academy_course_enrollments') }}
),

orphaned as (
    select completed.student_id
    from completed
    left join enrolled
        on completed.student_id = enrolled.student_id
    where enrolled.student_id is null
)

select * from orphaned
```

Organize singular tests in subdirectories matching the domain: `tests/academy/`, `tests/geniallys/`, `tests/int_netsuite_invoices/`, etc.

## Generic Test Patterns

### Primary Key Tests

Every model's primary key (`id`) must have both tests:

```yaml
- name: id
  data_tests:
    - unique
    - not_null
```

### Referential Integrity

```yaml
- name: dim_user_id
  data_tests:
    - not_null
    - relationships:
        to: ref('dim_users')
        field: id
```

### Accepted Values

Use macros from `macros/accepted_values/` instead of hardcoding values:

```yaml
- name: plan_code
  data_tests:
    - accepted_values:
        values: "{{ get_plan_code_values() }}"
```

Browse available macros: `macros/accepted_values/get_*.sql`

### dbt_utils Tests

```yaml
models:
  - name: fct_team_members
    data_tests:
      # Table must not be empty
      - dbt_utils.at_least_one:
          column_name: id
      # Data freshness — table updated in last 24h
      - dbt_utils.recency:
          datepart: hour
          field: created_at
          interval: 24
      # Business rule on a measure
      - dbt_utils.expression_is_true:
          expression: "total_seats >= 0"

    columns:
      - name: team_id
        data_tests:
          # Cross-table: team must exist in dim_teams
          - relationships:
              to: ref('dim_teams')
              field: natural_id
```

### Date Logic Tests

```yaml
- name: end_at
  data_tests:
    # end_at must be after start_at when both are set
    - dbt_utils.expression_is_true:
        expression: "end_at is null or end_at > start_at"
```

## Custom Generic Tests

Define reusable tests in `tests/generic/` or use the project's existing test_utils:

```sql
-- tests/generic/test_no_future_dates.sql
{% test no_future_dates(model, column_name) %}

select {{ column_name }}
from {{ model }}
where {{ column_name }} > current_timestamp

{% endtest %}
```

Usage in YAML:
```yaml
- name: created_at
  data_tests:
    - no_future_dates
```

## Cross-System Consistency

Assert that data is consistent across source systems. These go in `tests/` as singular tests:

```sql
-- tests/finance/assert_netsuite_invoices_plan_matches_team_plan.sql
-- Tests consistency between Netsuite invoices and Genially team data
with invoices as (
    select * from {{ ref('fct_netsuite_all_invoices') }}
),

teams as (
    select * from {{ ref('dim_teams') }}
),

mismatched as (
    select
        invoices.invoice_id,
        invoices.plan_code as invoice_plan,
        teams.plan_code as team_plan
    from invoices
    inner join teams
        on invoices.team_id = teams.natural_id
    where invoices.plan_code != teams.plan_code
      and invoices.is_active
)

select * from mismatched
```

## Test Organization

```
tests/
├── academy/          Tests for academy domain models
├── adhoc/            Ad-hoc spot-check tests
├── geniallys/        Tests for genially creation models
├── int_netsuite_invoices/  Finance cross-system tests
└── generic/          Reusable generic test definitions
```

## Running Tests

```bash
dbt test                          # All tests
dbt test -s <model>               # Tests for one model
dbt test -s tag:critical          # Tests with a specific tag
dbt build -s <model>              # Run + test together
dbt test --store-failures         # Persist failures to BQ for inspection
```

To inspect test failures in BigQuery (development):

```sql
select * from `dbt_<username>`.`dbt_test__audit`.<test_name>
```

## Test Coverage Checklist

For every new model:

- [ ] Primary key `id`: `unique` + `not_null`
- [ ] Primary key `natural_id`: `unique` + `not_null`
- [ ] All FK columns: `relationships` test
- [ ] All enum columns: `accepted_values` using a macro
- [ ] Business rules: `dbt_utils.expression_is_true` or singular tests
- [ ] Missing record sentinel: verify `id` test catches duplicates
- [ ] Data freshness: `dbt_utils.recency` for frequently updated tables

## Best Practices

- Focus tests on columns that matter to business decisions
- Use macros from `macros/accepted_values/` — never hardcode enum lists in YAML
- Write singular tests for non-obvious business rules that need explicit documentation
- Organize singular tests in domain subdirectories matching the model domain
- Use `--store-failures` in development to inspect what went wrong
- Test referential integrity between fact and dimension tables
