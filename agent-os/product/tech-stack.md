# Tech Stack

## Overview

This document defines the technical stack for the GitHub Notifications Listener project — a multi-platform TypeScript monorepo delivering GitHub notification management across Raycast, VS Code, and Zed.

---

## Monorepo & Build

| Category                 | Choice          | Notes                                                    |
| ------------------------ | --------------- | -------------------------------------------------------- |
| **Package Manager**      | pnpm            | Fastest, strict dependencies, excellent monorepo support |
| **Workspace Management** | pnpm workspaces | Using `workspace:*` protocol for local packages          |
| **Build Orchestration**  | Turborepo       | Handles build order, caching, parallel execution         |
| **Package Bundler**      | tsup            | Fast TypeScript bundler for shared packages              |

### Package Structure

```
packages/
├── core/              # @github-notifications/core
├── observability/     # @github-notifications/observability
├── storage/           # @github-notifications/storage
├── raycast/           # @github-notifications/raycast
├── vscode/            # @github-notifications/vscode (future)
└── zed/               # @github-notifications/zed (future)
```

---

## Language & Runtime

| Category          | Choice     | Notes               |
| ----------------- | ---------- | ------------------- |
| **Language**      | TypeScript | Strict mode enabled |
| **Runtime**       | Node.js    | LTS version (v20+)  |
| **Module System** | ESM        | Native ES modules   |

---

## Linting & Formatting

| Category               | Choice               | Notes                                          |
| ---------------------- | -------------------- | ---------------------------------------------- |
| **Linter & Formatter** | Biome                | Fast, unified tool replacing ESLint + Prettier |
| **Config Location**    | `biome.json` at root | Shared across all packages                     |

---

## Testing

| Category           | Choice                 | Notes                                                |
| ------------------ | ---------------------- | ---------------------------------------------------- |
| **Test Framework** | Vitest                 | Fast, native TypeScript support, Jest-compatible API |
| **Test Location**  | Co-located with source | `*.test.ts` files next to implementation             |

---

## APIs & Data

| Category           | Choice                       | Notes                                      |
| ------------------ | ---------------------------- | ------------------------------------------ |
| **Primary API**    | GitHub REST API              | Notifications, comments, PR data           |
| **API Client**     | Octokit (or custom fetch)    | Type-safe GitHub API access                |
| **Authentication** | GitHub Personal Access Token | Stored in platform-specific secure storage |
| **Data Format**    | JSON                         | Standard for all API responses             |

### Required GitHub Token Scopes

- `notifications` — Read/write notifications
- `repo` — Access repository data and PR comments
- `read:org` — Access organization info (if needed)

---

## Storage

| Category        | Choice                           | Notes                                 |
| --------------- | -------------------------------- | ------------------------------------- |
| **Abstraction** | `@github-notifications/storage`  | Platform-agnostic storage interface   |
| **Raycast**     | Raycast LocalStorage API         | Key-value storage for extension state |
| **VS Code**     | VS Code ExtensionContext storage | Workspace and global state            |
| **Zed**         | TBD                              | Based on Zed extension capabilities   |

### Persisted Data

- `lastSeenUpdatedAt` — Timestamp for incremental fetches
- `notifiedNotificationIds` — Deduplication for native notifications
- `snoozedNotificationIds` — Temporarily hidden notifications
- `markedDoneNotificationIds` — Completed notifications

---

## Client Platforms

### Raycast (Primary)

| Category          | Choice                      | Notes                                  |
| ----------------- | --------------------------- | -------------------------------------- |
| **Framework**     | Raycast Extension API       | React-based UI components              |
| **UI**            | Raycast built-in components | List, Detail, Form, Action             |
| **Notifications** | `showHUD`, `showToast`      | Native macOS notifications via Raycast |
| **Build**         | Raycast CLI                 | `ray build`, `ray develop`             |

### VS Code (Future)

| Category          | Choice                          | Notes                          |
| ----------------- | ------------------------------- | ------------------------------ |
| **Framework**     | VS Code Extension API           | WebView + TreeView             |
| **UI**            | VS Code native components       | TreeDataProvider, WebviewPanel |
| **Notifications** | `window.showInformationMessage` | VS Code notification system    |

### Zed (Future)

| Category      | Choice            | Notes                            |
| ------------- | ----------------- | -------------------------------- |
| **Framework** | Zed Extension API | TBD based on Zed extension model |

