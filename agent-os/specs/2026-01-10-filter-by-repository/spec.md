# Specification: Filter by Repository

## Goal

Add filtering to scope inbox to specific repositories, allowing users to focus on notifications from particular projects and reduce noise from less important repositories.

## User Stories

- As a user, I want to filter notifications by repository so that I can focus on a specific project I'm actively working on
- As a user, I want to see which repositories have notifications so that I can quickly identify where activity is happening

## Specific Requirements

**Filter UI in Inbox Command**
- Add repository filter dropdown alongside reason filter using Raycast `List.Dropdown`
- Show list of repositories with active notifications
- Display notification count per repository in dropdown
- Support "All Repositories" option as default

**Repository List Population**
- Extract unique repositories from current notification set
- Sort repositories by notification count (most active first)
- Update repository list when notifications refresh
- Include repository full name (owner/repo format)

**Filter Logic**
- Apply filter client-side to cached/fetched notifications
- Filter by `notification.repository.fullName` field
- Combine with reason filter (AND logic when both active)
- Maintain sort order within filtered results

**Core Package Support**
- Add `filterByRepository(notifications, repoFullName)` utility to `@github-notifications/core`
- Add `getUniqueRepositories(notifications)` utility returning repo list with counts
- Return `{ fullName: string, count: number }[]` for dropdown population
- Handle null/undefined repository gracefully

**Filter State Persistence**
- Save last selected repository filter in StorageProvider
- Restore filter selection when Inbox command opens
- Clear repository filter if repository no longer has notifications
- Coordinate with reason filter persistence

**Quick Repository Access**
- Add "Filter to this repo" action on notification items
- Keyboard shortcut: Cmd+R to filter to selected notification's repo
- Show current repo filter in list subtitle
- Action to clear repository filter

**Combined Filtering**
- Support both reason and repository filters simultaneously
- Show combined filter state: "Review Requests in owner/repo"
- Clear all filters action resets both
- Empty state reflects both active filters

**Empty State Handling**
- Show repo-specific empty message: "No notifications in owner/repo"
- Include action to clear repository filter
- Show total count from other repositories

## Visual Design

To be added during grooming — dual filter dropdown layout.

## Existing Code to Leverage

- Inbox command from inbox-command spec
- Filter by reason dropdown from filter-by-reason spec
- `Notification` type with `repository` field from core package
- `StorageProvider` for filter persistence
- Raycast `List.Dropdown` component

## Out of Scope

- Multi-repository selection (OR logic)
- Repository favorites/pinning
- Repository grouping in list view (separate spec: notification-grouping)
- Hiding/muting specific repositories permanently
- Repository-specific notification settings
