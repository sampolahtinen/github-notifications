import { useState, useEffect, useCallback, useMemo } from "react";
import { showToast, Toast } from "@raycast/api";
import {
  NotificationService,
  type Notification,
  type NotificationReason,
  type Failure,
} from "@github-notifications/core";
import { RaycastAuthProvider, RaycastStorageAdapter } from "../adapters";

interface UseNotificationsResult {
  notifications: Notification[];
  allNotifications: Notification[];
  isLoading: boolean;
  error: Failure | null;
  refresh: () => Promise<void>;
  markAsDone: (id: string) => Promise<void>;
  filterReason: NotificationReason | "all";
  setFilterReason: (reason: NotificationReason | "all") => void;
  filterRepository: string;
  setFilterRepository: (repositoryId: string) => void;
  showReadNotifications: boolean;
  toggleShowReadNotifications: () => void;
  lastUpdated: Date | null;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Failure | null>(null);
  const [filterReason, setFilterReason] = useState<NotificationReason | "all">(
    "all"
  );
  const [filterRepository, setFilterRepository] = useState<string | "all">(
    "all"
  );
  const [showReadNotifications, setShowReadNotifications] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const service = useMemo(() => {
    const authProvider = new RaycastAuthProvider();
    const storageAdapter = new RaycastStorageAdapter();
    return new NotificationService(authProvider, storageAdapter);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await service.fetch({
      includeRead: showReadNotifications,
    });

    if (result.ok) {
      setNotifications(result.value);
      setLastUpdated(new Date());

      const state = await service.getState();
      state.notifications = result.value;
      state.lastFetchedAt = new Date().toISOString();
      await service.saveState(state);
    } else {
      setError(result.error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch notifications",
        message: result.error.message,
      });
    }

    setIsLoading(false);
  }, [service, showReadNotifications]);

  const markAsDone = useCallback(
    async (id: string) => {
      const result = await service.markAsDone(id);

      if (result.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        await showToast({
          style: Toast.Style.Success,
          title: "Marked as done",
        });
      } else {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to mark as done",
          message: result.error.message,
        });
      }
    },
    [service]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    const matchesReason = filterReason === "all" || n.reason === filterReason;
    const matchesRepo =
      filterRepository === "all" ||
      n.repository.id === Number(filterRepository);
    return matchesReason && matchesRepo;
  });

  const toggleShowReadNotifications = useCallback(() => {
    setShowReadNotifications((prev) => !prev);
  }, []);

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsDone,
    filterReason,
    setFilterReason,
    filterRepository,
    setFilterRepository,
    showReadNotifications,
    toggleShowReadNotifications,
    lastUpdated,
  };
}
