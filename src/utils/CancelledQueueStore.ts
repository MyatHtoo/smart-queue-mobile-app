import AsyncStorage from "@react-native-async-storage/async-storage";

const storageKey = (customerId: string) => `@smart_queue_cancelled_ids:${customerId}`;

export const getCancelledQueueIds = async (customerId: string): Promise<Set<string>> => {
  if (!customerId) return new Set();

  try {
    const stored = await AsyncStorage.getItem(storageKey(customerId));
    const ids = stored ? JSON.parse(stored) : [];
    return new Set(Array.isArray(ids) ? ids.map(String) : []);
  } catch (error) {
    console.warn("Unable to read cancelled queues", error);
    return new Set();
  }
};

export const saveCancelledQueueId = async (customerId: string, queueId: string) => {
  if (!customerId || !queueId) return;

  const ids = await getCancelledQueueIds(customerId);
  ids.add(String(queueId));

  try {
    await AsyncStorage.setItem(storageKey(customerId), JSON.stringify([...ids]));
  } catch (error) {
    console.warn("Unable to save cancelled queue", error);
  }
};
