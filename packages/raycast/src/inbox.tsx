import { List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.EmptyView
        icon="🎉"
        title="No notifications"
        description="You're all caught up!"
      />
    </List>
  );
}
