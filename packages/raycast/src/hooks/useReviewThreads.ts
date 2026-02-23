import { useState, useEffect, useCallback, useMemo } from "react";
import { showToast, Toast } from "@raycast/api";
import {
  GraphQLClient,
  ReviewThreadService,
  type PullRequestDetail,
  type Failure,
} from "@github-notifications/core";
import { RaycastAuthProvider } from "../adapters";

interface UseReviewThreadsParams {
  owner: string;
  repo: string;
  prNumber: number;
}

interface UseReviewThreadsResult {
  prDetail: PullRequestDetail | null;
  isLoading: boolean;
  error: Failure | null;
  refresh: () => void;
  replyToThread: (threadId: string, body: string) => Promise<void>;
}

export function useReviewThreads({
  owner,
  repo,
  prNumber,
}: UseReviewThreadsParams): UseReviewThreadsResult {
  const [prDetail, setPrDetail] = useState<PullRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Failure | null>(null);

  const service = useMemo(() => {
    const authProvider = new RaycastAuthProvider();
    const client = new GraphQLClient(authProvider);
    return new ReviewThreadService(client);
  }, []);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await service.fetchThreads(owner, repo, prNumber);

    if (result.ok) {
      setPrDetail(result.value);
    } else {
      setError(result.error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch review threads",
        message: result.error.message,
      });
    }

    setIsLoading(false);
  }, [service, owner, repo, prNumber]);

  const replyToThread = useCallback(
    async (threadId: string, body: string) => {
      const result = await service.replyToThread(threadId, body);

      if (result.ok) {
        await showToast({
          style: Toast.Style.Success,
          title: "Reply posted",
        });
        await fetchThreads();
      } else {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to post reply",
          message: result.error.message,
        });
      }
    },
    [service, fetchThreads],
  );

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    prDetail,
    isLoading,
    error,
    refresh: fetchThreads,
    replyToThread,
  };
}
