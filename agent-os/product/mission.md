# Product Mission

## Pitch

**GitHub Notifications Listener** is a multi-platform developer extension that helps developers stay on top of GitHub pull request reviews and mentions by providing an actionable inbox with native notifications, inline replies, and code context—all without leaving their workflow.

## Architecture Vision

### Monorepo Structure

The project is organized as a TypeScript monorepo with shared packages:

- **@github-notifications/core** — Business logic, GitHub API client, domain interfaces
- **@github-notifications/observability** — OpenTelemetry instrumentation, tracing helpers
- **@github-notifications/storage** — Storage adapters (abstract interfaces + implementations)
- **@github-notifications/raycast** — Raycast extension client
- **@github-notifications/vscode** — VS Code extension client (future)
- **@github-notifications/zed** — Zed extension client (future)

### Multi-Client Architecture

All clients implement shared interfaces from `core`, enabling:

- Consistent command experience across Raycast, VS Code, and Zed
- Shared business logic with platform-specific UI adapters
- Single codebase for features, multiple deployment targets

### Observability

Built-in observability using OpenTelemetry and ClickStack:

- Distributed tracing for API calls and command execution
- Metrics for polling performance and notification latency
- Local self-hosted observability stack for learning and debugging

## Users

### Primary Customers

- **Active Code Reviewers:** Developers who regularly review PRs and need timely reminders to prevent forgotten follow-ups
- **Open Source Contributors:** Developers participating in multiple repositories who need a unified, distraction-free notification system
- **Privacy-Conscious Developers:** Engineers who prefer fully local tools without external service dependencies

### User Personas

**Alex the Senior Developer** (28-45)

- **Role:** Senior Software Engineer / Tech Lead
- **Context:** Works on a team with 5-15 developers, reviews multiple PRs daily across several repositories
- **Pain Points:** Misses review requests buried in email, forgets to follow up on PR conversations, context-switches constantly to check GitHub
- **Goals:** Never miss a review request, respond to comments quickly, maintain flow state while staying responsive

**Sam the Open Source Maintainer** (25-40)

- **Role:** OSS Maintainer / Individual Contributor
- **Context:** Maintains 2-5 open source projects while working a full-time job
- **Pain Points:** GitHub notifications are overwhelming, loses track of important mentions across repos, email notifications are noisy
- **Goals:** Triage notifications efficiently, respond to contributors promptly, separate signal from noise

## The Problem

### Forgotten Follow-ups Kill Collaboration

Developers miss critical PR reviews and comment threads because GitHub's notification system buries important items in email or a cluttered web inbox. This leads to stalled PRs, delayed releases, and frustrated teammates. Studies show the average PR waits 24+ hours for initial review, with follow-up comments often waiting days.

**Our Solution:** Surface only actionable, participating notifications directly in your development environment with native OS alerts, enabling immediate response without context-switching.

## Differentiators

### Workflow-Native Experience

Unlike GitHub's web notifications or email digests, we bring notifications directly into your command palette (⌘+⇧+P) across Raycast, VS Code, and Zed. This results in faster response times and unbroken focus.

### Reply Without Leaving Your Flow

Unlike browser-based notification tools, you can read code context and reply to comments directly from the extension. This results in 10x faster response cycles without opening a browser tab.

### Privacy-First & Fully Local

Unlike third-party notification services, all data stays on your machine with no external servers or tracking. This results in complete privacy and zero security concerns for enterprise developers.

### Multi-Platform, One Experience

Unlike single-editor solutions, our interface-based architecture delivers the same commands across Raycast, VS Code, and Zed. This results in a consistent experience regardless of your current tool.

## Key Features

### Core Features

- **Unified Inbox:** View all actionable GitHub notifications in one place, filtered to what matters (reviews, mentions, assignments)
- **Native Notifications:** Receive timely macOS alerts for new items without constantly checking GitHub
- **Quick Actions:** Open in browser, mark as done, or snooze notifications with a single keystroke

### Collaboration Features

- **Inline Replies:** Respond to PR comments and issue threads directly from the command palette
- **Code Context:** See diff hunks and file snippets alongside review comments for immediate understanding

### Advanced Features

- **Smart Polling:** Configurable background sync (60-120s) that respects API rate limits
- **State Persistence:** Remember what you've seen, snoozed, or marked done across sessions
- **Multi-Client Architecture:** Same core commands accessible from Raycast, VS Code, and Zed via shared interfaces

### Observability Features

- **Distributed Tracing:** Track request flow through GitHub API calls and internal processing
- **Performance Metrics:** Monitor polling latency, API response times, and notification delivery
- **Self-Hosted Stack:** ClickStack (ClickHouse + HyperDX) for local observability without external dependencies
