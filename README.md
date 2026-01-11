# GitHub Notifications Listener

A multi-platform GitHub notifications management tool built as a TypeScript monorepo.

## Overview

This project provides a unified way to manage GitHub notifications across multiple platforms:

- **Raycast Extension** (primary) — Quick access to notifications from your launcher
- **VS Code Extension** (planned) — Notifications in your editor
- **Zed Extension** (planned) — Notifications in Zed

## Packages

| Package                               | Description                                              |
| ------------------------------------- | -------------------------------------------------------- |
| `@github-notifications/core`          | Business logic, GitHub API client, domain interfaces     |
| `@github-notifications/observability` | OpenTelemetry instrumentation, tracing helpers           |
| `@github-notifications/storage`       | Storage adapters (abstract interfaces + implementations) |
| `@github-notifications/raycast`       | Raycast extension client                                 |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local observability)

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Run all packages in watch mode
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Format code
pnpm format
```

### Raycast Extension Development

```bash
cd packages/raycast

# Start Raycast development mode
pnpm dev
```

## Local Observability (ClickStack)

This project includes a local observability stack for development:

- **ClickHouse** — Time-series database for traces, metrics, and logs
- **OpenTelemetry Collector** — Receives and exports telemetry data
- **HyperDX** — UI for exploring traces and logs

### Starting ClickStack

```bash
# Start all services
pnpm docker:up

# Stop all services
pnpm docker:down
```

### Ports

| Service               | Port | Description                |
| --------------------- | ---- | -------------------------- |
| OTel Collector (gRPC) | 4317 | OTLP gRPC endpoint         |
| OTel Collector (HTTP) | 4318 | OTLP HTTP endpoint         |
| HyperDX UI            | 8080 | Observability dashboard    |
| ClickHouse HTTP       | 8123 | ClickHouse HTTP interface  |
| ClickHouse Native     | 9000 | ClickHouse native protocol |

## Project Structure

```
github-notifications/
├── packages/
│   ├── core/           # Shared business logic
│   ├── observability/  # OTel instrumentation
│   ├── storage/        # Storage adapters
│   └── raycast/        # Raycast extension
├── docker/             # Local observability stack
├── .github/workflows/  # CI/CD pipelines
└── agent-os/           # Product documentation
```

## Documentation

- [Product Vision](./agent-os/product/vision.md)
- [Product Roadmap](./agent-os/product/roadmap.md)

## License

MIT
