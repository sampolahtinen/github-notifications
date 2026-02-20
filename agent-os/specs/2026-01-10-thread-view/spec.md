# Specification: Thread View with Code Context

## Goal

Display full PR review comment threads with the code snippet being discussed, enabling users to understand and respond to review comments without leaving Raycast.

## Status

🚧 **Planned** — Depends on Raycast MVP Group 12 (GraphQL Client Setup).

## API Strategy

Uses **GitHub GraphQL API** for all content fetching. The GraphQL API provides:
- `pullRequest.reviewThreads` — threads already grouped (no client-side reconstruction needed)
- `isResolved` — thread resolution status (not available via REST)
- `comments` connection — full thread with author, body, timestamps
- `addPullRequestReviewComment` mutation — reply to threads directly
- Batching — one query can fetch all threads for a PR

REST API is only used upstream for notification polling (`GET /notifications`) which tells us *something happened*. GraphQL handles everything from "show me the details" onward.

## User Stories

- As a developer, I want to see the code snippet being discussed so that I understand the context of review comments
- As a developer, I want to see the full comment thread so that I can follow the conversation
- As a developer, I want to see which threads are resolved vs. unresolved so I know what still needs attention
- As a developer, I want to reply to comments directly so that I can respond quickly

## High-Level Requirements

- Fetch full review thread data via GitHub GraphQL API (`pullRequest.reviewThreads`)
- Display diff hunk with syntax highlighting (from thread `diffHunk` field)
- Show comment thread with author, timestamps, and resolved status
- Support replying to threads via `addPullRequestReviewComment` mutation (stretch)

## GraphQL Queries

### Fetch Review Threads for a PR

```graphql
query PRReviewThreads($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      title
      url
      state
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          diffSide
          comments(first: 20) {
            nodes {
              id
              body
              createdAt
              author {
                login
                avatarUrl
              }
              replyTo {
                id
              }
            }
          }
        }
      }
    }
  }
}
```

### Reply to a Review Thread

```graphql
mutation ReplyToThread($threadId: ID!, $body: String!) {
  addPullRequestReviewComment(input: {
    pullRequestReviewThreadId: $threadId
    body: $body
  }) {
    comment {
      id
      body
      createdAt
    }
  }
}
```

## Data Models

```typescript
interface ReviewThread {
  id: string;
  isResolved: boolean;
  isOutdated: boolean;
  path: string;
  line: number;
  diffSide: "LEFT" | "RIGHT";
  comments: ThreadComment[];
}

interface ThreadComment {
  id: string;
  body: string;
  createdAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  replyToId: string | null;
}
```

## See Also

- Raycast MVP spec (Stretch Goal section) for UI layout mockups
- Raycast MVP tasks Group 12 for GraphQL client setup
