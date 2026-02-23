import type { Result } from "../result";
import type { PullRequestDetail, ThreadComment } from "../types";
import type { GraphQLClient } from "./graphql-client";
import {
  PR_REVIEW_THREADS_QUERY,
  REPLY_TO_THREAD_MUTATION,
  transformReplyResponse,
  transformReviewThreadsResponse,
} from "./review-thread-queries";

/**
 * Service for fetching PR review threads and replying to them via the GitHub GraphQL API
 */
export class ReviewThreadService {
  constructor(private client: GraphQLClient) {}

  /**
   * Fetch review threads for a pull request
   */
  async fetchThreads(
    owner: string,
    repo: string,
    number: number,
  ): Promise<Result<PullRequestDetail>> {
    const result = await this.client.query<unknown>(PR_REVIEW_THREADS_QUERY, {
      owner,
      repo,
      number,
    });

    if (!result.ok) {
      return result;
    }

    return { ok: true, value: transformReviewThreadsResponse(result.value) };
  }

  /**
   * Reply to an existing review thread
   */
  async replyToThread(threadId: string, body: string): Promise<Result<ThreadComment>> {
    const result = await this.client.mutate<unknown>(REPLY_TO_THREAD_MUTATION, {
      threadId,
      body,
    });

    if (!result.ok) {
      return result;
    }

    return { ok: true, value: transformReplyResponse(result.value) };
  }
}
