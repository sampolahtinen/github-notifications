import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GitHubAuthProvider } from "../types";
import { GraphQLClient } from "./graphql-client";
import { ReviewThreadService } from "./review-thread-service";

function createMockAuthProvider(token: string | null = "ghp_test_token"): GitHubAuthProvider {
  return {
    getToken: vi.fn().mockResolvedValue(token),
    validateToken: vi.fn().mockResolvedValue(true),
  };
}

function buildSuccessfulGraphQLResponse() {
  return {
    repository: {
      pullRequest: {
        title: "Add feature",
        url: "https://github.com/owner/repo/pull/7",
        state: "OPEN",
        reviewThreads: {
          nodes: [
            {
              id: "RT_1",
              isResolved: false,
              isOutdated: false,
              path: "src/index.ts",
              line: 25,
              diffSide: "RIGHT",
              comments: {
                nodes: [
                  {
                    id: "C_1",
                    body: "Consider renaming this variable",
                    createdAt: "2025-06-01T10:00:00Z",
                    author: { login: "reviewer", avatarUrl: "https://avatar.url/r" },
                    replyTo: null,
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

describe("ReviewThreadService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetchThreads returns Ok with correctly transformed PullRequestDetail", async () => {
    const responseData = buildSuccessfulGraphQLResponse();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: responseData }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const service = new ReviewThreadService(client);
    const result = await service.fetchThreads("owner", "repo", 7);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Add feature");
      expect(result.value.state).toBe("OPEN");
      expect(result.value.reviewThreads).toHaveLength(1);
      const firstComment = result.value.reviewThreads[0]?.comments[0];
      expect(firstComment?.body).toBe("Consider renaming this variable");
    }
  });

  it("fetchThreads returns AUTH failure when no token is available", async () => {
    const client = new GraphQLClient(createMockAuthProvider(null));
    const service = new ReviewThreadService(client);
    const result = await service.fetchThreads("owner", "repo", 7);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("AUTH");
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetchThreads returns empty reviewThreads for a PR with no threads", async () => {
    const responseData = {
      repository: {
        pullRequest: {
          title: "Chore: bump deps",
          url: "https://github.com/owner/repo/pull/99",
          state: "MERGED",
          reviewThreads: { nodes: [] },
        },
      },
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: responseData }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const service = new ReviewThreadService(client);
    const result = await service.fetchThreads("owner", "repo", 99);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.reviewThreads).toEqual([]);
      expect(result.value.title).toBe("Chore: bump deps");
    }
  });

  it("replyToThread returns the new comment on success", async () => {
    const mutationResponse = {
      addPullRequestReviewComment: {
        comment: {
          id: "C_new",
          body: "Fixed!",
          createdAt: "2025-06-02T12:00:00Z",
          author: { login: "author", avatarUrl: "https://avatar.url/a" },
          replyTo: { id: "C_1" },
        },
      },
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: mutationResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const service = new ReviewThreadService(client);
    const result = await service.replyToThread("RT_1", "Fixed!");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("C_new");
      expect(result.value.body).toBe("Fixed!");
      expect(result.value.replyToId).toBe("C_1");
    }
  });

  it("replyToThread returns a failure when the network request fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    const client = new GraphQLClient(createMockAuthProvider());
    const service = new ReviewThreadService(client);
    const result = await service.replyToThread("RT_1", "My reply");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK");
    }
  });
});
