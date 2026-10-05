import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute, TabActions } from "@react-navigation/native";
import QueueCard from "../../components/QueueCard";
import type { Queue } from "../../src/constants/mockData";
import { useUser } from "../../src/contexts/UserContext";
import { cancelQueue, getCustomerQueueHistory, getCustomerQueues, getTableTypes } from "../../src/services/api";
import { getCancelledQueueIds, saveCancelledQueueId } from "../../src/utils/CancelledQueueStore";
import { getQueueStatus, isFinishedQueueStatus, isTurnQueueStatus } from "../../src/utils/LiveQueue";
import { colors, radius } from "../../src/themes/design";

const PAGE_SIZE = 5;
type Section = "active" | "history";
type Filter = "all" | "waiting" | "ready" | "checked_in" | "seated" | "completed" | "cancelled";
type DisplayQueue = Queue & { recordSection: Section };

const queueItems = (response: any): any[] => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : Array.isArray(data?.queues) ? data.queues : Array.isArray(data?.data) ? data.data : [];
};
const textValue = (value: any) => typeof value === "string" || typeof value === "number" ? String(value) : value?.name ?? value?.title ?? value?.label ?? "";
const dateValue = (value: any) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
const addressValue = (shop: any) => textValue(shop?.address?.fullAddress ?? shop?.address?.addressLine ?? shop?.address?.name ?? shop?.address);

const mapQueue = (item: any): Queue => {
  const shop = typeof item?.shop_id === "object" ? item.shop_id : typeof item?.shopId === "object" ? item.shopId : item?.shop ?? {};
  const table = typeof item?.table_type_id === "object" ? item.table_type_id : typeof item?.tableTypeId === "object" ? item.tableTypeId : item?.tableType ?? {};
  const rawStatus = getQueueStatus(item);
  const finished = isFinishedQueueStatus(rawStatus);
  const checkedIn = ["qr scanned", "checked in", "checkedin", "arrived"].includes(rawStatus);
  const seated = ["seated", "serving", "in service"].includes(rawStatus);
  const ready = ["ready", "ready to seat", "called", "notified"].includes(rawStatus);
  const partySize = Number(item?.partySize ?? item?.guestCount ?? item?.numberOfGuests ?? item?.party_size ?? table?.capacity);
  const wait = item?.estimated_wait_time ?? item?.estimatedWaitTime ?? item?.estimatedWait ?? item?.estimated_wait ?? item?.waitingTime;
  const waitText = wait == null ? "Calculating" : typeof wait === "number" || /^\d+$/.test(String(wait)) ? `${wait} min` : String(wait);
  const joinedRaw = item?.createdAt ?? item?.joinedAt ?? item?.created_at;
  const updatedRaw = item?.updatedAt ?? item?.updated_at;
  const cancelled = ["cancelled", "canceled"].includes(rawStatus);
  const tableCapacity = Number(table?.capacity ?? item?.table_capacity ?? item?.tableCapacity);

  return {
    id: String(item?._id ?? item?.id ?? item?.queue_id ?? item?.queueId ?? ""),
    shopId: String(shop?._id ?? shop?.id ?? (typeof item?.shop_id !== "object" ? item?.shop_id : "") ?? ""),
    restaurantName: textValue(shop?.name ?? shop?.shopName ?? item?.shopName) || "Unknown shop",
    queueNumber: textValue(item?.queueNumber ?? item?.queue_number ?? item?.number ?? item?.queueNo),
    partySize: Number.isFinite(partySize) && partySize > 0 ? partySize : undefined,
    queueType: textValue(item?.table_type_name ?? item?.tableTypeName ?? table?.name ?? table?.title ?? table?.type ?? item?.queueType ?? item?.queue_type),
    tableTypeId: String(item?.table_type_id?._id ?? item?.table_type_id ?? item?.tableTypeId?._id ?? item?.tableTypeId ?? ""),
    tableCapacity: Number.isFinite(tableCapacity) && tableCapacity > 0 ? tableCapacity : undefined,
    position: finished || ready || checkedIn || seated ? 0 : Number(item?.position ?? item?.queuePosition ?? item?.peopleAhead ?? 0),
    totalPeople: finished || ready || checkedIn || seated ? 0 : Number(item?.totalPeople ?? item?.total_queue ?? item?.peopleAhead ?? 0),
    estimatedWait: finished ? "Completed" : seated ? "Seated" : checkedIn ? "Checked in" : ready ? "Your turn" : waitText,
    joinedAt: dateValue(joinedRaw),
    updatedAt: updatedRaw ? dateValue(updatedRaw) : undefined,
    completedAt: item?.completedAt ? dateValue(item.completedAt) : undefined,
    noShowDeadline: item?.noShowDeadline ?? item?.no_show_deadline ?? undefined,
    status: finished ? "expired" : seated ? "seated" : checkedIn ? "checked_in" : ready ? "ready" : "active",
    rawStatus,
    statusLabel: cancelled ? "Cancelled" : seated ? "Seated" : checkedIn ? "QR scanned" : ready ? "Ready for you" : finished ? "Completed" : rawStatus === "waiting" ? "Waiting" : rawStatus.replace(/\b\w/g, (letter: string) => letter.toUpperCase()),
    notes: textValue(item?.userRequirements ?? item?.requirements ?? item?.notes),
    customerPhone: textValue(item?.phoneNumber ?? item?.phone ?? item?.customer?.phoneNumber),
    shopPhone: textValue(shop?.phoneNumber ?? shop?.phone),
    shopAddress: addressValue(shop),
    shopImage: textValue(shop?.shopImg ?? shop?.image ?? shop?.logo),
  };
};

