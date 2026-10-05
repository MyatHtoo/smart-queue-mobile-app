export const getQueueItems = (response: any): any[] => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.queues)) return data.queues;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getQueueId = (queue: any) =>
  String(queue?._id || queue?.id || queue?.queue_id || queue?.queueId || "");

export const getQueueNumber = (queue: any) =>
  Number(queue?.queue_number ?? queue?.queueNumber ?? queue?.number ?? queue?.queueNo ?? 0);

export const getEstimatedWait = (queue: any) => {
  const value = Number(
    queue?.estimated_wait_time ?? queue?.estimatedWaitTime ?? queue?.estimated_wait ??
    queue?.estimatedWait ?? queue?.waitingTime ?? 0
  );
  return Number.isFinite(value) && value >= 0 ? value : 0;
};

export const getQueueStatus = (queue: any) =>
  String(queue?.status || queue?.queueStatus || "waiting")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

export const isTurnQueueStatus = (status: string) =>
  ["ready to seat", "qr scanned"].includes(
    status.trim().toLowerCase().replace(/[_-]+/g, " ")
  );

export const isFinishedQueueStatus = (status: string) =>
  ["finished", "completed", "complete", "served", "done", "seated", "serving", "in service", "expired", "cancelled", "canceled"].includes(
    status.trim().toLowerCase().replace(/[_-]+/g, " ")
  );

export const isActiveQueue = (queue: any) => {
  const status = getQueueStatus(queue);
  return !isFinishedQueueStatus(status) && !isTurnQueueStatus(status);
};

export const getSortedActiveQueues = (response: any) =>
  getQueueItems(response)
    .filter(isActiveQueue)
    .sort((left, right) => {
      const waitDifference = getEstimatedWait(left) - getEstimatedWait(right);
      return waitDifference || getQueueNumber(left) - getQueueNumber(right);
    });
