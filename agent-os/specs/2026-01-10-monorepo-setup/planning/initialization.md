# Spec Initialization: Monorepo Setup

## Date
2026-01-10

## Raw Feature Idea

Initialize the GitHub Notifications Listener project as a TypeScript monorepo with the following structure and tooling:

**Package Structure:**
- `@github-notifications/core` — Business logic, GitHub API client, domain interfaces
- `@github-notifications/observability` — OpenTelemetry instrumentation, tracing helpers
- `@github-notifications/storage` — Storage adapters (abstract interfaces + implementations)
- `@github-notifications/raycast` — Raycast extension client (primary)
- `@github-notifications/vscode` — VS Code extension client (future)
- `@github-notifications/zed` — Zed extension client (future)

**Tooling:**
- Package Manager: pnpm with workspaces
- Build Orchestration: Turborepo
- Package Bundler: tsup
- Language: TypeScript (strict mode, ESM)
- Linting/Formatting: Biome
- Testing: Vitest

**Goals:**
- Establish foundational project structure before any feature development
- Enable shared code between multiple client platforms (Raycast, VS Code, Zed)
- Set up consistent build, lint, and test workflows across all packages
- Configure workspace-level tooling that all packages inherit

## Source
User request during product planning session. This is foundational work required before the first roadmap item (GitHub Authentication) can be implemented.

## Status
Ready for requirements research
