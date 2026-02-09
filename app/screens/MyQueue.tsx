import { ScrollView, View, Text } from "react-native";
import { IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useNavigation, TabActions } from "@react-navigation/native";
import QueueCard from "../../components/QueueCard";
import EmptyState from "../../components/EmptyState";
import TabSelector from "../../components/TabSelector";
import { MOCK_ACTIVE_QUEUES, MOCK_HISTORY_QUEUES, Queue } from "../../src/constants/mockData";

export default function MyQueue() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [activeQueues, setActiveQueues] = useState<Queue[]>(MOCK_ACTIVE_QUEUES);

  const handleCancelQueue = (id: string) => {
    setActiveQueues(activeQueues.filter((queue) => queue.id !== id));
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

  const displayQueues = activeTab === "active" ? activeQueues : MOCK_HISTORY_QUEUES;

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
          contentContainerStyle={{ padding: 16, paddingBottom: 50, flexGrow: 1 }}>
          {displayQueues.length === 0 ? (
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
