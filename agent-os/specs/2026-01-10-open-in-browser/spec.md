# Specification: Open in Browser

## Goal

Add action to open the notification's GitHub URL in the default browser, allowing users to quickly navigate to the full context of any notification.

## User Stories

- As a user, I want to open a notification in my browser so that I can see the full PR, issue, or discussion context
- As a user, I want a quick keyboard shortcut to open notifications so that I can efficiently triage my inbox

## Specific Requirements

**Raycast Action**
- Add `Open in Browser` action to notification list items
- Set as primary action (triggered by Enter key)
- Use Raycast's `Action.OpenInBrowser` component
- Include appropriate icon (external link icon)

**URL Resolution**
- Extract URL from notification's `subject.url` field
- Convert API URL to web URL (api.github.com → github.com)
- Handle different subject types: PR, Issue, Release, Discussion
- Fallback to repository URL if subject URL is unavailable

**URL Conversion Logic**
- PR: `https://api.github.com/repos/owner/repo/pulls/123` → `https://github.com/owner/repo/pull/123`
- Issue: `https://api.github.com/repos/owner/repo/issues/123` → `https://github.com/owner/repo/issues/123`
- Release: `https://api.github.com/repos/owner/repo/releases/123` → `https://github.com/owner/repo/releases/tag/...`
- Commit: `https://api.github.com/repos/owner/repo/commits/sha` → `https://github.com/owner/repo/commit/sha`

**Core Package Utility**
- Create `resolveNotificationUrl(notification)` utility in `@github-notifications/core`
- Handle all notification subject types
- Return web-friendly URL string
- Export for use by all client adapters

**Keyboard Shortcut**
- Enter: Open in browser (primary action)
- Cmd+O: Alternative shortcut for open action
- Show shortcut hints in action panel

## Visual Design

Not applicable — uses Raycast's built-in action components.

## Existing Code to Leverage

- `Notification` type from core package
- Inbox command list view from inbox-command spec

## Out of Scope

- Opening specific comment within PR/issue (requires latestCommentUrl handling)
- Deep linking to code review comments
- Opening in specific browser (uses system default)
- Marking notification as read after opening (separate spec)
