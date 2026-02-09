import { View, Text } from "react-native";
import { Card, Button, IconButton, Chip } from "react-native-paper";

interface Queue {
  id: string;
  restaurantName: string;
  queueNumber?: string;
  partySize?: number;
  queueType?: string;
  position?: number;
  totalPeople?: number;
  estimatedWait: string;
  joinedAt: string;
  status: "active" | "ready" | "expired";
  phone?: string;
  notes?: string;
}

interface QueueCardProps {
  queue: Queue;
  onViewLive: () => void;
  onCancel: () => void;
  onImHere?: () => void;
  showActions?: boolean;
}

export default function QueueCard({ 
  queue, 
  onViewLive, 
  onCancel, 
  onImHere,
  showActions = true 
}: QueueCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#17a2b8";
      case "ready":
        return "#28a745";
      case "expired":
        return "#6c757d";
      default:
        return "#000";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "In Queue";
      case "ready":
        return "Ready";
      case "expired":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <Card
      style={{
        marginBottom: 16,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      <Card.Content>
        {/* Restaurant Name & Status */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827", flex: 1 }}>
            {queue.restaurantName}
          </Text>
          <Chip
            style={{
              backgroundColor: `${getStatusColor(queue.status)}20`,
            }}
            textStyle={{
              color: getStatusColor(queue.status),
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {getStatusText(queue.status)}
          </Chip>
        </View>

        {/* Queue Info */}
        {queue.status !== "expired" && (
          <View style={{ marginBottom: 16 }}>
            {/* Queue Number */}
            {queue.queueNumber && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <IconButton
                  icon="ticket"
                  size={18}
                  iconColor="#6b7280"
                  style={{ margin: 0, padding: 0 }}
                />
                <Text style={{ fontSize: 14, color: "#6b7280", marginLeft: 4 }}>
                  Queue Number: {queue.queueNumber}
                </Text>
              </View>
            )}

            {/* Party Size */}
            {queue.partySize && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <IconButton
                  icon="account-group"
                  size={18}
                  iconColor="#6b7280"
                  style={{ margin: 0, padding: 0 }}
                />
                <Text style={{ fontSize: 14, color: "#6b7280", marginLeft: 4 }}>
                  Party Size: {queue.partySize} {queue.partySize === 1 ? 'person' : 'people'}
                </Text>
              </View>
            )}

            {/* Position (for old queues) */}
            {!queue.queueNumber && queue.position !== undefined && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <IconButton
                  icon="account-group"
                  size={18}
                  iconColor="#6b7280"
                  style={{ margin: 0, padding: 0 }}
                />
                <Text style={{ fontSize: 14, color: "#6b7280", marginLeft: 4 }}>
                  Position: {queue.position} of {queue.totalPeople}
                </Text>
              </View>
            )}

            {/* Estimated Wait */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <IconButton
                icon="clock-outline"
                size={18}
                iconColor="#6b7280"
                style={{ margin: 0, padding: 0 }}
              />
              <Text style={{ fontSize: 14, color: "#6b7280", marginLeft: 4 }}>
                Estimated wait: {queue.estimatedWait}
              </Text>
            </View>

            {/* Joined At */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon="calendar"
                size={18}
                iconColor="#6b7280"
                style={{ margin: 0, padding: 0 }}
              />
              <Text style={{ fontSize: 14, color: "#6b7280", marginLeft: 4 }}>
                Joined at: {queue.joinedAt}
              </Text>
            </View>
          </View>
        )}

        {queue.status === "expired" && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>
              Completed on {queue.joinedAt}
            </Text>
          </View>
        )}

        {/* Actions */}
        {showActions && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Button
              mode="contained"
              onPress={onViewLive}
              style={{
                flex: 1,
                backgroundColor: "#17a2b8",
                borderRadius: 20,
              }}
            >
              View Live
            </Button>
            {queue.status === "ready" ? (
              <Button
                mode="contained"
                onPress={onImHere}
                style={{
                  flex: 1,
                  backgroundColor: "#28a745",
                  borderRadius: 20,
                }}
              >
                I'm Here
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={onCancel}
                style={{
                  flex: 1,
                  borderColor: "#dc3545",
                  borderRadius: 20,
                }}
                textColor="#dc3545"
              >
                Cancel
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}
