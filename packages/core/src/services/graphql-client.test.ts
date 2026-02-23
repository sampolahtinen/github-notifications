import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GitHubAuthProvider } from "../types";
import { GraphQLClient } from "./graphql-client";

function createMockAuthProvider(token: string | null = "ghp_test_token"): GitHubAuthProvider {
  return {
    getToken: vi.fn().mockResolvedValue(token),
    validateToken: vi.fn().mockResolvedValue(true),
  };
}

describe("GraphQLClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns Ok with parsed data on a successful query", async () => {
    const responseData = { repository: { name: "test-repo" } };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: responseData }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const result = await client.query<{ repository: { name: string } }>(
      "query { repository { name } }",
      { owner: "test" },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(responseData);
    }
  });

  it("returns Err with AUTH failure when no token is available", async () => {
    const client = new GraphQLClient(createMockAuthProvider(null));
    const result = await client.query("query { viewer { login } }");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("AUTH");
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns Err with NETWORK failure on fetch error", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    const client = new GraphQLClient(createMockAuthProvider());
    const result = await client.query("query { viewer { login } }");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK");
    }
  });

  it("maps non-200 HTTP status to appropriate Failure via failureFromStatus", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("Internal Server Error", { status: 500 }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const result = await client.query("query { viewer { login } }");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UPSTREAM");
      expect(result.error.message).toContain("500");
    }
  });

  it("maps GraphQL-level errors to UPSTREAM Failure", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: null,
          errors: [{ message: "Field 'foo' not found" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const result = await client.query("query { foo }");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UPSTREAM");
      expect(result.error.message).toContain("Field 'foo' not found");
    }
  });

  it("returns AUTH failure for HTTP 401 status", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("Unauthorized", { status: 401 }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const result = await client.query("query { viewer { login } }");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("AUTH");
      expect(result.error.message).toContain("Invalid GitHub token");
    }
  });

  it("returns RATE_LIMIT failure for HTTP 429 status", async () => {
    const resetTimestamp = Math.floor(Date.now() / 1000) + 3600;
    vi.mocked(fetch).mockResolvedValue(
      new Response("Too Many Requests", {
        status: 429,
        headers: { "X-RateLimit-Reset": String(resetTimestamp) },
      }),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const result = await client.query("query { viewer { login } }");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RATE_LIMIT");
      expect(result.error.message).toContain("Rate limited");
    }
  });

  it("treats partial data with GraphQL errors as a failure", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { viewer: { login: "partial" } },
          errors: [{ message: "Could not resolve field 'email'" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new GraphQLClient(createMockAuthProvider());
    const result = await client.query("query { viewer { login email } }");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UPSTREAM");
      expect(result.error.message).toContain("Could not resolve field 'email'");
    }
  });
});
