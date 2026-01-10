# Specification: Fetch Notifications

## Goal

Connect to GitHub Notifications API to retrieve participating notifications filtered by reason (review_requested, mention, assign), providing the foundation for all notification display and management features.

## User Stories

- As a user, I want to fetch my GitHub notifications so that I can see what needs my attention
- As a user, I want to only see notifications I'm participating in so that I'm not overwhelmed with noise

## Specific Requirements

**GitHub Notifications API Integration**
- Call `GET /notifications` endpoint with authenticated requests
- Set `participating=true` to filter to relevant notifications
- Set `all=false` to exclude already-read notifications
- Set `per_page=50` for reasonable batch size
- Use `since` parameter for incremental fetches after initial load

**Notification Data Model**
- Define `Notification` type in `@github-notifications/core`
- Include fields: `id`, `updatedAt`, `reason`, `unread`, `subject`, `repository`
- Subject contains: `type`, `title`, `url`, `latestCommentUrl`
- Repository contains: `id`, `fullName`, `owner`, `private`
- Reason enum: `review_requested`, `mention`, `assign`, `author`, `comment`, `state_change`

**Filter by Reason**
- Support filtering by notification reason at fetch time
- Default filter: `review_requested`, `mention`, `assign`
- Make filter configurable for future enhancement
- Apply filter client-side after API response (API doesn't support reason filter)

**Core Package Service**
- Create `NotificationService` in `@github-notifications/core`
- Methods: `fetchNotifications(options)`, `getNotificationById(id)`
- Accept `GitHubAuthProvider` as dependency for authentication
- Return typed `Notification[]` array

**Error Handling**
- Handle 401 Unauthorized: surface as authentication error
- Handle 403 Forbidden: check for rate limiting vs permission issues
- Handle network errors: throw typed error for UI to handle
- Handle malformed responses: log and skip invalid notifications

**Observability**
- Add tracing span for `fetchNotifications` operation
- Record metrics: fetch duration, notification count, filter counts
- Log errors with context (no PII)

## Visual Design

Not applicable — this is a data layer feature.

## Existing Code to Leverage

- `GitHubAuthProvider` interface from github-auth spec

## Out of Scope

- Caching notifications locally (separate spec: notification-cache)
- Displaying notifications in UI (separate spec: inbox-command)
- Marking notifications as read (separate spec: mark-as-done)
- Polling for new notifications (separate spec: polling-engine)
- Pagination beyond initial fetch
