export type QueueQrData = { queueId?: string; queueQr: string };

export const parseQueueQr = (data: string): QueueQrData => {
  const scannedValue = data.trim();
  const fallback = { queueQr: scannedValue };
  try {
    const value = JSON.parse(decodeURIComponent(scannedValue));
    const payload = value?.data ?? value?.result ?? value;
    const queue = payload?.queue ?? payload?.queueData ?? payload;
    const queueId = String(payload?.queue_id ?? payload?.queueId ?? payload?._id ?? payload?.id ?? queue?.queue_id ?? queue?.queueId ?? queue?._id ?? queue?.id ?? "").trim();
    const queueQr = String(payload?.queue_qr ?? payload?.queueQr ?? queue?.queue_qr ?? queue?.queueQr ?? "").trim();
    return { queueId: queueId || undefined, queueQr: queueQr || fallback.queueQr };
  } catch {
    try {
      const url = new URL(scannedValue);
      return { queueId: url.searchParams.get("queue_id")?.trim() || url.searchParams.get("queueId")?.trim() || undefined, queueQr: url.searchParams.get("queue_qr")?.trim() || url.searchParams.get("queueQr")?.trim() || fallback.queueQr };
    } catch { return fallback; }
  }
};

export const queueIdFrom = (queue: any) => String(queue?._id ?? queue?.id ?? queue?.queue_id ?? queue?.queueId ?? "");
export const queueQrFrom = (queue: any) => String(queue?.queue_qr ?? queue?.queueQr ?? queue?.qr_code ?? queue?.qrCode ?? "");
