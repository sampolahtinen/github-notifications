import type { ReviewThread } from "@github-notifications/core";

/**
 * Sort review threads so that unresolved threads appear before resolved threads.
 * Preserves original order within each group.
 */
export function sortThreads(threads: ReviewThread[]): ReviewThread[] {
  return [...threads].sort((a, b) => {
    if (a.isResolved !== b.isResolved) {
      return a.isResolved ? 1 : -1;
    }
    return 0;
  });
}
