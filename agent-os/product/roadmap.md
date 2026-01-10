# Product Roadmap

## Phase 1: MVP — Core Notification Flow

1. [ ] GitHub Authentication — Configure GitHub Personal Access Token storage in Raycast preferences with validation and secure retrieval `XS`

2. [ ] Fetch Notifications — Connect to GitHub Notifications API to retrieve participating notifications filtered by reason (review_requested, mention, assign) `S`

3. [ ] Inbox Command — Display notifications in a Raycast list view with title, repository, reason, and timestamp, sorted by most recent `S`

4. [ ] Open in Browser — Add action to open the notification's GitHub URL in the default browser `XS`

5. [ ] Mark as Done — Mark individual notifications as done locally and via GitHub API, removing them from the inbox `S`

## Phase 2: Background Sync & Native Alerts

6. [ ] Notification Cache — Implement local persistence to track seen notification IDs and prevent duplicate processing across sessions `S`

7. [ ] Polling Engine — Create interval-based polling (60-120s) that fetches new notifications in the background while Raycast is running `M`

8. [ ] Native macOS Notifications — Trigger system notifications for new items with title, repo, and reason, deduplicated against cache `S`

9. [ ] Start/Stop Listening Commands — Add commands to start and stop the background polling loop with visual status indicator `S`

## Phase 3: Enhanced Inbox Experience

10. [ ] Notification Detail View — Show expanded notification details including full title, repository info, author, and timestamps `S`

11. [ ] Snooze Notifications — Allow users to snooze notifications for a configurable duration, hiding them temporarily from inbox `M`

12. [ ] Filter by Reason — Add filtering options to show only review requests, mentions, or assignments `S`

13. [ ] Filter by Repository — Add filtering to scope inbox to specific repositories `S`

## Phase 4: Code Context & Replies

14. [ ] Fetch Comment Details — Retrieve the latest comment content from the notification's latest_comment_url `S`

15. [ ] Code Context Display — Parse and display diff hunks and file metadata for PR review comments as Markdown snippets `M`

16. [ ] Reply to Comments — Add inline reply action that prompts for input and POSTs response via GitHub API `M`

17. [ ] Reply to PR Review Comments — Support replying specifically to PR review comment threads with proper API endpoints `S`

## Phase 5: Multi-Client Architecture

18. [ ] Extract Core Interfaces — Refactor core logic (fetch, cache, actions) into platform-agnostic TypeScript interfaces and services `L`

19. [ ] Raycast Adapter — Wrap core services with Raycast-specific UI and storage implementations `M`

20. [ ] VS Code Extension Scaffold — Create VS Code extension that implements core interfaces with VS Code APIs and command palette `L`

21. [ ] Zed Extension Scaffold — Create Zed extension that implements core interfaces with Zed extension APIs `L`

## Phase 6: Polish & Advanced Features

22. [ ] Rate Limit Handling — Gracefully handle GitHub API rate limits with backoff and user feedback `S`

23. [ ] Error States & Recovery — Display meaningful error messages and retry options for API failures `S`

24. [ ] Keyboard Shortcuts — Add customizable keyboard shortcuts for all major actions `S`

25. [ ] Notification Grouping — Group notifications by repository or PR for cleaner inbox organization `M`

> Notes
> - Order follows technical dependencies: auth → fetch → display → actions → background → multi-platform
> - Phase 1-2 delivers a functional MVP with core value proposition
> - Phase 3-4 adds the differentiated features (code context, inline replies)
> - Phase 5 enables the long-term vision of multi-client support
> - Each item is independently testable and deployable
