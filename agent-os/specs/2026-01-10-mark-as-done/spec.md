# Specification: Mark as Done

## Goal

Mark individual notifications as done locally and via GitHub API, removing them from the inbox and keeping the user's notification list clean and actionable.

## User Stories

- As a user, I want to mark notifications as done so that I can clear items I've already handled
- As a user, I want done notifications to sync with GitHub so that they don't reappear across devices

## Specific Requirements

**Raycast Action**
- Add `Mark as Done` action to notification list items
- Use keyboard shortcut: Cmd+D
- Show confirmation toast: "Marked as done"
- Remove item from list immediately (optimistic UI)
- Include appropriate icon (checkmark icon)

**GitHub API Integration**
- Call `PATCH /notifications/threads/{thread_id}` to mark as read
- Thread ID extracted from notification `id` field
- Requires authenticated request with valid token
- Handle API errors gracefully with rollback

**Core Package Service**
- Add `markAsDone(notificationId)` method to `NotificationService`
- Accept notification ID, return success/failure
- Handle both local state and API call
- Emit event for UI to react to state change

**Local State Management**
- Track done notification IDs in local storage
- Prevent re-showing notifications marked done locally
- Sync local state with GitHub API response
- Handle offline scenario: queue for later sync

**Optimistic UI Updates**
- Remove notification from list immediately on action
- Rollback if API call fails
- Show error toast on failure: "Failed to mark as done"
- Restore notification to list on rollback

**Batch Operations (Future-Ready)**
- Design service method to support batch marking
- Single notification for initial implementation
- Interface supports array of IDs for future "Mark all as done"

**Storage Integration**
- Use `@github-notifications/storage` for persisting done IDs
- Define `StorageProvider` interface method: `addDoneId(id)`, `getDoneIds()`, `removeDoneId(id)`
- Raycast adapter implements using LocalStorage

## Visual Design

Not applicable — uses Raycast's built-in action components and toasts.

## Existing Code to Leverage

- `NotificationService` from fetch-notifications spec
- `Notification` type from core package
- Inbox command list view from inbox-command spec
- `StorageProvider` interface from storage package

## Out of Scope

- "Mark all as done" bulk action (future enhancement)
- Undo functionality after marking done
- Archiving vs marking as done distinction
- Syncing done state across multiple clients
- Filtering to show/hide done notifications
