import { ScrollView, View, Text, Image, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, IconButton, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "../../src/contexts/UserContext";
import { createQueue } from "../../src/services/api";

export default function JoinQueue() {
  const navigation = useNavigation();
  const route = useRoute();
  const restaurant = (route.params as any)?.restaurant;
  const scrollViewRef = useRef<ScrollView>(null);
  const { userData } = useUser();

  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [partySize, setPartySize] = useState(2);
  const [queueType, setQueueType] = useState<"1-2" | "3-4" | "5-8">("1-2");
  const [notes, setNotes] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoinQueue = async () => {
    if (!partySize || partySize < 1) {
      Alert.alert("Error", "Please enter a valid party size");
      return;
    }

    const shopId = restaurant?.id || restaurant?._id || restaurant?.shop_id;
    const customerId = userData.id;
    const tableTypes = Array.isArray(restaurant?.tableTypes) ? restaurant.tableTypes : [];
    const selectedIndex = queueType === "1-2" ? 0 : queueType === "3-4" ? 1 : 2;
    const maximumGuests = selectedIndex === 0 ? 2 : selectedIndex === 1 ? 4 : 8;
    const tableType = tableTypes.find((type: any) => {
      const label = String(type?.name || type?.title || type?.type || type?.tableType || "");
      const capacity = Number(
        type?.maxCapacity || type?.maximumCapacity || type?.capacity || type?.seats || type?.maxGuests
      );
      return label.includes(queueType) || capacity === maximumGuests;
    }) || tableTypes[selectedIndex];
    const tableTypeId = tableType?._id || tableType?.id || tableType?.table_type_id;

    if (!customerId) {
      Alert.alert("Login required", "Please log in again before joining a queue.");
      return;
    }
    if (!shopId || !tableTypeId) {
      Alert.alert("Queue unavailable", "This shop does not have a table type configured for the selected party size.");
      return;
    }

    try {
      setJoining(true);
      const queueResponse = await createQueue({
        shop_id: String(shopId),
        customer_id: String(customerId),
        table_type_id: String(tableTypeId),
        userRequirements: notes.trim(),
      });

      (navigation.navigate as any)('QueueConfirm', {
        queueData: {
          restaurant,
          phone: userData.phoneNumber,
          partySize,
          queueType,
          notes: notes.trim(),
          queue: queueResponse?.data ?? queueResponse,
        },
      });
    } catch (error: any) {
      Alert.alert("Unable to join queue", error?.message || "Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const incrementGuests = () => {
    const maxGuests = queueType === "1-2" ? 2 : queueType === "3-4" ? 4 : 8;
    if (partySize < maxGuests) {
      setPartySize(partySize + 1);
    }
  };

  const decrementGuests = () => {
    if (partySize > 1) {
      setPartySize(partySize - 1);
    }
  };

  const handleQueueTypeChange = (type: "1-2" | "3-4" | "5-8") => {
    setQueueType(type);
    const maxGuests = type === "1-2" ? 2 : type === "3-4" ? 4 : 8;
    setPartySize(maxGuests);
  };

  return (

    <KeyboardAvoidingView
      style={{ flex: 1,backgroundColor:'white' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={10}
    
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Restaurant Info */}
        {restaurant && (
          <View
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              flexDirection: "row",
              alignItems: "center",
              borderColor: '#17a2b8',
              borderWidth: 1,
            }}
          >
            <Image
              source={restaurant.image}
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                marginRight: 12,
              }}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#111827" }}
              >
                {restaurant.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                {restaurant.cuisine} • {restaurant.distance}
              </Text>
              <Text style={{ fontSize: 14, color: "#17a2b8", marginTop: 4 }}>
                Current wait: ~{restaurant.waitInfo} people
              </Text>
            </View>
          </View>
        )}

        {/* Form Section */}
        <View>
          {/* Queue Type */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Queue Type
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 24,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => handleQueueTypeChange("1-2")}
              style={{
                flex: 1,
                borderWidth: 2,
                borderColor: queueType === "1-2" ? "#17a2b8" : "#e5e7eb",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                backgroundColor: queueType === "1-2" ? "#f0f9ff" : "white",
              }}
            >
              <IconButton
                icon="seat"
                size={32}
                iconColor={queueType === "1-2" ? "#17a2b8" : "#6b7280"}
                style={{ margin: 0 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: queueType === "1-2" ? "#17a2b8" : "#6b7280",
                  marginTop: 4,
                  fontWeight: queueType === "1-2" ? "600" : "400",
                }}
              >
                1-2 people
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQueueTypeChange("3-4")}
              style={{
                flex: 1,
                borderWidth: 2,
                borderColor: queueType === "3-4" ? "#17a2b8" : "#e5e7eb",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                backgroundColor: queueType === "3-4" ? "#f0f9ff" : "white",
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <IconButton
                  icon="seat"
                  size={32}
                  iconColor={queueType === "3-4" ? "#17a2b8" : "#6b7280"}
                  style={{ margin: 0 }}
                />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: queueType === "3-4" ? "#17a2b8" : "#6b7280",
                  marginTop: 4,
                  fontWeight: queueType === "3-4" ? "600" : "400",
                }}
              >
                3-4 people
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQueueTypeChange("5-8")}
              style={{
                flex: 1,
                borderWidth: 2,
                borderColor: queueType === "5-8" ? "#17a2b8" : "#e5e7eb",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                backgroundColor: queueType === "5-8" ? "#f0f9ff" : "white",
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <IconButton
                  icon="seat"
                  size={32}
                  iconColor={queueType === "5-8" ? "#17a2b8" : "#6b7280"}
                  style={{ margin: 0 }}
                />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: queueType === "5-8" ? "#17a2b8" : "#6b7280",
                  marginTop: 4,
                  fontWeight: queueType === "5-8" ? "600" : "400",
                }}
              >
                5-8 people
              </Text>
            </TouchableOpacity>
          </View>

          {/* Special Requirements */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Special Requirements (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
            mode="outlined"
            multiline
            numberOfLines={20}
            style={{ marginBottom: 24, height: 100, backgroundColor: "white" }}
            outlineColor="#e5e7eb"
            activeOutlineColor="#17a2b8"
            placeholder="E.g. High chair needed, window seat..."
          />

          <View style={{ gap: 12 ,marginBottom:30}}>
            {/* Join Queue Button */}
            <Button
              mode="contained"
              onPress={handleJoinQueue}
              loading={joining}
              disabled={joining}
              style={{
                backgroundColor: "#17a2b8",
                borderRadius: 25,
                paddingVertical: 8,
              }}
              contentStyle={{ height: 40 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
              {joining ? "Joining..." : "Join Queue"}
            </Button>

            {/* Cancel Button */}
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: "white",
                borderRadius: 25,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
              contentStyle={{ height: 40 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
              textColor="#6b7280"
            >
              Cancel
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
