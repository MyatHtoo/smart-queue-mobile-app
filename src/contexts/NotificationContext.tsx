import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { deleteNotification, getCustomerQueues, getNotifications, markAllNotificationsRead, markNotificationRead, savePushToken } from "../services/api";
import { getQueueId, getQueueNumber, getQueueStatus } from "../utils/LiveQueue";
import { useUser } from "./UserContext";

// SDK 53+ intentionally disables expo-notifications inside Expo Go on Android.
// Keep the complete in-app experience there and enable native alerts in builds.
const NativeNotifications: typeof import("expo-notifications") | null =
  Constants.executionEnvironment === "storeClient" ? null : require("expo-notifications");

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: "queue" | "ready" | "alert" | "general";
  createdAt: string;
  read: boolean;
  queueId?: string;
};

type QueueSnapshot = Record<string, { status: string; position: number; shopName: string; queueNumber: number }>;
type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  refreshing: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
const enabledKey = "smart-queue:notifications-enabled";
export const notificationChannelForType = (type?: string) =>
  type === "QUEUE_READY" || type === "QR_SCANNED" ? "queue-ready" : "queue-updates";
const listKey = (id: string) => `@smart_queue_notifications:${id}`;
const readOverridesKey = (id: string) => `@smart_queue_notification_read_overrides:${id}`;
const snapshotKey = (id: string) => `@smart_queue_notification_snapshot:${id}`;
const queueItems = (response: any): any[] => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : Array.isArray(data?.queues) ? data.queues : Array.isArray(data?.data) ? data.data : [];
};
const shopNameOf = (queue: any) => queue?.shop_id?.name ?? queue?.shopId?.name ?? queue?.shop?.name ?? queue?.shopName ?? "the shop";
const positionOf = (queue: any) => Number(queue?.position ?? queue?.queuePosition ?? queue?.peopleAhead ?? 0);
const finishedStatuses = new Set(["completed", "cancelled", "canceled", "expired", "served", "done"]);

