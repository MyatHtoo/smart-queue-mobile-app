import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import TableTypeSelector from "../../components/TableTypeSelector";
import { useUser } from "../../src/contexts/UserContext";
import { createQueue, getCustomerQueues } from "../../src/services/api";
import { getQueueStatus, isFinishedQueueStatus } from "../../src/utils/LiveQueue";
import { tableTypesFromShop, type TableTypeOption } from "../../src/utils/TableTypes";
import { cardShadow, colors, radius } from "../../src/themes/design";

const queueItems = (response: any) => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : Array.isArray(data?.queues) ? data.queues : Array.isArray(data?.data) ? data.data : [];
};

function SectionTitle({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}><View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "900" }}>{step}</Text></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>{title}</Text><Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text></View></View>;
}

export default function JoinQueue() {
  const navigation = useNavigation();
  const restaurant = (useRoute().params as any)?.restaurant;
  const { userData } = useUser();
  const scrollRef = useRef<ScrollView>(null);
  const tableTypes = useMemo(() => tableTypesFromShop(restaurant), [restaurant]);
  const firstAvailable = tableTypes.find((item) => item.available);
  const [selected, setSelected] = useState<TableTypeOption | undefined>(firstAvailable);
  const [partySize, setPartySize] = useState(firstAvailable?.minGuests ?? 1);
  const [notes, setNotes] = useState("");
  const [joining, setJoining] = useState(false);

  const selectTable = (option: TableTypeOption) => { setSelected(option); setPartySize(Math.max(option.minGuests, Math.min(partySize, option.maxGuests))); };
  const changeGuests = (change: number) => selected && setPartySize((current) => Math.max(selected.minGuests, Math.min(selected.maxGuests, current + change)));

  const joinQueue = async () => {
    if (restaurant?.isWithinServiceArea !== true) return Alert.alert("Outside service area", "You must be within 1 km of this shop to join its queue.");
    if (!userData.id) return Alert.alert("Login required", "Please sign in again before joining.");
    if (!selected) return Alert.alert("Choose a table", "This shop has no available table type right now.");
    if (partySize < selected.minGuests || partySize > selected.maxGuests) return Alert.alert("Invalid party size", `This table supports ${selected.minGuests}–${selected.maxGuests} guests.`);
    const shopId = restaurant?.id ?? restaurant?._id ?? restaurant?.shop_id;
    if (!shopId) return Alert.alert("Shop unavailable", "The shop ID is missing. Please refresh and try again.");

    try {
      setJoining(true);
      const existing = queueItems(await getCustomerQueues(String(userData.id))).some((queue: any) => !isFinishedQueueStatus(getQueueStatus(queue)));
      if (existing) return Alert.alert("Active queue already exists", "Cancel or complete your current queue before joining another one.");
      const response = await createQueue({ shop_id: String(shopId), customer_id: String(userData.id), table_type_id: selected.id, userRequirements: notes.trim() });
      (navigation.navigate as any)("QueueConfirm", { queueData: { restaurant, phone: userData.phoneNumber, partySize, queueType: selected.name, tableTypeId: selected.id, notes: notes.trim(), queue: response?.data ?? response } });
    } catch (error: any) { Alert.alert("Unable to join queue", error?.message || "Please try again."); }
    finally { setJoining(false); }
  };

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 36 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.large, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, ...cardShadow }}>
        <Image source={restaurant?.image} style={{ width: 68, height: 68, borderRadius: 16, backgroundColor: colors.primarySoft }} resizeMode="cover" />
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }} numberOfLines={1}>{restaurant?.name || "Shop"}</Text><Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }} numberOfLines={1}>{restaurant?.shopType || restaurant?.cuisine || "Restaurant"}</Text><View style={{ flexDirection: "row", alignItems: "center", marginTop: 7 }}><Ionicons name="location" size={14} color={colors.success} /><Text style={{ color: colors.success, fontSize: 12, fontWeight: "800", marginLeft: 4 }}>{restaurant?.distance} away</Text><Text style={{ color: colors.textMuted, fontSize: 12 }}>  •  {restaurant?.waitInfo || 0} waiting</Text></View></View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.successSoft, borderRadius: radius.medium, marginTop: 14 }}><Ionicons name="shield-checkmark" size={21} color={colors.success} /><View style={{ flex: 1, marginLeft: 9 }}><Text style={{ color: "#166534", fontWeight: "800", fontSize: 13 }}>Location verified</Text><Text style={{ color: "#15803D", fontSize: 11, marginTop: 2 }}>Within the 1 km queue service area</Text></View></View>

      <View style={{ marginTop: 24 }}><SectionTitle step={1} title="Choose a table" subtitle="Live table types provided by this shop" />
        {tableTypes.length ? <TableTypeSelector options={tableTypes} selectedId={selected?.id} onSelect={selectTable} /> : <View style={{ padding: 20, borderRadius: radius.medium, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}><Ionicons name="alert-circle-outline" size={28} color={colors.warning} /><Text style={{ color: colors.text, fontWeight: "800", marginTop: 8 }}>No table types available</Text><Text style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 4 }}>The shop has not configured seating options yet.</Text></View>}
      </View>

      <View style={{ marginTop: 24 }}><SectionTitle step={2} title="Party size" subtitle={selected ? `Choose ${selected.minGuests}–${selected.maxGuests} guests for ${selected.name}` : "Select a table first"} />
        <View style={{ height: 76, borderRadius: radius.medium, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18 }}>
          <TouchableOpacity disabled={!selected || partySize <= selected.minGuests} onPress={() => changeGuests(-1)} style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: !selected || partySize <= selected.minGuests ? "#F1F5F9" : colors.primarySoft }}><Ionicons name="remove" size={22} color={!selected || partySize <= selected.minGuests ? colors.disabled : colors.primary} /></TouchableOpacity>
          <View style={{ alignItems: "center" }}><Text style={{ color: colors.text, fontSize: 27, fontWeight: "900" }}>{partySize}</Text><Text style={{ color: colors.textMuted, fontSize: 11 }}>{partySize === 1 ? "guest" : "guests"}</Text></View>
          <TouchableOpacity disabled={!selected || partySize >= selected.maxGuests} onPress={() => changeGuests(1)} style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: !selected || partySize >= selected.maxGuests ? "#F1F5F9" : colors.primarySoft }}><Ionicons name="add" size={22} color={!selected || partySize >= selected.maxGuests ? colors.disabled : colors.primary} /></TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 24 }}><SectionTitle step={3} title="Special requests" subtitle="Optional notes for the shop" /><View style={{ backgroundColor: colors.surface, borderRadius: radius.medium, borderWidth: 1, borderColor: colors.border, padding: 12 }}><TextInput value={notes} onChangeText={(value) => setNotes(value.slice(0, 200))} onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250)} multiline placeholder="High chair, accessibility support, seating preference..." placeholderTextColor={colors.textMuted} style={{ color: colors.text, fontSize: 14, minHeight: 82, textAlignVertical: "top" }} /><Text style={{ color: colors.textMuted, fontSize: 10, textAlign: "right" }}>{notes.length}/200</Text></View></View>

      <View style={{ marginTop: 22, padding: 15, borderRadius: radius.medium, backgroundColor: colors.primarySoft }}><Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800" }}>QUEUE SUMMARY</Text><View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 9 }}><Text style={{ color: colors.textMuted, fontSize: 13 }}>Table</Text><Text style={{ color: colors.text, fontSize: 13, fontWeight: "800" }}>{selected?.name || "Not selected"}</Text></View><View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 7 }}><Text style={{ color: colors.textMuted, fontSize: 13 }}>Party size</Text><Text style={{ color: colors.text, fontSize: 13, fontWeight: "800" }}>{partySize} guests</Text></View><View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 7 }}><Text style={{ color: colors.textMuted, fontSize: 13 }}>People waiting</Text><Text style={{ color: colors.text, fontSize: 13, fontWeight: "800" }}>{restaurant?.waitInfo || 0}</Text></View></View>

      <TouchableOpacity disabled={joining || !selected} onPress={joinQueue} activeOpacity={0.82} style={{ height: 54, borderRadius: radius.pill, backgroundColor: joining || !selected ? colors.disabled : colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20 }}><Ionicons name={joining ? "hourglass-outline" : "ticket-outline"} size={20} color="#FFFFFF" /><Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginLeft: 8 }}>{joining ? "Joining queue..." : "Confirm & join queue"}</Text></TouchableOpacity>
      <TouchableOpacity disabled={joining} onPress={() => navigation.goBack()} style={{ height: 46, alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.textMuted, fontWeight: "700" }}>Cancel</Text></TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}
