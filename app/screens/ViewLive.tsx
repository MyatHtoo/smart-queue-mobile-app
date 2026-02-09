import { ScrollView, View, Text, RefreshControl, Animated, TouchableOpacity } from "react-native";
import { IconButton, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";

interface QueueInfo {
  currentServing: number;
  yourNumber: number;
  peopleInFront: number;
  estimatedWaitTime: number; // in minutes
  averageServiceTime: number; // in minutes per person
  queueStatus: "active" | "paused" | "closed";
  lastUpdated: Date;
}

export default function ViewLive() {
  const navigation = useNavigation();
  const route = useRoute();
  const restaurant = (route.params as any)?.restaurant;
  const queueData = (route.params as any)?.queueData;
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [refreshing, setRefreshing] = useState(false);
  // Static mock data based on queue number
  const yourNumber = parseInt(queueData?.queueNumber) || 23;
  const currentServing = yourNumber - 5; // 5 people behind
  
  const [liveQueue, setLiveQueue] = useState<QueueInfo>({
    currentServing: currentServing,
    yourNumber: yourNumber,
    peopleInFront: yourNumber - currentServing,
    estimatedWaitTime: (yourNumber - currentServing) * 5,
    averageServiceTime: 5,
    queueStatus: "active",
    lastUpdated: new Date(),
  });

  // Pulse animation for active status
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    if (liveQueue.queueStatus === "active") {
      pulse.start();
    }
    return () => pulse.stop();
  }, [liveQueue.queueStatus]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate queue progression
      setLiveQueue((prev) => {
        const shouldUpdate = Math.random() > 0.7; // 30% chance to update
        if (shouldUpdate && prev.currentServing < prev.yourNumber) {
          const newServing = prev.currentServing + 1;
          const newPeopleInFront = Math.max(0, prev.yourNumber - newServing);
          return {
            ...prev,
            currentServing: newServing,
            peopleInFront: newPeopleInFront,
            estimatedWaitTime: newPeopleInFront * prev.averageServiceTime,
            lastUpdated: new Date(),
          };
        }
        return prev;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to fetch latest queue data
    setTimeout(() => {
      setLiveQueue((prev) => ({
        ...prev,
        lastUpdated: new Date(),
      }));
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = () => {
    switch (liveQueue.queueStatus) {
      case "active":
        return "#17a2b8";
      case "paused":
        return "#FF9800";
      case "closed":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusText = () => {
    switch (liveQueue.queueStatus) {
      case "active":
        return "Queue Active";
      case "paused":
        return "Queue Paused";
      case "closed":
        return "Queue Closed";
      default:
        return "Unknown";
    }
  };

  const isYourTurn = liveQueue.currentServing >= liveQueue.yourNumber;
  const progress = Math.min(1, (liveQueue.yourNumber - liveQueue.peopleInFront) / liveQueue.yourNumber);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#17a2b8" />
        }
      >
        <View style={{ padding: 16 }}>
          {/* Restaurant Header */}
          <View style={{ marginBottom: 20, backgroundColor: "white", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 4 }}>
                  {restaurant?.name || "Restaurant Name"}
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  {restaurant?.cuisine || "Cuisine Type"}
                </Text>
              </View>
              <View style={{ backgroundColor: "#f0f9ff", borderRadius: 50, padding: 8 }}>
                <IconButton
                  icon="store"
                  size={24}
                  iconColor="#17a2b8"
                  style={{ margin: 0 }}
                />
              </View>
            </View>
            
            {/* Status Badge */}
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#10b981", marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: "#111827", fontWeight: "600" }}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          {/* Your Turn Alert */}
          {isYourTurn && (
            <View style={{ marginBottom: 20, backgroundColor: "#d1fae5", borderRadius: 16, padding: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
              <IconButton
                icon="check-circle"
                size={56}
                iconColor="#10b981"
                style={{ margin: 0, marginBottom: 12 }}
              />
              <Text style={{ color: "#065f46", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>
                It's Your Turn!
              </Text>
              <Text style={{ color: "#047857", fontSize: 15, textAlign: "center" }}>
                Please proceed to the counter
              </Text>
            </View>
          )}

          {/* Queue Number Display */}
          <Text style={{ fontSize: 48, fontWeight: "bold", color: "#17a2b8", textAlign: "center", marginBottom: 8 }}>
            {liveQueue.yourNumber}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827", textAlign: "center", marginBottom: 4 }}>
            Your Queue Number
          </Text>
          <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 }}>
            Please wait for your number to be called
          </Text>

          {/* Progress Bar Section */}
          {!isYourTurn && (
            <View style={{ marginBottom: 20, backgroundColor: "white", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600" }}>
                  Queue Progress
                </Text>
                <Text style={{ color: "#17a2b8", fontSize: 18, fontWeight: "bold" }}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View style={{ backgroundColor: "#e5e7eb", borderRadius: 10, overflow: "hidden", height: 12 }}>
                <View 
                  style={{ 
                    width: `${progress * 100}%`,
                    height: "100%",
                    backgroundColor: "#17a2b8",
                    borderRadius: 10,
                  }}
                />
              </View>
              <Text style={{ color: "#6b7280", textAlign: "center", fontSize: 12, marginTop: 8 }}>
                {liveQueue.peopleInFront} {liveQueue.peopleInFront === 1 ? 'person' : 'people'} ahead • ~{liveQueue.averageServiceTime} min each
              </Text>
            </View>
          )}

          {/* Main Stats Cards */}
          <View style={{ marginBottom: 20 }}>
            {/* Now Serving Card */}
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
                    Now Serving
                  </Text>
                  <Text style={{ fontSize: 40, fontWeight: "bold", color: "#17a2b8" }}>
                    {liveQueue.currentServing}
                  </Text>
                </View>
                <View style={{ backgroundColor: "#f0f9ff", borderRadius: 50, padding: 12 }}>
                  <IconButton
                    icon="account-check"
                    size={32}
                    iconColor="#17a2b8"
                    style={{ margin: 0 }}
                  />
                </View>
              </View>
            </View>

            {/* People in Front Card */}
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
                    People in Front
                  </Text>
                  <Text style={{ fontSize: 40, fontWeight: "bold", color: "#17a2b8" }}>
                    {liveQueue.peopleInFront}
                  </Text>
                </View>
                <View style={{ backgroundColor: "#f0f9ff", borderRadius: 50, padding: 12 }}>
                  <IconButton
                    icon="account-multiple"
                    size={32}
                    iconColor="#17a2b8"
                    style={{ margin: 0 }}
                  />
                </View>
              </View>
            </View>

            {/* Estimated Wait Time Card */}
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
                    Estimated Wait Time
                  </Text>
                  <Text style={{ fontSize: 40, fontWeight: "bold", color: "#17a2b8" }}>
                    {liveQueue.estimatedWaitTime} <Text style={{ fontSize: 20 }}>min</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                    ~{liveQueue.averageServiceTime} min per person
                  </Text>
                </View>
                <View style={{ backgroundColor: "#f0f9ff", borderRadius: 50, padding: 12 }}>
                  <IconButton
                    icon="clock-outline"
                    size={32}
                    iconColor="#17a2b8"
                    style={{ margin: 0 }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Queue Details Card */}
          <View style={{ marginBottom: 20, backgroundColor: "white", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <Text style={{ color: "#111827", fontSize: 16, fontWeight: "600", marginBottom: 16 }}>
              Queue Details
            </Text>
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Party Size
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                  {queueData?.partySize || "2"} {queueData?.partySize === 1 ? "person" : "people"}
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Queue Type
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                  {queueData?.queueType || "1-2"} persons
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Joined At
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                  {queueData?.joinedAt || "Now"}
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Last Updated
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                  {liveQueue.lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ marginBottom: 20 }}>
            <Button
              mode="contained"
              onPress={onRefresh}
              icon="refresh"
              buttonColor="#17a2b8"
              style={{ borderRadius: 12, marginBottom: 12 }}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
              Refresh Queue Status
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              icon="arrow-left"
              textColor="#6b7280"
              style={{ borderColor: "#e5e7eb", borderWidth: 1, borderRadius: 12 }}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
              Back to My Queues
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}