import { ScrollView, View, Text } from "react-native";
import { IconButton, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "queue" | "general" | "alert";
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Queue Ready",
      message: "Your queue at Zhengxin Chicken Steak is ready. Please proceed to the counter.",
      time: "5 min ago",
      read: false,
      type: "queue",
    },
    {
      id: "2",
      title: "Position Update",
      message: "You are now 3rd in line at Martini Cafe.",
      time: "15 min ago",
      read: false,
      type: "queue",
    },
    {
      id: "3",
      title: "Queue Cancelled",
      message: "Your queue at Thai Restaurant has been cancelled.",
      time: "1 hour ago",
      read: true,
      type: "alert",
    },
    {
      id: "4",
      title: "Welcome to Smart Queue",
      message: "Thank you for using Smart Queue. Start scanning QR codes to join queues!",
      time: "2 days ago",
      read: true,
      type: "general",
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "queue":
        return "clock-outline";
      case "alert":
        return "alert-circle-outline";
      case "general":
        return "information-outline";
      default:
        return "bell-outline";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "queue":
        return "#17a2b8";
      case "alert":
        return "#dc3545";
      case "general":
        return "#6c757d";
      default:
        return "#000";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}

      {/* Notifications List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {notifications.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <IconButton
              icon="bell-outline"
              size={64}
              iconColor="#d1d5db"
              style={{ margin: 0 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: "#9ca3af",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No notifications yet
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              style={{
                marginBottom: 12,
                backgroundColor: notification.read ? "#ffffff" : "#f0f9ff",
                borderWidth: 1,
                borderColor: notification.read ? "#e5e7eb" : "#bfdbfe",
              }}
              onPress={() => markAsRead(notification.id)}
            >
              <Card.Content>
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  {/* Icon */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${getNotificationColor(notification.type)}20`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <IconButton
                      icon={getNotificationIcon(notification.type)}
                      size={20}
                      iconColor={getNotificationColor(notification.type)}
                      style={{ margin: 0, padding: 0 }}
                    />
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: notification.read ? "500" : "700",
                          color: "#111827",
                        }}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#17a2b8",
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6b7280",
                        lineHeight: 20,
                        marginBottom: 8,
                      }}
                    >
                      {notification.message}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                      }}
                    >
                      {notification.time}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
