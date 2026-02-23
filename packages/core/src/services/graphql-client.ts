import {
  type Failure,
  type Result,
  authFailure,
  err,
  failureFromStatus,
  networkFailure,
  ok,
  rateLimitFailure,
} from "../result";
import type { GitHubAuthProvider } from "../types";

const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const LOG_PREFIX = "core.graphql_client";

/**
 * Generic GraphQL client for the GitHub GraphQL API.
 * Uses native fetch and the existing Result/Failure error handling pattern.
 */
export class GraphQLClient {
  constructor(private authProvider: GitHubAuthProvider) {}

  /**
   * Execute a GraphQL query
   */
  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<Result<T>> {
    return this.execute<T>(query, variables);
  }

  /**
   * Execute a GraphQL mutation
   */
  async mutate<T>(mutation: string, variables: Record<string, unknown> = {}): Promise<Result<T>> {
    return this.execute<T>(mutation, variables);
  }

  /**
   * Shared execution logic for queries and mutations
   */
  private async execute<T>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<Result<T>> {
    const token = await this.authProvider.getToken();
    if (!token) {
      console.error(`${LOG_PREFIX}.execute: no token configured`);
      return err(authFailure());
    }

    let response: Response;
    try {
      response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch (cause) {
      console.error(`${LOG_PREFIX}.execute: network error`, cause);
      return err(networkFailure(cause));
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.error(`${LOG_PREFIX}.execute: invalid token (401)`);
        return err(authFailure("Invalid GitHub token"));
      }
      if (response.status === 429) {
        const rateLimitReset = response.headers.get("X-RateLimit-Reset");
        const resetAt = rateLimitReset
          ? new Date(Number(rateLimitReset) * 1000).toISOString()
          : undefined;
        console.error(`${LOG_PREFIX}.execute: rate limited (429)`, { resetAt });
        return err(rateLimitFailure(resetAt));
      }
      console.error(`${LOG_PREFIX}.execute: API error`, { status: response.status });
      return err(failureFromStatus(response.status, `GitHub GraphQL API error: ${response.status}`));
    }

    const body = await response.json();

    if (body.errors && body.errors.length > 0) {
      const message = body.errors.map((e: { message: string }) => e.message).join("; ");
      console.error(`${LOG_PREFIX}.execute: GraphQL errors`, { errors: body.errors });
      return err({
        code: "UPSTREAM",
        message: `GraphQL error: ${message}`,
      } as Failure);
    }

    return ok(body.data as T);
  }
}
