# Specification: Snooze Notifications

## Goal

Allow users to snooze notifications for a configurable duration, hiding them temporarily from inbox and resurfacing them when the snooze period expires.

## User Stories

- As a user, I want to snooze a notification so that I can temporarily hide items I can't handle right now
- As a user, I want snoozed notifications to reappear automatically so that I don't forget about them

## Specific Requirements

**Raycast Action**
- Add `Snooze` action to notification list items
- Use keyboard shortcut: Cmd+S
- Show submenu with duration options when triggered
- Include clock/snooze icon for action
- Remove item from list immediately after snoozing

**Snooze Duration Options**
- 30 minutes
- 1 hour
- 3 hours
- Tomorrow morning (9 AM local time)
- Custom duration input (optional, future enhancement)
- Show relative unsnooze time in confirmation toast

**Snooze Data Model**
- Store `snoozedNotificationIds` map: `{ notificationId: unsnoozeTimestamp }`
- Persist in StorageProvider for durability across sessions
- Include original notification data for display when unsnoozed
- Track snooze count per notification (optional metadata)

**Storage Provider Interface**
- Add methods to `StorageProvider`: `snoozeNotification(id, until)`, `unsnoozeNotification(id)`, `getSnoozedNotifications()`, `isSnoozed(id)`
- Store unsnooze timestamp as ISO string or Unix timestamp
- Support querying notifications ready to unsnooze

**Unsnooze Logic**
- Check for expired snoozes on each polling cycle
- Check for expired snoozes when Inbox command opens
- Move unsnoozing notifications back to main inbox
- Trigger native notification when snoozed item resurfaces
- Clear snooze data after unsnoozing

**Inbox Filtering**
- Filter out snoozed notifications from main inbox list
- Add "Snoozed" section or separate command to view snoozed items
- Show snooze expiry time in snoozed notifications view
- Allow manual unsnooze from snoozed view

**Snooze Status Display**
- Show snoozed count in inbox subtitle: "5 notifications · 2 snoozed"
- Indicate if notification was previously snoozed (optional badge)
- Show "Snoozed until X" in notification detail view if snoozed

## Visual Design

To be added during grooming — snooze submenu and snoozed notifications view.

## Existing Code to Leverage

- `StorageProvider` interface from notification-cache spec
- `Notification` type from core package
- Inbox command from inbox-command spec
- `PollingService` for checking expired snoozes

## Out of Scope

- Recurring snooze (snooze again automatically)
- Location-based snooze (unsnooze when at office)
- Snooze all notifications from a repository
- Snooze patterns/rules (auto-snooze certain types)
- Sync snoozed state with GitHub (local only)
