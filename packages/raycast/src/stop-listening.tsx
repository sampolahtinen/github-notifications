import { showToast, Toast } from "@raycast/api";
import { markListeningStopped } from "./services/polling-state";

/**
 * "Stop Listening" command: stops background polling by
 * updating the listening state in storage. The inbox command
 * checks this state and stops its polling timer accordingly.
 */
export default async function Command() {
  await markListeningStopped();

  await showToast({
    style: Toast.Style.Success,
    title: "Stopped listening",
    message: "Background polling has been stopped",
  });
}
