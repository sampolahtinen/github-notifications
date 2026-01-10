# Spec Requirements: Monorepo Setup

## Initial Description

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

## Requirements Discussion

### First Round Questions

**Q1:** I assume we'll create all 6 packages upfront (core, observability, storage, raycast, vscode, zed), even if vscode/zed are just empty scaffolds for now. Is that correct, or should we only create packages we'll immediately use (core, observability, storage, raycast)?

**Answer:** Only create packages we'll immediately use (core, observability, storage, raycast).

**Q2:** For the Raycast package specifically — Raycast extensions have their own project structure and build system (`ray build`). I'm assuming we'll need to integrate pnpm workspace with Raycast's tooling. Should the Raycast package be a standard Raycast extension that imports from workspace packages, or do you have a different integration approach in mind?

**Answer:** Use Raycast standard project structure and build system.

**Q3:** I assume the root `package.json` should have scripts like `build`, `test`, `lint`, `typecheck` that run across all packages via Turborepo. Should we also include a `dev` script, and if so, what should it do (e.g., watch mode for packages, or start Raycast dev server)?

**Answer:** Yes, this approach is correct.

**Q4:** For TypeScript configuration, I'm planning: `tsconfig.base.json` at root with shared strict settings, each package extends base and adds its own paths/references, use project references for fast incremental builds. Is this approach correct, or do you have preferences?

**Answer:** Yes, this approach is correct.

**Q5:** Should we set up CI/CD (GitHub Actions) as part of this spec, or defer that to a separate spec later?

**Answer:** Yes, include CI/CD (GitHub Actions) as part of this spec.

**Q6:** For the observability package — should it include the ClickStack Docker Compose setup in this repo (e.g., in a `docker/` folder), or keep that external/documented only?

**Answer:** Include ClickStack Docker Compose setup in this repo.

**Q7:** Is there anything that should be explicitly out of scope for this monorepo setup? (e.g., actual feature code, GitHub API client implementation, etc.)

**Answer:** No code implementations — only project structure and tooling.

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

None required — answers were clear and comprehensive.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

Not applicable for infrastructure/tooling spec.

## Requirements Summary

### Functional Requirements

- Initialize pnpm workspace with `pnpm-workspace.yaml`
- Create 4 packages: `core`, `observability`, `storage`, `raycast`
- Configure Turborepo for build orchestration (`turbo.json`)
- Set up tsup as package bundler for shared packages
- Configure TypeScript with strict mode and ESM
- Set up Biome for linting and formatting
- Configure Vitest for testing
- Raycast package uses standard Raycast extension structure
- Include root scripts: `build`, `test`, `lint`, `typecheck`, `dev`
- Set up GitHub Actions CI/CD pipeline
- Include ClickStack Docker Compose setup for local observability

### Packages to Create

| Package | Purpose | Build Tool |
|---------|---------|------------|
| `@github-notifications/core` | Business logic, interfaces | tsup |
| `@github-notifications/observability` | OTel instrumentation | tsup |
| `@github-notifications/storage` | Storage adapters | tsup |
| `@github-notifications/raycast` | Raycast extension | Raycast CLI |

### Configuration Files to Create

- `pnpm-workspace.yaml` — Workspace package definitions
- `turbo.json` — Turborepo pipeline configuration
- `tsconfig.base.json` — Shared TypeScript configuration
- `biome.json` — Linting and formatting rules
- `.nvmrc` or `.node-version` — Pin Node.js version
- `.github/workflows/ci.yml` — GitHub Actions CI pipeline
- `docker/docker-compose.yml` — ClickStack local setup

### Reusability Opportunities

- TypeScript configuration can be extended by all packages
- Biome configuration shared across all packages
- Turborepo caching will speed up builds across packages
- ClickStack setup reusable for all future observability needs

### Scope Boundaries

**In Scope:**
- Project structure and folder organization
- pnpm workspace configuration
- Turborepo build orchestration setup
- TypeScript configuration (base + per-package)
- Biome linting/formatting configuration
- Vitest testing configuration
- Raycast extension scaffold (standard structure, no features)
- GitHub Actions CI/CD pipeline
- ClickStack Docker Compose setup
- README documentation for setup/usage

**Out of Scope:**
- Actual feature implementations
- GitHub API client code
- Business logic in core package
- OTel instrumentation code in observability package
- Storage adapter implementations
- Raycast UI components or commands
- VS Code extension scaffold (deferred)
- Zed extension scaffold (deferred)

### Technical Considerations

- Raycast extensions have specific build requirements — workspace packages must be compatible
- ESM modules require careful configuration for Node.js compatibility
- TypeScript project references enable incremental builds
- Turborepo remote caching can be configured later for CI speed
- ClickStack requires Docker to be running locally
