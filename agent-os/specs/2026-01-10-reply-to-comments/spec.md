# Specification: Reply to Comments

## Goal

Add inline reply action that prompts for input and POSTs response via GitHub API, enabling users to respond to discussions directly from Raycast without opening a browser.

## User Stories

- As a user, I want to reply to comments from Raycast so that I can respond quickly without context-switching to GitHub
- As a user, I want a simple input form so that I can compose and send replies efficiently

## Specific Requirements

**Raycast Reply Action**
- Add `Reply` action to notification list items and detail view
- Use keyboard shortcut: Cmd+Enter
- Only show action for notifications with `latestCommentUrl` available
- Include reply icon for action

**Reply Input Form**
- Use Raycast `Form` component for reply composition
- Single `TextArea` field for reply body with Markdown support
- Show original comment preview above input for context
- Include "Submit" and "Cancel" actions
- Support Cmd+Enter to submit from within TextArea

**GitHub API Integration**
- Post issue comment: `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`
- Post PR review comment reply: `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies`
- Detect comment type from notification subject and latestCommentUrl
- Include reply body in request payload

**Comment Service Extension**
- Add `replyToComment(notification, body)` method to `CommentService`
- Determine correct API endpoint based on comment type
- Handle authentication via `GitHubAuthProvider`
- Return created comment or error

**Reply Flow**
- User triggers Reply action on notification
- Form opens with original comment displayed (read-only)
- User composes reply in TextArea
- User submits form
- API call posts reply to GitHub
- Success: show toast "Reply sent", close form, refresh notification
- Failure: show error toast, keep form open for retry

**Input Validation**
- Require non-empty reply body
- Trim whitespace from reply
- Minimum length: 1 character (after trim)
- Maximum length: GitHub's limit (65536 characters)
- Show validation error for empty submission

**Optimistic UI**
- Disable submit button while posting
- Show loading indicator during API call
- Prevent duplicate submissions
- Re-enable form on error for retry

**Error Handling**
- Handle 403: permission denied (not a collaborator)
- Handle 404: issue/PR closed or deleted
- Handle 422: validation error from GitHub
- Handle network errors with retry option
- Show specific error messages for each case

**Observability**
- Trace reply submission with span
- Record metrics: reply duration, success/failure rate
- Log errors with notification context (no reply content)

## Visual Design

To be added during grooming — reply form layout and original comment preview.

## Existing Code to Leverage

- `CommentService` from fetch-comment-details spec
- `Comment` type from core package
- `GitHubAuthProvider` from github-auth spec
- Notification detail view from notification-detail-view spec
- Raycast `Form` component

## Out of Scope

- Markdown preview while composing
- File attachments in replies
- @mention autocomplete
- Emoji picker
- Draft saving (replies are ephemeral)
- Editing sent replies
- Deleting sent replies
- Reply templates
