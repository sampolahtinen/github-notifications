# Task Breakdown: Thread View with Code Context

## Overview
Total Tasks: 30
Estimated Task Groups: 6

This feature adds a thread detail view to the Raycast extension, allowing developers to see PR review comment threads with code context, resolved/unresolved status, and the ability to reply -- all powered by the GitHub GraphQL API.

## Prerequisites

- The existing Raycast MVP inbox command is functional (`packages/raycast/src/inbox.tsx`)
- REST-based notification polling is in place (`packages/core/src/services/notification-service.ts`)
- Auth provider reads the GitHub PAT from Raycast preferences (`packages/raycast/src/adapters/auth-provider.ts`)
- The `Result<T>` / `Failure` pattern is established (`packages/core/src/result.ts`)

## Task List

### GraphQL Infrastructure

#### Task Group 1: GraphQL Client Setup
**Dependencies:** None

This group establishes the foundational GraphQL client that all subsequent groups depend on. There is no existing GraphQL client in the codebase; everything currently uses native `fetch` against the REST API.

- [x] 1.0 Complete GraphQL client infrastructure
  - [x] 1.1 Write 3-4 focused tests for the GraphQL client
    - Test successful query execution returns parsed data
    - Test authentication header is included with the token from `GitHubAuthProvider`
    - Test network/HTTP error returns a proper `Result<T>` failure (using existing `Failure` codes)
    - Test GraphQL-level errors (errors array in response) are mapped to a `Failure`
  - [x] 1.2 Create the `GraphQLClient` class in `packages/core/src/services/graphql-client.ts`
    - Constructor accepts `GitHubAuthProvider` (reuse existing provider interface)
    - Single `query<T>(query: string, variables: Record<string, unknown>): Promise<Result<T>>` method
    - Single `mutate<T>(mutation: string, variables: Record<string, unknown>): Promise<Result<T>>` method
    - Uses native `fetch` against `https://api.github.com/graphql` (consistent with existing REST approach -- no external GraphQL library)
    - Sets headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
    - Returns `Result<T>` using the existing `ok()` / `err()` helpers from `packages/core/src/result.ts`
    - Maps HTTP errors to existing `Failure` codes (401 -> `authFailure()`, 429 -> `rateLimitFailure()`, network -> `networkFailure()`)
    - Maps GraphQL-level errors (response contains `errors` array) to a `Failure` with code `UPSTREAM`
  - [x] 1.3 Export `GraphQLClient` from `packages/core/src/services/index.ts`
    - Add `export { GraphQLClient } from "./graphql-client";`
    - Verify it is re-exported from `packages/core/src/index.ts` via the existing barrel export
  - [x] 1.4 Ensure GraphQL client tests pass
    - Run ONLY the 3-4 tests written in 1.1
    - Verify `Result<T>` integration works for both success and failure paths

**Acceptance Criteria:**
- `GraphQLClient` can execute arbitrary queries and mutations against the GitHub GraphQL endpoint
- Auth token is sourced from the existing `GitHubAuthProvider` interface
- All error paths produce proper `Failure` objects using existing factory functions
- The 3-4 tests from 1.1 pass

---

### Data Layer

#### Task Group 2: Review Thread Types and Query Definitions
**Dependencies:** Task Group 1

This group defines the TypeScript interfaces for review thread data and the raw GraphQL query/mutation strings. These are pure data definitions with no runtime dependencies beyond types.

- [x] 2.0 Complete review thread data layer
  - [x] 2.1 Write 3-4 focused tests for the response transformer
    - Test transforming a well-formed GraphQL response into `ReviewThread[]`
    - Test that `replyTo.id` is correctly mapped to `replyToId` on `ThreadComment`
    - Test that `null` author (ghost/deleted user) is handled gracefully
    - Test empty `reviewThreads.nodes` returns an empty array
  - [x] 2.2 Create review thread types in `packages/core/src/types/review-thread.ts`
    - `ReviewThread` interface: `id`, `isResolved`, `isOutdated`, `path`, `line`, `diffSide: "LEFT" | "RIGHT"`, `comments: ThreadComment[]`
    - `ThreadComment` interface: `id`, `body`, `createdAt`, `author: { login: string; avatarUrl: string }`, `replyToId: string | null`
    - `PullRequestDetail` interface: `title`, `url`, `state`, `reviewThreads: ReviewThread[]`
    - Keep these as plain interfaces (no classes), consistent with existing types in `packages/core/src/types/notification.ts`
  - [x] 2.3 Export new types from `packages/core/src/types/index.ts`
    - Add `export * from "./review-thread";`
  - [x] 2.4 Create GraphQL query and mutation string constants in `packages/core/src/services/review-thread-queries.ts`
    - `PR_REVIEW_THREADS_QUERY` -- the query from the spec for fetching `pullRequest.reviewThreads`
    - `REPLY_TO_THREAD_MUTATION` -- the mutation from the spec for `addPullRequestReviewComment`
    - Export as named constants (plain strings, no tagged template dependency)
  - [x] 2.5 Create the response transformer function in `packages/core/src/services/review-thread-queries.ts`
    - `transformReviewThreadsResponse(data: unknown): PullRequestDetail` -- maps raw GraphQL JSON to typed interfaces
    - Handles `null` author by providing a fallback `{ login: "ghost", avatarUrl: "" }`
    - Maps `replyTo.id` to flat `replyToId` field
  - [x] 2.6 Ensure data layer tests pass
    - Run ONLY the 3-4 tests written in 2.1
    - Verify transformer correctly maps GraphQL shapes to app types

