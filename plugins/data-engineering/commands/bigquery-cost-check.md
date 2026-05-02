---
description: "Audit a BigQuery SQL query or dbt model for potential cost traps before it hits production."
argument-hint: "<sql_file_or_dbt_model>"
---

# BigQuery Cost Check Command

## CRITICAL BEHAVIORAL RULES

1. **Analyze Static SQL**: You cannot run the query to see the bytes billed. You must statically analyze the SQL syntax and dbt `config()` blocks.
2. **Focus on Bytes Billed**: In BigQuery, cost is driven by data scanned, not compute time. Focus entirely on reducing data scanned.

## Execution Steps

1. Read the provided SQL or dbt model file.
2. Look for the target table's schema (if available in the repo) to identify partitioned columns.
3. Evaluate the `WHERE` clauses. Are partition keys used? If not, flag a full table scan.
4. Evaluate the `SELECT` clauses. Are there unnecessary columns?
5. For dbt models, check the `config` block. Is this a table, view, or incremental model? If it's a massive daily table rebuild, recommend an incremental strategy.
6. Provide a concise report:
   - **Risk Level**: (Low, Medium, High)
   - **Cost Drivers**: (The specific lines or patterns driving cost)
   - **Recommendations**: (Specific SQL or config changes to implement)
