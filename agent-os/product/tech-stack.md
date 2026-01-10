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

| Category              | Choice                       | Notes                                      |
| --------------------- | ---------------------------- | ------------------------------------------ |
| **Primary API**       | GitHub REST API              | Notifications, comments, PR data           |
| **API Client**        | Octokit (or custom fetch)    | Type-safe GitHub API access                |
| **Authentication**    | GitHub Personal Access Token | Stored in platform-specific secure storage |
| **Data Format**       | JSON                         | Standard for all API responses             |
| **Schema Validation** | ArkType                      | TypeScript-first runtime validation        |

### Required GitHub Token Scopes

- `notifications` — Read/write notifications
- `repo` — Access repository data and PR comments
- `read:org` — Access organization info (if needed)

### Schema Validation with ArkType

We use [ArkType](https://arktype.io/) for runtime schema validation. It provides TypeScript-like syntax with 20x faster performance than Zod.

```typescript
import { type } from "arktype";

// Define schema with TypeScript-like string syntax
const Notification = type({
  id: "string",
  reason: "'review_requested' | 'mention' | 'assign' | 'comment'",
  unread: "boolean",
  updatedAt: "string",
  subject: {
    type: "'PullRequest' | 'Issue' | 'Release'",
    title: "string",
    "url?": "string",
  },
  repository: {
    fullName: "string",
    private: "boolean",
  },
});

// Infer TypeScript type from schema
type Notification = typeof Notification.infer;

// Validate data at runtime
const result = Notification(apiResponse);
if (result instanceof type.errors) {
  // Validation failed — result contains error details
  console.error(result.summary);
} else {
  // Validation passed — result is typed as Notification
  renderNotification(result);
}
```

**Why ArkType over Zod/Valibot:**

- **Performance:** 20x faster than Zod, 2000x faster than Yup
- **Syntax:** Write constraintsj as strings (`"number >= 18"`, `"string < 100"`)
- **Bundle:** ~10 KB (smaller than Zod, larger than Valibot)
- **Learning:** New syntax to learn, but feels like TypeScript

---

## Error Handling

### Philosophy

| Concept        | Description                                                                              |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Failures**   | Legitimate domain errors that users can react to and recover from                        |
| **Exceptions** | Unexpected control flow errors, caught by error boundaries and reported to observability |

**Failures** (e.g., `NOT_FOUND`, `AUTH`, `RATE_LIMIT`) are expected outcomes represented as `Result<T, E>` values. The caller decides how to handle them — retry, show a message, fallback, etc.

**Exceptions** (e.g., null pointer, out of memory, invariant violations) are bugs. They should never happen in normal operation. These are caught at error boundaries and reported to ClickStack or Sentry (TBD). Exceptions use the standard JavaScript `Error` class — no custom exception types needed.

### Result Pattern

We use a lightweight `Result<T, E>` pattern in `@github-notifications/core/result.ts`:

```typescript
// Result type
export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = Failure> = Ok<T> | Err<E>;

// Constructors
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

// Usage: Handling failures (expected domain errors)
const result = await fetchNotifications();
if (result.ok) {
  renderNotifications(result.value); // Notification[]
} else {
  showErrorToast(result.error); // AppError → user-friendly toast
}
```

```typescript
// Usage: Handling exceptions (unexpected bugs)
// Exceptions bubble up to error boundaries — don't catch them in business logic

// ❌ Don't do this — swallows the exception
async function inboxCommand() {
  try {
    await doSomething();
  } catch (e) {
    showErrorToast({ message: "Something went wrong" }); // Hides the bug!
  }
}

// ✅ Do this — let exceptions bubble to the error boundary
async function inboxCommand() {
  const result = await fetchNotifications(); // May throw on unexpected errors
  if (result.ok) {
    renderNotifications(result.value);
  } else {
    showErrorToast(result.error); // Handle expected failures
  }
  // Exceptions bubble up automatically — no try/catch needed here
}

// Error boundary (at app/command root level)
function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      reportException(e.error, { context: "uncaught" }); // → ClickStack / Sentry
      setError(e.error);
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  if (error) return <GenericErrorScreen />;
  return children;
}
```

### Failure Codes

| Code         | HTTP | Description                                    |
| ------------ | ---- | ---------------------------------------------- |
| `AUTH`       | 401  | Invalid or missing authentication token        |
| `FORBIDDEN`  | 403  | Valid token but insufficient permissions       |
| `NOT_FOUND`  | 404  | Resource doesn't exist                         |
| `CONFLICT`   | 409  | Resource state conflict (e.g., already exists) |
| `INVALID`    | 422  | Validation error, malformed request            |
| `RATE_LIMIT` | 429  | GitHub API rate limit exceeded                 |
| `TIMEOUT`    | 408  | Request timed out                              |
| `NETWORK`    | 503  | Network connectivity issues                    |
| `UPSTREAM`   | 502  | GitHub API returned unexpected error           |
| `CANCELLED`  | 499  | Operation cancelled by user                    |

```typescript
export type FailureCode =
  | "AUTH"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "NETWORK"
  | "UPSTREAM"
  | "CANCELLED";
```

### Failure Structure

```typescript
export type Failure = {
  code: FailureCode;
  message: string; // User-friendly message
  meta?: Record<string, string>; // Optional context (e.g., { url, requestId, repo })
  cause?: unknown; // Original error (internal only, not serialized)
};
```

### HTTP Mapping (Optional)

For future use if we add local API servers:

```typescript
export const FAILURE_HTTP_STATUS: Record<FailureCode, number> = {
  AUTH: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID: 422,
  RATE_LIMIT: 429,
  TIMEOUT: 408,
  NETWORK: 503,
  UPSTREAM: 502,
  CANCELLED: 499,
};
```

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
  "arktype": "Runtime schema validation"
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
