# Tasks: Native macOS Notifications

## Overview

Trigger system notifications for new GitHub activity with title, repo, and reason, deduplicated against cache.

---

## Prerequisites

> **Note:** Requires polling engine and storage provider from Raycast MVP to be implemented first.

---

## Task Groups

### Group 1: Core Notification Service

> **Package:** `@github-notifications/core`

Create the platform-agnostic notification service.

- [ ] **1.1** Define `NativeNotificationAdapter` interface with `notify(notification)` and `notifyBatch(notifications)` methods
- [ ] **1.2** Create `NativeNotificationService` class accepting adapter as dependency
- [ ] **1.3** Implement `hasNotified(id)` method checking against `notifiedNotificationIds` set
- [ ] **1.4** Implement `markAsNotified(id)` method to add ID to notified set
- [ ] **1.5** Implement periodic cleanup of old notified IDs to prevent unbounded growth

### Group 2: Notification Content Formatting

Format notification content for display.

- [ ] **2.1** Create human-readable reason formatter (e.g., "review_requested" → "Review Requested")
- [ ] **2.2** Implement title truncation for long notification subjects
- [ ] **2.3** Format body as "Subject title - owner/repo"
- [ ] **2.4** Create batch summary format ("You have X new GitHub notifications")

### Group 3: Batching Strategy

Handle single vs batch notification scenarios.

- [ ] **3.1** Implement single notification trigger for 1-3 new notifications
- [ ] **3.2** Implement batch/summary notification for 4+ new notifications
- [ ] **3.3** Include reason breakdown in batch summary (e.g., "3 review requests, 2 mentions")

### Group 4: Raycast Notification Adapter

Raycast-specific implementation of notification adapter.

- [ ] **4.1** Implement `RaycastNotificationAdapter` using Raycast's `showHUD` for transient notifications
- [ ] **4.2** Implement `showToast` for persistent notifications with actions
- [ ] **4.3** Handle system notification permissions and Do Not Disturb respect

### Group 5: Polling Integration

Connect notification service to polling engine.

- [ ] **5.1** Subscribe to polling engine's `new-notifications` event
- [ ] **5.2** Filter new notifications against `hasNotified()` check
- [ ] **5.3** Trigger appropriate notification (single or batch) for unnotified items
- [ ] **5.4** Mark all triggered notifications as notified

### Group 6: User Preferences

Respect user notification preferences.

- [ ] **6.1** Check "Native Notifications" toggle before triggering
- [ ] **6.2** Filter notifications by user's selected reasons (review_requested, mention, etc.)
- [ ] **6.3** Design interface to support quiet hours (future-ready, not implemented)

---

## Verification

- [ ] Single notification appears for 1-3 new items with correct title/body
- [ ] Batch notification appears for 4+ new items with count summary
- [ ] No duplicate notifications for same notification ID
- [ ] Notifications respect enabled/disabled toggle
- [ ] Notifications respect reason filter preferences
- [ ] Old notified IDs are cleaned up periodically