**Acceptance Criteria:**
- `ReviewThread`, `ThreadComment`, and `PullRequestDetail` types are exported from `@github-notifications/core`
- GraphQL query and mutation strings match the spec
- Transformer function correctly maps raw API responses to typed interfaces
- The 3-4 tests from 2.1 pass

---

### Service Layer

#### Task Group 3: Review Thread Service
**Dependencies:** Task Groups 1 and 2

This group creates the service that orchestrates fetching review threads and replying to them, combining the GraphQL client with the query definitions and transformer.

- [x] 3.0 Complete review thread service
  - [x] 3.1 Write 4-5 focused tests for `ReviewThreadService`
    - Test `fetchThreads` returns `Result<PullRequestDetail>` on success with correctly transformed data
    - Test `fetchThreads` returns auth failure when no token is available
    - Test `fetchThreads` passes correct variables (`owner`, `repo`, `number`) to the GraphQL client
    - Test `replyToThread` returns the new comment on success
    - Test `replyToThread` returns a failure when the mutation fails
  - [x] 3.2 Create `ReviewThreadService` in `packages/core/src/services/review-thread-service.ts`
    - Constructor accepts `GraphQLClient`
    - `fetchThreads(owner: string, repo: string, number: number): Promise<Result<PullRequestDetail>>`
      - Uses `PR_REVIEW_THREADS_QUERY` and the transformer from Task Group 2
      - Returns `Result<PullRequestDetail>` following the same pattern as `NotificationService.fetch()`
    - `replyToThread(threadId: string, body: string): Promise<Result<ThreadComment>>`
      - Uses `REPLY_TO_THREAD_MUTATION`
      - Returns `Result<ThreadComment>`
  - [x] 3.3 Add a helper to extract `owner`, `repo`, and PR `number` from a notification
    - Create `parsePRFromNotification(notification: Notification): { owner: string; repo: string; prNumber: number } | null`
    - Parse from `notification.subject.url` (e.g., `https://api.github.com/repos/owner/repo/pulls/123`)
    - Also parse from `notification.repository.fullName` combined with subject URL
    - Return `null` if the notification is not a PullRequest type or URL cannot be parsed
    - Placed in `packages/raycast/src/utils/parse-notification-url.ts` as a shared utility
    - Also created `packages/raycast/src/utils/diff-hunk.ts` for parsing diff hunk strings
    - Tests in `packages/raycast/src/utils/parse-notification-url.test.ts` and `packages/raycast/src/utils/diff-hunk.test.ts`
  - [x] 3.4 Export `ReviewThreadService` and `parsePrIdentifier` from `packages/core/src/services/index.ts`
  - [x] 3.5 Ensure service layer tests pass
    - Run ONLY the 4-5 tests written in 3.1
    - Verify the service correctly delegates to `GraphQLClient` and transforms responses

**Acceptance Criteria:**
- `ReviewThreadService.fetchThreads()` returns fully typed `PullRequestDetail` via `Result<T>`
- `ReviewThreadService.replyToThread()` posts a reply and returns the new comment
- `parsePRFromNotification` correctly extracts owner/repo/prNumber from notification URLs
- `parseDiffHunk` correctly parses diff hunk text into structured `DiffLine[]`
- The 4-5 tests from 3.1 pass

---

### Raycast UI Layer

#### Task Group 4: Thread Detail View in Raycast
**Dependencies:** Task Group 3

This group builds the Raycast UI components: a detail view showing review threads with code context, resolved/unresolved filtering, and inline reply. It follows the existing Raycast component patterns established in `inbox.tsx`.

