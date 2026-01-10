# Specification: Filter by Reason

## Goal

Add filtering options to show only review requests, mentions, or assignments, allowing users to focus on specific types of notifications and quickly find what needs their attention.

## User Stories

- As a user, I want to filter notifications by reason so that I can focus on review requests when I'm in code review mode
- As a user, I want to quickly switch between filter views so that I can efficiently triage different types of work

## Specific Requirements

**Filter UI in Inbox Command**
- Add filter dropdown to Inbox command using Raycast `List.Dropdown`
- Position filter at top of list view
- Show current filter in dropdown label
- Persist selected filter across command invocations

**Filter Options**
- All Notifications (default)
- Review Requests (`review_requested` reason)
- Mentions (`mention` reason)
- Assignments (`assign` reason)
- Comments (`comment` reason)
- Show notification count per filter option in dropdown

**Filter Logic**
- Apply filter client-side to cached/fetched notifications
- Filter by `notification.reason` field
- Support multiple reasons per filter (future enhancement)
- Maintain sort order within filtered results

**Core Package Support**
- Add `filterNotifications(notifications, reasons)` utility to `@github-notifications/core`
- Accept array of reason strings for flexibility
- Return filtered array maintaining original order
- Export `NotificationReason` type enum

**Filter State Persistence**
- Save last selected filter in StorageProvider
- Restore filter selection when Inbox command opens
- Clear filter state when explicitly reset
- Add "Reset Filters" action in action panel

**Empty State Handling**
- Show filter-specific empty message: "No review requests" vs "No notifications"
- Include action to clear filter if no results
- Indicate total notification count when filtered view is empty

**Keyboard Navigation**
- Cmd+F: Open filter dropdown
- Number keys 1-5: Quick select filter options
- Escape: Clear filter and show all

## Visual Design

To be added during grooming — filter dropdown placement and styling.

## Existing Code to Leverage

- Inbox command from inbox-command spec
- `Notification` type with `reason` field from core package
- `StorageProvider` for filter persistence
- Raycast `List.Dropdown` component

## Out of Scope

- Multiple simultaneous filters (AND logic)
- Custom filter creation
- Filter by notification age/date
- Filter by unread status
- Saved filter presets
- Filter by repository (separate spec: filter-by-repository)
