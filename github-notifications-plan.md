# GitHub Notifications Listener – Raycast Extension
## Technical Plan

### 1. Overview
A private Raycast extension that tracks and manages GitHub notifications with a focus on pull request reviews and participation, helping prevent forgotten follow-ups via macOS notifications.

### 2. Goals
- Use GitHub Notifications as the single source of truth
- Provide an actionable inbox inside Raycast
- Allow replying to comments directly from Raycast
- Show contextual code hints for review comments
- Send native macOS notifications
- Remain fully private and locally run

### 3. Non-Goals
- Always-on background daemon
- Full PR review lifecycle management
- Multi-user support

### 4. Architecture
- Raycast Extension (TypeScript)
- Commands:
  - Inbox
  - Start Listening
  - (Optional) Stop Listening
- GitHub REST API client
- Polling engine with interval-based execution
- Local persistence via Raycast LocalStorage

### 5. Data Source
Primary:
- GitHub Notifications API (`GET /notifications`)
Parameters:
- all=false
- participating=true
- per_page=50+

Key fields:
- id
- updated_at
- reason
- repository.full_name
- subject (type, title, url, latest_comment_url)

### 6. Commands

#### Inbox
- List unread, actionable notifications
- Actions: Open, Reply, Mark Done, Snooze
- Detail view with metadata and code hints

#### Start Listening
- Starts polling loop
- Immediately polls on start
- Triggers macOS notifications for new items
- Shows persistent "Listening…" UI

#### Stop Listening (Optional)
- Stops polling loop

### 7. Polling Logic
- setInterval-based polling (60–120s)
- Cache by notification ID
- First run seeds cache without notifications
- Filter by reason (review_requested, mention, assign)

### 8. Notifications
- Use Raycast showNotification API
- Deduplicate via cached IDs
- Optional batching/grouping later

### 9. Replying to Comments
- Support issue comments and PR review comments
- Resolve endpoint from latest_comment_url
- Prompt for input and POST via GitHub API

### 10. Code Context
- Use diff hunk and file metadata for PR review comments
- Render snippets in Markdown
- Fallback to browser link if unavailable

### 11. Authentication
- GitHub Personal Access Token
- Stored in Raycast Preferences
- Scopes: notifications, repo, read:org (if needed)

### 12. Persistence
- Raycast LocalStorage:
  - lastSeenUpdatedAt
  - notifiedNotificationIds
  - snoozedNotificationIds
  - markedDoneNotificationIds

### 13. Error Handling
- Silent failures during polling
- Visible errors in Inbox only
- Handle rate limits gracefully

### 14. Future Enhancements
- Editor deep links
- GraphQL enrichment
- Auto-start on login
- Advanced filtering and grouping

### 15. Success Criteria
- Timely, non-spammy notifications
- Clear actionable inbox
- Reply without leaving Raycast
- No duplicate alerts