NativeNotifications?.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }),
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { userData, token } = useUser();
  const customerId = String(userData.id ?? "");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const running = useRef(false);
  const serverNotificationsAvailable = useRef(false);

  const persist = useCallback(async (items: AppNotification[]) => {
    if (!customerId) return;
    setNotifications(items);
    await AsyncStorage.setItem(listKey(customerId), JSON.stringify(items.slice(0, 100)));
    await NativeNotifications?.setBadgeCountAsync(items.filter((item) => !item.read).length).catch(() => false);
  }, [customerId]);

  useEffect(() => {
    if (!customerId || !token) { setNotifications([]); return; }
    AsyncStorage.getItem(listKey(customerId)).then((value) => setNotifications(value ? JSON.parse(value) : [])).catch(() => setNotifications([]));
    if (Platform.OS === "android" && NativeNotifications) void Promise.all([
      NativeNotifications.setNotificationChannelAsync("queue-ready", { name: "Queue ready", importance: NativeNotifications.AndroidImportance.MAX, sound: "default", vibrationPattern: [0, 400, 200, 400], lightColor: "#16A34A" }),
      NativeNotifications.setNotificationChannelAsync("queue-updates", { name: "Queue updates", importance: NativeNotifications.AndroidImportance.HIGH, sound: "default", vibrationPattern: [0, 250, 150, 250], lightColor: "#1E7A9B" }),
    ]);
  }, [customerId, token]);

  useEffect(() => {
    if (!customerId || !token || !NativeNotifications) return;
    void (async () => {
      try {
        const permission = await NativeNotifications.getPermissionsAsync();
        const finalPermission = permission.granted ? permission : await NativeNotifications.requestPermissionsAsync();
        if (!finalPermission.granted) return;
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) { console.warn("EAS projectId is required to register remote push notifications"); return; }
        const result = await NativeNotifications.getExpoPushTokenAsync({ projectId });
        await savePushToken(result.data);
      } catch (error) { console.warn("Push token registration failed", error); }
    })();
  }, [customerId, token]);

  const notify = useCallback(async (item: AppNotification) => {
    if (!NativeNotifications) return;
    const enabled = await AsyncStorage.getItem(enabledKey);
    if (enabled === "false") return;
    const permission = await NativeNotifications.getPermissionsAsync();
    const finalPermission = permission.granted ? permission : await NativeNotifications.requestPermissionsAsync();
    if (!finalPermission.granted) return;
    await NativeNotifications.scheduleNotificationAsync({ content: { title: item.title, body: item.message, data: { queueId: item.queueId }, sound: "default", priority: "high", ...(Platform.OS === "android" ? { channelId: notificationChannelForType(item.type) } : {}) }, trigger: null });
  }, []);

  const refresh = useCallback(async () => {
    if (!customerId || !token || running.current) return;
    running.current = true; setRefreshing(true);
    try {
      try {
        const serverResponse: any = await getNotifications();
        const serverItems = serverResponse?.data ?? [];
        if (Array.isArray(serverItems)) {
          serverNotificationsAvailable.current = true;
          const [storedValue, overridesValue] = await Promise.all([
            AsyncStorage.getItem(listKey(customerId)),
            AsyncStorage.getItem(readOverridesKey(customerId)),
          ]);
          const stored: AppNotification[] = storedValue ? JSON.parse(storedValue) : [];
          const overrides: Record<string, boolean> = overridesValue ? JSON.parse(overridesValue) : {};
          const locallyRead = new Set(stored.filter((item) => item.read).map((item) => item.id));
          const mappedServer: AppNotification[] = serverItems.map((item: any) => {
            const id = String(item._id ?? item.id);
            return {
              id,
              title: item.title,
              message: item.message,
              type: item.type === "QUEUE_READY" || item.type === "QR_SCANNED" ? "ready" : item.type === "QUEUE_CANCELLED" ? "alert" : "queue",
              createdAt: item.createdAt ?? new Date().toISOString(),
              read: Boolean(item.isRead) || Boolean(overrides[id]) || locallyRead.has(id),
              queueId: item.queue_id?._id ?? item.queue_id,
            };
          });
          await persist(mappedServer);
        }
      } catch { serverNotificationsAvailable.current = false; }
      const response = await getCustomerQueues(customerId);
      const queues = queueItems(response);
      const current: QueueSnapshot = {};
      queues.forEach((queue) => {
        const id = getQueueId(queue); if (!id) return;
        current[id] = { status: getQueueStatus(queue), position: positionOf(queue), shopName: shopNameOf(queue), queueNumber: getQueueNumber(queue) };
      });
      const rawPrevious = await AsyncStorage.getItem(snapshotKey(customerId));
      const previous: QueueSnapshot | null = rawPrevious ? JSON.parse(rawPrevious) : null;
      const created: AppNotification[] = [];
      if (previous) Object.entries(current).forEach(([queueId, next]) => {
        const before = previous[queueId]; if (!before) return;
        let title = ""; let message = ""; let type: AppNotification["type"] = "queue";
        if (next.status !== before.status) {
          if (["ready", "ready to seat", "called", "notified"].includes(next.status)) { title = "It’s your turn"; message = `Queue ${next.queueNumber || ""} at ${next.shopName} is ready. Please proceed to the counter.`; type = "ready"; }
          else if (["qr scanned", "checked in", "checkedin", "arrived"].includes(next.status)) { title = "Check-in confirmed"; message = `Your QR was scanned at ${next.shopName}. Please wait to be seated.`; type = "ready"; }
          else if (["seated", "serving", "in service"].includes(next.status)) { title = "You’re seated"; message = `Your queue at ${next.shopName} is seated. Enjoy your visit.`; type = "queue"; }
          else if (finishedStatuses.has(next.status)) { title = next.status.includes("cancel") ? "Queue cancelled" : "Queue completed"; message = `Your queue at ${next.shopName} is now ${next.status}.`; type = next.status.includes("cancel") ? "alert" : "queue"; }
          else { title = "Queue status updated"; message = `Queue ${next.queueNumber || ""} at ${next.shopName} is now ${next.status}.`; }
        } else if (next.position > 0 && next.position !== before.position) {
          title = next.position === 1 ? "You’re next" : "Queue position updated";
          message = next.position === 1 ? `Please get ready. You’re next at ${next.shopName}.` : `You are now number ${next.position} in line at ${next.shopName}.`;
          type = next.position === 1 ? "ready" : "queue";
        }
        if (title) created.push({ id: `${queueId}:${Date.now()}:${created.length}`, title, message, type, createdAt: new Date().toISOString(), read: false, queueId });
      });
      await AsyncStorage.setItem(snapshotKey(customerId), JSON.stringify(current));
      if (created.length && !serverNotificationsAvailable.current) {
        const stored = await AsyncStorage.getItem(listKey(customerId));
        const existing: AppNotification[] = stored ? JSON.parse(stored) : [];
        await persist([...created, ...existing]);
        await Promise.all(created.map(notify));
      }
    } catch (error) { console.warn("Notification sync failed", error); }
    finally { running.current = false; setRefreshing(false); }
  }, [customerId, notify, persist, token]);

  useEffect(() => {
    if (!customerId || !token) return;
    void refresh();
    const timer = setInterval(() => { if (AppState.currentState === "active") void refresh(); }, 15000);
    const subscription = AppState.addEventListener("change", (state) => { if (state === "active") void refresh(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [customerId, refresh, token]);

  const markAsRead = async (id: string) => {
    if (serverNotificationsAvailable.current) await markNotificationRead(id).catch(() => undefined);
    const rawOverrides = await AsyncStorage.getItem(readOverridesKey(customerId));
    const overrides: Record<string, boolean> = rawOverrides ? JSON.parse(rawOverrides) : {};
    overrides[id] = true;
    await AsyncStorage.setItem(readOverridesKey(customerId), JSON.stringify(overrides));
    await persist(notifications.map((item) => item.id === id ? { ...item, read: true } : item));
  };
  const markAllAsRead = async () => {
    if (serverNotificationsAvailable.current) await markAllNotificationsRead().catch(() => undefined);
    const overrides: Record<string, boolean> = {};
    notifications.forEach((item) => { overrides[item.id] = true; });
    await AsyncStorage.setItem(readOverridesKey(customerId), JSON.stringify(overrides));
    await persist(notifications.map((item) => ({ ...item, read: true })));
  };
  const clearAll = async () => {
    if (serverNotificationsAvailable.current) await Promise.all(notifications.map((item) => deleteNotification(item.id).catch(() => undefined)));
    await AsyncStorage.removeItem(readOverridesKey(customerId));
    await persist([]);
  };
  return <NotificationContext.Provider value={{ notifications, unreadCount: notifications.filter((item) => !item.read).length, refreshing, refresh, markAsRead, markAllAsRead, clearAll }}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const value = useContext(NotificationContext);
  if (!value) throw new Error("useNotifications must be used inside NotificationProvider");
  return value;
};
