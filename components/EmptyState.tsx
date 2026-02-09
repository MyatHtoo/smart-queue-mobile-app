import { View, Text } from "react-native";
import { Button, IconButton } from "react-native-paper";

interface EmptyStateProps {
  activeTab: "active" | "history";
  onScanQRCode: () => void;
}

export default function EmptyState({ activeTab, onScanQRCode }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 64 }}>
      <IconButton
        icon="clock-outline"
        size={64}
        iconColor="#d1d5db"
        style={{ margin: 0 }}
      />
      <Text style={{ fontSize: 16, color: "#9ca3af", marginTop: 16, textAlign: "center" }}>
        {activeTab === "active" ? "No active queues" : "No queue history"}
      </Text>
      {activeTab === "active" && (
        <Button
          mode="contained"
          onPress={onScanQRCode}
          style={{
            marginTop: 20,
            backgroundColor: "#17a2b8",
            borderRadius: 20,
          }}
        >
          Scan QR Code
        </Button>
      )}
    </View>
  );
}
