import type { Notification } from "@github-notifications/core";

/**
 * Extracted PR identifier from a notification
 */
export interface PrIdentifier {
  owner: string;
  repo: string;
  prNumber: number;
}

/**
 * Extract owner, repo, and PR number from a PullRequest notification.
 * Returns null if the notification is not a PullRequest or the URL cannot be parsed.
 */
export function parsePRFromNotification(notification: Notification): PrIdentifier | null {
  if (notification.subject.type !== "PullRequest") {
    return null;
  }

  const [owner, repo] = notification.repository.fullName.split("/");
  if (!owner || !repo) {
    return null;
  }

  const prNumberMatch = /\/pulls\/(\d+)$/.exec(notification.subject.url);
  if (!prNumberMatch?.[1]) {
    return null;
  }

  return {
    owner,
    repo,
    prNumber: Number(prNumberMatch[1]),
  };
}
