import { describe, expect, it } from "vitest";
import type { Notification, ReviewThread } from "@github-notifications/core";
import { parsePRFromNotification } from "./parse-notification-url";
import { sortThreads } from "./sort-threads";

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
      url: overrides.subjectUrl ?? "https://api.github.com/repos/acme/web-app/pulls/42",
      latestCommentUrl: null,
    },
    repository: {
      id: 1,
      fullName: overrides.fullName ?? "acme/web-app",
      private: false,
      owner: { login: "acme", avatarUrl: "https://avatar.url/acme" },
    },
  };
}

function buildThread(overrides: Partial<ReviewThread>): ReviewThread {
  return {
    id: "RT_default",
    isResolved: false,
    isOutdated: false,
    path: "src/file.ts",
    line: 1,
    diffSide: "RIGHT",
    diffHunk: "",
    comments: [],
    ...overrides,
  };
}

describe("Inbox navigation to thread view", () => {
  it("determines a PR notification is navigable via parsePRFromNotification", () => {
    const notification = buildNotification();
    const result = parsePRFromNotification(notification);

    expect(result).not.toBeNull();
  });

  it("determines non-PR notifications are not navigable", () => {
    const issueNotification = buildNotification({
      subjectType: "Issue",
      subjectUrl: "https://api.github.com/repos/acme/web-app/issues/10",
    });
    expect(parsePRFromNotification(issueNotification)).toBeNull();

    const releaseNotification = buildNotification({
      subjectType: "Release",
      subjectUrl: "https://api.github.com/repos/acme/web-app/releases/1",
    });
    expect(parsePRFromNotification(releaseNotification)).toBeNull();

    const discussionNotification = buildNotification({
      subjectType: "Discussion",
      subjectUrl: "https://api.github.com/repos/acme/web-app/discussions/5",
    });
    expect(parsePRFromNotification(discussionNotification)).toBeNull();
  });

  it("extracts correct owner, repo, and prNumber props for ThreadListView", () => {
    const notification = buildNotification({
      fullName: "my-org/my-repo",
      subjectUrl: "https://api.github.com/repos/my-org/my-repo/pulls/99",
    });
    const result = parsePRFromNotification(notification);

    expect(result).toEqual({
      owner: "my-org",
      repo: "my-repo",
      prNumber: 99,
    });
  });
});

describe("sortThreads", () => {
  it("places unresolved threads before resolved threads", () => {
    const resolved = buildThread({ id: "RT_resolved", isResolved: true });
    const unresolved = buildThread({ id: "RT_unresolved", isResolved: false });
    const anotherUnresolved = buildThread({ id: "RT_unresolved2", isResolved: false });

    const sorted = sortThreads([resolved, unresolved, anotherUnresolved]);

    expect(sorted[0]?.id).toBe("RT_unresolved");
    expect(sorted[1]?.id).toBe("RT_unresolved2");
    expect(sorted[2]?.id).toBe("RT_resolved");
  });

  it("preserves original order within the same resolved status group", () => {
    const a = buildThread({ id: "RT_a", isResolved: false });
    const b = buildThread({ id: "RT_b", isResolved: false });
    const c = buildThread({ id: "RT_c", isResolved: true });
    const d = buildThread({ id: "RT_d", isResolved: true });

    const sorted = sortThreads([a, b, c, d]);

    expect(sorted.map((t) => t.id)).toEqual(["RT_a", "RT_b", "RT_c", "RT_d"]);
  });

  it("returns an empty array when given an empty input", () => {
    expect(sortThreads([])).toEqual([]);
  });
});
