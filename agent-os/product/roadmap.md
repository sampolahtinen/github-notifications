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

## Phase 4: Code Context & Replies (GraphQL)

> **API:** Uses GitHub GraphQL API for all content fetching. REST remains only for notification polling.

14. [ ] GraphQL Client Setup — Add GraphQL client to core package, reusing existing PAT auth `S`

15. [ ] Fetch Review Threads — Query `pullRequest.reviewThreads` via GraphQL for grouped threads with `isResolved`, `path`, `line`, `diffSide`, and nested comments `M`

16. [ ] Code Context Display — Render diff hunks and file metadata from review threads as Markdown in Raycast Detail view `M`

17. [ ] Reply to Review Threads — Use `addPullRequestReviewComment` GraphQL mutation to reply inline `M`

18. [ ] Resolve Latest Comment — Fetch comment details via GraphQL for richer native notifications (commenter, body preview) `S`

## Phase 5: Multi-Client Architecture

19. [ ] Extract Core Interfaces — Refactor core logic (fetch, cache, actions) into platform-agnostic TypeScript interfaces and services `L`

20. [ ] Raycast Adapter — Wrap core services with Raycast-specific UI and storage implementations `M`

21. [ ] VS Code Extension Scaffold — Create VS Code extension that implements core interfaces with VS Code APIs and command palette `L`

22. [ ] Zed Extension Scaffold — Create Zed extension that implements core interfaces with Zed extension APIs `L`

## Phase 6: Polish & Advanced Features

23. [ ] Rate Limit Handling — Gracefully handle GitHub API rate limits with backoff and user feedback `S`

24. [ ] Error States & Recovery — Display meaningful error messages and retry options for API failures `S`

25. [ ] Keyboard Shortcuts — Add customizable keyboard shortcuts for all major actions `S`

26. [ ] Notification Grouping — Group notifications by repository or PR for cleaner inbox organization `M`

> Notes
> - Order follows technical dependencies: auth → fetch → display → actions → background → multi-platform
> - Phase 1-2 delivers a functional MVP with core value proposition
> - Phase 3-4 adds the differentiated features (code context, inline replies)
> - Phase 5 enables the long-term vision of multi-client support
> - Each item is independently testable and deployable
>
> API Strategy
> - **REST API**: Notification lifecycle only — `GET /notifications` (polling), `PATCH /notifications/threads/{id}` (mark done), `PUT /notifications/threads/{thread_id}/subscription` (subscribe). GitHub does not expose notifications via GraphQL.
> - **GraphQL API**: All content fetching — PR review threads, comment details, reply mutations, participating PR search. Provides grouped threads, `isResolved` status, and batching that REST cannot.
> - Both APIs authenticate with the same GitHub PAT (needs `notifications` + `repo` scopes).
