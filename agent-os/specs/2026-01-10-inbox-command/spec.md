# Specification: Inbox Command

## Goal

Display notifications in a Raycast list view with title, repository, reason, and timestamp, sorted by most recent, providing users with an actionable overview of their GitHub notifications.

## User Stories

- As a user, I want to see all my notifications in a list so that I can quickly scan what needs attention
- As a user, I want to see key details (repo, reason, time) so that I can prioritize which notifications to handle first

## Specific Requirements

**Raycast List View**
- Create `Inbox` command in `@github-notifications/raycast` package
- Use Raycast `List` component with `isLoading` state during fetch
- Show empty state when no notifications: "No notifications - you're all caught up!"
- Auto-refresh list when returning to command

**List Item Display**
- Title: Notification subject title (PR title, issue title, etc.)
- Subtitle: Repository full name (e.g., `owner/repo`)
- Accessory: Relative timestamp (e.g., "5 min ago", "2 hours ago")
- Icon: Based on notification reason (review request, mention, assignment)
- Keywords: Include repo name and reason for search filtering

**Notification Reason Icons**
- `review_requested`: Code review icon
- `mention`: @ mention icon
- `assign`: Assignment icon
- `comment`: Comment bubble icon
- `author`: Author icon
- Default: Bell icon for other reasons

**Sorting & Ordering**
- Sort by `updatedAt` descending (most recent first)
- No manual sorting options in initial implementation
- Maintain sort order after actions (mark done, etc.)

**Loading & Error States**
- Show loading indicator while fetching notifications
- Show error message if fetch fails with retry action
- Show authentication error with link to preferences if token invalid

**Integration with Core Package**
- Import `NotificationService` from `@github-notifications/core`
- Import `GitHubAuthProvider` implementation for Raycast
- Map `Notification` type to Raycast list item props

## Visual Design

To be added during grooming — will include Raycast list mockups.

## Existing Code to Leverage

- `NotificationService` from fetch-notifications spec
- `GitHubAuthProvider` from github-auth spec
- `Notification` type from core package

## Out of Scope

- Detail view when selecting a notification (separate spec)
- Actions on notifications (open, mark done, snooze — separate specs)
- Filtering UI (separate spec)
- Grouping by repository (separate spec)
- Background refresh/polling (separate spec)
