import { describe, expect, it } from "vitest";
import { transformReplyResponse, transformReviewThreadsResponse } from "./review-thread-queries";

function buildGraphQLResponse(threadOverrides?: Record<string, unknown>[]) {
  return {
    repository: {
      pullRequest: {
        title: "Fix auth bug",
        url: "https://github.com/owner/repo/pull/42",
        state: "OPEN",
        reviewThreads: {
          nodes:
            threadOverrides ?? [
              {
                id: "RT_1",
                isResolved: false,
                isOutdated: false,
                path: "src/auth.ts",
                line: 10,
                diffSide: "RIGHT",
                comments: {
                  nodes: [
                    {
                      id: "C_1",
                      body: "This needs a null check",
                      createdAt: "2025-01-01T00:00:00Z",
                      author: { login: "reviewer1", avatarUrl: "https://avatar.url/1" },
                      replyTo: null,
                    },
                    {
                      id: "C_2",
                      body: "Good point, fixed.",
                      createdAt: "2025-01-01T01:00:00Z",
                      author: { login: "author1", avatarUrl: "https://avatar.url/2" },
                      replyTo: { id: "C_1" },
                    },
                  ],
                },
              },
            ],
        },
      },
    },
  };
}

describe("transformReviewThreadsResponse", () => {
  it("transforms a well-formed GraphQL response into PullRequestDetail with ReviewThread[]", () => {
    const data = buildGraphQLResponse();
    const result = transformReviewThreadsResponse(data);

    expect(result.title).toBe("Fix auth bug");
    expect(result.url).toBe("https://github.com/owner/repo/pull/42");
    expect(result.state).toBe("OPEN");
    expect(result.reviewThreads).toHaveLength(1);

    const thread = result.reviewThreads[0];
    expect(thread).toBeDefined();
    expect(thread?.id).toBe("RT_1");
    expect(thread?.isResolved).toBe(false);
    expect(thread?.path).toBe("src/auth.ts");
    expect(thread?.line).toBe(10);
    expect(thread?.diffSide).toBe("RIGHT");
    expect(thread?.comments).toHaveLength(2);
  });

  it("maps replyTo.id to flat replyToId on ThreadComment", () => {
    const data = buildGraphQLResponse();
    const result = transformReviewThreadsResponse(data);

    const comments = result.reviewThreads[0]?.comments;
    expect(comments).toBeDefined();
    expect(comments?.[0]?.replyToId).toBeNull();
    expect(comments?.[1]?.replyToId).toBe("C_1");
  });

  it("handles null author by providing a ghost fallback", () => {
    const data = buildGraphQLResponse([
      {
        id: "RT_ghost",
        isResolved: false,
        isOutdated: false,
        path: "src/deleted.ts",
        line: 5,
        diffSide: "LEFT",
        comments: {
          nodes: [
            {
              id: "C_ghost",
              body: "Comment by deleted user",
              createdAt: "2025-01-01T00:00:00Z",
              author: null,
              replyTo: null,
            },
          ],
        },
      },
    ]);

    const result = transformReviewThreadsResponse(data);
    const comment = result.reviewThreads[0]?.comments[0];
    if (!comment) {
      throw new Error("Expected comment to be defined");
    }

    expect(comment.author.login).toBe("ghost");
    expect(comment.author.avatarUrl).toBe("");
  });

  it("returns an empty array when reviewThreads.nodes is empty", () => {
    const data = buildGraphQLResponse([]);
    const result = transformReviewThreadsResponse(data);

    expect(result.reviewThreads).toEqual([]);
    expect(result.title).toBe("Fix auth bug");
  });
});

describe("transformReplyResponse", () => {
  it("transforms a reply mutation response into a ThreadComment", () => {
    const data = {
      addPullRequestReviewComment: {
        comment: {
          id: "C_new",
          body: "Looks good now",
          createdAt: "2025-01-02T00:00:00Z",
          author: { login: "reviewer1", avatarUrl: "https://avatar.url/1" },
          replyTo: { id: "C_1" },
        },
      },
    };

    const result = transformReplyResponse(data);

    expect(result.id).toBe("C_new");
    expect(result.body).toBe("Looks good now");
    expect(result.author.login).toBe("reviewer1");
    expect(result.replyToId).toBe("C_1");
  });
});
