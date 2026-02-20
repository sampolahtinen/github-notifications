# Tasks: Raycast MVP

## Overview

Build a complete Raycast extension MVP for GitHub notification management with viewing, triaging, and responding capabilities.

---

## Task Groups

### Group 1: Core Infrastructure & Types

> **Package:** `@github-notifications/core`

Foundation types and services.

- [x] **1.1** Define `Notification` interface with all fields (id, unread, reason, updatedAt, subject, repository)
- [x] **1.2** Define `NotificationReason` type union (review_requested, mention, assign, comment, author, state_change, subscribed)
- [x] **1.3** Define `PersistedState` interface for caching, deduplication, and user actions
- [x] **1.4** Define `GitHubAuthProvider` interface for token management
- [x] **1.5** Define `StorageProvider` interface for persistence
- [x] **1.6** Create `NotificationService` class with fetch, markAsDone, and snooze methods

### Group 2: GitHub API Integration

> **Package:** `@github-notifications/core`

GitHub API client for fetching and managing notifications.

- [x] **2.1** Implement GitHub notifications fetch (`GET /notifications`)
- [x] **2.2** Implement mark notification as done (`PATCH /notifications/threads/{id}`)
- [x] **2.3** Implement token validation endpoint
- [x] **2.4** Handle API rate limiting with appropriate headers
- [x] **2.5** Transform GitHub API response to internal `Notification` type

### Group 3: Raycast Adapters

Raycast-specific implementations of core interfaces.

- [x] **3.1** Implement `RaycastAuthProvider` using Raycast preferences for GitHub token
- [x] **3.2** Implement `RaycastStorageAdapter` using Raycast LocalStorage
- [x] **3.3** Implement `RaycastNotificationAdapter` for native macOS notifications

### Group 4: Preferences Screen

Extension configuration via Raycast preferences.

- [x] **4.1** Add GitHub Token preference (password field, required)
- [x] **4.2** Add Polling Interval preference (dropdown: 30s, 60s, 2min, 5min)
- [ ] **4.3** Add Notification Reasons preference (multi-select filter)
- [x] **4.4** Add Native Notifications toggle (default: enabled)
- [x] **4.5** Add Auto-start Listening toggle (default: disabled)

### Group 5: Inbox Command (Main View)

Primary list view showing all actionable notifications.

> **Error Handling Strategy:** Display error state with ⚠️ icon, "Failed to load notifications" message, "Check your internet connection" subtitle, and [Retry] + [Open Preferences] actions.

- [x] **5.1** Create `inbox.tsx` command with Raycast `List` component
- [x] **5.2** Implement list item rendering with icon (by reason), title, subtitle (repo), and timestamp accessory
- [x] **5.3** Implement icon mapping for notification reasons (review_requested → Code, mention → AtSymbol, etc.)
- [x] **5.4** Implement relative timestamp formatting (Just now, X min ago, X hours ago, etc.)
- [x] **5.5** Implement empty state with celebration emoji and "You're all caught up!" message
- [x] **5.6** Implement loading state with Raycast native indicator
- [x] **5.7** Implement error state with retry and open preferences actions
- [x] **5.8** Implement status bar subtitle showing listening state and notification count
- [x] **5.9** Add search/filter by notification reason dropdown

### Group 6: Notification Detail View

Expanded view when navigating into a notification.

- [ ] **6.1** Create detail view component using Raycast `Detail`
- [ ] **6.2** Display title, repository (with visibility indicator 🔒/🌐), reason, type, and timestamps
- [ ] **6.3** Format timestamps as relative + absolute
- [ ] **6.4** Add action buttons: Open in Browser, Mark as Done, Snooze, Copy URL

### Group 7: Action Panel

Actions available on notifications.

- [ ] **7.1** Implement "Open in Browser" action (Enter) — open notification URL
- [ ] **7.2** Implement "Mark as Done" action (⌘D) — mark as read, remove from inbox
- [ ] **7.3** Implement "Copy URL" action (⌘C) — copy GitHub URL to clipboard
- [ ] **7.4** Implement "View Details" action (→) — navigate to detail view
- [ ] **7.5** Implement "Filter to Repo" action (⌘R) — filter inbox to this repository
- [ ] **7.6** Implement "Refresh" action (⌘⇧R) — force refresh notifications

### Group 8: Polling Engine

Background polling for new notifications.

- [x] **8.1** Implement polling interval timer based on preferences
- [x] **8.2** Implement notification deduplication using seen IDs
- [x] **8.3** Detect new notifications by comparing with previous fetch
- [x] **8.4** Update cached notifications on each poll
- [x] **8.5** Handle polling errors gracefully (retry, backoff)

### Group 9: Start/Stop Listening Commands

Control background polling.

- [x] **9.1** Create "Start Listening" command that triggers immediate fetch and starts polling
- [x] **9.2** Create "Stop Listening" command that stops polling
- [x] **9.3** Show toast confirmation for start/stop actions
- [x] **9.4** Update inbox status indicator based on listening state

### Group 10: Native macOS Notifications

System notifications for new items.

- [x] **10.1** Trigger native notification for single new notification (title, repo, reason)
- [x] **10.2** Trigger batch notification for 4+ new notifications (count + summary)
- [x] **10.3** Track notified IDs to prevent duplicate native notifications
- [x] **10.4** Respect "Native Notifications" preference toggle

### Group 11: Caching & Persistence

Local storage for offline support and performance.

- [ ] **11.1** Cache notifications in Raycast LocalStorage
- [ ] **11.2** Store last fetched timestamp
- [ ] **11.3** Store done notification IDs (local-only marks)
- [ ] **11.4** Store user preferences state (last selected filter, repository)

---

## Verification

- [ ] User can configure GitHub token and see notifications within 2 minutes
- [ ] Inbox loads in under 2 seconds
- [ ] New notifications appear within polling interval + 5 seconds
- [ ] No duplicate native notifications
- [ ] All actions respond in under 500ms
- [ ] Error states display correctly and recovery works

---

## Stretch Goal 🎯

### Snooze Functionality

Snooze notifications for later.

- [ ] Implement snooze submenu with duration options (30min, 1hr, 3hr, Tomorrow 9AM)
- [ ] Store snoozed notifications in persisted state with unsnooze timestamp
- [ ] Hide snoozed notifications from inbox
- [ ] Detect expired snoozes during polling and resurface notifications
- [ ] Show toast confirmation when snoozing
- [ ] Trigger notification when snoozed item resurfaces
