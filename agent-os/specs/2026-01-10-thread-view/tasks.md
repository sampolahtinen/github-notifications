# Task Breakdown: Thread View with Code Context

## Overview
Total Tasks: 30
Estimated Task Groups: 5

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

- [ ] 1.0 Complete GraphQL client infrastructure
  - [ ] 1.1 Write 3-4 focused tests for the GraphQL client
    - Test successful query execution returns parsed data
    - Test authentication header is included with the token from `GitHubAuthProvider`
    - Test network/HTTP error returns a proper `Result<T>` failure (using existing `Failure` codes)
    - Test GraphQL-level errors (errors array in response) are mapped to a `Failure`
  - [ ] 1.2 Create the `GraphQLClient` class in `packages/core/src/services/graphql-client.ts`
    - Constructor accepts `GitHubAuthProvider` (reuse existing provider interface)
    - Single `query<T>(query: string, variables: Record<string, unknown>): Promise<Result<T>>` method
    - Single `mutate<T>(mutation: string, variables: Record<string, unknown>): Promise<Result<T>>` method
    - Uses native `fetch` against `https://api.github.com/graphql` (consistent with existing REST approach -- no external GraphQL library)
    - Sets headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
    - Returns `Result<T>` using the existing `ok()` / `err()` helpers from `packages/core/src/result.ts`
    - Maps HTTP errors to existing `Failure` codes (401 -> `authFailure()`, 429 -> `rateLimitFailure()`, network -> `networkFailure()`)
    - Maps GraphQL-level errors (response contains `errors` array) to a `Failure` with code `UPSTREAM`
  - [ ] 1.3 Export `GraphQLClient` from `packages/core/src/services/index.ts`
    - Add `export { GraphQLClient } from "./graphql-client";`
    - Verify it is re-exported from `packages/core/src/index.ts` via the existing barrel export
  - [ ] 1.4 Ensure GraphQL client tests pass
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

- [ ] 2.0 Complete review thread data layer
  - [ ] 2.1 Write 3-4 focused tests for the response transformer
    - Test transforming a well-formed GraphQL response into `ReviewThread[]`
    - Test that `replyTo.id` is correctly mapped to `replyToId` on `ThreadComment`
    - Test that `null` author (ghost/deleted user) is handled gracefully
    - Test empty `reviewThreads.nodes` returns an empty array
  - [ ] 2.2 Create review thread types in `packages/core/src/types/review-thread.ts`
    - `ReviewThread` interface: `id`, `isResolved`, `isOutdated`, `path`, `line`, `diffSide: "LEFT" | "RIGHT"`, `comments: ThreadComment[]`
    - `ThreadComment` interface: `id`, `body`, `createdAt`, `author: { login: string; avatarUrl: string }`, `replyToId: string | null`
    - `PullRequestDetail` interface: `title`, `url`, `state`, `reviewThreads: ReviewThread[]`
    - Keep these as plain interfaces (no classes), consistent with existing types in `packages/core/src/types/notification.ts`
  - [ ] 2.3 Export new types from `packages/core/src/types/index.ts`
    - Add `export * from "./review-thread";`
  - [ ] 2.4 Create GraphQL query and mutation string constants in `packages/core/src/services/review-thread-queries.ts`
    - `PR_REVIEW_THREADS_QUERY` -- the query from the spec for fetching `pullRequest.reviewThreads`
    - `REPLY_TO_THREAD_MUTATION` -- the mutation from the spec for `addPullRequestReviewComment`
    - Export as named constants (plain strings, no tagged template dependency)
  - [ ] 2.5 Create the response transformer function in `packages/core/src/services/review-thread-queries.ts`
    - `transformReviewThreadsResponse(data: unknown): PullRequestDetail` -- maps raw GraphQL JSON to typed interfaces
    - Handles `null` author by providing a fallback `{ login: "ghost", avatarUrl: "" }`
    - Maps `replyTo.id` to flat `replyToId` field
  - [ ] 2.6 Ensure data layer tests pass
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

