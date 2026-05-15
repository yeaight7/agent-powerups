---
name: local-rag-mcp
description: Use when querying, ingesting, or maintaining a local RAG MCP corpus for semantic document retrieval with privacy controls.
---

# Local RAG MCP

## When to use
Use when the task requires semantic search over a local document corpus and an appropriate local RAG MCP server is available. Prefer standard grep/glob for simple pattern matching — RAG adds value for conceptual queries and cross-document synthesis.

## Requirements / Checks
- Verify a local RAG MCP server is configured (`apx mcp list` or check MCP settings).
- Do NOT attempt to install or spin up Docker containers for vector databases without explicit user permission.
- Confirm whether the embedding provider is local or remote — if remote (e.g., OpenAI), warn the user before ingesting sensitive content.

## Workflow

1. **Identify need** — determine whether the query requires semantic retrieval (conceptual, cross-document) vs. standard grep/glob (exact pattern, single file).

2. **Check configuration** — verify the connection to the local RAG MCP server. If it fails, surface the error rather than falling back silently.

3. **Inventory corpus** — use status or list tools to see what's already indexed before ingesting anything.

4. **Ingest (only if necessary)** — ingest only files explicitly approved for this corpus. Include clear source metadata (file path, ingest timestamp). Exclude: `.env` files, credential files, SSH keys, and files outside the workspace.

5. **Query strategy**:
   - Start with the user's exact terms; do not paraphrase into broader concepts.
   - Add one specific disambiguating detail if initial results are too broad.
   - Keep result limits small first (top 5); expand only if results are insufficient.

6. **Expand around hits** — if a top result lacks surrounding context, fetch neighboring chunks before drawing conclusions.

7. **Synthesize with citations** — in your response, distinguish between retrieved evidence (cite source and chunk) and your own inference.

8. **Clean up** — delete stale or incorrectly ingested sources when requested; do not accumulate unrelated documents.

## Tool Interface (illustrative — actual names depend on your server)

The local RAG server typically exposes tools along these lines:

- **query**: keyword + semantic search with a score/rank and result limit.
- **ingest_file**: absolute-path document ingestion.
- **ingest_data**: string/HTML/Markdown ingestion with source and format metadata.
- **delete_source**: remove an ingested file or source by ID.
- **list_sources** / **status**: corpus inventory and database health.
- **get_neighbors**: expand context around a specific chunk.

Exact tool names and schemas vary by implementation. Read your server's tool list before assuming names.

## Safety Constraints
- Do NOT ingest sensitive personal data, secrets, or `.env` files into the local RAG store.
- Warn the user before ingesting content if the embedding model sends data to a remote API.
- Do not ingest whole repositories by default — start with approved docs or scoped folders.
- Do not treat a semantic match as ground truth without reading the source chunk in context.

## Validation / Done Criteria
- Relevant context was retrieved and cited.
- Ingestion explicitly excluded sensitive paths.
- Query result synthesis distinguishes retrieved evidence from inference.

## References
- `references/rag-tool-model.md`
