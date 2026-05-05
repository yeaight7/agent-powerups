---
name: local-rag-mcp
description: Use when querying, ingesting, or maintaining a local RAG MCP corpus for semantic document retrieval with privacy controls.
---

# Local RAG MCP

## When to use
Use when the task requires semantic search, document ingestion, or querying a local vector database for context retrieval, and an appropriate MCP server is available.

## Requirements / Checks
- Verify if a local RAG MCP server is configured in the environment (e.g., via `apx mcp list`).
- Do NOT attempt to install or spin up Docker containers for vector databases without explicit user permission.

## Workflow
1. **Identify Need**: Determine if a query requires semantic retrieval vs. standard grep/glob.
2. **Check Configuration**: Verify the connection to the MCP RAG server.
3. **Inventory Corpus**: Use status/list tools if available before ingesting anything.
4. **Ingest (if necessary)**: Use file ingestion for approved files and string ingestion for approved fetched/web/clipboard content with clear source metadata.
5. **Query**: Preserve exact user terms, add disambiguating context, and keep result limits small first.
6. **Expand**: If a hit lacks surrounding context, fetch neighboring chunks before drawing conclusions.
7. **Clean Up**: Delete stale or incorrectly ingested sources when requested.
8. **Synthesize**: Incorporate retrieved context with citations to source/file and chunk.

## Tool Model To Preserve
- `query_documents`: keyword + semantic query; lower score means stronger match.
- `ingest_file`: absolute-path document ingestion.
- `ingest_data`: string/HTML/Markdown ingestion with source + format metadata.
- `delete_file`: remove ingested file/source.
- `list_files` and `status`: corpus inventory and DB health.
- `read_chunk_neighbors`: expand around a search hit.

## Safety Constraints
- Do NOT ingest sensitive personal data, secrets, or `.env` files into the local RAG store.
- Warn the user if the local RAG implementation relies on external API calls for embeddings (e.g., sending data to OpenAI).
- Do not ingest whole repos by default; start with approved docs or scoped folders.
- Do not rely on semantic hits without reading neighbors/source when precision matters.

## Validation / Done Criteria
- Relevant context is successfully retrieved.
- Ingestion explicitly excludes sensitive paths.
- Query result synthesis distinguishes retrieved evidence from inference.

## References
- `references/rag-tool-model.md`