function SegmentedButton({ selected, label, count, onPress }: { selected: boolean; label: string; count?: number; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1, height: 44, borderRadius: 13, backgroundColor: selected ? colors.primary : colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: selected ? colors.primary : colors.border }}><Text style={{ color: selected ? "#FFFFFF" : colors.textMuted, fontWeight: "800" }}>{label}{count != null ? ` (${count})` : ""}</Text></TouchableOpacity>;
}

export default function MyQueue() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { userData } = useUser();
  const [section, setSection] = useState<Section>("active");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [queues, setQueues] = useState<DisplayQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [newestFirst, setNewestFirst] = useState(true);

  const loadQueues = useCallback(async (refresh = false) => {
    if (!userData.id) { setQueues([]); setLoading(false); return; }
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const [response, historyResponse, locallyCancelled, tableTypeResponse] = await Promise.all([
        getCustomerQueues(userData.id),
        getCustomerQueueHistory(userData.id),
        getCancelledQueueIds(userData.id),
        getTableTypes().catch(() => []),
      ]);
      const history = queueItems(historyResponse).map(mapQueue).filter((queue) => queue.id);
      // The active and history endpoints are the source of truth for their own
      // sections. Queue numbers can repeat (an immediately ready queue is #0),
      // so they must never be used to deduplicate records across sections.
      const current = queueItems(response).map(mapQueue).filter((queue) => queue.id);
      const tableTypes = queueItems(tableTypeResponse);
      const tableTypeById = new Map(tableTypes.map((tableType) => [String(tableType?._id ?? tableType?.id), tableType]));
      const mapped: DisplayQueue[] = [
        ...current.map((queue) => ({ ...queue, recordSection: "active" as const })),
        ...history.map((queue) => ({ ...queue, recordSection: "history" as const })),
      ].map((queue) => {
        const tableType = queue.tableTypeId ? tableTypeById.get(queue.tableTypeId) : undefined;
        return { ...queue, queueType: queue.queueType || textValue(tableType?.type ?? tableType?.name) || "Table type", tableCapacity: queue.tableCapacity ?? (Number(tableType?.capacity) || undefined) };
      });
      setQueues(mapped.map((queue) => locallyCancelled.has(queue.id) ? { ...queue, recordSection: "history", status: "expired", rawStatus: "cancelled", statusLabel: "Cancelled", estimatedWait: "Cancelled" } : queue));
    } catch (error: any) { Alert.alert("Unable to load queues", error?.message || "Please try again."); }
    finally { setLoading(false); setRefreshing(false); }
  }, [userData.id]);

  useFocusEffect(useCallback(() => { loadQueues(); }, [loadQueues]));
  useEffect(() => {
    if (route.params?.initialSection === "history") {
      setSection("history");
      setFilter("all");
      navigation.setParams?.({ initialSection: undefined } as never);
    }
  }, [navigation, route.params?.initialSection]);
  useEffect(() => { setPage(1); }, [section, filter, search, newestFirst]);

  const activeCount = queues.filter((queue) => queue.recordSection === "active").length;
  const historyCount = queues.length - activeCount;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return queues.filter((queue) => {
      if (queue.recordSection !== section) return false;
      if (filter === "waiting" && queue.status !== "active") return false;
      if (filter === "ready" && queue.status !== "ready") return false;
      if (filter === "checked_in" && queue.status !== "checked_in") return false;
      if (filter === "seated" && queue.status !== "seated") return false;
      if (filter === "completed" && (queue.status !== "expired" || queue.rawStatus === "cancelled" || queue.rawStatus === "canceled")) return false;
      if (filter === "cancelled" && !["cancelled", "canceled"].includes(queue.rawStatus || "")) return false;
      return !query || [queue.restaurantName, queue.queueNumber, queue.queueType, queue.statusLabel, queue.shopAddress].some((value) => String(value ?? "").toLowerCase().includes(query));
    }).sort((a, b) => (newestFirst ? -1 : 1) * (new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()));
  }, [queues, section, filter, search, newestFirst]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filters: { key: Filter; label: string }[] = section === "active" ? [{ key: "all", label: "All" }, { key: "waiting", label: "Waiting" }, { key: "ready", label: "Ready" }, { key: "checked_in", label: "Checked in" }, { key: "seated", label: "Seated" }] : [{ key: "all", label: "All" }, { key: "completed", label: "Completed" }, { key: "cancelled", label: "Cancelled" }];

  const handleCancel = (queue: Queue) => Alert.alert("Cancel queue?", `Leave queue ${queue.queueNumber || ""} at ${queue.restaurantName}?`, [{ text: "Keep queue", style: "cancel" }, { text: "Cancel queue", style: "destructive", onPress: async () => {
    try { await cancelQueue(queue.id); await saveCancelledQueueId(userData.id || "", queue.id); setQueues((items) => items.map((item) => item.id === queue.id ? { ...item, recordSection: "history", status: "expired", rawStatus: "cancelled", statusLabel: "Cancelled", estimatedWait: "Cancelled" } : item)); }
    catch (error: any) { Alert.alert("Unable to cancel", error?.message || "Please try again."); }
  } }]);
  const viewLive = (queue: Queue) => (navigation.navigate as any)("Screens", { screen: "LiveQueue", params: { restaurant: { name: queue.restaurantName, cuisine: queue.queueType || "Restaurant" }, queueData: { queueId: queue.id, shopId: queue.shopId, queueNumber: Number(queue.queueNumber || 0), partySize: queue.partySize, queueType: queue.queueType, joinedAt: queue.joinedAt, phone: queue.customerPhone, notes: queue.notes } } });

  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <FlatList
      data={visible}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadQueues(true)} colors={[colors.primary]} tintColor={colors.primary} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36, flexGrow: 1 }}
      ListHeaderComponent={<>
        <View style={{ backgroundColor: colors.primary, marginHorizontal: -16, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <Text style={{ color: "#DDF0F5", fontSize: 13, fontWeight: "700" }}>MY QUEUES</Text><Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginTop: 4 }}>Your queue activity</Text><Text style={{ color: "#DDF0F5", fontSize: 13, marginTop: 5 }}>Track live progress and review every visit.</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}><View style={{ flex: 1, padding: 13, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.14)" }}><Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>{activeCount}</Text><Text style={{ color: "#DDF0F5", fontSize: 11 }}>Active queues</Text></View><View style={{ flex: 1, padding: 13, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.14)" }}><Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>{historyCount}</Text><Text style={{ color: "#DDF0F5", fontSize: 11 }}>Past visits</Text></View></View>
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}><SegmentedButton selected={section === "active"} label="Active" count={activeCount} onPress={() => { setSection("active"); setFilter("all"); }} /><SegmentedButton selected={section === "history"} label="History" count={historyCount} onPress={() => { setSection("history"); setFilter("all"); }} /></View>
        <View style={{ height: 50, backgroundColor: colors.surface, borderRadius: radius.medium, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, marginTop: 14 }}><Ionicons name="search" size={20} color={colors.textMuted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search shop, queue number or type" placeholderTextColor={colors.textMuted} style={{ flex: 1, color: colors.text, fontSize: 14, marginLeft: 9 }} />{!!search && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={19} color={colors.textMuted} /></TouchableOpacity>}</View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 13, marginBottom: 15 }}><View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 7 }}>{filters.map((item) => <TouchableOpacity key={item.key} onPress={() => setFilter(item.key)} style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: filter === item.key ? colors.primarySoft : colors.surface, borderWidth: 1, borderColor: filter === item.key ? colors.primary : colors.border }}><Text style={{ color: filter === item.key ? colors.primary : colors.textMuted, fontSize: 11, fontWeight: "700" }}>{item.label}</Text></TouchableOpacity>)}</View><TouchableOpacity onPress={() => setNewestFirst((value) => !value)} style={{ flexDirection: "row", alignItems: "center", paddingTop: 8, marginLeft: 6 }}><Ionicons name="swap-vertical" size={17} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700", marginLeft: 3 }}>{newestFirst ? "Newest" : "Oldest"}</Text></TouchableOpacity></View>
        {!loading && <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 10 }}>{filtered.length} {filtered.length === 1 ? "queue" : "queues"} found</Text>}
      </>}
      renderItem={({ item }) => <QueueCard queue={item} onViewLive={() => viewLive(item)} onCancel={() => handleCancel(item)} onImHere={() => navigation.dispatch(TabActions.jumpTo("QRScan"))} showActions={section === "active"} />}
      ListEmptyComponent={loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 45 }} /> : <View style={{ alignItems: "center", paddingVertical: 48 }}><View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}><Ionicons name={search ? "search" : "ticket-outline"} size={31} color={colors.primary} /></View><Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 16 }}>{search ? "No matching queues" : section === "active" ? "No active queue" : "No queue history"}</Text><Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 20, marginTop: 7 }}>{search ? "Try another shop name, queue number or filter." : "Your queue information will appear here."}</Text></View>}
      ListFooterComponent={!loading && filtered.length > 0 ? <View style={{ alignItems: "center", marginTop: 2 }}><View style={{ flexDirection: "row", alignItems: "center", padding: 4, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}><TouchableOpacity disabled={page === 1} onPress={() => setPage((value) => value - 1)} style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: page === 1 ? "transparent" : colors.primarySoft }}><Ionicons name="chevron-back" size={16} color={page === 1 ? colors.disabled : colors.primary} /></TouchableOpacity><Text style={{ minWidth: 48, textAlign: "center", color: colors.text, fontSize: 12, fontWeight: "800" }}>{page} / {totalPages}</Text><TouchableOpacity disabled={page === totalPages} onPress={() => setPage((value) => value + 1)} style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: page === totalPages ? "transparent" : colors.primarySoft }}><Ionicons name="chevron-forward" size={16} color={page === totalPages ? colors.disabled : colors.primary} /></TouchableOpacity></View></View> : null}
    />
  </View>;
}
