export interface Queue {
  id: string;
  restaurantName: string;
  queueNumber?: string;
  partySize?: number;
  queueType?: string;
  position?: number;
  totalPeople?: number;
  estimatedWait: string;
  joinedAt: string;
  status: "active" | "ready" | "expired";
  phone?: string;
  notes?: string;
}

export const MOCK_ACTIVE_QUEUES: Queue[] = [
  {
    id: "1",
    restaurantName: "The Golden Spoon",
    queueNumber: "A23",
    partySize: 4,
    queueType: "3-4",
    estimatedWait: "25 mins",
    joinedAt: "2:30 PM",
    status: "active",
    phone: "+1234567890",
    notes: "Window seat preferred",
  },
  {
    id: "2",
    restaurantName: "Sakura Sushi Bar",
    queueNumber: "B15",
    partySize: 2,
    queueType: "1-2",
    estimatedWait: "15 mins",
    joinedAt: "3:45 PM",
    status: "ready",
    phone: "+1234567891",
  },
];

export const MOCK_HISTORY_QUEUES: Queue[] = [
  {
    id: "3",
    restaurantName: "Thai Restaurant",
    position: 0,
    totalPeople: 0,
    estimatedWait: "Completed",
    joinedAt: "Yesterday",
    status: "expired",
  },
  {
    id: "4",
    restaurantName: "Sushi Place",
    position: 0,
    totalPeople: 0,
    estimatedWait: "Completed",
    joinedAt: "2 days ago",
    status: "expired",
  },
  {
    id: "5",
    restaurantName: "Italian Bistro",
    position: 0,
    totalPeople: 0,
    estimatedWait: "Completed",
    joinedAt: "3 days ago",
    status: "expired",
  },
];
