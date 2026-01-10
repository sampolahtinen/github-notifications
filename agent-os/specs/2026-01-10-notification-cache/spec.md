# Specification: Notification Cache

## Goal

Implement local persistence to track seen notification IDs and prevent duplicate processing across sessions, ensuring users don't see the same notifications repeatedly and enabling offline access to previously fetched data.

## User Stories

- As a user, I want my notifications to persist across Raycast restarts so that I don't lose my notification history
- As a user, I want to avoid seeing duplicate notifications so that my inbox stays clean and accurate

## Specific Requirements

**Cache Data Structure**
- Store notification objects with full metadata for offline display
- Track `lastSeenUpdatedAt` timestamp for incremental fetches
- Maintain set of `seenNotificationIds` for deduplication
- Separate storage for `doneNotificationIds` (from mark-as-done spec)
- Include cache version for future migration support

**Storage Provider Interface**
- Define interface in `@github-notifications/storage` package
- Methods: `getNotifications()`, `setNotifications(notifications)`, `getLastSeenAt()`, `setLastSeenAt(timestamp)`
- Methods: `addSeenId(id)`, `hasSeenId(id)`, `getSeenIds()`, `clearSeenIds()`
- All methods async to support various storage backends

**Raycast Storage Adapter**
- Implement `StorageProvider` using Raycast `LocalStorage` API
- Serialize/deserialize notification objects to JSON
- Handle storage quota limits gracefully
- Implement cache expiration (e.g., 7 days for old notifications)

**Cache Invalidation Strategy**
- Clear notification cache when token changes (different account)
- Expire individual notifications older than configurable threshold
- Provide manual "Clear Cache" command for troubleshooting
- Invalidate on major version updates if schema changes

**Deduplication Logic**
- Compare incoming notifications against `seenNotificationIds`
- Only flag as "new" if ID not in seen set AND updatedAt is newer
- Update seen set after successful fetch
- Handle notification updates (same ID, newer timestamp)

**Merge Strategy**
- Incoming notifications override cached versions (fresher data)
- Preserve local-only state (done, snoozed) when merging
- Remove notifications no longer returned by API after threshold
- Sort merged list by `updatedAt` descending

## Visual Design

Not applicable — this is a data layer feature.

## Existing Code to Leverage

- `Notification` type from core package
- `NotificationService` from fetch-notifications spec
- Raycast `LocalStorage` API

## Out of Scope

- Cloud sync of cache across devices
- Encryption of cached data
- Compression of cached data
- Cache size analytics/reporting
- Cross-client cache sharing (VS Code, Zed)