---

## Observability

### Privacy-First Approach

> **Important:** All observability is **local-only by default**. No telemetry data is ever sent to external servers. This project respects user privacy and follows open source best practices.

| Principle         | Implementation                                                           |
| ----------------- | ------------------------------------------------------------------------ |
| **Local-only**    | All traces, metrics, and logs stay on the user's machine                 |
| **No phone-home** | Zero external telemetry collection by default                            |
| **Opt-in only**   | If this project goes public, any usage analytics will be strictly opt-in |
| **Transparent**   | All observability code is open and auditable                             |

### Public Release Policy

If this project becomes a public open source release:

- **Telemetry will be opt-in only** — Disabled by default, users must explicitly enable
- **Anonymous data only** — No PII, no repo names, no GitHub usernames, no notification content
- **Documented collection** — Clear documentation of exactly what's collected (if anything)
- **User control** — Users can inspect, disable, or self-host any telemetry infrastructure

### Tech Stack

| Category              | Choice                   | Notes                                           |
| --------------------- | ------------------------ | ----------------------------------------------- |
| **Instrumentation**   | OpenTelemetry            | `@opentelemetry/sdk-node`, `@opentelemetry/api` |
| **Backend**           | ClickStack (self-hosted) | ClickHouse + HyperDX                            |
| **Signals**           | Traces, Metrics, Logs    | Full observability coverage                     |
| **Exporter Protocol** | OTLP (gRPC/HTTP)         | Standard OTel export to collector               |
| **Data Location**     | Local only               | Never leaves the user's machine                 |

### ClickStack Components

- **ClickHouse** — High-performance columnar database for telemetry storage
- **HyperDX** — UI for logs, traces, metrics, and session replay
- **OTel Collector** — Receives and processes telemetry data

### Local Development Setup

```bash
# Run ClickStack locally
git clone https://github.com/hyperdx/hyperdx.git
cd hyperdx
docker compose up -d
```

- **OTel Collector endpoint:** `http://localhost:4317` (gRPC) / `http://localhost:4318` (HTTP)
- **HyperDX UI:** `http://localhost:8080`

### What We Trace (Development Only)

For development and debugging purposes, we instrument:

- GitHub API call latency and errors
- Polling cycle duration and frequency
- Command execution timing
- Notification processing flow

**We explicitly avoid tracing:**

- GitHub usernames or user IDs
- Repository names or URLs
- Notification content or titles
- Any personally identifiable information

---

## Development Tools

| Category                 | Choice                 | Notes                             |
| ------------------------ | ---------------------- | --------------------------------- |
| **Version Control**      | Git                    | GitHub for hosting                |
| **Node Version Manager** | fnm or nvm             | Ensure consistent Node.js version |
| **Editor**               | VS Code / Zed / Cursor | TypeScript-aware editors          |

---

## CI/CD (Future)

| Category        | Choice                 | Notes                     |
| --------------- | ---------------------- | ------------------------- |
| **CI Platform** | GitHub Actions         | Native GitHub integration |
| **Checks**      | Type check, lint, test | Run on PRs                |
| **Caching**     | Turborepo remote cache | Speed up builds           |

---

## Dependencies Summary

### Core Dependencies

```json
{
  "@octokit/rest": "GitHub API client",
  "zod": "Runtime validation (if needed)"
}
```

### Observability Dependencies

```json
{
  "@opentelemetry/api": "OTel API",
  "@opentelemetry/sdk-node": "OTel Node.js SDK",
  "@opentelemetry/auto-instrumentations-node": "Auto instrumentation",
  "@opentelemetry/exporter-trace-otlp-http": "OTLP trace exporter",
  "@opentelemetry/exporter-metrics-otlp-http": "OTLP metrics exporter"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.x",
  "tsup": "Build tool",
  "turbo": "Monorepo orchestration",
  "vitest": "Testing",
  "@biomejs/biome": "Linting and formatting"
}
```

---

## Configuration Files

| File                        | Purpose                          |
| --------------------------- | -------------------------------- |
| `pnpm-workspace.yaml`       | Define workspace packages        |
| `turbo.json`                | Turborepo pipeline configuration |
| `tsconfig.base.json`        | Shared TypeScript config         |
| `biome.json`                | Linting and formatting rules     |
| `.nvmrc` or `.node-version` | Pin Node.js version              |
