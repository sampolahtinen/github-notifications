# Specification: Polling Engine

## Goal

Create interval-based polling (60-120s) that fetches new notifications in the background while Raycast is running, ensuring users receive timely updates without manual refresh.

## User Stories

- As a user, I want notifications to refresh automatically so that I always see the latest items without manual action
- As a user, I want to control the polling interval so that I can balance freshness against API usage

## Specific Requirements

**Polling Service**
- Create `PollingService` in `@github-notifications/core` package
- Configurable interval: default 60 seconds, range 30-300 seconds
- Start/stop methods for lifecycle control
- Emit events when new notifications are detected
- Single instance pattern to prevent duplicate polling

**Interval Management**
- Use `setInterval` for recurring fetches
- Clear interval on stop and cleanup
- Pause polling when system is idle/sleeping (if detectable)
- Resume polling when activity resumes
- Prevent overlapping fetches if previous fetch is still in progress

**New Notification Detection**
- Compare fetched notifications against cached `seenNotificationIds`
- Notification is "new" if ID not in seen set
- Notification is "updated" if ID exists but `updatedAt` is newer
- Emit separate events for new vs updated notifications
- Update seen set after processing

**Event System**
- Define `PollingEvent` types: `new-notifications`, `updated-notifications`, `polling-started`, `polling-stopped`, `polling-error`
- Use EventEmitter pattern or callback registration
- Include notification data in event payload
- Allow multiple listeners for same event type

**Configuration**
- Store polling interval in user preferences
- Allow runtime interval changes without restart
- Respect minimum interval to avoid rate limiting
- Expose configuration through Raycast preferences UI

**Error Handling**
- Continue polling after transient errors (network issues)
- Back off exponentially on repeated failures
- Stop polling on authentication errors (token invalid)
- Emit error events for UI to display status
- Reset backoff after successful fetch

**Observability**
- Trace each polling cycle with span
- Record metrics: poll duration, notification count, error rate
- Log polling start/stop events
- Track consecutive failures for alerting

## Visual Design

Not applicable — this is a background service.

## Existing Code to Leverage

- `NotificationService.fetchNotifications()` from fetch-notifications spec
- `StorageProvider` from notification-cache spec
- `GitHubAuthProvider` from github-auth spec

## Out of Scope

- Push notifications via webhooks (polling only)
- Smart polling (adjusting interval based on activity)
- Background polling when Raycast is closed
- Multi-account polling
- Per-repository polling intervals
