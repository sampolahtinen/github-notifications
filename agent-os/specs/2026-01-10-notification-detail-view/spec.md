# Specification: Notification Detail View

## Goal

Show expanded notification details including full title, repository info, author, and timestamps, allowing users to get complete context about a notification without leaving Raycast.

## User Stories

- As a user, I want to see full notification details so that I can understand the context before taking action
- As a user, I want to see who triggered the notification so that I know who I'm responding to

## Specific Requirements

**Raycast Detail View**
- Show detail panel when user presses right arrow or designated shortcut on list item
- Use Raycast `Detail` component with markdown content
- Include all available notification metadata
- Maintain action panel in detail view for quick actions

**Detail Content Structure**
- Header: Full subject title (no truncation)
- Repository: Full name with link, visibility indicator (public/private)
- Reason: Human-readable reason with icon (e.g., "🔍 Review Requested")
- Timestamps: Created at, Updated at (relative and absolute)
- Author: If available from subject data, show username and avatar

**Metadata Display**
- Notification type badge: PR, Issue, Release, Discussion, Commit
- Unread status indicator
- Repository owner and name as separate fields
- Direct links to related GitHub resources

**Markdown Rendering**
- Format detail content as Markdown for Raycast's renderer
- Use headers, lists, and emphasis for visual hierarchy
- Include horizontal rules to separate sections
- Format timestamps consistently

**Actions in Detail View**
- Carry over all actions from list view (Open, Mark Done, etc.)
- Primary action remains Open in Browser
- Show keyboard shortcuts for all actions
- Add "Copy URL" action for sharing

**Loading State**
- Show detail view immediately with cached data
- Indicate if additional data is being fetched
- Handle missing optional fields gracefully

## Visual Design

To be added during grooming — detail view layout mockup.

## Existing Code to Leverage

- `Notification` type from core package
- Inbox command from inbox-command spec
- `resolveNotificationUrl()` from open-in-browser spec
- Raycast `Detail` component

## Out of Scope

- Fetching additional data beyond notification object (comments, PR details)
- Inline display of code context (separate spec: code-context-display)
- Editing or replying from detail view (separate specs)
- Navigation between notifications in detail view
- Caching detail view state
