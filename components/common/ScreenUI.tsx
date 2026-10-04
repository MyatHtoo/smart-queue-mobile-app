import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../../src/themes/design";

export function ScreenHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack: () => void; right?: ReactNode }) {
  return <View style={{ backgroundColor: colors.surface, paddingTop: 46, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}><View style={{ flexDirection: "row", alignItems: "center" }}><TouchableOpacity onPress={onBack} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}><Ionicons name="arrow-back" size={21} color={colors.primary} /></TouchableOpacity><View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: colors.text, fontSize: 20, fontWeight: "900" }}>{title}</Text>{!!subtitle && <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{subtitle}</Text>}</View>{right}</View></View>;
}

export function SectionLabel({ children }: { children: ReactNode }) { return <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "900", letterSpacing: 0.8, marginTop: 20, marginBottom: 8, marginLeft: 4 }}>{children}</Text>; }

export function MenuRow({ icon, title, subtitle, onPress, danger, value, trailing }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string; onPress?: () => void; danger?: boolean; value?: string; trailing?: ReactNode }) {
  const tint = danger ? colors.danger : colors.primary;
  return <TouchableOpacity disabled={!onPress} onPress={onPress} activeOpacity={0.75} style={{ minHeight: 70, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border }}><View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: danger ? "#FEF2F2" : colors.primarySoft, alignItems: "center", justifyContent: "center" }}><Ionicons name={icon} size={21} color={tint} /></View><View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: danger ? colors.danger : colors.text, fontSize: 14, fontWeight: "800" }}>{title}</Text>{!!subtitle && <Text style={{ color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 }}>{subtitle}</Text>}</View>{!!value && <Text style={{ color: colors.textMuted, fontSize: 12, marginRight: 7 }}>{value}</Text>}{trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null)}</TouchableOpacity>;
}

export function MenuCard({ children }: { children: ReactNode }) { return <View style={{ borderRadius: radius.large, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>{children}</View>; }
