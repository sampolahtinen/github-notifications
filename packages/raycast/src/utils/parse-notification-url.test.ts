import { describe, expect, it } from "vitest";
import type { Notification } from "@github-notifications/core";
import { parsePRFromNotification } from "./parse-notification-url";

function buildNotification(
  overrides: Partial<{
    subjectType: Notification["subject"]["type"];
    subjectUrl: string;
    fullName: string;
  }> = {},
): Notification {
  return {
    id: "1",
    unread: true,
    reason: "review_requested",
    updatedAt: "2025-01-01T00:00:00Z",
    subject: {
      type: overrides.subjectType ?? "PullRequest",
      title: "Fix auth bug",
      url: overrides.subjectUrl ?? "https://api.github.com/repos/owner/repo/pulls/123",
      latestCommentUrl: null,
    },
    repository: {
      id: 1,
      fullName: overrides.fullName ?? "owner/repo",
      private: false,
      owner: { login: "owner", avatarUrl: "https://avatar.url/owner" },
    },
  };
}

describe("parsePRFromNotification", () => {
  it("extracts owner, repo, and prNumber from a valid PR notification", () => {
    const notification = buildNotification();
    const result = parsePRFromNotification(notification);

    expect(result).toEqual({ owner: "owner", repo: "repo", prNumber: 123 });
  });

  it("returns null for non-PullRequest notification types", () => {
    const issueNotification = buildNotification({
      subjectType: "Issue",
      subjectUrl: "https://api.github.com/repos/owner/repo/issues/456",
    });
    expect(parsePRFromNotification(issueNotification)).toBeNull();

    const releaseNotification = buildNotification({
      subjectType: "Release",
      subjectUrl: "https://api.github.com/repos/owner/repo/releases/789",
    });
    expect(parsePRFromNotification(releaseNotification)).toBeNull();
  });

  it("returns null when the subject URL does not match the expected PR pattern", () => {
    const notification = buildNotification({
      subjectUrl: "https://api.github.com/repos/owner/repo/issues/42",
    });
    expect(parsePRFromNotification(notification)).toBeNull();
  });

  it("returns null when the repository fullName is malformed", () => {
    const notification = buildNotification({ fullName: "no-slash-here" });
    expect(parsePRFromNotification(notification)).toBeNull();
  });
});