- [ ] 3.0 Complete review thread service
  - [ ] 3.1 Write 4-5 focused tests for `ReviewThreadService`
    - Test `fetchThreads` returns `Result<PullRequestDetail>` on success with correctly transformed data
    - Test `fetchThreads` returns auth failure when no token is available
    - Test `fetchThreads` passes correct variables (`owner`, `repo`, `number`) to the GraphQL client
    - Test `replyToThread` returns the new comment on success
    - Test `replyToThread` returns a failure when the mutation fails
  - [ ] 3.2 Create `ReviewThreadService` in `packages/core/src/services/review-thread-service.ts`
    - Constructor accepts `GraphQLClient`
    - `fetchThreads(owner: string, repo: string, number: number): Promise<Result<PullRequestDetail>>`
      - Uses `PR_REVIEW_THREADS_QUERY` and the transformer from Task Group 2
      - Returns `Result<PullRequestDetail>` following the same pattern as `NotificationService.fetch()`
    - `replyToThread(threadId: string, body: string): Promise<Result<ThreadComment>>`
      - Uses `REPLY_TO_THREAD_MUTATION`
      - Returns `Result<ThreadComment>`
  - [ ] 3.3 Add a helper to extract `owner`, `repo`, and PR `number` from a notification
    - Create `parsePrIdentifier(notification: Notification): { owner: string; repo: string; number: number } | null`
    - Parse from `notification.subject.url` (e.g., `https://api.github.com/repos/owner/repo/pulls/123`)
    - Also parse from `notification.repository.fullName` combined with subject URL
    - Return `null` if the notification is not a PullRequest type or URL cannot be parsed
    - Place in `packages/core/src/services/review-thread-service.ts` or a shared utility
  - [ ] 3.4 Export `ReviewThreadService` and `parsePrIdentifier` from `packages/core/src/services/index.ts`
  - [ ] 3.5 Ensure service layer tests pass
    - Run ONLY the 4-5 tests written in 3.1
    - Verify the service correctly delegates to `GraphQLClient` and transforms responses

**Acceptance Criteria:**
- `ReviewThreadService.fetchThreads()` returns fully typed `PullRequestDetail` via `Result<T>`
- `ReviewThreadService.replyToThread()` posts a reply and returns the new comment
- `parsePrIdentifier` correctly extracts owner/repo/number from notification URLs
- The 4-5 tests from 3.1 pass

---

### Raycast UI Layer

#### Task Group 4: Thread Detail View in Raycast
**Dependencies:** Task Group 3

This group builds the Raycast UI components: a detail view showing review threads with code context, resolved/unresolved filtering, and inline reply. It follows the existing Raycast component patterns established in `inbox.tsx`.

