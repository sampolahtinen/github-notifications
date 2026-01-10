# Specification: Fetch Comment Details

## Goal

Retrieve the latest comment content from the notification's `latest_comment_url`, enabling users to see what was said without opening GitHub in the browser.

## User Stories

- As a user, I want to see the latest comment content so that I can understand the context of a notification quickly
- As a user, I want to preview comments before deciding to respond so that I can prioritize which discussions need immediate attention

## Specific Requirements

**Comment Data Model**
- Define `Comment` type in `@github-notifications/core`
- Include fields: `id`, `body`, `author`, `createdAt`, `updatedAt`, `htmlUrl`
- Author contains: `login`, `avatarUrl`, `type` (User, Bot, etc.)
- Support both issue comments and PR review comments

**GitHub API Integration**
- Resolve `latest_comment_url` from notification subject
- Handle different comment types: issue comments, PR review comments, commit comments
- Issue comments: `GET /repos/{owner}/{repo}/issues/comments/{comment_id}`
- PR review comments: `GET /repos/{owner}/{repo}/pulls/comments/{comment_id}`
- Parse comment ID from URL to make appropriate API call

**Comment Service**
- Create `CommentService` in `@github-notifications/core` package
- Methods: `fetchComment(commentUrl)`, `fetchCommentForNotification(notification)`
- Accept `GitHubAuthProvider` as dependency for authentication
- Return typed `Comment` object or null if unavailable

**URL Parsing Logic**
- Extract owner, repo, and comment ID from `latest_comment_url`
- Detect comment type from URL pattern (issues/comments vs pulls/comments)
- Handle edge cases: missing URL, malformed URL, unsupported comment types
- Fallback gracefully when comment cannot be fetched

**Caching Strategy**
- Cache fetched comments by notification ID
- Invalidate cache when notification `updatedAt` changes
- Store comment alongside notification in cache
- Limit cache size to prevent unbounded growth

**Error Handling**
- Handle 404: comment deleted, return null with indicator
- Handle 403: permission denied, note in response
- Handle network errors: return cached version if available
- Log errors with context for debugging

**Observability**
- Add tracing span for `fetchComment` operation
- Record metrics: fetch duration, cache hit/miss ratio
- Log comment fetch errors with notification context (no PII)

## Visual Design

Not applicable — this is a data layer feature.

## Existing Code to Leverage

- `GitHubAuthProvider` interface from github-auth spec
- `Notification` type with `subject.latestCommentUrl` from core package
- `StorageProvider` for comment caching

## Out of Scope

- Fetching all comments in a thread (only latest)
- Fetching PR review with multiple comments
- Comment reactions/emoji
- Comment edit history
- Rendering comment markdown (separate spec: code-context-display)
- Posting replies (separate spec: reply-to-comments)
