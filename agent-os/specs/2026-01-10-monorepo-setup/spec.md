# Specification: Monorepo Setup

## Goal

Initialize a TypeScript monorepo with pnpm workspaces, Turborepo, and shared tooling to enable multi-platform development for the GitHub Notifications Listener project.

## User Stories

- As a developer, I want a consistent project structure so that I can easily navigate and contribute to any package
- As a developer, I want shared build/lint/test commands so that I can run quality checks across all packages with a single command
- As a developer, I want local observability infrastructure so that I can debug and learn observability patterns during development

## Specific Requirements

**pnpm Workspace Configuration**
- Create `pnpm-workspace.yaml` defining `packages/*` as workspace root
- Root `package.json` with workspace scripts: `build`, `test`, `lint`, `typecheck`, `dev`
- Use `workspace:*` protocol for internal package dependencies
- Pin pnpm version in `packageManager` field

**Turborepo Build Orchestration**
- Create `turbo.json` with pipeline definitions for `build`, `test`, `lint`, `typecheck`
- Configure task dependencies: `build` depends on `^build` (dependencies first)
- Enable local caching for faster rebuilds
- Configure `dev` task with `persistent: true` for watch mode

**TypeScript Configuration**
- Create `tsconfig.base.json` with strict mode, ESM, and modern target (ES2022)
- Enable `moduleResolution: "bundler"` for compatibility with tsup
- Each package extends base config with own `include`/`outDir` settings
- Use project references for incremental type checking

**Biome Linting & Formatting**
- Create root `biome.json` with recommended rules
- Configure import sorting and formatting preferences
- All packages inherit root configuration
- Add `lint` and `format` scripts to root

**Vitest Testing Configuration**
- Create root `vitest.config.ts` with workspace support
- Configure test file patterns: `**/*.test.ts`
- Enable TypeScript path resolution in tests
- Each package can extend or override as needed

**Package: @github-notifications/core**
- Location: `packages/core`
- Build: tsup (ESM + CJS dual output)
- Contains: Empty `src/index.ts` exporting placeholder
- Purpose: Future home for business logic and interfaces

**Package: @github-notifications/observability**
- Location: `packages/observability`
- Build: tsup (ESM + CJS dual output)
- Contains: Empty `src/index.ts` exporting placeholder
- Purpose: Future home for OTel instrumentation helpers

**Package: @github-notifications/storage**
- Location: `packages/storage`
- Build: tsup (ESM + CJS dual output)
- Contains: Empty `src/index.ts` exporting placeholder
- Purpose: Future home for storage adapters

**Package: @github-notifications/raycast**
- Location: `packages/raycast`
- Build: Raycast CLI (`ray build`)
- Structure: Standard Raycast extension scaffold
- Dependencies: Imports from `@github-notifications/core`, `observability`, `storage` via workspace protocol

**GitHub Actions CI Pipeline**
- Create `.github/workflows/ci.yml`
- Trigger on: push to main, pull requests
- Jobs: install dependencies, typecheck, lint, test, build
- Use pnpm caching for faster CI runs
- Run Turborepo commands for parallelization

**ClickStack Docker Compose**
- Create `docker/docker-compose.yml` for local ClickStack
- Include: ClickHouse, HyperDX, OTel Collector
- Document ports: OTel (4317/4318), HyperDX UI (8080)
- Add `docker:up` and `docker:down` scripts to root package.json

**Documentation**
- Create root `README.md` with project overview, setup instructions, and package descriptions
- Document how to run development environment
- Document how to start ClickStack for observability
- Include links to product documentation in `agent-os/product/`

## Visual Design

Not applicable for infrastructure/tooling spec.

## Existing Code to Leverage

No existing code — this is a greenfield project setup.

## Out of Scope

- GitHub API client implementation in core package
- OpenTelemetry instrumentation code in observability package
- Storage adapter implementations in storage package
- Raycast UI components, commands, or features
- VS Code extension scaffold
- Zed extension scaffold
- Turborepo remote caching configuration
- Production deployment configuration
- Any business logic or feature code
