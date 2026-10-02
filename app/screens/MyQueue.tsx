import { ActivityIndicator, Alert, RefreshControl, ScrollView, View } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation, TabActions } from "@react-navigation/native";
import QueueCard from "../../components/QueueCard";
import EmptyState from "../../components/EmptyState";
import TabSelector from "../../components/TabSelector";
import { Queue } from "../../src/constants/mockData";
import { useUser } from "../../src/contexts/UserContext";
import { cancelQueue, getCustomerQueues } from "../../src/services/api";
import { getCancelledQueueIds, saveCancelledQueueId } from "../../src/utils/CancelledQueueStore";
import { getQueueStatus, isFinishedQueueStatus, isTurnQueueStatus } from "../../src/utils/LiveQueue";

const getQueueItems = (response: any): any[] => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.queues)) return data.queues;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const formatDate = (value: any) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const mapQueue = (item: any): Queue => {
  const shop = item?.shop_id || item?.shopId || item?.shop || {};
  const tableType = item?.table_type_id || item?.tableTypeId || item?.tableType || {};
  const rawStatus = getQueueStatus(item);
  const isFinished = isFinishedQueueStatus(rawStatus);
  const isReady = isTurnQueueStatus(rawStatus) || ["ready", "called", "notified"].includes(rawStatus);
  const partySize = Number(item?.partySize || item?.guestCount || item?.numberOfGuests || tableType?.capacity);
  const wait = item?.estimatedWait || item?.estimated_wait || item?.waitingTime;

  return {
    id: String(item?._id || item?.id || item?.queue_id || item?.queueId),
    shopId: String(shop?._id || shop?.id || item?.shop_id || item?.shopId || ""),
    restaurantName: shop?.name || shop?.shopName || item?.shopName || "Shop",
    queueNumber: String(item?.queueNumber || item?.queue_number || item?.number || item?.queueNo || ""),
    partySize: Number.isFinite(partySize) && partySize > 0 ? partySize : undefined,
    queueType: tableType?.name || tableType?.title || item?.queueType || "",
    position: isReady || isFinished ? 0 : Number(item?.position ?? item?.queuePosition ?? 0),
    totalPeople: isReady || isFinished ? 0 : Number(item?.totalPeople ?? item?.peopleAhead ?? 0),
    estimatedWait: isFinished ? "Completed" : isReady ? "Your turn" : wait != null ? String(wait) : "Calculating",
    joinedAt: formatDate(item?.createdAt || item?.joinedAt || item?.created_at),
    status: isFinished ? "expired" : isReady ? "ready" : "active",
    notes: item?.userRequirements || item?.notes || "",
  };
};

export default function MyQueue() {
  const navigation = useNavigation();
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [activeQueues, setActiveQueues] = useState<Queue[]>([]);
  const [historyQueues, setHistoryQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQueues = useCallback(async (showRefresh = false) => {
    if (!userData.id) {
      setActiveQueues([]);
      setHistoryQueues([]);
      setLoading(false);
      return;
    }

    showRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await getCustomerQueues(userData.id);
      const cancelledQueueIds = await getCancelledQueueIds(userData.id);
      const queues = getQueueItems(response)
        .map(mapQueue)
        .filter((queue) => !cancelledQueueIds.has(queue.id));
      setActiveQueues(queues.filter((queue) => queue.status !== "expired"));
      setHistoryQueues(queues.filter((queue) => queue.status === "expired"));
    } catch (error: any) {
      Alert.alert("Unable to load queues", error?.message || "Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData.id]);

  useFocusEffect(
    useCallback(() => {
      loadQueues();
    }, [loadQueues])
  );

  const handleCancelQueue = (id: string) => {
    Alert.alert(
      "Cancel queue?",
      "Are you sure you want to leave this queue?",
      [
        { text: "Keep Queue", style: "cancel" },
        {
          text: "Confirm Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelQueue(id);
              // Hide only after the backend confirms cancellation.
              await saveCancelledQueueId(userData.id || "", id);
              setActiveQueues((queues) => queues.filter((queue) => queue.id !== id));
              setHistoryQueues((queues) => queues.filter((queue) => queue.id !== id));
            } catch (error: any) {
              Alert.alert("Unable to cancel queue", error?.message || "Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleViewLive = (queue: Queue) => {
    (navigation.navigate as any)("Screens", { 
      screen: 'LiveQueue', 
      params: {
        restaurant: {
          name: queue.restaurantName,
          cuisine: queue.queueType || "Restaurant",
        },
        queueData: {
          queueId: queue.id,
          shopId: queue.shopId,
          queueNumber: parseInt(queue.queueNumber || "0"),
          partySize: queue.partySize,
          queueType: queue.queueType,
          joinedAt: queue.joinedAt,
          phone: queue.phone,
          notes: queue.notes,
        },
      }
    });
  };

  const handleImHere = () => {
    console.log("Proceeding to counter");
  };

  const handleScanQRCode = () => {
    navigation.dispatch(TabActions.jumpTo('QRScan'));
  };

  const displayQueues = activeTab === "active" ? activeQueues : historyQueues;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }} >

      {/* Tab Selector */}
      <TabSelector
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeQueues.length}
      />

      {/* Content */}
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadQueues(true)} colors={["#17a2b8"]} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 50, flexGrow: 1 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#17a2b8" style={{ marginTop: 40 }} />
          ) : displayQueues.length === 0 ? (
            <EmptyState 
              activeTab={activeTab} 
              onScanQRCode={handleScanQRCode} 
            />
          ) : (
            displayQueues.map((queue) => (
              <QueueCard
                key={queue.id}
                queue={queue}
                onViewLive={() => handleViewLive(queue)}
                onCancel={() => handleCancelQueue(queue.id)}
                onImHere={handleImHere}
                showActions={activeTab === "active"}
              />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
