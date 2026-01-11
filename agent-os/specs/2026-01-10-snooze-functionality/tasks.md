# Tasks: Snooze Functionality

## Overview

Allow users to temporarily hide notifications and have them resurface at a specified time.

---

## Prerequisites

> **Note:** Requires `StorageProvider` and `PersistedState` from core package, and `PollingService` for resurface checks.

---

## Task Groups

### Group 1: Snooze Service Core

> **Package:** `@github-notifications/core`

Create the platform-agnostic snooze service.

- [ ] **1.1** Create `SnoozeService` class accepting `StorageProvider` as dependency
- [ ] **1.2** Implement `snooze(notification, duration)` method that stores notification with unsnooze timestamp
- [ ] **1.3** Implement `getSnoozeUntil(id)` method to check if notification is snoozed
- [ ] **1.4** Implement `unsnooze(id)` method to manually unsnooze a notification
- [ ] **1.5** Implement `checkExpired()` method that returns all notifications past their unsnooze time

### Group 2: Duration Calculations

Calculate unsnooze timestamps for each duration option.

- [ ] **2.1** Implement "30 minutes" duration calculation
- [ ] **2.2** Implement "1 hour" duration calculation
- [ ] **2.3** Implement "3 hours" duration calculation
- [ ] **2.4** Implement "Tomorrow 9 AM" calculation (local timezone aware)

### Group 3: Storage Integration

Persist snoozed notifications across restarts.

- [ ] **3.1** Define `SnoozedNotification` type with notification data and unsnooze timestamp
- [ ] **3.2** Store snoozed notifications in `PersistedState.snoozedNotifications`
- [ ] **3.3** Remove notification from snoozed storage after resurfacing
- [ ] **3.4** Handle storage read/write errors gracefully

### Group 4: Raycast Snooze UI

Implement snooze action in Raycast extension.

- [ ] **4.1** Add snooze action to action panel with ⌘S shortcut
- [ ] **4.2** Create submenu with duration options (30min, 1hr, 3hr, Tomorrow 9AM)
- [ ] **4.3** Show toast confirmation with formatted unsnooze time
- [ ] **4.4** Remove notification from inbox immediately after snoozing

### Group 5: Resurface Logic

Bring back snoozed notifications when time expires.

- [ ] **5.1** Hook into polling cycle to check for expired snoozes
- [ ] **5.2** Move expired notifications back to inbox
- [ ] **5.3** Trigger native notification when snoozed item resurfaces
- [ ] **5.4** Emit `notification-unsnoozed` event for UI updates

### Group 6: Inbox Filtering

Hide snoozed notifications from inbox view.

- [ ] **6.1** Filter out snoozed notification IDs when rendering inbox
- [ ] **6.2** Update inbox count to exclude snoozed notifications

---

## Verification

- [ ] Snooze submenu appears with all duration options
- [ ] Snoozed notification disappears from inbox immediately
- [ ] Toast shows correct unsnooze time
- [ ] Notification resurfaces after snooze duration expires
- [ ] Native notification triggers on resurface
- [ ] Snoozed state persists across extension restarts
