# Tasks: Raycast MVP

## Overview

Build a complete Raycast extension MVP for GitHub notification management with viewing, triaging, and responding capabilities.

---

## Prerequisites

> **Note:** Before starting MVP implementation, ensure **basic repository filtering** is in place — a simple repository selector dropdown to filter notifications by repository.

---

## Task Groups

### Group 1: Core Infrastructure & Types

> **Package:** `@github-notifications/core`

Foundation types and services in `@github-notifications/core`.

- [ ] **1.1** Define `Notification` interface with all fields (id, unread, reason, updatedAt, subject, repository)
- [ ] **1.2** Define `NotificationReason` type union
- [ ] **1.3** Define `PersistedState` interface for caching, deduplication, and user actions
- [ ] **1.4** Define `GitHubAuthProvider` interface for token management
- [ ] **1.5** Define `StorageProvider` interface for persistence
- [ ] **1.6** Create `NotificationService` class with fetch, markAsDone, and snooze methods

### Group 2: GitHub API Integration

> **Package:** `@github-notifications/core`

GitHub API client for fetching and managing notifications.

- [ ] **2.1** Implement GitHub notifications fetch (`GET /notifications`)
- [ ] **2.2** Implement mark notification as done (`PATCH /notifications/threads/{id}`)
- [ ] **2.3** Implement token validation endpoint
- [ ] **2.4** Handle API rate limiting with appropriate headers
- [ ] **2.5** Transform GitHub API response to internal `Notification` type

### Group 3: Raycast Adapters

Raycast-specific implementations of core interfaces.

- [ ] **3.1** Implement `RaycastAuthProvider` using Raycast preferences for GitHub token
- [ ] **3.2** Implement `RaycastStorageAdapter` using Raycast LocalStorage

### Group 4: Inbox Command (Main View)

Primary list view showing all actionable notifications.

> **Error Handling Strategy:** Display error state with ⚠️ icon, "Failed to load notifications" message, "Check your internet connection" subtitle, and [Retry] + [Open Preferences] actions.

- [ ] **4.1** Create `inbox.tsx` command with Raycast `List` component
- [ ] **4.2** Implement list item rendering with icon (by reason), title, subtitle (repo), and timestamp accessory
- [ ] **4.3** Implement icon mapping for notification reasons (review_requested → Code, mention → AtSymbol, etc.)
- [ ] **4.4** Implement relative timestamp formatting (Just now, X min ago, X hours ago, etc.)
- [ ] **4.5** Implement empty state with celebration emoji and "You're all caught up!" message
- [ ] **4.6** Implement loading state with Raycast native indicator
- [ ] **4.7** Implement error state with retry and open preferences actions
- [ ] **4.8** Implement status bar subtitle showing listening state and notification count
- [ ] **4.9** Add search/filter by notification reason dropdown
- [ ] **4.10** Add repository filter dropdown (basic selector)

### Group 5: Notification Detail View

Expanded view when navigating into a notification.

- [ ] **5.1** Create detail view component using Raycast `Detail`
- [ ] **5.2** Display title, repository (with visibility indicator), reason, type, and timestamps
- [ ] **5.3** Format timestamps as relative + absolute
- [ ] **5.4** Add action buttons: Open in Browser, Mark as Done, Snooze, Copy URL

### Group 6: Action Panel

Actions available on notifications.

- [ ] **6.1** Implement "Open in Browser" action (Enter) — open notification URL
- [ ] **6.2** Implement "Mark as Done" action (⌘D) — mark as read, remove from inbox
- [ ] **6.3** Implement "Copy URL" action (⌘C) — copy GitHub URL to clipboard
- [ ] **6.4** Implement "View Details" action (→) — navigate to detail view
- [ ] **6.5** Implement "Filter to Repo" action (⌘R) — filter inbox to this repository
- [ ] **6.6** Implement "Refresh" action (⌘⇧R) — force refresh notifications

### Group 7: Preferences Screen

Extension configuration via Raycast preferences.

- [ ] **7.1** Add GitHub Token preference (password field, required)
- [ ] **7.2** Add Polling Interval preference (dropdown: 30s, 60s, 2min, 5min)
- [ ] **7.3** Add Notification Reasons preference (multi-select filter)
- [ ] **7.4** Add Native Notifications toggle (default: enabled)
- [ ] **7.5** Add Auto-start Listening toggle (default: disabled)

### Group 8: Caching & Persistence

Local storage for offline support and performance.

- [ ] **8.1** Cache notifications in Raycast LocalStorage
- [ ] **8.2** Store last fetched timestamp
- [ ] **8.3** Store done notification IDs (local-only marks)
- [ ] **8.4** Store user preferences state (last selected filter, repository)

---

## Verification

- [ ] User can configure GitHub token and see notifications within 2 minutes
- [ ] Inbox loads in under 2 seconds
- [ ] All actions respond in under 500ms
- [ ] Error states display correctly and recovery works
