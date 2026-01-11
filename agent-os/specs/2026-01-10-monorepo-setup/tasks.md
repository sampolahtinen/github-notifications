# Tasks: Monorepo Setup

## Overview

Initialize a TypeScript monorepo with pnpm workspaces, Turborepo, and shared tooling for the GitHub Notifications Listener project.

---

## Task Groups

### Group 1: Root Configuration

Foundation files that all packages depend on.

- [ ] **1.1** Create `pnpm-workspace.yaml` defining `packages/*` as workspace root
- [ ] **1.2** Create root `package.json` with workspace scripts (`build`, `test`, `lint`, `typecheck`, `dev`), `packageManager` field pinning pnpm version, and `workspace:*` protocol setup
- [ ] **1.3** Create `turbo.json` with pipeline definitions for `build`, `test`, `lint`, `typecheck`, task dependencies (`^build`), local caching, and `dev` with `persistent: true`
- [ ] **1.4** Create `tsconfig.base.json` with strict mode, ESM, ES2022 target, and `moduleResolution: "bundler"`
- [ ] **1.5** Create `biome.json` with recommended rules, import sorting, and formatting preferences
- [ ] **1.6** Create `vitest.config.ts` with workspace support and `**/*.test.ts` pattern
- [ ] **1.7** Create `.nvmrc` or `.node-version` to pin Node.js version

### Group 2: Shared Packages

Create the three shared library packages with placeholder exports.

- [ ] **2.1** Create `packages/core/package.json` with tsup build config and workspace dependencies
- [ ] **2.2** Create `packages/core/tsconfig.json` extending base config
- [ ] **2.3** Create `packages/core/tsup.config.ts` for ESM + CJS dual output
- [ ] **2.4** Create `packages/core/src/index.ts` with placeholder export
- [ ] **2.5** Create `packages/observability/package.json` with tsup build config
- [ ] **2.6** Create `packages/observability/tsconfig.json` extending base config
- [ ] **2.7** Create `packages/observability/tsup.config.ts` for ESM + CJS dual output
- [ ] **2.8** Create `packages/observability/src/index.ts` with placeholder export
- [ ] **2.9** Create `packages/storage/package.json` with tsup build config
- [ ] **2.10** Create `packages/storage/tsconfig.json` extending base config
- [ ] **2.11** Create `packages/storage/tsup.config.ts` for ESM + CJS dual output
- [ ] **2.12** Create `packages/storage/src/index.ts` with placeholder export

### Group 3: Raycast Extension Package

Set up the Raycast extension with standard structure importing from workspace packages.

- [ ] **3.1** Scaffold Raycast extension in `packages/raycast` using Raycast CLI or manual structure
- [ ] **3.2** Configure `packages/raycast/package.json` with workspace dependencies (`@github-notifications/core`, `observability`, `storage`)
- [ ] **3.3** Create `packages/raycast/tsconfig.json` extending base config with Raycast-specific settings
- [ ] **3.4** Verify Raycast build (`ray build`) works with workspace imports

### Group 4: CI/CD Pipeline

GitHub Actions workflow for automated quality checks.

- [ ] **4.1** Create `.github/workflows/ci.yml` with trigger on push to main and pull requests
- [ ] **4.2** Configure jobs: install dependencies (with pnpm caching), typecheck, lint, test, build
- [ ] **4.3** Use Turborepo commands for parallelization in CI

### Group 5: Local Observability Infrastructure

Docker Compose setup for ClickStack development environment.

- [ ] **5.1** Create `docker/docker-compose.yml` with ClickHouse, HyperDX, and OTel Collector services
- [ ] **5.2** Configure ports: OTel (4317/4318), HyperDX UI (8080)
- [ ] **5.3** Add `docker:up` and `docker:down` scripts to root `package.json`

### Group 6: Documentation

Project documentation for developers.

- [ ] **6.1** Create root `README.md` with project overview, setup instructions, and package descriptions
- [ ] **6.2** Document development environment setup
- [ ] **6.3** Document ClickStack observability setup
- [ ] **6.4** Include links to product documentation in `agent-os/product/`

---

## Verification

- [ ] Run `pnpm install` successfully
- [ ] Run `pnpm build` and verify all packages build
- [ ] Run `pnpm lint` and verify no errors
- [ ] Run `pnpm typecheck` and verify no errors
- [ ] Run `pnpm test` and verify test runner works
- [ ] Run `ray build` in `packages/raycast` and verify extension builds
- [ ] Run `docker compose up` in `docker/` and verify ClickStack starts
