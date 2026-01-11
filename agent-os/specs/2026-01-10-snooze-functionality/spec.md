# Specification: Snooze Functionality

## Goal

Allow users to temporarily hide notifications and have them resurface at a specified time, enabling better inbox management and time-based task prioritization.

## User Stories

- As a user, I want to snooze a notification so that I can deal with it later when I have time
- As a user, I want snoozed notifications to automatically reappear so that I don't forget about them

## Specific Requirements

**Snooze Durations**

- 30 minutes
- 1 hour
- 3 hours
- Tomorrow morning (9 AM local time)
- Custom duration (future enhancement)

**Snooze Storage**

- Store snoozed notifications in `PersistedState.snoozedNotifications`
- Each entry contains: notification data, unsnooze timestamp
- Persist across extension restarts
- Use `StorageProvider` interface for platform abstraction

**Snooze Action**

- Available in action panel with keyboard shortcut (⌘S)
- Show submenu with duration options
- Display toast confirmation with unsnooze time
- Remove notification from inbox immediately after snoozing

**Resurface Logic**

- Check for expired snoozes during each polling cycle
- Notification is "expired" when current time >= unsnooze timestamp
- Move expired notifications back to inbox
- Trigger native notification when snoozed item resurfaces
- Remove from snoozed storage after resurfacing

**Snooze Service**

- Create `SnoozeService` in `@github-notifications/core`
- Methods: `snooze(notification, duration)`, `getSnoozeUntil(id)`, `checkExpired()`, `unsnooze(id)`
- Accept `StorageProvider` as dependency
- Emit events when notifications are snoozed/unsnoozed

## Visual Design

**Snooze Submenu (Raycast Action Panel):**

```
Snooze →
  ├── 30 minutes
  ├── 1 hour
  ├── 3 hours
  └── Tomorrow morning (9 AM)
```

**Toast Confirmation:**

- "Snoozed until 3:30 PM" (for short durations)
- "Snoozed until tomorrow at 9:00 AM" (for next day)

## Existing Code to Leverage

- `PersistedState` interface from core types
- `StorageProvider` from notification-cache spec
- `PollingService` events for resurface checks
- Raycast `ActionPanel.Submenu` component

## Out of Scope

- Custom snooze duration picker
- Snooze by location (when I arrive at work)
- Recurring snooze
- Snooze all notifications at once
- View/manage all snoozed notifications list
