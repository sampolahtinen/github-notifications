import { LocalStorage } from "@raycast/api";

const LISTENING_STATE_KEY = "github-notifications-listening";

export interface ListeningState {
  isListening: boolean;
  startedAt: string | null;
}

const DEFAULT_STATE: ListeningState = {
  isListening: false,
  startedAt: null,
};

/**
 * Get the current listening state from storage
 */
export async function getListeningState(): Promise<ListeningState> {
  const raw = await LocalStorage.getItem<string>(LISTENING_STATE_KEY);
  if (!raw) return { ...DEFAULT_STATE };

  try {
    return JSON.parse(raw) as ListeningState;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/**
 * Set the listening state in storage
 */
export async function setListeningState(state: ListeningState): Promise<void> {
  await LocalStorage.setItem(LISTENING_STATE_KEY, JSON.stringify(state));
}

/**
 * Mark listening as started
 */
export async function markListeningStarted(): Promise<void> {
  await setListeningState({
    isListening: true,
    startedAt: new Date().toISOString(),
  });
}

/**
 * Mark listening as stopped
 */
export async function markListeningStopped(): Promise<void> {
  await setListeningState({
    isListening: false,
    startedAt: null,
  });
}
