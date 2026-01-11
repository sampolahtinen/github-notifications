/**
 * Notification reason types from GitHub API
 */
export type NotificationReason =
  | "review_requested"
  | "mention"
  | "assign"
  | "comment"
  | "author"
  | "state_change"
  | "subscribed";

/**
 * Subject types for GitHub notifications
 */
export type SubjectType = "PullRequest" | "Issue" | "Release" | "Discussion" | "Commit";

/**
 * Repository owner information
 */
export interface RepositoryOwner {
  login: string;
  avatarUrl: string;
}

/**
 * Repository information attached to a notification
 */
export interface NotificationRepository {
  id: number;
  fullName: string;
  private: boolean;
  owner: RepositoryOwner;
}

/**
 * Subject of a notification (PR, Issue, etc.)
 */
export interface NotificationSubject {
  type: SubjectType;
  title: string;
  url: string;
  latestCommentUrl: string | null;
}

/**
 * Core notification interface matching GitHub API structure
 */
export interface Notification {
  id: string;
  unread: boolean;
  reason: NotificationReason;
  updatedAt: string;
  subject: NotificationSubject;
  repository: NotificationRepository;
}
