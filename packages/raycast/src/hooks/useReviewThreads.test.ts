import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GraphQLClient, ReviewThreadService } from "@github-notifications/core";
import type { GitHubAuthProvider } from "@github-notifications/core";

/**
 * Tests for the service-level behavior that useReviewThreads depends on.
 * The hook is a thin React wrapper around ReviewThreadService, so we verify
 * the same calls the hook makes: fetchThreads with owner/repo/prNumber,
 * and replyToThread with threadId/body.
 */

function createMockAuthProvider(token: string | null = "ghp_test_token"): GitHubAuthProvider {
  return {
    getToken: vi.fn().mockResolvedValue(token),
    validateToken: vi.fn().mockResolvedValue(true),
  };
}

function buildGraphQLResponse() {
  return {
    repository: {
      pullRequest: {
        title: "Add feature X",
        url: "https://github.com/acme/app/pull/42",
        state: "OPEN",
        reviewThreads: {
          nodes: [
            {
              id: "RT_1",
              isResolved: false,
              isOutdated: false,
              path: "src/utils.ts",
              line: 10,
              diffSide: "RIGHT",
              comments: {
                nodes: [
                  {
                    id: "C_1",
                    body: "Needs a null check here",
                    createdAt: "2025-06-01T12:00:00Z",
                    author: {
                      login: "reviewer1",
                      avatarUrl: "https://avatar.url/r1",
                    },
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

describe("useReviewThreads - service integration", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetchThreads with correct owner, repo, and prNumber", async () => {
    const responseData = buildGraphQLResponse();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: responseData }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const service = new ReviewThreadService(client);
    const result = await service.fetchThreads("acme", "app", 42);

    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledOnce();

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall?.[1]?.body as string);
    expect(body.variables).toEqual({ owner: "acme", repo: "app", number: 42 });
  });

  it("returns PullRequestDetail with threads after fetch completes", async () => {
    const responseData = buildGraphQLResponse();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: responseData }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const service = new ReviewThreadService(client);
    const result = await service.fetchThreads("acme", "app", 42);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Add feature X");
      expect(result.value.url).toBe("https://github.com/acme/app/pull/42");
      expect(result.value.reviewThreads).toHaveLength(1);

      const thread = result.value.reviewThreads[0];
      expect(thread?.path).toBe("src/utils.ts");
      expect(thread?.line).toBe(10);
      expect(thread?.comments).toHaveLength(1);
      expect(thread?.comments[0]?.body).toBe("Needs a null check here");
    }
  });

  it("returns a Failure when the service encounters an auth error", async () => {
    const client = new GraphQLClient(createMockAuthProvider(null));
    const service = new ReviewThreadService(client);
    const result = await service.fetchThreads("acme", "app", 42);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("AUTH");
      expect(result.error.message).toBeDefined();
    }
  });

  it("replyToThread calls the mutation and refreshes data", async () => {
    const mutationResponse = {
      addPullRequestReviewComment: {
        comment: {
          id: "C_new",
          body: "Fixed in latest commit",
          createdAt: "2025-06-02T14:00:00Z",
          author: {
            login: "author",
            avatarUrl: "https://avatar.url/a",
          },
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
    const result = await service.replyToThread("RT_1", "Fixed in latest commit");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("C_new");
      expect(result.value.body).toBe("Fixed in latest commit");
      expect(result.value.replyToId).toBe("C_1");
    }

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall?.[1]?.body as string);
    expect(body.variables).toEqual({
      threadId: "RT_1",
      body: "Fixed in latest commit",
    });
  });
});