- [x] 4.0 Complete Raycast thread detail view
  - [x] 4.1 Write 2-3 focused tests for the `useReviewThreads` hook
    - Test hook returns loading state, then resolved data on success
    - Test hook returns error state when the service call fails
    - Test hook filters threads by resolved/unresolved status correctly
  - [x] 4.2 Create `useReviewThreads` hook in `packages/raycast/src/hooks/useReviewThreads.ts`
    - Accepts `notification: Notification` (or `owner`, `repo`, `number` directly)
    - Instantiates `GraphQLClient` and `ReviewThreadService` using `RaycastAuthProvider` (same pattern as `useNotifications` instantiating `NotificationService`)
    - Uses `parsePrIdentifier` to extract owner/repo/number from the notification
    - Returns `{ threads: ReviewThread[], prDetail: PullRequestDetail | null, isLoading: boolean, error: Failure | null, refresh: () => void, replyToThread: (threadId: string, body: string) => Promise<void> }`
    - Manages filter state for resolved/unresolved threads locally
  - [x] 4.3 Create `ThreadDetailView` component in `packages/raycast/src/views/thread-detail.tsx`
    - Uses Raycast `Detail` view with markdown content
    - Renders PR title and state in the navigation title
    - Renders each `ReviewThread` as a markdown section:
      - File path and line number as heading (`### path/to/file.ts:42`)
      - Diff hunk rendered as a fenced code block (````diff`)
      - Resolution status indicator (resolved/unresolved tag)
      - Each comment: author login, relative timestamp, body (rendered as markdown)
    - Uses Raycast `Detail.Metadata` sidebar for PR metadata (state, thread count, unresolved count)
  - [x] 4.4 Create `ThreadListView` component in `packages/raycast/src/views/thread-list.tsx`
    - Uses Raycast `List` view (consistent with `inbox.tsx` pattern)
    - Each `List.Item` shows: file path, first comment preview, resolved/unresolved status, comment count
    - Selecting a thread item pushes to `ThreadDetailView` via Raycast navigation
    - Dropdown filter for All / Unresolved / Resolved threads
    - Action: "Open in Browser" linking to the PR URL
    - Action: "Refresh" to re-fetch threads
  - [x] 4.5 Add "View Threads" action to the inbox notification list
    - In `packages/raycast/src/inbox.tsx`, add a new `Action.Push` for PR-type notifications
    - Only show for notifications where `notification.subject.type === "PullRequest"`
    - Pushes to `ThreadListView` passing the notification
    - Add keyboard shortcut (e.g., `cmd+t` or `enter` as primary action)
    - Keep "Open in Browser" available but move it to secondary position for PR notifications
  - [x] 4.6 Implement reply-to-thread action (stretch goal)
    - Add "Reply to Thread" action in `ThreadDetailView`
    - Uses Raycast `Action.Push` to a `Form` view with a text area for the reply body
    - On submit, calls `replyToThread` from the hook
    - Shows success/failure toast and refreshes the thread view
    - Skip this task if time-constrained; it can be implemented later
  - [x] 4.7 Ensure UI layer tests pass
    - Run ONLY the 2-3 tests written in 4.1
    - Manually verify the thread list and detail views render correctly in Raycast dev mode

**Acceptance Criteria:**
- Selecting a PR notification in the inbox navigates to a thread list view
- Thread list shows file paths, comment previews, and resolved/unresolved status
- Thread detail view renders code context as diff blocks and full comment threads
- Reply action allows posting a comment (stretch goal)
- The 2-3 tests from 4.1 pass

---

### Integration and Testing

#### Task Group 5: Inbox Navigation to Thread View
**Dependencies:** Task Groups 1-4

- [x] 5.0 Complete inbox-to-thread-view navigation
  - [x] 5.1 Write 2-3 focused tests for navigation integration
    - Test that `parsePRFromNotification` is called for PR-type notifications to determine navigability
    - Test that non-PR notifications do not show the "View Threads" action
    - Test that the thread list view receives the correct `owner`, `repo`, `prNumber` props from a notification
  - [x] 5.2 Add "View Review Threads" action to `packages/raycast/src/inbox.tsx`
    - Add an `Action.Push` in the `ActionPanel` for PR-type notifications
    - Use `parsePRFromNotification` to extract owner/repo/prNumber
    - Only show the action when the notification's subject type is `"PullRequest"`
    - Place it as the second action (after "Open in Browser") with keyboard shortcut `Cmd+T`
    - Push target is the `ThreadListView` component from Task 4.3
  - [x] 5.3 Register thread view command in `packages/raycast/package.json` (if needed)
    - Evaluated: thread view is purely navigated to via `Action.Push` from inbox -- no package.json changes needed
  - [x] 5.4 Ensure navigation tests pass
    - Run ONLY the 2-3 tests written in 5.1

**Acceptance Criteria:**
- PR notifications in the inbox show a "View Review Threads" action with Cmd+T shortcut
- Non-PR notifications do not show the "View Review Threads" action
- Selecting "View Review Threads" pushes to ThreadListView with correct owner/repo/prNumber props
- Navigation tests pass
- TypeScript type checking passes

---

#### Task Group 6: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-5

- [x] 6.0 Review existing tests and fill critical gaps
  - [x] 6.1 Review tests from Task Groups 1-5
    - Review the 3-4 tests from Task 1.1 (GraphQL client)
    - Review the 3-5 tests from Task 2.1 (review thread service)
    - Review the 3-4 tests from Task 3.1 (URL parsing and diff hunk utilities)
    - Review the 2-4 tests from Task 4.1 (useReviewThreads hook)
    - Review the 2-3 tests from Task 5.1 (navigation integration)
  - [x] 6.2 Analyze test coverage gaps for the thread view feature
    - Identify critical end-to-end workflows that lack coverage
    - Focus ONLY on gaps related to this spec's requirements
    - Do NOT assess entire application test coverage
    - Prioritize: full flow from notification -> thread list -> thread detail -> reply
  - [x] 6.3 Write up to 10 additional strategic tests maximum
    - Potential gaps to address:
      - GraphQL client handles GraphQL-level errors (partial data with `errors` array)
      - `ReviewThreadService` handles pagination edge case (more than 50 threads)
      - Thread list sorting (unresolved before resolved)
      - Diff hunk rendering with various diff formats (multiline adds, removes, mixed)
      - Reply mutation error handling (network failure, auth expiry mid-session)
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases that are not business-critical
  - [x] 6.4 Run all feature-specific tests
    - Run ONLY tests related to the thread view feature
    - Expected total: approximately 23-30 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All tests from Task Groups 1-5 still pass
- Strategic gap-filling tests cover critical paths: 401/429 handling, partial GraphQL errors, reply failure, thread sorting, diff hunk edge cases
- Total test count is 37 (within the acceptable range for the feature)
- TypeScript type checking passes for both packages/core and packages/raycast

---

## Execution Order

Recommended implementation sequence:

```
1. Task Group 1: GraphQL Client Setup
   Foundation -- every other group depends on this.

2. Task Group 2: Review Thread Types and Query Definitions
   Pure types and string constants -- no runtime dependencies beyond Group 1.

3. Task Group 3: Review Thread Service
   Combines client + types into a usable service layer.

4. Task Group 4: Thread Detail View in Raycast
   Builds the UI on top of the service layer.

5. Task Group 5: Inbox Navigation to Thread View
   Final integration connecting inbox to thread views.

6. Task Group 6: Test Review and Gap Analysis
   Review all tests and fill critical coverage gaps.
```

## Key Files Created or Modified

### New Files
| File | Purpose |
|------|---------|
| `packages/core/src/services/graphql-client.ts` | Generic GraphQL client using native fetch |
| `packages/core/src/types/review-thread.ts` | `ReviewThread`, `ThreadComment`, `PullRequestDetail` types |
| `packages/core/src/services/review-thread-queries.ts` | GraphQL query/mutation strings and response transformer |
| `packages/core/src/services/review-thread-service.ts` | Service orchestrating thread fetch and reply |
| `packages/raycast/src/utils/parse-notification-url.ts` | Extract owner/repo/prNumber from PR notifications |
| `packages/raycast/src/utils/diff-hunk.ts` | Parse diff hunk strings into structured DiffLine arrays |
| `packages/raycast/src/utils/sort-threads.ts` | Sort review threads (unresolved before resolved) |
| `packages/raycast/src/hooks/useReviewThreads.ts` | React hook for thread data in Raycast |
| `packages/raycast/src/views/thread-list.tsx` | List view of review threads for a PR |
| `packages/raycast/src/views/thread-detail.tsx` | Detail view with code context and comments |

### Modified Files
| File | Change |
|------|--------|
| `packages/core/src/types/index.ts` | Add `export * from "./review-thread"` |
| `packages/core/src/services/index.ts` | Add exports for `GraphQLClient`, `ReviewThreadService`, `parsePrIdentifier` |
| `packages/raycast/src/utils/index.ts` | Add exports for `parsePRFromNotification`, `PrIdentifier`, `parseDiffHunk`, `DiffLine`, `sortThreads` |
| `packages/raycast/src/inbox.tsx` | Add "View Review Threads" action for PR notifications |
