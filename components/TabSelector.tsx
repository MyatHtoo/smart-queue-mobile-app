import { View } from "react-native";
import { Chip } from "react-native-paper";
import { colors } from '../src/themes/design';

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
    <View style={{ backgroundColor: colors.background, paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Chip
          selected={activeTab === "active"}
          showSelectedCheck={false}
          onPress={() => onTabChange("active")}
          mode="flat"
          style={{
            backgroundColor: activeTab === "active" ? colors.primary : "#FFFFFF",
            borderWidth: 1, borderColor: activeTab === 'active' ? colors.primary : colors.border,
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
            backgroundColor: activeTab === "history" ? colors.primary : "#FFFFFF",
            borderWidth: 1, borderColor: activeTab === 'history' ? colors.primary : colors.border,
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
