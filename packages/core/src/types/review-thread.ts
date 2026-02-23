/**
 * Author information for a review thread comment
 */
export interface ThreadCommentAuthor {
  login: string;
  avatarUrl: string;
}

/**
 * A single comment within a review thread
 */
export interface ThreadComment {
  id: string;
  body: string;
  createdAt: string;
  author: ThreadCommentAuthor;
  replyToId: string | null;
}

/**
 * A review thread on a pull request, containing comments and code context
 */
export interface ReviewThread {
  id: string;
  isResolved: boolean;
  isOutdated: boolean;
  path: string;
  line: number;
  diffSide: "LEFT" | "RIGHT";
  diffHunk: string;
  comments: ThreadComment[];
}

/**
 * Pull request detail including review threads
 */
export interface PullRequestDetail {
  title: string;
  url: string;
  state: string;
  reviewThreads: ReviewThread[];
}
