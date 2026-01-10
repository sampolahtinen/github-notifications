# Specification: Native macOS Notifications

## Goal

Trigger system notifications for new items with title, repo, and reason, deduplicated against cache, keeping users informed of new GitHub activity without requiring them to actively check the inbox.

## User Stories

- As a user, I want to receive native macOS notifications so that I'm alerted to new GitHub activity immediately
- As a user, I want notifications to be deduplicated so that I don't get spammed with repeated alerts

## Specific Requirements

**Raycast Notification API**
- Use Raycast's `showHUD` for transient notifications
- Use Raycast's `showToast` for persistent notifications with actions
- Trigger notifications from polling engine's `new-notifications` event
- Respect system notification permissions and Do Not Disturb

**Notification Content**
- Title: Notification reason in human-readable form (e.g., "Review Requested")
- Body: Subject title + repository name (e.g., "Fix auth bug - owner/repo")
- Include notification count if multiple new items (e.g., "3 new notifications")
- Truncate long titles to fit notification display

**Deduplication**
- Track notified IDs in `notifiedNotificationIds` set via StorageProvider
- Only show native notification if ID not in notified set
- Add ID to notified set after showing notification
- Clear old notified IDs periodically to prevent unbounded growth

**Notification Service**
- Create `NativeNotificationService` in `@github-notifications/core`
- Methods: `notify(notification)`, `notifyBatch(notifications)`, `hasNotified(id)`
- Accept platform-specific notification adapter as dependency
- Handle both single and batch notification scenarios

**Batching Strategy**
- If 1-3 new notifications: show individual notifications
- If 4+ new notifications: show single summary notification
- Summary format: "You have X new GitHub notifications"
- Include action to open inbox from summary notification

**User Preferences**
- Enable/disable native notifications toggle
- Notification sound on/off option
- Filter which reasons trigger notifications (review_requested, mention, etc.)
- Store preferences in Raycast preferences

**Quiet Hours (Future-Ready)**
- Design interface to support quiet hours configuration
- Initial implementation: always notify when enabled
- Interface supports time-based filtering for future enhancement

## Visual Design

Not applicable — uses native macOS notification system via Raycast.

## Existing Code to Leverage

- `PollingService` events from polling-engine spec
- `StorageProvider` from notification-cache spec
- `Notification` type from core package
- Raycast notification APIs

## Out of Scope

- Custom notification sounds
- Notification actions (reply, mark done from notification)
- Notification grouping by repository
- Rich notifications with images
- Notification scheduling/quiet hours implementation
