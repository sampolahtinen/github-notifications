import type { PullRequestDetail, ReviewThread, ThreadComment } from "../types";

/**
 * GraphQL query for fetching PR review threads with comments and code context
 */
export const PR_REVIEW_THREADS_QUERY = `
  query PRReviewThreads($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        title
        url
        state
        reviewThreads(first: 100) {
          nodes {
            id
            isResolved
            isOutdated
            path
            line
            diffSide
            comments(first: 100) {
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
`;

/**
 * GraphQL mutation for replying to a review thread
 */
export const REPLY_TO_THREAD_MUTATION = `
  mutation ReplyToThread($threadId: ID!, $body: String!) {
    addPullRequestReviewComment(input: { pullRequestReviewThreadId: $threadId, body: $body }) {
      comment {
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
`;

const GHOST_AUTHOR = { login: "ghost", avatarUrl: "" };

/**
 * Transform a raw GraphQL response into the typed PullRequestDetail shape
 */
export function transformReviewThreadsResponse(data: unknown): PullRequestDetail {
  const raw = data as {
    repository: {
      pullRequest: {
        title: string;
        url: string;
        state: string;
        reviewThreads: {
          nodes: Array<{
            id: string;
            isResolved: boolean;
            isOutdated: boolean;
            path: string;
            line: number;
            diffSide: "LEFT" | "RIGHT";
            comments: {
              nodes: Array<{
                id: string;
                body: string;
                createdAt: string;
                author: { login: string; avatarUrl: string } | null;
                replyTo: { id: string } | null;
              }>;
            };
          }>;
        };
      };
    };
  };

  const pr = raw.repository.pullRequest;

  const reviewThreads: ReviewThread[] = (pr.reviewThreads.nodes ?? []).map((thread) => ({
    id: thread.id,
    isResolved: thread.isResolved,
    isOutdated: thread.isOutdated,
    path: thread.path,
    line: thread.line,
    diffSide: thread.diffSide,
    diffHunk: "",
    comments: (thread.comments.nodes ?? []).map(
      (comment): ThreadComment => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        author: comment.author ?? GHOST_AUTHOR,
        replyToId: comment.replyTo?.id ?? null,
      }),
    ),
  }));

  return {
    title: pr.title,
    url: pr.url,
    state: pr.state,
    reviewThreads,
  };
}

/**
 * Transform a raw reply mutation response into a ThreadComment
 */
export function transformReplyResponse(data: unknown): ThreadComment {
  const raw = data as {
    addPullRequestReviewComment: {
      comment: {
        id: string;
        body: string;
        createdAt: string;
        author: { login: string; avatarUrl: string } | null;
        replyTo: { id: string } | null;
      };
    };
  };

  const comment = raw.addPullRequestReviewComment.comment;

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    author: comment.author ?? GHOST_AUTHOR,
    replyToId: comment.replyTo?.id ?? null,
  };
}
