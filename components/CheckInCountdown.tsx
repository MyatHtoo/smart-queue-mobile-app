import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/themes/design";

export default function CheckInCountdown({ deadline }: { deadline?: string }) {
  const getRemaining = () => Math.max(0, new Date(deadline ?? 0).getTime() - Date.now());
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    setRemaining(getRemaining());
    const timer = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) return null;
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const expired = remaining <= 0;
  const urgent = !expired && remaining < 5 * 60 * 1000;

  return (
    <View style={{ marginTop: 12, padding: 12, borderRadius: 13, backgroundColor: expired ? "#FEF2F2" : urgent ? "#FFF7ED" : colors.successSoft, flexDirection: "row", alignItems: "center" }}>
      <Ionicons name={expired ? "close-circle" : "timer-outline"} size={20} color={expired ? colors.danger : urgent ? "#C2410C" : colors.success} />
      <View style={{ flex: 1, marginLeft: 9 }}>
        <Text style={{ color: expired ? "#B91C1C" : urgent ? "#C2410C" : "#166534", fontWeight: "900", fontSize: 12 }}>
          {expired ? "Check-in window expired" : "Check in before your turn is cancelled"}
        </Text>
        <Text style={{ color: expired ? "#DC2626" : urgent ? "#EA580C" : "#15803D", fontSize: 16, fontWeight: "900", marginTop: 2 }}>
          {expired ? "No-show" : `${minutes}:${String(seconds).padStart(2, "0")} remaining`}
        </Text>
      </View>
    </View>
  );
}
