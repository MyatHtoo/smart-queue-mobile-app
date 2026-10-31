import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import { deleteNotification, getCustomerQueues, getNotifications, markAllNotificationsRead, markNotificationRead, savePushToken } from "../services/api";
import { BASE_URL } from "../services/api";
import { getQueueId, getQueueNumber, getQueueStatus } from "../utils/LiveQueue";
import { useUser } from "./UserContext";

// Expo Go does not provide the native notification channel manager on Android.
// Keep in-app notifications available there and enable native alerts in builds.
const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient" ||
  (__DEV__ && Constants.appOwnership !== "standalone");
const NativeNotifications: typeof import("expo-notifications") | null =
  isExpoGo ? null : require("expo-notifications");

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
const enabledKey = (id: string) => `smart-queue:notifications-enabled:${id}`;
const notificationChannelForType = (type?: string) =>
  type === "QUEUE_READY" || type === "QR_SCANNED" ? "queue-ready" : "queue-updates";
const listKey = (id: string) => `@smart_queue_notifications:${id}`;
const clearedKey = (id: string) => `@smart_queue_cleared_notifications:${id}`;
const snapshotKey = (id: string) => `@smart_queue_notification_snapshot:${id}`;
const queueItems = (response: any): any[] => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : Array.isArray(data?.queues) ? data.queues : Array.isArray(data?.data) ? data.data : [];
};
const notificationItems = (response: any): any[] => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
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
  const socketRef = useRef<Socket | null>(null);

  const persist = useCallback(async (items: AppNotification[]) => {
    if (!customerId) return;
    setNotifications(items);
    await AsyncStorage.setItem(listKey(customerId), JSON.stringify(items.slice(0, 100)));
    await NativeNotifications?.setBadgeCountAsync(items.filter((item) => !item.read).length).catch(() => false);
  }, [customerId]);

  useEffect(() => {
    if (!customerId || !token) { setNotifications([]); return; }
    AsyncStorage.getItem(listKey(customerId)).then((value) => setNotifications(value ? JSON.parse(value) : [])).catch(() => setNotifications([]));
    if (Platform.OS === "android" && NativeNotifications) {
      void Promise.all([
        NativeNotifications.setNotificationChannelAsync("queue-ready", {
          name: "Queue ready",
          importance: NativeNotifications.AndroidImportance.MAX,
          sound: "default",
          vibrationPattern: [0, 400, 200, 400],
          lightColor: "#16A34A",
        }),
        NativeNotifications.setNotificationChannelAsync("queue-updates", {
          name: "Queue updates",
          importance: NativeNotifications.AndroidImportance.HIGH,
          sound: "default",
          vibrationPattern: [0, 250, 150, 250],
          lightColor: "#1E7A9B",
        }),
      ]).catch((error) => {
        console.warn("Notification channel setup failed", error);
      });
    }
  }, [customerId, token]);

  useEffect(() => {
    if (!customerId || !token) return;
    const socket = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("joinCustomerRoom", customerId);
    });
    socket.on("queueAlert", (payload: {
      id?: string;
      type?: string;
      title?: string;
      message?: string;
      queue_id?: string;
      queueId?: string;
      createdAt?: string;
    }) => {
      const item: AppNotification = {
        id: String(payload.id ?? `${Date.now()}`),
        title: payload.title ?? "Queue update",
        message: payload.message ?? "",
        type: payload.type === "QUEUE_READY" || payload.type === "QR_SCANNED"
          ? "ready"
          : payload.type === "QUEUE_CANCELLED" ? "alert" : "queue",
        createdAt: payload.createdAt ?? new Date().toISOString(),
        read: false,
        queueId: payload.queueId ?? payload.queue_id,
      };
      void AsyncStorage.getItem(listKey(customerId)).then((value) => {
        const existing: AppNotification[] = value ? JSON.parse(value) : [];
        if (!existing.some((current) => current.id === item.id)) {
          void persist([item, ...existing]);
        }
      });
    });
    socket.on("connect_error", (error) => {
      console.warn("Real-time notification connection failed", error.message);
    });
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [customerId, persist, token]);

  useEffect(() => {
    if (!customerId || !token || !NativeNotifications) return;
    void (async () => {
      try {
        const permission = await NativeNotifications.getPermissionsAsync();
        const finalPermission = permission.granted ? permission : await NativeNotifications.requestPermissionsAsync();
        if (!finalPermission.granted) return;
        const result = await NativeNotifications.getDevicePushTokenAsync();
        await savePushToken(result.data);
      } catch (error) { console.warn("Push token registration failed", error); }
    })();
  }, [customerId, token]);

  useEffect(() => {
    if (!customerId || !token || !NativeNotifications) return;
    const subscription = NativeNotifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content;
      const data = content.data as { id?: string; queueId?: string; queue_id?: string; type?: string } | undefined;
      const item: AppNotification = {
        id: String(data?.id ?? `${Date.now()}`),
        title: content.title ?? "Queue update",
        message: content.body ?? "",
        type: data?.type === "QUEUE_READY" || data?.type === "QR_SCANNED" ? "ready" : data?.type === "QUEUE_CANCELLED" ? "alert" : "queue",
        createdAt: new Date().toISOString(),
        read: false,
        queueId: data?.queueId ?? data?.queue_id,
      };
      void AsyncStorage.getItem(listKey(customerId)).then((value) => {
        const existing: AppNotification[] = value ? JSON.parse(value) : [];
        if (!existing.some((current) => current.id === item.id)) void persist([item, ...existing]);
      });
    });
    return () => subscription.remove();
  }, [customerId, persist, token]);

  const notify = useCallback(async (item: AppNotification) => {
    if (!NativeNotifications) return;
    const enabled = await AsyncStorage.getItem(enabledKey(customerId));
    if (enabled === "false") return;
    const permission = await NativeNotifications.getPermissionsAsync();
    const finalPermission = permission.granted ? permission : await NativeNotifications.requestPermissionsAsync();
    if (!finalPermission.granted) return;
    await NativeNotifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.message,
        data: { queueId: item.queueId },
        sound: "default",
        priority: "high",
        ...(Platform.OS === "android" ? { channelId: notificationChannelForType(item.type) } : {}),
      },
      trigger: null,
    });
  }, [customerId]);

  const refresh = useCallback(async () => {
    if (!customerId || !token || running.current) return;
    running.current = true; setRefreshing(true);
    try {
      try {
        const serverResponse: any = await getNotifications();
        const serverItems = notificationItems(serverResponse);
        if (serverItems.length || serverResponse?.data !== undefined) {
          serverNotificationsAvailable.current = true;
          const stored = await AsyncStorage.getItem(listKey(customerId));
          const storedItems: AppNotification[] = stored ? JSON.parse(stored) : [];
          const storedById = new Map(storedItems.map((item) => [item.id, item]));
          const cleared = new Set(JSON.parse(await AsyncStorage.getItem(clearedKey(customerId)) || "[]"));
          const mappedServer: AppNotification[] = serverItems
            .map((item: any): AppNotification => ({
              id: String(item._id ?? item.id),
              title: item.title,
              message: item.message,
              type: item.type === "QUEUE_READY" || item.type === "QR_SCANNED" ? "ready" : item.type === "QUEUE_CANCELLED" ? "alert" : "queue",
              createdAt: item.createdAt ?? new Date().toISOString(),
              // Keep an optimistic local read until the server confirms it.
              read: Boolean(item.isRead ?? item.read ?? item.readAt) || Boolean(storedById.get(String(item._id ?? item.id))?.read),
              queueId: item.queue_id?._id ?? item.queue_id,
            }))
            .filter((item) => !cleared.has(item.id));
          await persist(mappedServer);
        }
      } catch (error) {
        serverNotificationsAvailable.current = false;
        console.warn("Notification fetch failed", error);
      }
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
    if (serverNotificationsAvailable.current) {
      try {
        await markNotificationRead(id);
      } catch (error) {
        console.warn("Notification read update failed", error);
      }
    }
    await persist(notifications.map((item) => item.id === id ? { ...item, read: true } : item));
  };
  const markAllAsRead = async () => {
    if (serverNotificationsAvailable.current) {
      try {
        await markAllNotificationsRead();
      } catch (error) {
        console.warn("Mark-all notifications update failed", error);
      }
    }
    await persist(notifications.map((item) => ({ ...item, read: true })));
  };
  const clearAll = async () => {
    const ids = notifications.map((item) => item.id);
    if (serverNotificationsAvailable.current) {
      await Promise.all(ids.map((id) => deleteNotification(id).catch((error) => {
        console.warn("Notification delete failed", error);
      })));
    }
    const storedCleared = JSON.parse(await AsyncStorage.getItem(clearedKey(customerId)) || "[]");
    await AsyncStorage.setItem(clearedKey(customerId), JSON.stringify([...new Set([...storedCleared, ...ids])].slice(-500)));
    await persist([]);
  };
  return <NotificationContext.Provider value={{ notifications, unreadCount: notifications.filter((item) => !item.read).length, refreshing, refresh, markAsRead, markAllAsRead, clearAll }}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const value = useContext(NotificationContext);
  if (!value) throw new Error("useNotifications must be used inside NotificationProvider");
  return value;
};
