import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScreenHeader } from "../../components/common/ScreenUI";
import { AppNotification, useNotifications } from "../../src/contexts/NotificationContext";
import { cardShadow, colors, radius } from "../../src/themes/design";

const relativeTime = (value: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};
const appearance = (type: AppNotification["type"]) => type === "ready"
  ? { icon: "megaphone" as const, color: colors.success, background: colors.successSoft }
  : type === "alert" ? { icon: "alert-circle" as const, color: colors.danger, background: "#FEF2F2" }
  : type === "general" ? { icon: "information-circle" as const, color: colors.textMuted, background: "#F1F5F9" }
  : { icon: "time" as const, color: colors.primary, background: colors.primarySoft };

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { notifications, unreadCount, refreshing, refresh, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const open = async (notification: AppNotification) => {
    await markAsRead(notification.id);
    if (notification.queueId) navigation.navigate("MainTabs", { screen: "MyQueues" });
  };
  const confirmClear = () => Alert.alert("Clear notifications?", "This removes all notifications from this device.", [{ text: "Keep", style: "cancel" }, { text: "Clear", style: "destructive", onPress: clearAll }]);
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScreenHeader title="Notifications" subtitle={unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You’re all caught up"} onBack={() => navigation.goBack()} right={<TouchableOpacity disabled={!unreadCount} onPress={markAllAsRead} style={{ paddingVertical: 8, paddingLeft: 10 }}><Text style={{ color: unreadCount ? colors.primary : colors.disabled, fontSize: 12, fontWeight: "800" }}>Read all</Text></TouchableOpacity>} />
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />} contentContainerStyle={{ padding: 16, paddingBottom: 36, flexGrow: 1 }}>
      {notifications.length === 0 ? <View style={{ flex: 1, minHeight: 500, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }}><View style={{ width: 82, height: 82, borderRadius: 41, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}><Ionicons name="notifications-outline" size={38} color={colors.primary} /></View><Text style={{ color: colors.text, fontSize: 19, fontWeight: "900", marginTop: 18 }}>No updates yet</Text><Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: 7 }}>Queue position, ready-to-serve and cancellation alerts will appear here.</Text><TouchableOpacity onPress={refresh} style={{ marginTop: 18, paddingHorizontal: 20, height: 44, borderRadius: radius.pill, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center" }}><Ionicons name="refresh" size={17} color="#FFFFFF" /><Text style={{ color: "#FFFFFF", fontWeight: "800", marginLeft: 7 }}>Check for updates</Text></TouchableOpacity></View>
      : <>{notifications.map((item) => { const style = appearance(item.type); return <TouchableOpacity key={item.id} onPress={() => open(item)} activeOpacity={0.78} style={{ padding: 15, marginBottom: 10, borderRadius: radius.medium, backgroundColor: item.read ? colors.surface : "#F4FBFD", borderWidth: 1, borderColor: item.read ? colors.border : "#B8DAE4", flexDirection: "row", ...cardShadow }}><View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: style.background, alignItems: "center", justifyContent: "center" }}><Ionicons name={style.icon} size={22} color={style.color} /></View><View style={{ flex: 1, marginLeft: 12 }}><View style={{ flexDirection: "row", alignItems: "center" }}><Text numberOfLines={1} style={{ flex: 1, color: colors.text, fontSize: 15, fontWeight: item.read ? "700" : "900" }}>{item.title}</Text>{!item.read && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.danger, marginLeft: 8 }} />}</View><Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{item.message}</Text><Text style={{ color: style.color, fontSize: 10, fontWeight: "700", marginTop: 7 }}>{relativeTime(item.createdAt)}</Text></View></TouchableOpacity>; })}<TouchableOpacity onPress={confirmClear} style={{ alignSelf: "center", padding: 12 }}><Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700" }}>Clear all notifications</Text></TouchableOpacity></>}
    </ScrollView>
  </View>;
}
