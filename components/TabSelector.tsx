import { View } from "react-native";
import { Chip } from "react-native-paper";

interface TabSelectorProps {
  activeTab: "active" | "history";
  onTabChange: (tab: "active" | "history") => void;
  activeCount?: number;
}

export default function TabSelector({ 
  activeTab, 
  onTabChange, 
  activeCount = 0 
}: TabSelectorProps) {
  return (
    <View style={{ backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 12 }}>
      <View style={{ flexDirection: "row", gap: 10, marginLeft: 15 }}>
        <Chip
          selected={activeTab === "active"}
          showSelectedCheck={false}
          onPress={() => onTabChange("active")}
          mode="flat"
          style={{
            backgroundColor: activeTab === "active" ? "#17a2b8" : "#f5f5f5",
          }}
          textStyle={{
            color: activeTab === "active" ? "white" : "#666",
            fontSize: 14,
            fontWeight: activeTab === "active" ? "600" : "400",
          }}
        >
          Active ({activeCount})
        </Chip>
        <Chip
          selected={activeTab === "history"}
          showSelectedCheck={false}
          onPress={() => onTabChange("history")}
          mode="flat"
          style={{
            backgroundColor: activeTab === "history" ? "#17a2b8" : "#f5f5f5",
          }}
          textStyle={{
            color: activeTab === "history" ? "white" : "#666",
            fontSize: 14,
            fontWeight: activeTab === "history" ? "600" : "400",
          }}
        >
          History
        </Chip>
      </View>
    </View>
  );
}
