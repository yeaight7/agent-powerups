---
name: api-doc-review
description: "Verify that API endpoints match their OpenAPI/Swagger specifications."
---

# API Doc Review

Outdated API documentation causes integration failures. The code is the source of truth, and the docs must match.

## Review Protocol

1. Compare the route definition (e.g., `POST /users`) with the documented endpoint.
2. Verify that all required request parameters (body, query, params) are documented with correct types.
3. Verify that all possible response status codes (200, 400, 404, 500) and their payloads match the actual error handlers and return statements.
4. If there is a mismatch, update the OpenAPI spec or inline documentation immediately. Do not defer it.