- [ ] 4.0 Complete Raycast thread detail view
  - [ ] 4.1 Write 2-3 focused tests for the `useReviewThreads` hook
    - Test hook returns loading state, then resolved data on success
    - Test hook returns error state when the service call fails
    - Test hook filters threads by resolved/unresolved status correctly
  - [ ] 4.2 Create `useReviewThreads` hook in `packages/raycast/src/hooks/useReviewThreads.ts`
    - Accepts `notification: Notification` (or `owner`, `repo`, `number` directly)
    - Instantiates `GraphQLClient` and `ReviewThreadService` using `RaycastAuthProvider` (same pattern as `useNotifications` instantiating `NotificationService`)
    - Uses `parsePrIdentifier` to extract owner/repo/number from the notification
    - Returns `{ threads: ReviewThread[], prDetail: PullRequestDetail | null, isLoading: boolean, error: Failure | null, refresh: () => void, replyToThread: (threadId: string, body: string) => Promise<void> }`
    - Manages filter state for resolved/unresolved threads locally
  - [ ] 4.3 Create `ThreadDetailView` component in `packages/raycast/src/components/ThreadDetailView.tsx`
    - Uses Raycast `Detail` view with markdown content
    - Renders PR title and state in the navigation title
    - Renders each `ReviewThread` as a markdown section:
      - File path and line number as heading (`### path/to/file.ts:42`)
      - Diff hunk rendered as a fenced code block (````diff`)
      - Resolution status indicator (resolved/unresolved tag)
      - Each comment: author login, relative timestamp, body (rendered as markdown)
    - Uses Raycast `Detail.Metadata` sidebar for PR metadata (state, thread count, unresolved count)
  - [ ] 4.4 Create `ThreadListView` component in `packages/raycast/src/components/ThreadListView.tsx`
    - Uses Raycast `List` view (consistent with `inbox.tsx` pattern)
    - Each `List.Item` shows: file path, first comment preview, resolved/unresolved status, comment count
    - Selecting a thread item pushes to `ThreadDetailView` via Raycast navigation
    - Dropdown filter for All / Unresolved / Resolved threads
    - Action: "Open in Browser" linking to the PR URL
    - Action: "Refresh" to re-fetch threads
  - [ ] 4.5 Add "View Threads" action to the inbox notification list
    - In `packages/raycast/src/inbox.tsx`, add a new `Action.Push` for PR-type notifications
    - Only show for notifications where `notification.subject.type === "PullRequest"`
    - Pushes to `ThreadListView` passing the notification
    - Add keyboard shortcut (e.g., `cmd+t` or `enter` as primary action)
    - Keep "Open in Browser" available but move it to secondary position for PR notifications
  - [ ] 4.6 Implement reply-to-thread action (stretch goal)
    - Add "Reply to Thread" action in `ThreadDetailView`
    - Uses Raycast `Action.Push` to a `Form` view with a text area for the reply body
    - On submit, calls `replyToThread` from the hook
    - Shows success/failure toast and refreshes the thread view
    - Skip this task if time-constrained; it can be implemented later
  - [ ] 4.7 Ensure UI layer tests pass
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

#### Task Group 5: Integration Verification and Test Gap Analysis
**Dependencies:** Task Groups 1-4

- [ ] 5.0 Verify end-to-end integration and fill critical test gaps
  - [ ] 5.1 Review tests from Task Groups 1-4
    - Review the 3-4 GraphQL client tests (Task 1.1)
    - Review the 3-4 transformer tests (Task 2.1)
    - Review the 4-5 service tests (Task 3.1)
    - Review the 2-3 hook tests (Task 4.1)
    - Total existing tests: approximately 12-16 tests
  - [ ] 5.2 Analyze test coverage gaps for thread view feature only
    - Identify critical user workflows that lack coverage
    - Focus on the end-to-end path: notification -> parse PR identifier -> fetch threads -> render
    - Check that error propagation from GraphQL client through service to UI is tested
    - Do NOT assess coverage of unrelated features (polling, snooze, etc.)
  - [ ] 5.3 Write up to 8 additional integration tests to fill critical gaps
    - Test `parsePrIdentifier` with various URL formats (REST API URL, non-PR notification, malformed URL)
    - Test full flow: `GraphQLClient` -> `ReviewThreadService` -> transformer produces expected `PullRequestDetail`
    - Test that `GraphQLClient` handles rate limit responses with `X-RateLimit-Reset` header
    - Test that the reply mutation correctly sends `threadId` and `body` variables
    - Do NOT write exhaustive edge case tests or UI snapshot tests
  - [ ] 5.4 Run all feature-specific tests
    - Run ONLY tests related to the thread view feature (tests from 1.1, 2.1, 3.1, 4.1, and 5.3)
    - Expected total: approximately 20-24 tests
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass
  - [ ] 5.5 Manual smoke test in Raycast dev mode
    - Open inbox, select a PR notification, verify thread list loads
    - Verify thread detail shows code diff and comments
    - Verify resolved/unresolved filter works
    - Verify error states display correctly (e.g., revoke token temporarily)
  - [ ] 5.6 Run typecheck and format
    - Run `pnpm typecheck` across the monorepo to catch type errors
    - Run `pnpm format` to ensure code style compliance via Biome

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-24 tests total)
- No TypeScript type errors across the monorepo
- Code is formatted per Biome configuration
- End-to-end flow works in Raycast dev mode: inbox -> thread list -> thread detail
- No more than 8 additional tests added in this group

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

5. Task Group 5: Integration Verification and Test Gap Analysis
   Final validation after all pieces are in place.
```

## Key Files Created or Modified

### New Files
| File | Purpose |
|------|---------|
| `packages/core/src/services/graphql-client.ts` | Generic GraphQL client using native fetch |
| `packages/core/src/types/review-thread.ts` | `ReviewThread`, `ThreadComment`, `PullRequestDetail` types |
| `packages/core/src/services/review-thread-queries.ts` | GraphQL query/mutation strings and response transformer |
| `packages/core/src/services/review-thread-service.ts` | Service orchestrating thread fetch and reply |
| `packages/raycast/src/hooks/useReviewThreads.ts` | React hook for thread data in Raycast |
| `packages/raycast/src/components/ThreadListView.tsx` | List view of review threads for a PR |
| `packages/raycast/src/components/ThreadDetailView.tsx` | Detail view with code context and comments |

### Modified Files
| File | Change |
|------|--------|
| `packages/core/src/types/index.ts` | Add `export * from "./review-thread"` |
| `packages/core/src/services/index.ts` | Add exports for `GraphQLClient`, `ReviewThreadService`, `parsePrIdentifier` |
| `packages/raycast/src/inbox.tsx` | Add "View Threads" action for PR notifications |
