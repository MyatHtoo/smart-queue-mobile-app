import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TableTypeOption } from "../src/utils/TableTypes";
import { colors, radius } from "../src/themes/design";

type Props = { options: TableTypeOption[]; selectedId?: string; onSelect: (option: TableTypeOption) => void };

export default function TableTypeSelector({ options, selectedId, onSelect }: Props) {
  return <View style={{ gap: 10 }}>
    {options.map((option) => {
      const selected = option.id === selectedId;
      return <TouchableOpacity key={option.id} disabled={!option.available} onPress={() => onSelect(option)} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: radius.medium, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primarySoft : option.available ? colors.surface : "#F1F5F9", opacity: option.available ? 1 : 0.6 }}>
        <View style={{ width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: selected ? colors.primary : "#EAF5F8" }}><Ionicons name="restaurant-outline" size={22} color={selected ? "#FFFFFF" : colors.primary} /></View>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: colors.text, fontSize: 15, fontWeight: "800" }}>{option.name}</Text><Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>{option.minGuests === option.maxGuests ? `${option.maxGuests} guests` : `${option.minGuests}–${option.maxGuests} guests`}{option.description ? ` • ${option.description}` : ""}</Text></View>
        <View style={{ alignItems: "flex-end" }}>{option.availableCount != null ? <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>{option.availableCount} available</Text> : option.totalTables != null ? <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 4 }}>{option.totalTables} tables</Text> : null}<Ionicons name={!option.available ? "lock-closed" : selected ? "checkmark-circle" : "ellipse-outline"} size={21} color={!option.available ? colors.textMuted : colors.primary} /></View>
      </TouchableOpacity>;
    })}
  </View>;
}
