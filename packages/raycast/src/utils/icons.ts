import { Icon, Color } from "@raycast/api";
import type { NotificationReason } from "@github-notifications/core";

interface IconMapping {
  icon: Icon;
  color: Color;
}

/**
 * Map notification reasons to Raycast icons and colors
 */
export function getReasonIcon(reason: NotificationReason): IconMapping {
  switch (reason) {
    case "review_requested":
      return { icon: Icon.Code, color: Color.Blue };
    case "mention":
      return { icon: Icon.AtSymbol, color: Color.Purple };
    case "assign":
      return { icon: Icon.Person, color: Color.Green };
    case "comment":
      return { icon: Icon.Bubble, color: Color.SecondaryText };
    case "author":
      return { icon: Icon.Pencil, color: Color.Orange };
    case "state_change":
      return { icon: Icon.CircleProgress, color: Color.Yellow };
    case "subscribed":
      return { icon: Icon.Bell, color: Color.PrimaryText };
    default:
      return { icon: Icon.Bell, color: Color.PrimaryText };
  }
}

/**
 * Get human-readable label for notification reason
 */
export function getReasonLabel(reason: NotificationReason): string {
  switch (reason) {
    case "review_requested":
      return "Review Requested";
    case "mention":
      return "Mentioned";
    case "assign":
      return "Assigned";
    case "comment":
      return "Comment";
    case "author":
      return "Author";
    case "state_change":
      return "State Change";
    case "subscribed":
      return "Subscribed";
    default:
      return reason;
  }
}
