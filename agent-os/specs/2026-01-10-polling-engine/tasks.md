# Tasks: Polling Engine

## Overview

Create interval-based polling that fetches new notifications in the background while Raycast is running.

---

## Prerequisites

> **Note:** Requires `NotificationService.fetchNotifications()` and `StorageProvider` from core package.

---

## Task Groups

### Group 1: Polling Service Core

> **Package:** `@github-notifications/core`

Create the polling service with lifecycle management.

- [ ] **1.1** Create `PollingService` class with configurable interval (default 60s, range 30-300s)
- [ ] **1.2** Implement `start()` method using `setInterval` for recurring fetches
- [ ] **1.3** Implement `stop()` method that clears interval and cleans up
- [ ] **1.4** Implement single instance pattern to prevent duplicate polling
- [ ] **1.5** Prevent overlapping fetches if previous fetch is still in progress

### Group 2: New Notification Detection

Detect and categorize new vs updated notifications.

- [ ] **2.1** Compare fetched notifications against cached `seenNotificationIds`
- [ ] **2.2** Identify "new" notifications (ID not in seen set)
- [ ] **2.3** Identify "updated" notifications (ID exists but `updatedAt` is newer)
- [ ] **2.4** Update seen set after processing each poll cycle

### Group 3: Event System

Emit events for UI and other services to consume.

- [ ] **3.1** Define `PollingEvent` types: `new-notifications`, `updated-notifications`, `polling-started`, `polling-stopped`, `polling-error`
- [ ] **3.2** Implement EventEmitter pattern or callback registration
- [ ] **3.3** Include notification data in event payload
- [ ] **3.4** Allow multiple listeners for same event type

### Group 4: Error Handling

Handle failures gracefully without stopping the service.

- [ ] **4.1** Continue polling after transient errors (network issues)
- [ ] **4.2** Implement exponential backoff on repeated failures
- [ ] **4.3** Stop polling on authentication errors (token invalid)
- [ ] **4.4** Emit error events for UI to display status
- [ ] **4.5** Reset backoff after successful fetch

### Group 5: Raycast Start/Stop Commands

Control background polling via Raycast commands.

- [ ] **5.1** Create "Start Listening" command that triggers immediate fetch and starts polling
- [ ] **5.2** Create "Stop Listening" command that stops polling
- [ ] **5.3** Show toast confirmation for start/stop actions
- [ ] **5.4** Update inbox status indicator based on listening state

### Group 6: Configuration

Runtime configuration and preferences.

- [ ] **6.1** Allow runtime interval changes without restart
- [ ] **6.2** Respect minimum interval (30s) to avoid rate limiting
- [ ] **6.3** Expose configuration through Raycast preferences UI

---

## Verification

- [ ] Polling starts and fetches notifications at configured interval
- [ ] New notifications are detected and events emitted
- [ ] Polling continues after transient network errors
- [ ] Polling stops on authentication errors
- [ ] Start/Stop commands work correctly with toast feedback
- [ ] No duplicate fetches when previous fetch is in progress
