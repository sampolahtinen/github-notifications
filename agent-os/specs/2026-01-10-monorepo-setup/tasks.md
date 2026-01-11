# Tasks: Monorepo Setup

## Overview

Initialize a TypeScript monorepo with pnpm workspaces, Turborepo, and shared tooling for the GitHub Notifications Listener project.

---

## Task Groups

### Group 1: Root Configuration

Foundation files that all packages depend on.

- [x] **1.1** Create `pnpm-workspace.yaml` defining `packages/*` as workspace root
- [x] **1.2** Create root `package.json` with workspace scripts (`build`, `test`, `lint`, `typecheck`, `dev`), `packageManager` field pinning pnpm version, and `workspace:*` protocol setup
- [x] **1.3** Create `turbo.json` with pipeline definitions for `build`, `test`, `lint`, `typecheck`, task dependencies (`^build`), local caching, and `dev` with `persistent: true`
- [x] **1.4** Create `tsconfig.base.json` with strict mode, ESM, ES2022 target, and `moduleResolution: "bundler"`
- [x] **1.5** Create `biome.json` with recommended rules, import sorting, and formatting preferences
- [x] **1.6** Create `vitest.config.ts` with workspace support and `**/*.test.ts` pattern
- [x] **1.7** Create `.nvmrc` or `.node-version` to pin Node.js version

### Group 2: Shared Packages

Create the three shared library packages with placeholder exports.

- [x] **2.1** Create `packages/core/package.json` with tsup build config and workspace dependencies
- [x] **2.2** Create `packages/core/tsconfig.json` extending base config
- [x] **2.3** Create `packages/core/tsup.config.ts` for ESM + CJS dual output
- [x] **2.4** Create `packages/core/src/index.ts` with placeholder export
- [x] **2.5** Create `packages/observability/package.json` with tsup build config
- [x] **2.6** Create `packages/observability/tsconfig.json` extending base config
- [x] **2.7** Create `packages/observability/tsup.config.ts` for ESM + CJS dual output
- [x] **2.8** Create `packages/observability/src/index.ts` with placeholder export
- [x] **2.9** Create `packages/storage/package.json` with tsup build config
- [x] **2.10** Create `packages/storage/tsconfig.json` extending base config
- [x] **2.11** Create `packages/storage/tsup.config.ts` for ESM + CJS dual output
- [x] **2.12** Create `packages/storage/src/index.ts` with placeholder export

### Group 3: Raycast Extension Package

Set up the Raycast extension with standard structure importing from workspace packages.

- [x] **3.1** Scaffold Raycast extension in `packages/raycast` using Raycast CLI or manual structure
- [x] **3.2** Configure `packages/raycast/package.json` with workspace dependencies (`@github-notifications/core`, `observability`, `storage`)
- [x] **3.3** Create `packages/raycast/tsconfig.json` extending base config with Raycast-specific settings
- [x] **3.4** Verify Raycast build (`ray build`) works with workspace imports

### Group 4: CI/CD Pipeline

GitHub Actions workflow for automated quality checks.

- [x] **4.1** Create `.github/workflows/ci.yml` with trigger on push to main and pull requests
- [x] **4.2** Configure jobs: install dependencies (with pnpm caching), typecheck, lint, test, build
- [x] **4.3** Use Turborepo commands for parallelization in CI

### Group 5: Local Observability Infrastructure

Docker Compose setup for ClickStack development environment.

- [x] **5.1** Create `docker/docker-compose.yml` with ClickHouse, HyperDX, and OTel Collector services
- [x] **5.2** Configure ports: OTel (4317/4318), HyperDX UI (8080)
- [x] **5.3** Add `docker:up` and `docker:down` scripts to root `package.json`

### Group 6: Documentation

Project documentation for developers.

- [x] **6.1** Create root `README.md` with project overview, setup instructions, and package descriptions
- [x] **6.2** Document development environment setup
- [x] **6.3** Document ClickStack observability setup
- [x] **6.4** Include links to product documentation in `agent-os/product/`

---

## Verification

- [x] Run `pnpm install` successfully
- [x] Run `pnpm build` and verify all packages build
- [x] Run `pnpm lint` and verify no errors
- [x] Run `pnpm typecheck` and verify no errors
- [x] Run `pnpm test` and verify test runner works
- [x] Run `ray build` in `packages/raycast` and verify extension builds
- [ ] Run `docker compose up` in `docker/` and verify ClickStack starts
