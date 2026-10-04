import { View, Text, Image, ScrollView } from "react-native";
import { Button, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { getShopQueues } from "../../src/services/api";
import { getEstimatedWait, getQueueId, getQueueNumber, getSortedActiveQueues, isTurnQueueStatus } from "../../src/utils/LiveQueue";

export default function QueueConfirm() {
  const navigation = useNavigation();
  const route = useRoute();
  const queueData = (route.params as any)?.queueData;
  const createdQueue = queueData?.queue;
  const shopId = queueData?.restaurant?._id || queueData?.restaurant?.id || queueData?.restaurant?.shop_id;
  const queueId = getQueueId(createdQueue);

  const queueNumber = String(
    createdQueue?.queueNumber ||
    createdQueue?.queue_number ||
    createdQueue?.number ||
    "Pending"
  );
  const [queueStats, setQueueStats] = useState({
    peopleInFront: 0,
    estimatedWait: getEstimatedWait(createdQueue),
  });

  useEffect(() => {
    if (!shopId) return;

    let active = true;
    const loadQueueStats = async () => {
      try {
        const queues = getSortedActiveQueues(await getShopQueues(String(shopId)));
        const queueIndexById = queues.findIndex((queue) => getQueueId(queue) === queueId);
        const queueIndexByNumber = queues.findIndex((queue) => getQueueNumber(queue) === Number(queueNumber));
        const queueIndex = queueIndexById >= 0 ? queueIndexById : queueIndexByNumber;
        const queue = queueIndex >= 0 ? queues[queueIndex] : undefined;

        if (active && queue) {
          const isTurn = isTurnQueueStatus(String(queue?.status || queue?.queueStatus || ""));
          setQueueStats({
            peopleInFront: isTurn ? 0 : Math.max(0, queueIndex),
            estimatedWait: isTurn ? 0 : getEstimatedWait(queue),
          });
        }
      } catch (error) {
        console.warn("Unable to load queue confirmation wait time:", error);
      }
    };

    loadQueueStats();
    return () => { active = false; };
  }, [queueId, queueNumber, shopId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 16 }}>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 40,
            backgroundColor: "#d1fae5",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <IconButton
            icon="check"
            size={40}
            iconColor="#10b981"
            style={{ margin: 0 }}
          />
        </View>

        {/* Queue Number Display */}
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            color: "#1E7A9B",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {queueNumber}
        </Text>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          You're in the Queue!
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          We'll notify you when your table is ready
        </Text>

        {/* Restaurant Info Card */}
        {queueData?.restaurant && (
          <View
            style={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Image
                source={queueData.restaurant.image}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  marginRight: 16,
                }}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  {queueData.restaurant.name}
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                  {queueData.restaurant.cuisine}
                </Text>
              </View>
            </View>

            {/* Queue Details */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#e5e7eb",
                paddingTop: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Party Size
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
                >
                  {queueData.partySize} {queueData.partySize === 1 ? "person" : "people"}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Queue Type
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
                >
                  {queueData.queueType} people
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  People in Front
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
                >
                  {queueStats.peopleInFront} {queueStats.peopleInFront === 1 ? 'person' : 'people'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Estimated Wait
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#1E7A9B" }}
                >
                  ~{queueStats.estimatedWait} min
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Contact
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
                >
                  {queueData.phone}
                </Text>
              </View>
            </View>

            {/* Special Requirements */}
            {queueData.notes && queueData.notes.trim() !== "" && (
              <View
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: "#f9fafb",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: 4,
                  }}
                >
                  Special Requirements
                </Text>
                <Text style={{ fontSize: 14, color: "#111827" }}>
                  {queueData.notes}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ width: "100%", gap: 12 }}>
          <Button
            mode="contained"
            onPress={() => {
              (navigation.navigate as any)("MainTabs", { screen: "MyQueues" });
            }}
            style={{
              backgroundColor: "#1E7A9B",
              borderRadius: 25,
              paddingVertical: 8,
            }}
            contentStyle={{ height: 40 }}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
          >
            View My Queues
          </Button>

          <Button
            mode="outlined"
            onPress={() => {
              (navigation.navigate as any)("MainTabs", { screen: "HomePage" });
            }}
            style={{
              borderColor: "#1E7A9B",
              borderRadius: 25,
              paddingVertical: 8,
            }}
            contentStyle={{ height: 40 }}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
            textColor="#1E7A9B"
          >
            Back to Home
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
