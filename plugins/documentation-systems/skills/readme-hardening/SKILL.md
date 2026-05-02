---
name: readme-hardening
description: "Ensure the project README provides immediate, exact commands for setup, testing, and deployment to help agents and humans bootstrap quickly."
---

# README Hardening

A good README is an executable contract, not a marketing page. It must allow an agent or a new engineer to clone the repository and run tests within 3 minutes.

## Hardening Protocol

1. **Verify Commands**: Extract every shell command (`npm install`, `docker-compose up`, `cargo test`) from the README and run them in a clean environment. If they fail, fix the README.
2. **Remove Ambiguity**: Replace "Install dependencies" with `npm ci`. Replace "Run the app" with `npm run start:dev`.
3. **Environment Checklist**: Clearly list required environment variables in a `.env.example` block. Do not just say "set up your environment."
4. **Architecture Pointers**: Provide exact file paths for entry points (e.g., "Main API routing is in `src/routes.ts`") to save agents from searching the entire tree.