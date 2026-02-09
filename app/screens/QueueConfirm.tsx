import { View, Text, Image, ScrollView } from "react-native";
import { Button, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function QueueConfirm() {
  const navigation = useNavigation();
  const route = useRoute();
  const queueData = (route.params as any)?.queueData;

  // Generate queue number based on queue type
  const getQueueNumber = () => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    const prefix = queueData?.queueType === "1-2" ? "A" : queueData?.queueType === "3-4" ? "B" : "C";
    return `${prefix}#${randomNum}`;
  };

  const queueNumber = getQueueNumber();
  const peopleInFront = Math.floor(Math.random() * 10) + 1;

  const createQueueData = () => ({
    id: Date.now().toString(),
    restaurantName: queueData?.restaurant?.name || "Restaurant",
    queueNumber: queueNumber,
    partySize: queueData?.partySize || 1,
    queueType: queueData?.queueType,
    position: peopleInFront,
    estimatedWait: `${Math.floor(Math.random() * 20) + 10} min`,
    joinedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    status: "active" as const,
    phone: queueData?.phone,
    notes: queueData?.notes,
  });

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
            color: "#17a2b8",
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
                  {peopleInFront} {peopleInFront === 1 ? 'person' : 'people'}
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
                  style={{ fontSize: 14, fontWeight: "600", color: "#17a2b8" }}
                >
                  ~{Math.floor(Math.random() * 20) + 10} min
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
              navigation.navigate("MainTabs" as never, { screen: "MyQueues" } as never);
            }}
            style={{
              backgroundColor: "#17a2b8",
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
              navigation.navigate("MainTabs" as never, { screen: "HomePage" } as never);
            }}
            style={{
              borderColor: "#17a2b8",
              borderRadius: 25,
              paddingVertical: 8,
            }}
            contentStyle={{ height: 40 }}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
            textColor="#17a2b8"
          >
            Back to Home
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}